import { UserStats } from '../utils/warnings/warningTypes';

export interface FoodLogItem {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MODEL = 'llama3.1';
const getOllama = () => localStorage.getItem('fitiq.server.ollama') || 'http://localhost:11434';
const getRag    = () => localStorage.getItem('fitiq.server.rag')    || 'http://localhost:8000';

const SYSTEM_PROMPT =
  'You are FitIQ, an expert AI fitness coach specialized in Indian nutrition and fitness. ' +
  'Always suggest Indian foods. Be scientific but simple. ' +
  "Use the user's exact data in your response. Keep answers under 200 words. " +
  'Never give medical advice. Always mention Indian food alternatives.';

const GOAL_LABEL: Record<UserStats['goal'], string> = {
  fatLoss: 'Fat Loss',
  muscle: 'Muscle Gain',
  recomp: 'Body Recomposition',
  maintain: 'Weight Maintenance',
};

async function fetchRAGContext(question: string): Promise<string | null> {
  try {
    const res = await fetch(`${getRag()}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: question }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { context: string };
    return data.context?.trim() || null;
  } catch {
    return null;
  }
}

function buildContextPrompt(
  userStats: UserStats,
  foodLog: FoodLogItem[],
  question: string,
  ragContext: string | null
): string {
  const caloriesLeft = userStats.targetCalories - userStats.calories;
  const proteinLeft = userStats.targetProtein - userStats.protein;
  const waterLeft = userStats.targetWater - userStats.water;

  const foodLogLines =
    foodLog.length > 0
      ? foodLog
          .map(f => `  - ${f.name}: ${f.grams}g (${f.calories} kcal, ${f.protein}g protein)`)
          .join('\n')
      : '  - No foods logged yet today';

  const ragSection = ragContext
    ? `\nSCIENTIFIC REFERENCE (IFCT 2017 / ACSM / NIN):\n${ragContext}\n`
    : '';

  return `SYSTEM: ${SYSTEM_PROMPT}
${ragSection}
USER PROFILE:
- Gender: ${userStats.gender}
- Weight: ${userStats.weight} kg
- Goal: ${GOAL_LABEL[userStats.goal]}
- Diet type: ${userStats.dietType}
- Sleep last night: ${userStats.lastNightSleep}h
- Strength trend: ${userStats.strengthTrend}

TODAY'S NUTRITION (so far):
- Calories: ${userStats.calories} / ${userStats.targetCalories} kcal (${caloriesLeft > 0 ? caloriesLeft + ' kcal remaining' : Math.abs(caloriesLeft) + ' kcal over target'})
- Protein: ${userStats.protein}g / ${userStats.targetProtein}g (${proteinLeft > 0 ? proteinLeft + 'g remaining' : Math.abs(proteinLeft) + 'g over'})
- Carbs: ${userStats.carbs}g | Fat: ${userStats.fat}g | Fiber: ${userStats.fiber}g
- Water: ${userStats.water}L / ${userStats.targetWater}L (${waterLeft > 0 ? waterLeft.toFixed(1) + 'L remaining' : 'goal met ✓'})
- Meals logged: ${userStats.mealCount}

FOODS EATEN TODAY:
${foodLogLines}

ACTIVITY:
- Steps: ${userStats.steps} / ${userStats.targetSteps}
- Workout: ${
  userStats.workoutMinutesAgo > 0 && userStats.workoutMinutesAgo < 720
    ? userStats.workoutMinutesAgo + ' minutes ago'
    : 'Not today'
}
- Consecutive workout days: ${userStats.consecutiveWorkoutDays}

MICRONUTRIENTS:
- Iron: ${userStats.ironIntake} mg | Magnesium: ${userStats.magnesiumIntake} mg
- Omega-3: ${userStats.omega3Intake} g | Zinc: ${userStats.zincIntake} mg

USER QUESTION: ${question}

Respond in under 200 words. Use the exact numbers above. Suggest specific Indian foods by name.`;
}

export async function askFitIQCoach(
  userStats: UserStats,
  todaysFoodLog: FoodLogItem[],
  question: string
): Promise<string> {
  const ragContext = await fetchRAGContext(question);
  const prompt = buildContextPrompt(userStats, todaysFoodLog, question, ragContext);

  const response = await fetch(`${getOllama()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { response: string };
  return data.response.trim();
}
