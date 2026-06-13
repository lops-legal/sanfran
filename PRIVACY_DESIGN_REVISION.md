# Revisão do Design de Privacidade – Plataforma sanfran.sh

## Visão Geral
Esta proposta apresenta um plano de implementação para reforçar a privacidade da plataforma **sanfran.sh** (ou `sanfran.md`). O objetivo é garantir a conformidade com leis de proteção de dados (LGPD, GDPR) e promover a confiança dos usuários.

## Observações Atuais
- **Arquitetura**: não há documentação pública disponível (`sanfran.sh`/`sanfran.md` ausentes). É necessário mapear pontos de coleta de dados.
- **Coleta de Dados**: presume‑se uso de cookies, logs de acesso e autenticação via terceiros (Google, GitHub).
- **Armazenamento**: dados provavelmente residem em bancos de dados relacionais ou NoSQL dentro da stack JavaScript/Node.
- **Transmissão**: a aplicação web parece servir via HTTPS (verificar TLS configurado).
- **Privacidade‑by‑Design**: ainda não há políticas claras nem mecanismos de anonimização.

## Plano de Implementação
1. **Inventário de Dados**
   - Catalogar todos os pontos de entrada de dados (formulários, APIs, terceiros).
   - Classificar cada dado como *necessário*, *opcional* ou *sensível*.
2. **Minimização de Dados**
   - Remover coleta de campos não essenciais.
   - Introduzir *lazy loading* para informações pessoais somente quando necessário.
3. **Consentimento Explícito**
   - Implementar banner de cookies com opções granulares (analytics, marketing, funcional).
   - Registrar consentimento em logs auditáveis (timestamp, IP anonimizado).
4. **Criptografia em Rest e Transit**
   - Garantir TLS 1.3 para todas as conexões.
   - Criptografar dados sensíveis no banco (ex.: `AES-256-GCM`).
5. **Controle de Acesso**
   - Aplicar RBAC (Role‑Based Access Control) para endpoints de dados.
   - Revisar permissões de contas de serviço.
6. **Anonimização & Pseudonimização**
   - Para logs de auditoria, substituir identificadores por hashes salvos.
   - Utilizar técnicas de *differential privacy* para analytics agregados.
7. **Política de Retenção**
   - Definir períodos de retenção (ex.: logs 30 dias, perfis indefinidos até exclusão).
   - Automatizar exclusão de dados expirados via job cron (ex.: `hermes-agent` task).
8. **Transparência & Direitos do Usuário**
   - Criar página **Política de Privacidade** detalhada.
   - Implementar endpoint `/account/delete` que remove todos os dados do usuário e confirma por email.
9. **Teste & Auditoria**
   - Adicionar testes unitários e de integração que verificam ausência de vazamento de PII.
   - Executar scanner de segurança (ex.: `npm audit`, `bandit`).
10. **Documentação & Treinamento**
    - Atualizar `README.md` e `SECURITY_AUDIT.md` com as novas práticas.
    - Treinar a equipe de desenvolvimento sobre LGPD/GDPR.

## Checklist de Entrega
- [ ] Inventário de dados documentado em `docs/data‑inventory.md`.
- [ ] Banner de consentimento implementado.
- [ ] Criptografia configurada e verificada (`openssl s_client -connect localhost:443`).
- [ ] RBAC integrado nos controladores de API.
- [ ] Scripts de anonimização adicionados ao repositório (`scripts/anonymize_logs.py`).
- [ ] Job de retenção configurado (`cron/retention_job.sh`).
- [ ] Política de Privacidade publicada (`PRIVACY_POLICY.md`).
- [ ] Testes de privacidade incluídos no CI.

## Próximos Passos
1. Revisar este plano com a equipe de desenvolvimento e segurança.
2. Priorizar itens de acordo com risco e esforço (ex.: Consentimento → Criptografia → Retenção).
3. Agendar sprints de 2 semanas para implementação incremental.

---
*Documento gerado por Hermes Agent em `(date)`.*