import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

interface AuthContextValue {
  session: AuthSession | null;
  members: OrgMember[];
  orgs: Organization[];
  isAuthenticated: boolean;
  /** The OrgMember row for the currently logged-in user in the current org. */
  currentMember: OrgMember | undefined;
  /* ── Auth ──────────────────────────────────────────────── */
  login:  (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string, orgName: string) => { success: boolean; error?: string };
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
  const [session,  setSession]  = useState<AuthSession | null>(() => loadSession());
  const [members,  setMembers]  = useState<OrgMember[]>(() => getInitialMembers());
  const [orgs,     setOrgs]     = useState<Organization[]>(() => getInitialOrgs());

  /* Mirror to localStorage on every change. */
  useEffect(() => { saveSession(session); }, [session]);
  useEffect(() => { saveMembers(members); }, [members]);
  useEffect(() => { saveOrgs(orgs); },     [orgs]);

  const currentMember = useMemo(
    () =>
      session
        ? members.find(m => m.userId === session.userId && m.orgId === session.orgId)
        : undefined,
    [session, members],
  );

  /* ── Auth ──────────────────────────────────────────────── */

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const norm = email.toLowerCase().trim();
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
    (
      name: string,
      email: string,
      password: string,
      orgName: string,
    ): { success: boolean; error?: string } => {
      const norm = email.toLowerCase().trim();
      if (MOCK_USERS.find(u => u.email.toLowerCase() === norm)) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const userId  = genId('u');
      const orgId   = genId('org');
      const now     = new Date().toISOString();
      const initials = makeInitials(name);

      const newUser = { id: userId, displayName: name.trim(), email: norm, initials };
      const newOrg: Organization = {
        id: orgId,
        name: orgName.trim(),
        plan: 'Free',
        initials: makeInitials(orgName),
        createdAt: now,
      };
      const newMember: OrgMember = {
        userId, orgId, role: 'owner', status: 'active',
        joinedAt: now, displayName: newUser.displayName, email: norm, initials,
      };

      /* Persist mock password so the user can log back in during the same session. */
      MOCK_PASSWORDS[norm] = password;
      MOCK_USERS.push(newUser);

      setOrgs(prev  => [...prev, newOrg]);
      setMembers(prev => [...prev, newMember]);
      setSession({ userId, orgId, role: 'owner', user: newUser, org: newOrg });
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => { setSession(null); }, []);

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
    },
    [session],
  );

  const updateMemberRole = useCallback(
    (userId: string, role: UserRole) => {
      setMembers(prev => prev.map(m => (m.userId === userId ? { ...m, role } : m)));
      /* Keep session role in sync if this is the current user. */
      setSession(prev => (prev?.userId === userId ? { ...prev, role } : prev));
    },
    [],
  );

  const removeMember = useCallback(
    (userId: string) => {
      setMembers(prev => prev.filter(m => m.userId !== userId));
    },
    [],
  );

  /* ── Org ───────────────────────────────────────────────── */

  const createOrg = useCallback(
    (name: string, plan: Organization['plan']) => {
      if (!session) return;
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
      session, members, orgs, currentMember,
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
