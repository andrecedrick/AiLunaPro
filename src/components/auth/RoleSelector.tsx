import { ROLE_DESCRIPTION, ROLE_LABEL } from '../../data/mockAuth';
import type { UserRole } from '../../types/auth';

const ROLES: UserRole[] = ['owner', 'admin', 'member', 'billing'];

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  /** Roles the current user is not allowed to assign (greyed out). */
  disabledRoles?: UserRole[];
}

/**
 * Pill-style role picker.  Selected pill gets a violet accent;
 * a one-line description of the selected role appears below.
 */
export function RoleSelector({ value, onChange, disabledRoles = [] }: RoleSelectorProps) {
  return (
    <div>
      {/* Pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ROLES.map(role => {
          const selected  = role === value;
          const forbidden = disabledRoles.includes(role);
          return (
            <button
              key={role}
              type="button"
              disabled={forbidden}
              onClick={() => !forbidden && onChange(role)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: selected ? 700 : 500,
                fontFamily: 'var(--font-body)',
                cursor: forbidden ? 'not-allowed' : 'pointer',
                border: selected
                  ? '1.5px solid var(--violet)'
                  : '1.5px solid var(--border-strong)',
                background: selected ? 'var(--brand-soft-bg)' : 'transparent',
                color: selected
                  ? 'var(--violet-text)'
                  : forbidden
                    ? 'var(--text-muted)'
                    : 'var(--text-secondary)',
                opacity: forbidden ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              {ROLE_LABEL[role]}
            </button>
          );
        })}
      </div>

      {/* Description of selected role */}
      <p
        style={{
          margin: '8px 0 0',
          fontSize: 11,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        {ROLE_DESCRIPTION[value]}
      </p>
    </div>
  );
}
