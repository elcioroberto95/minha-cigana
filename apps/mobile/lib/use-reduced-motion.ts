import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      function update() { setReduced(preference.matches); }
      update();
      preference.addEventListener('change', update);
      return () => preference.removeEventListener('change', update);
    }

    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduced(enabled);
    }).catch(() => { if (active) setReduced(true); });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; listener.remove(); };
  }, []);

  return reduced;
}
