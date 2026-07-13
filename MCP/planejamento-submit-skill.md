# Planejamento: Módulo `submit-skill` — MVP

> Documento de planejamento para o módulo de submissão de skills no servidor MCP `skill-local-semantico`.
> Baseado no design da plataforma de skills jurídicas e na arquitetura existente do Skilljack MCP.

---

## 1. Situação Atual

### O que o sistema já faz (read-only)
| Módulo | Função | Status |
|---|---|---|
| `load-skill` | Carrega conteúdo de uma skill existente | ✅ Completo |
| `skill-resource` | Lê arquivos auxiliares dentro de uma skill | ✅ Completo |
| `skill-display` | Lista skills e gerencia configurações de invocação | ✅ Completo |
| `skill-config` | Gerencia diretórios de skills e fontes (local, GitHub, well-known) | ✅ Completo |

### O que falta (write)
O sistema hoje é **somente leitura**. Não há nenhuma ferramenta que permita ao usuário (via Claude) **criar ou enviar** uma nova skill para o servidor. O `submit-skill` preenche essa lacuna.

---

## 2. O que é o `submit-skill` (MVP)

Uma **tool MCP** que permite ao usuário, através do Claude, submeter uma nova skill para o servidor. O fluxo é:

```
Usuário → descreve uma skill que quer criar
  → Claude monta o rascunho (frontmatter + corpo)
  → Claude mostra o rascunho para o usuário aprovar
  → Usuário aprova
  → Claude chama submit-skill(draft)
  → Servidor salva a skill no diretório configurado
  → Servidor responde com confirmação + skill_id
  → A skill aparece imediatamente no catálogo (discovery)
```

### Escopo do MVP (mais simples possível)
1. Tool `submit-skill` que recebe o conteúdo completo da skill (frontmatter + corpo) e salva em disco.
2. Validação básica: frontmatter YAML válido, campos obrigatórios (`name`, `description`).
3. A skill submetida aparece automaticamente no catálogo (o servidor já faz file watching).
4. Resposta síncrona com confirmação (sem fila de revisão — isso vem depois).

### O que fica para versões futuras (pós-MVP)
- Pipeline assíncrono de revisão (staging → published)
- `check-submission-status`
- `create-skill` (meta-skill com roteiro de entrevista por vertical)
- Validação semântica / quality score
- Segurança: sanitização de path traversal, limites de tamanho

---

## 3. Arquitetura do Módulo

### 3.1 Estrutura de arquivos

```
src/
  skill-submit-tool.ts     ← NOVO: tool + schemas + handler
  skill-submit.test.ts     ← NOVO: testes
  skill-submit-ui/         ← OPCIONAL: UI HTML para gerenciar submissões
    mcp-app.html
    mcp-app.ts
    mcp-app.css
```

### 3.2 Padrão de design (seguindo os módulos existentes)

O módulo segue exatamente o mesmo padrão de `skill-config-tool.ts` e `skill-display-tool.ts`:

```
registerAppTool(server, "submit-skill", {
  title: "Submit Skill",
  description: "...",
  inputSchema: { ... },
  outputSchema: { ... },
  annotations: { ... },
}, async (args) => {
  // 1. Validar entrada
  // 2. Salvar arquivo em disco
  // 3. Retornar confirmação
})
```

### 3.3 Input Schema (MVP)

```typescript
const SubmitSkillSchema = z.object({
  name: z.string().min(1).describe("Nome da skill (usado como nome do diretório)"),
  frontmatter: z.string().min(1).describe("YAML frontmatter completo (name, description, vertical, tags, etc.)"),
  body: z.string().min(1).describe("Corpo da skill em markdown (instruções, templates, workflow)"),
  directory: z.string().optional().describe("Diretório de destino (opcional; usa o diretório ativo por padrão)"),
});
```

### 3.4 Output (resposta)

```typescript
{
  success: true,
  skillId: "uuid-gerado",
  path: "/caminho/para/a/skill/SKILL.md",
  name: "minha-nova-skill",
  message: "Skill submetida com sucesso. Já disponível no catálogo."
}
```

### 3.5 Onde salvar as skills submetidas

Opção mais simples para o MVP: **usar o primeiro diretório local configurado** como destino.

- Se o usuário tem `SKILLS_DIR=./skills`, a skill vai para `./skills/<nome>/SKILL.md`.
- Se não houver diretório configurado, criar um diretório padrão: `~/.skilljack/submissions/`.
- O file watcher do servidor já detecta a nova skill e atualiza o catálogo automaticamente.

### 3.6 Geração de UUID e metadados

O servidor deve:
1. Gerar um `skill_id` (UUID v4).
2. Injetar `skill_id` e `created_at` no frontmatter recebido.
3. Validar que o `name` não conflita com skills existentes.
4. Sanitizar o nome para usar como nome de diretório (slug).

---

## 4. Fluxo Detalhado

```
Claude                                            Servidor MCP
─────                                              ───────────
   │                                                    │
   │  (1) Usuário: "cria uma skill de petição inicial"  │
   │◄─────────────────────────────────────────────────── │
   │                                                    │
   │  (2) Claude monta rascunho e mostra ao usuário     │
   │  (3) Usuário aprova                                │
   │                                                    │
   │  (4) submit-skill({                                │
   │        name: "peticao-inicial",                    │
   │        frontmatter: "---\nname: peticao-inicial\n...", │
   │        body: "# Instruções para petição inicial..." │
   │      })                                            │
   │ ──────────────────────────────────────────────────► │
   │                                                    │
   │  (5) Valida:                                       │
   │      - Frontmatter YAML válido                     │
   │      - Campos obrigatórios presentes               │
   │      - Nome não conflita                           │
   │      - Slug seguro                                 │
   │                                                    │
   │  (6) Salva: ./skills/peticao-inicial/SKILL.md      │
   │      - Injeta skill_id + created_at                │
   │                                                    │
   │  (7) File watcher detecta → refresh automático     │
   │                                                    │
   │  (8) Resposta: {                                   │
   │        success: true,                              │
   │        skillId: "550e8400-...",                    │
   │        path: "./skills/peticao-inicial/SKILL.md",  │
   │        name: "peticao-inicial"                     │
   │      }                                             │
   │ ◄────────────────────────────────────────────────── │
   │                                                    │
   │  (9) Claude: "Pronto! A skill 'petição inicial'    │
   │      foi criada e já está disponível."             │
```

---

## 5. Validações (MVP)

| Validação | O que verifica | Ação em falha |
|---|---|---|
| Frontmatter YAML | `yaml.parse()` não lança exceção | Erro: "Frontmatter inválido" |
| Campo `name` | String não vazia | Erro: "Campo name obrigatório" |
| Campo `description` | String não vazia | Erro: "Campo description obrigatório" |
| Conflito de nome | `skillMap` não tem skill com mesmo nome | Erro: "Skill já existe" |
| Slug seguro | Nome só contém caracteres seguros | Sanitizar automaticamente |
| Diretório destino | Existe e é gravável | Erro: "Diretório inválido" |

---

## 6. Segurança (MVP mínimo — expandir depois)

- ✅ Path sanitization: impedir `../` no nome da skill
- ✅ Tamanho máximo do body (ex.: 1MB por enquanto)
- ⏳ Validação de conteúdo malicioso (pós-MVP)
- ⏳ Rate limiting (pós-MVP)
- ⏳ Autenticação/autorização (pós-MVP)

---

## 7. Testes

Seguindo o padrão dos testes existentes (`skill-tool.test.ts`, `skill-config.test.ts`):

```typescript
// skill-submit.test.ts
describe("submit-skill", () => {
  it("deve criar skill com frontmatter e body válidos");
  it("deve rejeitar frontmatter YAML inválido");
  it("deve rejeitar nome vazio");
  it("deve rejeitar skill duplicada");
  it("deve injetar skill_id e created_at no frontmatter");
  it("deve sanitizar nome com caracteres especiais");
  it("deve criar diretório de destino se não existir");
  it("deve retornar erro se diretório destino não for gravável");
});
```

---

## 8. Dependências

O MVP **não adiciona novas dependências** ao projeto. Tudo que precisa já existe:

| Recurso | Já existe em |
|---|---|
| Zod para schemas | `skill-tool.ts` |
| `registerAppTool` | `@modelcontextprotocol/ext-apps/server` |
| UUID | `node:crypto` (crypto.randomUUID()) |
| YAML parsing | `yaml` (já usado em `skill-discovery.ts`) |
| File watching | `chokidar` (já usado em `index.ts`) |
| File system | `node:fs` |

---

## 9. Checklist de Implementação

- [ ] **Criar `src/skill-submit-tool.ts`**
  - [ ] Schema Zod de entrada (`SubmitSkillSchema`)
  - [ ] Schema Zod de saída
  - [ ] Função `registerSkillSubmitTool(server, skillState, onSkillSubmitted)`
  - [ ] Handler: valida frontmatter, gera UUID, salva arquivo
  - [ ] Sanitização de nome (slug)
  - [ ] Verificação de conflito com skills existentes
  - [ ] Injeção de `skill_id` e `created_at` no frontmatter
- [ ] **Criar `src/skill-submit.test.ts`**
  - [ ] Testes unitários para cada validação
  - [ ] Teste de integração (criar skill e verificar no catálogo)
- [ ] **Modificar `src/index.ts`**
  - [ ] Importar `registerSkillSubmitTool`
  - [ ] Chamar registro (dentro do bloco `if (!isStatic)`)
  - [ ] Callback `onSkillSubmitted` → `refreshSkills()`
- [ ] **Testar manualmente**
  - [ ] Submeter skill via Claude
  - [ ] Verificar que aparece no catálogo
  - [ ] Verificar que `load-skill` consegue carregar
  - [ ] Verificar file watcher detectou a mudança

---

## 10. Próximos Passos (pós-MVP)

| Funcionalidade | Descrição | Prioridade |
|---|---|---|
| `create-skill` | Meta-skill com roteiro de entrevista por vertical jurídica | Alta |
| `check-submission-status` | Consulta assíncrona de status da submissão | Média |
| Pipeline de revisão | Status: staged → em_revisão → published / rejected | Média |
| Quality score | Pontuação automática da skill submetida | Baixa |
| UI de submissões | Interface para gerenciar skills submetidas pendentes | Baixa |
| Suporte a arquivos auxiliares | Enviar scripts/templates junto com a skill | Baixa |

---

## 11. Resumo

O `submit-skill` MVP é um módulo **pequeno, bem delimitado e de baixo risco** que:

1. Segue exatamente o padrão de design dos módulos existentes
2. Não adiciona novas dependências
3. Completa o ciclo de vida da skill (leitura + escrita)
4. Permite que o usuário crie skills diretamente pelo Claude
5. É testável isoladamente
6. Pode ser expandido incrementalmente com camadas de revisão, qualidade e UI