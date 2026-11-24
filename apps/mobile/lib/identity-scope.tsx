import type { ComponentType } from 'react';
import { useIdentityRevision } from './session-token';

export function withIdentityScope<P extends object>(Screen: ComponentType<P>) {
  function IdentityScope(props: P) {
    const revision = useIdentityRevision();
    return <Screen key={revision} {...props} />;
  }
  return IdentityScope;
}
