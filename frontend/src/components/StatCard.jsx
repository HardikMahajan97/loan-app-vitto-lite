import React from 'react';

const StatCard = ({ label, value, sub, accent }) => (
  <div
    className="glass rounded-2xl p-5 flex flex-col gap-2 fade-up"
    style={{ borderColor: accent ? `${accent}25` : undefined }}
  >
    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,248,0.4)' }}>
      {label}
    </p>
    <p
      className="font-display text-2xl font-bold leading-none"
      style={{ fontFamily: 'Syne', color: accent || 'var(--text-primary)' }}
    >
      {value}
    </p>
    {sub && <p className="text-xs" style={{ color: 'rgba(240,240,248,0.35)' }}>{sub}</p>}
  </div>
);

export default StatCard;
