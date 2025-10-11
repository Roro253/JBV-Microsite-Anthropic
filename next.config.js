/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org"
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com"
      },
      {
        protocol: "https",
        hostname: "assets.anthropic.com"
      },
      {
        protocol: "https",
        hostname: "images.prismic.io"
      }
    ]
  },
  experimental: {
    optimizePackageImports: ["recharts", "framer-motion"]
  }
};

module.exports = nextConfig;
