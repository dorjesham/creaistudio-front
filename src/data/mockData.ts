// ============================================================
// CreAI Studio - Mock Data for MVP Demo
// ============================================================
import type { Project, PublishedWork, StorySchema, User } from '@/types';

export const mockUser: User = {
  id: 'user_001',
  email: 'creator@creai.studio',
  username: '故事创作者',
  avatarUrl: null,
  role: 'user',
  credits: 500,
  createdAt: '2026-01-15T08:00:00Z',
};

export const sampleStorySchema: StorySchema = {
  schemaVersion: '1.0',
  title: '旧教学楼的来信',
  summary: '高二女生林夏在深夜收到一封神秘短信，前往旧教学楼寻找真相。',
  startNodeId: 'start',
  style: 'visual_novel',
  characters: [
    {
      id: 'char_linxia',
      name: '林夏',
      description: '高二女生，短黑发，性格敏感但勇敢',
      defaultAssetId: 'asset_char_linxia_normal',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      expressions: [
        { name: 'normal', assetId: 'asset_char_linxia_normal', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop' },
        { name: 'surprised', assetId: 'asset_char_linxia_surprised', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop' },
        { name: 'sad', assetId: 'asset_char_linxia_sad', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop' },
      ],
    },
    {
      id: 'char_mysterious',
      name: '神秘人',
      description: '身份不明的神秘人物，总是出现在阴影中',
      defaultAssetId: 'asset_char_mysterious',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      expressions: [
        { name: 'normal', assetId: 'asset_char_mysterious', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' },
      ],
    },
  ],
  backgrounds: [
    { id: 'bg_room', name: '林夏的房间', assetId: 'asset_bg_room', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=800&fit=crop', description: '温馨的女高中生房间' },
    { id: 'bg_school_night', name: '旧教学楼', assetId: 'asset_bg_school_night', url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1200&h=800&fit=crop', description: '深夜的旧教学楼' },
    { id: 'bg_corridor', name: '走廊', assetId: 'asset_bg_corridor', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop', description: '昏暗的走廊' },
  ],
  variables: [
    { id: 'var_courage', name: '勇气', type: 'number', defaultValue: 0 },
    { id: 'var_trust', name: '信任', type: 'number', defaultValue: 0 },
  ],
  nodes: [
    {
      id: 'start',
      title: '神秘短信',
      text: '晚上十一点，你的手机突然亮起。\n\n一条陌生号码发来的短信：\n"如果想知道真相，就来旧教学楼三楼。——你知道我是谁。"\n\n你的心跳加速了。',
      backgroundId: 'bg_room',
      characters: [{ characterId: 'char_linxia', expression: 'normal', position: 'center' }],
      choices: [
        { id: 'c1_go', text: '穿上外套，前往旧教学楼', targetNodeId: 'school_gate' },
        { id: 'c1_ignore', text: '删掉短信，关灯睡觉', targetNodeId: 'ending_ignore' },
      ],
      isEnding: false,
      envSound: 'night',
    },
    {
      id: 'school_gate',
      title: '旧教学楼门口',
      text: '月光下，旧教学楼的铁门半开着，发出令人不安的吱呀声。\n\n你深吸一口气，推开了门。走廊尽头的灯光忽明忽暗。\n\n身后传来脚步声...',
      backgroundId: 'bg_school_night',
      characters: [{ characterId: 'char_linxia', expression: 'surprised', position: 'left' }],
      choices: [
        { id: 'c2_forward', text: '走向走廊尽头', targetNodeId: 'corridor' },
        { id: 'c2_look', text: '回头看谁在跟踪', targetNodeId: 'follower' },
      ],
      isEnding: false,
      envSound: 'wind',
    },
    {
      id: 'corridor',
      title: '三楼的走廊',
      text: '走廊尽头的教室门虚掩着，里面透出微弱的烛光。\n\n你走近，发现桌上放着一封已经拆开的信，上面写着你的名字。\n\n信的内容让你浑身冰冷...',
      backgroundId: 'bg_corridor',
      characters: [
        { characterId: 'char_linxia', expression: 'sad', position: 'left' },
        { characterId: 'char_mysterious', expression: 'normal', position: 'right' },
      ],
      choices: [
        { id: 'c3_read', text: '读完这封信', targetNodeId: 'ending_truth' },
        { id: 'c3_run', text: '转身逃跑', targetNodeId: 'ending_escape' },
      ],
      isEnding: false,
      envSound: 'fire',
    },
    {
      id: 'follower',
      title: '跟踪者',
      text: '你回头，却只看到一片漆黑。\n\n当你再次转身时，走廊尽头出现了一个身影——那个人影向你走来。\n\n"你终于来了，林夏。"一个熟悉又陌生的声音说。',
      backgroundId: 'bg_school_night',
      characters: [
        { characterId: 'char_linxia', expression: 'surprised', position: 'left' },
        { characterId: 'char_mysterious', expression: 'normal', position: 'right' },
      ],
      choices: [
        { id: 'c4_ask', text: '"你是谁？"', targetNodeId: 'ending_truth' },
      ],
      isEnding: false,
      envSound: 'wind',
    },
    {
      id: 'ending_ignore',
      title: '结局：假装什么都没发生',
      text: '你删除了短信，告诉自己这只是个恶作剧。\n\n但那个夜晚，你辗转反侧，总觉得错过了什么重要的东西。\n\n有些真相，一旦错过就再也找不回来了。\n\n【结局 1/3】',
      backgroundId: 'bg_room',
      characters: [{ characterId: 'char_linxia', expression: 'sad', position: 'center' }],
      choices: [],
      isEnding: true,
      endingType: 'normal',
      envSound: 'night',
    },
    {
      id: 'ending_truth',
      title: '结局：真相大白',
      text: '信是你失踪三年的姐姐写的。\n\n三年前那场"意外"并非偶然，她发现了一些不该发现的秘密。而现在，她需要你的帮助。\n\n烛光摇曳中，姐姐从阴影中走出，泪水滑落。\n\n"欢迎加入真相的一方，林夏。"\n\n【结局 2/3 - 真结局】',
      backgroundId: 'bg_corridor',
      characters: [
        { characterId: 'char_linxia', expression: 'surprised', position: 'left' },
        { characterId: 'char_mysterious', expression: 'normal', position: 'right' },
      ],
      choices: [],
      isEnding: true,
      endingType: 'true',
      envSound: 'fire',
    },
    {
      id: 'ending_escape',
      title: '结局：逃离',
      text: '恐惧战胜了好奇，你转身就跑。\n\n身后传来一声叹息："你太胆小了，林夏。"\n\n你冲出教学楼，大口喘气。但你心里清楚——从明天开始，一切都不同了。\n\n【结局 3/3】',
      backgroundId: 'bg_school_night',
      characters: [{ characterId: 'char_linxia', expression: 'sad', position: 'center' }],
      choices: [],
      isEnding: true,
      endingType: 'normal',
      envSound: 'wind',
    },
  ],
};

export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    userId: 'user_001',
    title: '旧教学楼的来信',
    description: '高二女生林夏在深夜收到一封神秘短信...',
    coverUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&h=400&fit=crop',
    status: 'published',
    style: 'visual_novel',
    language: 'zh-CN',
    story: sampleStorySchema,
    assets: [],
    createdAt: '2026-04-28T10:00:00Z',
    updatedAt: '2026-05-08T15:30:00Z',
  },
  {
    id: 'proj_002',
    userId: 'user_001',
    title: '星际拾荒者',
    description: '在废弃的空间站中寻找人类最后的希望...',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=400&fit=crop',
    status: 'draft',
    style: 'sci_fi',
    language: 'zh-CN',
    story: { schemaVersion: '1.0', title: '星际拾荒者', summary: '', startNodeId: 'start', style: 'sci_fi', characters: [], backgrounds: [], variables: [], nodes: [] },
    assets: [],
    createdAt: '2026-05-05T09:00:00Z',
    updatedAt: '2026-05-09T11:00:00Z',
  },
  {
    id: 'proj_003',
    userId: 'user_001',
    title: '咖啡馆的猫',
    description: '一个关于时间和遗忘的温暖故事...',
    coverUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop',
    status: 'draft',
    style: 'slice_of_life',
    language: 'zh-CN',
    story: { schemaVersion: '1.0', title: '咖啡馆的猫', summary: '', startNodeId: 'start', style: 'slice_of_life', characters: [], backgrounds: [], variables: [], nodes: [] },
    assets: [],
    createdAt: '2026-05-08T14:00:00Z',
    updatedAt: '2026-05-09T10:00:00Z',
  },
];

export const publishedWorks: PublishedWork[] = [
  { id: 'work_001', projectId: 'proj_001', userId: 'user_001', slug: 'old-school-letter', title: '旧教学楼的来信', description: '高二女生林夏在深夜收到一封神秘短信，前往旧教学楼寻找真相。', coverUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&h=400&fit=crop', status: 'published', viewCount: 3428, likeCount: 256, createdAt: '2026-05-01T10:00:00Z', authorName: '故事创作者' },
  { id: 'work_002', projectId: 'proj_004', userId: 'user_002', slug: 'time-cafe', title: '时光咖啡馆', description: '一家只在午夜营业的咖啡馆，每杯咖啡都能让你回到过去的一个瞬间。', coverUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop', status: 'published', viewCount: 8912, likeCount: 743, createdAt: '2026-04-20T08:00:00Z', authorName: '夜猫子写手' },
  { id: 'work_003', projectId: 'proj_005', userId: 'user_003', slug: 'last-train', title: '末班地铁', description: '错过末班车后，我发现这座城市在午夜后会变成另一个样子...', coverUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop', status: 'published', viewCount: 5621, likeCount: 489, createdAt: '2026-04-25T15:00:00Z', authorName: '城市漫步者' },
  { id: 'work_004', projectId: 'proj_006', userId: 'user_004', slug: 'ai-dream', title: 'AI之梦', description: '当人工智能开始做梦，它梦到的会是什么？一段探索意识边界的科幻旅程。', coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop', status: 'published', viewCount: 12034, likeCount: 1021, createdAt: '2026-05-05T12:00:00Z', authorName: '科幻迷' },
  { id: 'work_005', projectId: 'proj_007', userId: 'user_005', slug: 'sakura-promise', title: '樱花树下的约定', description: '每年樱花盛开时，我都会来到这棵树下，等待一个可能不会来的人。', coverUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&h=400&fit=crop', status: 'published', viewCount: 7891, likeCount: 654, createdAt: '2026-04-28T09:00:00Z', authorName: '樱花诗人' },
  { id: 'work_006', projectId: 'proj_008', userId: 'user_006', slug: 'ghost-dorm', title: '404号宿舍', description: '新生入学第一天，我被分配到了一栋据说"不存在"的宿舍楼...', coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop', status: 'published', viewCount: 15432, likeCount: 1321, createdAt: '2026-05-08T18:00:00Z', authorName: '恐怖故事爱好者' },
];

export const genrePresets = [
  { label: '校园悬疑', prompt: '校园悬疑互动故事，主角是高二女生林夏，故事发生在深夜的旧教学楼，需要8个剧情节点，3个结局', icon: 'School' },
  { label: '科幻冒险', prompt: '科幻冒险互动故事，主角是星际拾荒者，在废弃的空间站中寻找人类最后的希望，需要10个剧情节点，3个结局', icon: 'Rocket' },
  { label: '恋爱物语', prompt: '恋爱互动故事，主角是大学新生，在咖啡馆邂逅了一个神秘的人，需要8个剧情节点，2个结局', icon: 'Heart' },
  { label: '恐怖惊悚', prompt: '恐怖互动故事，主角搬入新家后发现房子里藏着可怕的秘密，需要8个剧情节点，3个结局', icon: 'Ghost' },
  { label: '武侠江湖', prompt: '武侠互动故事，主角是初出茅庐的少年侠客，卷入一场江湖恩怨，需要10个剧情节点，3个结局', icon: 'Sword' },
  { label: '职场逆袭', prompt: '职场逆袭互动故事，主角是刚入职的新人，在公司中发现了一个惊天秘密，需要8个剧情节点，2个结局', icon: 'Briefcase' },
];
