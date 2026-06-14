import React from 'react';
import { render, screen } from '@testing-library/react';
import { MacroRing } from '../components/MacroRing';
import { RingMeter } from '../components/RingMeter';

jest.mock('framer-motion', () => {
  const R = require('react');
  function strip(props) {
    const { initial, animate, transition, whileHover, whileTap, layoutId, ...rest } = props;
    return rest;
  }
  return {
    motion: {
      circle: (props) => R.createElement('circle', strip(props)),
      path: (props) => R.createElement('path', strip(props)),
      div: (props) => R.createElement('div', strip(props)),
    },
  };
});

// ── MacroRing ─────────────────────────────────────────────────────────────────

function setupMacroRing(props = {}) {
  const defaults = {
    calories: 1600, targetCalories: 2000,
    protein: 80, carbs: 200, fat: 45,
  };
  return render(React.createElement(MacroRing, { ...defaults, ...props }));
}

describe('MacroRing', () => {
  test('shows correct pct when calories/targetCalories=80%', () => {
    setupMacroRing({ calories: 1600, targetCalories: 2000 });
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  test('shows "of goal" center label', () => {
    setupMacroRing();
    expect(screen.getByText('of goal')).toBeInTheDocument();
  });

  test('pct is 0 when targetCalories is 0', () => {
    setupMacroRing({ targetCalories: 0 });
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('pct is capped at 100 when calories exceed target', () => {
    setupMacroRing({ calories: 3000, targetCalories: 2000 });
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('pct rounds to nearest integer (1666/2000 → 83%)', () => {
    setupMacroRing({ calories: 1666, targetCalories: 2000 });
    expect(screen.getByText('83%')).toBeInTheDocument();
  });

  test('renders 4 circles (track + 3 macro arcs) when all macros > 0', () => {
    const { container } = setupMacroRing({ protein: 80, carbs: 200, fat: 45 });
    expect(container.querySelectorAll('circle')).toHaveLength(4);
  });

  test('renders only track circle when all macros = 0', () => {
    const { container } = setupMacroRing({ protein: 0, carbs: 0, fat: 0 });
    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });

  test('renders 3 circles when only carbs = 0 (track + protein + fat)', () => {
    const { container } = setupMacroRing({ protein: 80, carbs: 0, fat: 45 });
    expect(container.querySelectorAll('circle')).toHaveLength(3);
  });

  test('carbs arc has orange stroke (#EA580C)', () => {
    const { container } = setupMacroRing({ protein: 0, carbs: 200, fat: 0 });
    const circles = Array.from(container.querySelectorAll('circle'));
    expect(circles.some(c => c.getAttribute('stroke') === '#EA580C')).toBe(true);
  });

  test('protein arc has purple stroke (#7C3AED)', () => {
    const { container } = setupMacroRing({ protein: 80, carbs: 0, fat: 0 });
    const circles = Array.from(container.querySelectorAll('circle'));
    expect(circles.some(c => c.getAttribute('stroke') === '#7C3AED')).toBe(true);
  });

  test('fat arc has teal stroke (#0E9384)', () => {
    const { container } = setupMacroRing({ protein: 0, carbs: 0, fat: 45 });
    const circles = Array.from(container.querySelectorAll('circle'));
    expect(circles.some(c => c.getAttribute('stroke') === '#0E9384')).toBe(true);
  });

  test('applies custom size to SVG dimensions', () => {
    const { container } = setupMacroRing({ size: 150 });
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '150');
    expect(svg).toHaveAttribute('height', '150');
  });

  test('default size 110 used when size not provided', () => {
    const { container } = setupMacroRing();
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '110');
  });
});

// ── RingMeter ─────────────────────────────────────────────────────────────────

function setupRingMeter(props = {}) {
  return render(React.createElement(RingMeter, props));
}

describe('RingMeter', () => {
  test('renders label text', () => {
    setupRingMeter({ label: React.createElement('span', null, 'Water') });
    expect(screen.getByText('Water')).toBeInTheDocument();
  });

  test('renders sublabel text', () => {
    setupRingMeter({
      label: React.createElement('span', null, 'Water'),
      sublabel: React.createElement('span', null, '2.4 L'),
    });
    expect(screen.getByText('2.4 L')).toBeInTheDocument();
  });

  test('renders 2 circles: track and fill', () => {
    const { container } = setupRingMeter();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
  });

  test('dash equals circumference when value >= max (capped at 100%)', () => {
    const size = 180, stroke = 14;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;

    const { container } = setupRingMeter({ value: 200, max: 100, size, stroke });
    const fillCircle = container.querySelectorAll('circle')[1];
    const dashArr = fillCircle.getAttribute('stroke-dasharray') ?? '';
    const [dash] = dashArr.split(' ').map(Number);
    expect(dash).toBeCloseTo(c, 0);
  });

  test('dash is proportional to value/max for sub-100% values', () => {
    const size = 180, stroke = 14;
    const r = (size - stroke) / 2;
    const expectedDash = 2 * Math.PI * r * 0.5;

    const { container } = setupRingMeter({ value: 50, max: 100, size, stroke });
    const fillCircle = container.querySelectorAll('circle')[1];
    const [dash] = (fillCircle.getAttribute('stroke-dasharray') ?? '').split(' ').map(Number);
    expect(dash).toBeCloseTo(expectedDash, 0);
  });

  test('adds linearGradient element when gradient prop provided', () => {
    const { container } = setupRingMeter({ gradient: ['#ff0000', '#0000ff'] });
    expect(container.querySelector('linearGradient')).not.toBeNull();
  });

  test('no linearGradient when gradient prop omitted', () => {
    const { container } = setupRingMeter();
    expect(container.querySelector('linearGradient')).toBeNull();
  });

  test('fill circle stroke references gradient url when gradient provided', () => {
    const { container } = setupRingMeter({ gradient: ['#ff0000', '#0000ff'] });
    const fillCircle = container.querySelectorAll('circle')[1];
    expect(fillCircle.getAttribute('stroke')).toMatch(/^url\(#/);
  });

  test('fill circle stroke uses color string when no gradient', () => {
    const { container } = setupRingMeter({ color: '#6366f1' });
    const fillCircle = container.querySelectorAll('circle')[1];
    expect(fillCircle.getAttribute('stroke')).toBe('#6366f1');
  });

  test('applies custom size to SVG', () => {
    const { container } = setupRingMeter({ size: 120 });
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '120');
  });

  test('center div is empty when no label or sublabel', () => {
    const { container } = setupRingMeter();
    // Inner center div (last child of outer div)
    const divs = container.querySelectorAll('div');
    const centerDiv = divs[divs.length - 1];
    expect(centerDiv.textContent).toBe('');
  });
});
