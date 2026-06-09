import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center fade-up">
      <p className="font-display text-8xl font-bold mb-4" style={{ fontFamily: 'Syne', color: 'rgba(226,185,111,0.2)' }}>404</p>
      <h1 className="font-display text-2xl font-bold mb-3" style={{ fontFamily: 'Syne' }}>Page not found</h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(240,240,248,0.45)' }}>This page doesn't exist.</p>
      <Link to="/" className="btn-primary">← Go Home</Link>
    </div>
  </div>
);

export default NotFoundPage;
