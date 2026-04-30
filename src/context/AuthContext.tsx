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
import {
  subscribeAuthState,
  firebaseLogin,
  firebaseSignup,
  firebaseLogout,
  firebaseSwitchOrg,
  firebaseCreateOrg,
  firebaseInviteMember,
  firebaseUpdateMemberRole,
  firebaseRemoveMember,
  getCurrentFirebaseUser,
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
  /** The OrgMember row for the currently logged-in user in the current org. */
  currentMember: OrgMember | undefined;
  /* ── Auth ──────────────────────────────────────────────── */
  login:  (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, orgName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  /* ── Team ──────────────────────────────────────────────── */
  inviteMember:     (email: string, name: string, role: UserRole) => void;
  updateMemberRole: (userId: string, role: UserRole) => void;
  removeMember:     (userId: string) => void;
  /* ── Org ───────────────────────────────────────────────── */
  createOrg: (name: string, plan: Organization['plan']) => void;
  switchOrg: (orgId: string) => void;
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

  // ── Firebase: subscribe to auth state on mount ───────────────────────────
  // Ref guards against calling setState after unmount during async resolution.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (LAYER !== 'firebase') return;

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
    );
    return unsub;
  }, []); // runs once on mount

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
      orgName: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (LAYER === 'firebase') {
        return firebaseSignup(name, email, password, orgName);
        // Session update happens via onAuthStateChanged — no setSession here
      }

      // ── Mock path ──────────────────────────────────────────
      const norm = email.toLowerCase().trim();
      if (MOCK_USERS.find(u => u.email.toLowerCase() === norm)) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const userId   = genId('u');
      const orgId    = genId('org');
      const now      = new Date().toISOString();
      const initials = makeInitials(name);

      const newUser = { id: userId, displayName: name.trim(), email: norm, initials };
      const newOrg: Organization = {
        id: orgId, name: orgName.trim(), plan: 'Free',
        initials: makeInitials(orgName), createdAt: now,
      };
      const newMember: OrgMember = {
        userId, orgId, role: 'owner', status: 'active',
        joinedAt: now, displayName: newUser.displayName, email: norm, initials,
      };

      MOCK_PASSWORDS[norm] = password;
      MOCK_USERS.push(newUser);
      setOrgs(prev  => [...prev, newOrg]);
      setMembers(prev => [...prev, newMember]);
      setSession({ userId, orgId, role: 'owner', user: newUser, org: newOrg });
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
        firebaseInviteMember(session.orgId, pending).catch(console.error);
      }
    },
    [session],
  );

  const updateMemberRole = useCallback(
    (userId: string, role: UserRole) => {
      setMembers(prev => prev.map(m => (m.userId === userId ? { ...m, role } : m)));
      setSession(prev => (prev?.userId === userId ? { ...prev, role } : prev));
      if (LAYER === 'firebase' && session) {
        firebaseUpdateMemberRole(session.orgId, userId, role).catch(console.error);
      }
    },
    [session],
  );

  const removeMember = useCallback(
    (userId: string) => {
      setMembers(prev => prev.filter(m => m.userId !== userId));
      if (LAYER === 'firebase' && session) {
        firebaseRemoveMember(session.orgId, userId).catch(console.error);
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
        }).catch(console.error);
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

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      members,
      orgs,
      isAuthenticated: session !== null,
      isLoading,
      currentMember,
      login,
      signup,
      logout,
      inviteMember,
      updateMemberRole,
      removeMember,
      createOrg,
      switchOrg,
    }),
    [
      session, members, orgs, isLoading, currentMember,
      login, signup, logout,
      inviteMember, updateMemberRole, removeMember,
      createOrg, switchOrg,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
