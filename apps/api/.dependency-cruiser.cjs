module.exports = {
  forbidden: [
    {
      name: 'chat-domain-dependencies',
      severity: 'error',
      from: { path: '^src/chat/domain/' },
      to: { pathNot: '^src/chat/domain/' },
    },
    {
      name: 'profile-domain-dependencies',
      severity: 'error',
      from: { path: '^src/profile/domain/' },
      to: { pathNot: '^src/profile/domain/' },
    },
    {
      name: 'chat-application-dependencies',
      severity: 'error',
      from: { path: '^src/chat/application/' },
      to: { pathNot: '^src/(?:chat/(?:application|domain)/|profile/application/consultation-memory\\.ts$)' },
    },
    {
      name: 'profile-application-dependencies',
      severity: 'error',
      from: { path: '^src/profile/application/' },
      to: { pathNot: '^src/profile/(?:application|domain)/' },
    },
    {
      name: 'chat-controller-dependencies',
      severity: 'error',
      from: { path: '^src/chat/chat\\.controller\\.ts$' },
      to: {
        pathNot: [
          '^src/(?:auth/identity\\.guard\\.ts$|chat/(?:chat-input\\.ts$|application/))',
          '^(?:\\.\\./)*node_modules/@nestjs/common/index\\.(?:d\\.ts|js)$',
        ],
      },
    },
    {
      name: 'no-unresolved-dependencies-in-consultation',
      severity: 'error',
      from: { path: '^src/(?:(?:chat|profile)/(?:application|domain)/|chat/chat\\.controller\\.ts$)' },
      to: { couldNotResolve: true },
    },
    {
      name: 'no-api-circular-dependencies',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '^src/', circular: true },
    },
  ],
  options: {
    doNotFollow: { path: '(^|/)node_modules/' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
};
