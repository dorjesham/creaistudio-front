// ============================================================
// AchievementPopup — Zen Toast
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { Award, Zap, Star, BookOpen, Map, Key, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

const iconMap: Record<string, React.ElementType> = {
  Play: Star,
  Zap: Zap,
  Award: Award,
  Map: Map,
  Key: Key,
  BookOpen: BookOpen,
};

export default function AchievementPopup() {
  const achievements = useStore((s) => s.achievements);
  const [visible, setVisible] = useState<string | null>(null);
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newlyUnlocked = achievements.find(
      (a) => a.unlocked && !shownRef.current.has(a.id)
    );
    if (!newlyUnlocked) return;

    shownRef.current.add(newlyUnlocked.id);
    const id = newlyUnlocked.id;
    queueMicrotask(() => {
      setVisible(id);
    });
    const t = setTimeout(() => setVisible(null), 4000);
    return () => clearTimeout(t);
  }, [achievements]);

  const achievement = achievements.find((a) => a.id === visible);
  if (!achievement) return null;

  const IconComp = iconMap[achievement.icon] || Award;

  return (
    <div className="fixed bottom-6 right-6 z-[70] animate-achievement-enter">
      <div className="bg-black border border-white/[0.26] rounded-xl p-4 shadow-2xl max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-white/[0.26] rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComp size={14} className="text-white/95" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] text-white font-mono tracking-[0.3em] mb-1">成就解锁</div>
            <div className="text-white/85 text-xs font-light mb-0.5">{achievement.title}</div>
            <div className="text-white text-[10px]">{achievement.description}</div>
          </div>
          <button onClick={() => setVisible(null)} className="text-white/[0.26] hover:text-white transition-colors flex-shrink-0">
            <X size={12} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
