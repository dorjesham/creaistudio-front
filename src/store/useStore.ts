// ============================================================
// CreAI Studio - Zustand Global Store v2
// With Play Progress Tracking & Achievements
// ============================================================
import { create } from 'zustand';
import type {
  Project, PublishedWork, StorySchema, AITask, User,
  EditorTab, PlayProgress, Achievement,
} from '@/types';
import { mockUser, mockProjects } from '@/data/mockData';

interface AppState {
  // User
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  setUser: (user: User | null) => void;

  // Projects
  projects: Project[];
  currentProject: Project | null;
  createProject: (title: string, description: string, style: string) => void;
  setCurrentProject: (project: Project | null) => void;
  updateProjectStory: (story: StorySchema) => void;
  saveProject: () => void;
  removeProject: (projectId: string) => void;
  publishProject: (projectId: string) => void;

  // Editor
  editorTab: EditorTab;
  setEditorTab: (tab: EditorTab) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  previewNodeId: string | null;
  setPreviewNodeId: (id: string | null) => void;

  // AI Tasks
  tasks: AITask[];
  addTask: (task: AITask) => void;
  updateTask: (taskId: string, updates: Partial<AITask>) => void;

  // Player - Progress Tracking
  playProgress: Record<string, PlayProgress>;
  achievements: Achievement[];
  visitNode: (storyId: string, nodeId: string) => void;
  unlockEnding: (storyId: string, endingNodeId: string) => boolean;
  checkTrueEnding: (storyId: string) => boolean;
  getProgress: (storyId: string) => PlayProgress;
  resetProgress: (storyId: string) => void;

  // Explore
  publishedWorks: PublishedWork[];
  setPublishedWorks: (works: PublishedWork[]) => void;
}

const defaultAchievements: Achievement[] = [
  { id: 'first_play', title: '初次体验', description: '完成第一个故事的游玩', icon: 'Play', unlocked: false },
  { id: 'speed_runner', title: '速通者', description: '5分钟内完成一个故事', icon: 'Zap', unlocked: false },
  { id: 'completionist', title: '完美主义者', description: '解锁一个故事的所有结局', icon: 'Award', unlocked: false },
  { id: 'explorer', title: '探索者', description: '访问所有节点', icon: 'Map', unlocked: false },
  { id: 'true_end', title: '真相追寻者', description: '解锁第一个真结局', icon: 'Key', unlocked: false },
  { id: 'three_stories', title: '故事收集者', description: '完成3个不同的故事', icon: 'BookOpen', unlocked: false },
];

export const useStore = create<AppState>((set, get) => ({
  // User
  user: mockUser,
  isLoggedIn: true,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false, user: null }),
  setUser: (user) => set({ user }),

  // Projects
  projects: mockProjects,
  currentProject: null,
  createProject: (title, description, style) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      userId: get().user?.id || 'guest',
      title,
      description,
      coverUrl: null,
      status: 'draft',
      style,
      language: 'zh-CN',
      story: {
        schemaVersion: '1.0',
        title,
        summary: description,
        startNodeId: 'start',
        style,
        characters: [],
        backgrounds: [],
        variables: [],
        nodes: [],
      },
      assets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({
      projects: [newProject, ...s.projects],
      currentProject: newProject,
    }));
  },
  setCurrentProject: (project) => {
    set({ currentProject: project });
    if (project) {
      set({
        selectedNodeId: project.story.nodes.length > 0 ? project.story.nodes[0].id : null,
        previewNodeId: project.story.startNodeId,
      });
    }
  },
  updateProjectStory: (story) => {
    set((s) => {
      if (!s.currentProject) return s;
      const updated = { ...s.currentProject, story, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: s.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    });
  },
  saveProject: () => {
    const { currentProject } = get();
    if (!currentProject) return;
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === currentProject.id ? { ...currentProject, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  removeProject: (projectId) => {
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== projectId),
      currentProject: s.currentProject?.id === projectId ? null : s.currentProject,
    }));
  },

  publishProject: (projectId) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, status: 'published' as const, updatedAt: new Date().toISOString() } : p
      ),
      currentProject: s.currentProject?.id === projectId
        ? { ...s.currentProject, status: 'published' as const }
        : s.currentProject,
    }));
  },

  // Editor
  editorTab: 'story',
  setEditorTab: (tab) => set({ editorTab: tab }),
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  previewNodeId: null,
  setPreviewNodeId: (id) => set({ previewNodeId: id }),

  // AI Tasks
  tasks: [],
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (taskId, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    })),

  // Player Progress
  playProgress: {},
  achievements: [...defaultAchievements],

  visitNode: (storyId, nodeId) => {
    set((s) => {
      const progress = s.playProgress[storyId] || {
        storyId,
        visitedNodes: [],
        unlockedEndings: [],
        choiceHistory: [],
        hasUnlockedTrueEnding: false,
        playCount: 0,
        totalPlayTime: 0,
      };
      if (!progress.visitedNodes.includes(nodeId)) {
        progress.visitedNodes = [...progress.visitedNodes, nodeId];
      }
      return {
        playProgress: { ...s.playProgress, [storyId]: progress },
      };
    });
  },

  unlockEnding: (storyId, endingNodeId) => {
    let newlyUnlocked = false;
    set((s) => {
      const progress = s.playProgress[storyId] || {
        storyId,
        visitedNodes: [],
        unlockedEndings: [],
        choiceHistory: [],
        hasUnlockedTrueEnding: false,
        playCount: 0,
        totalPlayTime: 0,
      };
      if (!progress.unlockedEndings.includes(endingNodeId)) {
        progress.unlockedEndings = [...progress.unlockedEndings, endingNodeId];
        newlyUnlocked = true;
      }
      progress.playCount += 1;
      return {
        playProgress: { ...s.playProgress, [storyId]: progress },
      };
    });
    return newlyUnlocked;
  },

  checkTrueEnding: (storyId) => {
    const state = get();
    const progress = state.playProgress[storyId];
    if (!progress) return false;

    // Find the story to get ending nodes
    // For now, return based on progress
    const story = state.projects.find((p) => p.id === storyId)?.story;
    if (!story) return false;

    const normalEndings = story.nodes.filter((n) => n.isEnding && n.endingType !== 'true');
    const allNormalUnlocked = normalEndings.every((n) => progress.unlockedEndings.includes(n.id));

    if (allNormalUnlocked && !progress.hasUnlockedTrueEnding) {
      set((s) => ({
        playProgress: {
          ...s.playProgress,
          [storyId]: { ...s.playProgress[storyId], hasUnlockedTrueEnding: true },
        },
        achievements: s.achievements.map((a) =>
          a.id === 'true_end' ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
        ),
      }));
      return true;
    }
    return false;
  },

  getProgress: (storyId) => {
    return get().playProgress[storyId] || {
      storyId,
      visitedNodes: [],
      unlockedEndings: [],
      choiceHistory: [],
      hasUnlockedTrueEnding: false,
      playCount: 0,
      totalPlayTime: 0,
    };
  },

  resetProgress: (storyId) => {
    set((s) => {
      const next = { ...s.playProgress };
      delete next[storyId];
      return { playProgress: next };
    });
  },

  // Explore
  publishedWorks: [],
  setPublishedWorks: (works) => set({ publishedWorks: works }),
}));
