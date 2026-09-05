export type ThreePosition = [number, number, number];

export const HIGH_SCORE_KEY = 'tetris_high_score';

export const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return (
    /Android|iPhone|iPad/i.test(navigator.userAgent) &&
    !(navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent))
  );
};
