/** Constantes públicas do site. A URL de produção vem de NEXT_PUBLIC_SITE_URL. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://sanfran.lucascardososilva.workers.dev").replace(/\/$/, "");
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
export const MCP_URL = `${SITE_URL}/api/mcp`;

export const SLACK_URL =
  "https://sanfranmd.slack.com/join/shared_invite/zt-44ys5kr75-li43f~B2o4TGQLsDwqc0rQ#/shared-invite/email";
export const GITHUB_URL = "https://github.com/lops-legal/sanfran";
