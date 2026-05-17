// ============================================================
// CreateProjectPage — Zen AI Generation
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { sampleStorySchema } from '@/data/mockData';
import SciFiPlayer from '@/components/SciFiPlayer';

type Phase = 'input' | 'generating' | 'review';

type CreateLocationState = { prompt?: string };

const GENERATION_STEPS = [
  '构思剧情脉络',
  '塑造角色灵魂',
  '描绘场景意境',
  '绘制角色立绘',
  '调和氛围声息',
] as const;

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initPrompt =
    (location.state as CreateLocationState | null | undefined)?.prompt ?? '';

  const [phase, setPhase] = useState<Phase>(initPrompt ? 'generating' : 'input');
  const [prompt, setPrompt] = useState(initPrompt);
  const [story] = useState(sampleStorySchema);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const { createProject, setCurrentProject } = useStore();

  useEffect(() => {
    if (phase !== 'generating') return;

    const iv = setInterval(() => {
      setProgress((p) => {
        const np = p + 0.8;
        const si = Math.min(
          Math.floor((np / 100) * GENERATION_STEPS.length),
          GENERATION_STEPS.length - 1
        );
        setStep(si);
        if (np >= 100) {
          clearInterval(iv);
          setTimeout(() => setPhase('review'), 600);
          return 100;
        }
        return np;
      });
    }, 100);

    return () => clearInterval(iv);
  }, [phase]);

  const handleCreate = useCallback(() => {
    if (!prompt.trim()) return;
    setProgress(0);
    setStep(0);
    setPhase('generating');
  }, [prompt]);

  const goEditor = useCallback(() => {
    createProject(story.title, story.summary, story.style);
    const { projects } = useStore.getState();
    if (projects[0]) {
      setCurrentProject({ ...projects[0], story });
      navigate('/editor');
    }
  }, [story, createProject, setCurrentProject, navigate]);

  // ============ INPUT ============
  if (phase === 'input') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <p className="text-white/55 text-[10px] tracking-[0.6em] uppercase font-mono mb-10">开始创作</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="告诉我你想讲什么故事..."
            className="w-full h-28 bg-transparent border-b border-white/25 pb-4 text-white/90 text-sm placeholder-white/35 resize-none focus:outline-none focus:border-white/70 transition-colors leading-relaxed text-center"
          />
          <button
            onClick={handleCreate}
            disabled={!prompt.trim()}
            className={`w-full mt-8 py-3 text-xs tracking-[0.3em] font-mono transition-all rounded-lg ${
              prompt.trim() ? 'text-black bg-white hover:bg-white/90' : 'text-white/30 border border-white/10 cursor-not-allowed'
            }`}
          >
            开始创作
          </button>
          <button onClick={() => navigate('/')} className="w-full mt-4 text-white/40 hover:text-white/70 text-xs transition-colors">
            返回
          </button>
        </div>
      </div>
    );
  }

  // ============ ZEN GENERATING ============
  if (phase === 'generating') {
    const r = 48;
    const circ = 2 * Math.PI * r;
    const offset = circ - (progress / 100) * circ;

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5" />
            <circle
              cx="60" cy="60" r={r}
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full" style={{ animation: 'breathe 4s ease-in-out infinite' }} />
          </div>
        </div>

        <div className="mt-12 h-6 flex items-center justify-center">
          <p key={step} className="text-white/70 text-xs tracking-[0.4em] font-light animate-zen-fade">
            {GENERATION_STEPS[step]}
          </p>
        </div>
      </div>
    );
  }

  // ============ REVIEW ============
  return (
    <div className="min-h-screen bg-black px-4 md:px-8 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle size={12} className="text-white/60" strokeWidth={1} />
            <span className="text-white/50 text-[10px] font-mono tracking-wider">完成</span>
          </div>
          <button
            onClick={() => { setPhase('input'); setPrompt(''); setProgress(0); }}
            className="text-white/40 hover:text-white/80 text-[10px] transition-colors flex items-center gap-1"
          >
            <RotateCcw size={9} strokeWidth={1.5} />
            重新创作
          </button>
        </div>

        <h2 className="text-white/90 text-lg font-extralight tracking-wider mb-1">{story.title}</h2>
        <p className="text-white/55 text-xs mb-8">{story.summary}</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '节点', value: story.nodes.length },
                { label: '角色', value: story.characters.length },
                { label: '结局', value: story.nodes.filter((n) => n.isEnding).length },
              ].map((s) => (
                <div key={s.label} className="border border-white/[0.10] rounded-lg p-3 text-center">
                  <div className="text-white/80 text-lg font-extralight">{s.value}</div>
                  <div className="text-white/35 text-[9px] font-mono tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="border border-white/[0.08] rounded-lg p-4">
              <div className="text-white/40 text-[9px] font-mono tracking-widest mb-3">剧情节点</div>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {story.nodes.map((n, i) => (
                  <div key={n.id} className={`flex items-start gap-2 p-1.5 rounded ${n.isEnding ? 'bg-white/[0.05]' : ''}`}>
                    <span className={`text-[9px] font-mono mt-0.5 ${n.isEnding ? 'text-white/50' : 'text-white/30'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="text-white/60 text-xs truncate">{n.title}</div>
                    {n.isEnding && <span className="text-white/25 text-[8px] ml-auto font-mono">END</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => navigate('/play/demo', { state: { story } })}
                className="flex-1 py-2.5 bg-white text-black rounded-lg text-xs font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight size={12} strokeWidth={1.5} />
                试玩
              </button>
              <button
                onClick={goEditor}
                className="flex-1 py-2.5 border border-white/15 text-white/70 rounded-lg text-xs hover:border-white/40 hover:bg-white/[0.04] transition-colors"
              >
                编辑
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl overflow-hidden border border-white/[0.10]" style={{ height: 'min(65vh, 560px)' }}>
              <SciFiPlayer story={story} storyId="demo-preview" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
