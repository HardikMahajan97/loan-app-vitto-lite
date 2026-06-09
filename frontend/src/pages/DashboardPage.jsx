import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client.js';
import { formatINR, formatDate, LANGUAGES, STATUSES } from '../utils/helpers.js';
import StatCard from '../components/StatCard.jsx';
import { StatusBadge, LangBadge } from '../components/Badges.jsx';
import StatusModal from '../components/StatusModal.jsx';
import { useToast } from '../hooks/useToast.jsx';

const DEFAULT_FILTERS = {
  status: '', language: '', search: '',
  minAmount: '', maxAmount: '', from: '', to: '',
  sortBy: 'created_at', sortOrder: 'desc',
  page: 1, limit: 10,
};

const DashboardPage = () => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const addToast = useToast();
  const searchTimer = useRef(null);

  // Fetch summary stats
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await api.getSummary();
      setSummary(res.data);
    } catch {
      // Non-critical
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await api.getApplications(f);
      setApplications(res.data);
      setPagination(res.pagination);
    } catch (err) {
      addToast('Failed to load applications.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchApplications(filters);
  }, [filters]);

  const setFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setFilter('search', val), 400);
  };

  const handleStatusUpdated = (updatedApp) => {
    setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
    fetchSummary();
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters = filters.status || filters.language || filters.search ||
    filters.minAmount || filters.maxAmount || filters.from || filters.to;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#e2b96f' }}>Operations</p>
          <h1 className="font-display text-3xl font-bold" style={{ fontFamily: 'Syne' }}>Loan Dashboard</h1>
          <p className="text-sm mt-1.5" style={{ color: 'rgba(240,240,248,0.45)' }}>
            Review and manage all incoming loan applications
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {summaryLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 h-24 animate-pulse" style={{ animationDuration: '1.5s' }} />
            ))
          ) : summary ? (
            <>
              <StatCard label="Total Applications" value={summary.total_applications} sub={`${summary.unique_applicants} unique borrowers`} />
              <StatCard label="Total Requested" value={formatINR(summary.total_amount)} sub={`Avg ${formatINR(summary.avg_amount)}`} accent="#e2b96f" />
              <StatCard label="Pending" value={summary.pending_count} accent="#fbbf24" />
              <StatCard label="Approved" value={summary.approved_count} sub={formatINR(summary.approved_amount)} accent="#34d399" />
              <StatCard label="Rejected" value={summary.rejected_count} accent="#f87171" />
            </>
          ) : null}
        </div>

        {/* ── Filters ── */}
        <div className="glass rounded-2xl p-5 mb-6 fade-up" style={{ animationDelay: '0.15s' }}>
          {/* Search + quick filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1" style={{ minWidth: '200px' }}>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                className="input-base pl-9"
                placeholder="Search by name or mobile…"
                defaultValue={filters.search}
                onChange={handleSearchInput}
                style={{ paddingTop: '10px', paddingBottom: '10px' }}
              />
            </div>

            {/* Status filter */}
            <select
              className="input-base"
              style={{ width: 'auto', minWidth: '130px', paddingTop: '10px', paddingBottom: '10px' }}
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
            >
              <option value="">All Status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            {/* Language filter */}
            <select
              className="input-base"
              style={{ width: 'auto', minWidth: '130px', paddingTop: '10px', paddingBottom: '10px' }}
              value={filters.language}
              onChange={(e) => setFilter('language', e.target.value)}
            >
              <option value="">All Languages</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>

            {/* Advanced toggle */}
            <button
              onClick={() => setShowAdvanced((p) => !p)}
              className="btn-secondary text-sm px-3 py-2.5 flex items-center gap-1.5"
              style={{ whiteSpace: 'nowrap' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M8 12h8M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Filters {showAdvanced ? '▲' : '▼'}
            </button>

            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-sm px-3 py-2.5 rounded-lg transition-colors" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                Clear
              </button>
            )}
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>Min Amount (₹)</label>
                <input className="input-base" type="number" min={0} placeholder="e.g. 10000" value={filters.minAmount} onChange={(e) => setFilter('minAmount', e.target.value)} style={{ paddingTop: '10px', paddingBottom: '10px' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>Max Amount (₹)</label>
                <input className="input-base" type="number" min={0} placeholder="e.g. 500000" value={filters.maxAmount} onChange={(e) => setFilter('maxAmount', e.target.value)} style={{ paddingTop: '10px', paddingBottom: '10px' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>From Date</label>
                <input className="input-base" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} style={{ paddingTop: '10px', paddingBottom: '10px', colorScheme: 'dark' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>To Date</label>
                <input className="input-base" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} style={{ paddingTop: '10px', paddingBottom: '10px', colorScheme: 'dark' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>Sort By</label>
                <select className="input-base" value={filters.sortBy} onChange={(e) => setFilter('sortBy', e.target.value)} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  <option value="created_at">Date</option>
                  <option value="amount">Amount</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>Order</label>
                <select className="input-base" value={filters.sortOrder} onChange={(e) => setFilter('sortOrder', e.target.value)} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>Per Page</label>
                <select className="input-base" value={filters.limit} onChange={(e) => setFilter('limit', parseInt(e.target.value))} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  {[10, 25, 50].map((n) => <option key={n} value={n}>{n} rows</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="glass rounded-2xl overflow-hidden fade-up" style={{ animationDelay: '0.2s' }}>
          {/* Table header row */}
          <div
            className="hidden lg:grid gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{
              gridTemplateColumns: '1fr 1.2fr 1fr 1.3fr 0.9fr 0.8fr 0.8fr',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(240,240,248,0.35)',
            }}
          >
            <span>Applicant</span>
            <span>Mobile</span>
            <span>Amount</span>
            <span>Purpose</span>
            <span>Language</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3" style={{ color: 'rgba(240,240,248,0.4)' }}>
              <span className="spinner" />
              <span className="text-sm">Loading applications…</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-medium mb-1">No applications found</p>
              <p className="text-sm" style={{ color: 'rgba(240,240,248,0.35)' }}>
                {hasActiveFilters ? 'Try adjusting your filters' : 'No applications have been submitted yet'}
              </p>
            </div>
          ) : (
            applications.map((app, idx) => (
              <ApplicationRow
                key={app.id}
                app={app}
                idx={idx}
                onClick={() => setSelected(app)}
              />
            ))
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-xs" style={{ color: 'rgba(240,240,248,0.35)' }}>
                Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1.5">
                <PagBtn disabled={!pagination.hasPrev} onClick={() => setFilter('page', filters.page - 1)}>←</PagBtn>
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  const p = pagination.totalPages <= 7 ? i + 1 :
                    pagination.page <= 4 ? i + 1 :
                    pagination.page >= pagination.totalPages - 3 ? pagination.totalPages - 6 + i :
                    pagination.page - 3 + i;
                  return (
                    <PagBtn key={p} active={p === pagination.page} onClick={() => setFilter('page', p)}>
                      {p}
                    </PagBtn>
                  );
                })}
                <PagBtn disabled={!pagination.hasNext} onClick={() => setFilter('page', filters.page + 1)}>→</PagBtn>
              </div>
            </div>
          )}
        </div>

        {/* Result count */}
        {!loading && applications.length > 0 && pagination && (
          <p className="text-xs mt-3 text-center" style={{ color: 'rgba(240,240,248,0.25)' }}>
            {pagination.total} application{pagination.total !== 1 ? 's' : ''} total
          </p>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <StatusModal
          application={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
};

const ApplicationRow = ({ app, onClick }) => (
  <div
    className="glass-hover cursor-pointer px-6 py-4 transition-all duration-200"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    onClick={onClick}
  >
    {/* Mobile layout */}
    <div className="lg:hidden flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">{app.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(240,240,248,0.4)' }}>{app.mobile}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold" style={{ color: '#e2b96f' }}>{formatINR(app.amount)}</span>
        <LangBadge language={app.language} />
        <span className="text-xs" style={{ color: 'rgba(240,240,248,0.35)' }}>{formatDate(app.created_at)}</span>
      </div>
      <p className="text-xs" style={{ color: 'rgba(240,240,248,0.4)' }}>{app.purpose}</p>
    </div>

    {/* Desktop layout */}
    <div
      className="hidden lg:grid gap-4 items-center"
      style={{ gridTemplateColumns: '1fr 1.2fr 1fr 1.3fr 0.9fr 0.8fr 0.8fr' }}
    >
      <p className="font-medium text-sm truncate">{app.name}</p>
      <p className="text-sm" style={{ color: 'rgba(240,240,248,0.6)', fontVariantNumeric: 'tabular-nums' }}>{app.mobile}</p>
      <p className="text-sm font-semibold" style={{ color: '#e2b96f' }}>{formatINR(app.amount)}</p>
      <p className="text-sm truncate" style={{ color: 'rgba(240,240,248,0.6)' }}>{app.purpose}</p>
      <LangBadge language={app.language} />
      <StatusBadge status={app.status} />
      <p className="text-xs" style={{ color: 'rgba(240,240,248,0.35)' }}>{formatDate(app.created_at)}</p>
    </div>
  </div>
);

const PagBtn = ({ children, active, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
    style={{
      background: active ? 'rgba(226,185,111,0.15)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? 'rgba(226,185,111,0.4)' : 'rgba(255,255,255,0.08)'}`,
      color: active ? '#e2b96f' : 'rgba(240,240,248,0.5)',
    }}
  >
    {children}
  </button>
);

export default DashboardPage;
