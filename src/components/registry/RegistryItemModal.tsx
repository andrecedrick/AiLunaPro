import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { useLocale } from '../../context/LocaleContext';
import { format } from '../../lib/locale/i18n';
import {
  DATA_TYPES,
  DEPARTMENTS,
} from '../../data/mockRegistry';
import { makeNewItem } from '../../lib/registry/storage';
import { formatDate } from '@/utils/formatters';
import type {
  ApprovalStatus,
  OversightModel,
  RegistryItem,
  RegistryRiskLevel,
} from '../../types/registry';

type Mode = { kind: 'add' } | { kind: 'edit'; item: RegistryItem };

interface Props {
  mode: Mode;
  onClose: () => void;
  onSave: (data: Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>, mode: Mode) => void;
  onDelete?: (id: string) => void;
}

type FormState = Omit<RegistryItem, 'id' | 'createdAt' | 'updatedAt'>;

export function RegistryItemModal({ mode, onClose, onSave, onDelete }: Props) {
  const T = useLocale();
  const [form, setForm] = useState<FormState>(() => {
    if (mode.kind === 'edit') {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = mode.item;
      void _id; void _c; void _u;
      return rest;
    }
    return makeNewItem();
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [mitigationDraft, setMitigationDraft] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const toggleDataType = (value: string) => {
    update(
      'dataTypes',
      form.dataTypes.includes(value)
        ? form.dataTypes.filter(v => v !== value)
        : [...form.dataTypes, value],
    );
  };

  const addMitigation = () => {
    const trimmed = mitigationDraft.trim();
    if (trimmed.length === 0) return;
    update('mitigations', [...form.mitigations, trimmed]);
    setMitigationDraft('');
  };

  const removeMitigation = (idx: number) => {
    update(
      'mitigations',
      form.mitigations.filter((_, i) => i !== idx),
    );
  };

  const handleSave = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.toolName.trim().length === 0) next.toolName = T.registry.modal.requiredError;
    if (form.department.trim().length === 0) next.department = T.registry.modal.requiredError;
    if (form.purpose.trim().length === 0) next.purpose = T.registry.modal.requiredError;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave(form, mode);
  };

  const handleDelete = () => {
    if (mode.kind !== 'edit' || !onDelete) return;
    if (confirm(format(T.registry.modal.deleteConfirm, { toolName: mode.item.toolName }))) {
      onDelete(mode.item.id);
    }
  };

  const isEdit = mode.kind === 'edit';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="registry-dialog-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 200,
        padding: 24,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          width: '100%',
          maxWidth: 760,
          padding: 26,
          marginTop: 40,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 4,
          }}
        >
          <h3
            id="registry-dialog-title"
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 20,
              color: 'var(--text-primary)',
              letterSpacing: -0.3,
            }}
          >
            {isEdit ? T.registry.modal.titleEdit : T.registry.modal.titleAdd}
          </h3>
          {isEdit && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
              }}
            >
              {mode.item.id}
            </span>
          )}
        </div>
        <p
          style={{
            margin: '4px 0 18px',
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.55,
          }}
        >
          {isEdit
            ? T.registry.modal.subtitleEdit
            : T.registry.modal.subtitleAdd}
        </p>

        {/* Two-column form grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 16,
          }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label={T.registry.modal.fields.toolName} required error={errors.toolName}>
              <input
                type="text"
                value={form.toolName}
                onChange={e => update('toolName', e.target.value)}
                placeholder={T.registry.modal.placeholders.toolName}
                style={inputStyle}
                autoFocus
              />
            </Field>

            <Field label={T.registry.modal.fields.purpose} required error={errors.purpose}>
              <textarea
                value={form.purpose}
                onChange={e => update('purpose', e.target.value)}
                rows={3}
                placeholder={T.registry.modal.placeholders.purpose}
                style={{ ...inputStyle, minHeight: 76, resize: 'vertical' }}
              />
            </Field>

            <Field label={T.registry.modal.fields.dataTypes}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                }}
              >
                {DATA_TYPES.map(opt => {
                  const selected = form.dataTypes.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: `1.5px solid ${selected ? 'var(--violet)' : 'var(--border)'}`,
                        background: selected ? 'var(--brand-soft-bg)' : 'var(--surface)',
                        fontSize: 12,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleDataType(opt.value)}
                        style={{ accentColor: 'var(--violet)', cursor: 'pointer' }}
                      />
                      <span>{(T.enums.dataTypes as Record<string, string>)[opt.value] ?? opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field label={T.registry.modal.fields.mitigations}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={mitigationDraft}
                  onChange={e => setMitigationDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMitigation();
                    }
                  }}
                  placeholder={T.registry.modal.placeholders.mitigation}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={addMitigation}
                  style={{
                    background: 'var(--brand-tint-bg)',
                    color: 'var(--violet-text)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  +
                </button>
              </div>
              {form.mitigations.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.mitigations.map((m, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {m}
                      <button
                        type="button"
                        onClick={() => removeMitigation(i)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: 12,
                          lineHeight: 1,
                          padding: 0,
                        }}
                        aria-label={format(T.registry.modal.removeMitigationAria, { index: i + 1 })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label={T.registry.modal.fields.notes}>
              <textarea
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                rows={3}
                placeholder={T.registry.modal.placeholders.notes}
                style={{ ...inputStyle, minHeight: 76, resize: 'vertical' }}
              />
            </Field>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label={T.registry.modal.fields.department} required error={errors.department}>
              <select
                value={form.department}
                onChange={e => update('department', e.target.value)}
                style={inputStyle}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={T.registry.modal.fields.approvalStatus}>
              <select
                value={form.approvalStatus}
                onChange={e => update('approvalStatus', e.target.value as ApprovalStatus)}
                style={inputStyle}
              >
                <option value="approved">{T.enums.approval.approved}</option>
                <option value="pending">{T.enums.approval.pending}</option>
                <option value="under-review">{T.enums.approval.underReview}</option>
                <option value="rejected">{T.enums.approval.rejected}</option>
              </select>
            </Field>

            <Field label={T.registry.modal.fields.riskLevel}>
              <select
                value={form.riskLevel}
                onChange={e => update('riskLevel', e.target.value as RegistryRiskLevel)}
                style={inputStyle}
              >
                <option value="low">{T.registry.modal.riskOptions.low}</option>
                <option value="medium">{T.registry.modal.riskOptions.medium}</option>
                <option value="high">{T.registry.modal.riskOptions.high}</option>
                <option value="critical">{T.registry.modal.riskOptions.critical}</option>
              </select>
            </Field>

            <Field label={T.registry.modal.fields.humanOversight}>
              <select
                value={form.humanOversight}
                onChange={e => update('humanOversight', e.target.value as OversightModel)}
                style={inputStyle}
              >
                <option value="hitl">{T.enums.oversight.hitl}</option>
                <option value="hotl">{T.enums.oversight.hotl}</option>
                <option value="oot">{T.enums.oversight.oot}</option>
              </select>
            </Field>

            <Field label={T.registry.modal.fields.nextReviewDate}>
              <input
                type="date"
                value={form.reviewDate ?? ''}
                onChange={e => update('reviewDate', e.target.value || null)}
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {T.registry.modal.reviewDateHint}
              </div>
            </Field>

            {isEdit && (
              <div
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                {format(T.registry.modal.auditTrail, {
                  createdDate: formatDate(mode.item.createdAt),
                  updatedDate: formatDate(mode.item.updatedAt),
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            marginTop: 24,
            paddingTop: 18,
            borderTop: '1px dashed var(--border)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            {isEdit && onDelete && (
              <Button
                variant="ghost"
                size="md"
                onClick={handleDelete}
                style={{ color: 'var(--red-text)' }}
              >
                {T.registry.modal.buttons.delete}
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" size="md" onClick={onClose}>
              {T.registry.modal.buttons.cancel}
            </Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              {isEdit ? T.registry.modal.buttons.saveChanges : T.registry.modal.buttons.addToRegistry}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 10,
  fontSize: 13,
  fontFamily: 'var(--font-body)',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  lineHeight: 1.5,
};

function Field({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'block' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--red-text)', marginLeft: 3 }}>*</span>}
      </div>
      {children}
      {error && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--red-text)',
            fontWeight: 600,
            marginTop: 4,
          }}
        >
          {error}
        </div>
      )}
    </label>
  );
}
