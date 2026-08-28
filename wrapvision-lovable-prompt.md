# WrapVision — Lovable Prompt (MVP UI)

Вставь этот промпт в Lovable как первое сообщение нового проекта.

---

## ПРОМПТ ДЛЯ LOVABLE

Build a complete mobile-first React SPA called **WrapVision** — an AI car wrap visualization tool for detailing centers. The app allows managers to photograph a client's car, pick a wrap color, and get an AI-generated before/after result in 15 seconds.

---

### TECH STACK
- React 18 + TypeScript
- Tailwind CSS (dark theme)
- React Router v6 (client-side routing)
- Zustand for state management
- React Query (TanStack Query) for API calls
- Lucide React for icons
- All API calls go to `/api/*` endpoints (Next.js API routes, to be wired later — use mock data for now)

---

### DESIGN SYSTEM

Apply these tokens globally via Tailwind config and CSS variables:

```
Background layers:
  bg-base:    #000000  (true black, body)
  bg-surface: #0A0A0A  (main background)
  bg-card:    #141414  (cards, panels)
  bg-input:   #1F1F1F  (inputs, hover states)
  bg-border:  #2A2A2A  (borders, dividers)

Text:
  text-primary:   #FFFFFF
  text-secondary: #A0A0A0
  text-muted:     #666666

Accent:
  accent:        #3B82F6
  accent-hover:  #60A5FA
  accent-active: #2563EB

Semantic:
  success: #22C55E
  warning: #F59E0B
  error:   #EF4444

Special:
  gradient: linear-gradient(135deg, #3B82F6, #8B5CF6)

Font: Inter (import from Google Fonts)
Mono: JetBrains Mono (for color codes/SKUs)

Tap targets: minimum 48px height, primary CTAs 56px
Border radius: 12px for cards, 8px for inputs, 16px for modals
```

---

### APP STRUCTURE & ROUTING

```
/ (root) → redirect to /login if not authenticated, else /home

Auth routes (no bottom nav):
  /login
  /register
  /email-sent

Protected routes (with bottom nav):
  /home          (tab 1)
  /wrap/new      (tab 2 — step wizard)
  /history       (tab 3)
  /settings      (tab 4)
  /history/:id   (detail, no tab highlight)
```

---

### GLOBAL COMPONENTS

**BottomNav** — fixed bottom, height 56px + safe area padding:
```
4 tabs:
  Home     → /home      icon: Home
  New Wrap → /wrap/new  icon: Plus (larger, accent bg circle 48px)
  History  → /history   icon: Clock
  Settings → /settings  icon: Settings
Active tab: accent color icon + label
Inactive: text-muted
Background: bg-card, top border 1px bg-border
```

**AppHeader** — fixed top, height 44px:
```
Left: back arrow (chevron-left) OR page title
Center: page title (if no back arrow)
Right: optional action icon
Background: bg-surface, bottom border 1px bg-border
```

---

### SCREEN SPECIFICATIONS

---

#### /login — Login Screen

No header, no bottom nav. Full viewport.

Layout: vertically centered column, px-6:
```
TOP SECTION:
  - Logo: "WrapVision" wordmark in white, font-bold text-2xl, mb-2
  - Tagline: "Визуализация оклейки за 15 секунд" text-secondary text-sm

FORM (mt-8, gap-4):
  - Email input: full width, bg-input, border bg-border, rounded-lg, h-14, px-4
    placeholder="your@email.com", type="email"
  - Password input: same styling, type="password"
    Right side: eye/eye-off toggle icon button
  - "Войти" button: h-14, full width, bg gradient (accent→purple), rounded-xl
    Loading state: spinner inside, disabled

LINKS:
  - "Забыли пароль?" — text-secondary text-sm, text-center, mt-2
  - Divider line mt-8
  - "Нет аккаунта? Зарегистрироваться" — text-center, "Зарегистрироваться" in accent

ERROR STATE:
  - Red border on inputs + red text below "Неверный email или пароль"
```

---

#### /register — Registration Screen

No header, no bottom nav. Scrollable.

```
TOP: Same logo as login

FORM (gap-4):
  - "Название центра" input, placeholder="Детейлинг Центр Авто"
  - Email input
  - Password input with strength bar below (4 segments, fill by strength)
  - Phone input (optional), placeholder="+7 (999) 000-00-00"
  - Checkbox row: checkbox + "Принимаю условия использования" (link)

CTA: "Создать аккаунт" h-14 gradient button

BOTTOM: "Уже есть аккаунт? Войти"
```

---

#### /email-sent — Email Confirmation

No header, no nav. Centered vertically.

```
Icon: Mail with checkmark, 80px, accent color
Title: "Проверьте почту" text-2xl font-bold
Body: "Мы отправили ссылку на активацию на ваш email."
      text-secondary text-center mt-3

Button: "Открыть почту" — outline style
Link: "Отправить повторно" — text-secondary, with 60s cooldown timer
```

---

#### ONBOARDING OVERLAY (shown once after first login)

Full screen overlay with backdrop blur. 3 steps.

```
Each step:
  - Large emoji illustration area (160px, centered): 📸 / 🎨 / ⚡
  - Step title: text-xl font-bold
  - Step description: text-secondary text-center

Step 1: 📸 "Сфотографируйте авто" / "Или загрузите фото из WhatsApp"
Step 2: 🎨 "Выберите цвет плёнки" / "50+ популярных цветов в каталоге"
Step 3: ⚡ "Результат за 15 секунд" / "Отправьте клиенту прямо из приложения"

NAVIGATION:
  - Dots indicator (3 dots, active = white, inactive = bg-border)
  - "Далее" button (accent, h-14) on steps 1-2
  - "Начать работу" button (gradient, h-14) on step 3
  - "Пропустить" text button top-right (always visible)

Store "onboardingDone" in localStorage. Never show again after completion.
```

---

#### /home — Dashboard

AppHeader: "WrapVision" title, right side: Bell icon (no action, MVP)
BottomNav: tab 1 active

```
HERO CTA (mx-4 mt-4):
  - Large button h-20, full width, gradient background, rounded-2xl
  - Left: Camera + Sparkles icon (white, 24px)
  - Text: "+ НОВАЯ ВИЗУАЛИЗАЦИЯ" font-bold text-lg
  - Subtle shimmer animation on the gradient

STATS ROW (mt-4 mx-4, 3 cards, flex row gap-3):
  Each stat card (flex-1, bg-card, rounded-xl, p-3, border bg-border):
    - Number: text-2xl font-bold text-white
    - Label: text-xs text-secondary
  Cards: "Сегодня", "За месяц", "Осталось"
  Mock data: 3, 47, 3 (Free plan)

RECENT WRAPS section (mt-6):
  Header row: "Последние" font-semibold + "Все →" accent text-sm (→ /history)
  
  Horizontal scroll (mt-3, px-4, gap-3, flex):
    Each card (min-w-[160px], bg-card, rounded-xl, overflow-hidden):
      - Image (160×100px): show result/after image (use placeholder gradient if no data)
      - Bottom padding p-3:
        - Color name: text-sm font-medium
        - Date: text-xs text-secondary

  Empty state (if no history):
    Center: Clock icon (48px, text-muted) + "Здесь появятся ваши визуализации"
    text-secondary text-sm text-center mt-8
```

---

#### /wrap/new — New Wrap Wizard (4 steps)

This is a multi-step flow. Use a step state: 'photo' | 'color' | 'generating' | 'result'

**Step indicator** (shown on photo + color steps only):
```
3 dots/steps at top: ● ○ ○ (filled = done/current)
Labels: Фото / Цвет / Результат
```

---

**STEP 1: Photo** (step='photo')

AppHeader: "← Назад" (→ /home) | "Фото"

```
INSTRUCTION (mx-4 mt-4, bg-card rounded-xl p-4):
  - "Расположите авто целиком в кадре"
  - text-secondary text-sm: "Лучший ракурс: 3/4 спереди или сбоку"

PHOTO BUTTONS (mt-6 mx-4 flex gap-3):
  - "📷 Сделать фото" (flex-1, h-14, gradient, rounded-xl)
    → triggers <input type="file" accept="image/*" capture="environment">
  - "🖼 Из галереи" (flex-1, h-14, bg-card border bg-border, rounded-xl)
    → triggers <input type="file" accept="image/*">

AFTER PHOTO SELECTED — show preview state:
  - Image preview: full width, aspect-video, object-cover, rounded-xl, mx-4 mt-6
  - File info below: filename + size, text-secondary text-xs
  - WARNING (if image < 500KB or very dark): amber banner
    bg-warning/20 border border-warning/40 rounded-lg p-3 text-warning text-sm
    "📷 Фото может быть слишком тёмным. Попробуйте другое."

BOTTOM STICKY (if photo selected):
  - "Использовать это фото →" h-14 gradient full width mx-4
  - "Переснять" ghost button below, text-secondary
```

---

**STEP 2: Color Select** (step='color')

AppHeader: "← Назад" (back to photo) | "Цвет"
Right side: small circle thumbnail of selected photo (32px)

```
SEARCH BAR (mx-4 mt-3):
  bg-input rounded-xl h-12 px-4
  Left: Search icon text-muted
  placeholder="Поиск цвета или артикула..."
  Right: X button (clears search)

CATEGORY CHIPS (mt-3 px-4, horizontal scroll, no scrollbar):
  Chips: Все | Серые | Чёрные | Белые | Синие | Красные | Зелёные | Другие
  Active chip: bg-accent text-white
  Inactive: bg-card text-secondary border bg-border
  Height: 34px, px-4, rounded-full

COLOR GRID (mt-4 px-4):
  Grid: 4 columns, gap-3
  
  Each color swatch:
    - Square 72px, rounded-xl, backgroundColor = hex value
    - Special swatches (chrome/carbon): show gradient texture
    - Selected state: 3px border accent + white checkmark circle overlay
    - Below: name text-xs text-secondary text-center (truncate)
    - Min tap target: 72px square is enough

FAVORITE SECTION (if any favorites, shown above grid):
  "★ Избранное" header text-xs text-muted uppercase tracking-wider mb-2
  Same 4-col grid, only starred colors

SELECTED PILL (sticky bottom, above keyboard):
  bg-card border border-bg-border rounded-2xl mx-4 mb-4 p-3 flex items-center gap-3:
    - Color swatch circle 32px
    - Name: font-medium
    - SKU: text-xs text-secondary font-mono
    - X button to deselect
  "Генерировать →" button below: h-14 gradient full width
```

---

**COLOR DATA** — hardcode this array in a `colors.ts` file:
```typescript
export const COLORS = [
  // СЕРЫЕ (10)
  { id: '1', name: 'Nardo Grey', sku: 'KPMF K75465', hex: '#6B6B6B', category: 'grey', finish: 'matte' },
  { id: '2', name: 'Cement Grey', sku: 'KPMF K88021', hex: '#8C8C8C', category: 'grey', finish: 'matte' },
  { id: '3', name: 'Space Grey', sku: 'HX 30502', hex: '#5A5A5A', category: 'grey', finish: 'gloss' },
  { id: '4', name: 'Storm Grey', sku: 'TW SG-441', hex: '#9E9E9E', category: 'grey', finish: 'satin' },
  { id: '5', name: 'Steel Grey', sku: 'OR 793', hex: '#7A7A7A', category: 'grey', finish: 'gloss' },
  { id: '6', name: 'Graphite', sku: 'KPMF K88044', hex: '#4A4A4A', category: 'grey', finish: 'gloss' },
  { id: '7', name: 'Gunmetal', sku: 'HX 30677', hex: '#3D3D3D', category: 'grey', finish: 'metallic' },
  { id: '8', name: 'Battleship', sku: 'TW BG-102', hex: '#828282', category: 'grey', finish: 'matte' },
  { id: '9', name: 'Ash Grey', sku: 'OR 732', hex: '#B0B0B0', category: 'grey', finish: 'matte' },
  { id: '10', name: 'Granite', sku: 'KPMF K75123', hex: '#696969', category: 'grey', finish: 'satin' },
  // ЧЁРНЫЕ (5)
  { id: '11', name: 'Piano Black', sku: 'KPMF K88001', hex: '#0A0A0A', category: 'black', finish: 'gloss' },
  { id: '12', name: 'Matte Black', sku: 'KPMF K88002', hex: '#1A1A1A', category: 'black', finish: 'matte' },
  { id: '13', name: 'Metallic Black', sku: 'HX 30500', hex: '#1C1C1C', category: 'black', finish: 'metallic' },
  { id: '14', name: 'Satin Black', sku: 'TW SB-101', hex: '#222222', category: 'black', finish: 'satin' },
  { id: '15', name: 'Carbon Black', sku: 'OR 970', hex: '#0F0F0F', category: 'black', finish: 'gloss' },
  // БЕЛЫЕ (4)
  { id: '16', name: 'Gloss White', sku: 'KPMF K88010', hex: '#F5F5F5', category: 'white', finish: 'gloss' },
  { id: '17', name: 'Matte White', sku: 'KPMF K88011', hex: '#EFEFEF', category: 'white', finish: 'matte' },
  { id: '18', name: 'Pearl White', sku: 'HX 30100', hex: '#F8F8FF', category: 'white', finish: 'metallic' },
  { id: '19', name: 'Satin White', sku: 'TW SW-201', hex: '#F0F0F0', category: 'white', finish: 'satin' },
  // СИНИЕ (8)
  { id: '20', name: 'Miami Blue', sku: 'KPMF K75600', hex: '#1E90FF', category: 'blue', finish: 'gloss' },
  { id: '21', name: 'Navy Blue', sku: 'HX 30300', hex: '#1B2A4A', category: 'blue', finish: 'matte' },
  { id: '22', name: 'Midnight Blue', sku: 'TW MB-301', hex: '#1A1F3A', category: 'blue', finish: 'gloss' },
  { id: '23', name: 'Electric Blue', sku: 'OR 447', hex: '#0066FF', category: 'blue', finish: 'gloss' },
  { id: '24', name: 'Royal Blue', sku: 'KPMF K75612', hex: '#2563EB', category: 'blue', finish: 'metallic' },
  { id: '25', name: 'Ice Blue', sku: 'HX 30320', hex: '#87CEEB', category: 'blue', finish: 'matte' },
  { id: '26', name: 'Ocean Blue', sku: 'TW OB-401', hex: '#006994', category: 'blue', finish: 'satin' },
  { id: '27', name: 'Sky Blue', sku: 'OR 227', hex: '#4FC3F7', category: 'blue', finish: 'gloss' },
  // КРАСНЫЕ (6)
  { id: '28', name: 'Racing Red', sku: 'KPMF K75700', hex: '#CC0000', category: 'red', finish: 'gloss' },
  { id: '29', name: 'Burgundy', sku: 'HX 30700', hex: '#800020', category: 'red', finish: 'matte' },
  { id: '30', name: 'Cherry Red', sku: 'TW CR-501', hex: '#DC143C', category: 'red', finish: 'gloss' },
  { id: '31', name: 'Matte Red', sku: 'OR 030', hex: '#B22222', category: 'red', finish: 'matte' },
  { id: '32', name: 'Crimson', sku: 'KPMF K75715', hex: '#990000', category: 'red', finish: 'metallic' },
  { id: '33', name: 'Rose Red', sku: 'HX 30720', hex: '#E8354A', category: 'red', finish: 'satin' },
  // ЗЕЛЁНЫЕ (5)
  { id: '34', name: 'British Racing', sku: 'KPMF K75800', hex: '#004225', category: 'green', finish: 'gloss' },
  { id: '35', name: 'Olive Green', sku: 'HX 30800', hex: '#708238', category: 'green', finish: 'matte' },
  { id: '36', name: 'Mint Green', sku: 'TW MG-601', hex: '#98FF98', category: 'green', finish: 'gloss' },
  { id: '37', name: 'Army Green', sku: 'OR 066', hex: '#4B5320', category: 'green', finish: 'matte' },
  { id: '38', name: 'Forest Green', sku: 'KPMF K75812', hex: '#228B22', category: 'green', finish: 'satin' },
  // ДРУГИЕ (12)
  { id: '39', name: 'Sunset Orange', sku: 'KPMF K75900', hex: '#FF6B35', category: 'other', finish: 'gloss' },
  { id: '40', name: 'Candy Yellow', sku: 'HX 30900', hex: '#FFE135', category: 'other', finish: 'gloss' },
  { id: '41', name: 'Purple Haze', sku: 'TW PH-701', hex: '#7B2FBE', category: 'other', finish: 'gloss' },
  { id: '42', name: 'Rose Gold', sku: 'OR 362', hex: '#B76E79', category: 'other', finish: 'metallic' },
  { id: '43', name: 'Chrome Silver', sku: 'KPMF K75950', hex: '#C0C0C0', category: 'other', finish: 'metallic' },
  { id: '44', name: 'Gold Metallic', sku: 'HX 30950', hex: '#D4AF37', category: 'other', finish: 'metallic' },
  { id: '45', name: 'Candy Apple', sku: 'TW CA-801', hex: '#FF0800', category: 'other', finish: 'gloss' },
  { id: '46', name: 'Teal', sku: 'OR 196', hex: '#008080', category: 'other', finish: 'satin' },
  { id: '47', name: 'Hot Pink', sku: 'KPMF K76000', hex: '#FF69B4', category: 'other', finish: 'gloss' },
  { id: '48', name: 'Deep Purple', sku: 'HX 31000', hex: '#4B0082', category: 'other', finish: 'matte' },
  { id: '49', name: 'Coral', sku: 'TW CO-901', hex: '#FF6B6B', category: 'other', finish: 'gloss' },
  { id: '50', name: 'Chameleon', sku: 'OR 999', hex: '#7FFF00', category: 'other', finish: 'special' },
]
```

---

**STEP 3: Generating** (step='generating')

No AppHeader back button (trap user until done/error). No bottom nav.

```
LAYOUT: centered vertically

PHOTO PREVIEW (mx-4, aspect-video, rounded-2xl, overflow-hidden):
  - Original photo blurred (blur-sm), covers top 45% of screen
  - Overlay gradient: transparent → bg-surface (bottom 30%)

GENERATING CARD (mx-4 mt-(-16) relative, bg-card rounded-2xl p-6 border bg-border):
  
  STAGE TEXT (text-sm text-secondary mb-3, animated fade between stages):
    0-30%:  "⚙️ Анализируем фото..."
    30-60%: "🔍 Определяем контуры кузова..."
    60-90%: "🎨 Применяем [color name]..."
    90-100%: "✨ Финальные штрихи..."
  
  PROGRESS BAR:
    bg-input rounded-full h-2 full width
    Fill: gradient accent→purple, transition-all duration-300
    
  PERCENTAGE:
    text-2xl font-bold text-white text-center mt-2 tabular-nums
    
  COLOR INFO:
    mt-3 flex items-center gap-2 justify-center
    Color swatch 20px + name text-sm text-secondary font-mono

CANCEL BUTTON:
  mt-8 "Отменить" ghost button text-muted, centers

PROGRESS SIMULATION (for UI dev — real value comes from API polling):
  Simulate 0→100% over 12 seconds with easing. On 100% → transition to result step.

ERROR STATE (if API returns error or timeout 30s):
  Replace progress card with:
    Error icon (red) + "Что-то пошло не так" text-lg
    "Попробовать снова" button (accent) + "Изменить фото" button (ghost)
```

---

**STEP 4: Result** (step='result')

AppHeader: "← Назад" (goes back to color select with photo preserved) | "Результат" | ⋮ menu

⋮ menu items (bottom sheet):
- "Скачать PNG" (downloads result image)
- "Удалить" (red, deletes with confirmation)

```
COMPARISON VIEWER (mx-0, aspect-[4/3], relative, overflow-hidden):
  
  Two images stacked:
    - BEFORE: absolute inset-0, full width/height, object-cover
    - AFTER: absolute inset-0, full width/height, object-cover
      clip-path: inset(0 0 0 {sliderPosition}%)  ← main reveal mechanic
  
  SLIDER HANDLE:
    - Vertical line: absolute top-0 bottom-0, width 2px, bg-white/80, left = sliderPosition%
    - Circle handle: absolute centered vertically, 44px circle, bg-white shadow-lg
      Contains: ← → arrows icon (gray)
    - Pulse animation on first render (2 times, then stop)
  
  LABELS:
    "БЫЛО" — absolute top-4 left-4, bg-black/60 rounded px-2 py-1 text-xs text-white
    "СТАЛО" — absolute top-4 right-4, same styling
  
  INTERACTION:
    - onPointerDown + onPointerMove: update sliderPosition (0-100)
    - Single tap: toggle 0% ↔ 100%
    - Touch anywhere on image (not just handle)
  
  MODE TOGGLE (below image, mt-3):
    3 pills: [Слайдер] [Рядом] [Таб]
    Active: bg-accent text-white, inactive: bg-card text-secondary
    "Рядом": show both images side by side (each 50% width)
    "Таб": fullscreen tap-to-toggle

INFO ROW (mx-4 mt-4 flex items-center gap-3):
  - Color circle 28px (solid hex color)
  - Name: font-semibold text-base
  - SKU: text-secondary text-sm font-mono

ACTION BUTTONS (mx-4 mt-4):
  Row 1: "📤 Отправить" — h-14 gradient full width rounded-xl
  Row 2 (mt-3 flex gap-3):
    "🎨 Другой цвет" — flex-1 h-12 bg-card border rounded-xl text-sm
    "💾 Сохранить" — flex-1 h-12 bg-card border rounded-xl text-sm
```

---

**SHARE MODAL** (bottom sheet, triggered from Result screen)

```
OVERLAY: backdrop-blur-sm bg-black/60
SHEET: bg-card rounded-t-2xl pt-4 pb-safe:

  DRAG HANDLE: mx-auto w-10 h-1 bg-bg-border rounded-full mb-4

  TITLE: "Отправить клиенту" font-semibold text-center mb-4

  BUTTONS (mx-4, gap-3):
    Each button (h-14, bg-input, rounded-xl, flex items-center px-4 gap-3):
      - "💚 WhatsApp" — opens whatsapp://send?text=...&attach=image
      - "🔵 Telegram" — opens tg://msg?text=...
      - "📧 Email" — opens mailto:?subject=...&body=...
    
    Divider (bg-bg-border h-px mx-4 my-2)
    
      - "📥 Сохранить в галерею" — downloads image PNG
      - "🔗 Скопировать ссылку" — copies URL to clipboard + toast "Скопировано!"

  SHARE IMAGE FORMAT (generate on client using canvas):
    - Side-by-side before/after, 1200×600px
    - Bottom bar: color name + "Создано в WrapVision.ru"
    - bg-black, white text
```

---

#### /history — History List

AppHeader: "История" | right: Search icon (toggles search bar)

```
SEARCH BAR (collapsible, slides down):
  bg-input h-12 rounded-xl mx-4 px-4 mt-3
  placeholder="Поиск по цвету..."

LIST (mt-3, divide-y divide-bg-border):
  Each item (flex items-center, h-20, px-4, gap-3, active:bg-bg-input):
    - BEFORE thumb: 56×40px rounded-lg object-cover
    - AFTER thumb: 56×40px rounded-lg object-cover (with thin overlap/offset)
    - TEXT column (flex-1):
        Top: color name font-medium text-sm
        Bottom: date text-xs text-secondary + " · " + SKU mono text-xs
    - Chevron right icon text-muted

  Swipe left to reveal DELETE button:
    bg-error text-white w-20 flex items-center justify-center "Удалить"
    With confirmation: "Удалить визуализацию?" confirm dialog

EMPTY STATE (centered, mt-16):
  Clock icon 48px text-muted
  "Нет визуализаций" text-secondary
  CTA: "Создать первую" button (accent)
```

---

#### /history/:id — Wrap Detail

AppHeader: "← История" | right: ⋮ menu (Share, Delete)

```
COMPARISON VIEWER: same component as Result screen (reuse!)
  Use stored before/after images

INFO ROW: same as Result

DATE: "Создано 23 декабря 2024" text-secondary text-sm mx-4 mt-2

ACTIONS (mx-4 mt-6):
  "📤 Отправить" — h-14 gradient full width
  mt-3 flex gap-3:
    "🎨 Новый вариант" — takes same photo, goes to color select
    "📷 Новое фото" — starts fresh wrap flow
```

---

#### /settings — Settings Main

AppHeader: "Настройки" (no back)
BottomNav: tab 4 active

```
SUBSCRIPTION BANNER (mx-4 mt-4, bg-card border rounded-2xl p-4):
  If Free plan:
    Row: "FREE" badge (gray pill) + "Осталось: 3 из 5" text-secondary
    Progress bar (thin, show usage)
    "Улучшить до Pro →" button amber/accent, h-10, full width mt-3

LIST ITEMS (mt-4, bg-card rounded-2xl mx-4, divide-y divide-bg-border, overflow-hidden):
  Each item (flex items-center h-14 px-4):
    Left: icon (18px, text-secondary) + "Label" text-sm
    Right: ChevronRight text-muted
  
  Items:
    🏢 Профиль компании → /settings/profile
    💳 Подписка → /settings/subscription
    
LIST 2 (mt-3, same styling):
    ❓ Помощь (support) → opens Telegram link
    📝 Условия использования → opens webview/URL
    
LOGOUT (mt-3 mx-4):
  Button h-14 bg-card rounded-2xl border border-error/30 full width
  Text: "Выйти" text-error font-medium
  On tap: confirm dialog "Выйти из аккаунта?" → logout + redirect /login
```

---

#### /settings/profile — Profile

AppHeader: "← Настройки" | "Профиль"

```
FORM (mx-4 mt-4, gap-4):
  Company name input (prefilled)
  Email input (disabled, opacity-50, no editing)
  Phone input

SAVE BUTTON (fixed bottom, mx-4 mb-4):
  "Сохранить изменения" h-14 gradient
  Success toast: "✓ Изменения сохранены"
```

---

#### /settings/subscription — Subscription

AppHeader: "← Настройки" | "Подписка"

```
CURRENT PLAN CARD (mx-4 mt-4, bg-card border-2 border-accent/30 rounded-2xl p-5):
  Badge: "FREE" or "STARTER" or "PRO" (uppercase, colored pill)
  "Визуализаций: 3 из 5" + progress bar
  "Следующее списание: —" text-secondary text-sm

PLAN CARDS (mt-6 mx-4 flex flex-col gap-3):

  FREE card (bg-card border rounded-2xl p-4):
    "FREE" + "₽0 / месяц" right
    "5 визуализаций · Базовый каталог · Watermark WrapVision"

  STARTER card (bg-card border rounded-2xl p-4):
    "STARTER" + "₽1 990 / мес" right
    "50 визуализаций · 50+ цветов · Без watermark"
    CTA button: "Попробовать 14 дней бесплатно" accent h-12

  PRO card (bg-gradient border-accent rounded-2xl p-4, RECOMMENDED badge):
    "PRO" + "₽4 990 / мес" right
    "Безлимит · 200+ цветов · Приоритетная поддержка"
    CTA: "Попробовать 14 дней бесплатно" gradient h-12

NOTE: CTA buttons → open Telegram bot / email for manual billing (MVP)
Small text: "Оплата вручную на старте. Напишем вам в течение часа."
```

---

### STATE MANAGEMENT (Zustand stores)

```typescript
// authStore: { user, session, login(), logout(), register() }
// wrapStore: { 
//   photo: File | null,
//   selectedColor: Color | null,
//   generationId: string | null,
//   result: { beforeUrl, afterUrl } | null,
//   step: 'photo'|'color'|'generating'|'result',
//   setPhoto(), setColor(), startGeneration(), setResult(), reset()
// }
// historyStore: { items: WrapItem[], fetch(), delete() }
// userStore: { profile: { companyName, email, phone }, plan: 'free'|'starter'|'pro', usageToday, usageMonth, remaining }
```

---

### MOCK DATA & API PLACEHOLDERS

For all API calls, create placeholder functions in `/src/api/`:
```typescript
// api/auth.ts: login(), register(), logout()
// api/wraps.ts: generateWrap(photo, colorId), getHistory(), deleteWrap(id)
// api/user.ts: getProfile(), updateProfile()

// All functions currently return mock data after 1-2s delay (simulate network)
// Real implementation comes from Claude Code backend spec
```

Mock history items (3-5 items with placeholder gradient images as before/after).

---

### ANIMATIONS & MICRO-INTERACTIONS

- Page transitions: fade (opacity 0→1, 150ms) on route change
- Button press: scale(0.97) active state
- Bottom sheet: slide up from bottom (translateY 100%→0, 300ms ease-out)
- Toast notifications: slide in from top, auto-dismiss 3s
- Slider comparison: smooth 60fps pointer tracking
- Loading spinner: custom, matches accent color
- Result reveal: scale(0.95→1.0) + fade, 400ms when generation completes

---

### PWA CONFIGURATION

Add to index.html:
```html
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#0A0A0A">
```

manifest.json: name "WrapVision", dark background, display standalone.

---

### IMPORTANT UX RULES

1. **NO dead ends**: every error screen has a CTA action
2. **Photo is never lost**: navigating back from color/generating preserves the photo
3. **Offline graceful**: if API fails, show friendly error, never white screen
4. **Safe area**: all sticky bottom elements respect `padding-bottom: env(safe-area-inset-bottom)`
5. **Touch targets**: every interactive element min 48×48px, no tiny tap targets
6. **Bottom sheets** for modals (not centered modals — awkward on mobile)
7. **Haptic feedback**: use `navigator.vibrate(10)` on primary CTA taps (where supported)
