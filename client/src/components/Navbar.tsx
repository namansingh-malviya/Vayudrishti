import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wind, ShieldAlert, FileText, Network, BookOpen, PlayCircle, MapPin } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface NavbarProps {
  openCasesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ openCasesCount = 3 }) => {
  const location = useLocation();
  const { selectedCityId, setSelectedCityId, cities, startDemo } = useAppStore();

  const navLinks = [
    { to: '/', label: 'Live Map', icon: Wind },
    { to: '/cases', label: 'Case Board', icon: ShieldAlert, badge: openCasesCount },
    { to: '/report', label: 'Report Hotspot', icon: FileText },
    { to: '/federation', label: 'Federation', icon: Network },
    { to: '/methods', label: 'Methods & Impact', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-hairline px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-button bg-signal text-white flex items-center justify-center font-bold shadow-subtle group-hover:bg-signal-hover transition-colors">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-ink leading-none block">
                Vayu
              </span>
              <span className="text-[10px] text-slate font-sans uppercase tracking-wider block -mt-0.5">
                Action Enforcement
              </span>
            </div>
          </Link>

          {/* City Selector */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-hairline">
            <MapPin className="w-3.5 h-3.5 text-slate" />
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="text-xs font-medium text-ink bg-transparent hover:bg-paper focus:bg-paper py-1 px-1.5 rounded-button border-none cursor-pointer focus:ring-1 focus:ring-signal outline-none"
              aria-label="Select City"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.id !== 'delhi-ncr' ? '(Simulated)' : ''}
                </option>
              ))}
              {cities.length === 0 && (
                <>
                  <option value="delhi-ncr">Delhi NCR</option>
                  <option value="kanpur">Kanpur (Simulated)</option>
                  <option value="patna">Patna (Simulated)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative px-3 py-1.5 rounded-button text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-signal bg-signal-light font-semibold'
                    : 'text-slate hover:text-ink hover:bg-paper'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-pill bg-alert text-white font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button: Guided Demo */}
        <div className="flex items-center gap-2">
          <button
            onClick={startDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-signal text-white text-xs font-medium hover:bg-signal-hover transition-all shadow-subtle hover:shadow focus:ring-2 focus:ring-signal/40"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Walk Demo Scenario</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav bar */}
      <div className="flex md:hidden overflow-x-auto gap-2 pt-2 border-t border-hairline mt-2 text-xs">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`whitespace-nowrap px-2.5 py-1 rounded-button flex items-center gap-1 text-xs ${
                isActive ? 'bg-signal-light text-signal font-semibold' : 'text-slate'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-alert text-white text-[9px] flex items-center justify-center font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
