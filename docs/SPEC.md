SPEC — CIGANA DO DESTINO
Aplicativo mobile com inteligência artificial, personagem animada e consultas místicas

Nome do projeto: Cigana do Destino
Plataformas: Android e iOS
Idioma: Português brasileiro (pt-BR)
Tipo: Aplicativo mobile com IA conversacional
Objetivo: Criar uma cigana virtual que conversa com usuários, realiza leituras simbólicas, interpreta cartas de tarô e oferece experiências místicas personalizadas.

1. VISÃO GERAL DO PRODUTO

Desenvolver um aplicativo mobile chamado Cigana do Destino, com uma personagem virtual feminina, madura, misteriosa e acolhedora.

A personagem deve possuir:

Cabelos longos e escuros.
Aparência feminina madura.
Roupas roxas e douradas.
Joias e acessórios místicos.
Expressão acolhedora e misteriosa.
Voz feminina madura, suave e natural.

A experiência deve simular uma consulta com uma personagem mística virtual.

O aplicativo deve combinar inteligência artificial generativa, interface conversacional, sistema de cartas e síntese de voz.

As previsões devem ser apresentadas como interpretações simbólicas para entretenimento e reflexão, sem afirmar capacidade sobrenatural ou garantir acontecimentos futuros.

2. STACK TECNOLÓGICA

Utilizar tecnologias modernas, priorizando estabilidade, escalabilidade e facilidade de manutenção.

Frontend mobile
React Native.
Expo.
TypeScript.
Expo Router.
React Native Reanimated.
Expo Speech.
Expo Audio.
Backend
Node.js.
TypeScript.
API REST.
Integração com API de IA generativa.
Validação de dados.
Controle de autenticação.
Proteção das chaves de API.
Banco de dados e serviços
Firebase Authentication.
Cloud Firestore.
Firebase Storage.
Firebase Cloud Functions ou backend independente.
Inteligência artificial
Utilizar uma API de modelo de linguagem para conversação.
Criar uma personalidade fixa para a Cigana do Destino.
Implementar gerenciamento de contexto das conversas.
Permitir histórico de consultas.
Implementar respostas estruturadas para as leituras de cartas.
TensorFlow.js

Não utilizar TensorFlow.js como mecanismo principal de conversação.

Deixar a arquitetura preparada para utilização futura em:

Classificação de perguntas.
Recomendação de conteúdos.
Personalização de experiências.
Modelos complementares de Machine Learning.
3. IDENTIDADE VISUAL

Criar uma interface sofisticada, elegante e mística.

Paleta de cores
Fundo principal: #160D25.
Fundo secundário: #29163D.
Roxo complementar: #4B345E.
Dourado principal: #D8B66A.
Dourado escuro: #A47B42.
Texto principal: #F5D99B.
Texto secundário: #BDAFC9.
Diretrizes de design
Interface dark mode.
Elementos dourados com acabamento elegante.
Gradientes roxos discretos.
Partículas e estrelas animadas.
Cartas de tarô com detalhes ornamentais.
Bordas arredondadas.
Transições suaves.
Tipografia elegante e legível.
Layout responsivo para diferentes tamanhos de tela.

Evitar aparência infantil, excesso de elementos ou estética genérica de chatbot.

O aplicativo deve transmitir sofisticação, mistério e acolhimento.

4. PERSONAGEM VIRTUAL

Criar um componente reutilizável chamado CiganaAvatar.

A personagem deve aparecer na tela inicial e na tela de consultas.

Animações desejadas
Respiração natural.
Movimento suave de cabeça.
Piscar dos olhos.
Expressões faciais.
Movimento dos lábios sincronizado com a voz.
Estado visual de escuta.
Estado visual de processamento.
Estado visual de fala.
Estratégia de implementação

Começar com uma imagem original da personagem e animações leves.

Preparar a arquitetura para evolução futura com:

Lottie.
Rive.
Live2D ou tecnologia equivalente.
Sincronização labial com áudio.

Não simular sincronização labial real apenas com animações aleatórias.

5. TELAS DO APLICATIVO
5.1 Tela inicial

Elementos:

Logo Cigana do Destino.
Personagem centralizada.
Saudação personalizada.
Mensagem mística de boas-vindas.
Botão para conversar com a cigana.
Acesso às categorias de consultas.

Categorias:

Amor.
Dinheiro.
Trabalho.
Futuro.
Espiritualidade.
Perguntas gerais.
5.2 Tela de conversa

Criar uma experiência de chat moderna.

Elementos:

Personagem no topo.
Nome Cigana do Destino.
Indicador de disponibilidade.
Histórico de mensagens.
Balões diferenciados para usuário e personagem.
Campo de texto.
Botão enviar.
Botão para ouvir respostas.
Botão para iniciar gravação de áudio.

A IA deve responder em português brasileiro, com linguagem natural.

Não utilizar respostas genéricas repetitivas.

5.3 Tela de tiragem de cartas

Implementar tiragem de três cartas.

As cartas representam:

Passado.
Presente.
Futuro simbólico.

Fluxo:

Usuário escolhe uma categoria.
Sistema embaralha as cartas.
Usuário seleciona três cartas.
Cartas são reveladas com animações.
IA interpreta cada carta.
Sistema apresenta uma interpretação integrada.

Criar um baralho estruturado com significados das cartas.

Cada carta deve possuir:

Identificador.
Nome.
Imagem.
Significado geral.
Interpretação amorosa.
Interpretação profissional.
Interpretação financeira.
Interpretação espiritual.

O sorteio deve ser aleatório e verificável no backend.

5.4 Tela de histórico

Permitir visualizar:

Consultas anteriores.
Perguntas realizadas.
Respostas recebidas.
Cartas selecionadas.
Data das consultas.

Permitir excluir consultas e apagar o histórico.

5.5 Tela de perfil

Implementar:

Nome do usuário.
E-mail.
Preferências.
Configurações de voz.
Histórico.
Privacidade.
Exclusão de conta.
6. PERSONALIDADE DA INTELIGÊNCIA ARTIFICIAL

Criar um prompt de sistema exclusivo para a personagem.

Personalidade

A Cigana do Destino é uma personagem feminina, madura, mística, misteriosa e acolhedora.

Sua comunicação deve ser:

Carinhosa.
Intuitiva.
Elegante.
Misteriosa.
Respeitosa.
Natural.
Emocionalmente acolhedora.
Estilo de comunicação

Utilizar expressões como:

"Minha alma..."
"Vamos consultar as cartas?"
"As cartas trazem uma mensagem para sua reflexão."
"Existe um caminho que merece sua atenção."
"Vamos olhar isso com carinho?"

Não repetir constantemente as mesmas expressões.

Regras da IA
Responder sempre em português brasileiro.
Manter a personalidade da personagem.
Entender o contexto da conversa.
Não inventar que possui poderes sobrenaturais.
Não apresentar previsões como certezas.
Não induzir medo ou dependência emocional.
Não afirmar que alguém está traindo, mentindo ou fazendo trabalhos espirituais sem evidências.
Não orientar decisões médicas, jurídicas ou financeiras como se fossem previsões confiáveis.
Em situações delicadas, incentivar reflexão e busca de orientação adequada.
Evitar respostas excessivamente longas quando o usuário fizer perguntas simples.
7. SISTEMA DE VOZ

Implementar voz feminina madura e acolhedora.

Requisitos:

Português brasileiro.
Pronúncia natural.
Ritmo moderado.
Entonação suave.
Pausas naturais.
Reprodução de respostas da IA.
Controle de volume.
Botão para ativar e desativar voz.

Começar com integração de Text-to-Speech.

Deixar preparada uma futura integração com serviço de voz neural de maior qualidade.

8. MEMÓRIA E PERSONALIZAÇÃO

Implementar memória contextual.

A personagem poderá lembrar:

Nome informado pelo usuário.
Preferências de consulta.
Contexto de conversas anteriores, quando autorizado.
Consultas anteriores.
Cartas anteriormente selecionadas.

A memória deve ser controlada pelo usuário.

Permitir:

Desativar memória.
Excluir informações.
Excluir histórico.
Solicitar exclusão da conta.

Não armazenar informações sensíveis desnecessárias.

9. BACKEND E API

Criar endpoints organizados.

Exemplos:

POST /api/chat

Recebe uma mensagem e retorna uma resposta da cigana.

POST /api/tarot/draw

Realiza o sorteio das cartas.

POST /api/tarot/interpret

Interpreta as cartas selecionadas.

GET /api/history

Consulta o histórico.

DELETE /api/history/:id

Exclui uma consulta.

GET /api/profile

Obtém informações do perfil.

PUT /api/profile

Atualiza preferências.

Criar validação de entradas, tratamento de erros e limites de utilização.

As chaves de API devem permanecer exclusivamente no backend.

10. SEGURANÇA E PRIVACIDADE

Implementar:

Autenticação segura.
HTTPS.
Proteção das credenciais.
Regras de acesso ao Firestore.
Validação das entradas.
Rate limiting.
Proteção contra abuso da API.
Consentimento para armazenamento de histórico.
Política de privacidade.
Adequação à LGPD.
Exclusão de dados pessoais.

Nunca disponibilizar chaves privadas no código mobile.

11. MONETIZAÇÃO FUTURA

Preparar a arquitetura para planos gratuitos e premium.

Plano gratuito
Quantidade limitada de consultas.
Tiragens básicas.
Chat com IA.
Voz com funcionalidades limitadas.
Plano premium
Mais consultas.
Leituras detalhadas.
Histórico ampliado.
Voz aprimorada.
Experiências exclusivas.
Consultas personalizadas.

Não implementar cobrança real nesta primeira versão.

Preparar somente a estrutura para futura integração com compras dentro do aplicativo.

12. ESTRUTURA DE PASTAS

Organizar o projeto de maneira modular.

text
cigana-do-destino/
│
├── app/
│   ├── index.tsx
│   ├── consulta.tsx
│   ├── cartas.tsx
│   ├── historico.tsx
│   ├── perfil.tsx
│   └── _layout.tsx
│
├── components/
│   ├── CiganaAvatar.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── TarotCard.tsx
│   ├── VoiceButton.tsx
│   └── LoadingMystic.tsx
│
├── services/
│   ├── api.ts
│   ├── chat.ts
│   ├── tarot.ts
│   ├── audio.ts
│   └── firebase.ts
│
├── hooks/
│   ├── useChat.ts
│   ├── useVoice.ts
│   └── useHistory.ts
│
├── constants/
│   ├── colors.ts
│   └── theme.ts
│
├── assets/
│   ├── images/
│   ├── animations/
│   ├── cards/
│   └── sounds/
│
├── types/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── prompts/
│   └── package.json
│
└── package.json


Adaptar a estrutura caso a versão do Expo Router ou a arquitetura do backend recomende outra organização.

13. ETAPAS DE DESENVOLVIMENTO

Desenvolver incrementalmente.

FASE 1 — Fundação
Criar projeto Expo.
Configurar TypeScript.
Configurar navegação.
Criar tema visual.
Criar tela inicial.
Criar componentes reutilizáveis.
FASE 2 — Personagem
Criar ou integrar imagem original da cigana.
Implementar CiganaAvatar.
Adicionar animações.
Criar estados de interação.
FASE 3 — Inteligência artificial
Configurar backend.
Integrar API de IA.
Criar personalidade da personagem.
Implementar chat.
Implementar contexto de conversa.
FASE 4 — Tarô
Criar baralho.
Implementar sorteio.
Criar animações de cartas.
Implementar interpretações.
FASE 5 — Voz
Implementar síntese de voz.
Implementar reprodução.
Implementar gravação de áudio.
Preparar sincronização labial.
FASE 6 — Persistência
Configurar Firebase.
Implementar autenticação.
Salvar consultas.
Implementar histórico.
Implementar preferências.
FASE 7 — Finalização
Testes.
Correção de erros.
Otimização.
Testes Android.
Testes iOS.
Preparação para publicação.
14. CRITÉRIOS DE ACEITAÇÃO DO MVP

A primeira versão será considerada funcional quando:

O aplicativo iniciar corretamente em Android e iOS.
A tela inicial estiver implementada.
A identidade visual estiver consistente.
A personagem aparecer corretamente.
O usuário conseguir conversar com a IA.
A IA responder em português brasileiro.
A personalidade da cigana for consistente.
O usuário conseguir realizar uma tiragem de três cartas.
As cartas forem sorteadas e interpretadas corretamente.
O usuário conseguir ouvir as respostas.
O histórico funcionar.
As credenciais estiverem protegidas.
O aplicativo apresentar tratamento adequado de erros.
O usuário conseguir excluir seus dados.
15. INSTRUÇÕES IMPORTANTES PARA O CODEX

Antes de começar:

Analise o ambiente de desenvolvimento.
Verifique se já existe algum projeto.
Não sobrescreva arquivos existentes sem necessidade.
Crie um plano de implementação.
Identifique dependências necessárias.
Implemente a aplicação em etapas pequenas e testáveis.

Durante o desenvolvimento:

Escreva código funcional, não apenas exemplos.
Evite componentes gigantes.
Utilize TypeScript corretamente.
Mantenha a arquitetura modular.
Não deixe botões sem funcionalidade.
Não utilize dados fictícios como se fossem respostas reais da IA.
Não exponha chaves privadas.
Crie arquivos .env.example.
Documente como executar frontend e backend.
Execute testes e verifique os erros de compilação.
Atualize o README.

Se algum serviço externo exigir credenciais, implemente a integração e documente as variáveis necessárias, sem inventar credenciais.

IMPORTANTE:

Não tente implementar todas as funcionalidades de uma só vez.

Comece pela FASE 1 e construa uma aplicação mobile funcional, visualmente refinada e com navegação real.

Depois avance progressivamente pelas demais fases.

Ao finalizar cada fase, informe:

Arquivos criados.
Funcionalidades implementadas.
Dependências instaladas.
Testes realizados.
Pendências.
Como executar e testar.

O objetivo final é entregar um aplicativo mobile de qualidade comercial chamado Cigana do Destino, com uma personagem virtual convincente, inteligência artificial conversacional, consultas de tarô e experiência de voz.