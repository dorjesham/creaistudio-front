// ============================================================
// HomePage — Zen Landing Page
// Less is more. The design should breathe.
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wand2, Sparkles, Zap, Share2, Smartphone,
  ChevronRight,
  School, Rocket, Heart, Ghost, Sword, Briefcase
} from 'lucide-react';
import { genrePresets, publishedWorks } from '@/data/mockData';

const iconMap: Record<string, React.ElementType> = {
  School, Rocket, Heart, Ghost, Sword, Briefcase,
};

export default function HomePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    navigate('/create', { state: { prompt: prompt.trim() } });
  };

  const handlePresetClick = (presetPrompt: string) => {
    navigate('/create', { state: { prompt: presetPrompt } });
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI 一键生成',
      desc: '输入故事设定，AI自动生成完整的互动剧情、角色和场景',
    },
    {
      icon: Smartphone,
      title: '手机即玩',
      desc: '发布即生成链接，分享到任何地方，点开直接游玩',
    },
    {
      icon: Zap,
      title: '实时预览',
      desc: '编辑的同时在手机上实时预览，所见即所得',
    },
    {
      icon: Share2,
      title: '零摩擦传播',
      desc: '无需下载安装，一个链接即可让全世界体验你的故事',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          {/* Eyebrow */}
          <p className="text-white/95 text-[10px] tracking-[0.4em] uppercase font-mono mb-8">
            AI 互动叙事创作平台
          </p>

          {/* Title — large, light, breathing */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-white mb-7 leading-[1.2] tracking-tight">
            <span className="block mb-2 sm:mb-2.5">一个想法，</span>
            <span className="block text-white/85">10分钟，一个游戏</span>
          </h1>

          <p className="text-white/85 text-sm leading-relaxed max-w-md mx-auto mb-16 space-y-3">
            <span className="block">用 AI 把你的故事变成可玩的互动视觉小说。</span>
            <span className="block">无需编程，无需画画，只需会讲故事。</span>
          </p>

          {/* Big Input — minimal, no background */}
          <div
            className={`relative border-b transition-colors duration-500 ${
              isFocused ? 'border-white' : 'border-white/[0.26]'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => { setIsFocused(true); setShowPresets(true); }}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="闭上眼睛，脑海中第一个浮现的画面是什么？把它说出来……"
              className="w-full bg-transparent text-white placeholder-white/40 text-sm resize-none outline-none min-h-[88px] py-2.5 pb-5 leading-relaxed"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className={`absolute right-0 bottom-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                prompt.trim()
                  ? 'bg-white text-black hover:bg-white'
                  : 'bg-white/[0.26] text-white/95 cursor-not-allowed'
              }`}
            >
              <Wand2 size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Genre Presets */}
          {showPresets && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {genrePresets.map((preset) => {
                const IconComp = iconMap[preset.icon] || Sparkles;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.26] rounded-lg text-white text-xs hover:bg-white/[0.26] hover:text-white transition-all"
                  >
                    <IconComp size={11} strokeWidth={1.5} />
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-white/95" />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-white text-[10px] tracking-[0.4em] uppercase font-mono mb-4 text-center">
            创作流程
          </p>
          <h2 className="text-2xl sm:text-3xl font-extralight text-white mb-16 text-center tracking-tight">
            三步，从零到 playable
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: '讲述你的故事', desc: '用自然语言描述你想创作的故事——类型、主角、情节走向，AI会理解你的创意。' },
              { step: '02', title: 'AI 自动生成', desc: 'AI 在几分钟内生成完整的互动剧情结构、角色立绘、背景图和分支选项。' },
              { step: '03', title: '发布即分享', desc: '一键发布生成专属链接，分享到微信、QQ、微博——对方点开就能玩。' },
            ].map((item) => (
              <div key={item.step} className="group">
                <div className="border border-white/[0.26] rounded-2xl p-8 hover:border-white/[0.26] transition-colors">
                  <span className="text-white/95 text-xs font-mono tracking-widest">{item.step}</span>
                  <h3 className="text-white font-light text-lg mt-4 mb-3">{item.title}</h3>
                  <p className="text-white/95 text-sm leading-[1.8]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6 border-t border-white/[0.26]">
        <div className="max-w-4xl mx-auto">
          <p className="text-white text-[10px] tracking-[0.4em] uppercase font-mono mb-4 text-center">
            核心能力
          </p>
          <h2 className="text-2xl sm:text-3xl font-extralight text-white mb-16 text-center tracking-tight">
            为什么选择 CreAI Studio
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="border border-white/[0.26] rounded-2xl p-6 hover:border-white/[0.26] transition-colors"
              >
                <div className="w-9 h-9 border border-white/[0.26] rounded-lg flex items-center justify-center mb-5">
                  <feat.icon size={16} className="text-white/95" strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-light text-sm mb-2">{feat.title}</h3>
                <p className="text-white/95 text-xs leading-[1.8]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="py-32 px-6 border-t border-white/[0.26]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-white text-[10px] tracking-[0.4em] uppercase font-mono mb-2">社区精选</p>
              <h2 className="text-2xl font-extralight text-white tracking-tight">热门作品</h2>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="flex items-center gap-1 text-white/85 text-xs hover:text-white transition-colors"
            >
              全部 <ChevronRight size={14} strokeWidth={1} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedWorks.slice(0, 3).map((work) => (
              <div
                key={work.id}
                onClick={() => navigate(`/play/${work.slug}`)}
                className="group border border-white/[0.26] rounded-2xl overflow-hidden hover:border-white/[0.24] transition-all cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={work.coverUrl || ''}
                    alt={work.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-700"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-white font-light text-sm mb-2 group-hover:text-white transition-colors">
                    {work.title}
                  </h3>
                  <p className="text-white text-xs leading-relaxed line-clamp-2">{work.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.26]">
                    <span className="text-white/95 text-[10px]">{work.authorName}</span>
                    <span className="text-white text-[10px] font-mono">{work.viewCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 border-t border-white/[0.26]">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-extralight text-white mb-3 tracking-tight">
            准备好开始了吗？
          </h2>
          <p className="text-white/95 text-sm mb-10">你的想法值得被体验。</p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => textareaRef.current?.focus(), 500);
            }}
            className="px-8 py-3 bg-white text-black rounded-xl text-sm font-medium hover:bg-white transition-colors"
          >
            开始创作
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.26]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-white text-[10px] font-mono tracking-wider">CreAI Studio</span>
          <span className="text-white/95 text-[10px]">2026</span>
        </div>
      </footer>
    </div>
  );
}
