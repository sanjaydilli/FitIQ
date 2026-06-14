import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, Pill, PrimaryButton } from '../components/Card';

// TabBar depends on react-router-dom which has an exports-field incompatibility
// with CRA's Jest resolver — TabBar navigation is covered by Cypress E2E instead.

const mockTheme = {
  accent: '#6366f1', accent2: '#8b5cf6', card: '#ffffff', cardBorder: '#e5e7eb',
  bg: '#f8fafc', radius: 16, textMute: '#94a3b8', textDim: '#64748b', text: '#1e293b',
  mono: 'monospace', font: 'sans-serif', onAccent: '#ffffff', id: 'light', warn: '#f59e0b',
};

jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

jest.mock('framer-motion', () => {
  const R = require('react');
  function strip(props) {
    const { initial, animate, transition, whileHover, whileTap, layoutId, ...rest } = props;
    return rest;
  }
  return {
    motion: {
      div: (props) => R.createElement('div', strip(props)),
      button: (props) => R.createElement('button', strip(props)),
    },
    AnimatePresence: ({ children }) => children,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Card ─────────────────────────────────────────────────────────────────────

describe('Card', () => {
  test('renders children', () => {
    render(<Card>Hello Card</Card>);
    expect(screen.getByText('Hello Card')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Card onClick={onClick}>click me</Card>);
    fireEvent.click(screen.getByText('click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('renders without onClick without error', () => {
    const { container } = render(<Card>no click</Card>);
    expect(container.firstChild).not.toBeNull();
  });

  test('selected=true uses accent border color', () => {
    const { container } = render(<Card selected>selected</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.border).toContain(mockTheme.accent);
  });

  test('non-selected uses cardBorder color', () => {
    const { container } = render(<Card>not selected</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.border).toContain(mockTheme.cardBorder);
  });

  test('merges custom style prop', () => {
    const { container } = render(<Card style={{ padding: '20px' }}>child</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.padding).toBe('20px');
  });

  test('renders multiple children', () => {
    render(
      <Card>
        <span>One</span>
        <span>Two</span>
      </Card>
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});

// ── Pill ─────────────────────────────────────────────────────────────────────

describe('Pill', () => {
  test('renders children text', () => {
    render(<Pill>PROTEIN</Pill>);
    expect(screen.getByText('PROTEIN')).toBeInTheDocument();
  });

  test('renders as a span element', () => {
    const { container } = render(<Pill>test</Pill>);
    expect(container.querySelector('span')).not.toBeNull();
  });

  test('fill=true sets background to solid color', () => {
    const { container } = render(<Pill color="#ff6600" fill>filled</Pill>);
    const span = container.querySelector('span') as HTMLElement;
    // fill=true → background is exactly the color (not ${c}20 variant)
    expect(span.style.background).toBeTruthy();
    expect(span.style.background).not.toContain('20');
  });

  test('fill=false (default) sets semi-transparent (rgba) background', () => {
    const { container } = render(<Pill color="#6366f1">unfilled</Pill>);
    const span = container.querySelector('span') as HTMLElement;
    // JSDOM normalizes #6366f120 to rgba(r,g,b,alpha) — check for rgba
    expect(span.style.background).toContain('rgba');
  });
});

// ── PrimaryButton ─────────────────────────────────────────────────────────────

describe('PrimaryButton', () => {
  test('renders children text', () => {
    render(<PrimaryButton>Click me</PrimaryButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<PrimaryButton onClick={onClick}>Start</PrimaryButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled=true', () => {
    render(<PrimaryButton disabled>Disabled</PrimaryButton>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  test('onClick not fired when button is disabled', () => {
    const onClick = jest.fn();
    render(<PrimaryButton onClick={onClick} disabled>No click</PrimaryButton>);
    fireEvent.click(screen.getByRole('button', { name: 'No click' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

