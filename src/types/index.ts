// ============================================================
// CreAI Studio - Core Type Definitions
// ============================================================

export interface StoryNode {
  id: string;
  title: string;
  text: string;
  backgroundId: string | null;
  characters: NodeCharacter[];
  choices: Choice[];
  isEnding: boolean;
  endingType?: string | null;
  // Media assets
  bgVideoUrl?: string | null;
  bgmUrl?: string | null;
  sfxUrl?: string | null;
  voiceUrl?: string | null;
  voiceText?: string | null;
  envSound?: 'rain' | 'wind' | 'fire' | 'night' | 'none';
}

export interface NodeCharacter {
  characterId: string;
  expression: string;
  position: 'left' | 'center' | 'right';
}

export interface Choice {
  id: string;
  text: string;
  targetNodeId: string;
  conditions?: Condition[];
  effects?: Effect[];
}

export interface Condition {
  variableId: string;
  operator: '>=' | '<=' | '>' | '<' | '==' | '!=';
  value: number | string;
}

export interface Effect {
  variableId: string;
  operator: 'add' | 'sub' | 'set';
  value: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  defaultAssetId: string | null;
  expressions: Expression[];
  avatarUrl?: string;
}

export interface Expression {
  name: string;
  assetId: string | null;
  url?: string;
}

export interface Background {
  id: string;
  name: string;
  assetId: string | null;
  url?: string;
  description?: string;
}

export interface StoryVariable {
  id: string;
  name: string;
  type: 'number' | 'boolean' | 'string';
  defaultValue: number | boolean | string;
}

export interface StorySchema {
  schemaVersion: string;
  title: string;
  summary: string;
  startNodeId: string;
  style: string;
  characters: Character[];
  backgrounds: Background[];
  variables: StoryVariable[];
  nodes: StoryNode[];
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  coverUrl: string | null;
  status: 'draft' | 'published' | 'archived';
  style: string;
  language: string;
  story: StorySchema;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  projectId: string;
  type: 'character' | 'character_expression' | 'background' | 'music' | 'sfx' | 'cover' | 'upload';
  name: string;
  url: string;
  thumbnailUrl?: string;
  prompt?: string;
  metadata?: Record<string, unknown>;
  source: 'ai' | 'upload';
  createdAt: string;
}

export interface PublishedWork {
  id: string;
  projectId: string;
  userId: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string | null;
  status: 'published' | 'unpublished';
  viewCount: number;
  likeCount: number;
  createdAt: string;
  authorName?: string;
}

export interface PlaySession {
  id: string;
  workId: string;
  currentNodeId: string;
  history: string[];
  variables: Record<string, unknown>;
}

export interface PlayProgress {
  storyId: string;
  visitedNodes: string[];
  unlockedEndings: string[];
  choiceHistory: string[];
  hasUnlockedTrueEnding: boolean;
  playCount: number;
  totalPlayTime: number; // seconds
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AITask {
  id: string;
  type: 'story_generation' | 'character_generation' | 'background_generation';
  status: 'pending' | 'processing' | 'success' | 'failed';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  progress?: number;
  message?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: 'user' | 'admin';
  credits: number;
  createdAt: string;
}

export type EditorTab = 'story' | 'characters' | 'backgrounds' | 'assets';
export type ViewMode = 'desktop' | 'mobile';
