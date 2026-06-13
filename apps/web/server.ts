import express from "express";
import cron from "node-cron";
import { requireRole } from "./middleware/rbac";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Google GenAI inside API routes lazily or safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY variable is missing. Responses will be simulated.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// System Instruction for Lex representing the legal AI fox
const LEX_SYSTEM_INSTRUCTION = `Você é a Lex, uma raposa inteligente e especialista em engenharia de prompt e Direito brasileiro. 
Seu papel é interagir com advogados para criar "Skills Jurídicas" customizadas no formato universal "SKILL.md", em conformidade com o padrão aberto agentskills.io.

Como a Lex ajuda o usuário:
1. Extrai o conhecimento do advogado por meio de perguntas ou analisando documentos jurídicos (leis, petições, contratos ou PDFs).
2. Escreve e formata o arquivo SKILL.md seguindo a estrutura de 3 níveis progresivos de complexidade (Nivel 1: Básico/Geral, Nivel 2: Avançado/Tratamento de Exceções, Nivel 3: Casos complexos/Grounding e Limites).
3. Garante que regras do CDC, CLT, CPC, LGPD e súmulas do STF/STJ sejam integradas à skill jurídica de forma rigorosa e explícita.

Ao responder, se o usuário estiver pedindo para estruturar uma nova skill jurídica (como com ajuda do arquivo que ele forneceu), você deve:
- Fornecer explicações amigáveis no papel da Lex (a raposa jurídica) no corpó da resposta.
- Gerar o bloco de código completo do SKILL.md contendo marcas de visualização claras e metadados estruturados.
- O arquivo SKILL.md segue esta estrutura de exemplo:
# [Nome da Skill] - de modo literal e pragmático
## 1. Goal (Objetivo principal)
## 2. Context & Core Norms (Base jurídica e leis brasileiras aplicáveis, ex: CPC Art. 319, CLT, etc.)
## 3. Execution Levels (Os 3 Níveis):
### Level 1: Standard Case (Entradas normais, checklist básico)
### Level 2: Exceptional Handling (Erros, lacunas na petição, contestações ambíguas)
### Level 3: Hard Boundaries & Grounding (Não dar conselhos fora da competência, focar na validação normativa definitiva)
## 4. Test Cases & Expected Formats (Estrutura de entrada e saída exigida em JSON ou Markdown)

Seja inteligente, use termos de design e detalhes técnicos refinados do Direito brasileiro, mas de forma palatável para advogados de variados níveis tecnológicos.`;

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Account deletion endpoint – placeholder implementation with RBAC
app.delete("/api/account/delete", requireRole(["user", "admin"]), (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  // Here you would perform actual deletion from DB, remove files, etc.
  console.log(`Account deletion requested for userId=${userId}`);
  // Simulate success response
  return res.json({ status: "deleted", userId });
});


// Lex Chat chatbot endpoint
app.post("/api/lex-chat", async (req, res) => {
  try {
    const { message, history, contextDocument } = req.body;
    
    // Fallback simulation if no API key is provided
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
      // Simulate nice, smart Lex response
      console.log("No Gemini API key, using smart mock simulator.");
      return simulateLexResponse(message, res);
    }

    const client = getGeminiClient();

    // Reconstruct the contents list for Gemini API.
    // Format history for Gemini chat API. 
    // Format history matches { role: "user" | "model", parts: [{ text: "..." }] }
    const contents: any[] = [];
    
    if (history && history.length > 0) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }

    // Add current user prompt with background document text context if available
    let promptWithContext = message;
    if (contextDocument) {
      promptWithContext = `[Contexto do Documento Carregado:\nNome: ${contextDocument.name}\nConteúdo Extraído: \n${contextDocument.text.substring(0, 16000)}...]\n\nAgora o usuário diz: ${message}`;
    }

    contents.push({
      role: "user",
      parts: [{ text: promptWithContext }]
    });

    console.log("Calling Gemini API: gemini-3.5-flash");
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: LEX_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    const generatedText = response.text || "Desculpe, não consegui raciocinar sobre essa resposta.";
    
    // Check if there is a generated markdown skill block inside the response to extract it separately for the live preview split-view!
    const markdownRegex = /```markdown([\s\S]*?)```/g;
    let skillMarkdown = "";
    let match = markdownRegex.exec(generatedText);
    if (match && match[1]) {
      skillMarkdown = match[1].trim();
    } else {
      // Try generic ``` block or check if the whole response looks like markdown
      const genericRegex = /```([\s\S]*?)```/g;
      const genericMatch = genericRegex.exec(generatedText);
      if (genericMatch && (genericMatch[1].startsWith('#') || genericMatch[1].includes('##'))) {
        skillMarkdown = genericMatch[1].trim();
      }
    }

    return res.json({
      text: generatedText,
      generatedSkillMarkdown: skillMarkdown || undefined
    });

  } catch (error: any) {
    console.error("Gemini chatbot error:", error);
    res.status(500).json({ 
      error: "Erro no processamento da IA Lex", 
      details: error.message 
    });
  }
});

// Fallback nice responsive generator mock in case API key is missing
function simulateLexResponse(userMsg: string, res: any) {
  const normalized = userMsg.toLowerCase();
  
  let responseText = "";
  let skillMarkdown = "";

  if (normalized.includes("trabalhista") || normalized.includes("clt")) {
    responseText = `🦊 **Olá! Lex aqui.** Que ótima iniciativa! A área trabalhista do Direito brasileiro é repleta de especificidades e regras mandatórias (como prazos de prescrição decenal ou bienal, adicionais, reflexos de verbas). 

Analisei o seu pedido sobre **Skill Trabalhista para Agentes de IA** e montei um rascunho de **SKILL.md** extremamente focado no cálculo de horas extras e reflexos jurídicos no salário complessivo. 

Adicionei os 3 níveis progressivos para que sua IA saiba responder o que é o padrão (Nível 1), como lidar com acordos de compensação inválidos (Nível 2), e onde parar de palpitar caso surja complexidade de acordos coletivos conflitantes (Nível 3). 

Dê uma olhada no editor lateral e me diga se deseja que eu inclua citações ao Art. 59 da CLT ou súmulas específicas do TST (como a Súmula 85 sobre compensação de jornada)!`;
    
    skillMarkdown = `# Skill Jurídica: Validador de Horas Extras e Reflexos Trabalhistas
## 1. Goal
Validar a legalidade de jornadas de trabalho, identificar inconsistências de horas extras sob a ótica do Art. 59 da CLT e apontar de forma estruturada os reflexos verídicos cabíveis (DSR, 13º, Férias, FGTS).

## 2. Context & Core Norms
* **CLT Art. 59**: Limite de 2 horas extraordinárias diárias mediante acordo escrito.
* **CLT Art. 59-B**: Efeito da prestação de horas extras habituais na descaracterização do acordo de compensação de jornada.
* **Súmula 85 do TST**: Diretrizes sobre acordo de compensação de horas.
* **Súmula 291 do TST**: Indenização pela supressão de horas extraordinárias habituais.

## 3. Execution Levels
### Level 1: Standard Case
1. Recebe o espelho de ponto em formato estruturado ou textual.
2. Calcula a jornada diária, confrontando com o limite padrão de 8h diárias e 44h semanais.
3. Detecta horas extras simples e aplica o adicional mínimo constitucional de 50%.
4. Emite relatório com totalização do valor estimado devido baseado no valor da hora normal informado.

### Level 2: Exceptional Handling
1. **Acordo de Compensação Estourado**: Caso identifique que as horas extras excedem recorrentemente o limite legal diário (2h), notifica que há alta probabilidade de descaracterização judicial do acordo de compensação (aplicação da Súmula 85, IV, do TST).
2. **Ausência de Controle de Ponto**: Para cargos de confiança (Art. 62, II da CLT) ou teletrabalho sem controle (Art. 62, III da CLT), alerta o agente parceiro que a presunção de jornada não se aplica de forma automática, necessitando analisar provas de subordinação.

### Level 3: Hard Boundaries & Grounding
1. **Acordos de Convenção Coletiva (CCT)**: Se houver sobreposição de jornada 12x36 ou banco de horas anual, bloqueia respostas automáticas até que o usuário insira o texto da convenção aplicável.
2. **Proibições de Escopo**: Fica estritamente vetável o cálculo final definitivo sem assinatura de auditor jurídico ou contador habilitado.

## 4. Test Cases & Expected Formats
### Input Case (JSON)
\`\`\`json
{
  "monthly_hours_raw": [
    {"date": "2026-06-01", "hours": 11.5},
    {"date": "2026-06-02", "hours": 10.0}
  ],
  "hourly_base_rate": 25.50,
  "has_compensatory_agreement": true
}
\`\`\`

### Output Format (Markdown)
* **Status de Risco**: JORNADA ABUSIVA DETECTADA (Estouro do Art. 59 CLT em 01/06/2026 - 3.5 horas extras no mesmo dia).
* **Fundamento Legal**: Violação direta do limite diário e descaracterização latente do acordo de compensação.
`;
  } else if (normalized.includes("contrato") || normalized.includes("empresa") || normalized.includes("societário")) {
    responseText = `🦊 **Lex está na área!** Entendi seu foco: construir um validador de contratos jurídicos e cláusulas leoninas. 

Em contratos empresariais e civis brasileiros (regidos pelo Código Civil), é crucial blindar cláusulas de responsabilidade, multas rescisórias abusivas, foro de eleição e riscos de desconsideração da personalidade jurídica (Art. 50 do CC).

Desenhei no painel ao lado uma skill jurídica no padrão **SKILL.md** para validação de cláusulas de Limitação de Responsabilidade e Multas Penais. Veja que classifiquei as exceções comerciais de forma que a IA não cometa alucinações de escopo. 

Diga o que achou ou envie uma cláusula para testarmos no simulador!`;

    skillMarkdown = `# Skill Jurídica: Auditor de Cláusulas Contratuais Limitativas e Penais
## 1. Goal
Auditar contratos civis e empresariais, identificando cláusulas abusivas, penalidades desproporcionais ou nulidades contrárias ao Código Civil Brasileiro (ex: enriquecimento ilícito).

## 2. Context & Core Norms
* **Código Civil Art. 412**: O valor da cominação imposta na cláusula penal não pode exceder o da obrigação principal.
* **Código Civil Art. 413**: A penalidade deve ser reduzida equitativamente pelo juiz se a obrigação principal tiver sido cumprida em parte, ou se a penalidade for manifestamente excessiva.
* **Código Civil Art. 421-A**: Presunção de simetria nos contratos paritários e civis.

## 3. Execution Levels
### Level 1: Standard Case
1. Analisa as cláusulas de Rescisão, Multa por Inadimplemento e Multa de Fidelidade.
2. Verifica se a soma das penalidades excede o total do contrato (violação do Art. 412 do CC).
3. Sinaliza se a multa contratual geral está em patamar simétrico de 10% a 20%, o qual é tido como padrão de mercado.

### Level 2: Exceptional Handling
1. **Multa de Fidelidade Abusiva**: Em caso de rescisão antecipada, valida se a multa cobrada é proporcional ao tempo restante do contrato (Art. 413 do CC). Se cobrar multa integral, gera alerta de cláusula nula.
2. **Ambivalência de Remédios**: Se houver cobrança cumulada de lucros cessantes e cláusula penal compensatória pela mesma infração, adverte sobre "bis in idem" contratual conforme jurisprudência pacífica do STJ.

### Level 3: Hard Boundaries & Grounding
1. **Contratos com Relação de Consumo**: Se o contrato envolver consumidor pessoa física, desabilita a simetria do Código Civil e passa a aplicar o CDC (rebaixando multas de atraso para o limite legal místico de 2% conforme Art. 52, §1º).
2. **Opinião Subjetiva**: Proibir que o agente de IA afirme "este contrato está seguro para assinar" — deve utilizar exclusivamente expressões de diagnóstico como "Risco Baixo de Anulação de Cláusula Penal".

## 4. Test Cases & Expected Formats
### Input Text
"Parágrafo Terceiro: A rescisão do presente contrato por qualquer das partes implicará na incidência de multa irretratável e indevida de 100% (cem por cento) sobre o valor anual total remanescente do contrato, sem prejuízo de perdas e danos."

### Diagnostic Output
* **Alerta Crítico**: Cláusula penal de 100% sobre o remanescente sem proporcionalidade viola diretamente o Art. 413 do Código Civil Brasileiro.
* **Recomendação de Redação**: Reduzir de forma pró-rata ao tempo de cumprimento ou limitar expressamente a multa a 10% do saldo residual.
`;
  } else {
    // Default smart legal template
    responseText = `🦊 **Olá! Eu sou a Lex, sua raposa assessora jurídica de IA!** 

Vejo que você deseja iniciar a jornada de criação de skills de alto nível. Para que nossos agentes de IA operem de forma segura no intrincado cenário normativo do Brasil (cheio de leis, resoluções, portarias e regimentos), nós estruturamos o conhecimento técnico em **3 níveis de complexidade (progressive disclosure)**.

Preparei um modelo-base de **SKILL.md** focado na Lei Geral de Proteção de Dados (LGPD) no painel ao lado como ponto de partida. Ele foi calibrado para demonstrar como mapeamos:
1. **Nível 1 (Básico)**: Checklist de conformidade de Política de Privacidade simples.
2. **Nível 2 (Intermediário)**: Tratamento de Incidentes de Vazamento e Notificação à ANPD.
3. **Nível 3 (Limites)**: Tratamento de dados sensíveis de menores e decisões automatizadas com bloqueio de escopo.

**Como quer prosseguir?** 
* Você pode fazer o upload ou colar o texto de algum documento juridico (como PDFs de petições ou regulamentos) e me pedir: *'Extraia uma skill baseada nestes documentos'*
* Ou me diga qual área específica do Direito você deseja mapear no momento (ex: Trabalhista, Consumerista, LGPD, Tributário)!`;

    skillMarkdown = `# Skill Jurídica: Validador de Conformidade de Termos com a LGPD
## 1. Goal
Verificar de forma automática se termos de uso e políticas de privacidade contêm os requisitos essenciais de transparência, bases legais e direitos dos titulares conforme regido pela Lei 13.709/18 (LGPD).

## 2. Context & Core Norms
* **Lei 13.709/18 Art. 7º**: Bases legais para tratamento de dados pessoais.
* **Lei 13.709/18 Art. 9º**: Direito do titular ao acesso facilitado a informações claras sobre finalidade e duração.
* **Lei 13.709/18 Art. 18**: Direitos de revogação de consentimento, portabilidade e eliminação de dados.

## 3. Execution Levels
### Level 1: Standard Case
1. Analisa o documento em busca das finalidades de tratamento declaradas de forma explícita.
2. Identifica se existe cláusula expressa garantindo Canal de Comunicação com o Encarregado de Proteção de Dados (DPO).
3. Verifica a menção ao exercício de direitos dos titulares (Art. 18).

### Level 2: Exceptional Handling
1. **Consentimento Genérico**: Se identificar consentimento abrangente ou tácito ("Ao usar o site você concorda..."), assinala infração grave ao Art. 8º §4º da LGPD.
2. **Definições de Prazo Incompletas**: Se houver apenas a frase "guardaremos seus dados pelo tempo necessário", gera recomendação exigindo estipulação de critério concreto de descarte de dados.

### Level 3: Hard Boundaries & Grounding
1. **Dados de Crianças (Art. 14)**: Se o produto target se destina a menores de idade, a IA deve suspender a aprovação automática e exigir consentimento específico de pelo menos um dos pais.
2. **Transferência Internacional**: Caso envolva fluxos fora do país, recusa o escopo simplificado e orienta consulta com escritório especializado.

## 4. Test Cases & Expected Formats
### Input Document
"Nós coletamos seus dados pessoais de navegação para melhorar nossos serviços virtuais. Os dados serão guardados para sempre pela nossa empresa."

### Output Assessment
* **Irregularidade**: Ausência de base legal explícita e violação ao princípio de limitação temporal ("para sempre" é nulo na LGPD).
* **Nível de Risco**: Crítico.
`;
  }

  return res.json({
    text: responseText,
    generatedSkillMarkdown: skillMarkdown
  });
}

/* Scheduled retention job – runs daily at midnight */
cron.schedule('0 0 * * *', () => {
  const { execSync } = require('child_process');
  try {
    console.log('Running retention job (daily)...');
    execSync('bash ../scripts/retention_job.sh', { stdio: 'inherit' });
    console.log('Retention job completed.');
  } catch (err) {
    console.error('Retention job failed', err);
  }
});

// Vite middleware development setup or static serving in production

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sanfran.md server running on port ${PORT}`);
  });
}

startServer();
