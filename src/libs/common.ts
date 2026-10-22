export type ThreePosition = [number, number, number];

export const HIGH_SCORE_KEY = 'tetris_high_score';

/** Matches `@media (max-width: 768px)` in styles. */
export const MOBILE_BREAKPOINT_PX = 768;

export const isMobileViewport = (width: number) => width <= MOBILE_BREAKPOINT_PX;
