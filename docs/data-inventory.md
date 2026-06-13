---
name: data-inventory
---

# Inventário de Dados

Este documento lista os pontos de coleta de dados da plataforma **sanfran.sh**.

| Fonte de Dados | Tipo | Necessário? | Sensível? | Observação |
|---------------|------|-------------|-----------|------------|
| Formulário de registro | Texto (nome, email) | Sim | Sim | Dados pessoais identificáveis |
| Cookies de análise | Cookie | Não | Não | Pode ser opt‑in via banner |
| Logs de acesso | Texto (IP, timestamp, user‑agent) | Sim | Parcial (IP) | Anonimizar IPs ao armazenar |
| Integração GitHub OAuth | Token | Sim | Sim | Armazenar apenas token criptografado |
| Preferências de UI | JSON | Não | Não | Guardar somente se o usuário consentir |

*Este arquivo é um ponto de partida e deve ser mantido atualizado conforme a aplicação evolui.*
