import { AuditProgress } from './AuditProgress';
import { AuditStepSidebar } from './AuditStepSidebar';
import { AuditStepContent } from './AuditStepContent';
import { AuditFooter } from './AuditFooter';

export function AuditShell() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AuditProgress />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        <AuditStepSidebar />

        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <AuditStepContent />
          <AuditFooter />
        </div>
      </div>
    </div>
  );
}
