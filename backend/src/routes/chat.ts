import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';
import { NUTRITION_CONTEXT } from '../nutrition-context';

const router = Router();
const groq = new Groq();

const MODEL = 'llama-3.3-70b-versatile';

interface ChatBody {
  message: string;
  userStats: {
    name?: string;
    gender?: string;
    weightKg?: number;
    goal?: string;
    dietType?: string;
    calories?: number;
    targetCalories?: number;
    protein?: number;
    targetProtein?: number;
    carbs?: number;
    fat?: number;
    water?: number;
    targetWater?: number;
    steps?: number;
    workoutMinutesAgo?: number;
    consecutiveWorkoutDays?: number;
  };
}

const SYSTEM_PROMPT = `You are FitIQ Coach, an expert AI fitness and nutrition coach specialized in Indian health and fitness. You have deep knowledge of Indian foods, cooking methods, and dietary patterns.

${NUTRITION_CONTEXT}

GUIDELINES:
- Always suggest Indian foods and meals by name
- Use the user's exact data (calories, protein, etc.) in your response
- Be scientific but conversational — explain the WHY behind recommendations
- Keep responses under 180 words
- Never give medical advice or diagnose conditions
- Be encouraging and positive
- Format numbers clearly (e.g. "you have 45g protein left today")
- If asked about non-fitness topics, politely redirect to health/fitness`;

router.post('/', async (req: Request, res: Response) => {
  const { message, userStats } = req.body as ChatBody;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const caloriesLeft = (userStats.targetCalories ?? 2000) - (userStats.calories ?? 0);
  const proteinLeft  = (userStats.targetProtein  ?? 150)  - (userStats.protein  ?? 0);
  const waterLeft    = (userStats.targetWater    ?? 3.5)  - (userStats.water    ?? 0);

  const userContext = `USER PROFILE:
- Gender: ${userStats.gender || 'not specified'}
- Weight: ${userStats.weightKg || '?'} kg
- Goal: ${userStats.goal || 'not specified'}
- Diet: ${userStats.dietType || 'not specified'}

TODAY'S PROGRESS:
- Calories: ${userStats.calories ?? 0} / ${userStats.targetCalories ?? 2000} kcal (${caloriesLeft > 0 ? caloriesLeft + ' remaining' : Math.abs(caloriesLeft) + ' over'})
- Protein: ${userStats.protein ?? 0}g / ${userStats.targetProtein ?? 150}g (${proteinLeft > 0 ? proteinLeft + 'g remaining' : Math.abs(proteinLeft) + 'g over'})
- Carbs: ${userStats.carbs ?? 0}g | Fat: ${userStats.fat ?? 0}g
- Water: ${userStats.water ?? 0}L / ${userStats.targetWater ?? 3.5}L (${waterLeft > 0 ? waterLeft.toFixed(1) + 'L remaining' : 'goal met ✓'})
- Steps: ${userStats.steps ?? 0} / 10000
- Workout: ${userStats.workoutMinutesAgo && userStats.workoutMinutesAgo < 720 ? userStats.workoutMinutesAgo + ' min ago' : 'not today'}
- Streak: ${userStats.consecutiveWorkoutDays ?? 0} days

USER QUESTION: ${message}`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 350,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userContext },
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim() ?? '';
    return res.json({ reply });
  } catch (err) {
    console.error('Groq API error:', err);
    return res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

export default router;
