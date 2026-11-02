# ADR 002: Processamento e Otimização de Imagens dos Pratos

## Status
Aceito

## Contexto
A aplicação EasyFood necessita de exibir imagens nos cardápios dos restaurantes. Para garantir uma boa experiência do utilizador e evitar elevado consumo de largura de banda, as imagens enviadas precisam de ser redimensionadas e otimizadas antes de serem armazenadas.

## Alternativas Consideradas
1. **Processamento Síncrono na API Express (Monólito):** Receber a imagem via Multer, otimizar com a biblioteca Sharp e guardar localmente no servidor.
2. **Serviço Independente / Microsserviço:** Criar um serviço separado focado unicamente no processamento de media.
3. **Arquitetura Serverless / FaaS:** Utilizar funções em nuvem (ex.: AWS Lambda) acionadas por eventos de upload num bucket (ex.: AWS S3).

## Decisão
Decidiu-se manter o processamento de imagens integrado diretamente na API principal da EasyFood utilizando as bibliotecas `multer` e `sharp`.

## Justificativa
- **Simplicidade e Escopo Académico:** A aplicação encontra-se numa fase inicial de desenvolvimento com volume limitado de requisições.
- **Redução de Complexidade:** Evita a necessidade de configurar filas de mensagens, infraestruturas de nuvem adicionais ou múltiplos serviços.
- **Reaproveitamento de Infraestrutura:** Utiliza o ambiente Node.js já existente para realizar o processamento em memória e armazenamento no sistema de ficheiros local (`uploads/dishes/`).

## Consequências
### Positivas
- Implementação simples e rápida.
- Menor número de componentes e dependências externas para manter.
- Retorno imediato do caminho da imagem otimizada para o cliente.

### Negativas / Limitações
- Consumo de CPU e memória do servidor da API durante o processamento do Sharp.
- Em ambientes de produção com múltiplas instâncias (load balancing), o armazenamento local precisará de ser migrado para um armazenamento de objetos distribuído (ex.: AWS S3).
