// ============================================================
// ExplorePage — Zen Gallery
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Heart, Eye
} from 'lucide-react';
import { publishedWorks } from '@/data/mockData';
import { sampleStorySchema } from '@/data/mockData';

type SortType = 'trending' | 'newest' | 'popular';
type GenreFilter = 'all' | 'mystery' | 'romance' | 'scifi' | 'horror' | 'fantasy';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('trending');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');
  const [displayCount, setDisplayCount] = useState(6);

  const genres = [
    { id: 'all' as GenreFilter, label: '全部' },
    { id: 'mystery' as GenreFilter, label: '悬疑' },
    { id: 'romance' as GenreFilter, label: '恋爱' },
    { id: 'scifi' as GenreFilter, label: '科幻' },
    { id: 'horror' as GenreFilter, label: '恐怖' },
    { id: 'fantasy' as GenreFilter, label: '奇幻' },
  ];

  const genreMap: Record<string, GenreFilter> = {
    'old-school-letter': 'mystery',
    'last-train': 'mystery',
    'ghost-dorm': 'horror',
    'time-cafe': 'romance',
    'sakura-promise': 'romance',
    'ai-dream': 'scifi',
  };

  const filteredWorks = publishedWorks.filter((work) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSearch = work.title.toLowerCase().includes(q) ||
        work.description.toLowerCase().includes(q) ||
        work.authorName?.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    if (genreFilter !== 'all') {
      const workGenre = genreMap[work.slug] || 'mystery';
      if (workGenre !== genreFilter) return false;
    }
    return true;
  });

  const sortedWorks = [...filteredWorks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.viewCount - a.viewCount;
      default:
        return b.likeCount - a.likeCount;
    }
  });

  const hasMore = sortedWorks.length > displayCount;
  const visibleWorks = sortedWorks.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-white text-[10px] font-mono tracking-[0.4em] uppercase mb-2">社区</p>
          <h1 className="text-2xl font-extralight text-white tracking-tight">作品广场</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-white" strokeWidth={1.5} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索..."
            className="w-full bg-transparent border-b border-white/[0.26] pl-6 pr-4 py-3 text-white text-sm placeholder-white/95 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* Genre Filter */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setGenreFilter(genre.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                genreFilter === genre.id
                  ? 'text-white bg-white/[0.26]'
                  : 'text-white/85 hover:text-white/85 hover:bg-white/[0.24]'
              }`}
            >
              {genre.label}
            </button>
          ))}
        </div>

        {/* Sort + Count */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.26]">
          <span className="text-white text-[10px] font-mono">{sortedWorks.length} 作品</span>
          <div className="flex items-center gap-0.5">
            {([
              { key: 'trending', label: '热门' },
              { key: 'newest', label: '最新' },
              { key: 'popular', label: '最多游玩' },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${
                  sortBy === opt.key
                    ? 'text-white bg-white/[0.26]'
                    : 'text-white/95 hover:text-white/95'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Works Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleWorks.map((work) => (
            <div
              key={work.id}
              onClick={() => navigate(`/play/${work.slug}`, { state: { story: sampleStorySchema } })}
              className="group border border-white/[0.26] rounded-2xl overflow-hidden hover:border-white/[0.24] transition-all cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={work.coverUrl || ''}
                  alt={work.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-[1.02] transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <h3 className="text-white font-light text-sm group-hover:text-white transition-colors">
                    {work.title}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-white text-xs leading-relaxed line-clamp-2 mb-3">{work.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.26]">
                  <span className="text-white/95 text-[10px]">{work.authorName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/95 text-[10px] font-mono flex items-center gap-1">
                      <Eye size={9} strokeWidth={1.5} />{work.viewCount}
                    </span>
                    <span className="text-white/95 text-[10px] font-mono flex items-center gap-1">
                      <Heart size={9} strokeWidth={1.5} />{work.likeCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 border border-white/[0.26] rounded-xl text-white/95 text-xs hover:bg-white/[0.24] hover:text-white/95 transition-colors"
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
