// In your Vercel or Next.js configuration, setup a proxy
// For Next.js, you might use rewrites in `next.config.js`:
module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8080/:path*',
        },
      ];
    },
  };
  