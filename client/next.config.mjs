/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://PrashantGoyal-Findr.hf.space/:path*", 
      },
    ];
  },
};

export default nextConfig;