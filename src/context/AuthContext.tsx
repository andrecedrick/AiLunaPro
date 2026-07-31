import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession, OrgMember, Organization, UserRole } from '../types/auth';
import { MOCK_PASSWORDS, MOCK_USERS } from '../data/mockAuth';
import {
  genId,
  getInitialMembers,
  getInitialOrgs,
  makeInitials,
  saveMembers,
  saveOrgs,
  saveSession,
  loadSession,
} from '../lib/auth/storage';
import { resolveLayer } from '../lib/featureFlags';
import { apiChangeRole, apiRemoveMember, getIdToken } from '../lib/team/teamApiClient';
import {
  subscribeAuthState,
  type ConnectionPhase,
  firebaseLogin,
  firebaseSignup,
  firebaseLogout,
  firebaseSwitchOrg,
  firebaseCreateOrg,
  firebaseInviteMember,
  getCurrentFirebaseUser,
  firebaseSendPasswordReset,
  firebaseUpdateProfile,
  firebaseUpdateOrgName,
  firebaseRebuildSession,
} from '../lib/auth/firebaseAuthService';

const LAYER = resolveLayer('auth');

interface AuthContextValue {
  session: AuthSession | null;
  members: OrgMember[];
  orgs: Organization[];
  isAuthenticated: boolean;
  /**
   * True while the Firebase Auth state is being resolved on initial load.
   * Always false in mock mode (synchronous init).
   * AppShell renders nothing while this is true to avoid a flash of the login page.
   */
  isLoading: boolean;
  /** Boot/connection phase for UI states (connecting · retrying · failed · offline · ok). */
  connectionPhase: ConnectionPhase;
  /** The OrgMember row for the currently logged-in user in the current org. */
  currentMember: OrgMember | undefined;
  /* ── Auth ──────────────────────────────────────────────── */
  login:         (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup:        (name: string, email: string, password: string, orgName?: string) => Promise<{ success: boolean; error?: string }>;
  logout:        () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  /** Retry session resolution for the current user (no sign-out). Used by the
   *  "Still connecting" card to recover from a transient connectivity stall. */
  retryAuth:     () => void;
  /* ── Team ──────────────────────────────────────────────── */
  inviteMember:     (email: string, name: string, role: UserRole) => void;
  updateMemberRole: (userId: string, role: UserRole) => void;
  removeMember:     (userId: string) => void;
  /* ── Profile ───────────────────────────────────────────── */
  /**
   * Update the current user's displayName + email.
   * Mock layer: persisted to localStorage. Firebase layer: writes Firestore
   * users/{uid} + members/{uid} and Firebase Auth displayName.
   */
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  /* ── Org ───────────────────────────────────────────────── */
  createOrg:     (name: string, plan: Organization['plan']) => void;
  switchOrg:     (orgId: string) => void;
  /**
   * Rename the current organization.
   * Mock layer: persisted to localStorage. Firebase layer: writes /organizations/{orgId}.
   */
  updateOrgName: (name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // ── Mock mode: synchronous init from localStorage ─────────────────────────
  // ── Firebase mode: start with null / empty / loading=true ────────────────
  const [session,   setSession]   = useState<AuthSession | null>(
    LAYER === 'mock' ? () => loadSession() : null,
  );
  const [members,   setMembers]   = useState<OrgMember[]>(
    LAYER === 'mock' ? () => getInitialMembers() : [],
  );
  const [orgs,      setOrgs]      = useState<Organization[]>(
    LAYER === 'mock' ? () => getInitialOrgs() : [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(LAYER === 'firebase');
  const [connectionPhase, setConnectionPhase] = useState<ConnectionPhase>(LAYER === 'firebase' ? 'connecting' : 'ok');

  // ── Firebase: subscribe to auth state on mount ───────────────────────────
  // Ref guards against calling setState after unmount during async resolution.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /*
   * Signup → CRM.
   *
   * A registered user reached NEITHER CRM: upsertLeadContact and the Twenty
   * client had one caller between them (the demo-request route), so an account
   * created through #/signup existed only as a Firebase user plus its org/member
   * documents.
   *
   * It fires here, on the session gaining an orgId, rather than at signup:
   * signup creates no organisation (it navigates to #/org/create), and the CRM
   * route is org-scoped and re-verifies membership — at signup there is nothing
   * to be a member of. createOrg is fire-and-forget and sets orgId inside a
   * .then(), so reading session.orgId at the call site would be stale; watching
   * the transition is the only reliable trigger.
   *
   * pushSignupToCrm is gated on the signup stash, so an ordinary login is a
   * no-op. Best-effort: the account already exists, and the worker raises a
   * durable alert on failure.
   */
  const crmPushedRef = useRef(false);
  useEffect(() => {
    const orgId = session?.orgId;
    if (!orgId || crmPushedRef.current) return;
    crmPushedRef.current = true;
    void import('../lib/crm/signupCrmClient').then(m => m.pushSignupToCrm(orgId));
  }, [session?.orgId]);

  useEffect(() => {
    if (LAYER !== 'firebase') return;

    // DEV guard: prove the Firebase app was initialized before we subscribe to
    // auth state. If this ever fires, a chunk ran getAuth() before
    // initializeApp() — see the entry-first import in main.tsx. (No PII.)
    if (import.meta.env.DEV) {
      void import('firebase/app').then(({ getApps }) => {
        if (getApps().length === 0) {
          console.error('[auth] ASSERT FAILED: Firebase app not initialized before AuthContext subscribe (app/no-app risk).');
        }
      }).catch(() => { /* ignore */ });
    }

    const unsub = subscribeAuthState(
      (fbSession, fbMembers, fbOrgs) => {
        if (!mountedRef.current) return;
        setSession(fbSession);
        setMembers(fbMembers);
        setOrgs(fbOrgs);
        setIsLoading(false);
      },
      () => {
        if (!mountedRef.current) return;
        setSession(null);
        setMembers([]);
        setOrgs([]);
        setIsLoading(false);
      },
      phase => { if (mountedRef.current) setConnectionPhase(phase); },
    );
    return unsub;
  }, []); // runs once on mount

  /* P0 — the loading gate is GUARANTEED to end. If auth hasn't resolved within the
     deadline (googleapis blocked by an ad-blocker / corporate filter, SDK retrying for
     minutes, dropped network), the app CONTINUES in degraded mode: unauthenticated view
     (or the last-known session on a retry), a non-blocking connection banner, and the
     auth subscription still live — the session hydrates in place the moment
     Google/Firebase becomes reachable. Re-arms on every isLoading=true stretch, so a
     failed retryAuth can never hold the UI hostage either. */
  useEffect(() => {
    if (LAYER !== 'firebase' || !isLoading) return;
    const t = window.setTimeout(() => {
      if (!mountedRef.current) return;
      console.warn('[auth] loading deadline exceeded — continuing in degraded mode (auth keeps resolving in the background)');
      setIsLoading(false);
      setConnectionPhase(p => (p === 'ok' ? p : 'failed'));
    }, 12_000);
    return () => window.clearTimeout(t);
  }, [isLoading]);

  // ── Mock mode: mirror to localStorage ────────────────────────────────────
  useEffect(() => {
    if (LAYER === 'mock') saveSession(session);
  }, [session]);
  useEffect(() => {
    if (LAYER === 'mock') saveMembers(members);
  }, [members]);
  useEffect(() => {
    if (LAYER === 'mock') saveOrgs(orgs);
  }, [orgs]);

  const currentMember = useMemo(
    () =>
      session
        ? members.find(m => m.userId === session.userId && m.orgId === session.orgId)
        : undefined,
    [session, members],
  );

  /* ── Auth ──────────────────────────────────────────────── */

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      if (LAYER === 'firebase') {
        return firebaseLogin(email, password);
        // Session update happens via onAuthStateChanged — no setSession here
      }

      // ── Mock path ──────────────────────────────────────────
      const norm   = email.toLowerCase().trim();
      const mockPw = MOCK_PASSWORDS[norm];
      if (!mockPw || mockPw !== password) {
        return { success: false, error: 'Invalid email or password.' };
      }
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === norm);
      if (!user) return { success: false, error: 'User not found.' };

      const membership = members.find(m => m.userId === user.id);
      if (!membership) return { success: false, error: 'No workspace found for this account.' };

      const org = orgs.find(o => o.id === membership.orgId);
      if (!org) return { success: false, error: 'Workspace not found.' };

      setSession({ userId: user.id, orgId: org.id, role: membership.role, user, org });
      return { success: true };
    },
    [members, orgs],
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      orgName?: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (LAYER === 'firebase') {
        return firebaseSignup(name, email, password, orgName);
      }

      // ── Mock path (J1.3C: no auto-workspace) ───────────────
      const norm = email.toLowerCase().trim();
      if (MOCK_USERS.find(u => u.email.toLowerCase() === norm)) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const userId   = genId('u');
      const now      = new Date().toISOString();
      const initials = makeInitials(name);
      const newUser = { id: userId, displayName: name.trim(), email: norm, initials };

      MOCK_PASSWORDS[norm] = password;
      MOCK_USERS.push(newUser);

      if (orgName && orgName.trim()) {
        // Legacy: explicit workspace creation at signup → owner
        const orgId = genId('org');
        const newOrg: Organization = {
          id: orgId, name: orgName.trim(), plan: 'Free',
          initials: makeInitials(orgName), createdAt: now,
        };
        const newMember: OrgMember = {
          userId, orgId, role: 'owner', status: 'active',
          joinedAt: now, displayName: newUser.displayName, email: norm, initials,
        };
        setOrgs(prev    => [...prev, newOrg]);
        setMembers(prev => [...prev, newMember]);
        setSession({ userId, orgId, role: 'owner', user: newUser, org: newOrg });
      } else {
        // Default: user account only — no workspace, no role.
        // Routes to OrgCreatePage via AppShell when session.orgId is empty.
        setSession({
          userId,
          orgId: '',
          role:  'member',
          user:  newUser,
          org:   { id: '', name: '', plan: 'Free', initials: '', createdAt: now },
        });
      }
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    if (LAYER === 'firebase') {
      firebaseLogout().catch(console.error);
      // onAuthStateChanged fires → setSession(null) handled in the subscription
      return;
    }
    setSession(null);
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      if (LAYER === 'firebase') {
        return firebaseSendPasswordReset(email);
      }
      // Mock path — no real email, always succeed silently
      return { success: true };
    },
    [],
  );

  /* ── Team ──────────────────────────────────────────────── */

  const inviteMember = useCallback(
    (email: string, name: string, role: UserRole) => {
      if (!session) return;
      const now = new Date().toISOString();
      const pending: OrgMember = {
        userId:      genId('u'),
        orgId:       session.orgId,
        role,
        status:      'pending',
        invitedAt:   now,
        displayName: name.trim(),
        email:       email.toLowerCase().trim(),
        initials:    makeInitials(name),
      };
      setMembers(prev => [...prev, pending]);
      if (LAYER === 'firebase') {
        firebaseInviteMember(session.orgId, pending).catch(err =>
          console.error('[AuthContext.inviteMember] FAILED — invite not persisted, UI optimistic only:', err),
        );
      }
    },
    [session],
  );

  const updateMemberRole = useCallback(
    (userId: string, role: UserRole) => {
      setMembers(prev => prev.map(m => (m.userId === userId ? { ...m, role } : m)));
      setSession(prev => (prev?.userId === userId ? { ...prev, role } : prev));
      if (LAYER === 'firebase' && session) {
        // Worker-authoritative: member writes are blocked for the client SDK by
        // Firestore rules (update:if false). Route through the worker service
        // account so the change actually persists.
        const orgId = session.orgId;
        (async () => {
          try {
            const idToken = await getIdToken();
            await apiChangeRole(orgId, userId, role, idToken);
          } catch (err) {
            console.error('[AuthContext.updateMemberRole] FAILED — role change not persisted:', err);
          }
        })();
      }
    },
    [session],
  );

  const removeMember = useCallback(
    (userId: string) => {
      setMembers(prev => prev.filter(m => m.userId !== userId));
      if (LAYER === 'firebase' && session) {
        // Worker-authoritative: client SDK member delete is blocked by rules
        // (delete:if false). Route through the worker service account.
        const orgId = session.orgId;
        (async () => {
          try {
            const idToken = await getIdToken();
            await apiRemoveMember(orgId, userId, idToken);
          } catch (err) {
            console.error('[AuthContext.removeMember] FAILED — removal not persisted:', err);
          }
        })();
      }
    },
    [session],
  );

  /* ── Org ───────────────────────────────────────────────── */

  const createOrg = useCallback(
    (name: string, plan: Organization['plan']) => {
      if (!session) return;

      if (LAYER === 'firebase') {
        firebaseCreateOrg(
          session.userId,
          session.user.displayName,
          session.user.email,
          session.user.initials,
          name,
          plan,
        ).then(({ org, member }) => {
          if (!mountedRef.current) return;
          setOrgs(prev    => [...prev, org]);
          setMembers(prev => [...prev, member]);
          setSession(prev => prev ? { ...prev, orgId: org.id, role: 'owner', org } : prev);
        }).catch(err => {
          // Loud surfacing — previously console.error hid permission-denied /
          // partial-write failures behind optimistic UI (workspace appears in
          // selector but vanishes on reload).
          console.error('[AuthContext.createOrg] FAILED — workspace will not persist on reload:', err);
        });
        return;
      }

      // ── Mock path ──────────────────────────────────────────
      const orgId = genId('org');
      const now   = new Date().toISOString();
      const newOrg: Organization = {
        id: orgId, name: name.trim(), plan,
        initials: makeInitials(name), createdAt: now,
      };
      const newMember: OrgMember = {
        userId:      session.userId,
        orgId,
        role:        'owner',
        status:      'active',
        joinedAt:    now,
        displayName: session.user.displayName,
        email:       session.user.email,
        initials:    session.user.initials,
      };
      setOrgs(prev    => [...prev, newOrg]);
      setMembers(prev => [...prev, newMember]);
      setSession(prev => prev ? { ...prev, orgId, role: 'owner', org: newOrg } : prev);
    },
    [session],
  );

  /* ── Profile ───────────────────────────────────────────── */

  const updateProfile = useCallback(
    async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
      if (!session) return { success: false, error: 'Not authenticated.' };

      const trimmedName  = name.trim();
      const trimmedEmail = email.toLowerCase().trim();
      if (!trimmedName)  return { success: false, error: 'Name is required.' };
      if (!trimmedEmail) return { success: false, error: 'Email is required.' };

      if (LAYER === 'firebase') {
        const res = await firebaseUpdateProfile(
          session.userId,
          session.orgId,
          trimmedName,
          trimmedEmail,
        );
        if (res.success) {
          // Optimistically update local state so UI reflects change immediately.
          const initials = makeInitials(trimmedName);
          const updatedUser = { ...session.user, displayName: trimmedName, email: trimmedEmail, initials };
          setMembers(prev =>
            prev.map(m =>
              m.userId === session.userId
                ? { ...m, displayName: trimmedName, email: trimmedEmail, initials }
                : m,
            ),
          );
          setSession(prev => (prev ? { ...prev, user: updatedUser } : prev));
        }
        return res;
      }

      const initials = makeInitials(trimmedName);
      const updatedUser = {
        ...session.user,
        displayName: trimmedName,
        email:       trimmedEmail,
        initials,
      };

      // Update mock user record
      const idx = MOCK_USERS.findIndex(u => u.id === session.userId);
      if (idx >= 0) MOCK_USERS[idx] = updatedUser;

      // Update denormalised member rows for this user
      setMembers(prev =>
        prev.map(m =>
          m.userId === session.userId
            ? { ...m, displayName: trimmedName, email: trimmedEmail, initials }
            : m,
        ),
      );

      setSession(prev => (prev ? { ...prev, user: updatedUser } : prev));
      return { success: true };
    },
    [session],
  );

  /* ── Org ───────────────────────────────────────────────── */

  const updateOrgName = useCallback(
    async (name: string): Promise<{ success: boolean; error?: string }> => {
      if (!session) return { success: false, error: 'Not authenticated.' };
      const trimmed = name.trim();
      if (!trimmed) return { success: false, error: 'Organization name is required.' };

      if (LAYER === 'firebase') {
        const res = await firebaseUpdateOrgName(session.orgId, trimmed);
        if (res.success) {
          const initials = makeInitials(trimmed);
          const updatedOrg: Organization = { ...session.org, name: trimmed, initials };
          setOrgs(prev => prev.map(o => (o.id === session.orgId ? updatedOrg : o)));
          setSession(prev => (prev ? { ...prev, org: updatedOrg } : prev));
        }
        return res;
      }

      const initials = makeInitials(trimmed);
      const updatedOrg: Organization = { ...session.org, name: trimmed, initials };

      setOrgs(prev => prev.map(o => (o.id === session.orgId ? updatedOrg : o)));
      setSession(prev => (prev ? { ...prev, org: updatedOrg } : prev));
      return { success: true };
    },
    [session],
  );

  const switchOrg = useCallback(
    (orgId: string) => {
      if (!session) return;

      if (LAYER === 'firebase') {
        const fbUser = getCurrentFirebaseUser();
        if (!fbUser) return;
        firebaseSwitchOrg(fbUser, orgId).then(result => {
          if (!result || !mountedRef.current) return;
          setSession(result.session);
          setMembers(result.members);
          setOrgs(result.orgs);
        }).catch(console.error);
        return;
      }

      // ── Mock path ──────────────────────────────────────────
      const org = orgs.find(o => o.id === orgId);
      if (!org) return;
      const membership = members.find(
        m => m.userId === session.userId && m.orgId === orgId,
      );
      if (!membership) return;
      setSession(prev =>
        prev ? { ...prev, orgId, role: membership.role, org } : prev,
      );
    },
    [session, orgs, members],
  );

  /* Retry session resolution without signing out — re-runs buildSession for the
     current Firebase user (e.g. after a firestore-load timeout recovered). On
     failure it leaves the app in the loading state (the watchdog card stays);
     it never calls signOut, so a transient blip can't log the user out. */
  const retryAuth = useCallback(() => {
    if (LAYER !== 'firebase') return;
    const fbUser = getCurrentFirebaseUser();
    if (!fbUser) {
      // Cold boot: there is no user to rebuild yet — onAuthStateChanged owns the state
      // and fires by itself once Google/Firebase is reachable. Log it so a "retry did
      // nothing" is visible in diagnostics instead of silent.
      console.warn('[auth] retry requested before sign-in resolved — waiting on the auth subscription');
      return;
    }
    setIsLoading(true);
    setConnectionPhase('retrying');
    firebaseRebuildSession(fbUser)
      .then(result => {
        if (!mountedRef.current) return;
        if (result) {
          setSession(result.session);
          setMembers(result.members);
          setOrgs(result.orgs);
        }
        // result null → no docs yet (e.g. needs org-create); let routing handle it.
        setIsLoading(false);
        setConnectionPhase('ok');
      })
      .catch(err => {
        if (!mountedRef.current) return;
        console.warn('[auth] retry failed code:', (err as Error)?.message ?? 'UNKNOWN');
        setConnectionPhase('failed');
        // P0 — NEVER hold the app in the loading gate on a failed retry: continue with
        // the last-known session (degraded); the banner + background retry take over.
        setIsLoading(false);
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      members,
      orgs,
      isAuthenticated: session !== null,
      isLoading,
      connectionPhase,
      currentMember,
      login,
      signup,
      logout,
      resetPassword,
      retryAuth,
      inviteMember,
      updateMemberRole,
      removeMember,
      updateProfile,
      createOrg,
      switchOrg,
      updateOrgName,
    }),
    [
      session, members, orgs, isLoading, connectionPhase, currentMember,
      login, signup, logout, resetPassword, retryAuth,
      inviteMember, updateMemberRole, removeMember,
      updateProfile, createOrg, switchOrg, updateOrgName,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
