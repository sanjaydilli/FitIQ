import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser, Goal, Sex, Diet, Activity } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, setApiUrl } from '../services/aiService';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { Icon, IconName } from '../components/Icon';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${theme.cardBorder}` }}>
      <div style={{ width: 100, fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 700, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange, min, max, step = 0.1 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      value={value}
      min={min} max={max} step={step}
      onChange={e => onChange(parseFloat(e.target.value) || min)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        background: focused ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${focused ? theme.accent + '50' : theme.cardBorder}`,
        borderRadius: 10,
        padding: '8px 12px', color: theme.text,
        fontSize: 14, fontFamily: theme.mono, outline: 'none', fontWeight: 700,
        boxShadow: focused ? `0 0 0 3px ${theme.accent}18` : 'none',
        transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
      }}
    />
  );
}

function PillSelect<T extends string>({ options, value, onChange }: { options: { id: T; label: string; icon?: IconName }[]; value: T; onChange: (v: T) => void }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const sel = value === o.id;
        return (
          <motion.button key={o.id} whileTap={{ scale: 0.93 }} onClick={() => onChange(o.id)}
            style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: sel ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` : 'rgba(255,255,255,0.07)',
              color: sel ? theme.onAccent : 'rgba(255,255,255,0.6)',
              fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
            {o.icon && <Icon name={o.icon} size={11} color={sel ? theme.onAccent : 'rgba(255,255,255,0.5)'} strokeWidth={2} />}
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export function Settings() {
  const { theme } = useTheme();
  const { user, update } = useUser();
  const { guestMode } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [apiInput, setApiInput] = useState(() => getApiUrl());

  const [name, setName]           = useState(user.name);
  const [sex, setSex]             = useState<Sex>(user.sex);
  const [age, setAge]             = useState(user.age);
  const [heightCm, setHeightCm]   = useState(user.heightCm);
  const [weightKg, setWeightKg]   = useState(user.weightKg);
  const [goal, setGoal]           = useState<Goal>(user.goal);
  const [diet, setDiet]           = useState<Diet>(user.diet);
  const [activity, setActivity]   = useState<Activity>(user.activity);

  const handleSave = () => {
    update({ name, sex, age, heightCm, weightKg, goal, diet, activity });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate(-1); }, 900);
  };

  return (
    <Background>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '14px 20px',
        background: theme.id === 'aurora' ? 'rgba(8,6,15,0.7)' : theme.id === 'neon' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderBottom: `1px solid ${theme.cardBorder}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.cardBorder}`, borderRadius: 10, padding: '6px 10px', color: theme.text, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-left" size={16} color={theme.text} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700 }}>SETTINGS</div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: theme.text, marginTop: 1 }}>Goals & Profile</div>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ y: -1 }}
          onClick={handleSave}
          style={{
            padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: saved ? 'rgba(74,222,128,0.2)' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: saved ? '#4ade80' : theme.onAccent,
            fontSize: 13, fontWeight: 700,
            boxShadow: saved ? 'none' : `0 4px 14px ${theme.accent}30`,
            fontFamily: theme.font,
          }}
        >
          {saved ? '✓ Saved' : 'Save'}
        </motion.button>
      </div>

      <div style={{ paddingTop: 64, paddingBottom: 40, height: '100%', overflowY: 'auto' }}>
        {/* Guest mode banner */}
        {guestMode && (
          <div style={{
            margin: '12px 16px 0',
            padding: '12px 14px',
            borderRadius: 14,
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', marginBottom: 4 }}>
              Guest Mode — Data saved locally
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              Add Firebase credentials to sync across devices and enable accounts.
              Set REACT_APP_FIREBASE_* variables and rebuild.
            </div>
          </div>
        )}

        {/* Personal */}
        <div style={{ padding: '12px 16px 6px' }}>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>PERSONAL</div>
          <Card style={{ borderRadius: 18, overflow: 'hidden', padding: 0 }}>
            <Row label="Name">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${theme.cardBorder}`, borderRadius: 10,
                  padding: '8px 12px', color: theme.text, fontSize: 14, outline: 'none',
                  fontWeight: 700, fontFamily: theme.font,
                }}
              />
            </Row>
            <Row label="Sex">
              <PillSelect<Sex>
                options={[{ id: 'male', label: 'Male' }, { id: 'female', label: 'Female' }]}
                value={sex} onChange={setSex}
              />
            </Row>
            <Row label="Age (yrs)">
              <NumberInput value={age} onChange={setAge} min={13} max={99} step={1} />
            </Row>
            <Row label="Height (cm)">
              <NumberInput value={heightCm} onChange={setHeightCm} min={130} max={220} step={1} />
            </Row>
            <Row label="Weight (kg)">
              <NumberInput value={weightKg} onChange={setWeightKg} min={30} max={200} step={0.1} />
            </Row>
          </Card>
        </div>

        {/* Goal */}
        <div style={{ padding: '12px 16px 6px' }}>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>FITNESS GOAL</div>
          <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
            <PillSelect<Goal>
              options={[
                { id: 'lose', label: 'Lose fat', icon: 'flame' },
                { id: 'gain', label: 'Build muscle', icon: 'muscle' },
                { id: 'main', label: 'Maintain', icon: 'scale' },
                { id: 'endur', label: 'Endurance', icon: 'run' },
              ]}
              value={goal} onChange={setGoal}
            />
          </Card>
        </div>

        {/* Diet */}
        <div style={{ padding: '0 16px 6px' }}>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>DIET TYPE</div>
          <Card style={{ borderRadius: 18, padding: '14px 16px' }}>
            <PillSelect<Diet>
              options={[
                { id: 'veg', label: 'Vegetarian', icon: 'leaf' },
                { id: 'eggetarian', label: 'Eggetarian', icon: 'food' },
                { id: 'nveg', label: 'Non-veg', icon: 'utensils' },
                { id: 'vegan', label: 'Vegan', icon: 'leaf' },
                { id: 'jain', label: 'Jain', icon: 'leaf' },
              ]}
              value={diet} onChange={setDiet}
            />
          </Card>
        </div>

        {/* Activity */}
        <div style={{ padding: '0 16px 6px' }}>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>ACTIVITY LEVEL</div>
          <Card style={{ borderRadius: 18, overflow: 'hidden', padding: 0 }}>
            {([
              { id: 'sedentary' as Activity, label: 'Sedentary', sub: 'Desk job, no exercise' },
              { id: 'light' as Activity, label: 'Light', sub: '1–3 workouts/week' },
              { id: 'moderate' as Activity, label: 'Moderate', sub: '3–5 workouts/week' },
              { id: 'active' as Activity, label: 'Active', sub: '6+ workouts/week' },
            ]).map((opt, i, arr) => (
              <motion.div
                key={opt.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivity(opt.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${theme.cardBorder}` : 'none',
                  background: activity === opt.id ? `${theme.accent}12` : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${activity === opt.id ? theme.accent : theme.cardBorder}`,
                  background: activity === opt.id ? theme.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.2s, background 0.2s',
                }}>
                  {activity === opt.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.onAccent }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: activity === opt.id ? 700 : 600, color: activity === opt.id ? theme.text : theme.textDim }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: theme.textMute, marginTop: 1 }}>{opt.sub}</div>
                </div>
              </motion.div>
            ))}
          </Card>
        </div>

        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ fontSize: 11, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 2, fontWeight: 700, marginBottom: 8, marginTop: 4 }}>
            AI BACKEND URL
          </div>
          <Card style={{ borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: theme.textMute, fontFamily: theme.mono, letterSpacing: 1.2, fontWeight: 700, marginBottom: 6 }}>API URL</div>
            <input
              value={apiInput}
              onChange={e => setApiInput(e.target.value)}
              onBlur={() => setApiUrl(apiInput)}
              placeholder="https://fitiq-api.railway.app"
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: theme.text, fontFamily: theme.mono }}
            />
          </Card>
          <div style={{ fontSize: 11, color: theme.textMute, marginTop: 8, lineHeight: 1.5, paddingLeft: 2 }}>
            Leave as default to use the production API. Change only if self-hosting.
          </div>
        </div>

        <div style={{ padding: '8px 16px 16px' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            onClick={() => {
              update({ name: '' });
              navigate('/onboarding', { replace: true });
            }}
            style={{
              width: '100%', padding: 14, borderRadius: 14,
              border: `1px solid ${theme.cardBorder}`,
              background: 'rgba(255,255,255,0.03)', color: theme.textDim,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: theme.font,
            }}
          >
            Restart Onboarding
          </motion.button>
        </div>
      </div>
    </Background>
  );
}
