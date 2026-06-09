import React, { useState } from 'react';
import { api, ApiError } from '../api/client.js';
import { StatusBadge } from './Badges.jsx';
import { formatINR, getRefId, formatDateTime } from '../utils/helpers.js';
import { useToast } from '../hooks/useToast.jsx';

const StatusModal = ({ application, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const addToast = useToast();

  if (!application) return null;

  const canUpdate = application.status === 'pending';

  const handleUpdate = async (newStatus) => {
    setLoading(true);
    try {
      const res = await api.updateStatus(application.id, newStatus);
      onUpdated(res.data);
      addToast(`Application ${newStatus} successfully.`, 'success');
      onClose();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to update status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass rounded-2xl w-full max-w-md fade-up"
        style={{ border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(240,240,248,0.4)' }}>Application</p>
            <h2 className="font-display font-bold text-lg" style={{ fontFamily: 'Syne' }}>#{getRefId(application.id)}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(240,240,248,0.5)' }}
          >
            ✕
          </button>
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Detail label="Applicant" value={application.name} />
            <Detail label="Mobile" value={application.mobile} />
            <Detail label="Amount" value={formatINR(application.amount)} accent />
            <Detail label="Language" value={application.language} />
            <Detail label="Submitted" value={formatDateTime(application.created_at)} span />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(240,240,248,0.4)' }}>Purpose</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,240,248,0.75)' }}>{application.purpose}</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>Status</p>
            <StatusBadge status={application.status} />
          </div>

          {/* Action buttons */}
          {canUpdate ? (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleUpdate('approved')}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: '#34d399',
                }}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '✓ Approve'}
              </button>
              <button
                onClick={() => handleUpdate('rejected')}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(248, 113, 113, 0.12)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  color: '#f87171',
                }}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '✕ Reject'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-center py-2" style={{ color: 'rgba(240,240,248,0.35)' }}>
              This application has already been {application.status}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, accent, span }) => (
  <div className={span ? 'col-span-2' : ''}>
    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(240,240,248,0.4)' }}>{label}</p>
    <p className="text-sm font-medium" style={{ color: accent ? '#e2b96f' : 'var(--text-primary)' }}>{value}</p>
  </div>
);

export default StatusModal;
