import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Markdown cru de cada skill: /skills/contagem-prazo.md
        { source: "/skills/:slug([a-z0-9-]+)\\.md", destination: "/api/skills/:slug/md" },
      ],
      afterFiles: [
        {
          // Proxies apenas os endpoints que NÃO têm Route Handler local.
          source: "/api/:path((?!skills|catalog|account|admin|mcp).*)",
          destination: `${process.env.API_URL || "http://localhost:8000"}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
