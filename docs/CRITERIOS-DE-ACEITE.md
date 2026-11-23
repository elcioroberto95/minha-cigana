# Critérios de aceite do beta fechado

Use os IDs abaixo nas tarefas, nos PRs e nas evidências de teste. A base Expo, a demonstração navegável e o beta fechado têm aceites próprios. Para convidar participantes, os critérios obrigatórios do beta precisam passar em cada plataforma que receber a versão. As metas de retorno e conclusão são avaliadas depois com o [plano do piloto](PLANO-DO-BETA.md#como-avaliar-o-piloto).

## Fundação Expo

| ID | Como testar | Resultado esperado |
| --- | --- | --- |
| `BASE-01` | Instalar o app a partir de um checkout limpo usando o lockfile e a versão de Node documentada. | A instalação termina com sucesso. Os comandos de execução e verificação estão no README. |
| `BASE-02` | Rodar lint e TypeScript e iniciar o app no ambiente de teste. | As duas checagens passam. A rota inicial abre sem erro que impeça o uso. A evidência indica ambiente, plataforma e comando. |

## Fluxo navegável

| ID | Como testar | Resultado esperado |
| --- | --- | --- |
| `UX-01` | No [Início](MAPA-DE-ROTAS.md#01-início), tocar em Conversar e em Tirar 3 cartas grátis em visitas separadas. Usar Voltar em cada caminho. | Os destinos correspondem às ações. Voltar retorna à tela de origem e permite continuar a navegação. Os rótulos permanecem legíveis em telas pequenas. |
| `UX-02` | Em [Tema e pergunta](MAPA-DE-ROTAS.md#05-tema-e-pergunta), escolher Trabalho, escrever uma pergunta e avançar. Repetir com Seguir sem pergunta. | O tema chega à tiragem nos dois casos. A pergunta só é encaminhada quando a pessoa escolhe avançar com ela. |
| `UX-03` | Na [seleção](MAPA-DE-ROTAS.md#06-escolha-de-cartas), tocar duas vezes na mesma carta, completar três escolhas e desfazer a última. | A mesma carta conta uma vez. A confirmação só está disponível com três cartas distintas. Desfazer libera uma posição e atualiza a contagem. |
| `UX-04` | Confirmar três cartas na demonstração e abrir o [resultado](MAPA-DE-ROTAS.md#07-resultado-de-três-cartas). | O resultado mostra as três cartas escolhidas nas posições de passado, presente e futuro simbólico. O conteúdo editorial de demonstração é identificado para a pessoa. |
| `UX-05` | Trocar o idioma entre português e inglês, abrir a tela inicial e reiniciar o app. Repetir a primeira abertura com um idioma indisponível. | Os textos da tela inicial correspondem ao idioma escolhido e a preferência persiste. Na primeira abertura com idioma indisponível, os textos aparecem em português brasileiro. |

## Beta fechado

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| `BETA-01` | Em uma instalação limpa, uma pessoa convidada abre a primeira tiragem e chega ao resultado como visitante, sem orientação do avaliador. | A leitura fica disponível em texto após selecionar três cartas, em português brasileiro e sem solicitar pagamento. |
| `BETA-02` | Fazer uma tiragem com pergunta sobre trabalho e outra com uma pergunta que pede uma previsão categórica. Conferir o resultado contra as cartas e posições registradas. | Cada interpretação corresponde à sua carta e posição. A síntese conecta as três ao tema e à pergunta informada. O futuro aparece como possibilidade e a resposta preserva a proposta de reflexão simbólica. |
| `BETA-03` | Provocar falha de rede ou indisponibilidade depois de confirmar as cartas. Restaurar o serviço e tocar em Tentar de novo. | O erro oferece nova tentativa. A seleção não muda, o pedido retoma a mesma tiragem e o resultado aparece uma vez. |
| `BETA-04` | No resultado, tocar em Ouvir e depois em Parar. Repetir com a reprodução indisponível. | Ouvir inicia a leitura, Parar encerra a reprodução e o texto continua disponível. A indisponibilidade do áudio aparece de forma compreensível. |
| `BETA-05` | Abrir [Consulta](MAPA-DE-ROTAS.md#02-consulta) pelo Início e enviar uma pergunta livre. Depois, abrir Conversar sobre a leitura a partir de um resultado e perguntar sobre uma carta dessa tiragem. | O chat funciona sem uma tiragem prévia. Quando aberto pelo resultado, usa as cartas e o tema da sessão correta. A interface indica espera e mantém a mensagem visível se o envio falhar. |
| `BETA-06` | Revisar a configuração da build. Fazer pedidos ao backend do beta com sessão de visitante autorizada, sem sessão válida e acima do limite configurado. | A sessão do visitante autorizado funciona. Pedidos sem sessão válida ou acima do limite são recusados. As chaves do provedor ficam no backend. |
| `BETA-07` | Fazer uma leitura completa e conferir os eventos e a medição de custo. | Início, conclusão, áudio e continuação no chat são verificáveis. O custo da IA e do áudio fica registrado com a origem da medida. Os eventos de produto não incluem o conteúdo de mensagens, leituras ou transcrições. |

## Se o piloto incluir teste de cota

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| `COTA-01` | No chat, conferir o saldo inicial no primeiro dia e no seguinte. Chegar a duas respostas, receber a última e tentar enviar outra mensagem. Repetir um envio que falhou. | O saldo inicial é 20 no primeiro dia e 7 no seguinte. O aviso aparece com duas restantes. A última resposta é entregue por inteiro. O limite abre somente ao tentar enviar outra mensagem, e a falha não reduz o saldo. Durante o beta, o painel é demonstrativo e preserva a conversa e o rascunho. |

## Marco posterior da Carta do Dia

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| `DIA-01` | Abrir a Carta do Dia, voltar à tela no mesmo dia e enviar dois pedidos simultâneos com saldo disponível. Repetir com saldo comprado. | A mesma pessoa recebe no máximo uma nova leitura do dia. Os pedidos concluídos retornam a mesma carta e a mesma interpretação, com um único débito de saldo. |
| `DIA-02` | Usar a última carta grátis, rever a leitura ainda no mesmo dia e só então repetir após a virada de data. | No mesmo dia, a leitura continua disponível. Após a virada pelo fuso configurado, um novo sorteio usa saldo disponível ou apresenta a oferta antes de gerar a carta. |
| `DIA-03` | Simular falha ao gerar a leitura e repetir o pedido no mesmo dia. | A falha preserva o saldo. Se a repetição concluir a leitura, débito e carta do dia são registrados uma única vez. |

## Como registrar evidência

Para cada critério entregue, registrar **ID, PR ou commit, build, plataforma, passos, resultado e evidência**. Use `Passou`, `Falhou`, `Pendente` ou `Não se aplica` com o motivo. Se um critério obrigatório falhar ou estiver pendente, o marco correspondente permanece aberto. O [workflow](../WORKFLOW.md#definição-de-pronto) descreve como registrar bloqueios e concluir a tarefa.
