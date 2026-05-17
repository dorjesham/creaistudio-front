// ============================================================
// EditorPage — Zen Three-Column Editor
// Left: AI Panel | Center: Node Editor | Right: Preview
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Save, Play,
  BookOpen, Users, MapPin, Sparkles, Send,
  ArrowLeft, RotateCcw
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { StoryNode, Choice } from '@/types';
import SciFiPlayer from '@/components/SciFiPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EditorPage() {
  const navigate = useNavigate();
  const {
    currentProject, updateProjectStory, saveProject,
    selectedNodeId, setSelectedNodeId, setPreviewNodeId
  } = useStore();

  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!currentProject) {
      navigate('/dashboard');
    }
  }, [currentProject, navigate]);

  if (!currentProject) return null;

  const story = currentProject.story;
  const selectedNode = story.nodes.find((n) => n.id === selectedNodeId) || story.nodes[0];

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setPreviewNodeId(nodeId);
  };

  const handleUpdateNode = (updates: Partial<StoryNode>) => {
    if (!selectedNode) return;
    const updatedNodes = story.nodes.map((n) =>
      n.id === selectedNode.id ? { ...n, ...updates } : n
    );
    updateProjectStory({ ...story, nodes: updatedNodes });
  };

  const handleAddChoice = () => {
    if (!selectedNode) return;
    const newChoice: Choice = {
      id: `choice_${Date.now()}`,
      text: '新选项',
      targetNodeId: '',
    };
    handleUpdateNode({ choices: [...selectedNode.choices, newChoice] });
  };

  const handleUpdateChoice = (choiceId: string, updates: Partial<Choice>) => {
    if (!selectedNode) return;
    const updatedChoices = selectedNode.choices.map((c) =>
      c.id === choiceId ? { ...c, ...updates } : c
    );
    handleUpdateNode({ choices: updatedChoices });
  };

  const handleDeleteChoice = (choiceId: string) => {
    if (!selectedNode) return;
    handleUpdateNode({
      choices: selectedNode.choices.filter((c) => c.id !== choiceId),
    });
  };

  const handleAddNode = () => {
    const newNode: StoryNode = {
      id: `node_${Date.now()}`,
      title: '新节点',
      text: '在这里输入剧情文本...',
      backgroundId: story.backgrounds[0]?.id || null,
      characters: [],
      choices: [],
      isEnding: false,
    };
    updateProjectStory({ ...story, nodes: [...story.nodes, newNode] });
    handleNodeSelect(newNode.id);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (story.nodes.length <= 1) return;
    const updated = story.nodes.filter((n) => n.id !== nodeId);
    updateProjectStory({ ...story, nodes: updated });
    if (selectedNodeId === nodeId) {
      handleNodeSelect(updated[0]?.id || '');
    }
  };

  const handleSimulateAI = () => {
    if (!aiInput.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setAiInput('');
    }, 2000);
  };

  return (
    <div className="h-screen bg-black flex flex-col pt-14">
      {/* Editor Top Bar */}
      <div className="h-11 bg-black/75 border-b border-white/[0.26] flex items-center justify-between px-4 flex-shrink-0 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white/95 hover:text-white/85 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-white/85 text-xs font-light tracking-wide">{currentProject.title}</span>
          </div>
          <span className="text-white/95 text-[10px] font-mono">{story.nodes.length} 节点</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveProject}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.26] text-white text-xs rounded-lg hover:bg-white/[0.24] hover:text-white/85 transition-colors"
          >
            <Save size={11} strokeWidth={1.5} />
            保存
          </button>
          <button
            onClick={() => navigate(`/play/${currentProject.id}`, { state: { story } })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-white transition-colors"
          >
            <Play size={11} strokeWidth={1.5} />
            预览
          </button>
        </div>
      </div>

      {/* Three-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* === LEFT: AI Panel === */}
        <div className="w-64 bg-black border-r border-white/[0.26] flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/[0.26]">
            <h3 className="text-white text-[10px] font-mono tracking-[0.3em] uppercase flex items-center gap-2">
              <Sparkles size={10} strokeWidth={1} />
              AI 助手
            </h3>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="mb-4">
              <label className="text-white text-[9px] font-mono tracking-wider mb-2 block">让 AI 帮你</label>
              <div className="relative">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="比如：帮我在当前节点后添加一个悬疑分支..."
                  className="w-full h-20 bg-white/[0.24] border border-white/[0.26] rounded-xl p-3 pr-9 text-white/85 text-xs placeholder-white/[0.26] resize-none focus:outline-none focus:border-white/95 transition-colors"
                />
                <button
                  onClick={handleSimulateAI}
                  disabled={!aiInput.trim() || isGenerating}
                  className={`absolute right-2 bottom-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                    aiInput.trim() && !isGenerating
                      ? 'bg-white text-black hover:bg-white'
                      : 'bg-white/[0.24] text-white/95'
                  }`}
                >
                  {isGenerating ? (
                    <RotateCcw size={10} className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Send size={10} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-white text-[9px] font-mono tracking-wider block mb-2">快捷</label>
              {[
                { label: '生成后续剧情', icon: BookOpen },
                { label: '生成新角色', icon: Users },
                { label: '生成场景背景', icon: MapPin },
                { label: '优化文案', icon: Sparkles },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => setAiInput(`请${action.label}...`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-white/95 text-xs hover:bg-white/[0.24] hover:text-white/95 transition-colors rounded-lg"
                >
                  <action.icon size={11} strokeWidth={1.5} />
                  {action.label}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* === CENTER: Node Editor === */}
        <div className="flex-1 flex flex-col min-w-0 bg-black">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <div className="border-b border-white/[0.26] px-4">
              <TabsList className="bg-transparent h-9">
                <TabsTrigger value="content" className="data-[state=active]:bg-white/[0.26] text-white/95 data-[state=active]:text-white text-[11px]">
                  内容
                </TabsTrigger>
                <TabsTrigger value="nodes" className="data-[state=active]:bg-white/[0.26] text-white/95 data-[state=active]:text-white text-[11px]">
                  节点 ({story.nodes.length})
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white/[0.26] text-white/95 data-[state=active]:text-white text-[11px]">
                  设置
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Tab */}
            <TabsContent value="content" className="flex-1 overflow-auto m-0">
              {selectedNode ? (
                <div className="max-w-xl mx-auto p-6 space-y-6">
                  <div>
                    <label className="text-white text-[9px] font-mono tracking-[0.3em] uppercase mb-2 block">节点标题</label>
                    <input
                      value={selectedNode.title}
                      onChange={(e) => handleUpdateNode({ title: e.target.value })}
                      className="w-full bg-transparent border-b border-white/[0.26] pb-2 text-white text-sm focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-white text-[9px] font-mono tracking-[0.3em] uppercase mb-2 block">剧情文本</label>
                    <textarea
                      value={selectedNode.text}
                      onChange={(e) => handleUpdateNode({ text: e.target.value })}
                      className="w-full h-36 bg-white/[0.26] border border-white/[0.26] rounded-xl p-4 text-white/85 text-sm leading-relaxed resize-none focus:outline-none focus:border-white/95 transition-colors"
                    />
                  </div>

                  {/* Background */}
                  <div>
                    <label className="text-white text-[9px] font-mono tracking-[0.3em] uppercase mb-2 block">背景</label>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleUpdateNode({ backgroundId: null })}
                        className={`w-14 h-9 rounded-lg border transition-all flex items-center justify-center text-[9px] ${
                          !selectedNode.backgroundId ? 'border-white/95 text-white/85' : 'border-white/[0.26] text-white hover:border-white/95'
                        }`}
                      >
                        无
                      </button>
                      {story.backgrounds.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => handleUpdateNode({ backgroundId: bg.id })}
                          className={`w-14 h-9 rounded-lg border overflow-hidden transition-all ${
                            selectedNode.backgroundId === bg.id ? 'border-white/85' : 'border-white/[0.26] hover:border-white/95'
                          }`}
                        >
                          {bg.url ? (
                            <img src={bg.url} alt="" className="w-full h-full object-cover opacity-50" />
                          ) : (
                            <div className="w-full h-full bg-white/[0.24] flex items-center justify-center">
                              <MapPin size={10} className="text-white/95" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Environment Sound */}
                  <div>
                    <label className="text-white text-[9px] font-mono tracking-[0.3em] uppercase mb-2 block">环境音效</label>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'none', label: '静音' },
                        { id: 'night', label: '深夜' },
                        { id: 'rain', label: '雨声' },
                        { id: 'wind', label: '风声' },
                        { id: 'fire', label: '烛火' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleUpdateNode({ envSound: s.id as NonNullable<StoryNode['envSound']> })}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] transition-all ${
                            (selectedNode.envSound || 'none') === s.id
                              ? 'bg-white/[0.24] border-white text-white'
                              : 'border-white/[0.26] text-white hover:border-white/95'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Characters */}
                  <div>
                    <label className="text-white text-[9px] font-mono tracking-[0.3em] uppercase mb-2 block">角色</label>
                    <div className="flex gap-2">
                      {story.characters.map((char) => {
                        const isActive = selectedNode.characters.some((c) => c.characterId === char.id);
                        return (
                          <button
                            key={char.id}
                            onClick={() => {
                              const chars = isActive
                                ? selectedNode.characters.filter((c) => c.characterId !== char.id)
                                : [...selectedNode.characters, { characterId: char.id, expression: 'normal', position: 'center' as const }];
                              handleUpdateNode({ characters: chars });
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                              isActive
                                ? 'bg-white/[0.26] border-white text-white/85'
                                : 'border-white/[0.26] text-white hover:border-white/95'
                            }`}
                          >
                            {char.avatarUrl && (
                              <img src={char.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover opacity-40" />
                            )}
                            <span>{char.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Choices */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white text-[9px] font-mono tracking-[0.3em] uppercase">选项</label>
                      {!selectedNode.isEnding && (
                        <button
                          onClick={handleAddChoice}
                          className="flex items-center gap-1 px-2 py-1 border border-white/[0.26] text-white/85 rounded-md text-[10px] hover:bg-white/[0.24] transition-colors"
                        >
                          <Plus size={10} strokeWidth={1.5} />
                          添加
                        </button>
                      )}
                    </div>

                    {selectedNode.isEnding ? (
                      <div className="py-6 text-center border border-white/[0.26] rounded-xl">
                        <span className="text-white text-xs">结局节点</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedNode.choices.map((choice, idx) => (
                          <div key={choice.id} className="flex items-center gap-2 bg-white/[0.26] border border-white/[0.26] rounded-xl p-3">
                            <span className="text-white/95 text-[9px] font-mono w-4">{idx + 1}</span>
                            <input
                              value={choice.text}
                              onChange={(e) => handleUpdateChoice(choice.id, { text: e.target.value })}
                              className="flex-1 bg-transparent text-white/85 text-sm focus:outline-none placeholder-white/90"
                              placeholder="选项文本"
                            />
                            <select
                              value={choice.targetNodeId}
                              onChange={(e) => handleUpdateChoice(choice.id, { targetNodeId: e.target.value })}
                              className="bg-black border border-white/[0.26] rounded-lg px-2 py-1 text-white/85 text-[10px] focus:outline-none"
                            >
                              <option value="">跳转</option>
                              {story.nodes.map((n) => (
                                <option key={n.id} value={n.id}>{n.title}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDeleteChoice(choice.id)}
                              className="text-white/8 hover:text-red-400/40 transition-colors"
                            >
                              <Trash2 size={12} strokeWidth={1} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Is Ending Toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNode.isEnding}
                      onChange={(e) => handleUpdateNode({ isEnding: e.target.checked })}
                      className="w-3.5 h-3.5 rounded border-white/95 bg-transparent text-white focus:ring-0"
                    />
                    <span className="text-white/85 text-xs">结局节点</span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/95 text-xs">
                  选择一个节点
                </div>
              )}
            </TabsContent>

            {/* Node List Tab */}
            <TabsContent value="nodes" className="flex-1 overflow-auto m-0 p-4">
              <div className="max-w-xl mx-auto space-y-1">
                {story.nodes.map((node, idx) => (
                  <div
                    key={node.id}
                    onClick={() => handleNodeSelect(node.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedNodeId === node.id
                        ? 'bg-white/[0.26] border border-white/[0.26]'
                        : 'border border-transparent hover:bg-white/[0.26] hover:border-white/[0.26]'
                    }`}
                  >
                    <span className={`text-[9px] font-mono w-5 flex-shrink-0 ${
                      node.isEnding ? 'text-white' : 'text-white/95'
                    }`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/95 text-xs truncate">{node.title}</div>
                    </div>
                    {node.isEnding && (
                      <span className="text-white/95 text-[9px] flex-shrink-0 font-mono">END</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                      className="text-white/[0.26] hover:text-white/95 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={11} strokeWidth={1} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddNode}
                  className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-white/[0.26] rounded-xl text-white/95 hover:text-white/85 transition-colors text-xs"
                >
                  <Plus size={13} strokeWidth={1.5} />
                  添加节点
                </button>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="flex-1 overflow-auto m-0 p-6">
              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="text-white text-[9px] font-mono tracking-[0.3em] uppercase mb-2 block">标题</label>
                  <input
                    value={story.title}
                    onChange={(e) => updateProjectStory({ ...story, title: e.target.value })}
                    className="w-full bg-transparent border-b border-white/[0.26] pb-2 text-white text-sm focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-white text-[9px] font-mono tracking-[0.3em] uppercase mb-2 block">简介</label>
                  <textarea
                    value={story.summary}
                    onChange={(e) => updateProjectStory({ ...story, summary: e.target.value })}
                    className="w-full h-16 bg-white/[0.26] border border-white/[0.26] rounded-xl p-3 text-white/95 text-sm resize-none focus:outline-none focus:border-white/95"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* === RIGHT: Preview === */}
        <div className="w-[400px] bg-black border-l border-white/[0.26] flex-shrink-0">
          <div className="h-8 flex items-center justify-between px-4 border-b border-white/[0.26]">
            <span className="text-white text-[9px] font-mono tracking-wider">预览</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-white/95 animate-pulse" />
              <span className="text-white/95 text-[9px] font-mono">同步</span>
            </div>
          </div>
          <div className="h-[calc(100%-32px)]">
            <SciFiPlayer story={story} storyId="editor-preview" />
          </div>
        </div>
      </div>
    </div>
  );
}
