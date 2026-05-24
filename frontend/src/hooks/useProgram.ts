import { useCallback, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useBodyComp } from './useBodyComp';
import {
  ProgramConfig, PhaseSpec, ProgramType,
  buildPhaseSpecs, getCurrentPhase, projectTimeline,
} from '../services/programPhaseEngine';
import { generateProgramPhase, GeneratedProgramPhase } from '../services/programPlannerService';

const CONFIG_KEY = 'fitiq.program.config';
const PLANS_KEY  = 'fitiq.program.plans';

function loadConfig(): ProgramConfig | null {
  try { const r = localStorage.getItem(CONFIG_KEY); return r ? JSON.parse(r) as ProgramConfig : null; }
  catch { return null; }
}
function loadPlans(): Record<string, GeneratedProgramPhase> {
  try { const r = localStorage.getItem(PLANS_KEY); return r ? JSON.parse(r) as Record<string, GeneratedProgramPhase> : {}; }
  catch { return {}; }
}
function saveConfig(c: ProgramConfig) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)); } catch { /* quota */ }
}
function savePlans(p: Record<string, GeneratedProgramPhase>) {
  try { localStorage.setItem(PLANS_KEY, JSON.stringify(p)); } catch { /* quota */ }
}

export function useProgram() {
  const { user } = useUser();
  const { tdee, latest, measurements } = useBodyComp();

  const [config, setConfig] = useState<ProgramConfig | null>(loadConfig);
  const [plans, setPlans]   = useState<Record<string, GeneratedProgramPhase>>(loadPlans);
  const [generating, setGenerating] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const phases       = useMemo(() => config ? buildPhaseSpecs(config) : [], [config]);
  const currentPhase = useMemo(() => config ? getCurrentPhase(config) : null, [config]);
  const currentPlan  = currentPhase ? (plans[`phase_${currentPhase.phase}`] ?? null) : null;

  const daysElapsed = useMemo(() => {
    if (!config) return 0;
    return Math.floor((Date.now() - new Date(config.startDate + 'T00:00:00').getTime()) / 86400000);
  }, [config]);

  const programEndDate = useMemo(() => {
    if (!config) return null;
    const d = new Date(config.startDate + 'T00:00:00');
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  }, [config]);

  const daysRemaining = useMemo(() => {
    if (!programEndDate) return 0;
    return Math.max(0, Math.ceil((new Date(programEndDate).getTime() - Date.now()) / 86400000));
  }, [programEndDate]);

  const timeline = useMemo(() => {
    if (!config || !latest) return [];
    return projectTimeline({
      type: config.type,
      currentLeanMass: latest.leanMass,
      currentBodyFatPct: latest.bodyFatPct,
      currentWeight: latest.weightKg,
      sex: user.sex,
      measurements,
    });
  }, [config, latest, user.sex, measurements]);

  const _generatePhase = useCallback(async (cfg: ProgramConfig, phase: PhaseSpec) => {
    setGenerating(true);
    setError(null);
    try {
      const currentLean = latest?.leanMass ?? cfg.startLeanMass;
      const currentBf   = latest?.bodyFatPct ?? cfg.startBodyFatPct;
      const prevPlan    = phase.phase > 1 ? plans[`phase_${phase.phase - 1}`] : undefined;
      const delta       = latest && phase.phase > 1
        ? {
            leanMassDelta:  Math.round((currentLean - cfg.startLeanMass) * 10) / 10,
            bodyFatDelta:   Math.round((currentBf   - cfg.startBodyFatPct) * 10) / 10,
            weightDelta:    Math.round(((latest.weightKg) - cfg.startWeight) * 10) / 10,
          }
        : undefined;

      const plan = await generateProgramPhase({
        config: cfg,
        phase,
        tdee: tdee || cfg.startTDEE,
        leanMassKg: currentLean,
        bodyFatPct: currentBf,
        diet: user.diet,
        prevPhaseNotes: prevPlan?.keyFocus,
        bodyCompDelta: delta,
      });

      setPlans(prev => {
        const next = { ...prev, [`phase_${phase.phase}`]: plan };
        savePlans(next);
        return next;
      });
    } catch {
      setError('Failed to generate plan. Make sure Ollama is running with llama3.1.');
    } finally {
      setGenerating(false);
    }
  }, [user.diet, tdee, latest, plans]);

  const startProgram = useCallback(async (type: ProgramType) => {
    if (!user.isPremium) return;
    const cfg: ProgramConfig = {
      id: `prog_${Date.now()}`,
      type,
      durationMonths: 3,
      startDate: new Date().toISOString().slice(0, 10),
      startWeight:     latest?.weightKg   ?? user.weightKg,
      startLeanMass:   latest?.leanMass   ?? Math.round(user.weightKg * 0.82),
      startBodyFatPct: latest?.bodyFatPct ?? 18,
      startTDEE: tdee || Math.round(user.weightKg * 30),
      sex: user.sex, heightCm: user.heightCm, age: user.age, activity: user.activity,
    };
    setConfig(cfg);
    saveConfig(cfg);
    setError(null);
    // Generate Phase 1 immediately
    await _generatePhase(cfg, buildPhaseSpecs(cfg)[0]);
  }, [user, latest, tdee, _generatePhase]);

  const regenerateCurrent = useCallback(async () => {
    if (!config || !currentPhase) return;
    await _generatePhase(config, currentPhase);
  }, [config, currentPhase, _generatePhase]);

  const generatePhaseN = useCallback(async (n: 1 | 2 | 3) => {
    if (!config) return;
    const phase = buildPhaseSpecs(config).find(p => p.phase === n);
    if (phase) await _generatePhase(config, phase);
  }, [config, _generatePhase]);

  const clearProgram = useCallback(() => {
    setConfig(null);
    setPlans({});
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(PLANS_KEY);
  }, []);

  return {
    config, phases, currentPhase, currentPlan, plans,
    generating, error, timeline,
    daysElapsed, daysRemaining, programEndDate,
    startProgram, regenerateCurrent, generatePhaseN, clearProgram,
  };
}
