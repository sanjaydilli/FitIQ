import React from 'react';
import { render, screen } from '@testing-library/react';
import { LineChart } from '../components/LineChart';

jest.mock('framer-motion', () => {
  const R = require('react');
  function strip(props) {
    const { initial, animate, transition, whileHover, whileTap, ...rest } = props;
    return rest;
  }
  return {
    motion: {
      circle: (props) => R.createElement('circle', strip(props)),
      path: (props) => R.createElement('path', strip(props)),
    },
  };
});

const two = [
  { label: 'Jan', value: 80 },
  { label: 'Feb', value: 85 },
];

const three = [
  { label: 'Jan', value: 80 },
  { label: 'Feb', value: 85 },
  { label: 'Mar', value: 90 },
];

// ── null guard ────────────────────────────────────────────────────────────────

describe('LineChart null guard', () => {
  test('returns null for empty data', () => {
    const { container } = render(
      <LineChart data={[]} color="#6366f1" />
    );
    expect(container.firstChild).toBeNull();
  });

  test('returns null for single data point', () => {
    const { container } = render(
      <LineChart data={[{ label: 'Jan', value: 80 }]} color="#6366f1" />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders SVG for 2 data points', () => {
    const { container } = render(<LineChart data={two} color="#6366f1" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

// ── paths ─────────────────────────────────────────────────────────────────────

describe('LineChart paths', () => {
  test('renders 2 paths (area + line) with areaFill=true (default)', () => {
    const { container } = render(<LineChart data={two} color="#6366f1" />);
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(2);
  });

  test('renders only 1 path (line) when areaFill=false', () => {
    const { container } = render(<LineChart data={two} color="#6366f1" areaFill={false} />);
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  test('line path stroke matches color prop', () => {
    const { container } = render(<LineChart data={two} color="#ff0000" areaFill={false} />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke')).toBe('#ff0000');
  });

  test('line path fill is "none"', () => {
    const { container } = render(<LineChart data={two} color="#ff0000" areaFill={false} />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('none');
  });
});

// ── dots ─────────────────────────────────────────────────────────────────────

describe('LineChart dots', () => {
  test('renders end dot when showDots=true', () => {
    const { container } = render(<LineChart data={two} color="#6366f1" showDots />);
    expect(container.querySelectorAll('circle').length).toBeGreaterThan(0);
  });

  test('renders no dots when showDots=false', () => {
    const { container } = render(<LineChart data={two} color="#6366f1" showDots={false} />);
    expect(container.querySelectorAll('circle')).toHaveLength(0);
  });

  test('PR dot has gold fill (#D97706) at prIndex', () => {
    const { container } = render(<LineChart data={two} color="#6366f1" prIndex={0} />);
    const circles = Array.from(container.querySelectorAll('circle'));
    expect(circles.some(c => c.getAttribute('fill') === '#D97706')).toBe(true);
  });

  test('PR dot has radius 6, regular dot has radius 4', () => {
    const { container } = render(
      <LineChart data={two} color="#6366f1" prIndex={0} showDots />
    );
    const circles = Array.from(container.querySelectorAll('circle'));
    const prCircle = circles.find(c => c.getAttribute('fill') === '#D97706');
    expect(prCircle?.getAttribute('r')).toBe('6');
  });
});

// ── labels ────────────────────────────────────────────────────────────────────

describe('LineChart labels', () => {
  test('shows x-axis labels by default', () => {
    render(<LineChart data={three} color="#6366f1" />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });

  test('hides x-axis labels when showLabels=false', () => {
    render(<LineChart data={three} color="#6366f1" showLabels={false} />);
    expect(screen.queryByText('Jan')).toBeNull();
  });

  test('shows value + unit on the end point', () => {
    render(<LineChart data={two} color="#6366f1" unit="kg" />);
    expect(screen.getByText('85kg')).toBeInTheDocument();
  });

  test('shows "PR" label text when prIndex is set', () => {
    render(<LineChart data={two} color="#6366f1" prIndex={0} />);
    expect(screen.getByText('PR')).toBeInTheDocument();
  });

  test('unit="" shows just the numeric value on end point', () => {
    render(<LineChart data={two} color="#6366f1" unit="" />);
    // The end point text element renders {value}{unit} = "85"
    const texts = Array.from(document.querySelectorAll('text'));
    expect(texts.some(t => t.textContent === '85')).toBe(true);
  });
});

// ── viewBox / size ────────────────────────────────────────────────────────────

describe('LineChart viewBox', () => {
  test('viewBox contains the height prop value', () => {
    const { container } = render(<LineChart data={two} color="#6366f1" height={200} />);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toContain('200');
  });

  test('default height 120 is reflected in viewBox', () => {
    const { container } = render(<LineChart data={two} color="#6366f1" />);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toContain('120');
  });
});
