import React from 'react';

/**
 * Animated, CSS-only border treatment for a relatively positioned card.
 * The compatibility props mirror the effect API used by the card layout.
 */
export const GlowingEffect = ({
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.25,
  spread = 40,
  blur = 8,
  variant = 'purple',
}) => {
  if (disabled || !glow) return null;

  return (
    <span
      aria-hidden="true"
      className={`glowing-effect glowing-effect--${variant}`}
      style={{
        '--glow-blur': `${blur}px`,
        '--glow-spread': `${spread}px`,
        '--glow-proximity': `${proximity}px`,
        '--glow-inactive-zone': inactiveZone,
      }}
    />
  );
};
