import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxies apenas os endpoints que NÃO têm Route Handler local.
        // skills/catalog/account são resolvidos pelo próprio Next.js.
        source: "/api/:path((?!skills|catalog|account).*)",
        destination: `${process.env.API_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
