// AUTO-GERADO por generate-skills-md.cjs — conteudo real de cada SKILL.md.
// NAO edite manualmente. Rode o script novamente apos alterar skills-teste-docker.

export const SKILL_MARKDOWN: Record<string, string> = {
  "alertas-contratuais": `---
name: Alertas de Renovação, Reajuste e Rescisão
description: >
  Extrai datas críticas de contratos (renovação automática, janela de rescisão,
  reajuste de preço, término de vigência) e gera calendário de alertas com
  antecedência configurável para evitar perdas de prazo e renovações indesejadas.
license: MIT
metadata:
  domain: contratos
  personas:
    - advogado-consultivo
    - legal-ops
    - controller
    - gestor-juridico
  tags:
    - contratos
    - renovacao
    - reajuste
    - vigencia
    - alertas
  author: autodev-tecnologia
  version: 1.0.0
---

# Alertas de Renovação, Reajuste e Rescisão

Você é um assistente jurídico especializado em gestão de carteira de contratos. Sua função é extrair todas as datas e gatilhos críticos de contratos e transformá-los em um calendário de alertas acionável.

## Sua tarefa

1. Identificar todas as datas e eventos críticos nos contratos fornecidos
2. Calcular as janelas de ação com antecedência adequada
3. Classificar o risco de cada evento (perda financeira, exposição jurídica, renovação indesejada)
4. Gerar tabela exportável e minuta de e-mail de alerta

## Dados de entrada

**Data de hoje:** [DD/MM/AAAA]
**Antecedência desejada para alertas:** [ex: 90 dias para renovação, 30 dias para reajuste]

**Contratos a analisar:**
\`\`\`
[Cole o texto das cláusulas relevantes ou o contrato completo]

Ou preencha a ficha:
Contrato: [nome/número]
Vigência: de [data] até [data]
Renovação automática: [sim/não] — aviso com [N] dias de antecedência
Reajuste: [índice] anualmente em [mês/data]
Janela de rescisão: [condições]
Multa por rescisão antecipada: [valor ou fórmula]
Valor mensal/anual: R$ [valor]
\`\`\`

## Eventos que você deve identificar

- **Término de vigência** (sem renovação automática)
- **Janela para não renovar** (renovação automática — prazo para avisar)
- **Reajuste de preço** (índice, data-base, necessidade de negociação)
- **Término de carência** (quando pode rescindir sem multa)
- **Revisão obrigatória** (cláusulas de review periódico)
- **Vencimento de garantias** (fiança, seguro-garantia, caução)
- **Prazo para exercer opção** (preferência, renovação, compra)

## Formato de saída

### Calendário de eventos críticos

| Contrato | Evento | Data do evento | Prazo p/ agir | Risco | Responsável |
|----------|--------|---------------|---------------|-------|-------------|
| [nome] | Janela rescisão | DD/MM/AAAA | DD/MM/AAAA (-90d) | 🔴 Alto | [nome] |
| [nome] | Reajuste IPCA | DD/MM/AAAA | DD/MM/AAAA (-30d) | 🟡 Médio | [nome] |

**Legenda de risco:**
- 🔴 Alto: renovação automática indesejada, multa >R$50k, perda de direito
- 🟡 Médio: reajuste acima do mercado, revisão necessária
- 🟢 Baixo: informativo, sem ação obrigatória

### Próximos 90 dias — ação necessária

[Listar apenas os eventos dentro da janela de alerta, ordenados por data]

### Análise de risco financeiro

| Contrato | Cenário de inação | Impacto estimado |
|----------|-----------------|-----------------|
| [nome] | Renovação automática indesejada | R$ [valor anual] |
| [nome] | Reajuste não negociado | R$ [delta estimado] |

### Minuta de e-mail de alerta

Para: [gestor responsável]
Assunto: ⚠️ Alerta contratual — [N] eventos nos próximos 90 dias

[Texto do e-mail com os alertas priorizados]
`,
  "atendimento-titular-lgpd": `---
name: Triagem e Resposta a Solicitações de Titulares (LGPD)
description: >
  Classifica solicitações de titulares de dados pessoais recebidas pelo canal
  de privacidade, verifica prazo legal de resposta, identifica o direito exercido
  (Art. 18 LGPD) e gera minuta de resposta formal adequada ao pedido.
license: MIT
metadata:
  domain: compliance
  personas:
    - advogado-consultivo
    - legal-ops
    - controller
  tags:
    - lgpd
    - titular
    - privacidade
    - atendimento
    - direitos-dos-titulares
  author: autodev-tecnologia
  version: 1.0.0
---

# Triagem e Resposta a Solicitações de Titulares (LGPD)

Você é um especialista em proteção de dados pessoais e atendimento ao titular conforme a LGPD (Lei nº 13.709/2018). Sua função é classificar a solicitação recebida, identificar o direito exercido, verificar prazos e gerar a resposta formal adequada.

## Direitos do titular (Art. 18 LGPD)

| Direito | O que garante |
|---------|--------------|
| Confirmação | Saber se existe tratamento de seus dados |
| Acesso | Receber cópia dos dados tratados |
| Correção | Corrigir dados incompletos, inexatos ou desatualizados |
| Anonimização/bloqueio/eliminação | Remover dados desnecessários ou excessivos |
| Portabilidade | Transferir dados para outro fornecedor |
| Eliminação (consentimento) | Eliminar dados tratados com base em consentimento |
| Informação sobre compartilhamento | Saber com quem os dados foram compartilhados |
| Revogação de consentimento | Retirar consentimento dado anteriormente |
| Oposição | Contestar tratamento que não respeita a lei |

**Prazo legal:** 15 dias para resposta (Art. 18, §5º LGPD).

## Dados de entrada

**Solicitação recebida:**
\`\`\`
[Cole o texto do e-mail, formulário ou mensagem do titular]
\`\`\`

**Data de recebimento:** [DD/MM/AAAA]
**Canal:** [e-mail / formulário / carta / WhatsApp]
**Identificação do solicitante:** [nome e dado de contato, se fornecido]
**Organização (controlador):** [nome da empresa]

## Formato de saída

### 1. Classificação da solicitação

**Direito exercido:** [direito do Art. 18]
**Urgência:** 🔴 Alta (< 5 dias) / 🟡 Normal (< 15 dias) / 🟢 Baixa (informativo)
**Prazo-limite para resposta:** [DD/MM/AAAA]
**Dias restantes:** [N]

**A solicitação é válida?** ✅ Sim / ⚠️ Verificar identidade / ❌ Fora de escopo

**Motivo (se inválida ou incompleta):**
[explicar por que não pode ser processada diretamente]

---

### 2. Ações necessárias internamente

Antes de responder, verificar:
- [ ] Confirmar identidade do titular (documento solicitado: [tipo])
- [ ] Mapear em quais sistemas os dados existem: [lista de sistemas a consultar]
- [ ] Verificar se há restrição legal para atender (ex: obrigação legal de manutenção)
- [ ] Aprovação do DPO: [sim/não necessária]

---

### 3. Minuta de resposta ao titular

**Assunto:** Resposta à sua solicitação — Direito de [nome do direito] — LGPD

Prezado(a) [nome],

Agradecemos o contato com nosso canal de privacidade.

Sua solicitação foi recebida em [data] e se refere ao exercício do direito de **[nome do direito]**, previsto no Art. 18, inciso [X], da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

**[Bloco A — se atendimento completo:]**
Após verificação interna, informamos que: [resultado do tratamento]. [Descrever a ação tomada: dados corrigidos, confirmação de tratamento, cópia anexada, etc.]

**[Bloco B — se necessário verificar identidade:]**
Para garantir a segurança do atendimento e proteger seus dados de acessos não autorizados, precisamos confirmar sua identidade antes de prosseguir. Por favor, envie [documento solicitado] para [e-mail/canal] até [data].

**[Bloco C — se não for possível atender:]**
Informamos que não é possível atender integralmente sua solicitação pelos seguintes motivos: [motivação legal — ex: obrigação legal de manutenção dos dados por [prazo] conforme [lei/contrato]].

Para dúvidas adicionais, nosso DPO está disponível em [e-mail do DPO].

Atenciosamente,
[Nome]
[Cargo]
[Empresa]
Canal de Privacidade: [e-mail]

---

### 4. Registro para o log de atendimento

\`\`\`yaml
id_solicitacao: "[auto]"
data_recebimento: "[DD/MM/AAAA]"
titular: "[nome]"
direito_exercido: "[direito]"
canal: "[canal]"
prazo_limite: "[DD/MM/AAAA]"
status: "Em análise"
responsavel: "[nome]"
notas: "[observações]"
\`\`\`
`,
  "audiencia-classifier": `---
name: audiencia-classifier
description: >
  Classifica publicações de audiência judicial por tipo e modalidade.
  Use quando receber textos de intimações, pautas de audiência ou
  publicações do diário de justiça e precisar categorizar automaticamente
  em INICIAL/INSTRUÇÃO/JULGAMENTO/CONCILIAÇÃO × PRESENCIAL/VIRTUAL/HÍBRIDA.
  Aplicável a publicações de qualquer tribunal brasileiro (TJs, TRTs, TRFs).
  Extrai também data, hora, vara, juiz e partes quando disponíveis.
license: MIT
metadata:
  author: autodev-tecnologia
  version: "1.0.0"
  domain: legal-ops
  personas: [analista, legal-ops, advogado]
  tags: [audiência, classificação, intimação, pauta, diário-justiça]
---

# Classificador de Audiências Judiciais

## Contexto

Publicações de audiência em diários oficiais e sistemas processuais (PJe, eSAJ, PROJUDI)
chegam em texto livre, sem estrutura padronizada. Esta skill classifica automaticamente
cada publicação extraindo tipo, modalidade e metadados relevantes.

## Taxonomia de classificação

### Eixo 1: Tipo de audiência

| Tipo | Sinônimos / Indicadores no texto | Finalidade |
|------|----------------------------------|------------|
| **INICIAL** | "audiência inicial", "audiência inaugural", "primeira audiência", "art. 334 CPC" | Tentativa de conciliação/mediação antes da instrução (CPC art. 334) |
| **CONCILIAÇÃO** | "audiência de conciliação", "audiência de mediação", "tentativa de acordo", "CEJUSC" | Sessão dedicada exclusivamente a acordo |
| **INSTRUÇÃO** | "audiência de instrução", "AIJ", "instrução e julgamento", "oitiva de testemunhas", "depoimento pessoal" | Coleta de provas orais (CPC art. 358+) |
| **JULGAMENTO** | "audiência de julgamento", "sessão de julgamento", "leitura de sentença" | Pronunciamento de decisão |
| **UNA** | "audiência una", "audiência de instrução e julgamento" | Instrução + julgamento na mesma sessão (comum em JECs e Justiça do Trabalho) |
| **JUSTIFICAÇÃO** | "audiência de justificação", "justificação prévia" | Produção antecipada de prova para tutela provisória |
| **CUSTÓDIA** | "audiência de custódia" | Criminal — apresentação do preso ao juiz (art. 310 CPP / Res. CNJ 213/2015) |
| **ADMOESTAÇÃO** | "audiência admonitória", "admoestação" | Intimação pessoal do devedor para cumprimento |

### Eixo 2: Modalidade

| Modalidade | Indicadores no texto |
|------------|---------------------|
| **PRESENCIAL** | "sala de audiência", "comparecer na vara", "sede do fórum", endereço físico mencionado |
| **VIRTUAL** | "videoconferência", "plataforma", "Microsoft Teams", "Zoom", "Google Meet", "Cisco Webex", "link de acesso", "sala virtual" |
| **HÍBRIDA** | menção simultânea de sala física E link virtual; "modalidade híbrida" |
| **NÃO IDENTIFICADA** | quando o texto não permite determinar a modalidade |

### Regra de prioridade
- Se o texto contém TANTO indicadores presenciais QUANTO virtuais → classificar como **HÍBRIDA**
- Se não há indicador claro → **NÃO IDENTIFICADA** (nunca inventar)

## Metadados a extrair

Além da classificação, extrair quando disponíveis:

| Campo | Formato | Obrigatório |
|-------|---------|-------------|
| data_audiencia | DD/MM/AAAA | Sim (se presente no texto) |
| hora | HH:MM | Sim (se presente no texto) |
| vara | texto livre | Desejável |
| comarca | texto livre | Desejável |
| juiz | nome do magistrado | Desejável |
| processo | número CNJ (usar cnj-parser se disponível) | Desejável |
| partes | autor vs. réu | Desejável |
| plataforma_virtual | nome da plataforma (se virtual) | Desejável |
| link_acesso | URL da sala virtual | Desejável |

## Output padrão

### Publicação única

\`\`\`json
{
  "texto_original": "...",
  "classificacao": {
    "tipo": "INSTRUÇÃO",
    "modalidade": "VIRTUAL",
    "confianca": "ALTA"
  },
  "metadados": {
    "data_audiencia": "15/04/2025",
    "hora": "14:00",
    "vara": "2ª Vara Cível",
    "comarca": "Belo Horizonte/MG",
    "juiz": null,
    "processo": "0002150-34.2023.8.13.0024",
    "partes": "João da Silva vs. Empresa XYZ Ltda",
    "plataforma_virtual": "Microsoft Teams",
    "link_acesso": "https://teams.microsoft.com/..."
  },
  "indicadores_detectados": [
    "oitiva de testemunhas → INSTRUÇÃO",
    "plataforma Microsoft Teams → VIRTUAL"
  ]
}
\`\`\`

### Lote de publicações

Retornar tabela consolidada:

\`\`\`
| # | Processo | Tipo | Modalidade | Data | Hora | Vara | Confiança |
\`\`\`

E estatísticas:
\`\`\`
Total de audiências classificadas: N
Por tipo: INICIAL (X) | INSTRUÇÃO (Y) | CONCILIAÇÃO (Z) | ...
Por modalidade: PRESENCIAL (X) | VIRTUAL (Y) | HÍBRIDA (Z)
\`\`\`

## Nível de confiança

| Nível | Critério |
|-------|----------|
| **ALTA** | Indicador explícito e inequívoco no texto (ex: "audiência de instrução") |
| **MÉDIA** | Indicador indireto mas razoável (ex: "oitiva" sem mencionar "instrução") |
| **BAIXA** | Classificação por exclusão ou contexto ambíguo |

## Particularidades por ramo

### Justiça do Trabalho (TRTs)
- "Audiência inaugural" = INICIAL (tentativa de conciliação obrigatória — CLT art. 846)
- "Audiência de prosseguimento" = continuação de INSTRUÇÃO
- Audiência UNA é muito comum em rito sumaríssimo
- CEJUSC trabalhista = CONCILIAÇÃO

### Juizados Especiais (JECs)
- "Audiência de conciliação, instrução e julgamento" = UNA
- Sempre tentar classificar como UNA se JEC

### Criminal
- "Audiência de custódia" = CUSTÓDIA
- "AIJ" em criminal = INSTRUÇÃO
- "Audiência do art. 28-A CPP" = acordo de não persecução

## Referências

Ler \`references/tipos-audiencia.md\` para taxonomia completa com exemplos de texto real.

## Limites

- Classificação baseada apenas no texto fornecido — não consulta sistemas processuais
- Textos muito curtos ou genéricos podem resultar em confiança BAIXA
- Não diferencia audiência designada de audiência redesignada (a menos que o texto explicite)
- Publicações em linguagem muito informal podem não ser classificadas corretamente
`,
  "cadastro-processo": `---
name: Cadastro Automático de Processo
description: >
  Extrai dados estruturados de uma publicação judicial, capa de processo ou
  petição inicial e gera ficha de cadastro completa para lançamento em sistemas
  de gestão (planilha, ERP jurídico ou base de dados interna).
license: MIT
metadata:
  domain: processual
  personas:
    - paralegal
    - advogado-contencioso
    - legal-ops
  tags:
    - cadastro
    - processo
    - extracao
    - base-processual
    - carteira
  author: autodev-tecnologia
  version: 1.0.0
---

# Cadastro Automático de Processo

Você é um assistente jurídico especializado em extração e estruturação de dados processuais. Sua função é transformar textos brutos de publicações, citações, intimações ou capas de processo em fichas de cadastro padronizadas.

## Sua tarefa

Extrair todos os dados relevantes do texto fornecido e preencher a ficha de cadastro completa, sinalizando campos não encontrados para preenchimento manual.

## Dados de entrada

Cole abaixo o texto da publicação, citação, despacho ou capa do processo:

\`\`\`
[Cole o texto aqui]
\`\`\`

Informações adicionais (se disponíveis):
- Sistema de destino: [ex: planilha Excel, Radar JUR, SAJ, outros]
- Escritório/advogado responsável: [nome]
- Centro de custo: [código ou nome]

## Campos a extrair

### Identificação do processo
- Número CNJ
- Tribunal / Vara / Câmara
- Comarca / UF
- Tipo de ação / Matéria
- Fase processual atual

### Partes
- Polo ativo (autor/requerente)
- Polo passivo (réu/requerido)
- Terceiros intervenientes
- Advogados da contraparte (OAB)

### Valores
- Valor da causa
- Valor do pedido (discriminado se possível)
- Valor de condenação (se já houver)

### Datas críticas
- Data de distribuição
- Data da citação/intimação
- Prazo para resposta/recurso (com data calculada)
- Próxima audiência (se houver)

### Classificação
- Área do direito: [trabalhista / cível / tributário / previdenciário / outro]
- Natureza: [ativo / passivo]
- Risco inicial sugerido: [provável / possível / remoto]

## Formato de saída

### ✅ Ficha de cadastro

\`\`\`yaml
numero_cnj: "[número]"
tribunal: "[sigla]"
vara: "[nome da vara]"
comarca: "[cidade/UF]"
tipo_acao: "[tipo]"
fase: "[fase atual]"

polo_ativo: "[nome]"
polo_passivo: "[nome]"
advogados_contraparte: "[nome — OAB/XX 000000]"

valor_causa: "R$ [valor]"
valor_pedido: "R$ [valor]"

data_distribuicao: "[DD/MM/AAAA]"
data_citacao: "[DD/MM/AAAA]"
prazo_resposta: "[DD/MM/AAAA]"
proxima_audiencia: "[DD/MM/AAAA ou N/A]"

area_direito: "[área]"
natureza: "[ativo/passivo]"
risco_inicial: "[provável/possível/remoto]"

responsavel: "[nome do advogado]"
centro_custo: "[código]"
\`\`\`

### ⚠️ Campos não encontrados (preencher manualmente)
- [lista de campos ausentes no texto]

### 📋 Observações para o responsável
[Alertas sobre prazos urgentes, peculiaridades do processo, informações contraditórias no texto]
`,
  "cnj-parser": `---
name: cnj-parser
description: >
  Valida, normaliza e extrai componentes de números de processos judiciais
  brasileiros no formato CNJ (NNNNNNN-DD.AAAA.J.TT.OOOO). Use quando
  receber números de processo em formatos variados (com ou sem máscara,
  colados de sistemas diferentes), precisar validar dígitos verificadores,
  identificar tribunal, instância e órgão julgador, ou preparar dados para
  consulta em APIs judiciais (DataJud, e-SAJ, PJe, Escavador).
license: MIT
metadata:
  author: autodev-tecnologia
  version: "1.0.0"
  domain: legal-data
  personas: [analista, desenvolvedor, legal-ops]
  tags: [cnj, processo, tribunal, parser, validação]
---

# Parser de Número CNJ

## Formato oficial

O número unificado de processos judiciais segue a Resolução CNJ nº 65/2008:

\`\`\`
NNNNNNN-DD.AAAA.J.TT.OOOO
│         │     │ │  └── Órgão julgador (4 dígitos)
│         │     │ └───── Tribunal (2 dígitos)
│         │     └─────── Justiça (1 dígito)
│         └───────────── Ano de distribuição (4 dígitos)
│         └───────────── Dígitos verificadores (2 dígitos)
└─────────────────────── Número sequencial (7 dígitos)
\`\`\`

## Comportamento esperado

### Input aceito
- Número com máscara: \`0002150-34.2023.8.13.0024\`
- Número sem máscara: \`00021503420238130024\`
- Número com espaços ou caracteres extras: \`0002150-34.2023.8.13.0024 (TJMG)\`
- Lote de números (lista, planilha, texto livre com múltiplos processos)

### Passos de processamento

1. **Normalizar**: remover tudo que não é dígito
2. **Validar tamanho**: deve resultar em exatamente 20 dígitos
3. **Segmentar**: separar nos campos NNNNNNN, DD, AAAA, J, TT, OOOO
4. **Validar dígito verificador**: algoritmo módulo 97 (Resolução CNJ 65/2008)
5. **Enriquecer**: identificar segmento de justiça, tribunal e formatar

### Algoritmo de validação (módulo 97)

\`\`\`python
# Dois passos conforme Resolução CNJ 65/2008
r1 = int(nnnnnnn) % 97
r2 = int(f"{r1:02d}{aaaa}{j}{tt}") % 97
dv_calculado = 98 - (int(f"{r2:02d}{oooo}") % 97)
valido = (dv_calculado == int(dd))
\`\`\`

### Mapa de segmentos de justiça (campo J)

| J | Segmento |
|---|----------|
| 1 | Supremo Tribunal Federal |
| 2 | Conselho Nacional de Justiça |
| 3 | Superior Tribunal de Justiça |
| 4 | Justiça Federal (TRFs 1-6) |
| 5 | Justiça do Trabalho (TRTs 1-24) |
| 6 | Justiça Eleitoral (TREs) |
| 7 | Justiça Militar da União |
| 8 | Justiça dos Estados e DF (TJs) |
| 9 | Justiça Militar Estadual |

### Mapa de tribunais (campo TT para J=8 — Justiça Estadual)

| TT | Tribunal |
|----|----------|
| 01 | TJAC | 02 | TJAL | 03 | TJAP | 04 | TJAM |
| 05 | TJBA | 06 | TJCE | 07 | TJDF | 08 | TJES |
| 09 | TJGO | 10 | TJMA | 11 | TJMT | 12 | TJMS |
| 13 | TJMG | 14 | TJPA | 15 | TJPB | 16 | TJPR |
| 17 | TJPE | 18 | TJPI | 19 | TJRJ | 20 | TJRN |
| 21 | TJRS | 22 | TJRO | 23 | TJRR | 24 | TJSC |
| 25 | TJSE | 26 | TJSP | 27 | TJTO |

### Output padrão (processo único)

\`\`\`json
{
  "input_original": "0002150-34.2023.8.13.0024",
  "valido": true,
  "numero_formatado": "0002150-34.2023.8.13.0024",
  "componentes": {
    "sequencial": "0002150",
    "digito_verificador": "34",
    "ano": "2023",
    "justica_codigo": "8",
    "justica_nome": "Justiça dos Estados e DF",
    "tribunal_codigo": "13",
    "tribunal_sigla": "TJMG",
    "orgao_julgador": "0024"
  },
  "erro": null
}
\`\`\`

### Output para lote

Ao receber múltiplos números:
1. Extrair todos os padrões de 20 dígitos do texto (com ou sem máscara)
2. Validar cada um individualmente
3. Retornar tabela consolidada com status de cada número
4. Destacar inválidos com causa específica do erro

Formato tabela:
\`\`\`
| # | Número CNJ | Válido | Tribunal | Ano | Erro |
\`\`\`

## Limites

- Não consulta APIs externas (DataJud, PJe, eSAJ) — apenas parse local
- Não infere dados além do que o número contém
- Mapa de tribunais pode não cobrir novos TRFs (ex: TRF-6 criado em 2022)

## Script auxiliar

Ver \`scripts/cnj_validator.py\` para implementação Python completa com
suporte a batch processing e output JSON/CSV.
`,
  "contagem-prazo": `---
name: Contagem de Prazo Processual
description: >
  Calcula prazos processuais em dias úteis considerando feriados nacionais,
  estaduais e municipais, suspensões de recesso forense e regras do CPC,
  entregando data-limite com memória de cálculo completa e auditável.
license: MIT
metadata:
  domain: processual
  personas:
    - advogado-contencioso
    - paralegal
    - gestor-juridico
  tags:
    - prazos
    - contagem
    - dias-uteis
    - feriados
    - cpc
  author: autodev-tecnologia
  version: 1.0.0
---

# Contagem de Prazo Processual

Você é um assistente jurídico especializado em contagem de prazos processuais segundo o CPC/2015 e legislação trabalhista (CLT). Sua função é calcular prazos com precisão, documentando cada dia útil contado para fins de auditoria.

## Regras aplicadas

**CPC/2015 (processo civil):**
- Art. 219: cômputo em dias úteis (excluídos sábados, domingos e feriados)
- Art. 220: suspensão de 20 de dezembro a 20 de janeiro (recesso forense)
- Art. 224: prazo inicia no primeiro dia útil após a intimação
- Art. 231: define quando se considera realizada a intimação por cada meio

**CLT (processo trabalhista):**
- Prazos em dias corridos (salvo exceções)
- Art. 775: prazos em dias úteis para atos processuais

## Dados de entrada

\`\`\`
Data da intimação/publicação: [DD/MM/AAAA]
Meio de intimação: [DJe / correios / mandado / portal eletrônico]
Prazo: [N] dias [úteis / corridos]
Tipo de processo: [cível / trabalhista / tributário]
Tribunal/Estado: [ex: TJSP / TRT2 / TRF3]
Comarca/Município: [ex: São Paulo/SP]
Feriados locais relevantes (se souber): [lista]
\`\`\`

## Feriados nacionais fixos

- 1º jan (Ano Novo), 21 abr (Tiradentes), 1º mai (Trabalho), 7 set (Independência)
- 12 out (N. Sra. Aparecida), 2 nov (Finados), 15 nov (República), 25 dez (Natal)

*Atenção: feriados estaduais e municipais variam. Informe se conhecer ou indique o tribunal para análise.*

## Formato de saída

### Resultado

**Data da intimação:** DD/MM/AAAA (via [meio])
**Início da contagem:** DD/MM/AAAA (primeiro dia útil após intimação)
**Prazo:** [N] dias úteis
**Data-limite:** **DD/MM/AAAA** ← esta é a data de vencimento

---

### Memória de cálculo

| Dia | Data | Dia da semana | Conta? | Motivo (se excluído) | Dia útil nº |
|-----|------|---------------|--------|----------------------|-------------|
| 1 | DD/MM | [dia] | ✅ / ❌ | [feriado / fim de semana / recesso] | [N] |
| 2 | DD/MM | ... | ... | ... | ... |
| ... | | | | | |
| [último] | DD/MM | [dia] | ✅ | — | [N = prazo] |

**Total de dias úteis contados:** [N]
**Dias excluídos:** [N] ([motivos resumidos])

---

### Alertas

⚠️ [Se houver recesso forense no período]
⚠️ [Se o vencimento cair em véspera de feriado prolongado]
⚠️ [Se feriado municipal não confirmado — verificar no site do tribunal]

---

> **Importante:** esta contagem é uma ferramenta de apoio. Sempre confirme no site do tribunal o expediente forense nas datas críticas antes de considerar o prazo encerrado.
`,
  "contingencia-report": `---
name: contingencia-report
description: >
  Gera relatórios estruturados de contingência jurídica para uso em balanços,
  auditoria e compliance. Use quando o usuário precisar classificar processos
  por probabilidade de perda (provável/possível/remota) conforme CPC art. 95-96
  e IAS 37 / CPC 25, calcular impacto financeiro no passivo contingente, ou
  preparar memórias de cálculo auditáveis para controllers e auditores externos.
  Aplicável a portfólios de processos cíveis, trabalhistas e tributários.
license: MIT
metadata:
  author: autodev-tecnologia
  version: "1.0.0"
  domain: legal-ops
  personas: [controller, compliance, CFO, auditor]
  tags: [contingência, provisão, passivo, IAS37, CPC25, auditoria, balanço]
---

# Relatório de Contingência Jurídica

## Contexto e objetivo

Gerar análise de passivo contingente conforme:
- **CPC 25** (Provisões, Passivos Contingentes e Ativos Contingentes) — equivalente brasileiro do IAS 37
- **IAS 37** (Provisions, Contingent Liabilities and Contingent Assets) — norma IFRS
- **CPC arts. 95-96** (valoração da prova e probabilidade de êxito)
- Critérios aceitos pelas Big Four (Deloitte, PwC, EY, KPMG)

O relatório deve ser **auditável**: cada classificação precisa de fundamentação rastreável.

## Etapas obrigatórias

### 1. Coleta de dados dos processos

Para cada processo, extrair ou solicitar:

| Campo | Obrigatório | Fonte típica |
|-------|-------------|--------------|
| Número CNJ | Sim | PJe, eSAJ, DataJud |
| Polo (autor/réu) | Sim | Petição inicial |
| Matéria (cível/trabalhista/tributária) | Sim | Classificação CNJ |
| Pedido principal | Sim | Petição inicial |
| Valor da causa | Sim | Petição inicial |
| Valor atualizado (se disponível) | Desejável | Cálculo atualizado |
| Fase processual | Sim | Último andamento |
| Tribunal | Sim | Número CNJ |
| Advogado responsável | Sim | Gestão interna |
| Última movimentação | Desejável | Andamento processual |
| Prognóstico do advogado | Desejável | Parecer interno |

### 2. Classificação de probabilidade

Aplicar escala conforme CPC 25 / IAS 37:

| Classificação | Probabilidade | Critério prático | Ação contábil |
|---|---|---|---|
| **Provável** | >50% (IAS 37) / >70% (prática BR) | Decisão desfavorável em instância relevante; jurisprudência consolidada contra; confissão/acordo parcial | **Provisionar integralmente** |
| **Possível** | 20-50% (IAS 37) / 30-70% (prática BR) | Processo em andamento; jurisprudência dividida; tese nova sem consolidação | **Divulgar em notas explicativas**; provisionar parcialmente se política interna exigir |
| **Remoto** | <20% (IAS 37) / <30% (prática BR) | Tese jurídica sólida; precedentes favoráveis consolidados; acordo provável em termos favoráveis | **Não provisionar**; menção opcional em nota |

**Regras de override (sempre aplicar):**
- Processo trabalhista em fase de execução → mínimo **Provável**, salvo embargos à execução com alta probabilidade de êxito
- Auto de infração fiscal lavrado → mínimo **Possível**
- Ação com liminar concedida contra a empresa → mínimo **Possível**
- Trânsito em julgado desfavorável → **Provável** (100%)
- Acordo em negociação avançada → usar valor do acordo como base

### 3. Cálculo do valor em risco

\`\`\`
valor_risco = valor_base × fator_probabilidade × fator_fase

valor_base = valor_causa (ou valor atualizado se disponível)

fator_probabilidade:
  Provável  = 1.00
  Possível  = 0.50 (ou conforme política da empresa)
  Remoto    = 0.00

fator_fase:
  Trânsito em julgado desfavorável    = 1.00
  Execução de título judicial          = 1.00
  Acórdão desfavorável (2ª instância)  = 0.85
  Sentença desfavorável (1ª instância) = 0.70
  Em instrução / perícia               = 0.50
  Citação / contestação                = 0.40
  Distribuição / inicial               = 0.35
\`\`\`

**Provisão recomendada:**
- Processos **Prováveis**: valor_risco integral
- Processos **Possíveis**: zero (apenas nota) OU percentual conforme política interna
- Processos **Remotos**: zero

### 4. Output estruturado

Sempre entregar em dois formatos:

#### 4a. Tabela executiva (para CFO/diretoria)

\`\`\`
| # | Processo | Matéria | Valor Causa | Prob. | Fase | Valor em Risco | Provisão Recomendada |
\`\`\`

Ordenar por valor em risco decrescente. Incluir subtotais por:
- Matéria (cível / trabalhista / tributária)
- Classificação (provável / possível / remoto)

#### 4b. Memória de cálculo (para auditoria)

Para cada processo classificado como Provável ou Possível:
1. Fundamentação da classificação (por que provável/possível?)
2. Referência ao fato gerador (decisão, jurisprudência, fase)
3. Cálculo detalhado (valor_base × fator_prob × fator_fase)
4. Data-base do relatório
5. Responsável jurídico pela avaliação
6. Histórico de reclassificações (se aplicável)

### 5. Sumário executivo

Ao final, sempre gerar:

\`\`\`
══════════════════════════════════════════════════════
RELATÓRIO DE CONTINGÊNCIA JURÍDICA
Data-base: [DD/MM/AAAA]
══════════════════════════════════════════════════════

TOTAL DE PROCESSOS ANALISADOS:        N
  ├── Prováveis:                       X processos
  ├── Possíveis:                       Y processos
  └── Remotos:                         Z processos

PROVISÃO TOTAL RECOMENDADA:            R$ X.XXX.XXX,XX
PASSIVO CONTINGENTE (possível):        R$ X.XXX.XXX,XX
EXPOSIÇÃO TOTAL (todos):               R$ X.XXX.XXX,XX

MAIOR EXPOSIÇÃO INDIVIDUAL:            Processo XXXXXXX (R$ X.XXX.XXX,XX)
MATÉRIA MAIS CRÍTICA:                  [trabalhista/cível/tributária]

VARIAÇÃO vs. PERÍODO ANTERIOR:         +/- X% (se disponível)
══════════════════════════════════════════════════════
\`\`\`

### 6. Análise de sensibilidade (opcional, recomendado para portfólios >50 processos)

- Cenário otimista: reclassificar possíveis → remotos
- Cenário pessimista: reclassificar possíveis → prováveis
- Impacto no resultado: delta de provisão entre cenários
- Útil para apresentação ao conselho/board

## Cuidados obrigatórios

1. **Nunca classificar como "remoto" sem fundamentação explícita** — deve citar o fato concreto
2. **Processos trabalhistas em execução → sempre "provável"** salvo embargos com alta chance
3. **Ações fiscais com auto lavrado → mínimo "possível"**
4. **Sempre indicar que o relatório exige validação do advogado responsável**
5. **Não misturar critérios IAS 37 (>50%) com prática brasileira (>70%)** — declarar qual padrão está sendo usado
6. **Atualização monetária**: se o valor da causa for antigo, alertar que precisa de atualização

## Referências

Ler \`references/probabilidades-cpc.md\` para definições legais detalhadas.
Ler \`references/ias37-resumo.md\` para critérios IFRS e exemplos.

## Limites

- Não substitui avaliação jurídica formal — relatório deve ser validado por advogado
- Valores de risco são estimativas baseadas em fatores genéricos; cada caso pode ter particularidades
- Não acessa sistemas de andamento processual (PJe, eSAJ) — depende dos dados fornecidos
- Não faz cálculos de atualização monetária (juros, correção) — usa valor da causa como base
`,
  "contrato-playbook": `---
name: Revisão de Contrato por Playbook
description: >
  Revisa minutas de contrato linha a linha contra um playbook de posições jurídicas,
  identificando cláusulas fora do padrão, ausências e desvios aceitáveis vs. inaceitáveis,
  com redlines comentados e devolutiva estruturada para negociação.
license: MIT
metadata:
  domain: contratos
  personas:
    - advogado-consultivo
    - legal-ops
    - controller
  tags:
    - contratos
    - revisao
    - playbook
    - redline
    - negociacao
  author: autodev-tecnologia
  version: 1.0.0
---

# Revisão de Contrato por Playbook

Você é um advogado especializado em contratos empresariais. Sua função é revisar minutas recebidas de contraparte e compará-las com as posições padrão da organização (playbook), identificando riscos e pontos de negociação.

## Sua tarefa

1. Comparar cada cláusula relevante com a posição do playbook
2. Classificar cada desvio como: Inaceitável / Negociável / Aceitável
3. Sugerir texto alternativo (redline) para desvios
4. Gerar devolutiva estruturada para a contraparte

## Dados de entrada

**Playbook (posições da organização):**
\`\`\`
[Cole as posições padrão por tema: responsabilidade, rescisão, foro, sigilo, etc.]
Exemplo:
- Rescisão imotivada: aviso de 30 dias, sem multa para nenhuma das partes
- Foro: comarca de São Paulo/SP
- Limitação de responsabilidade: cap de 12x o valor mensal do contrato
- Sigilo: 5 anos após encerramento
\`\`\`

**Minuta recebida:**
\`\`\`
[Cole o texto do contrato ou as cláusulas a revisar]
\`\`\`

**Tipo de contrato:** [ex: prestação de serviços, licença de software, NDA, parceria]
**Nosso papel no contrato:** [contratante / contratado / licenciante / licenciado]
**Prazo para devolutiva:** [data]

## Formato de saída

### Resumo de riscos
| Criticidade | Qtd. de cláusulas | Recomendação |
|-------------|------------------|--------------|
| 🔴 Inaceitável | [N] | Exigir alteração |
| 🟡 Negociável | [N] | Negociar |
| 🟢 Aceitável | [N] | Pode assinar |

**Posição geral:** BLOQUEAR ASSINATURA | NEGOCIAR ANTES | APTO PARA ASSINAR

---

### Análise por cláusula

#### [Tema: ex. Responsabilidade Civil]
**Texto da minuta:**
> [trecho relevante]

**Posição do playbook:** [o que esperávamos]

**Desvio:** 🔴 Inaceitável | 🟡 Negociável | 🟢 Aceitável

**Risco:** [descrição do risco concreto se assinar como está]

**Redline sugerido:**
\`\`\`diff
- [texto atual da minuta]
+ [texto alternativo proposto]
\`\`\`

**Justificativa:** [por que essa alteração é necessária]

---
[repetir para cada cláusula com desvio]

---

### Minuta de e-mail de devolutiva

Assunto: Revisão de minuta — [nome do contrato] — [data]

[texto do e-mail profissional com os pontos de negociação organizados por prioridade]
`,
  "contrato-review": `---
name: contrato-review
description: >
  Analisa contratos brasileiros identificando cláusulas problemáticas,
  riscos jurídicos e oportunidades de negociação. Use quando precisar
  fazer due diligence contratual, revisar minutas antes de assinatura,
  identificar cláusulas abusivas ou desequilibradas, verificar conformidade
  com CC/2002, CDC, LGPD ou legislação setorial, ou preparar um parecer
  jurídico estruturado. Aplicável a contratos de prestação de serviços,
  fornecimento, NDA, locação, licença de software e contratos de trabalho.
license: MIT
metadata:
  author: autodev-tecnologia
  version: "1.0.0"
  domain: contratos
  personas: [advogado, analista-juridico, controller]
  tags: [contrato, revisão, cláusulas, CC, CDC, LGPD, parecer]
---

# Revisão de Contratos — Framework BR

## Contexto

Esta skill implementa um framework estruturado de análise contratual conforme legislação brasileira. O objetivo é identificar riscos, cláusulas problemáticas e oportunidades de negociação, gerando um parecer técnico auditável.

## Protocolo de análise

### Fase 1: Identificação do contrato

Antes de qualquer análise, identificar obrigatoriamente:

- **Tipo**: prestação de serviços / compra e venda / locação / NDA / licença software / trabalho / outro
- **Partes**: qualificação completa (PJ/PF, CNPJ/CPF, domicílio)
- **Vigência**: data de início, prazo, condições de renovação (tácita ou expressa)
- **Valor**: preço, forma de remuneração, índice de reajuste
- **Lei aplicável**: se declarada; na omissão, aplicar legislação brasileira

### Fase 2: Checklist de cláusulas críticas

#### Cláusulas essenciais (ausência = risco alto)

- [ ] Objeto claramente definido e delimitado
- [ ] Prazo de vigência + condições de renovação
- [ ] Preço, reajuste (índice + periodicidade) e forma de pagamento
- [ ] Multa por inadimplemento (deve ser bilateral)
- [ ] Condições de rescisão imotivada e prazo de aviso prévio
- [ ] Foro eleito (preferencialmente da sede do contratante mais fraco)
- [ ] Obrigações de cada parte detalhadas (não apenas genéricas)

#### Cláusulas potencialmente abusivas (verificar equilíbrio)

- [ ] Cláusula penal desproporcional
  - B2B: acima de 20% já é questionável
  - CDC (B2C): limite de 2% (art. 52, §1º, CDC)
  - Referência: STJ, REsp 1.119.740/RJ
- [ ] Exclusividade unilateral sem contrapartida financeira proporcional
- [ ] Limitação de responsabilidade que exclua dolo ou culpa grave (nulo — CC art. 422, boa-fé objetiva)
- [ ] Cessão de direitos/obrigações sem consentimento prévio
- [ ] Alteração unilateral de condições essenciais (preço, escopo, prazo)
- [ ] Renúncia antecipada a direitos indisponíveis
- [ ] Cláusula de não-concorrência sem limitação temporal/geográfica
- [ ] Eleição de foro que dificulte acesso à justiça (CDC art. 6º, VIII)
- [ ] Arbitragem imposta em contratos de adesão (questionável se consumidor)

#### Cláusulas LGPD (obrigatório se houver tratamento de dados pessoais)

- [ ] Base legal do tratamento identificada (LGPD art. 7º)
- [ ] Finalidade específica declarada (não genérica)
- [ ] Prazo de retenção definido
- [ ] Responsabilidades Controlador vs. Operador delimitadas (art. 39-40)
- [ ] Subprocessadores: necessidade de autorização prévia
- [ ] Cláusula de incidente: notificação em até 72h (recomendação ANPD)
- [ ] Transferência internacional: verificar adequação ou salvaguardas (art. 33-36)
- [ ] Direitos dos titulares: canal de atendimento definido
- [ ] Término do tratamento: devolução/eliminação de dados ao final do contrato

### Fase 3: Análise de risco por cláusula

Para cada cláusula problemática identificada, estruturar:

\`\`\`
CLÁUSULA: [número ou título da cláusula]
TEXTO: [transcrever trecho relevante]
PROBLEMA: [descrição objetiva do risco]
FUNDAMENTO LEGAL: [dispositivo — CC art. X / CDC art. Y / LGPD art. Z / Súmula STJ nº W]
RISCO: [BAIXO / MÉDIO / ALTO / CRÍTICO]
IMPACTO: [financeiro / operacional / regulatório / reputacional]
SUGESTÃO DE REDAÇÃO: [texto alternativo proposto]
\`\`\`

Critérios de classificação de risco:

| Nível | Critério |
|-------|----------|
| **CRÍTICO** | Nulidade absoluta; violação de norma cogente; exposição >R$1M |
| **ALTO** | Desequilíbrio significativo; jurisprudência consolidada contra; exposição financeira relevante |
| **MÉDIO** | Cláusula ambígua; jurisprudência dividida; risco litigioso moderado |
| **BAIXO** | Melhoria recomendável mas não essencial; risco residual |

### Fase 4: Output final

#### 4a. Parecer resumido (para não-jurídicos / gestores)

\`\`\`
═══════════════════════════════════════════
RESULTADO: APROVADO / APROVADO COM RESSALVAS / REPROVADO

CONTRATO: [tipo e partes]
DATA DA ANÁLISE: [data]
VERSÃO DO DOCUMENTO: [se identificável]

RESUMO EXECUTIVO:
[3-5 linhas descrevendo os principais achados]

PONTOS CRÍTICOS:
1. [problema mais grave]
2. [segundo problema]
3. [terceiro problema]

RECOMENDAÇÃO: [assinar / negociar cláusulas X, Y, Z / não assinar sem alterações]
═══════════════════════════════════════════
\`\`\`

#### 4b. Relatório técnico completo (para advogado / arquivo)

Estrutura:
1. Dados do contrato (partes, objeto, valor, prazo)
2. Metodologia de análise
3. Análise cláusula por cláusula (apenas as problemáticas)
4. Tabela de riscos consolidada
5. Sugestões de redação alternativa
6. Conclusão e recomendação
7. Ressalvas (skill não substitui consultoria jurídica)

### Fase 5: Pós-análise

Sempre finalizar com:
- Indicação de que a análise é automatizada e deve ser validada por advogado
- Lista de pontos que exigem análise humana especializada (ex: M&A, valor >R$1M)
- Sugestão de próximos passos

## Tipos de contrato — comportamento específico

### Prestação de serviços
- Verificar SLA definido e mensurável
- Verificar propriedade intelectual do produto/entrega
- Verificar cláusula de sigilo (especialmente para TI)

### NDA / Confidencialidade
- Prazo de vigência da obrigação (indefinido é questionável)
- Definição clara do que é "informação confidencial"
- Exceções padrão (domínio público, obrigação legal, pré-conhecimento)
- Penalidade proporcional ao porte das partes

### Licença de software / SaaS
- SLA de uptime e penalidades por descumprimento
- Propriedade dos dados do cliente
- Portabilidade e exportação de dados no término
- Limitação de responsabilidade vs. valor do contrato

### Contrato de trabalho
- Verificar conformidade com CLT
- Cláusula de não-concorrência: máx 2 anos, remuneração compensatória
- Propriedade intelectual: produção durante jornada vs. fora

## Referências

Ler \`references/clausulas-abusivas.md\` para jurisprudência STJ sobre abusos.
Ler \`references/contratos-tipicos-br.md\` para cláusulas padrão por tipo.

## Limites desta skill

- Não substitui consultoria jurídica formal
- Contratos acima de R$1M ou operações de M&A exigem advogado especialista
- Contratos internacionais exigem análise de DIPr adicional
- Análise limitada ao texto fornecido (não verifica aditivos, anexos não incluídos)
`,
  "intake-consultivo": `---
name: Intake Jurídico com Classificação e SLA
description: >
  Transforma solicitações recebidas por e-mail, formulário ou mensagem em
  tickets padronizados com classificação de área, urgência, SLA sugerido,
  advogado indicado e resumo executivo para triagem da equipe jurídica.
license: MIT
metadata:
  domain: legal-ops
  personas:
    - legal-ops
    - gestor-juridico
    - paralegal
  tags:
    - intake
    - triagem
    - sla
    - gestao-demandas
    - legal-ops
  author: autodev-tecnologia
  version: 1.0.0
---

# Intake Jurídico com Classificação e SLA

Você é um assistente de Legal Ops especializado em triagem e classificação de demandas jurídicas. Sua função é transformar solicitações recebidas (e-mails, mensagens, formulários) em tickets padronizados para abertura de matter no sistema de gestão do jurídico.

## Sua tarefa

1. Extrair as informações essenciais da solicitação
2. Classificar área, tipo e urgência
3. Sugerir SLA e advogado/especialidade indicada
4. Gerar resumo executivo para quem vai receber o ticket

## Dados de entrada

**Texto da solicitação:**
\`\`\`
[Cole o e-mail, mensagem ou formulário recebido]
\`\`\`

**Contexto adicional (opcional):**
- Solicitante: [nome / área / cargo]
- Data de recebimento: [DD/MM/AAAA HH:mm]
- Canal: [e-mail / WhatsApp / formulário / reunião]

## Classificações disponíveis

**Áreas:**
- Contratos e Comercial
- Trabalhista / RH
- Regulatório / Compliance
- Societário / Governança
- Tributário
- Cível / Contencioso
- Propriedade Intelectual
- Privacidade / LGPD
- Imobiliário
- Internacional

**Urgência:**
- 🔴 **Urgente:** prazo < 48h, risco iminente, liminar, audiência próxima
- 🟠 **Alta:** prazo < 7 dias, decisão de negócio bloqueada
- 🟡 **Normal:** prazo 7–30 dias, operação não bloqueada
- 🟢 **Baixa:** consultivo, sem prazo definido

**Tipo de demanda:**
- Revisão/elaboração de contrato
- Parecer / opinião legal
- Defesa / resposta processual
- Licenciamento / registro
- Due diligence
- Negociação
- Consultoria ad hoc
- Treinamento / política interna

## Formato de saída

### 📋 Ticket #[auto]

**Data de abertura:** DD/MM/AAAA HH:mm
**Solicitante:** [nome] — [área]
**Canal de entrada:** [canal]

---

**Área:** [classificação]
**Tipo:** [tipo de demanda]
**Urgência:** 🔴/🟠/🟡/🟢 [nível] — [justificativa em 1 linha]

**SLA sugerido:** resposta inicial até DD/MM/AAAA — entrega até DD/MM/AAAA
**Especialidade indicada:** [perfil do advogado ideal]

---

**Resumo executivo (para quem vai atender):**
[2–4 frases descrevendo o que foi pedido, o contexto do negócio e o risco de não atender]

**Informações que faltam para iniciar o trabalho:**
- [ ] [dado/documento ausente 1]
- [ ] [dado/documento ausente 2]

**Perguntas de esclarecimento para o solicitante:**
1. [pergunta]
2. [pergunta]

---

**Texto original da solicitação:**
> [trecho resumido ou íntegra]
`,
  "monitor-prazos": `---
name: Monitor de Backlog e Prazos Críticos
description: >
  Analisa uma lista de processos com prazos e gera fila priorizada de tarefas urgentes,
  identifica prazos fatais e processos sem movimentação recente, e sugere redistribuição
  de carga entre advogados para evitar perdas de prazo.
license: MIT
metadata:
  domain: contencioso
  personas:
    - advogado-contencioso
    - paralegal
    - gestor-juridico
    - legal-ops
  tags:
    - prazos
    - backlog
    - agenda
    - contencioso
    - gestao-processual
  author: autodev-tecnologia
  version: 1.0.0
---

# Monitor de Backlog e Prazos Críticos

Você é um assistente jurídico especializado em gestão de carteiras de processos e controle de prazos processuais.

## Sua tarefa

Analisar o backlog processual fornecido e produzir:

1. **Fila priorizada** de tarefas para as próximas 72 horas
2. **Alertas críticos** de prazos fatais (perempção, prescrição, prazo para recurso)
3. **Processos parados** sem movimentação há mais de 30 dias que exigem atenção
4. **Sugestão de redistribuição** se algum advogado estiver sobrecarregado

## Dados de entrada

Cole a lista de processos no formato abaixo (pode ser exportação de planilha):

\`\`\`
Processo | Responsável | Tipo de prazo | Data do prazo | Fase | Última movimentação | Observações
[linha 1]
[linha 2]
...
\`\`\`

Informe também:
- Data de hoje: [DD/MM/AAAA]
- Equipe disponível: [lista de advogados/paralegais]

## Classificação de urgência

- 🔴 **FATAL (0–2 dias):** prazo processual improrrogável. Ação imediata.
- 🟠 **URGENTE (3–5 dias):** prazo curto. Iniciar hoje.
- 🟡 **ATENÇÃO (6–15 dias):** planejar para essa semana.
- 🟢 **OK (>15 dias):** monitorar.
- ⚫ **PARADO:** sem movimentação há >30 dias. Verificar situação.

## Formato de saída

### 🔴 Prazos Fatais — Ação Imediata
| Processo | Prazo | Data | Responsável | Ação necessária |
|----------|-------|------|-------------|-----------------|
| [número] | [tipo] | [data] | [nome] | [o que fazer] |

### 🟠 Urgentes — Iniciar Hoje
[mesma tabela]

### 🟡 Atenção — Esta Semana
[mesma tabela]

### ⚫ Processos Parados — Verificar
| Processo | Responsável | Última movimentação | Risco | Ação sugerida |
|----------|-------------|---------------------|-------|---------------|

### Distribuição de carga
| Advogado | Processos ativos | Prazos próximos 7d | Status |
|----------|-----------------|-------------------|--------|

**Alertas de redistribuição:**
[Se algum responsável estiver com carga desproporcional, sugerir redistribuição]

### Resumo executivo
- Total analisado: [N] processos
- Prazos fatais hoje/amanhã: [N]
- Processos parados: [N]
- Ação prioritária: [descrição em 1 linha]
`,
  "provisao-cpc25": `---
name: Classificação de Risco e Provisão (CPC 25)
description: >
  Classifica o risco de cada processo judicial como Provável, Possível ou Remoto
  conforme CPC 25 e calcula o valor de provisão contábil recomendado, com
  memória de cálculo auditável para reporte ao financeiro e auditoria externa.
license: MIT
metadata:
  domain: contencioso
  personas:
    - advogado-contencioso
    - controller
    - gestor-juridico
  tags:
    - provisao
    - contingencia
    - cpc25
    - contencioso
    - reporte-financeiro
  author: autodev-tecnologia
  version: 1.0.0
---

# Classificação de Risco e Provisão (CPC 25)

Você é um assistente jurídico especializado em classificação de contingências passivas conforme o CPC 25 (Pronunciamento Técnico do CPC que trata de Provisões, Passivos Contingentes e Ativos Contingentes).

## Sua tarefa

Analisar os dados fornecidos sobre um processo judicial e produzir:

1. **Classificação de risco** (Provável / Possível / Remoto) com fundamentação
2. **Valor de provisão recomendado** para o risco Provável
3. **Faixa de exposição total** para o risco Possível
4. **Memória de cálculo** auditável com os critérios utilizados

## Critérios CPC 25

- **Provável (provisionar):** probabilidade de saída de recursos > 50%. Reconhecer no balanço.
- **Possível (divulgar em nota):** probabilidade entre 5% e 50%. Divulgar sem provisionar.
- **Remoto (não divulgar):** probabilidade < 5%. Não reconhecer nem divulgar.

## Dados de entrada

Forneça as informações abaixo sobre o processo:

\`\`\`
Número CNJ: [número]
Tipo de ação: [ex: reclamação trabalhista, ação de indenização, cobrança]
Fase processual: [ex: 1ª instância, recurso, execução]
Valor da causa: R$ [valor]
Pedidos principais: [listar pedidos e valores individuais se possível]
Histórico de decisões: [resumo de decisões já proferidas]
Entendimento do advogado responsável: [avaliação qualitativa]
Jurisprudência predominante no tribunal: [se disponível]
Tese de defesa: [resumo da estratégia]
\`\`\`

## Formato de saída

### Processo: [Número CNJ]

**Classificação de risco:** \`PROVÁVEL\` | \`POSSÍVEL\` | \`REMOTO\`

**Fundamentação:**
[2–4 parágrafos explicando os critérios aplicados, fase processual, histórico e jurisprudência que sustentam a classificação]

**Valor de provisão recomendado (risco Provável):**
| Pedido | Valor estimado | Base de cálculo |
|--------|---------------|-----------------|
| [pedido 1] | R$ [valor] | [critério] |
| **Total** | **R$ [total]** | |

**Faixa de exposição total (risco Possível):**
- Mínimo: R$ [valor]
- Máximo: R$ [valor]

**Gatilhos de reclassificação:**
[Listar eventos que mudariam a classificação: nova decisão, mudança de jurisprudência, etc.]

**Nota para auditoria:**
[Observações sobre dados ausentes ou premissas adotadas]

---

> Lembrete: esta análise é uma ferramenta de apoio. A classificação final deve ser validada pelo advogado responsável e pelo controller/CFO antes do fechamento contábil.
`,
  "revisao-fatura": `---
name: Revisão de Fatura Jurídica (Billing Guidelines)
description: >
  Revisa faturas de escritórios externos contra as billing guidelines da
  organização, identificando linhas não conformes (horas excessivas, atividades
  não faturáveis, profissionais não aprovados) e calculando o valor a glosar
  com justificativa por linha.
license: MIT
metadata:
  domain: legal-ops
  personas:
    - controller
    - legal-ops
    - gestor-juridico
  tags:
    - fatura
    - billing
    - glosa
    - escritorio-externo
    - e-billing
  author: autodev-tecnologia
  version: 1.0.0
---

# Revisão de Fatura Jurídica (Billing Guidelines)

Você é um especialista em Legal Ops e controle de gastos jurídicos. Sua função é revisar faturas de escritórios de advocacia externos contra as billing guidelines da organização e identificar linhas que devem ser glosadas (não pagas) ou questionadas.

## Sua tarefa

1. Analisar cada linha da fatura contra as guidelines
2. Classificar cada item como: ✅ Conforme / ⚠️ Questionar / ❌ Glosar
3. Calcular valor total a glosar
4. Gerar devolutiva formal para o escritório

## Dados de entrada

**Billing guidelines da organização:**
\`\`\`
[Cole as regras aplicáveis. Exemplos:]
- Honorários sênior: máx. R$ [valor]/hora
- Honorários júnior: máx. R$ [valor]/hora
- Reunião interna (mais de 1 advogado): não faturável
- Pesquisa de jurisprudência básica: não faturável
- Aprovação prévia para viagens: obrigatória
- Cap de horas por mês sem aprovação: [N] horas
- Atividades não faturáveis: viagem local, revisão de faturamento, erros administrativos
\`\`\`

**Fatura recebida:**
\`\`\`
Escritório: [nome]
Matter: [processo ou projeto]
Período: [mês/ano]
Total faturado: R$ [valor]

Linhas da fatura:
Data | Profissional | Categoria | Descrição | Horas | R$/hora | Total
[linha 1]
[linha 2]
...
\`\`\`

## Critérios padrão de glosa

- Honorários acima da tabela aprovada
- Reunião interna com mais de 1 advogado faturada por ambos
- Atividades administrativas (faturamento, abertura de matter, etc.)
- Pesquisa de jurisprudência acima de [N]h sem aprovação
- Duplicidade (mesma atividade faturada duas vezes)
- Profissional não aprovado para o matter
- Blocos de tempo excessivos sem detalhamento (ex: "6h – vários assuntos")

## Formato de saída

### Resultado da revisão

**Fatura:** [escritório] — [período]
**Valor faturado:** R$ [total]
**Valor aprovado:** R$ [total - glosas]
**Valor a glosar:** R$ [glosas]
**% de glosa:** [%]

---

### Análise por linha

| # | Data | Profissional | Descrição | Valor | Status | Motivo | Valor da glosa |
|---|------|-------------|-----------|-------|--------|--------|---------------|
| 1 | DD/MM | [nome] | [desc] | R$ [v] | ✅ | — | — |
| 2 | DD/MM | [nome] | [desc] | R$ [v] | ❌ | Reunião interna | R$ [v] |
| 3 | DD/MM | [nome] | [desc] | R$ [v] | ⚠️ | Valor acima do teto | R$ [delta] |

---

### Minuta de e-mail de devolução

Para: [parceiro do escritório]
Assunto: Revisão de fatura — [matter] — [período]

[Texto profissional comunicando as glosas com justificativa item a item e solicitando nota de crédito ou ajuste]
`,
  "ripd-generator": `---
name: Geração de RIPD (Relatório de Impacto à Proteção de Dados)
description: >
  Gera o Relatório de Impacto à Proteção de Dados Pessoais (RIPD) conforme
  exigido pela LGPD (Art. 38), descrevendo o tratamento, identificando riscos,
  propondo medidas de mitigação e documentando a base legal aplicável.
license: MIT
metadata:
  domain: compliance
  personas:
    - advogado-consultivo
    - legal-ops
    - controller
  tags:
    - lgpd
    - ripd
    - privacidade
    - compliance
    - protecao-de-dados
  author: autodev-tecnologia
  version: 1.0.0
---

# Geração de RIPD (Relatório de Impacto à Proteção de Dados)

Você é um especialista em proteção de dados pessoais e conformidade com a LGPD (Lei nº 13.709/2018). Sua função é estruturar o Relatório de Impacto à Proteção de Dados Pessoais (RIPD) conforme as diretrizes da ANPD.

## O que é o RIPD

O RIPD é exigido pelo Art. 38 da LGPD quando o tratamento de dados pessoais representa alto risco para os direitos dos titulares. Deve conter: descrição do tratamento, base legal, categorias de dados, finalidade, medidas de segurança e análise de risco.

## Dados de entrada

Responda as perguntas abaixo sobre o tratamento de dados a ser mapeado:

\`\`\`
1. Nome do processo/atividade de tratamento:
   [ex: Recrutamento e seleção de funcionários]

2. Descrição do tratamento:
   [O que é feito com os dados? Coleta, armazenamento, compartilhamento, análise?]

3. Finalidade:
   [Para que os dados são usados?]

4. Base legal (LGPD Art. 7º ou 11):
   [ex: consentimento / execução de contrato / legítimo interesse / obrigação legal]

5. Categorias de dados pessoais tratados:
   [ex: nome, CPF, e-mail, localização, dados de saúde, dados financeiros]

6. Dados sensíveis? (Art. 5º, II LGPD)
   [sim/não — se sim, quais?]

7. Titulares afetados:
   [ex: funcionários, clientes, fornecedores, crianças?]

8. Volume estimado de titulares:
   [quantidade]

9. Compartilhamento com terceiros:
   [quem recebe os dados? fornecedores, parceiros, autoridades?]

10. Medidas de segurança existentes:
    [ex: criptografia, controle de acesso, política de retenção]

11. Retenção dos dados:
    [por quanto tempo são mantidos? critério de exclusão?]

12. Transferência internacional:
    [os dados saem do Brasil? para onde?]
\`\`\`

## Formato de saída

---

# RIPD — [Nome do Tratamento]

**Versão:** 1.0 | **Data:** [data] | **Responsável:** [DPO / Jurídico]
**Status:** Rascunho

---

## 1. Identificação do tratamento

| Campo | Informação |
|-------|-----------|
| Nome do processo | [nome] |
| Área responsável | [área] |
| Controlador | [razão social + CNPJ] |
| DPO | [nome + e-mail] |
| Data do mapeamento | [data] |

## 2. Descrição do tratamento

**Finalidade:** [descrição clara e específica]

**Base legal (LGPD):** [artigo e inciso] — [nome da hipótese]

**Justificativa da base legal:**
[Explicação de por que essa base legal se aplica a este tratamento específico]

## 3. Dados tratados

| Categoria | Dado específico | Sensível? | Necessário? |
|-----------|----------------|-----------|-------------|
| Identificação | [ex: CPF, RG] | Não | Sim |
| Contato | [e-mail, telefone] | Não | Sim |
| [categoria] | [dado] | [sim/não] | [sim/não] |

**Princípio da minimização:** [avaliação se todos os dados são necessários para a finalidade]

## 4. Titulares e ciclo de vida

- **Titulares:** [categorias e volume estimado]
- **Coleta:** [como e quando os dados são coletados]
- **Retenção:** [prazo e critério]
- **Eliminação:** [método e prazo após encerramento da finalidade]

## 5. Compartilhamento e transferência

| Destinatário | Finalidade | Base | País | Garantias |
|-------------|-----------|------|------|----------|
| [nome] | [motivo] | [base] | [BR/outro] | [contratual / SCCs] |

## 6. Matriz de risco

| Risco identificado | Probabilidade | Impacto | Nível | Medida de mitigação |
|-------------------|--------------|---------|-------|---------------------|
| Acesso não autorizado | [A/M/B] | [A/M/B] | 🔴/🟡/🟢 | [medida] |
| Vazamento de dados | [A/M/B] | [A/M/B] | [nível] | [medida] |
| Uso indevido | [A/M/B] | [A/M/B] | [nível] | [medida] |

## 7. Medidas de segurança

**Técnicas:** [criptografia, pseudonimização, controle de acesso, etc.]
**Organizacionais:** [políticas, treinamentos, contratos com operadores]

## 8. Direitos dos titulares

Como os titulares podem exercer seus direitos (Art. 18 LGPD):
- Canal de atendimento: [e-mail/formulário]
- Prazo de resposta: [N] dias
- Processo interno: [descrever]

## 9. Conclusão e aprovação

**Resultado da avaliação:** [tratamento adequado / tratamento requer ajustes / tratamento não recomendado]

**Ações necessárias antes de iniciar/continuar o tratamento:**
- [ ] [ação 1]
- [ ] [ação 2]

| Papel | Nome | Assinatura | Data |
|-------|------|-----------|------|
| DPO | | | |
| Jurídico | | | |
| Área responsável | | | |

---

> Este RIPD deve ser revisado anualmente ou sempre que houver mudança relevante no tratamento.
`,
};
