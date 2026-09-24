# Módulo auth (planejamento)

Este módulo ainda não está implementado. Ele é reservado para receber a futura
funcionalidade de autenticação da EasyFood, seguindo a mesma organização em
camadas já usada no módulo `restaurants`:

src/modules/auth/
├── auth.service.js      -> valida credenciais, gera/verifica tokens
├── auth.controller.js   -> recebe req/res dos endpoints de login/registro
└── auth.routes.js       -> define /auth/login, /auth/register etc.

Quando implementado, o `app.js` passaria a incluir:

  const authRoutes = require("./modules/auth/auth.routes");
  app.use("/auth", authRoutes);

Ver docs/adr/ADR-003-estrategia-de-autenticacao.md para a decisão sobre qual
tecnologia usar.
