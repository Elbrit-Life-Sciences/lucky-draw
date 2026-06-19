/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js ships ESM; let Next transpile it cleanly for the server bundle.
  transpilePackages: ["three"],
};

export default nextConfig;
