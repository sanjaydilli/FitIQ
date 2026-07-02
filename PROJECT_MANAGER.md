# FitIQ — Project Manager Brief
# Claude Code reads this every session
# Last updated: July 2, 2026

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

MUST HAVE (MVP): ✅ ALL BUILT
P1. Indian food database + calorie tracking ✅
P2. AI fitness coach (Groq cloud LLM) ✅
P3. Personalized workout + diet plan ✅
P4. Smart health warnings ✅
P5. Body fat % estimation ✅
P6. Achievements + streaks ✅

SHOULD HAVE (V2):
P7. Friends leaderboard (UI ✅, backend ❌)
P8. Instagram sharing ❌
P9. Weekly wrapped ✅
P10. Avatar customization ❌ (FitAvatar removed)

NICE TO HAVE (V3):
P11. Wearable integration ❌
P12. Doctor connect ❌
P13. Supplement guidance ❌
P14. Regional language support ❌

═══════════════════════════════════
## ARCHITECTURE (as actually built)
═══════════════════════════════════

FRONTEND:
- React + TypeScript (CRA / react-scripts)
- Framer Motion (animations)
- Tailwind CSS 4
- react-router-dom 7
- Capacitor 8 → Android APK
  (haptics, keyboard, local notifications,
   splash screen, status bar, step counter)
- Mobile first (390px)
- 3 themes: Aurora, Graphite, Neon

AI LAYER (CHANGED from original plan):
- ❌ NOT Ollama/ChromaDB/LlamaIndex anymore
- ✅ Express backend on Railway
  https://fitiq-production-60af.up.railway.app
- ✅ Groq API, model: llama-3.3-70b-versatile
- Routes: /chat (AI coach), /mealPlan
- helmet + CORS + express-rate-limit
- Meal plan macros re-verified with pure math
  regardless of model output
- Legacy RAG experiments live in scripts/
  (buildRAG.py, ragServer.py, chroma_db/)
- AI ONLY for: advice, plans, explanations
- NEVER use AI for: calculations, warnings

DATABASE:
- Firebase Auth + Firestore (auth, user data sync)
- indianFoods.ts: 565 foods (IFCT 2017 + custom X-entries)
  ⚠ Macros cleaned July 2, 2026: 26 fixes
  (oils 0→900 kcal, chicken leg 384→191,
   lemon carbs, USDA fiber double-count in
   X-entries, crab kcal recomputed)
- recipes.ts: ~3,420 dishes with verified macros
- exercises.ts: exercise database

CALCULATIONS (Pure Math - No AI):
- BMR: Mifflin St Jeor equation
- TDEE: BMR × activity multiplier
- Macros: Based on goal + LBM
- Body fat: Navy formula
- Warnings: If/else logic only

TESTS:
- 27 suites, 600 tests, all passing (July 2, 2026)
- `cd frontend && CI=true npx react-scripts test --watchAll=false`

═══════════════════════════════════
## WHAT'S BUILT ✅
═══════════════════════════════════

SCREENS (frontend/src/screens/):
✅ ThemeSelector, OnboardingFlow, AIAnalysis
✅ Home, Workout, WorkoutLogger, StrengthHistory
✅ FoodSearch, FoodDetail, FoodLog, FoodScan
✅ Recipes, DishDetail, CustomRecipe
✅ MealPlanner, PlanEditor, Program
✅ AICoach, ScienceTour
✅ BodyComp, ActivityScreen, DailyRoutine
✅ Achievements, WeeklyWrapped, Leaderboard
✅ Profile, Settings
✅ auth/ (Login, Signup)

COMPONENTS:
✅ ActivityCalendar, Background, Card, Icon,
   IconBadge, LineChart, MacroRing, PhoneFrame,
   Reveal, RingMeter, Spark, TabBar,
   WaterTimeline, warnings/WarningCard

SERVICES:
✅ aiService (backend client)
✅ mealPlannerService (real-dish planner)
✅ planEditorService
✅ programPlannerService + programPhaseEngine
✅ notificationService (local notifications)

HOOKS:
✅ useAICoach, useAchievements, useAndroidBack,
   useBodyComp, useCustomPlan, useCustomRecipes,
   useDailyRoutine, useFoodLog, useNotifications,
   useProgram, useStepCounter, useWarnings,
   useWorkoutLog

BACKEND (backend/):
✅ Express + Groq, deployed on Railway
✅ routes/chat.ts, routes/mealPlan.ts
✅ nutrition-context.ts (coach context)

DATA:
✅ 565 foods, ~3,420 recipes, exercises
✅ Warning engine + cooldowns
✅ Firebase auth + Firestore sync

═══════════════════════════════════
## IN PROGRESS 🔄
═══════════════════════════════════

→ Uncommitted: indianFoods.ts macro cleanup
  (26 fixes, tests green — ready to commit)

═══════════════════════════════════
## TODO ❌ (confirm priorities with Sanjay)
═══════════════════════════════════

- Commit + push macro cleanup
- Leaderboard backend (friends, real data)
- Play Store release build + listing
- Beta user testing
- Instagram sharing (V2)
- Regional languages (V3)
- Wearables (V3)

═══════════════════════════════════
## FILE STRUCTURE
═══════════════════════════════════

FitIQ/
├── frontend/
│   ├── src/
│   │   ├── components/ (14 + warnings/)
│   │   ├── screens/ (27 + auth/)
│   │   ├── data/
│   │   │   ├── indianFoods.ts (565 foods)
│   │   │   ├── recipes.ts (~3,420 dishes)
│   │   │   └── exercises.ts
│   │   ├── utils/
│   │   │   ├── foodCalculator.ts
│   │   │   ├── bodyComposition.ts
│   │   │   ├── date.ts
│   │   │   └── warnings/
│   │   ├── services/ (6 services)
│   │   ├── hooks/ (13 hooks)
│   │   ├── context/ (Auth, Theme, User)
│   │   ├── firebase.ts
│   │   └── __tests__/ (27 suites, 600 tests)
│   ├── android/ (Capacitor)
│   └── capacitor.config.ts
├── backend/ (Express + Groq, Railway)
│   └── src/routes/ (chat, mealPlan)
├── ai-engine/ (formulas, prompts — empty)
├── docs/ (product-spec, research tiers 1-4)
├── scripts/ (RAG experiments, recipe macros)
├── ifct-data/
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
11. Run the test suite before committing
12. Keep this file updated each session

═══════════════════════════════════
## CURRENT SESSION TASK
═══════════════════════════════════

Update this section each session:

Session: July 2, 2026
Done:
- Cleaned indianFoods.ts macros (26 fixes,
  verified against official IFCT 2017 corpus)
- Full test suite run: 27/27 suites,
  600/600 tests passing
- Updated this brief to actual project state
Next: commit macro cleanup, then pick from TODO

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
