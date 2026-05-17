// ============================================================
// LoginPage — Zen Auth
// Pure black. White text. Nothing else.
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import type { User } from '@/types';
import { getUsers, saveUsers, setSession } from '@/lib/authLocalStorage';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setUser } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();

    if (mode === 'register') {
      if (!username.trim()) { setError('请输入用户名'); return; }
      if (password.length < 6) { setError('密码至少6位'); return; }
      if (users[email]) { setError('该邮箱已注册'); return; }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        username: username.trim(),
        avatarUrl: null,
        role: 'user',
        credits: 100,
        createdAt: new Date().toISOString(),
      };

      users[email] = { password, user: newUser };
      saveUsers(users);
      setSession(newUser);
      setUser(newUser);
      login();
      navigate('/dashboard');
    } else {
      const record = users[email];
      if (!record) { setError('该邮箱未注册'); return; }
      if (record.password !== password) { setError('密码错误'); return; }

      setSession(record.user);
      setUser(record.user);
      login();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left — brand space (large, empty, breathing) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.02' stroke-width='1'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative z-10 text-center px-16">
          <p className="text-white/[0.32] text-[10px] tracking-[0.6em] uppercase font-mono mb-4">CreAI Studio</p>
          <div className="w-8 h-px bg-white/95 mx-auto" />
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-xs">
          <div className="lg:hidden text-center mb-12">
            <p className="text-white/[0.32] text-[10px] tracking-[0.6em] uppercase font-mono">CreAI Studio</p>
          </div>

          <h2 className="text-white text-base font-extralight tracking-wider mb-1">
            {mode === 'login' ? '登录' : '注册'}
          </h2>
          <p className="text-white text-xs mb-10">
            {mode === 'login' ? '登录你的创作账户' : '创建账户开始创作'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label className="block text-white text-[9px] font-mono tracking-[0.3em] mb-2 uppercase">用户名</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="你的名字"
                  className="w-full bg-transparent border-b border-white/[0.26] pb-2 text-white text-sm placeholder-white/[0.26] focus:outline-none focus:border-white/95 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-white text-[9px] font-mono tracking-[0.3em] mb-2 uppercase">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-white/[0.26] pb-2 text-white text-sm placeholder-white/[0.26] focus:outline-none focus:border-white/95 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-white text-[9px] font-mono tracking-[0.3em] mb-2 uppercase">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? '至少6位' : '你的密码'}
                className="w-full bg-transparent border-b border-white/[0.26] pb-2 text-white text-sm placeholder-white/[0.26] focus:outline-none focus:border-white/95 transition-colors"
                required
              />
            </div>

            {error && (
              <p className="text-red-400/50 text-xs">{error}</p>
            )}

            <button
              type="submit"
              className="w-full mt-6 py-3 text-xs tracking-[0.25em] font-mono text-black bg-white hover:bg-white rounded-lg transition-colors"
            >
              {mode === 'login' ? '登录' : '创建账号'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-white/85 hover:text-white text-xs transition-colors"
            >
              {mode === 'login' ? '没有账号？注册' : '已有账号？登录'}
            </button>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                const guest: User = {
                  id: `guest_${Date.now()}`,
                  email: '',
                  username: '访客',
                  avatarUrl: null,
                  role: 'user',
                  credits: 50,
                  createdAt: new Date().toISOString(),
                };
                setSession(guest);
                setUser(guest);
                login();
                navigate('/dashboard');
              }}
              className="text-white/[0.26] hover:text-white text-xs transition-colors"
            >
              访客模式
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
