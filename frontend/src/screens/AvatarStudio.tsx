import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Background } from '../components/Background';
import { Card } from '../components/Card';
import { BitmojiAvatar } from '../components/BitmojiAvatar';
import {
  AvatarConfig,
  Pose,
  bodyTypes,
  skinTones,
  hairStyles,
  hairColors,
  eyeShapes,
  eyeColors,
  eyebrows,
  noses,
  mouths,
  facialHairOptions,
  outfitTops,
  outfitBottoms,
  outfitColors,
  accessoryOptions,
  backgroundOptions,
  poses,
} from '../avatar/config';

type CategoryId = 'body' | 'face' | 'hair' | 'outfit' | 'accessories' | 'scene';

const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'body', label: 'Body', icon: '💪' },
  { id: 'face', label: 'Face', icon: '🙂' },
  { id: 'hair', label: 'Hair', icon: '💇' },
  { id: 'outfit', label: 'Outfit', icon: '👕' },
  { id: 'accessories', label: 'Extras', icon: '🕶️' },
  { id: 'scene', label: 'Scene', icon: '🎬' },
];

export function AvatarStudio() {
  const { theme } = useTheme();
  const { user, setAvatar, update } = useUser();
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryId>('body');
  const [draft, setDraft] = useState<AvatarConfig>(user.avatar);
  const [showPremiumToast, setShowPremiumToast] = useState<string | null>(null);

  const isPremium = user.isPremium;

  function patch(p: Partial<AvatarConfig>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function tryLockedAction(label: string, fn: () => void, premium?: boolean) {
    if (premium && !isPremium) {
      setShowPremiumToast(label);
      setTimeout(() => setShowPremiumToast(null), 1800);
      return;
    }
    fn();
  }

  function save() {
    setAvatar(draft);
    navigate('/profile');
  }

  function cancel() {
    setDraft(user.avatar);
    navigate('/profile');
  }

  function randomize() {
    const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
    const filterFree = <T,>(arr: readonly T[]): T[] =>
      arr.filter((x) => isPremium || !(x as { premium?: boolean }).premium);
    setDraft((d) => ({
      ...d,
      bodyType: pick(bodyTypes).id,
      skinTone: Math.floor(Math.random() * skinTones.length),
      hairStyle: pick(filterFree(hairStyles)).id,
      hairColor: pick(filterFree(hairColors)).value,
      eyeShape: pick(eyeShapes).id,
      eyeColor: pick(filterFree(eyeColors)).value,
      eyebrow: pick(eyebrows).id,
      nose: pick(noses).id,
      mouth: pick(mouths).id,
      facialHair: pick(filterFree(facialHairOptions)).id,
      outfitTop: pick(filterFree(outfitTops)).id,
      outfitBottom: pick(filterFree(outfitBottoms)).id,
      outfitColor: pick(filterFree(outfitColors)).value,
    }));
  }

  return (
    <Background>
      <div
        className="scroll-y"
        style={{ padding: '60px 0 24px', height: '100%', overflowY: 'auto' }}
      >
        {/* Top bar */}
        <div
          style={{
            padding: '0 20px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={cancel}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 12,
              padding: '8px 12px',
              color: theme.textDim,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: theme.font,
            }}
          >
            ← Cancel
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>Avatar Studio</div>
            <button
              onClick={() => navigate('/avatar-styles')}
              style={{
                background: `${theme.accent}18`,
                border: `1px solid ${theme.accent}40`,
                borderRadius: 8,
                padding: '3px 9px',
                color: theme.accent,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: theme.mono,
                letterSpacing: 0.5,
              }}
            >
              ✦ PICK STYLE
            </button>
          </div>
          <button
            onClick={randomize}
            aria-label="Randomize avatar"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 12,
              padding: '8px 10px',
              color: theme.text,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            🎲
          </button>
        </div>

        {/* Live preview */}
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <Card
            style={{
              padding: 16,
              borderRadius: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at 50% 0%, ${theme.accent2}28, transparent 60%)`,
              }}
            />
            <div style={{ position: 'relative' }}>
              <BitmojiAvatar
                config={draft}
                size={210}
                level={user.level}
                showBackground={true}
                showAura={true}
              />
            </div>
            {/* Pose row */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 4,
              }}
            >
              {poses.map((p) => (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => patch({ pose: p.id as Pose })}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: draft.pose === p.id ? `${theme.accent}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${draft.pose === p.id ? theme.accent : theme.cardBorder}`,
                    color: draft.pose === p.id ? theme.accent : theme.textDim,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </motion.button>
              ))}
            </div>
          </Card>
        </div>

        {/* Category tabs */}
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <Card
            style={{
              borderRadius: 16,
              padding: 4,
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
            }}
          >
            {CATEGORIES.map((c) => {
              const sel = category === c.id;
              return (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(c.id)}
                  style={{
                    flex: 1,
                    minWidth: 60,
                    padding: '8px 4px',
                    background: sel ? `${theme.accent}18` : 'transparent',
                    border: sel ? `1px solid ${theme.accent}` : '1px solid transparent',
                    borderRadius: 12,
                    color: sel ? theme.text : theme.textDim,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{c.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{c.label}</span>
                </motion.button>
              );
            })}
          </Card>
        </div>

        {/* Category content */}
        <div style={{ padding: '0 20px', marginBottom: 18 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {category === 'body' && (
                <>
                  <Section label="Body type">
                    <Row>
                      {bodyTypes.map((b) => (
                        <ChipBtn
                          key={b.id}
                          selected={draft.bodyType === b.id}
                          onClick={() => patch({ bodyType: b.id })}
                          theme={theme}
                          label={b.label}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Skin tone">
                    <Row>
                      {skinTones.map((tone, idx) => (
                        <SwatchBtn
                          key={tone}
                          color={tone}
                          selected={draft.skinTone === idx}
                          onClick={() => patch({ skinTone: idx })}
                          theme={theme}
                        />
                      ))}
                    </Row>
                  </Section>
                </>
              )}

              {category === 'face' && (
                <>
                  <Section label="Eye shape">
                    <Row>
                      {eyeShapes.map((e) => (
                        <ChipBtn
                          key={e.id}
                          selected={draft.eyeShape === e.id}
                          onClick={() => patch({ eyeShape: e.id })}
                          theme={theme}
                          label={e.label}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Eye color">
                    <Row>
                      {eyeColors.map((c) => (
                        <SwatchBtn
                          key={c.id}
                          color={c.value}
                          selected={draft.eyeColor === c.value}
                          onClick={() =>
                            tryLockedAction(`Premium eye color`, () => patch({ eyeColor: c.value }), c.premium)
                          }
                          locked={c.premium && !isPremium}
                          theme={theme}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Eyebrows">
                    <Row>
                      {eyebrows.map((b) => (
                        <ChipBtn
                          key={b.id}
                          selected={draft.eyebrow === b.id}
                          onClick={() => patch({ eyebrow: b.id })}
                          theme={theme}
                          label={b.label}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Nose">
                    <Row>
                      {noses.map((n) => (
                        <ChipBtn
                          key={n.id}
                          selected={draft.nose === n.id}
                          onClick={() => patch({ nose: n.id })}
                          theme={theme}
                          label={n.label}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Mouth">
                    <Row>
                      {mouths.map((m) => (
                        <ChipBtn
                          key={m.id}
                          selected={draft.mouth === m.id}
                          onClick={() => patch({ mouth: m.id })}
                          theme={theme}
                          label={m.label}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Facial hair">
                    <Row>
                      {facialHairOptions.map((f) => (
                        <ChipBtn
                          key={f.id}
                          selected={draft.facialHair === f.id}
                          onClick={() =>
                            tryLockedAction(
                              'Premium facial hair',
                              () => patch({ facialHair: f.id }),
                              f.premium
                            )
                          }
                          locked={f.premium && !isPremium}
                          theme={theme}
                          label={f.label}
                        />
                      ))}
                    </Row>
                  </Section>
                </>
              )}

              {category === 'hair' && (
                <>
                  <Section label="Hairstyle">
                    <Row>
                      {hairStyles.map((h) => (
                        <ChipBtn
                          key={h.id}
                          selected={draft.hairStyle === h.id}
                          onClick={() =>
                            tryLockedAction(
                              'Premium hairstyle',
                              () => patch({ hairStyle: h.id }),
                              h.premium
                            )
                          }
                          locked={h.premium && !isPremium}
                          theme={theme}
                          label={h.label}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Hair color">
                    <Row>
                      {hairColors.map((c) => (
                        <SwatchBtn
                          key={c.id}
                          color={c.value}
                          selected={draft.hairColor === c.value}
                          onClick={() =>
                            tryLockedAction(
                              'Premium hair color',
                              () => patch({ hairColor: c.value }),
                              c.premium
                            )
                          }
                          locked={c.premium && !isPremium}
                          theme={theme}
                        />
                      ))}
                    </Row>
                  </Section>
                </>
              )}

              {category === 'outfit' && (
                <>
                  <Section label="Top">
                    <Row>
                      {outfitTops.map((o) => (
                        <ChipBtn
                          key={o.id}
                          selected={draft.outfitTop === o.id}
                          onClick={() =>
                            tryLockedAction('Premium top', () => patch({ outfitTop: o.id }), o.premium)
                          }
                          locked={o.premium && !isPremium}
                          theme={theme}
                          label={o.label}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Bottom">
                    <Row>
                      {outfitBottoms.map((o) => (
                        <ChipBtn
                          key={o.id}
                          selected={draft.outfitBottom === o.id}
                          onClick={() =>
                            tryLockedAction(
                              'Premium bottom',
                              () => patch({ outfitBottom: o.id }),
                              o.premium
                            )
                          }
                          locked={o.premium && !isPremium}
                          theme={theme}
                          label={o.label}
                        />
                      ))}
                    </Row>
                  </Section>
                  <Section label="Color">
                    <Row>
                      {outfitColors.map((c) => (
                        <SwatchBtn
                          key={c.id}
                          color={c.value}
                          selected={draft.outfitColor === c.value}
                          onClick={() =>
                            tryLockedAction(
                              'Premium color',
                              () => patch({ outfitColor: c.value }),
                              c.premium
                            )
                          }
                          locked={c.premium && !isPremium}
                          theme={theme}
                        />
                      ))}
                    </Row>
                  </Section>
                </>
              )}

              {category === 'accessories' && (
                <Section label="Add accessories">
                  <Row>
                    {accessoryOptions.map((a) => {
                      const on = draft.accessories.includes(a.id);
                      const locked = a.premium && !isPremium;
                      return (
                        <motion.button
                          key={a.id}
                          whileTap={{ scale: 0.94 }}
                          onClick={() =>
                            tryLockedAction(
                              'Premium accessory',
                              () => {
                                const next = on
                                  ? draft.accessories.filter((x) => x !== a.id)
                                  : [...draft.accessories, a.id];
                                patch({ accessories: next });
                              },
                              a.premium
                            )
                          }
                          style={{
                            position: 'relative',
                            padding: '10px 12px',
                            borderRadius: 12,
                            background: on ? `${theme.accent}22` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${on ? theme.accent : theme.cardBorder}`,
                            color: on ? theme.accent : theme.text,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            opacity: locked ? 0.6 : 1,
                          }}
                        >
                          <span>{a.icon}</span>
                          <span>{a.label}</span>
                          {locked && <span style={{ fontSize: 10 }}>🔒</span>}
                        </motion.button>
                      );
                    })}
                  </Row>
                </Section>
              )}

              {category === 'scene' && (
                <Section label="Background">
                  <Row>
                    {backgroundOptions.map((b) => (
                      <ChipBtn
                        key={b.id}
                        selected={draft.background === b.id}
                        onClick={() =>
                          tryLockedAction(
                            'Premium scene',
                            () => patch({ background: b.id }),
                            b.premium
                          )
                        }
                        locked={b.premium && !isPremium}
                        theme={theme}
                        label={b.label}
                      />
                    ))}
                  </Row>
                </Section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium upsell */}
        {!isPremium && (
          <div style={{ padding: '0 20px 16px' }}>
            <Card
              style={{
                padding: 14,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${theme.accent2}30, ${theme.accent}15)`,
                border: `1px solid ${theme.accent2}40`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  ✨
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Unlock all looks</div>
                  <div style={{ fontSize: 11, color: theme.textDim }}>
                    Premium hair, outfits, scenes · ₹299/month
                  </div>
                </div>
                <button
                  onClick={() => update({ isPremium: true })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: theme.accent,
                    color: theme.onAccent,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Try free
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Save bar */}
        <div style={{ padding: '0 20px' }}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={save}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              color: theme.onAccent,
              border: 'none',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 0.3,
              cursor: 'pointer',
              fontFamily: theme.font,
            }}
          >
            Save avatar
          </motion.button>
        </div>
      </div>

      {/* Premium toast */}
      <AnimatePresence>
        {showPremiumToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 14px',
              borderRadius: 14,
              background: 'rgba(20,16,32,0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${theme.accent2}55`,
              color: theme.text,
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 60,
              whiteSpace: 'nowrap',
            }}
          >
            <span>🔒</span>
            <span>{showPremiumToast} · ₹299/mo</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Background>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1.2,
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: 8,
          opacity: 0.6,
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
  );
}

function ChipBtn({
  selected,
  onClick,
  label,
  locked,
  theme,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  locked?: boolean;
  theme: any;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '8px 12px',
        borderRadius: 12,
        background: selected ? `${theme.accent}22` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${selected ? theme.accent : theme.cardBorder}`,
        color: selected ? theme.accent : theme.text,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        opacity: locked ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {label}
      {locked && <span style={{ fontSize: 10 }}>🔒</span>}
    </motion.button>
  );
}

function SwatchBtn({
  color,
  selected,
  onClick,
  locked,
  theme,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
  locked?: boolean;
  theme: any;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        position: 'relative',
        width: 38,
        height: 38,
        borderRadius: 12,
        background: color,
        border: selected ? `2.5px solid ${theme.text}` : `1px solid ${theme.cardBorder}`,
        cursor: 'pointer',
        opacity: locked ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {locked && <span style={{ fontSize: 11 }}>🔒</span>}
    </motion.button>
  );
}
