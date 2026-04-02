/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    // any experimental features
  },
  images: {
    domains: ['localhost', 'supabase.co'], // common for this project
  }
};

export default nextConfig;
