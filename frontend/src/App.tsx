import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { PhoneFrame } from './components/PhoneFrame';
import { ThemeSelector } from './screens/ThemeSelector';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { AIAnalysis } from './screens/AIAnalysis';
import { Home } from './screens/Home';
import { Workout } from './screens/Workout';
import { FoodScan } from './screens/FoodScan';
import { Leaderboard } from './screens/Leaderboard';
import { Profile } from './screens/Profile';
import { AvatarStudio } from './screens/AvatarStudio';
import { AvatarStyleCompare } from './screens/AvatarStyleCompare';
import { FoodSearch } from './screens/FoodSearch';
import { FoodDetail } from './screens/FoodDetail';
import { CustomRecipe } from './screens/CustomRecipe';

function AnimatedRoutes() {
  const location = useLocation();
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
        <Routes location={location}>
          <Route path="/" element={<ThemeSelector />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/analysis" element={<AIAnalysis />} />
          <Route path="/home" element={<Home />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/scan" element={<FoodScan />} />
          <Route path="/friends" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/avatar" element={<AvatarStudio />} />
          <Route path="/avatar-styles" element={<AvatarStyleCompare />} />
          <Route path="/food" element={<FoodSearch />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="/recipe" element={<CustomRecipe />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <PhoneFrame>
            <AnimatedRoutes />
          </PhoneFrame>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}
