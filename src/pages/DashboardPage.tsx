// ============================================================
// DashboardPage — Zen Creator Workbench
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit3, Trash2, MoreVertical,
  BookOpen, Zap, Award, Play
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, setCurrentProject, removeProject, publishProject } = useStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return;
    const { createProject } = useStore.getState();
    createProject(newProjectTitle, newProjectDesc, 'visual_novel');
    setShowNewProject(false);
    setNewProjectTitle('');
    setNewProjectDesc('');
    const { projects: updatedProjects } = useStore.getState();
    if (updatedProjects[0]) {
      setCurrentProject(updatedProjects[0]);
      navigate('/editor');
    }
  };

  const handleContinueEdit = (project: typeof projects[0]) => {
    setCurrentProject(project);
    navigate('/editor');
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('确定删除？此操作不可撤销。')) {
      removeProject(projectId);
    }
  };

  const handlePublishProject = (projectId: string) => {
    publishProject(projectId);
  };

  const stats = [
    { label: '项目', value: projects.length },
    { label: '已发布', value: projects.filter((p) => p.status === 'published').length },
    { label: '草稿', value: projects.filter((p) => p.status === 'draft').length },
  ];

  return (
    <div className="min-h-screen bg-black pt-20 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-extralight text-white tracking-tight">工作台</h1>
            <p className="text-white/95 text-xs mt-1">管理你的创作</p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-medium hover:bg-white transition-colors"
          >
            <Plus size={14} strokeWidth={1.5} />
            新建
          </button>
        </div>

        {/* Stats — minimal */}
        <div className="flex items-center gap-8 mb-12 pb-8 border-b border-white/[0.26]">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <span className="text-white text-lg font-extralight">{stat.value}</span>
              <span className="text-white/95 text-[10px] font-mono tracking-wider uppercase">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-3 mb-12">
          {[
            { title: 'AI 快速创作', desc: '一句话生成完整故事', icon: Zap, action: () => navigate('/create') },
            { title: '手动创建', desc: '从零开始编写剧情', icon: Edit3, action: () => setShowNewProject(true) },
            { title: '浏览灵感', desc: '从预设模板开始', icon: Award, action: () => navigate('/explore') },
          ].map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className="group text-left border border-white/[0.26] rounded-xl p-5 hover:border-white/[0.24] transition-colors"
            >
              <action.icon size={15} className="text-white mb-3 group-hover:text-white/85 transition-colors" strokeWidth={1.5} />
              <h3 className="text-white text-sm font-light mb-1">{action.title}</h3>
              <p className="text-white text-xs">{action.desc}</p>
            </button>
          ))}
        </div>

        {/* Project List */}
        <div>
          <h2 className="text-white text-[10px] font-mono tracking-[0.3em] uppercase mb-4">我的项目</h2>
          {projects.length === 0 ? (
            <div className="border border-white/[0.26] rounded-2xl p-12 text-center">
              <p className="text-white text-sm mb-4">还没有项目</p>
              <button
                onClick={() => setShowNewProject(true)}
                className="px-4 py-2 bg-white text-black rounded-lg text-xs font-medium"
              >
                创建第一个
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group border border-white/[0.26] rounded-xl p-4 hover:border-white/[0.26] transition-colors flex items-center gap-4"
                >
                  {/* Cover */}
                  <div className="w-12 h-12 rounded-lg bg-white/[0.24] overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/[0.26]">
                    {project.coverUrl ? (
                      <img src={project.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={16} className="text-white" strokeWidth={1} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-sm font-light truncate">{project.title}</h3>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border ${
                          project.status === 'published'
                            ? 'border-white/[0.26] text-white'
                            : 'border-white/[0.26] text-white'
                        }`}
                      >
                        {project.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/85 text-[10px] font-mono">{new Date(project.updatedAt).toLocaleDateString('zh-CN')}</span>
                      <span className="text-white/85 text-[10px] font-mono">{project.story.nodes.length} 节点</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleContinueEdit(project)}
                      className="px-3 py-1.5 border border-white/[0.26] text-white/95 rounded-lg text-xs hover:bg-white/[0.26] hover:text-white transition-colors"
                    >
                      编辑
                    </button>
                    {project.status === 'published' && (
                      <button
                        onClick={() => navigate(`/play/${project.id}`)}
                        className="px-3 py-1.5 border border-white/[0.26] text-white/95 rounded-lg text-xs hover:bg-white/[0.26] hover:text-white transition-colors"
                      >
                        <Play size={11} className="inline mr-1" strokeWidth={1.5} />
                        预览
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-7 h-7 flex items-center justify-center text-white hover:text-white/95 transition-colors">
                          <MoreVertical size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black border-white/[0.26]">
                        {project.status === 'draft' && (
                          <DropdownMenuItem
                            className="text-white/95 hover:text-white focus:bg-white/[0.26] text-xs"
                            onClick={() => handlePublishProject(project.id)}
                          >
                            <Zap size={11} className="mr-2" strokeWidth={1.5} /> 发布
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-white hover:text-red-400/70 focus:bg-white/[0.26] text-xs"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 size={11} className="mr-2" strokeWidth={1.5} /> 删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="bg-black border-white/[0.26] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-light tracking-wide">新建项目</DialogTitle>
            <DialogDescription className="text-white/95 text-xs">
              创建一个新的互动故事
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <label className="block text-white/95 text-[10px] font-mono tracking-widest uppercase mb-2">项目名称</label>
              <input
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="给你的故事起个名字"
                className="w-full bg-transparent border-b border-white/[0.26] pb-2 text-white text-sm placeholder-white/95 focus:outline-none focus:border-white/95 transition-colors"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>
            <div>
              <label className="block text-white/95 text-[10px] font-mono tracking-widest uppercase mb-2">描述</label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="简单描述..."
                className="w-full bg-transparent border-b border-white/[0.26] pb-2 text-white text-sm placeholder-white/95 focus:outline-none focus:border-white/95 transition-colors resize-none h-16"
              />
            </div>
            <button
              onClick={handleCreateProject}
              disabled={!newProjectTitle.trim()}
              className={`w-full py-2.5 rounded-lg text-xs font-medium transition-colors ${
                newProjectTitle.trim()
                  ? 'bg-white text-black hover:bg-white'
                  : 'bg-white/[0.26] text-white/95 cursor-not-allowed'
              }`}
            >
              创建
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
