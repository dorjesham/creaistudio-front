# CreAI Studio Backend Development Guide

> Complete backend development documentation
> Stack: NestJS + Fastify | PostgreSQL + Prisma | Redis + BullMQ

---

## Table of Contents

- [1. Technology Stack and Architecture](#1-technology-stack-and-architecture)
  - [1.1 Stack Overview](#11-stack-overview)
  - [1.2 System Architecture](#12-system-architecture)
  - [1.3 Reference Open Source Projects](#13-reference-open-source-projects)
- [2. Development Environment Setup](#2-development-environment-setup)
  - [2.1 Prerequisites](#21-prerequisites)
  - [2.2 Project Initialization](#22-project-initialization)
  - [2.3 Docker Compose Configuration](#23-docker-compose-configuration)
- [3. Database Design (Prisma Schema)](#3-database-design-prisma-schema)
  - [3.1 Complete Schema Definition](#31-complete-schema-definition)
  - [3.2 Database Relations](#32-database-relations)
  - [3.3 Migration Commands](#33-migration-commands)
- [4. Project Structure](#4-project-structure)
  - [4.1 Directory Layout](#41-directory-layout)
  - [4.2 Module Design](#42-module-design)
- [5. Core Module Implementation](#5-core-module-implementation)
  - [5.1 Authentication Module](#51-authentication-module)
  - [5.2 Project Module](#52-project-module)
  - [5.3 Story Editing Module](#53-story-editing-module)
  - [5.4 AI Generation Module](#54-ai-generation-module)
  - [5.5 Asset Management Module](#55-asset-management-module)
  - [5.6 Works Gallery Module](#56-works-gallery-module)
  - [5.7 Play Progress and Achievements](#57-play-progress-and-achievements)
- [6. AI Service Integration](#6-ai-service-integration)
  - [6.1 Multi-Provider Abstraction](#61-multi-provider-abstraction)
  - [6.2 Story Generation Pipeline](#62-story-generation-pipeline)
  - [6.3 Image Generation](#63-image-generation)
  - [6.4 Task Queue with BullMQ](#64-task-queue-with-bullmq)
- [7. File Storage](#7-file-storage)
  - [7.1 OSS/S3 Configuration](#71-osss3-configuration)
  - [7.2 Upload Implementation](#72-upload-implementation)
- [8. API Documentation](#8-api-documentation)
- [9. Deployment](#9-deployment)
  - [9.1 Docker Configuration](#91-docker-configuration)
  - [9.2 Environment Variables](#92-environment-variables)
- [10. Testing Strategy](#10-testing-strategy)

---

## 1. Technology Stack and Architecture

### 1.1 Stack Overview

This document provides a complete backend development guide for CreAI Studio, an AI-powered interactive narrative creation platform. The backend is built on a modern, production-ready stack optimized for AI-intensive workloads, async task processing, and high-concurrency scenarios.

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 22 LTS | Server runtime environment |
| Framework | NestJS + Fastify adapter | 11.x | Enterprise TypeScript framework with DI, modular architecture |
| Language | TypeScript | 5.7+ | Type-safe development |
| Database | PostgreSQL | 17 | Primary relational database, JSON support for story data |
| ORM | Prisma | 6.x | Type-safe database client and migration management |
| Cache / Queue | Redis 7 + BullMQ | 7.x / 5.x | Session cache, rate limiting, AI task queue |
| Auth | JWT (access + refresh) | - | Stateless authentication with bcrypt password hashing |
| File Storage | Aliyun OSS / AWS S3 | - | Image, audio, video asset storage with CDN |
| AI Text | OpenAI GPT-4o / Claude 3.5 | - | Story generation, text rewrite, node expansion |
| AI Image | CogView-4 / DALL-E 3 | - | Character portraits, background scenes |
| AI Video | Kling V1 (Kling) | - | Background loop video generation |
| API Docs | Swagger / OpenAPI | - | Auto-generated API documentation (NestJS built-in) |
| Validation | Zod + class-validator | 3.x | Request validation and type coercion |
| Testing | Jest + Supertest | 29.x | Unit and E2E testing |
| Deploy | Docker + Docker Compose | - | Containerized development and production |

### 1.2 System Architecture

The system follows a layered monolithic architecture with clear module boundaries. Each module is independently testable and can be extracted into microservices in the future if needed.

```
+-------------------+     +-------------------+     +-------------------+
|   React Frontend  |<--->|  NestJS API (3000)|<--->|   PostgreSQL 17   |
|   (Vite + Zustand)|     |  + Fastify Adapter|     |   (Prisma ORM)    |
+-------------------+     +-------------------+     +-------------------+
                                |         |
                    +-----------+         +-----------+
                    |                               |
            +-------v-------+               +-------v-------+
            |  Redis 7      |               |  BullMQ       |
            |  - Sessions   |               |  - AI Tasks   |
            |  - Rate Limit |               |  - Progress   |
            |  - Cache      |               |  - Webhooks   |
            +---------------+               +---------------+
                                |
                    +-----------v-----------+
                    |   External Services   |
                    |  - OpenAI / Claude    |
                    |  - CogView / DALL-E   |
                    |  - Kling Video        |
                    |  - Aliyun OSS         |
                    +-----------------------+
```

### 1.3 Reference Open Source Projects

The following open source projects were studied and their patterns incorporated into this design:

| Project | Stars | Patterns Adopted |
|---------|-------|-----------------|
| saluki/nestjs-template | 2.8K | NestJS + Prisma + PostgreSQL project structure, JWT auth pattern, Swagger setup |
| solufyapp/nestjs-template | 1.2K | Fastify adapter configuration, Docker Compose setup, PNPM workspace, Biome linting |
| alexberce/openai-nestjs-template | 1.5K | OpenAI SDK integration pattern in NestJS, microservice module structure |
| theodo-fintech/nestjs-generative-ai | 800+ | Generative AI module pattern, async task handling, provider abstraction |
| OptimalBits/bullmq | 7.2K | AI workflow pipeline pattern, job progress reporting, FlowProducer for chained tasks |
| OpenWebGAL/WebGAL | 5.5K | Story schema JSON structure reference, visual novel data model design |
| nestjs/nest | 67K | Enterprise patterns: guards, interceptors, pipes, custom decorators, CQRS module |

---

## 2. Development Environment Setup

### 2.1 Prerequisites

1. Node.js 22 LTS (nvm recommended)
2. PostgreSQL 17 (via Docker or local install)
3. Redis 7 (via Docker)
4. pnpm 9+ (npm/yarn also supported)
5. Docker + Docker Compose (for containerized development)

### 2.2 Project Initialization

Create a new NestJS project using the CLI with Fastify adapter:

```bash
# Install NestJS CLI globally
npm i -g @nestjs/cli

# Create new project (choose pnpm when prompted)
nest new creai-backend --strict

# Install Fastify adapter (replaces Express)
cd creai-backend
pnpm install @nestjs/platform-fastify

# Core dependencies
pnpm install prisma @prisma/client bcrypt jsonwebtoken
pnpm install @types/bcrypt @types/jsonwebtoken -D

# AI service SDKs (multi-provider support)
pnpm install openai @anthropic-ai/sdk

# Queue and cache
pnpm install bullmq ioredis

# File upload and OSS
pnpm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm install ali-oss multer @types/multer

# Validation and utilities
pnpm install zod class-validator class-transformer
pnpm install nanoid slugify
pnpm install @nestjs/swagger @fastify/swagger

# Configure Prisma
npx prisma init
```

### 2.3 Docker Compose Configuration

Create docker-compose.yml for local development with all required services:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/creai?schema=public
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-jwt-secret-key
      - JWT_REFRESH_SECRET=your-refresh-secret
      - OSS_ACCESS_KEY=${OSS_ACCESS_KEY}
      - OSS_SECRET_KEY=${OSS_SECRET_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:17-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: creai
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redisdata:/data

  # Optional: BullMQ monitoring dashboard
  bullboard:
    image: deadly0/bull-board
    ports:
      - '3001:3000'
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379

volumes:
  pgdata:
  redisdata:
```

---

## 3. Database Design (Prisma Schema)

### 3.1 Complete Schema Definition

The Prisma schema defines all database tables with their relationships, indexes, and constraints. The story content is stored as JSONB for flexibility while maintaining referential integrity for users, projects, and metadata.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Users
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  username  String
  avatarUrl String?
  role      Role     @default(USER)
  credits   Int      @default(100)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  projects      Project[]
  progresses    PlayProgress[]
  achievements  UserAchievement[]
  creditLogs    CreditLog[]
  likedWorks    WorkLike[]
  refreshTokens RefreshToken[]

  @@index([email])
  @@map("users")
}

enum Role {
  USER
  ADMIN
}

// Credit consumption log
model CreditLog {
  id        String     @id @default(cuid())
  userId    String
  amount    Int        // negative for consumption
  balance   Int
  type      CreditType
  meta      Json?
  createdAt DateTime   @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
  @@map("credit_logs")
}

enum CreditType {
  STORY_GENERATE
  IMAGE_GENERATE
  VIDEO_GENERATE
  REWRITE
  TOPUP
  BONUS
}

// JWT Refresh Tokens
model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([token])
  @@map("refresh_tokens")
}

// Projects (Creator's workspace)
model Project {
  id          String        @id @default(cuid())
  userId      String
  title       String
  description String        @db.Text
  coverUrl    String?
  status      ProjectStatus @default(DRAFT)
  style       String        @default("visual_novel")
  language    String        @default("zh-CN")
  story       Json          // Complete StorySchema JSON
  slug        String?       @unique
  viewCount   Int           @default(0)
  likeCount   Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  assets   Asset[]
  comments Comment[]

  @@index([userId, updatedAt])
  @@index([slug])
  @@index([status, updatedAt])
  @@map("projects")
}

enum ProjectStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// Assets (images, audio, video)
model Asset {
  id           String      @id @default(cuid())
  projectId    String
  type         AssetType
  name         String
  url          String
  thumbnailUrl String?
  prompt       String?     @db.Text
  source       AssetSource
  fileSize     Int?
  mimeType     String?
  createdAt    DateTime    @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  @@index([projectId, type])
  @@map("assets")
}

enum AssetType {
  CHARACTER
  CHARACTER_EXPRESSION
  BACKGROUND
  MUSIC
  SFX
  COVER
  VIDEO
  UPLOAD
}

enum AssetSource {
  AI_GENERATED
  UPLOADED
}

// Play Progress (per user per story)
model PlayProgress {
  id                    String   @id @default(cuid())
  userId                String
  projectId             String
  visitedNodes          String[] @default([])
  unlockedEndings       String[] @default([])
  choiceHistory         Json[]   @default([])
  hasUnlockedTrueEnding Boolean  @default(false)
  playCount             Int      @default(0)
  totalPlayTime         Int      @default(0) // seconds
  lastVisitedNodeId     String?
  updatedAt             DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([userId])
  @@map("play_progress")
}

// Achievement definitions (seeded)
model Achievement {
  id          String @id
  title       String
  description String @db.Text
  icon        String
  condition   Json   // { type, value } e.g. { type: "play_count", value: 1 }

  userAchievements UserAchievement[]
  @@map("achievements")
}

// User's unlocked achievements
model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@map("user_achievements")
}

// Comments on published works
model Comment {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  content   String   @db.Text
  parentId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  @@index([projectId, createdAt])
  @@map("comments")
}

// Work likes (many-to-many with dedup)
model WorkLike {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([projectId, userId])
  @@index([projectId])
  @@map("work_likes")
}
```

### 3.2 Database Relations

Key design decisions:

1. **Story content stored as JSONB**: The complete StorySchema (nodes, characters, backgrounds, choices) is stored as a single JSON column in the Project table. This avoids complex multi-table joins for story data while keeping referential integrity for users and metadata.
2. **Assets reference projects**: All generated/uploaded assets belong to a project, enabling cascade deletion.
3. **Progress uses composite unique key**: `(userId + projectId)` ensures one progress record per user per story.
4. **Slug is unique and indexed**: Enables fast lookup for public work URLs (`/play/:slug`).

### 3.3 Migration Commands

```bash
# Generate migration after schema changes
npx prisma migrate dev --name init

# Deploy migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database with achievements and sample data
npx prisma db seed

# Studio (visual database browser)
npx prisma studio
```

---

## 4. Project Structure

### 4.1 Directory Layout

```
creai-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration files
│   └── seed.ts                # Seed data (achievements)
├── src/
│   ├── main.ts                # Entry point (Fastify adapter)
│   ├── app.module.ts          # Root module
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── ai.config.ts
│   │   └── storage.config.ts
│   ├── common/
│   │   ├── decorators/        # @CurrentUser, @Public, etc.
│   │   ├── filters/           # Global exception filter
│   │   ├── guards/            # JwtGuard, RolesGuard
│   │   ├── interceptors/      # Transform, Logging
│   │   └── pipes/             # ZodValidationPipe
│   ├── modules/
│   │   ├── auth/              # JWT + Refresh token auth
│   │   ├── users/             # User CRUD + profile
│   │   ├── projects/          # Project CRUD + publish
│   │   ├── stories/           # Story JSON save/load
│   │   ├── assets/            # File upload + AI generation
│   │   ├── ai/                # AI service abstraction
│   │   │   ├── providers/     # openai.provider.ts, claude.provider.ts
│   │   │   ├── tasks/         # BullMQ workers
│   │   │   └── ai.service.ts
│   │   ├── works/             # Gallery + search + likes
│   │   ├── progress/          # Play progress tracking
│   │   ├── achievements/      # Achievement system
│   │   └── comments/          # Comment system
│   └── shared/
│       ├── types/             # Shared TypeScript types
│       ├── utils/             # Slugify, nanoid helpers
│       └── constants.ts
├── test/
│   ├── unit/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

### 4.2 Module Design

Each module follows the NestJS convention of encapsulating its own controller, service, DTOs, and tests. Modules declare their dependencies explicitly via imports.

```typescript
// Example: projects.module.ts
@Module({
  imports: [
    PrismaModule,
    AuthModule,      // for JwtGuard
    AiModule,        // for AI generation tasks
    BullModule.registerQueue({ name: "asset-generation" }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService],
})
export class ProjectsModule {}
```

---

## 5. Core Module Implementation

### 5.1 Authentication Module

Authentication uses JWT with access tokens (short-lived, 15 min) and refresh tokens (long-lived, 7 days stored in PostgreSQL). Passwords are hashed with bcrypt (12 rounds).

```typescript
// auth.service.ts - Core methods
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException("Email already registered");

    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        username: dto.username,
        credits: 100, // Initial credits
      },
      select: { id: true, email: true, username: true, role: true, credits: true },
    });
    return this.generateTokens(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return this.generateTokens(user.id);
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get("JWT_SECRET"),
      expiresIn: "15m",
    });
    const refreshToken = randomBytes(40).toString("hex");

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    const rt = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!rt || rt.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }
    // Rotate: delete old, create new
    await this.prisma.refreshToken.delete({ where: { id: rt.id } });
    return this.generateTokens(rt.userId);
  }
}
```

### 5.2 Project Module

The Project module handles CRUD for creator projects, publishing, and slug generation.

```typescript
// projects.controller.ts
@Controller("projects")
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private service: ProjectsService) {}

  @Get()
  list(@CurrentUser("id") userId: string, @Query() q: ListQueryDto) {
    return this.service.findByUser(userId, q);
  }

  @Post()
  create(@CurrentUser("id") userId: string, @Body() dto: CreateProjectDto) {
    return this.service.create(userId, dto);
  }

  @Get(":id")
  get(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.service.findOne(userId, id);
  }

  @Put(":id")
  update(@CurrentUser("id") userId: string, @Param("id") id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(userId, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.service.remove(userId, id);
  }

  @Post(":id/publish")
  publish(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.service.publish(userId, id);
  }
}

// projects.service.ts - publish method
async publish(userId: string, projectId: string) {
  const project = await this.prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new NotFoundException();

  const slug = slugify(project.title, { lower: true, strict: true })
    + "-" + nanoid(6);

  return this.prisma.project.update({
    where: { id: projectId },
    data: { status: "PUBLISHED", slug },
    select: { id: true, slug: true, title: true, status: true },
  });
}
```

### 5.3 Story Editing Module

Story editing uses a single JSON column for the complete StorySchema. The frontend sends the entire story object; the backend validates it with Zod before saving.

```typescript
// stories.controller.ts
@Controller("projects/:projectId/story")
@UseGuards(JwtGuard)
export class StoriesController {
  @Put()
  save(
    @CurrentUser("id") userId: string,
    @Param("projectId") pid: string,
    @Body(new ZodValidationPipe(storySchema)) story: StorySchema,
  ) {
    return this.service.save(userId, pid, story);
  }
}

// stories.service.ts
async save(userId: string, projectId: string, story: StorySchema) {
  const project = await this.prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new NotFoundException();

  // Validate story structure (nodes are connected, has startNode, etc.)
  this.validateStoryIntegrity(story);

  return this.prisma.project.update({
    where: { id: projectId },
    data: { story: story as any, updatedAt: new Date() },
    select: { id: true, updatedAt: true },
  });
}

private validateStoryIntegrity(story: StorySchema) {
  // 1. All choice targets must point to existing nodes
  const nodeIds = new Set(story.nodes.map(n => n.id));
  for (const node of story.nodes) {
    for (const choice of node.choices) {
      if (!nodeIds.has(choice.targetNodeId)) {
        throw new BadRequestException(
          `Choice "${choice.text}" targets non-existent node "${choice.targetNodeId}"`
        );
      }
    }
  }
  // 2. startNodeId must exist
  if (!nodeIds.has(story.startNodeId)) {
    throw new BadRequestException("startNodeId does not reference any node");
  }
  // 3. At least one ending node
  const endings = story.nodes.filter(n => n.isEnding);
  if (endings.length === 0) {
    throw new BadRequestException("Story must have at least one ending node");
  }
}
```

### 5.4 AI Generation Module

The AI module is the core differentiator. It uses a provider pattern to support multiple AI services and BullMQ for async task processing with progress reporting.

```typescript
// ai.service.ts - Story generation
@Injectable()
export class AiService {
  constructor(
    private openai: OpenAIProvider,
    private claude: ClaudeProvider,
    private queue: AiGenerationQueue,
    private credits: CreditsService,
  ) {}

  async generateStory(userId: string, dto: GenerateStoryDto) {
    // Check credits
    const cost = this.calculateStoryCost(dto.nodeCount);
    await this.credits.deduct(userId, cost, "STORY_GENERATE");

    // Submit to BullMQ queue
    const job = await this.queue.add("generate-story", {
      userId,
      prompt: dto.prompt,
      style: dto.style,
      nodeCount: dto.nodeCount || 8,
      endingCount: dto.endingCount || 3,
      provider: dto.provider || "openai",
    });

    return { taskId: job.id, status: "queued", progress: 0 };
  }

  async generateImage(userId: string, dto: GenerateImageDto) {
    const cost = 10; // credits per image
    await this.credits.deduct(userId, cost, "IMAGE_GENERATE");

    const job = await this.queue.add("generate-image", {
      userId,
      prompt: dto.prompt,
      type: dto.type, // "character" | "background"
      style: dto.style,
      provider: dto.provider || "cogview",
    });

    return { taskId: job.id, status: "queued" };
  }

  async getTaskStatus(taskId: string) {
    const job = await this.queue.getJob(taskId);
    if (!job) throw new NotFoundException("Task not found");

    const state = await job.getState(); // "completed" | "failed" | "active" | "waiting"
    return {
      id: job.id,
      type: job.name,
      status: state,
      progress: job.progress || 0,
      output: job.returnvalue,
      message: job.failedReason,
      createdAt: job.timestamp,
    };
  }

  private calculateStoryCost(nodeCount: number): number {
    return Math.max(20, nodeCount * 3); // Base 20 + 3 per node
  }
}
```

### 5.5 Asset Management Module

Assets support both AI-generated and user-uploaded files. Files are stored in OSS/S3 with pre-signed URLs for direct browser upload/download.

```typescript
// assets.service.ts
@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private oss: OssService,
  ) {}

  // User uploads a file directly to backend
  async uploadFile(
    userId: string,
    projectId: string,
    file: MulterFile,
    dto: UploadAssetDto,
  ) {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) throw new NotFoundException();

    // Upload to OSS
    const key = `projects/${projectId}/${nanoid()}-${file.originalname}`;
    const url = await this.oss.put(key, file.buffer, file.mimetype);

    return this.prisma.asset.create({
      data: {
        projectId,
        type: dto.type,
        name: dto.name || file.originalname,
        url,
        source: "UPLOADED",
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });
  }

  // Generate pre-signed URL for direct browser upload
  async getPresignedUrl(userId: string, projectId: string, dto: PresignDto) {
    const key = `projects/${projectId}/${nanoid()}.${dto.ext}`;
    const { url, publicUrl } = await this.oss.presignPut(key, dto.mimeType);
    return { uploadUrl: url, publicUrl, key };
  }

  // After browser upload, register the asset
  async registerAsset(userId: string, projectId: string, dto: RegisterAssetDto) {
    return this.prisma.asset.create({
      data: {
        projectId,
        type: dto.type,
        name: dto.name,
        url: dto.url,
        source: dto.source,
      },
    });
  }
}
```

### 5.6 Works Gallery Module

The gallery displays published projects with search, filtering, sorting, and pagination. Views and likes are tracked for ranking algorithms.

```typescript
// works.service.ts
@Injectable()
export class WorksService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: WorksQueryDto) {
    const { sort = "trending", genre, q, page = 1, limit = 12 } = query;

    const where: Prisma.ProjectWhereInput = {
      status: "PUBLISHED",
      ...(genre && { style: genre }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy = this.getSortOrder(sort);

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, slug: true, title: true, description: true,
          coverUrl: true, style: true, viewCount: true, likeCount: true,
          createdAt: true, user: { select: { username: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      select: {
        id: true, slug: true, title: true, description: true,
        coverUrl: true, style: true, story: true,
        viewCount: true, likeCount: true, createdAt: true,
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
    if (!project || project.slug !== slug) throw new NotFoundException();
    return project;
  }

  async toggleLike(userId: string, projectId: string) {
    const existing = await this.prisma.workLike.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (existing) {
      await this.prisma.workLike.delete({ where: { id: existing.id } });
      await this.prisma.project.update({
        where: { id: projectId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      await this.prisma.workLike.create({ data: { projectId, userId } });
      await this.prisma.project.update({
        where: { id: projectId },
        data: { likeCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  private getSortOrder(sort: string): Prisma.ProjectOrderByWithRelationInput {
    switch (sort) {
      case "newest": return { createdAt: "desc" };
      case "popular": return { viewCount: "desc" };
      case "trending": return { likeCount: "desc" };
      default: return { createdAt: "desc" };
    }
  }
}
```

### 5.7 Play Progress and Achievements

Progress tracking records visited nodes, unlocked endings, and play statistics. Achievements are checked and awarded automatically based on progress events.

```typescript
// progress.service.ts
@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private achievements: AchievementsService,
  ) {}

  async recordVisit(userId: string, projectId: string, nodeId: string) {
    const progress = await this.prisma.playProgress.upsert({
      where: { userId_projectId: { userId, projectId } },
      create: {
        userId, projectId,
        visitedNodes: [nodeId],
        lastVisitedNodeId: nodeId,
        playCount: 1,
      },
      update: {
        visitedNodes: { push: nodeId },
        lastVisitedNodeId: nodeId,
      },
    });

    // Check visit-related achievements
    const newAchievements = await this.achievements.check(userId, [
      { type: "first_visit" },
      { type: "nodes_visited", value: progress.visitedNodes.length },
    ]);

    return { progress, achievements: newAchievements };
  }

  async recordEnding(userId: string, projectId: string, endingNodeId: string) {
    const progress = await this.prisma.playProgress.update({
      where: { userId_projectId: { userId, projectId } },
      data: {
        unlockedEndings: { push: endingNodeId },
        playCount: { increment: 1 },
      },
    });

    // Check if all normal endings are unlocked -> unlock true ending
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { story: true },
    });
    const story = project.story as any;
    const allEndings = story.nodes.filter((n: any) => n.isEnding && n.endingType !== "true");
    const allUnlocked = allEndings.every((e: any) =>
      progress.unlockedEndings.includes(e.id),
    );

    let trueEndingUnlocked = false;
    if (allUnlocked && !progress.hasUnlockedTrueEnding) {
      await this.prisma.playProgress.update({
        where: { userId_projectId: { userId, projectId } },
        data: { hasUnlockedTrueEnding: true },
      });
      trueEndingUnlocked = true;
    }

    // Check ending-related achievements
    const checks = [
      { type: "first_ending" },
      { type: "endings_unlocked", value: progress.unlockedEndings.length },
    ];
    if (trueEndingUnlocked) checks.push({ type: "true_ending" });

    const newAchievements = await this.achievements.check(userId, checks);

    return { progress, trueEndingUnlocked, achievements: newAchievements };
  }
}
```

---

## 6. AI Service Integration

### 6.1 Multi-Provider Abstraction

The AI layer uses a provider pattern to support multiple AI services without coupling to any single vendor. New providers can be added by implementing a simple interface.

```typescript
// ai/providers/ai-provider.interface.ts
export interface AiProvider {
  readonly name: string;

  generateStory(prompt: string, config: StoryConfig): Promise<StoryResult>;
  generateImage(prompt: string, config: ImageConfig): Promise<ImageResult>;
  generateVideo(prompt: string, config: VideoConfig): Promise<VideoResult>;
  rewrite(text: string, config: RewriteConfig): Promise<string>;
}

// ai/providers/openai.provider.ts
@Injectable()
export class OpenAIProvider implements AiProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(private config: ConfigService) {
    this.client = new OpenAI({ apiKey: config.get("OPENAI_API_KEY") });
  }

  async generateStory(prompt: string, config: StoryConfig): Promise<StoryResult> {
    const systemPrompt = `You are a story architect for interactive visual novels.
Create a complete branching story with ${config.nodeCount} nodes and ${config.endingCount} endings.
The story should be written in Chinese.

Respond with valid JSON in this exact format:
{
  "title": "Story Title",
  "summary": "Brief description",
  "characters": [...],
  "backgrounds": [...],
  "nodes": [...]
}

Each node must have: id, title, text, choices (with targetNodeId), isEnding.
The startNodeId must reference the first node.`;

    const completion = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 4000,
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content) as StoryResult;
  }

  async generateImage(prompt: string, config: ImageConfig): Promise<ImageResult> {
    const response = await this.client.images.generate({
      model: "dall-e-3",
      prompt: config.type === "character"
        ? `Character portrait for visual novel: ${prompt}. Style: anime, transparent background, full body.`
        : `Background scene for visual novel: ${prompt}. Style: atmospheric, 16:9 cinematic.`,
      size: config.type === "character" ? "1024x1024" : "1792x1024",
      quality: "standard",
      n: 1,
    });

    return {
      url: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt,
    };
  }

  async rewrite(text: string, config: RewriteConfig): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Rewrite the following text in a ${config.tone || "engaging"} style. Keep the same meaning but improve the prose.` },
        { role: "user", content: text },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    return completion.choices[0].message.content;
  }
}
```

### 6.2 Story Generation Pipeline

Story generation is the most complex AI task. It uses BullMQ with progress reporting so the frontend can show a real-time progress animation.

```typescript
// ai/tasks/story-generation.worker.ts
@Processor("ai-generation")
export class StoryGenerationWorker extends WorkerHost {
  constructor(
    private openai: OpenAIProvider,
    private claude: ClaudeProvider,
    private oss: OssService,
  ) {
    super();
  }

  @Process("generate-story")
  async handleStoryGeneration(job: Job<GenerateStoryJob>) {
    const { prompt, style, nodeCount, endingCount, provider } = job.data;
    const ai = provider === "claude" ? this.claude : this.openai;

    // Phase 1: Story outline (10%)
    await job.updateProgress(10);
    const story = await ai.generateStory(prompt, {
      nodeCount, endingCount, style,
    });

    // Phase 2: Generate character images (40-80%)
    await job.updateProgress(40);
    for (let i = 0; i < story.characters.length; i++) {
      const char = story.characters[i];
      const img = await ai.generateImage(
        `${char.name}: ${char.description}`,
        { type: "character", style },
      );
      char.avatarUrl = img.url;
      await job.updateProgress(40 + Math.floor((i + 1) / story.characters.length * 40));
    }

    // Phase 3: Generate background images (80-95%)
    await job.updateProgress(80);
    for (let i = 0; i < story.backgrounds.length; i++) {
      const bg = story.backgrounds[i];
      const img = await ai.generateImage(
        bg.description || bg.name,
        { type: "background", style },
      );
      bg.url = img.url;
      await job.updateProgress(80 + Math.floor((i + 1) / story.backgrounds.length * 15));
    }

    // Phase 4: Finalize (100%)
    await job.updateProgress(100);
    return { story };
  }

  @OnQueueEvent("completed")
  onCompleted(job: Job) {
    console.log(`Story generation completed: ${job.id}`);
  }

  @OnQueueEvent("failed")
  onFailed(job: Job, err: Error) {
    console.error(`Story generation failed: ${job.id}`, err.message);
    // Refund credits on failure
  }
}
```

### 6.3 Image Generation

Images are generated using provider-specific APIs. The service supports both CogView-4 (domestic) and DALL-E 3 (international) with automatic fallback.

```typescript
// ai/providers/cogview.provider.ts (Domestic - Zhipu AI)
@Injectable()
export class CogViewProvider implements AiProvider {
  readonly name = "cogview";

  constructor(private config: ConfigService) {}

  async generateImage(prompt: string, config: ImageConfig): Promise<ImageResult> {
    const apiKey = this.config.get("ZHIPU_API_KEY");
    const size = config.type === "character" ? "1024x1024" : "1440x768";

    const res = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "cogview-4",
        prompt,
        size,
        n: 1,
      }),
    });

    const data = await res.json();
    return { url: data.data[0].url };
  }
}
```

### 6.4 Task Queue with BullMQ

BullMQ manages all AI tasks asynchronously. The frontend polls task status via the `/ai/tasks/:taskId` endpoint.

```typescript
// ai/ai-queue.service.ts
@Injectable()
export class AiQueueService {
  constructor(
    @InjectQueue("ai-generation") private queue: Queue,
  ) {}

  async add(name: string, data: any, opts?: JobsOptions) {
    return this.queue.add(name, data, {
      attempts: 2,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
  }

  async getJob(id: string) {
    return this.queue.getJob(id);
  }
}

// app.module.ts - BullMQ registration
BullModule.forRoot({
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
}),
BullModule.registerQueue({ name: "ai-generation" }),
```

---

## 7. File Storage

### 7.1 OSS/S3 Configuration

Files are stored in Aliyun OSS (domestic) with CDN acceleration. The storage service abstracts the provider for future portability.

```typescript
// shared/services/oss.service.ts
@Injectable()
export class OssService {
  private client: OSS;

  constructor(private config: ConfigService) {
    this.client = new OSS({
      region: config.get("OSS_REGION"),
      accessKeyId: config.get("OSS_ACCESS_KEY"),
      accessKeySecret: config.get("OSS_SECRET_KEY"),
      bucket: config.get("OSS_BUCKET"),
      secure: true,
    });
  }

  async put(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.client.put(key, buffer, { mime: mimeType });
    return `https://${this.config.get("OSS_BUCKET")}.${this.config.get("OSS_REGION")}.aliyuncs.com/${key}`;
  }

  async presignPut(key: string, mimeType: string, expires = 600): Promise<{ url: string; publicUrl: string }> {
    const url = this.client.signatureUrl(key, {
      method: "PUT",
      expires,
      "Content-Type": mimeType,
    });
    const publicUrl = `https://${this.config.get("OSS_BUCKET")}.${this.config.get("OSS_REGION")}.aliyuncs.com/${key}`;
    return { url, publicUrl };
  }

  async delete(key: string): Promise<void> {
    await this.client.delete(key);
  }
}
```

### 7.2 Upload Implementation

Two upload modes are supported: server-side upload (small files) and pre-signed URL (large files, direct browser-to-OSS).

```typescript
// assets.controller.ts
@Controller("assets")
@UseGuards(JwtGuard)
export class AssetsController {
  constructor(private service: AssetsService) {}

  // Server-side upload
  @Post("upload")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @CurrentUser("id") userId: string,
    @UploadedFile() file: MulterFile,
    @Body() dto: UploadAssetDto,
  ) {
    return this.service.uploadFile(userId, dto.projectId, file, dto);
  }

  // Pre-signed URL for direct upload
  @Post("presign")
  presign(@CurrentUser("id") userId: string, @Body() dto: PresignDto) {
    return this.service.getPresignedUrl(userId, dto.projectId, dto);
  }

  // Register after direct upload
  @Post("register")
  register(@CurrentUser("id") userId: string, @Body() dto: RegisterAssetDto) {
    return this.service.registerAsset(userId, dto.projectId, dto);
  }
}
```

---

## 8. API Documentation

Swagger documentation is auto-generated from NestJS decorators. Access at `/api/docs` after starting the server.

```typescript
// main.ts - Swagger setup
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

const config = new DocumentBuilder()
  .setTitle("CreAI Studio API")
  .setDescription("AI Interactive Narrative Creation Platform")
  .setVersion("1.0.0")
  .addBearerAuth()
  .addTag("Auth", "Authentication")
  .addTag("Projects", "Project management")
  .addTag("Stories", "Story editing")
  .addTag("AI", "AI generation")
  .addTag("Assets", "File management")
  .addTag("Works", "Public gallery")
  .addTag("Progress", "Play progress")
  .addTag("Achievements", "Achievement system")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api/docs", app, document);
```

---

## 9. Deployment

### 9.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/main"]
```

### 9.2 Environment Variables

```env
# .env.example

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/creai?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Aliyun OSS
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=creai-assets
OSS_ACCESS_KEY=your-access-key
OSS_SECRET_KEY=your-secret-key
OSS_CDN_DOMAIN=https://cdn.creai.studio

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ZHIPU_API_KEY=...
KLING_API_KEY=...

# App
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1
CORS_ORIGIN=https://creai.studio
```

---

## 10. Testing Strategy

Testing follows the NestJS convention with Jest for unit tests and Supertest for E2E tests.

```typescript
// Unit test example: projects.service.spec.ts
describe("ProjectsService", () => {
  let service: ProjectsService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get(ProjectsService);
    prisma = module.get(PrismaService);
  });

  it("should create a project", async () => {
    prisma.project.create.mockResolvedValue({
      id: "1", title: "Test", description: "", userId: "u1",
      status: "DRAFT", createdAt: new Date(), updatedAt: new Date(),
    } as any);

    const result = await service.create("u1", { title: "Test", description: "" });
    expect(result.title).toBe("Test");
  });
});

// E2E test example: auth.e2e-spec.ts
describe("AuthController (e2e)", () => {
  it("/auth/register (POST)", () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: "test@example.com", password: "password123", username: "test" })
      .expect(201)
      .expect(res => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
      });
  });
});
```

Run tests:

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:cov
```

---

> This completes the CreAI Studio backend development guide. The modular architecture allows gradual development following the priority order defined in the API requirements document. Start with authentication and project management, then layer in AI generation and community features.
