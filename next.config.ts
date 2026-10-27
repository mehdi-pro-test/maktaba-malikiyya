import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [{ source: '/quiz', destination: '/quiz/niveaux', permanent: true }];
  },
  devIndicators: false,
  logging: { incomingRequests: { ignore: [/\/api\/orders/, /\/commande\/confirmation/] } },
  serverExternalPackages: ['@prisma/client'],
  async headers() {
    return [
      ...[
        '/admin/:path*',
        '/api/admin/:path*',
        '/api/auth/:path*',
        '/connexion',
        '/inscription',
        '/compte/:path*',
        '/api/compte/:path*',
      ].map((source) => ({
        source,
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      })),
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};
export default config;
