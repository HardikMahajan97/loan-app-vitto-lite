import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import { Input, Select, Textarea } from '../components/FormField.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { LANGUAGES, formatINR, getRefId } from '../utils/helpers.js';

const PURPOSES = [
  'Business Expansion',
  'Agriculture / Farming',
  'Education',
  'Home Renovation',
  'Medical Emergency',
  'Vehicle Purchase',
  'Equipment Purchase',
  'Working Capital',
  'Debt Consolidation',
  'Other',
];

const initialForm = {
  name: '', mobile: '', amount: '', purpose: '', language: '', email: '',
};

const validate = (form) => {
  const errors = {};
  if (!form.name.trim() || form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!form.mobile.trim() || !/^[6-9][0-9]{9}$/.test(form.mobile.trim())) errors.mobile = 'Enter a valid 10-digit Indian mobile number';
  const amt = parseFloat(form.amount);
  if (!form.amount || isNaN(amt) || amt < 1000 || amt > 10000000) errors.amount = 'Amount must be between ₹1,000 and ₹1,00,00,000';
  if (!form.purpose) errors.purpose = 'Please select a loan purpose';
  if (!form.language) errors.language = 'Please select a preferred language';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
  return errors;
};

const ApplyPage = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const addToast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.submitApplication({
        ...form,
        amount: parseFloat(form.amount),
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        purpose: form.purpose,
        email: form.email.trim() || undefined,
      });
      setSuccess(res.data);
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        const fieldErrors = {};
        err.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
        addToast('Please fix the highlighted errors.', 'error');
      } else {
        addToast(err instanceof ApiError ? err.message : 'Submission failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen application={success} onReset={() => setSuccess(null)} />;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Page heading */}
        <div className="mb-10 fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#e2b96f' }}>
            Loan Application
          </p>
          <h1 className="font-display text-3xl font-bold mb-3" style={{ fontFamily: 'Syne' }}>
            Apply for a Loan
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,240,248,0.5)' }}>
            Fill in the details below. All fields marked with * are required.
            Our team reviews every application within 24–48 hours.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8 flex flex-col gap-6 fade-up"
          style={{ animationDelay: '0.1s' }}
          noValidate
        >
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Priya Sharma"
            error={errors.name}
            required
            autoComplete="name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Mobile Number"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="10-digit number"
              maxLength={10}
              error={errors.mobile}
              required
              inputMode="numeric"
              hint="Indian mobile numbers only"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="optional"
              error={errors.email}
              hint="Confirmation email will be sent"
            />
          </div>

          <Input
            label="Loan Amount (₹)"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="e.g. 50000"
            min={1000}
            max={10000000}
            step={1000}
            error={errors.amount}
            required
            inputMode="numeric"
            hint="Min ₹1,000 — Max ₹1,00,00,000"
          />

          {form.amount && !errors.amount && parseFloat(form.amount) >= 1000 && (
            <p className="text-xs -mt-3" style={{ color: '#e2b96f' }}>
              = {formatINR(parseFloat(form.amount))}
            </p>
          )}

          <Select
            label="Loan Purpose"
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            error={errors.purpose}
            required
          >
            <option value="">Select a purpose</option>
            {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>

          <Select
            label="Preferred Language"
            name="language"
            value={form.language}
            onChange={handleChange}
            error={errors.language}
            required
          >
            <option value="">Select language</option>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-3 text-base">
            {loading ? (
              <>
                <span className="spinner" style={{ borderTopColor: '#0d1117', borderColor: 'rgba(0,0,0,0.2)' }} />
                Submitting…
              </>
            ) : 'Submit Application →'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(240,240,248,0.25)' }}>
          Already applied?{' '}
          <Link to="/dashboard" className="underline" style={{ color: 'rgba(226,185,111,0.6)' }}>
            Check the dashboard
          </Link>
        </p>
      </div>
    </div>
  );
};

const SuccessScreen = ({ application, onReset }) => {
  const refId = getRefId(application.id);
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center fade-up">

        {/* Check icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold mb-2" style={{ fontFamily: 'Syne' }}>Application Submitted</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(240,240,248,0.5)' }}>
          Your application is under review. We'll contact you on your registered mobile number.
          {application.email && ' A confirmation email has been sent.'}
        </p>

        {/* Reference box */}
        <div
          className="glass rounded-2xl p-6 mb-8"
          style={{ border: '1px solid rgba(226,185,111,0.2)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(240,240,248,0.4)' }}>
            Reference Number
          </p>
          <p className="font-display text-3xl font-bold" style={{ fontFamily: 'Syne', color: '#e2b96f', letterSpacing: '2px' }}>
            #{refId}
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(240,240,248,0.3)' }}>Save this for future queries</p>
        </div>

        {/* Details */}
        <div className="glass rounded-xl p-5 mb-8 text-left" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            ['Name', application.name],
            ['Mobile', application.mobile],
            ['Amount', formatINR(application.amount)],
            ['Language', application.language],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(240,240,248,0.4)' }}>{k}</p>
              <p className="text-sm font-medium">{v}</p>
            </div>
          ))}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'rgba(240,240,248,0.4)' }}>Purpose</p>
            <p className="text-sm font-medium">{application.purpose}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onReset} className="btn-secondary flex-1">Submit Another</button>
          <Link to="/dashboard" className="btn-primary flex-1 text-center flex items-center justify-center">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
