# Plano do beta fechado do Cigana do Destino

## Hipótese de produto

Pessoas no Brasil que gostam de tarô ou têm curiosidade conseguem tirar três cartas sobre uma situação específica e recebem uma leitura simbólica em português que dá vontade de ouvir, comentar ou revisitar.

## O que entra no beta

- **Primeira leitura como visitante.** Início → tema e pergunta opcional → escolha e revelação de três cartas → resultado em texto → áudio opcional → conversa sobre a leitura.
- **Chat livre por texto.** Dá para abrir pelo início ou continuar a partir do resultado com a pergunta e as cartas da sessão. Avisos de cota podem ser avaliados sem cobrança.
- **Recuperação da leitura.** Se a interpretação falhar, a pessoa consegue tentar novamente e recebe uma interpretação das mesmas cartas.

Carta do Dia, Leitura de Personalidade e tiragem de dez cartas entram em rodadas seguintes. Gravação de voz, conta, sincronização do histórico e compras seguem seus próprios marcos. O beta é um recorte de validação da [especificação](SPEC.md), com os percursos descritos no [mapa de rotas](MAPA-DE-ROTAS.md).

## Ordem de entrega

1. **Base Expo.** Conferir a base parcial local, completar a configuração e validar o app no ambiente disponível. Começa na tarefa [M1-01](BACKLOG.md#m1-01--criar-a-base-expo).
2. **Fluxo navegável.** Implementar Início, tema, seleção e resultado, com uma demonstração editorial identificada. Verificar a navegação de ida e volta e a continuidade da seleção.
3. **Consulta real.** Conectar o sorteio e a interpretação pelo backend, integrar o áudio e abrir o chat com o contexto da tiragem. Verificar a retomada após falha e o custo por consulta.
4. **Beta fechado.** Distribuir uma versão interna para convidados quando o roteiro de aceite passar. Registrar as plataformas testadas e qualquer pendência específica.

## Definição de pronto para convidar

O [roteiro de critérios de aceite](CRITERIOS-DE-ACEITE.md#beta-fechado) define os cenários obrigatórios e como registrar a evidência para cada plataforma distribuída.

## Como avaliar o piloto

Convidar **15 pessoas**. Como metas iniciais, acompanhar quantas concluem a primeira leitura, com referência de **10 de 15**, e quantas voltam espontaneamente em até sete dias depois da primeira sessão, com referência de **5 de 15**. Conversar com participantes sobre quais trechos da resposta se conectaram à pergunta e às cartas. Observar também em qual etapa as pessoas abandonam o fluxo.

Registrar início, conclusão, reprodução de áudio, continuidade no chat, retorno e custo por leitura. Os eventos de medição ficam sem o texto das perguntas, das respostas e das transcrições. Ao fim, decidir qual ponto do fluxo precisa de ajuste e qual recurso merece entrar na rodada seguinte. Preços e cotas ficam descritos como hipóteses na [proposta comercial](PESQUISA-DE-MERCADO.md#proposta-comercial-para-teste).
