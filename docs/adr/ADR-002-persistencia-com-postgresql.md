# ADR-002 - Persistência com PostgreSQL e Prisma

## Status
Aceito

## Contexto
No ADR-001, a EasyFood adotou um array em memória para armazenar os restaurantes
cadastrados. Essa decisão foi tomada conscientemente como algo temporário, apenas
para viabilizar o desenvolvimento inicial da API sem a complexidade de configurar
um banco de dados logo de início.

Um dos critérios de revisão definidos naquele ADR já aconteceu: a aplicação
precisa manter os dados entre reinicializações do servidor. Hoje, toda vez que o
processo Node.js é reiniciado (por deploy, crash, ou simples atualização de
código), todos os restaurantes cadastrados via `POST /restaurants` são perdidos,
restando apenas os dados que estavam hardcoded no código-fonte. Isso é
inaceitável para qualquer uso real da aplicação, já que ela deveria funcionar
como um cadastro persistente de restaurantes.

## Alternativas consideradas

1. **Manter o array em memória**
   Descartada por não resolver o problema central: perda de dados a cada
   reinicialização, além de não escalar para múltiplas instâncias do servidor
   (cada instância teria sua própria cópia dos dados).

2. **Persistir em arquivo local (ex: JSON em disco)**
   Resolveria parcialmente a perda de dados, mas traria problemas de
   concorrência (múltiplas escritas simultâneas corrompendo o arquivo), falta de
   consultas estruturadas e nenhuma garantia de integridade dos dados. Serve bem
   para protótipos, mas não para uma aplicação que deve evoluir.

3. **Banco NoSQL (ex: MongoDB)**
   Também resolveria a persistência, mas os dados da EasyFood (restaurantes com
   nome, categoria e nota) são naturalmente tabulares e com relacionamentos
   previsíveis. Um banco relacional se encaixa melhor nesse formato e já é o
   padrão mais comum no ecossistema que o time está estudando.

4. **PostgreSQL + Prisma (escolhida)**
   Banco relacional robusto, gratuito, open-source, com ORM (Prisma) que
   simplifica migrations, tipagem e consultas, mantendo o controle explícito do
   schema.

## Decisão
Adotar o **PostgreSQL** como banco de dados relacional da EasyFood, acessado
através do **Prisma** como ORM/camada de acesso a dados.

A arquitetura passa de:

```
Cliente -> Express -> Array em memória
```

para:

```
Cliente -> Express -> Prisma -> PostgreSQL
```

## Justificativa
- PostgreSQL é um banco relacional maduro, gratuito e amplamente adotado no
  mercado, com ótima documentação e suporte da comunidade.
- Os dados da EasyFood (restaurantes com atributos fixos e bem definidos) se
  encaixam naturalmente no modelo relacional, com forte tipagem de colunas
  (`VarChar`, `Decimal`), algo que um array em memória nunca ofereceu.
- O Prisma adiciona uma camada de abstração que gera um cliente tipado a partir
  do `schema.prisma`, reduzindo erros manuais de SQL e tornando o código do
  `server.js` mais legível (`prisma.restaurant.findMany()` em vez de acessar um
  array global).
- O Prisma também gerencia as migrations (`prisma migrate dev`), criando um
  histórico versionado da evolução do schema do banco — algo que o array em
  memória não tinha e que passa a existir em `prisma/migrations`.
- É a solução mais simples que já resolve o problema real (persistência),
  sem introduzir a complexidade operacional de um banco NoSQL que não traz
  benefício claro para este caso de uso.

## Consequências positivas
- Os dados cadastrados via API não são mais perdidos ao reiniciar o servidor.
- O schema do banco (`Restaurant`) fica documentado e versionado no código,
  via `prisma/schema.prisma` e no histórico de migrations.
- Ganho de tipagem e validação: campos como `rating` agora respeitam um tipo
  `Decimal(2,1)` no banco, e o Prisma Client é gerado com tipos TypeScript-like.
- É possível consultar e editar os dados visualmente com o Prisma Studio, sem
  precisar de um cliente SQL externo.
- A separação de responsabilidades melhora: o `server.js` cuida apenas de rotas
  HTTP, e o Prisma cuida do acesso a dados.

## Consequências negativas / trade-offs
- A aplicação passa a depender de um serviço externo (o PostgreSQL) para
  funcionar. Se o banco estiver indisponível, as rotas `GET` e `POST` passam a
  retornar erro 500, algo que não existia quando os dados viviam em memória.
- Aumento da complexidade de setup: agora é preciso instalar o PostgreSQL,
  configurar variáveis de ambiente (`DATABASE_URL`) e rodar migrations antes de
  a aplicação funcionar — antes bastava rodar `node server.js`.
- Novo ponto de falha e de operação: backups, controle de acesso, versão do
  banco e disponibilidade do serviço passam a ser responsabilidades da equipe.
- Testes automatizados e ambientes locais agora exigem um banco de dados
  disponível (ou mockado), aumentando a complexidade do ambiente de
  desenvolvimento.
- Chamadas ao banco são assíncronas e passam por I/O de rede, então a latência
  das rotas aumenta em comparação ao acesso direto a um array em memória.

## Critérios de revisão
Esta decisão deve ser revisitada se:
- O volume de restaurantes ou o número de requisições crescer a ponto de exigir
  estratégias de cache, réplicas de leitura ou sharding.
- Surgir a necessidade de relacionamentos mais complexos entre entidades
  (ex: pedidos, usuários, avaliações) que exijam repensar o modelo de dados.
- A aplicação precisar rodar em múltiplos serviços/domínios distintos, o que
  pode levantar a discussão sobre "database per service" em uma futura
  arquitetura de microsserviços.
- A disponibilidade do PostgreSQL se tornar um gargalo real de confiabilidade
  para o negócio, exigindo réplicas, failover automático ou um banco gerenciado.
