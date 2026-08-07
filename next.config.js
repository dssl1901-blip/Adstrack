/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    outputFileTracingIncludes: {
      'app/api/ad-media/route': ['./node_modules/@sparticuz/chromium/bin/**/*'],
    },
  },
};

module.exports = nextConfig;
