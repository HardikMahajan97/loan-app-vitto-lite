import React from 'react';

const DOT = { pending: '#fbbf24', approved: '#34d399', rejected: '#f87171' };

export const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: DOT[status], display: 'inline-block' }} />
    {status}
  </span>
);

export const LangBadge = ({ language }) => (
  <span className={`badge lang-${language}`} style={{ textTransform: 'none', fontSize: '0.7rem' }}>
    {language}
  </span>
);
