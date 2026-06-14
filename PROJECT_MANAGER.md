# FitIQ — Project Manager Brief
# Claude Code reads this every session
# Last updated: May 2026

═══════════════════════════════════
## PRODUCT VISION
═══════════════════════════════════

FitIQ is a premium AI fitness app 
for Indian gym-goers aged 22-35.

Tagline: "Your AI fitness coach that gets you"

Target user:
- Age 22-35, Indian
- Goes to gym but not seeing results
- Frustrated with inaccurate Indian food tracking
- Wants scientific explanation not just generic advice
- Budget conscious (paying ₹25k-80k/month salary)

Price: ₹399/month
Market: India first → Global Indian diaspora → World

═══════════════════════════════════
## CORE FEATURES (Build Priority)
═══════════════════════════════════

MUST HAVE (MVP):
P1. Indian food database + calorie tracking
P2. AI fitness coach (Ollama + RAG)
P3. Personalized workout + diet plan
P4. Smart health warnings (15 warnings)
P5. Body fat % estimation
P6. Daily quest system + XP points

SHOULD HAVE (V2):
P7. Friends leaderboard
P8. Instagram sharing
P9. 3-month wrapped
P10. Avatar customization

NICE TO HAVE (V3):
P11. Wearable integration
P12. Doctor connect
P13. Supplement guidance
P14. Regional language support

═══════════════════════════════════
## ARCHITECTURE DECISIONS
═══════════════════════════════════

FRONTEND:
- React + TypeScript
- Framer Motion (animations)
- Mobile first (390px)
- 3 themes: Aurora, Graphite, Neon

AI LAYER:
- Ollama (local LLM - Llama 3.1 8B)
- ChromaDB (vector database for RAG)
- LlamaIndex (RAG framework)
- AI ONLY for: advice, plans, explanations
- NEVER use AI for: calculations, warnings

DATABASE:
- Firebase Firestore (user data)
- IFCT 2017 (542 Indian ingredients)
- Traditional recipes (200 dishes)
- Custom recipes (user created)

CALCULATIONS (Pure Math - No AI):
- BMR: Mifflin St Jeor equation
- TDEE: BMR × activity multiplier
- Macros: Based on goal + LBM
- Body fat: Navy formula
- Warnings: If/else logic only

═══════════════════════════════════
## WHAT'S BUILT ✅
═══════════════════════════════════

UI/SCREENS:
✅ ThemeSelector (3 themes)
✅ OnboardingFlow (4 steps)
✅ AIAnalysis (loading screen)
✅ Home Dashboard
✅ Workout screen
✅ FoodSearch screen
✅ FoodDetail screen
✅ CustomRecipe builder
✅ Leaderboard
✅ Profile screen

COMPONENTS:
✅ FitAvatar (SVG, 7 stages)
✅ RingMeter (health score)
✅ Spark (charts)
✅ TabBar (navigation)
✅ WarningCard (15 warnings)

DATA:
✅ 542 IFCT ingredients (indianFoods.ts)
✅ Food calculator (pure math)
✅ Warning engine (15 warnings)
✅ Theme system (3 themes)
✅ Food search service

═══════════════════════════════════
## IN PROGRESS 🔄
═══════════════════════════════════

→ Traditional recipes database
  Script: scripts/scrapeRecipes.py
  Running: Scraping tarladalal.com
  Status: In progress

→ Ollama + RAG integration
  Status: Not started
  Next task

═══════════════════════════════════
## TODO ❌
═══════════════════════════════════

IMMEDIATE (this week):
1. Ollama integration
2. RAG pipeline (ChromaDB)
3. AI coach service
4. Firebase setup
5. Deploy to Netlify

NEXT WEEK:
6. Connect food log to AI
7. Real plan generation
8. Body fat estimation
9. Progress tracking
10. Beta user testing

═══════════════════════════════════
## FILE STRUCTURE
═══════════════════════════════════

FitIQ/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FitAvatar.tsx
│   │   │   ├── RingMeter.tsx
│   │   │   ├── Spark.tsx
│   │   │   ├── TabBar.tsx
│   │   │   └── warnings/
│   │   │       └── WarningCard.tsx
│   │   ├── screens/
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── OnboardingFlow.tsx
│   │   │   ├── AIAnalysis.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Workout.tsx
│   │   │   ├── FoodSearch.tsx
│   │   │   ├── FoodDetail.tsx
│   │   │   ├── CustomRecipe.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── Profile.tsx
│   │   ├── data/
│   │   │   ├── indianFoods.ts (542 foods)
│   │   │   └── traditionalRecipes.ts
│   │   ├── utils/
│   │   │   ├── foodCalculator.ts
│   │   │   └── warnings/
│   │   │       ├── warningEngine.ts
│   │   │       ├── warningTypes.ts
│   │   │       └── warningCooldowns.ts
│   │   ├── services/
│   │   │   └── foodSearchService.ts
│   │   ├── context/
│   │   │   ├── ThemeContext.tsx
│   │   │   └── UserContext.tsx
│   │   └── themes/
│   │       └── tokens.ts
├── design/ (Claude Design files)
├── scripts/
│   ├── scrapeRecipes.py
│   └── buildRecipeDB.ts
├── ifct-data/
├── indb-data/
├── CLAUDE.md
└── PROJECT_MANAGER.md

═══════════════════════════════════
## CODING RULES
═══════════════════════════════════

1. NEVER use AI for math calculations
2. NEVER rebuild what's already built
3. ALWAYS check this file before coding
4. ONE task per session
5. Mobile first always (390px)
6. Framer Motion for ALL animations
7. Match Aurora theme colors by default
8. Indian context in everything
9. Science backed warnings only
10. Pure TypeScript, no any types

═══════════════════════════════════
## CURRENT SESSION TASK
═══════════════════════════════════

Update this section each session:

Session: June 2026 — Test-hardening sprint (COMPLETE)
Test suite: 582 tests / 26 suites, all green.
Bug fixes landed this sprint:
- W15 warning false-fired with no tea logged (missing >0 guard)
- Body-comp entries now sorted by date on load
- Custom recipe IDs could collide (added random suffix)
- Cardio rest-seconds clamp allowed 0; strength min 15
New coverage: warningEngine W05–W15, program fallback
invariant, generateProgramPhase happy path, useCustomPlan.

⚠ OPEN FINDINGS (surfaced, not yet fixed):
1. DEAD WARNINGS — useWarnings.ts buildStats() hardcodes
   placeholder constants, so ~9 of 15 warnings can NEVER
   fire in production (W04, W07–W09, W11–W15). Pinned by
   warningReachability.test.ts. Needs real tracked data
   wired into buildStats.
2. generateProgramPhase trusts AI weeklyPlan verbatim — no
   sanitization (bogus exerciseIds / out-of-range sets pass
   through). planEditorService does sanitize. Product call.

Next task (was queued): Ollama + RAG integration
- src/services/ollamaService.ts, ragService.ts, useAICoach.ts

═══════════════════════════════════
## PROMPTS THAT WORK WELL
═══════════════════════════════════

Start every Claude Code session with:

"Read PROJECT_MANAGER.md first.
Don't re-read other files.
Current task: [TASK]
Create only: [FILES]
Reference only: [FILES]
Don't modify existing files."

═══════════════════════════════════
## BUSINESS CONTEXT
═══════════════════════════════════

Founder: Sanjay (solo founder)
Location: Pallavaram, Tamil Nadu
Background: Deep learning + PyATS engineer
Family: Construction materials business
Timeline: Launch in 3 months
Revenue goal: ₹1L/month by month 6
Target: 10M users in 5 years

Validation:
- Survey: 15 responses so far
- ValidatorAI score: 78/100
- Gemini analysis: 85/100
- Market: $2.45B by 2033

Competition:
- HealthifyMe: ₹999-1699/month, generic AI
- Fittr: ₹1853/month, human coaches
- Our advantage: Accurate Indian food +
  Scientific explanations + Affordable