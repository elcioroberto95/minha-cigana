# Identidade visual do Cigana do Destino

Proposta inicial, baseada nas seções 3 a 5 da [especificação](SPEC.md). A [prancha de conceito](design/conceito-visual-v1.png) reúne início, consulta e tiragem para mostrar como a mesma identidade funciona nos três momentos.

Veja a [continuação das telas e interações](FLUXOS-E-INTERACOES.md) para seleção de cartas, resultado, histórico e perfil.

## Direção de arte

A sensação é de uma consulta reservada e acolhedora. O retrato da personagem conduz a entrada. A mesma face aparece em um recorte pequeno no chat. A personagem tem expressão madura e serena, cabelos escuros com fios grisalhos, roupa ameixa bordada e joias douradas discretas.

A marca proposta é uma estrela de oito pontas numa moldura arqueada que lembra uma carta de tarô. O símbolo reaparece no verso das cartas. Usar os ornamentos principalmente na ilustração e nas cartas, com fundos mais lisos onde houver texto.

## Paleta e tipografia

| Cor | Função |
| --- | --- |
| `#160D25` | Fundo principal |
| `#29163D` | Superfícies, categorias e áreas de leitura |
| `#4B345E` | Seleção e destaque de superfície |
| `#D8B66A` | Ação principal, com texto escuro |
| `#A47B42` | Detalhes ornamentais |
| `#F5D99B` | Títulos e texto principal |
| `#BDAFC9` | Texto secundário |

Usar DM Serif Text nos títulos e DM Sans no corpo, nos botões e nos controles. Validar contraste, tamanho do texto e áreas de toque na implementação.

## Como a identidade aparece no app

- **Início.** Nome, retrato e pergunta de abertura. “Conversar” é o botão principal e “Tirar cartas” é a segunda entrada. As seis categorias ficam abaixo.
- **Consulta.** Avatar pequeno, mensagens em superfícies roxas e campo fixo no rodapé. O controle “Ouvir” aparece junto da resposta.
- **Tiragem.** As três posições da leitura ficam visíveis enquanto o usuário escolhe cartas do baralho. Na prancha, as duas cartas fechadas representam as posições ainda vazias. A implementação terá um controle separado para escolher as cartas do baralho.

## Refinamento a partir das dez referências

A [prancha v2](design/conceito-visual-v2.png) aprofunda a hierarquia do início, a escolha de tiragem, a consulta guiada e o resultado de dez cartas. A personagem, o símbolo em arco e a paleta vêm da primeira proposta do Cigana do Destino. Veja também a [análise individual das dez capturas](PESQUISA-DE-MERCADO.md#insights-das-dez-capturas).

| Capturas | O que indicam para o projeto |
| --- | --- |
| `7.jpeg` e `1.jpeg` | Acesso rápido às ações principais e formas de descobrir conteúdo. Priorizar Conversar, Tirar cartas e Carta do dia. Deixar biblioteca de cartas como possibilidade futura na área Tarô. |
| `5.jpeg` e `4.jpeg` | Retrato e tema ajudam a orientar a escolha. Uma única anfitriã mantém a experiência coesa. Os temas mudam conforme a consulta. |
| `8.jpeg`, `9.jpeg` e `10.jpeg` | A conversa pode guiar com perguntas e respostas rápidas. Fazer uma pergunta por vez, manter o texto livre e oferecer a opção de seguir sem contar a ocupação. |
| `3.jpeg` e `2.jpeg` | Módulos adicionais podem ganhar entrada própria quando existirem. Horóscopo e mapa astral ficam como referências futuras. A consulta de tarô usa os dados necessários para a sessão, com pergunta e nome opcionais. |
| `6.jpeg` | Uma oferta futura pode explicar benefícios e condições em linguagem direta. A primeira leitura acontece antes de qualquer oferta comercial, conforme a proposta do beta. |

### Aplicação nas telas

- **Início.** O retrato recebe a pessoa. Conversar ganha a única ação dourada. Tirar cartas e Carta do dia aparecem em botões secundários. A navegação proposta reúne Início, Tarô, Histórico e Perfil.
- **Escolha de tiragem.** Diferenciar os três formatos pelo número de cartas, pela ilustração e pelo tipo de resposta. Identificar a seleção com contorno e indicação textual. A prancha antecipa Carta do dia e Dez cartas como opções de evolução.
- **Consulta.** Mostrar “Assistente virtual” junto ao avatar. Os três atalhos da prancha são exemplos. O seletor de temas pode expor as seis categorias da especificação, e o campo livre fica disponível. Reservar espaço para indicar preparação, gravação e fala sem cobrir as mensagens.
- **Leitura aprofundada.** Começar pela síntese. Os blocos de pontos fortes e pontos de atenção revelam três itens cada. O bloco Futuro simbólico pode usar uma animação curta da carta, com revelação imediata quando a redução de movimento estiver ativa. Mostrar a carta e a interpretação de cada uma das dez posições no detalhe, conforme o [guia de interações](FLUXOS-E-INTERACOES.md#tiragem-aprofundada-de-dez-cartas).

### Uso de cor e componentes

Usar superfícies de ameixa para agrupar conteúdo, tipografia clara para a leitura e dourado para foco e ação principal. Conservar ícones lineares com rótulos nas ações importantes. No atalho Carta do dia, usar uma carta única ou um sol em arco. A maleta da prancha pertence ao tema Trabalho.

Contrastes calculados para as cores sólidas da paleta:

- `#F5D99B` sobre `#160D25` tem contraste de 13,7:1.
- `#BDAFC9` sobre `#29163D` tem contraste de 7,9:1.
- `#BDAFC9` sobre `#4B345E` tem contraste de 5,2:1.
- `#D8B66A` sobre `#160D25` tem contraste de 9,7:1.

Validar novamente sobre as superfícies e gradientes da interface implementada. Para os estados, combinar cor com rótulo ou ícone.

### Geração da prancha v2

Gerada com ImageGen integrado. A primeira prancha foi a referência visual direta da ferramenta. As dez capturas informaram a análise de interação acima. Prompt utilizado:

```text
Use case: ui-mockup. Extend the original Cigana do Destino app design from Image 1, the existing first concept board. Image 1 is the brand reference: retain exactly the same mature fictional woman's face, dark wavy hair streaked with gray, violet tailored clothes, understated gold jewelry, and small arch-and-eight-point-star visual signature. Generate an all-new four-screen high-fidelity mobile concept board in landscape (four equal portrait viewports across) showing a more refined editorial design system. Calm, grown-up, intimate, no physical device frames, no external headings. Flat screens on nearly black plum canvas. Use #160D25 aubergine background, #29163D modular surfaces, #4B345E selected surfaces, #D8B66A matte gold primary buttons, #F5D99B cream headings and #BDAFC9 secondary. DM Serif Text-style titles, DM Sans-style body, clearly readable text, large touch targets, restrained line icons, clean typographic hierarchy. Ornament belongs mainly to the portrait and tarot card art. Render exact Brazilian Portuguese and avoid filler. Screen one "Cigana do Destino": wide editorial portrait banner with a close portrait on one side and subtle golden arch on plum. Under the portrait a clear heading "O que te trouxe aqui hoje?" and gold "Conversar" button. Two separate secondary entries "Tirar cartas" and "Carta do dia", small icon plus label. Bottom navigation "Início", "Tarô", "Histórico", "Perfil". Screen two "Escolha sua tiragem": three large stacked editorial rows, each with an original small miniature grouping of one, three, or ten elegant arched cards, titles "Carta do dia", "Três cartas", "Dez cartas", short descriptors "Um conselho para hoje", "Uma pergunta, três perspectivas", "Forças, desafios e próximos passos". Distinct thin gold selected border on “Três cartas” and a gold "Continuar" action. Screen three "Consulta": compact header with the same woman avatar and a crisp label "Assistente virtual"; welcoming message "O que você quer explorar hoje?"; three tappable text chips "Amor", "Trabalho", "Pergunta livre"; second prompt "Quer fazer uma pergunta ou só tirar as cartas?"; outline action "Tirar cartas" and a bottom composer "Escreva sua pergunta" with mic and send controls. Screen four "Sua leitura": subtle descriptor "Tiragem de dez cartas", small line drawing of a tarot card motif, then a compact editorial summary titled "Mensagem da tiragem" with one short sentence in Portuguese "Observe o que pede ação e o que pede tempo."; four spacious collapsible rows labeled "Pontos fortes", "Pontos de atenção", "Futuro simbólico" and "Próximo passo"; show three compact marks on each strengths and attention row and a small arched-star reveal motif just in future. Gold bottom action "Conversar sobre a leitura". Clear navigational arrows and consistent spacing. Deliver a coherent app design, original artwork and screen structure, no credits, paywall, ads, notifications, ornate textures behind text, or competing color backgrounds.
```

## Geração da prancha inicial

Gerada com a ferramenta integrada ImageGen. Prompt utilizado:

```text
Use case: ui-mockup. Generate one high-fidelity landscape design board for the original Brazilian Portuguese mobile app "Cigana do Destino". Three equally large front-facing portrait screens aligned horizontally, flat presentation on a dark plum board, screened content large and crisp, even gutters and padding, no device branding or physical mockup props. Show the first visual exploration of an intimate, sophisticated, welcoming tarot consultation app. Deep aubergine #160D25 background, #29163D surfaces, #4B345E selected surfaces, matte antique gold #D8B66A action, bronze #A47B42 fine details, warm cream #F5D99B headings and #BDAFC9 body. Use a sturdy elegant serif for titles like DM Serif Text and a clear sans like DM Sans for actions and body. Logo concept: a simple eight-point star centered in one thin arched tarot-card outline, no text inside the symbol. Visual language: contemporary editorial typography, generous whitespace, softly rounded corners, fine ornamental lines concentrated in the cards, sparse stars. Portrait: original semi-realistic editorial painting of a mature fictional woman, warm direct gaze, subtly smiling, dark long hair with natural texture and a hint of gray, tailored flowing plum clothing with small gold embroidery, simple gold earrings and single tasteful mystical pendant, softly lit, subtle star-and-arch framing, no ethnic costume caricature. Reuse the exact same face as a small crop on the chat screen. Left screen, home: brand wordmark "Cigana do Destino", prominent portrait, heading "O que te trouxe aqui hoje?", gold button "Conversar", secondary action "Tirar cartas", then a compact 2x3 grid labeled "Amor", "Dinheiro", "Trabalho", "Futuro", "Espiritualidade", "Perguntas gerais". Center screen, chat: header "Consulta", small avatar beside "Cigana do Destino", accessible chat bubbles with the short example lines "Quero entender meu momento no trabalho." and "Vamos olhar com calma para o que está mudando.", a small play control "Ouvir" and a fixed composer "Escreva sua pergunta" with microphone and send icons. Right screen, tarot: heading "Tiragem de três cartas", category "Trabalho", three ornate cards side by side, first face-up with an engraved moon, next two face-down with the same arch-and-star brand icon, understated captions "Passado", "Presente", "Futuro simbólico", short instruction "Escolha mais duas cartas". Layout should look implementable on actual handheld screens with legible touch targets and plain background behind body text. Render all quoted Portuguese text verbatim, keep typography sharp, no filler text, watermarks, fake charts or decorative outer labels.
```
