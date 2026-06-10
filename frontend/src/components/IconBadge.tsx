import React from 'react';
import { Icon, IconName } from './Icon';

interface IconBadgeProps {
  name: IconName;
  size?: number;
  color?: string;
  bg?: string;
  radius?: number;
  iconSize?: number;
  strokeWidth?: number;
}

export function IconBadge({
  name,
  size = 40,
  color = 'white',
  bg = 'rgba(15,23,42,0.08)',
  radius,
  iconSize,
  strokeWidth = 1.8,
}: IconBadgeProps) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: radius ?? Math.round(size * 0.28),
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={name} size={iconSize ?? Math.round(size * 0.5)} color={color} strokeWidth={strokeWidth} />
    </div>
  );
}
