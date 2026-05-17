// ============================================================
// Navbar — Zen Minimalist
// ============================================================
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wand2, Home, Compass, Plus, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { clearSession } from '@/lib/authLocalStorage';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: '首页', icon: Home },
    { to: '/explore', label: '作品', icon: Compass },
    { to: '/dashboard', label: '工作台', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-2xl border-b border-white/[0.26]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-14">
          {/* Logo — minimal, monochrome */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
              <Wand2 size={14} className="text-black" strokeWidth={1.5} />
            </div>
            <span className="text-white font-light text-sm tracking-[0.08em]">
              CreAI
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-xs tracking-wider transition-all ${
                  isActive(link.to)
                    ? 'text-white bg-white/[0.26]'
                    : 'text-white hover:text-white hover:bg-white/[0.26]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link
              to="/create"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black rounded-lg text-xs font-medium hover:bg-white transition-colors"
            >
              <Plus size={13} strokeWidth={1.5} />
              创作
            </Link>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-7 h-7 rounded-full border border-white/[0.26] flex items-center justify-center hover:border-white/95 transition-colors"
              >
                <User size={13} className="text-white/85" strokeWidth={1.5} />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-10 w-44 bg-black border border-white/[0.26] rounded-xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-white/[0.26]">
                      <p className="text-white text-xs">{user?.username}</p>
                      <p className="text-white/85 text-[10px] mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { clearSession(); logout(); navigate('/'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-white/95 text-xs hover:bg-white/[0.26] hover:text-white transition-colors"
                    >
                      <LogOut size={12} strokeWidth={1.5} />
                      退出
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
