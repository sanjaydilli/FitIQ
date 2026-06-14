import {
  navyBodyFat, calcBMR, calcTDEE, calcBodyComp,
  idealWeightRange, bodyFatCategory, goalCalorieAdjust,
} from '../utils/bodyComposition';

describe('navyBodyFat', () => {
  test('male: typical athletic measurement', () => {
    const bf = navyBodyFat({ sex: 'male', heightCm: 175, waistCm: 80, neckCm: 38 });
    expect(bf).toBeGreaterThan(8);
    expect(bf).toBeLessThan(20);
  });

  test('female: result is within valid BF range (10–60%)', () => {
    const bf = navyBodyFat({ sex: 'female', heightCm: 165, waistCm: 75, neckCm: 33, hipCm: 95 });
    expect(bf).toBeGreaterThanOrEqual(10);
    expect(bf).toBeLessThanOrEqual(60);
  });

  test('male: clamps at min 3%', () => {
    const bf = navyBodyFat({ sex: 'male', heightCm: 180, waistCm: 60, neckCm: 40 });
    expect(bf).toBe(3);
  });

  test('female: defaults hipCm when not provided', () => {
    const withHip    = navyBodyFat({ sex: 'female', heightCm: 165, waistCm: 75, neckCm: 33, hipCm: 78.75 });
    const withoutHip = navyBodyFat({ sex: 'female', heightCm: 165, waistCm: 75, neckCm: 33 });
    expect(withHip).toBe(withoutHip);
  });

  test('result is always a rounded-to-1-decimal number', () => {
    const bf = navyBodyFat({ sex: 'male', heightCm: 175, waistCm: 82, neckCm: 38 });
    expect(String(bf)).toMatch(/^\d+(\.\d)?$/);
  });
});

describe('calcBMR', () => {
  test('male BMR is higher than female for same stats', () => {
    const male   = calcBMR({ sex: 'male',   weightKg: 70, heightCm: 170, age: 30 });
    const female = calcBMR({ sex: 'female', weightKg: 70, heightCm: 170, age: 30 });
    expect(male).toBeGreaterThan(female);
    expect(male - female).toBe(166); // Mifflin: male +5, female -161 → diff=166
  });

  test('heavier person has higher BMR', () => {
    const light = calcBMR({ sex: 'male', weightKg: 60, heightCm: 170, age: 30 });
    const heavy = calcBMR({ sex: 'male', weightKg: 90, heightCm: 170, age: 30 });
    expect(heavy).toBeGreaterThan(light);
  });

  test('older person has lower BMR', () => {
    const young = calcBMR({ sex: 'male', weightKg: 70, heightCm: 170, age: 25 });
    const older = calcBMR({ sex: 'male', weightKg: 70, heightCm: 170, age: 55 });
    expect(young).toBeGreaterThan(older);
  });

  test('known value (male, 70kg, 175cm, 30y) = 1649', () => {
    // 10×70 + 6.25×175 − 5×30 + 5 = 1648.75 → rounds to 1649
    const bmr = calcBMR({ sex: 'male', weightKg: 70, heightCm: 175, age: 30 });
    expect(bmr).toBe(1649);
  });
});

describe('calcTDEE', () => {
  const bmr = 1700;

  test('sedentary is lowest multiplier', () => {
    expect(calcTDEE(bmr, 'sedentary')).toBeLessThan(calcTDEE(bmr, 'light'));
  });

  test('active is highest multiplier', () => {
    expect(calcTDEE(bmr, 'active')).toBeGreaterThan(calcTDEE(bmr, 'moderate'));
  });

  test('sedentary = BMR × 1.2', () => {
    expect(calcTDEE(bmr, 'sedentary')).toBe(Math.round(bmr * 1.2));
  });

  test('all activity levels return integers', () => {
    (['sedentary', 'light', 'moderate', 'active'] as const).forEach(a => {
      expect(Number.isInteger(calcTDEE(bmr, a))).toBe(true);
    });
  });
});

describe('calcBodyComp', () => {
  test('fat + lean = weight', () => {
    const { fatMass, leanMass } = calcBodyComp(80, 20);
    expect(Math.round((fatMass + leanMass) * 10) / 10).toBe(80);
  });

  test('0% body fat gives 0 fat mass', () => {
    const { fatMass } = calcBodyComp(80, 0);
    expect(fatMass).toBe(0);
  });

  test('100% body fat gives 0 lean mass', () => {
    const { leanMass } = calcBodyComp(80, 100);
    expect(leanMass).toBe(0);
  });
});

describe('idealWeightRange', () => {
  test('male range is higher than female for same height', () => {
    const m = idealWeightRange('male', 170);
    const f = idealWeightRange('female', 170);
    expect(m.low).toBeGreaterThan(f.low);
  });

  test('range low < high', () => {
    const r = idealWeightRange('male', 175);
    expect(r.low).toBeLessThan(r.high);
  });

  test('taller person has higher range', () => {
    const short = idealWeightRange('male', 160);
    const tall  = idealWeightRange('male', 185);
    expect(tall.low).toBeGreaterThan(short.low);
  });
});

describe('bodyFatCategory', () => {
  test('very lean male is Athletic', () => {
    expect(bodyFatCategory('male', 10).label).toBe('Athletic');
  });

  test('high body fat male is Above average', () => {
    expect(bodyFatCategory('male', 30).label).toBe('Above average');
  });

  test('lean female is Athletic', () => {
    expect(bodyFatCategory('female', 18).label).toBe('Athletic');
  });

  test('returns a color for every category', () => {
    [5, 10, 16, 22, 30].forEach(pct => {
      expect(bodyFatCategory('male', pct).color).toMatch(/^#/);
    });
  });
});

describe('goalCalorieAdjust', () => {
  test('lose goal is negative', () => {
    expect(goalCalorieAdjust('lose')).toBeLessThan(0);
  });

  test('gain goal is positive', () => {
    expect(goalCalorieAdjust('gain')).toBeGreaterThan(0);
  });

  test('maintain goal is 0', () => {
    expect(goalCalorieAdjust('main')).toBe(0);
  });
});
