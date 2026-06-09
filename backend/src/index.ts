import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import chatRouter from './routes/chat';
import mealPlanRouter from './routes/mealPlan';

const app  = express();
const PORT = process.env.PORT ?? 3001;

// Security
app.use(helmet());
app.use(express.json({ limit: '16kb' }));

// CORS — allow frontend origin
const allowed = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'https://localhost',   // Capacitor Android WebView (androidScheme: 'https')
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting — 60 req/min per IP
app.use('/api', rateLimit({
  windowMs: 60_000,
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Routes
app.use('/api/chat',      chatRouter);
app.use('/api/meal-plan', mealPlanRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'FitIQ API' });
});

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`✅ FitIQ API running on port ${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY not set — AI features will fail');
  }
});
