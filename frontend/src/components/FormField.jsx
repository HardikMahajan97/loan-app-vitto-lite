import React from 'react';

const Field = ({ label, error, required, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.5)' }}>
      {label}
      {required && <span className="ml-1" style={{ color: '#e2b96f' }}>*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs" style={{ color: 'rgba(240,240,248,0.3)' }}>{hint}</p>}
    {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
  </div>
);

export const Input = ({ label, error, required, hint, ...props }) => (
  <Field label={label} error={error} required={required} hint={hint}>
    <input className={`input-base ${error ? 'error' : ''}`} {...props} />
  </Field>
);

export const Select = ({ label, error, required, hint, children, ...props }) => (
  <Field label={label} error={error} required={required} hint={hint}>
    <select className={`input-base ${error ? 'error' : ''}`} {...props}>
      {children}
    </select>
  </Field>
);

export const Textarea = ({ label, error, required, hint, ...props }) => (
  <Field label={label} error={error} required={required} hint={hint}>
    <textarea className={`input-base ${error ? 'error' : ''}`} rows={3} style={{ resize: 'vertical', minHeight: '80px' }} {...props} />
  </Field>
);

export default Field;
