# Mapa de telas e rotas do Cigana do Destino

Abra [Início](#01-início) para começar. Cada seção descreve a rota proposta, aponta para a tela na prancha e tem links para os destinos das ações. As rotas são nomes de referência para o layout. Estados como escolha de tema, áudio, amostra e confirmação podem ocupar a mesma tela.

**Pranchas** · [Conceito inicial](design/conceito-visual-v1.png) · [Conceito v2](design/conceito-visual-v2.png) · [Interações](design/fluxos-e-telas-v1.png) · [Beta e Personalidade](design/layouts-beta-personalidade-v1.png) · [Carta do Dia e Dez Cartas](design/layouts-carta-do-dia-e-dez-cartas-v1.png)

**Visão visual** · [Diagrama de navegação em PNG](design/diagrama-fluxo-v3.png) · [Versão vetorial](design/diagrama-fluxo-v3.svg)

## Percursos principais

- **Conversar** · [Início](#01-início) → [Consulta](#02-consulta) → [escolher tiragem](#03-formatos-de-tiragem), se a pessoa quiser tirar cartas durante o chat.
- **Primeira leitura de três cartas** · [Início](#01-início) → [Leitura Beta](#04-leitura-beta) → [Tema e pergunta](#05-tema-e-pergunta) → [Escolha de cartas](#06-escolha-de-cartas) → [Leitura de três cartas](#07-resultado-de-três-cartas). A partir do resultado, [continuar na Consulta](#02-consulta) é opcional.
- **Próxima tiragem de três cartas** · [Tarô](#03-formatos-de-tiragem) → [Próxima tiragem grátis](#24-próxima-tiragem-grátis) se ainda estiver no intervalo de sete dias. Ao terminar o intervalo, pode abrir [Tema e pergunta](#05-tema-e-pergunta).
- **Personalidade** · [Tarô](#03-formatos-de-tiragem) → [Apresentação](#11-oferta-de-personalidade) → [Perguntas](#12-perguntas-de-personalidade) → [Resultado](#13-resultado-de-personalidade).
- **Dez cartas** · [Tarô](#03-formatos-de-tiragem) → [Apresentação](#08-oferta-de-dez-cartas) → [Tema e pergunta](#05-tema-e-pergunta) → [Escolha de cartas](#06-escolha-de-cartas) → [Leitura de dez cartas](#09-resultado-de-dez-cartas).
- **Carta do Dia** · [Início](#01-início) → [Carta do Dia](#10-carta-do-dia). Com saldo grátis esgotado e sem saldo comprado, abre a [oferta de sete cartas](#14-oferta-da-carta-do-dia) antes de gerar uma nova carta.
- **Conta e dados** · [Histórico](#16-histórico) → [Detalhe](#17-detalhe-do-histórico). [Perfil](#18-perfil) → [Conta](#19-conta), [Voz](#20-voz) ou [Privacidade](#21-privacidade) → [Gerenciar dados](#22-gerenciar-dados).

## Layouts que faltam

- **Atalho inicial.** Desenhar a variação da chamada direta para a leitura grátis no [Início](#01-início).
- **Fluxos complementares.** Atalho de Personalidade em [Tarô](#03-formatos-de-tiragem). A confirmação de exclusão de um registro em [Detalhe do histórico](#17-detalhe-do-histórico) pode usar o painel da gestão de dados com texto próprio.
- **Depois do beta.** [Retorno da compra](#15-confirmação-de-compra) para sucesso, cancelamento ou erro.

## 01 Início

**Rota** `/` · **Layout** [Conceito v2, tela 1](design/conceito-visual-v2.png) e [conceito inicial, tela 1](design/conceito-visual-v1.png).

**Conversar** → [Consulta em branco](#02-consulta). Na primeira visita, o atalho **Tirar cartas** pode aparecer como **Tirar 3 cartas grátis** e abrir direto a [Leitura Beta](#04-leitura-beta). A aba **Tarô** leva sempre aos [Formatos de tiragem](#03-formatos-de-tiragem). **Carta do Dia** → [Carta do Dia](#10-carta-do-dia). Na variante com categorias no início, tocar numa categoria abre [Consulta com o tema](#02-consulta). **Histórico** → [Histórico](#16-histórico). **Perfil** → [Perfil](#18-perfil).

## 02 Consulta

**Rota** `/consulta` · **Layout** [Conceito v2, tela 3](design/conceito-visual-v2.png) e [conceito inicial, tela 2](design/conceito-visual-v1.png).

**Estados** [Tema e consulta, telas 2 a 4](design/layouts-tema-e-consulta-v1.png) para gravação, transcrição e espera. [Retomada e limites, telas 1 a 3](design/layouts-retomada-e-limites-v1.png) para erro, aviso e cota esgotada.

Entra por Conversar, por uma categoria ou por **Conversar sobre a leitura**. **Enviar**, escolher um tema, gravar, revisar a transcrição, ouvir e parar ficam aqui. **Tirar cartas** → [Formatos de tiragem](#03-formatos-de-tiragem). Se a conversa já oferecer o formato **Três cartas**, o atalho abre [Tema e pergunta](#05-tema-e-pergunta) com o rascunho quando houver cota. Durante o intervalo, abre [Próxima tiragem grátis](#24-próxima-tiragem-grátis). **Voltar** retorna à origem, inclusive ao resultado quando o chat foi aberto por uma leitura.

A cota proposta é própria do chat. Ao tentar enviar outra pergunta depois da última resposta grátis do dia, abrir o [limite do chat](#23-limite-do-chat) com o rascunho preservado.

## 03 Formatos de tiragem

**Rota** `/tarot` · **Layout** [Conceito v2, tela 2](design/conceito-visual-v2.png).

Selecionar um formato fica na tela. **Continuar** abre [Carta do Dia](#10-carta-do-dia), [Leitura Beta](#04-leitura-beta) ou [Oferta de dez cartas](#08-oferta-de-dez-cartas). Para três cartas, se já houver leitura e a cota voltou, abre [Tema e pergunta](#05-tema-e-pergunta). Durante o intervalo, abre [Próxima tiragem grátis](#24-próxima-tiragem-grátis). **Leitura de Personalidade** é um atalho adicional proposto na área Tarô → [Oferta de personalidade](#11-oferta-de-personalidade). O atalho ainda precisa ser desenhado.

## 04 Leitura Beta

**Rota** `/leituras/beta` · **Layout** [Beta e Personalidade, tela 1](design/layouts-beta-personalidade-v1.png).

**Começar leitura grátis** → [Tema e pergunta](#05-tema-e-pergunta) com três cartas. **Voltar** retorna à origem, [Início](#01-início) ou [Formatos de tiragem](#03-formatos-de-tiragem). A primeira leitura pode ser experimentada como visitante. Entregar a leitura inicia o intervalo de sete dias para a próxima tiragem grátis.

## 05 Tema e pergunta

**Rota** `/tarot/:formato/preparar` · **Layout** [Tema e consulta, tela 1](design/layouts-tema-e-consulta-v1.png).

Entra pela [Leitura Beta](#04-leitura-beta), pela [Consulta](#02-consulta) ou pela [oferta de dez cartas](#08-oferta-de-dez-cartas). Em uma única tela, a pessoa seleciona uma das seis categorias. **Escolher cartas** leva a [Escolha de cartas](#06-escolha-de-cartas) com a pergunta preenchida, se houver. **Seguir sem pergunta** chega ao mesmo destino só com o tema. Se veio da consulta, tema e pergunta aparecem preenchidos e editáveis.

## 06 Escolha de cartas

**Rota** `/tarot/:formato/escolher` · **Layout** [Interações, tela 1](design/fluxos-e-telas-v1.png) para três cartas e [prancha de apoio, tela 1](design/layouts-selecao-historico-voz-v1.png) para dez cartas.

Tocar numa carta preenche a próxima posição. **Desfazer última** volta uma escolha, na mesma tela. **Revelar cartas** fica disponível ao completar a quantidade. Após a revelação, abre o [resultado de três cartas](#07-resultado-de-três-cartas) ou o [resultado de dez cartas](#09-resultado-de-dez-cartas). Em caso de falha, **Tentar de novo** reaproveita a tiragem confirmada.

## 07 Resultado de três cartas

**Rota** `/leituras/:id/tres-cartas` · **Layout** [Interações, tela 2](design/fluxos-e-telas-v1.png).

**Ouvir** e **Parar** ficam aqui. **Conversar sobre a leitura** → [Consulta](#02-consulta) com pergunta, tema e cartas. **Voltar ao início** → [Início](#01-início). A leitura também pode ser reaberta pelo [Histórico](#16-histórico) se tiver sido salva.

## 08 Oferta de dez cartas

**Rota** `/leituras/dez-cartas` · **Layout** [Carta do Dia e Dez Cartas, tela 3](design/layouts-carta-do-dia-e-dez-cartas-v1.png).

No beta, **Experimentar leitura** → [Tema e pergunta](#05-tema-e-pergunta) quando o teste estiver habilitado. Na oferta paga proposta, **Comprar leitura** → [Confirmação de compra](#15-confirmação-de-compra) → [Tema e pergunta](#05-tema-e-pergunta). **Agora não** → [Formatos de tiragem](#03-formatos-de-tiragem).

## 09 Resultado de dez cartas

**Rota** `/leituras/:id/dez-cartas` · **Layout** [Conceito v2, tela 4](design/conceito-visual-v2.png).

Tocar nos blocos expande força, desafio, futuro simbólico ou próximo passo, na própria tela. **Ouvir** e **Parar** ficam aqui. **Conversar sobre a leitura** → [Consulta](#02-consulta) com as dez cartas. **Voltar ao início** → [Início](#01-início).

## 10 Carta do Dia

**Rota** `/carta-do-dia` · **Layout** [Carta do Dia e Dez Cartas, tela 1](design/layouts-carta-do-dia-e-dez-cartas-v1.png).

Pode sair no máximo uma carta nova por pessoa e por dia. Ao reabrir no mesmo dia, mostrar “Você já tirou sua carta de hoje” e exibir a mesma leitura, mesmo com saldo zerado. A próxima carta fica disponível na virada do dia, conforme o horário de Brasília proposto. Com saldo, uma nova leitura entregue consome uma unidade. A [oferta de sete cartas](#14-oferta-da-carta-do-dia) aparece ao pedir a primeira carta de um novo dia com ambos os saldos zerados. **Voltar ao início** → [Início](#01-início).

## 11 Oferta de personalidade

**Rota** `/leituras/personalidade` · **Layout** [Beta e Personalidade, tela 2](design/layouts-beta-personalidade-v1.png).

**Ver exemplo** expande a amostra na tela. No beta, **Experimentar leitura** → [Perguntas de personalidade](#12-perguntas-de-personalidade). Na oferta paga proposta, **Comprar leitura** → [Confirmação de compra](#15-confirmação-de-compra) → [Perguntas de personalidade](#12-perguntas-de-personalidade). **Voltar** → [Formatos de tiragem](#03-formatos-de-tiragem).

## 12 Perguntas de personalidade

**Rota** `/leituras/personalidade/perguntas` · **Layout** [Beta e Personalidade, tela 3](design/layouts-beta-personalidade-v1.png).

**Continuar** ou **Pular pergunta** passa para a próxima etapa na mesma tela. Ao final da terceira → [Resultado de personalidade](#13-resultado-de-personalidade). **Voltar** revisita a pergunta anterior ou, se estiver na primeira, abre a [apresentação](#11-oferta-de-personalidade).

## 13 Resultado de personalidade

**Rota** `/leituras/:id/personalidade` · **Layout** [Beta e Personalidade, tela 4](design/layouts-beta-personalidade-v1.png).

Mostra forças, padrões para observar e um passo prático. Se todas as perguntas foram puladas, mostra uma reflexão geral. **Voltar ao início** → [Início](#01-início). Se a pessoa tiver autorizado salvar, pode reabrir pelo [Histórico](#16-histórico).

## 14 Oferta da Carta do Dia

**Rota** `/carta-do-dia/oferta` · **Layout** [Carta do Dia e Dez Cartas, tela 2](design/layouts-carta-do-dia-e-dez-cartas-v1.png).

Na oferta paga proposta, **Comprar 7 cartas** → [Confirmação de compra](#15-confirmação-de-compra) → [Carta do Dia](#10-carta-do-dia) com o saldo atualizado. **Agora não** → [Início](#01-início). No beta, esse estado apresenta a hipótese de oferta para avaliação, sem transação.

## 15 Confirmação de compra

**Rota** estado externo chamado pela tela de origem · **Layout** da loja no fluxo futuro. A confirmação visual está fora das pranchas do beta.

Em sucesso, entrega o próximo passo associado à origem: [Perguntas de personalidade](#12-perguntas-de-personalidade), [Tema e pergunta](#05-tema-e-pergunta), [Carta do Dia](#10-carta-do-dia) ou [Consulta](#02-consulta) com saldo atualizado. Cancelamento ou falha retorna à oferta de origem. Se a compra for confirmada e a geração falhar, a pessoa pode retomar a mesma leitura.

## 16 Histórico

**Rota** `/historico` · **Layout** [Interações, tela 3](design/fluxos-e-telas-v1.png).

**Tudo**, **Consultas** e **Tiragens** filtram a lista no lugar. Tocar no registro → [Detalhe do histórico](#17-detalhe-do-histórico). Sem registros, **Começar leitura** → [Formatos de tiragem](#03-formatos-de-tiragem).

## 17 Detalhe do histórico

**Rota** `/historico/:id` · **Layout** [Prancha de apoio, tela 2](design/layouts-selecao-historico-voz-v1.png), com exemplo de registro de tiragem.

Tocar numa ação de leitura abre o [resultado de três cartas](#07-resultado-de-três-cartas), o [resultado de dez cartas](#09-resultado-de-dez-cartas) ou o [resultado de personalidade](#13-resultado-de-personalidade), conforme o registro. Para chat, reabre a [Consulta](#02-consulta). **Excluir este registro** abre confirmação local e, se confirmada, volta ao [Histórico](#16-histórico).

## 18 Perfil

**Rota** `/perfil` · **Layout** [Interações, tela 4](design/fluxos-e-telas-v1.png).

**Entrar**, **Criar conta** ou **Editar perfil** → [Conta](#19-conta), conforme o estado. **Voz** → [Voz](#20-voz). **Privacidade** → [Privacidade](#21-privacidade).

## 19 Conta

**Rotas** `/conta/entrar`, `/conta/criar`, `/conta/recuperar` e `/perfil/editar` · **Layouts** [Prancha de conta, telas 1 a 4 na ordem das rotas](design/layouts-conta-v1.png).

**Entrar** e **Criar conta** têm atalhos entre si. **Esqueci minha senha** abre recuperação e volta a Entrar após o envio. Sucesso volta à origem quando a ação já iniciada puder ser retomada, como salvar a leitura. Ao editar dados e salvar, volta ao [Perfil](#18-perfil).

## 20 Voz

**Rota** `/perfil/voz` · **Layout** [Prancha de apoio, tela 3](design/layouts-selecao-historico-voz-v1.png).

Ligar, desligar, ajustar volume e ouvir amostra são ações locais. **Voltar** → [Perfil](#18-perfil).

## 21 Privacidade

**Rota** `/perfil/privacidade` · **Layout** [Interações, painel da tela 4](design/fluxos-e-telas-v1.png).

**Salvar histórico** e **Memória entre consultas** são controles distintos. **Gerenciar meus dados** → [Gerenciar dados](#22-gerenciar-dados). **Voltar** → [Perfil](#18-perfil).

## 22 Gerenciar dados

**Rota** `/perfil/privacidade/dados` · **Layouts** [Prancha de gestão de dados, telas 1 a 3](design/layouts-gestao-de-dados-v1.png), incluindo os dois diálogos de confirmação.

**Limpar histórico** abre confirmação e retorna à gestão de dados depois da exclusão. **Excluir conta** abre outra confirmação e, após concluir, vai ao [Início](#01-início) como visitante. **Voltar** → [Privacidade](#21-privacidade).

## 23 Limite do chat

**Rota** estado da própria `/consulta` · **Layout** [Retomada e limites, tela 3](design/layouts-retomada-e-limites-v1.png).

Mostrar quando o saldo chegar a zero e a pessoa tentar enviar uma nova mensagem. **Voltar amanhã** fecha o painel e volta à [Consulta](#02-consulta), onde a pessoa ainda pode ler as mensagens da sessão. **Comprar 20 respostas**, na oferta futura, → [Confirmação de compra](#15-confirmação-de-compra) → [Consulta](#02-consulta), com saldo atualizado e rascunho pronto para revisão e envio. No beta, a tela apresenta a hipótese sem transação.

## 24 Próxima tiragem grátis

**Rota** estado de `/tarot` · **Layout** [Retomada e limites, tela 4](design/layouts-retomada-e-limites-v1.png).

Mostrar a próxima disponibilidade após a última tiragem de três cartas entregue. **Ver tiragem de 10 cartas** → [Oferta de dez cartas](#08-oferta-de-dez-cartas). **Voltar ao início** → [Início](#01-início). Quando a cota voltar, **Tirar 3 cartas grátis** → [Tema e pergunta](#05-tema-e-pergunta).
