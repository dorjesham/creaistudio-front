// ============================================================
// PlayerPage — Minimal Shell
// ============================================================
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import type { Character, StorySchema } from '@/types';
import { sampleStorySchema, publishedWorks } from '@/data/mockData';
import SciFiPlayer from '@/components/SciFiPlayer';

type PlayerLocationState = { story?: StorySchema };

export default function PlayerPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const story =
    (location.state as PlayerLocationState | null | undefined)?.story ??
    sampleStorySchema;
  const workInfo = publishedWorks.find((w) => w.slug === slug);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <SciFiPlayer story={story} onBack={() => navigate('/explore')} />

      {/* Side Panel — desktop only, extremely minimal */}
      <div className="hidden xl:block absolute right-6 top-16 bottom-8 w-44 z-40 pointer-events-none">
        <div className="h-full flex flex-col justify-between">
          {workInfo && (
            <div className="pointer-events-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[9px] font-mono tracking-wider">
                  <span className="text-white/[0.26]">VIEWS</span>
                  <span className="text-white/85">{workInfo.viewCount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/[0.24]" />
                <div className="flex items-center justify-between text-[9px] font-mono tracking-wider">
                  <span className="text-white/[0.26]">LIKES</span>
                  <span className="text-white/85">{workInfo.likeCount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/[0.24]" />
                <div className="flex items-center justify-between text-[9px] font-mono tracking-wider">
                  <span className="text-white/[0.26]">AUTHOR</span>
                  <span className="text-white/85">{workInfo.authorName}</span>
                </div>
              </div>

              {story.characters.length > 0 && (
                <div className="mt-8">
                  <div className="text-[9px] text-white/[0.26] tracking-[0.4em] mb-3 font-mono">CAST</div>
                  <div className="space-y-2">
                    {story.characters.map((char: Character) => (
                      <div key={char.id} className="flex items-center gap-2">
                        {char.avatarUrl && (
                          <img src={char.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover opacity-25" />
                        )}
                        <span className="text-white text-[9px] font-mono">{char.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pointer-events-auto">
            <div className="text-[9px] text-white/[0.26] tracking-[0.4em] mb-3 font-mono">MORE</div>
            <div className="space-y-1.5">
              {publishedWorks.filter((w) => w.slug !== slug).slice(0, 3).map((work) => (
                <div
                  key={work.id}
                  onClick={() => navigate(`/play/${work.slug}`, { state: { story: sampleStorySchema } })}
                  className="group flex items-center gap-2 cursor-pointer"
                >
                  {work.coverUrl && (
                    <img src={work.coverUrl} alt="" className="w-5 h-3.5 rounded-sm object-cover opacity-10 group-hover:opacity-25 transition-opacity" />
                  )}
                  <span className="text-white/[0.26] text-[9px] group-hover:text-white/95 transition-colors truncate">{work.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
