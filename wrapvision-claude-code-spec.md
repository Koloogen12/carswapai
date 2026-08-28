# WrapVision — Claude Code Agent Specification

Передай этот документ агенту Claude Code как системный промпт / первое сообщение.
Lovable сгенерирует фронтенд. Claude Code строит бэкенд и интегрирует всё вместе.

---

## ЗАДАЧА АГЕНТА

Ты строишь бэкенд для WrapVision — SaaS для AI-визуализации оклейки автомобилей.

Фронтенд уже сгенерирован в Lovable (React + Tailwind, отдельный репо или папка `/client`).
Твоя задача: создать **Next.js API backend** с Supabase и Replicate, задеплоить на Vercel.

**Результат, который должен работать:**
1. Пользователь регистрируется → подтверждает email → входит
2. Загружает фото → выбирает цвет → API вызывает Replicate → возвращает результат
3. Результат сохраняется в историю, доступен для повторного просмотра и шаринга

---

## ТЕХНИЧЕСКИЙ СТЕК

```
Runtime:        Node.js 20
Framework:      Next.js 14 (App Router)
Database:       Supabase (PostgreSQL)
Auth:           Supabase Auth (email/password + magic link)
File Storage:   Supabase Storage (S3-compatible)
AI Generation:  Replicate API
Image Processing: Sharp (Node.js)
Deployment:     Vercel
Env management: .env.local (local) + Vercel env vars (production)
```

---

## СТРУКТУРА ПРОЕКТА

```
/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── wraps/
│   │   │   ├── generate/route.ts       ← главный endpoint
│   │   │   ├── route.ts                ← GET history
│   │   │   └── [id]/route.ts           ← GET/DELETE single wrap
│   │   ├── user/
│   │   │   └── profile/route.ts        ← GET/PATCH profile
│   │   └── upload/route.ts             ← presigned URL для загрузки фото
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts                   ← createServerClient()
│   │   └── client.ts                   ← createBrowserClient()
│   ├── replicate.ts                    ← Replicate клиент + generateWrap()
│   ├── image.ts                        ← Sharp: resize, compress, compose
│   └── auth.ts                         ← getSession(), requireAuth() middleware
├── types/
│   └── index.ts                        ← WrapResult, User, Color interfaces
├── middleware.ts                        ← auth guard для API routes
└── supabase/
    ├── migrations/
    │   └── 001_initial.sql
    └── seed.sql                        ← 50 цветов
```

---

## ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

Создай `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # только server-side

# Replicate
REPLICATE_API_TOKEN=r8_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## БАЗА ДАННЫХ — SUPABASE SCHEMA

### Миграция 001_initial.sql

```sql
-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- PROFILES (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  company_name text not null,
  phone text,
  city text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  visualizations_used_month integer not null default 0,
  plan_reset_date date not null default (date_trunc('month', now()) + interval '1 month')::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- COLORS CATALOG
create table public.colors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sku text not null,
  hex text not null,
  category text not null check (category in ('grey','black','white','blue','red','green','other')),
  finish text not null check (finish in ('gloss','matte','satin','metallic','special')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- WRAPS (visualizations)
create table public.wraps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  color_id uuid references public.colors(id) not null,
  -- Storage paths (не публичные URL — генерируем signed URLs)
  original_photo_path text not null,   -- storage: wraps/{user_id}/{wrap_id}/original.jpg
  result_photo_path text,              -- storage: wraps/{user_id}/{wrap_id}/result.jpg
  share_image_path text,               -- storage: wraps/{user_id}/{wrap_id}/share.jpg
  -- Generation metadata
  status text not null default 'pending' check (status in ('pending','processing','done','failed')),
  replicate_prediction_id text,        -- для polling
  generation_duration_ms integer,
  error_message text,
  -- Share
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  -- Timestamps
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- INDEXES
create index wraps_user_id_idx on public.wraps(user_id);
create index wraps_status_idx on public.wraps(status);
create index wraps_share_token_idx on public.wraps(share_token);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.colors enable row level security;
alter table public.wraps enable row level security;

-- Profiles: user sees only their own
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- Colors: readable by all authenticated users
create policy "colors_read" on public.colors
  for select using (auth.role() = 'authenticated');

-- Wraps: user sees only their own
create policy "wraps_own" on public.wraps
  for all using (auth.uid() = user_id);

-- Auto-update profiles.updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure update_updated_at();

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, company_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'company_name', 'Мой центр'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### Seed — 50 цветов (seed.sql)
```sql
INSERT INTO public.colors (name, sku, hex, category, finish, sort_order) VALUES
-- СЕРЫЕ
('Nardo Grey', 'KPMF K75465', '#6B6B6B', 'grey', 'matte', 1),
('Cement Grey', 'KPMF K88021', '#8C8C8C', 'grey', 'matte', 2),
('Space Grey', 'HX 30502', '#5A5A5A', 'grey', 'gloss', 3),
('Storm Grey', 'TW SG-441', '#9E9E9E', 'grey', 'satin', 4),
('Steel Grey', 'OR 793', '#7A7A7A', 'grey', 'gloss', 5),
('Graphite', 'KPMF K88044', '#4A4A4A', 'grey', 'gloss', 6),
('Gunmetal', 'HX 30677', '#3D3D3D', 'grey', 'metallic', 7),
('Battleship', 'TW BG-102', '#828282', 'grey', 'matte', 8),
('Ash Grey', 'OR 732', '#B0B0B0', 'grey', 'matte', 9),
('Granite', 'KPMF K75123', '#696969', 'grey', 'satin', 10),
-- ЧЁРНЫЕ
('Piano Black', 'KPMF K88001', '#0A0A0A', 'black', 'gloss', 11),
('Matte Black', 'KPMF K88002', '#1A1A1A', 'black', 'matte', 12),
('Metallic Black', 'HX 30500', '#1C1C1C', 'black', 'metallic', 13),
('Satin Black', 'TW SB-101', '#222222', 'black', 'satin', 14),
('Carbon Black', 'OR 970', '#0F0F0F', 'black', 'gloss', 15),
-- БЕЛЫЕ
('Gloss White', 'KPMF K88010', '#F5F5F5', 'white', 'gloss', 16),
('Matte White', 'KPMF K88011', '#EFEFEF', 'white', 'matte', 17),
('Pearl White', 'HX 30100', '#F8F8FF', 'white', 'metallic', 18),
('Satin White', 'TW SW-201', '#F0F0F0', 'white', 'satin', 19),
-- СИНИЕ
('Miami Blue', 'KPMF K75600', '#1E90FF', 'blue', 'gloss', 20),
('Navy Blue', 'HX 30300', '#1B2A4A', 'blue', 'matte', 21),
('Midnight Blue', 'TW MB-301', '#1A1F3A', 'blue', 'gloss', 22),
('Electric Blue', 'OR 447', '#0066FF', 'blue', 'gloss', 23),
('Royal Blue', 'KPMF K75612', '#2563EB', 'blue', 'metallic', 24),
('Ice Blue', 'HX 30320', '#87CEEB', 'blue', 'matte', 25),
('Ocean Blue', 'TW OB-401', '#006994', 'blue', 'satin', 26),
('Sky Blue', 'OR 227', '#4FC3F7', 'blue', 'gloss', 27),
-- КРАСНЫЕ
('Racing Red', 'KPMF K75700', '#CC0000', 'red', 'gloss', 28),
('Burgundy', 'HX 30700', '#800020', 'red', 'matte', 29),
('Cherry Red', 'TW CR-501', '#DC143C', 'red', 'gloss', 30),
('Matte Red', 'OR 030', '#B22222', 'red', 'matte', 31),
('Crimson', 'KPMF K75715', '#990000', 'red', 'metallic', 32),
('Rose Red', 'HX 30720', '#E8354A', 'red', 'satin', 33),
-- ЗЕЛЁНЫЕ
('British Racing', 'KPMF K75800', '#004225', 'green', 'gloss', 34),
('Olive Green', 'HX 30800', '#708238', 'green', 'matte', 35),
('Mint Green', 'TW MG-601', '#98FF98', 'green', 'gloss', 36),
('Army Green', 'OR 066', '#4B5320', 'green', 'matte', 37),
('Forest Green', 'KPMF K75812', '#228B22', 'green', 'satin', 38),
-- ДРУГИЕ
('Sunset Orange', 'KPMF K75900', '#FF6B35', 'other', 'gloss', 39),
('Candy Yellow', 'HX 30900', '#FFE135', 'other', 'gloss', 40),
('Purple Haze', 'TW PH-701', '#7B2FBE', 'other', 'gloss', 41),
('Rose Gold', 'OR 362', '#B76E79', 'other', 'metallic', 42),
('Chrome Silver', 'KPMF K75950', '#C0C0C0', 'other', 'metallic', 43),
('Gold Metallic', 'HX 30950', '#D4AF37', 'other', 'metallic', 44),
('Candy Apple', 'TW CA-801', '#FF0800', 'other', 'gloss', 45),
('Teal', 'OR 196', '#008080', 'other', 'satin', 46),
('Hot Pink', 'KPMF K76000', '#FF69B4', 'other', 'gloss', 47),
('Deep Purple', 'HX 31000', '#4B0082', 'other', 'matte', 48),
('Coral', 'TW CO-901', '#FF6B6B', 'other', 'gloss', 49),
('Chameleon', 'OR 999', '#7FFF00', 'other', 'special', 50);
```

### Supabase Storage Buckets
```
Создай в Supabase Dashboard → Storage:

Bucket: "wraps"
  - Private (not public)
  - Max file size: 20MB
  - Allowed MIME types: image/jpeg, image/png, image/webp

Path structure:
  wraps/{user_id}/{wrap_id}/original.jpg
  wraps/{user_id}/{wrap_id}/result.jpg
  wraps/{user_id}/{wrap_id}/share.jpg
```

---

## API ENDPOINTS

### POST /api/auth/register
```typescript
// Body: { email, password, company_name, phone? }
// 1. Supabase Auth signUp({ email, password, options: { data: { company_name } } })
// 2. Supabase trigger auto-creates profile (see trigger above)
// 3. Return: { success: true, message: "Check email" }
// Error: 400 if email exists, 422 if validation fails
```

### POST /api/auth/login
```typescript
// Body: { email, password }
// Supabase Auth signInWithPassword({ email, password })
// Return: { user: {...}, session: { access_token, refresh_token, expires_at } }
// Set httpOnly cookie: sb-access-token, sb-refresh-token
```

### POST /api/auth/logout
```typescript
// Supabase Auth signOut()
// Clear cookies
// Return: { success: true }
```

### GET /api/auth/me
```typescript
// Requires auth
// Return: { 
//   user: { id, email },
//   profile: { company_name, phone, plan, visualizations_used_month },
//   remaining: number  // plan limits - used
// }
```

### POST /api/wraps/generate  ← ГЛАВНЫЙ ENDPOINT
```typescript
// Requires auth
// Body: multipart/form-data { photo: File, color_id: string }
// 
// STEPS:
// 1. Validate: check user's remaining quota (free=5, starter=50, pro=unlimited)
//    If exceeded: return 403 { error: "limit_reached", remaining: 0 }
//
// 2. Compress photo with Sharp:
//    - Resize to max 1024px longest side (maintain aspect ratio)
//    - Convert to JPEG quality 85
//    - Strip EXIF
//
// 3. Upload original to Supabase Storage:
//    path: wraps/{user_id}/{wrap_id}/original.jpg
//
// 4. Create wrap record in DB:
//    { user_id, color_id, original_photo_path, status: 'processing' }
//
// 5. Get color hex from DB by color_id
//
// 6. Call Replicate API (see replicate.ts below):
//    - Upload photo to Replicate as base64 or URL
//    - Start prediction, get prediction_id
//    - Poll until complete (max 30s, check every 2s)
//
// 7. Download result image from Replicate output URL
//
// 8. Compose share image with Sharp:
//    - Side-by-side: original LEFT | result RIGHT
//    - Add bottom bar: black 40px, "Создано в WrapVision.ru" white text
//    - Output: 1200×600 JPEG
//
// 9. Upload result.jpg and share.jpg to Supabase Storage
//
// 10. Update wrap record:
//     { result_photo_path, share_image_path, status: 'done', completed_at, generation_duration_ms }
//
// 11. Increment profile.visualizations_used_month
//
// 12. Generate signed URLs (valid 7 days) for original + result + share
//
// Return: {
//   wrap_id: string,
//   original_url: string,   // signed URL
//   result_url: string,     // signed URL
//   share_url: string,      // signed URL
//   share_token: string,    // для публичного просмотра
//   color: { name, sku, hex }
// }
//
// Error handling:
//   - Replicate timeout: status='failed', error_message, return 500
//   - Storage error: cleanup DB record, return 500
//   - All errors: return { error: string, code: string }
```

### GET /api/wraps
```typescript
// Requires auth
// Query: ?limit=20&offset=0
// Return: {
//   items: WrapItem[],
//   total: number
// }
// WrapItem: { id, color: {name,sku,hex}, original_url, result_url, created_at, status }
// Generate fresh signed URLs (1h) for each item
```

### GET /api/wraps/[id]
```typescript
// Requires auth + ownership check
// Return: full WrapItem with all URLs (7d signed)
```

### DELETE /api/wraps/[id]
```typescript
// Requires auth + ownership check
// 1. Delete files from Storage (original, result, share)
// 2. Delete DB record
// Return: { success: true }
```

### GET /api/user/profile
```typescript
// Requires auth
// Return: profile row + computed { remaining, limits }
```

### PATCH /api/user/profile
```typescript
// Body: { company_name?, phone?, city? }
// Update profiles table
// Return: updated profile
```

---

## REPLICATE INTEGRATION (lib/replicate.ts)

```typescript
import Replicate from "replicate";
import sharp from "sharp";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// AI PROMPT STRATEGY:
// We use img2img approach: take original car photo, recolor it
// Model: stability-ai/stable-diffusion-img2img OR black-forest-labs/flux-fill
//
// RECOMMENDED MODEL for car recoloring:
// "zsxkib/realistic-vision-v6:..." — хорошо работает с авто
// OR flux-kontext (лучшее качество, дороже)
//
// PROMPT TEMPLATE:
// "A car wrapped in [COLOR_NAME] vinyl film, [FINISH_TYPE] finish, 
//  professional automotive photography, high quality, photorealistic,
//  same car model and angle as input, same background"
//
// NEGATIVE PROMPT:
// "distorted, blurry, low quality, cartoon, illustration, 
//  different car model, text, watermark"

export async function generateCarWrap(
  imageBuffer: Buffer,
  color: { name: string; hex: string; finish: string }
): Promise<Buffer> {
  
  // Convert buffer to base64 data URL
  const base64 = imageBuffer.toString('base64');
  const imageDataUrl = `data:image/jpeg;base64,${base64}`;
  
  const finishMap: Record<string, string> = {
    gloss: 'glossy',
    matte: 'matte',
    satin: 'satin',
    metallic: 'metallic shimmer',
    special: 'chameleon color-shifting',
  };
  
  const prompt = `A car wrapped in ${color.name} vinyl film, ${finishMap[color.finish] || 'gloss'} finish, 
    professional automotive detailing photography, photorealistic, high quality, 
    same car model shape and viewing angle as the input photo, same background and lighting`;
  
  // Try primary model: flux-fill or img2img
  // Adjust model ID based on what gives best results in your testing
  const output = await replicate.run(
    "black-forest-labs/flux-fill-pro", // or "stability-ai/stable-diffusion-img2img"
    {
      input: {
        image: imageDataUrl,
        prompt: prompt,
        negative_prompt: "blurry, distorted, low quality, cartoon, different car model, text",
        prompt_strength: 0.6,  // how much to change (0=keep original, 1=ignore original)
        num_inference_steps: 28,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
      }
    }
  );
  
  // output is a URL string or array of URL strings
  const resultUrl = Array.isArray(output) ? output[0] : output as string;
  
  // Download result
  const response = await fetch(resultUrl);
  const resultBuffer = Buffer.from(await response.arrayBuffer());
  
  return resultBuffer;
}
```

**ВАЖНО:** Модель нужно тестировать. `flux-fill-pro` — наиболее реалистичный результат для автомобилей, но дороже. Альтернативы:
- `stability-ai/stable-diffusion-img2img` — быстрее, дешевле (~$0.003)
- `zsxkib/realistic-vision-v6` — хорошо для авто, бесплатные первые 100 запросов на Replicate
- Можно переключить модель в одном месте в `lib/replicate.ts`

---

## IMAGE PROCESSING (lib/image.ts)

```typescript
import sharp from "sharp";

// Compress input photo for AI
export async function preparePhotoForAI(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
}

// Compose share image: side-by-side before/after
export async function composeShareImage(
  originalBuffer: Buffer,
  resultBuffer: Buffer,
  colorName: string
): Promise<Buffer> {
  const WIDTH = 1200;
  const HEIGHT = 628;
  const HALF = WIDTH / 2;
  const BAR_HEIGHT = 48;
  
  const [original, result] = await Promise.all([
    sharp(originalBuffer).resize(HALF, HEIGHT - BAR_HEIGHT, { fit: 'cover' }).toBuffer(),
    sharp(resultBuffer).resize(HALF, HEIGHT - BAR_HEIGHT, { fit: 'cover' }).toBuffer(),
  ]);
  
  // Bottom bar with text
  const barSvg = `
    <svg width="${WIDTH}" height="${BAR_HEIGHT}">
      <rect width="${WIDTH}" height="${BAR_HEIGHT}" fill="#000000"/>
      <text x="${WIDTH/2}" y="${BAR_HEIGHT * 0.65}" 
            font-family="Arial" font-size="16" fill="#A0A0A0" text-anchor="middle">
        ${colorName} · Создано в WrapVision.ru
      </text>
    </svg>
  `;
  
  // Label overlays
  const beforeLabel = `
    <svg width="80" height="28">
      <rect width="80" height="28" rx="4" fill="rgba(0,0,0,0.6)"/>
      <text x="40" y="19" font-family="Arial" font-size="12" fill="white" text-anchor="middle">БЫЛО</text>
    </svg>
  `;
  const afterLabel = beforeLabel.replace('БЫЛО', 'СТАЛО');
  
  return sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: { r: 0, g: 0, b: 0 } }
  })
  .composite([
    { input: original, left: 0, top: 0 },
    { input: result, left: HALF, top: 0 },
    { input: Buffer.from(barSvg), left: 0, top: HEIGHT - BAR_HEIGHT },
    { input: Buffer.from(beforeLabel), left: 12, top: 12 },
    { input: Buffer.from(afterLabel), left: HALF + 12, top: 12 },
  ])
  .jpeg({ quality: 90 })
  .toBuffer();
}
```

---

## AUTH MIDDLEWARE (middleware.ts)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect /api routes (except auth endpoints)
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth/');
  
  if (isApiRoute && !isAuthRoute && !session) {
    return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
  }
  
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
```

---

## ПЛАН ИМПЛЕМЕНТАЦИИ (порядок работы)

### Шаг 1: Инфраструктура (30 мин)
```bash
npx create-next-app@latest wrapvision-api --typescript --app --no-tailwind
cd wrapvision-api
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs replicate sharp
npm install -D @types/node
```

1. Создай проект в Supabase Dashboard
2. Скопируй URL и ключи в .env.local
3. Запусти миграцию через Supabase SQL Editor (001_initial.sql)
4. Запусти seed.sql
5. Создай Storage bucket "wraps" (private)
6. Проверь: `supabase` CLI или Dashboard → всё создано

### Шаг 2: Auth endpoints (30 мин)
Реализуй: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
Протестируй через curl или Postman.

### Шаг 3: File upload + Replicate test (45 мин)
1. Реализуй `/api/upload` для тестовой загрузки
2. Напиши `lib/replicate.ts`
3. Протестируй `generateCarWrap()` с тестовым фото вручную — убедись что качество ок
4. Если результат плохой — смени модель (параметр `prompt_strength`: уменьши до 0.4-0.5)

### Шаг 4: Главный generate endpoint (45 мин)
Реализуй `/api/wraps/generate` — полный pipeline:
photo → compress → storage → replicate → compose share → storage → return URLs

### Шаг 5: History endpoints (20 мин)
GET /api/wraps, GET /api/wraps/[id], DELETE /api/wraps/[id]

### Шаг 6: Profile endpoints (15 мин)
GET/PATCH /api/user/profile

### Шаг 7: Интеграция с фронтендом (30 мин)
В Lovable-проекте замени mock functions в `/src/api/` на реальные fetch calls к:
`${process.env.NEXT_PUBLIC_API_URL}/api/...`

Или объедини в один Next.js проект (рекомендую):
- Скопируй Lovable-генерацию в `/app/(frontend)/` 
- API routes в `/app/api/`
- Deploy всё одной командой `vercel`

### Шаг 8: Deploy (15 мин)
```bash
vercel
# В Vercel Dashboard → Environment Variables:
# Добавь все переменные из .env.local
vercel --prod
```

---

## ЛИМИТЫ ПЛАНОВ (lib/limits.ts)

```typescript
export const PLAN_LIMITS = {
  free: 5,
  starter: 50,
  pro: Infinity,
  enterprise: Infinity,
} as const;

export async function checkAndIncrementUsage(userId: string, supabase: any): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, visualizations_used_month, plan_reset_date')
    .eq('id', userId)
    .single();
  
  // Reset counter if month changed
  const resetDate = new Date(profile.plan_reset_date);
  if (new Date() >= resetDate) {
    await supabase.from('profiles').update({
      visualizations_used_month: 0,
      plan_reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 1).toISOString().split('T')[0]
    }).eq('id', userId);
    profile.visualizations_used_month = 0;
  }
  
  const limit = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS];
  const used = profile.visualizations_used_month;
  
  if (used >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment
  await supabase.from('profiles')
    .update({ visualizations_used_month: used + 1 })
    .eq('id', userId);
  
  return { allowed: true, remaining: limit === Infinity ? 999 : limit - used - 1 };
}
```

---

## ERROR HANDLING CONVENTION

Все API endpoints возвращают единый формат ошибок:
```typescript
// Success
{ data: any, success: true }

// Error
{ error: string, code: string, success: false }

// Коды ошибок:
// AUTH_REQUIRED — не авторизован
// LIMIT_REACHED — превышен лимит плана
// VALIDATION_ERROR — невалидные данные
// GENERATION_FAILED — AI не смог сгенерировать
// NOT_FOUND — ресурс не найден
// FORBIDDEN — нет доступа к чужому ресурсу
```

---

## ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Rate limiting**: Добавь в middleware rate limiting на /api/wraps/generate — max 5 req/min per user (через Upstash Redis или простой in-memory Map). Без этого один пользователь Free сможет сделать 5 запросов за секунду.

2. **Replicate polling vs webhook**: Для MVP используй синхронный polling (ждём результат прямо в request). Timeout 45 секунд. В v1.1 перейди на webhooks + SSE для real-time прогресса.

3. **Storage cleanup**: Фотографии клиентов согласно 152-ФЗ не должны храниться дольше 90 дней. Добавь scheduled function (Supabase Edge Functions или Vercel Cron) для удаления старых файлов.

4. **Image validation**: Перед отправкой в Replicate проверь что на фото есть автомобиль. Простой способ — проверить минимальное разрешение (1024x768) и размер файла (>50KB). Более сложный — Replicate classifier.

5. **CORS**: Настрой CORS в Next.js для продакшен домена фронтенда.
