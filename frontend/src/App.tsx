import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PhoneFrame } from './components/PhoneFrame';
import { useAndroidBack } from './hooks/useAndroidBack';

// Eagerly loaded — part of the initial shell
import { ThemeSelector } from './screens/ThemeSelector';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { AIAnalysis } from './screens/AIAnalysis';
import { Home } from './screens/Home';
import { Workout } from './screens/Workout';
import { FoodLog } from './screens/FoodLog';
import { Leaderboard } from './screens/Leaderboard';
import { Profile } from './screens/Profile';
import { Login } from './screens/auth/Login';
import { Signup } from './screens/auth/Signup';

// Lazy loaded — heavy routes
const FoodSearch        = lazy(() => import('./screens/FoodSearch').then(m => ({ default: m.FoodSearch })));
const FoodDetail        = lazy(() => import('./screens/FoodDetail').then(m => ({ default: m.FoodDetail })));
const CustomRecipe      = lazy(() => import('./screens/CustomRecipe').then(m => ({ default: m.CustomRecipe })));
const AICoach           = lazy(() => import('./screens/AICoach').then(m => ({ default: m.AICoach })));
const DailyRoutine      = lazy(() => import('./screens/DailyRoutine').then(m => ({ default: m.DailyRoutine })));
const WorkoutLogger     = lazy(() => import('./screens/WorkoutLogger').then(m => ({ default: m.WorkoutLogger })));
const StrengthHistory   = lazy(() => import('./screens/StrengthHistory').then(m => ({ default: m.StrengthHistory })));
const BodyComp          = lazy(() => import('./screens/BodyComp').then(m => ({ default: m.BodyComp })));
const ActivityScreen    = lazy(() => import('./screens/ActivityScreen').then(m => ({ default: m.ActivityScreen })));
const MealPlanner       = lazy(() => import('./screens/MealPlanner').then(m => ({ default: m.MealPlanner })));
const WeeklyWrapped     = lazy(() => import('./screens/WeeklyWrapped').then(m => ({ default: m.WeeklyWrapped })));
const Achievements      = lazy(() => import('./screens/Achievements').then(m => ({ default: m.Achievements })));
const Settings          = lazy(() => import('./screens/Settings').then(m => ({ default: m.Settings })));
const Program           = lazy(() => import('./screens/Program').then(m => ({ default: m.Program })));
const Recipes           = lazy(() => import('./screens/Recipes').then(m => ({ default: m.Recipes })));
const FoodScan          = lazy(() => import('./screens/FoodScan').then(m => ({ default: m.FoodScan })));

function RouteSpinner() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.6)' }}
      />
    </div>
  );
}

// Redirect to /login if not authenticated
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) return <RouteSpinner />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// Redirect already-authed users away from login/signup
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { currentUser, authLoading } = useAuth();
  if (authLoading) return <RouteSpinner />;
  if (currentUser) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  useAndroidBack();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 0.8, 0.22, 1] }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={<RouteSpinner />}>
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/" element={<PublicOnly><ThemeSelector /></PublicOnly>} />
            <Route path="/login"  element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />

            {/* Protected routes */}
            <Route path="/onboarding" element={<RequireAuth><OnboardingFlow /></RequireAuth>} />
            <Route path="/analysis"   element={<RequireAuth><AIAnalysis /></RequireAuth>} />
            <Route path="/home"       element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/workout"    element={<RequireAuth><Workout /></RequireAuth>} />
            <Route path="/food-log"   element={<RequireAuth><FoodLog /></RequireAuth>} />
            <Route path="/friends"    element={<RequireAuth><Leaderboard /></RequireAuth>} />
            <Route path="/profile"    element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/food"       element={<RequireAuth><FoodSearch /></RequireAuth>} />
            <Route path="/food/:id"   element={<RequireAuth><FoodDetail /></RequireAuth>} />
            <Route path="/recipe"     element={<RequireAuth><CustomRecipe /></RequireAuth>} />
            <Route path="/coach"      element={<RequireAuth><AICoach /></RequireAuth>} />
            <Route path="/routine"    element={<RequireAuth><DailyRoutine /></RequireAuth>} />
            <Route path="/workout/log"     element={<RequireAuth><WorkoutLogger /></RequireAuth>} />
            <Route path="/workout/history" element={<RequireAuth><StrengthHistory /></RequireAuth>} />
            <Route path="/body-comp"  element={<RequireAuth><BodyComp /></RequireAuth>} />
            <Route path="/activity"   element={<RequireAuth><ActivityScreen /></RequireAuth>} />
            <Route path="/meal-plan"  element={<RequireAuth><MealPlanner /></RequireAuth>} />
            <Route path="/wrapped"    element={<RequireAuth><WeeklyWrapped /></RequireAuth>} />
            <Route path="/achievements" element={<RequireAuth><Achievements /></RequireAuth>} />
            <Route path="/settings"   element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/program"    element={<RequireAuth><Program /></RequireAuth>} />
            <Route path="/recipes"    element={<RequireAuth><Recipes /></RequireAuth>} />
            <Route path="/scan"       element={<RequireAuth><FoodScan /></RequireAuth>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <BrowserRouter>
            <PhoneFrame>
              <AnimatedRoutes />
            </PhoneFrame>
          </BrowserRouter>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
