import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav
      className="glass sticky top-0 z-50"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #e2b96f, #c47c0f)' }}
          >
            <span className="text-xs font-display font-800 text-navy-900" style={{ fontFamily: 'Syne', fontWeight: 800, color: '#0d1117', fontSize: '13px' }}>V</span>
          </div>
          <span className="font-display font-bold tracking-widest text-sm" style={{ fontFamily: 'Syne', color: '#e2b96f', letterSpacing: '3px' }}>
            VITTO
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/8 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
          >
            Apply
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/8 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
          >
            Dashboard
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
