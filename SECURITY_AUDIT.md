# Auditoria de Segurança do Projeto Sanfran

> **Objetivo**: Identificar vulnerabilidades potenciais e pontos de melhoria na aplicação React que compõe o front‑end do projeto **sanfran**. As observações foram extraídas a partir da análise estática dos arquivos principais do código‑fonte.

---

## 📁 Estrutura analisada
- `apps/web/src/App.tsx`
- `apps/web/src/components/Marketplace.tsx`
- `apps/web/src/components/LexBot.tsx`
- `apps/web/src/components/SkillCard.tsx`
- (demais componentes não listados não apresentaram lógica crítica de segurança).

---

## 🔎 Principais constatações

### 1️⃣ Injeção de conteúdo não sanitizado
- **Local**: `LexBot.tsx` exibe o conteúdo retornado da API (`msg.text`) e o markdown gerado (`previewSkill`) diretamente dentro de elementos React.
- **Risco**: Embora o React escape por padrão, se a API `/api/lex-chat` retornar **HTML** ou **script** mal‑formado, ele será renderizado como texto, mas o **download** do markdown (`data:text/markdown`) pode ser aberto em navegadores que interpretam HTML embutido, possibilitando *XSS*.
- **Mitigação**: Garantir que a API sempre retorne **texto puro** e, se houver necessidade de renderizar markdown, usar uma biblioteca de sanitização (ex.: `dompurify`) antes de inserir no DOM.

### 2️⃣ Falta de validação de tamanho de arquivos anexados
- **Local**: `handleSend` aceita `attachedFiles` e inclui apenas o nome do primeiro arquivo; o conteúdo não é enviado, porém a UI permite anexos.
- **Risco**: Usuários podem tentar enviar arquivos muito grandes, consumindo memória do cliente ou provocando negação de serviço (DoS) ao ler o conteúdo no futuro.
- **Mitigação**: Limitar o tamanho máximo aceito (ex.: 5 MB) e validar o tipo MIME antes de aceitar.

### 3️⃣ Exposição de informações de depuração
- **Local**: Mensagens de erro da chamada `fetch` revelam o texto da exceção (`err.message`).
- **Risco**: Detalhes internos podem ser divulgados ao usuário final.
- **Mitigação**: Log interno no servidor e enviar mensagens genéricas ao cliente (`"Ocorreu um erro ao processar a requisição."`).

### 4️⃣ Uso de `window.getSelection` sem sanitização
- Texto selecionado pelo usuário é usado para construir prompts enviados ao backend (`chatMsg`).
- **Risco**: Usuário mal‑intencionado pode inserir sequências que quebrem a estrutura JSON ou explorarem *prompt injection* no modelo de linguagem.
- **Mitigação**: Escape/limpar o texto antes de enviá‑lo ao servidor (ex.: remover caracteres de controle ou limitar a 500 caracteres).

### 5️⃣ Links de download gerados dinamicamente
- O botão **Baixar .md** cria um `data:` URL com `encodeURIComponent(previewSkill)`. Se o markdown incluir sequências de `data:` ou `javascript:` podem ser interpretadas ao abrir em navegadores vulneráveis.
- **Mitigação**: Validar/escapar caracteres críticos (`<`, `>`, `"`, `'`) antes de gerar a URL.

### 6️⃣ Falta de cabeçalhos de segurança HTTP
- O front‑end não define políticas como **Content‑Security‑Policy**, **X‑Content‑Type‑Options**, **X‑Frame‑Options**, etc.
- **Mitigação**: Configurar o servidor (ex.: `express` ou `nginx`) para enviar esses cabeçalhos.

### 7️⃣ Componentes sem `key` ao mapear listas
- Em `Marketplace.tsx` a renderização de `VERTICALS.map` não inclui `key` explicitamente (usa `key={vertical.id}` – está correto). Verifique outros `map`s que possam estar sem `key` para evitar problemas de renderização.

---

## ✅ Recomendações de melhoria
1. **Sanitização de Markdown**
   - Instalar `dompurify` e utilizá‑la antes de inserir `previewSkill` no DOM.
   - Exemplo: `const safeHtml = DOMPurify.sanitize(previewSkill);`

2. **Limite de tamanho e tipo de arquivos**
   - No handler de upload, verificar `file.size` e `file.type`.
   - Exemplo: `if (file.size > 5 * 1024 * 1024) { /* rejeitar */ }`

3. **Mensagens de erro genéricas**
   - Substituir `throw new Error("Erro de comunicação com Lex.")` por mensagens não reveladoras.
   - Log interno no servidor.

4. **Escapamento de texto selecionado**
   - Aplicar função `escapePrompt(text)` que remove linhas vazias, caracteres de controle, limita a 500 caracteres.

5. **Headers de segurança**
   - Incluir no servidor (ex.: `helmet` para Express) ou configurar via CDN.
   - CSP exemplo: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;`

6. **Revisão de dependências**
   - Verificar vulnerabilidades nas dependências do `package.json` usando `npm audit` e aplicar correções.

7. **Teste de penetração básico**
   - Executar ferramentas como **OWASP ZAP** ou **npm audit** para validar que não há vulnerabilidades comuns (XSS, CSRF, Open Redirect).

---

## 📂 Como aplicar as mudanças (exemplo)
```bash
# Instalar dependência de sanitização
npm install dompurify
```
```tsx
// Em LexBot.tsx (exemplo de uso)
import DOMPurify from 'dompurify';
...
{isEditingSkill ? (
  <textarea ... />
) : (
  <pre className="..." dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewSkill) }} />
)}
```

> **Nota**: O uso de `dangerouslySetInnerHTML` só é recomendado quando necessário; caso opte por apenas mostrar texto puro, o `<pre>` já é suficiente sem risco.

---

## 📅 Próximos passos
1. Implementar as correções acima em um *branch* dedicado (`security‑hardening`).
2. Rodar `npm audit` e corrigir vulnerabilidades reportadas.
3. Testar a aplicação em ambiente *staging* com ferramentas de varredura (ZAP, Burp Suite).
4. Revisar o *CSP* e outros headers no servidor de produção.

---

### Aplicação do Skill de Auditoria de Segurança

**Escopo confirmado**: Front‑end React do projeto Sanfran, incluindo componentes `Marketplace`, `LexBot`, `SkillCard` e a aplicação principal `App`.

1. **Rastreamento de fluxo de dados**
   - Identificar pontos de entrada: UI (formularios), uploads via `LexBot.handleSend`.
   - Seguir o fluxo até a API `/api/lex-chat` e posterior renderização de markdown.
   - Verificar se credenciais ou informações sensíveis são propagadas ao cliente.

2. **Análise adversária**
   - Para cada recurso (ex.: `previewSkill`, mensagens de chat), perguntar "Como isso pode ser explorado para IDOR ou injeção?".
   - Avaliar risco de *prompt injection* ao incluir texto selecionado do usuário nos prompts.

3. **Verificações de segurança específicas**
   - **XSS**: garantir sanitização de markdown antes de usar `dangerouslySetInnerHTML`.
   - **Upload**: limitar tamanho e tipos MIME dos arquivos anexados.
   - **Headers de segurança**: CSP, X‑Content‑Type‑Options, X‑Frame‑Options.
   - **Segredos**: evitar exposição de chaves API no front‑end; mover chamadas sensíveis para backend.

4. **Integração CI/CD**
   - Adicionar etapas de SAST/DAST (Semgrep, OWASP ZAP) no pipeline GitHub Actions.
   - Executar `npm audit` e bloquear merges com vulnerabilidades críticas.

5. **Monitoramento e resposta**
   - Configurar logs de auditoria para chamadas ao endpoint `/api/lex-chat`.
   - Definir playbooks de resposta a incidentes de injeção ou vazamento de dados.

---

**Resumo**: O código está bem estruturado visualmente, mas carece de algumas proteções contra XSS, *prompt injection* e upload abusivo. Ao aplicar as recomendações, o projeto ganhará resiliência frente a ameaças comuns na web.
