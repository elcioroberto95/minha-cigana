# Arquitetura mobile

O Expo Router define a navegação. Os arquivos de `apps/mobile/app` declaram as rotas e montam as telas implementadas em `features`. O grupo `(tabs)` mantém Início, Tarô, Histórico e Perfil como pontos de entrada. Consulta e etapas de leitura, conta e privacidade abrem na pilha sobre as abas. Os caminhos em [MAPA-DE-ROTAS.md](MAPA-DE-ROTAS.md) valem também para links diretos. As rotas têm nomes estáveis e a interface usa catálogos em português e inglês.

| Pasta | Responsabilidade |
| --- | --- |
| `app/` | Rotas, abas, pilha e inicialização do app |
| `features/home/` | Apresentação da personagem e atalhos |
| `features/chat/` | Consulta, seleção de tema e rascunho |
| `features/tarot/` | Temas, formatos, preparação e escolha de cartas |
| `features/reading/` | Carta do Dia, ofertas, questionário e resultados |
| `features/history/` | Histórico, filtros e detalhe do registro |
| `features/account/` | Conta, perfil, voz, privacidade e dados |
| `components/` e `localization/` | Componentes, paleta, tipografia e catálogos compartilhados |

## Entidades de produto e seus responsáveis

| Entidade | Identidade e ciclo de vida |
| --- | --- |
| Visitante ou conta | O app começa como visitante. Quando integrada, a autenticação identifica a conta e o backend determina o acesso aos recursos de cada pessoa. |
| Perfil e preferências | Pertencem à conta ou ao aparelho, conforme a preferência. Idioma já vive no aparelho. Voz, histórico e memória têm controles próprios. |
| Sessão de consulta e mensagem | A sessão reúne as mensagens. O tema é um identificador estável. O rascunho fica na memória do app e pode preencher a preparação da tiragem. |
| Carta e baralho | A carta tem identidade estável no catálogo. As escolhas temporárias são posições de uma tiragem. O backend vai controlar o embaralhamento e resolver as posições. |
| Tiragem e resultado | Uma tiragem tem formato, tema, pergunta opcional e posições. O resultado entregue recebe um identificador da API e alimenta o detalhe da leitura. |
| Carta do Dia | A identidade combina pessoa e data de referência. Na mesma data, a pessoa recebe novamente a leitura já entregue. |
| Questionário de personalidade | Reúne as respostas opcionais da sessão. O resultado é uma leitura com pontos fortes, padrões e próximo passo. |
| Registro de histórico | Referencia uma consulta ou uma leitura já salva. A seleção de filtros é local. |
| Cota, oferta e compra | Cotas do chat, da Carta do Dia e da tiragem de três cartas são independentes. O backend será responsável por disponibilidade, consumo e retorno da loja. |

Os IDs de tema e formato já estão em `features/tarot/domain.ts`. Entidades com persistência terão contratos quando seus endpoints forem implementados. Perguntas e respostas ficam fora dos parâmetros de navegação. A prévia de resultado usa o ID reservado `preview` para demonstrar o layout antes da integração.

## Identidade visual

Usamos a paleta roxa e dourada, títulos DM Serif Text, texto DM Sans, painéis de cantos arredondados e a ilustração da personagem já aprovada como referência de desenvolvimento. As telas de leitura dão destaque ao tema, à seleção e às posições. Conta e histórico usam a mesma linguagem visual com componentes mais discretos. A referência de composição e as pranchas ficam na [identidade visual](IDENTIDADE-VISUAL.md).
