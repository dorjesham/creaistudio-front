// ============================================================
// SciFiPlayer — Zen Immersive Story Player
// Per node: static PNG character + looping video BG + voiceover
// ============================================================
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RotateCcw, ChevronLeft, Heart, Share2, GitBranch, Volume2, VolumeX } from 'lucide-react';
import type { StorySchema } from '@/types';
import { useStore } from '@/store/useStore';
import BranchTree from './BranchTree';

interface Props {
  story: StorySchema;
  storyId?: string;
  onBack?: () => void;
}

// ---- Web Audio API noise generators for ambient sound ----
function createNoise(ctx: AudioContext, type: 'rain' | 'wind' | 'fire' | 'night') {
  const bufSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  switch (type) {
    case 'rain':
      filter.type = 'highpass';
      filter.frequency.value = 800;
      gain.gain.value = 0.03;
      break;
    case 'wind':
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.5;
      gain.gain.value = 0.04;
      break;
    case 'fire':
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      gain.gain.value = 0.05;
      break;
    case 'night':
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      gain.gain.value = 0.06;
      break;
  }

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  return { source, gain };
}

export default function SciFiPlayer({ story, storyId = 'demo', onBack }: Props) {
  const [nodeId, setNodeId] = useState(story.startNodeId);
  const [displayText, setDisplayText] = useState('');
  const [done, setDone] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [titleText, setTitleText] = useState('');

  const [liked, setLiked] = useState(false);
  const [shareTip, setShareTip] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [endStat, setEndStat] = useState({ v: 0, t: 0, e: 0, u: 0 });

  const [voiceOn, setVoiceOn] = useState(true);
  const [sfxOn] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sfxNodeRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const tiRef = useRef(0);
  const tmRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggered = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { visitNode, unlockEnding, checkTrueEnding, getProgress } = useStore();
  const prog = getProgress(storyId);

  const node = story.nodes.find((n) => n.id === nodeId)!;
  const bgUrl = story.backgrounds.find((b) => b.id === node.backgroundId)?.url || '';
  const allEndings = story.nodes.filter((n) => n.isEnding);
  const normalEndings = allEndings.filter((n) => n.endingType !== 'true');
  const allNormalUnlocked = normalEndings.every((n) => prog.unlockedEndings.includes(n.id));
  const trueEndNode = allEndings.find((n) => n.endingType === 'true');

  const getCharUrl = useCallback((cid: string, expr: string) => {
    const c = story.characters.find((x) => x.id === cid);
    if (!c) return null;
    const e = c.expressions.find((x) => x.name === expr);
    return e?.url || c.avatarUrl || null;
  }, [story.characters]);

  const getCharName = useCallback((cid: string) => {
    return story.characters.find((c) => c.id === cid)?.name || '';
  }, [story.characters]);

  const barW = useMemo(() => {
    const len = story.nodes.length;
    if (!len) return 0;
    const idx = story.nodes.findIndex((n) => n.id === nodeId);
    return (((idx < 0 ? 0 : idx) + 1) / len) * 100;
  }, [nodeId, story.nodes]);

  // Track visit
  useEffect(() => {
    visitNode(storyId, nodeId);
  }, [nodeId, storyId, visitNode]);

  // Ambient sound
  useEffect(() => {
    if (!sfxOn || !node.envSound || node.envSound === 'none') {
      if (sfxNodeRef.current) {
        try { sfxNodeRef.current.source.stop(); } catch { /* silent */ }
        sfxNodeRef.current = null;
      }
      return;
    }

    if (sfxNodeRef.current) {
      try { sfxNodeRef.current.source.stop(); } catch { /* silent */ }
      sfxNodeRef.current = null;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const noise = createNoise(ctx, node.envSound);
    noise.source.start();
    sfxNodeRef.current = noise;

    return () => {
      if (sfxNodeRef.current) {
        try { sfxNodeRef.current.source.stop(); } catch { /* silent */ }
        sfxNodeRef.current = null;
      }
    };
  }, [nodeId, node.envSound, sfxOn]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!voiceOn) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find((v) => v.lang.includes('zh'));
    if (zhVoice) utter.voice = zhVoice;
    window.speechSynthesis.speak(utter);
  }, [voiceOn]);

  const skip = useCallback(() => {
    if (!done) {
      if (tmRef.current) clearTimeout(tmRef.current);
      window.speechSynthesis.cancel();
      setDisplayText(node.text);
      setDone(true);
    }
  }, [done, node.text]);

  // Typing + Voice
  useEffect(() => {
    let cancelled = false;
    let titleT: ReturnType<typeof setTimeout> | undefined;
    let voiceTimer: ReturnType<typeof setTimeout> | undefined;

    queueMicrotask(() => {
      if (cancelled) return;
      setDone(false);
      setDisplayText('');
      setOverlay(false);
      hasTriggered.current = false;
      tiRef.current = 0;
      setTitleText(node.title);
      setShowTitle(true);

      titleT = setTimeout(() => setShowTitle(false), 1800);

      const type = () => {
        if (tiRef.current < node.text.length) {
          tiRef.current++;
          setDisplayText(node.text.slice(0, tiRef.current));
          tmRef.current = setTimeout(type, 22);
        } else {
          setDone(true);
        }
      };
      tmRef.current = setTimeout(type, 600);

      voiceTimer = setTimeout(() => {
        speak(node.text);
      }, 800);
    });

    return () => {
      cancelled = true;
      if (titleT !== undefined) clearTimeout(titleT);
      if (voiceTimer !== undefined) clearTimeout(voiceTimer);
      window.speechSynthesis.cancel();
      if (tmRef.current) clearTimeout(tmRef.current);
    };
  }, [node.text, node.title, speak]);

  // Trigger ending overlay
  useEffect(() => {
    if (node.isEnding && done && !overlay && !hasTriggered.current) {
      hasTriggered.current = true;
      const t = setTimeout(() => {
        unlockEnding(storyId, nodeId);
        checkTrueEnding(storyId);
        const p = getProgress(storyId);
        setEndStat({
          v: p.visitedNodes.length,
          t: story.nodes.length,
          e: allEndings.length,
          u: p.unlockedEndings.length,
        });
        setOverlay(true);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [node.isEnding, done, overlay, nodeId, storyId, unlockEnding, checkTrueEnding, getProgress, story.nodes.length, allEndings.length]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        if (overlay) { setOverlay(false); return; }
        setShowTree((p) => !p);
      }
      if (e.key === 'Escape') {
        if (overlay) setOverlay(false);
        else if (showTree) setShowTree(false);
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (overlay) { setOverlay(false); return; }
        skip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay, showTree, skip]);

  const pick = (target: string) => {
    if (transitioning || !done) return;
    window.speechSynthesis.cancel();
    setTransitioning(true);
    setDone(false);
    setOverlay(false);
    setTimeout(() => { setNodeId(target); setTransitioning(false); }, 500);
  };

  const restart = () => {
    window.speechSynthesis.cancel();
    setTransitioning(true);
    setOverlay(false);
    setShowTree(false);
    setTimeout(() => { setNodeId(story.startNodeId); setTransitioning(false); }, 400);
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareTip(true); setTimeout(() => setShareTip(false), 2000); } catch { /* silent */ }
  };

  const gridBg = `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.012' stroke-width='1'%3E%3Cpath d='M0 0h50v50H0z'/%3E%3Cpath d='M0 25h50M25 0v50'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none" onClick={skip}>

      {/* Video Background */}
      {node.bgVideoUrl ? (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            src={node.bgVideoUrl}
            autoPlay loop muted playsInline
            className={`w-full h-full object-cover transition-all duration-[1500ms] ${transitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
            style={{ filter: 'brightness(0.7)' }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0">
          {bgUrl && (
            <div className={`w-full h-full bg-cover bg-center transition-all duration-[1500ms] ease-out ${transitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
              style={{ backgroundImage: `url(${bgUrl})`, filter: 'brightness(0.7) saturate(0.6)' }} />
          )}
        </div>
      )}

      {/* Atmospheric overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 animate-atmosphere"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 70%, transparent 0%, rgba(0,0,0,0.9) 100%)' }} />
      </div>

      {/* Grid texture */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: gridBg }} />

      {/* CRT scanline */}
      <div className="absolute inset-0 z-40 pointer-events-none opacity-[0.02]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.85) 2px, rgba(255,255,255,0.85) 4px)' }} />

      {/* Transition overlay */}
      <div className={`absolute inset-0 z-50 bg-black pointer-events-none transition-opacity duration-500 ${transitioning ? 'opacity-100' : 'opacity-0'}`} />

      {/* Title card */}
      {showTitle && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-title-reveal">
          <div className="text-center">
            <div className="text-[9px] tracking-[0.5em] text-white uppercase mb-3 font-mono">章节</div>
            <h2 className="text-2xl md:text-4xl font-extralight text-white tracking-wider">{titleText}</h2>
            <div className="w-12 h-px bg-white/[0.26] mx-auto mt-4" />
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 h-12">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="w-7 h-7 flex items-center justify-center text-white hover:text-white/95 transition-colors">
              <ChevronLeft size={16} strokeWidth={1} />
            </button>
          )}
          <span className="text-white text-[10px] tracking-[0.3em] uppercase font-mono">{story.title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); setVoiceOn(!voiceOn); if (voiceOn) window.speechSynthesis.cancel(); }}
            className={`w-7 h-7 flex items-center justify-center transition-colors ${voiceOn ? 'text-white' : 'text-white/95 hover:text-white/85'}`}
            title={voiceOn ? '关闭配音' : '开启配音'}
          >
            {voiceOn ? <Volume2 size={13} strokeWidth={1.5} /> : <VolumeX size={13} strokeWidth={1.5} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setShowTree(!showTree); }} className={`w-7 h-7 flex items-center justify-center transition-colors ${showTree ? 'text-white' : 'text-white/95 hover:text-white/85'}`} title="分支树 (T)">
            <GitBranch size={13} strokeWidth={1.5} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} className={`w-7 h-7 flex items-center justify-center transition-colors ${liked ? 'text-white/95' : 'text-white/95 hover:text-white/85'}`}>
            <Heart size={13} strokeWidth={1.5} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); copyLink(); }} className="w-7 h-7 flex items-center justify-center text-white/95 hover:text-white/85 transition-colors relative">
            <Share2 size={13} strokeWidth={1.5} />
            {shareTip && <div className="absolute top-9 right-0 text-[9px] text-white whitespace-nowrap font-mono bg-white/[0.26] px-2 py-0.5 rounded">已复制</div>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); restart(); }} className="w-7 h-7 flex items-center justify-center text-white/95 hover:text-white/85 transition-colors">
            <RotateCcw size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-12 left-0 right-0 h-px z-20 bg-white/[0.24]">
        <div className="h-full bg-white/[0.24] transition-all duration-700 ease-out" style={{ width: `${barW}%` }} />
      </div>

      {/* Characters */}
      <div className="absolute inset-x-0 bottom-[35%] top-14 z-10 pointer-events-none flex items-end justify-center">
        <div className="flex items-end gap-4 md:gap-8 px-8">
          {node.characters.map((c, i) => {
            const url = getCharUrl(c.characterId, c.expression);
            if (!url) return null;
            return (
              <div key={i} className={`transition-all duration-700 ease-out ${transitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`} style={{ transitionDelay: `${i * 120}ms` }}>
                <img src={url} alt="" className="h-[26vh] md:h-[34vh] object-contain"
                  style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', filter: 'brightness(0.9)' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {node.characters.length > 0 && (
          <div className="px-6 md:px-10 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-px bg-white/[0.26]" />
              <span className="text-[9px] tracking-[0.35em] text-white uppercase font-mono">{getCharName(node.characters[0].characterId)}</span>
              <div className="flex-1 h-px bg-white/[0.24]" />
            </div>
          </div>
        )}

        <div className="px-6 md:px-10 mb-5">
          <div className="max-w-3xl mx-auto">
            <p className="text-white text-sm md:text-base leading-[1.9] font-light whitespace-pre-wrap min-h-[3em]">
              {displayText}
              {!done && <span className="inline-block w-px h-4 bg-white/85 ml-0.5 animate-blink" />}
            </p>
          </div>
        </div>

        {/* Choices */}
        <div className={`px-6 md:px-10 pb-8 transition-all duration-500 ${done && !node.isEnding ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="max-w-3xl mx-auto flex flex-col gap-1.5">
            {node.choices.map((choice, i) => (
              <button key={choice.id} onClick={(e) => { e.stopPropagation(); pick(choice.targetNodeId); }}
                className="group text-left w-full py-3 px-5 border border-white/[0.24] rounded hover:border-white/95 hover:bg-white/[0.26] transition-all duration-300"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] text-white/[0.26] font-mono tracking-wider group-hover:text-white transition-colors">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-white text-sm group-hover:text-white/95 transition-colors font-light">{choice.text}</span>
                  <div className="ml-auto w-0 group-hover:w-6 h-px bg-white/95 transition-all duration-500" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ending restart button */}
        {node.isEnding && done && !overlay && (
          <div className="px-6 md:px-10 pb-8 flex justify-center animate-ending-btn">
            <button onClick={(e) => { e.stopPropagation(); restart(); }}
              className="group flex items-center gap-3 px-8 py-3 border border-white/[0.26] rounded hover:border-white hover:bg-white/[0.26] transition-all">
              <RotateCcw size={13} className="text-white group-hover:text-white transition-colors" strokeWidth={1.5} />
              <span className="text-white/85 text-xs tracking-wider group-hover:text-white transition-colors font-mono">重新开始</span>
            </button>
          </div>
        )}
      </div>

      {/* Branch Tree Overlay */}
      {showTree && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 h-12 border-b border-white/[0.26]">
            <div className="flex items-center gap-3">
              <GitBranch size={12} className="text-white" strokeWidth={1.5} />
              <span className="text-white/95 text-[10px] font-mono tracking-wider">分支树</span>
            </div>
            <button onClick={() => setShowTree(false)} className="text-white/95 hover:text-white/95 text-[10px] font-mono">关闭</button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <BranchTree story={story} visitedNodes={prog.visitedNodes} unlockedEndings={prog.unlockedEndings}
              onNodeClick={(id) => { setNodeId(id); setShowTree(false); }} />
          </div>
          <div className="px-6 py-3 border-t border-white/[0.26] flex items-center justify-between">
            <div className="flex items-center gap-6 text-[9px] font-mono text-white/95">
              <span>节点: {prog.visitedNodes.length}/{story.nodes.length}</span>
              <span>结局: {prog.unlockedEndings.length}/{allEndings.length}</span>
            </div>
            {trueEndNode && !prog.hasUnlockedTrueEnding && (
              <div className="text-[9px] font-mono text-white">
                {allNormalUnlocked ? '真结局已解锁' : `解锁全部 ${normalEndings.length} 个结局开启真结局`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ending Overlay */}
      {overlay && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center" onClick={(e) => { e.stopPropagation(); setOverlay(false); }}>
          <div className="absolute inset-0 bg-black" />
          <div className="relative z-10 text-center max-w-sm px-8 animate-ending-enter">
            <div className="animate-stat-fade" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="text-[10px] tracking-[0.5em] text-white uppercase mb-6 font-mono">故事完成</div>
            </div>
            <div className="animate-stat-fade" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              <h2 className={`text-2xl md:text-3xl font-extralight tracking-[0.15em] mb-4 ${node.endingType === 'true' ? 'text-white' : 'text-white'}`}>
                {node.endingType === 'true' ? '真结局' : '结局'}
              </h2>
              <div className="w-10 h-px bg-white/95 mx-auto mb-10" />
            </div>
            <div className="grid grid-cols-3 gap-8 mb-10">
              <div className="animate-stat-fade" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
                <div className="text-2xl text-white font-extralight">{endStat.v}</div>
                <div className="text-[9px] text-white/95 font-mono tracking-widest mt-2">节点</div>
              </div>
              <div className="animate-stat-fade" style={{ animationDelay: '1.0s', animationFillMode: 'both' }}>
                <div className="text-2xl text-white font-extralight">{endStat.u}<span className="text-white/95 mx-1">/</span><span className="text-white/95">{endStat.e}</span></div>
                <div className="text-[9px] text-white/95 font-mono tracking-widest mt-2">结局</div>
              </div>
              <div className="animate-stat-fade" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                <div className="text-2xl text-white font-extralight">{Math.round((endStat.v / endStat.t) * 100)}<span className="text-base">%</span></div>
                <div className="text-[9px] text-white/95 font-mono tracking-widest mt-2">探索度</div>
              </div>
            </div>
            {trueEndNode && !prog.hasUnlockedTrueEnding && !allNormalUnlocked && (
              <div className="animate-stat-fade mb-8" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
                <div className="py-3 border border-white/[0.26] rounded-lg bg-white/[0.26]">
                  <div className="text-[10px] text-white/85 font-mono tracking-wide">
                    再解锁 {normalEndings.length - prog.unlockedEndings.length} 个结局即可开启真结局
                  </div>
                </div>
              </div>
            )}
            {prog.hasUnlockedTrueEnding && (
              <div className="animate-stat-fade mb-8" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
                <div className="py-3 border border-white/[0.26] rounded-lg bg-white/[0.26]">
                  <div className="text-[10px] text-white/85 font-mono tracking-wide">全部结局已解锁</div>
                </div>
              </div>
            )}
            <div className="animate-stat-fade flex gap-4 justify-center" style={{ animationDelay: '1.8s', animationFillMode: 'both' }}>
              <button onClick={(e) => { e.stopPropagation(); setOverlay(false); setShowTree(true); }}
                className="px-6 py-2.5 border border-white/[0.26] rounded-lg hover:border-white hover:bg-white/[0.26] transition-all text-white text-xs font-mono tracking-wider">
                分支树
              </button>
              <button onClick={(e) => { e.stopPropagation(); restart(); }}
                className="px-6 py-2.5 border border-white/[0.26] rounded-lg hover:border-white hover:bg-white/[0.26] transition-all text-white text-xs font-mono tracking-wider">
                重新开始
              </button>
            </div>
            <div className="mt-10 text-[9px] text-white/95 font-mono tracking-widest animate-pulse">按空格键或点击继续</div>
          </div>
        </div>
      )}

      {/* Skip hint */}
      {!done && !overlay && <div className="absolute bottom-28 right-6 text-white/[0.26] text-[9px] font-mono tracking-wider animate-pulse pointer-events-none z-30">点击跳过</div>}
    </div>
  );
}
