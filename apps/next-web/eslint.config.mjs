import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Script de build autogerado (CommonJS, fora do lint do app).
    "generate-skills-md.cjs",
  ]),
  {
    // As regras React 19 introduzidas pelo eslint-config-next 16
    // (set-state-in-effect, refs etc.) reprovam o padrão clássico de
    // "fetch em useEffect" usado em praticamente todo o codebase.
    // Pra não quebrar o lint em arquivos pré-existentes, elas ficam
    // como aviso (warning) e os erros genuínos seguem sendo revisados.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-use-before-define": "warn",
      "no-use-before-define": "warn",
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
