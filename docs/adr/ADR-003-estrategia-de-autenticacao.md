# ADR-003 - Estratégia de autenticação

## Status
Proposta

## Data
03/09/2026

## Responsável
Equipe EasyFood

## Contexto
A EasyFood agora está organizada em camadas (routes, controller, service,
database), preparada para receber novos módulos. Até este momento, qualquer
pessoa pode consultar e cadastrar restaurantes sem nenhuma verificação de
identidade — as rotas GET e POST /restaurants são públicas.

Conforme o produto evolui, será necessário identificar quem está fazendo cada
requisição: por exemplo, apenas o dono de um restaurante deveria poder
editá-lo ou removê-lo, e futuras funcionalidades (pedidos, avaliações,
perfis de usuário) exigem saber quem é o usuário autenticado.

## Alternativas consideradas
1. **JWT (JSON Web Token) implementado na própria API** - a API gera e
   valida os tokens, com login/senha armazenados no próprio banco (usando
   hash, ex.: bcrypt).
2. **AWS Cognito** - serviço gerenciado de autenticação da AWS, cuida de
   cadastro, login, recuperação de senha e emissão de tokens.
3. **Login com Google (OAuth 2.0)** - delega a autenticação para o Google,
   sem a EasyFood armazenar senhas.
4. **Outra solução (ex.: Auth0, Firebase Auth)** - serviços de terceiros
   similares ao Cognito, com autenticação como produto.

## Decisão
Adotar autenticação baseada em **JWT implementada na própria API**, com login
e senha armazenados no PostgreSQL (senha com hash via bcrypt).

## Justificativa
- A EasyFood ainda está em fase de aprendizado/prototipação: implementar JWT
  manualmente ajuda a entender o fluxo completo de autenticação (algo que um
  serviço gerenciado esconderia).
- Não adiciona dependência de um provedor de nuvem específico nesta fase,
  mantendo a stack simples (Node + Express + Prisma + PostgreSQL).
- JWT se encaixa bem na arquitetura em camadas já criada: um `auth.service.js`
  cuida de gerar/validar tokens, um `auth.controller.js` expõe `/auth/login`
  e `/auth/register`, e um middleware de autenticação pode proteger as rotas
  de restaurantes que precisarem de dono autenticado.
- É uma solução amplamente documentada, com bibliotecas maduras no ecossistema
  Node (`jsonwebtoken`, `bcrypt`).

## Consequências

### Positivas
- Controle total sobre o fluxo de autenticação e sobre o formato do token.
- Não depende de disponibilidade ou custo de um serviço externo de terceiros.
- Se encaixa naturalmente na estrutura em módulos já adotada.

### Negativas / Trade-offs
- A equipe assume a responsabilidade de implementar corretamente práticas de
  segurança (hash de senha, expiração e renovação de token, proteção contra
  ataques comuns), que um serviço gerenciado como Cognito ou Auth0 já
  resolveria de fábrica.
- Não oferece, por padrão, funcionalidades como login social, recuperação de
  senha por e-mail ou MFA — teriam que ser construídas manualmente depois.
- Se a EasyFood crescer muito (múltiplos apps, múltiplos times), migrar de
  uma autenticação própria para um provedor gerenciado pode exigir retrabalho.

## Critérios de revisão
Esta decisão deverá ser reavaliada quando:
1. For necessário suportar login social (Google, Apple) de forma nativa.
2. Exigências de compliance/segurança tornarem inviável manter autenticação
   própria (ex.: auditorias, certificações).
3. A equipe crescer e a manutenção da autenticação própria consumir tempo
   desproporcional comparado ao custo de um serviço gerenciado.

## Notas
Esta decisão cobre apenas a estratégia de autenticação (como identificar o
usuário). Autorização (o que cada usuário pode fazer) é um problema
relacionado, mas separado, que deverá ser tratado em uma decisão futura.
