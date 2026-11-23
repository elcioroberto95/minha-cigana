# Telas e interações do Cigana do Destino

Proposta de navegação e comportamento para acompanhar a [identidade visual](IDENTIDADE-VISUAL.md) e a [segunda prancha](design/fluxos-e-telas-v1.png). As telas mostram exemplos independentes. Em uma tiragem real, a seleção e o resultado compartilham as mesmas cartas.

O [mapa de rotas clicável](MAPA-DE-ROTAS.md) liga cada tela à sua prancha e aos destinos das ações.

## Início e categorias

- **Conversar** abre uma consulta em branco. Tocar numa categoria abre a conversa com o tema selecionado e três pontos de partida opcionais. O usuário ainda pode escrever a própria pergunta.
- Para a primeira visita, a proposta é oferecer **Tirar 3 cartas grátis** como atalho para a Leitura Beta. A aba **Tarô** reúne os formatos. Tema e pergunta opcional ficam na mesma tela antes do baralho. **Histórico** e **Perfil** ficam acessíveis pela navegação do início.

## Consulta e voz

- Ao enviar, a mensagem aparece na conversa e o avatar indica processamento. Se o envio falhar, a mensagem fica visível com **Tentar de novo**. A repetição reaproveita a mensagem pendente.
- **Ouvir** inicia a leitura da resposta e vira **Parar** durante a reprodução. Ao trocar de resposta ou sair da consulta, o áudio atual para.
- O microfone abre o estado de gravação. O usuário pode cancelar ou concluir, revisar a transcrição no campo de texto e enviar. Se a permissão for recusada, o campo de texto continua disponível.
- Na proposta comercial, o saldo de chat aparece junto do campo de mensagem. Com duas respostas restantes, mostrar um aviso discreto. Depois da última resposta, manter o texto visível e preservar o rascunho. O [mapa de rotas](MAPA-DE-ROTAS.md#23-limite-do-chat) mostra como a pessoa volta no dia seguinte ou escolhe continuar com um pacote.

## Tiragem e resultado

1. Tocar numa carta do baralho preenche a próxima posição e atualiza a contagem. O usuário pode desfazer a última escolha e confirmar depois de selecionar três.
2. Na implementação proposta, os versos permanecem visíveis até **Revelar cartas**. A prancha antecipa duas ilustrações para mostrar a direção de arte. Depois da confirmação, a revelação respeita a ordem escolhida e pode ser imediata com redução de movimento.
3. **Sua leitura** mostra passado, presente e futuro simbólico, com interpretação de cada carta e uma mensagem integrada. Se a interpretação falhar, **Tentar de novo** mantém as mesmas cartas.
4. **Conversar sobre a leitura** abre o chat com a tiragem atual como contexto. O reaproveitamento em outras consultas depende da preferência de memória.

## Tiragem aprofundada de dez cartas

Proposta para depois de validar o fluxo de três cartas. A pessoa escolhe o tema e pode escrever uma pergunta. Na seleção, vê quantas cartas já escolheu. Depois da confirmação, o resultado apresenta um resumo e permite abrir os blocos aos poucos.

| Posições | Bloco |
| --- | --- |
| 1 | Panorama do momento |
| 2 a 4 | Três pontos fortes que podem ajudar na situação |
| 5 a 7 | Três pontos fracos ou de atenção, descritos como desafios da situação |
| 8 | Futuro simbólico, apresentado como uma possibilidade |
| 9 | Próximo passo prático |
| 10 | Conselho de fechamento |

As posições são uma proposta inicial. Cada ponto forte ou fraco deve citar sua carta e conectar a interpretação à pergunta ou ao tema. A síntese usa as dez cartas e aparece no início do resultado. A leitura termina com uma ação concreta, em linha com os exemplos da [pesquisa de mercado](PESQUISA-DE-MERCADO.md).

Para “futuro → gênero-animação”, a interpretação provisória é revelar a carta de futuro com uma animação curta inspirada no símbolo da carta. Mostrar o mesmo conteúdo imediatamente com redução de movimento. O significado de “gênero” fica em aberto para confirmação.

**Aceite proposto.** A tiragem contém dez cartas distintas, o resultado mostra três forças e três pontos de atenção, e a posição de futuro usa linguagem de possibilidade. Se a interpretação falhar, a nova tentativa reaproveita a mesma tiragem. Os dados e as posições vêm do sorteio registrado pelo backend.

## Histórico, perfil e dados

- **Histórico** filtra por Tudo, Consultas e Tiragens. Tocar num item abre o detalhe. O estado vazio indica onde iniciar uma nova consulta ou tiragem. Em erro de rede, oferecer nova tentativa.
- **Perfil** reúne dados da conta, preferências de voz e privacidade. Os controles de histórico e memória aparecem como exemplos ligados na prancha. O estado inicial proposto é desligado, com ativação deliberada pelo usuário.
- **Salvar histórico** controla o registro de novas consultas. **Memória entre consultas** controla o reaproveitamento de contexto. Em **Gerenciar meus dados**, o usuário pode excluir uma consulta, limpar o histórico ou excluir a conta. Cada ação informa o que será excluído antes da confirmação.

## Layouts das ofertas propostas

As pranchas complementam o [conceito visual v2](design/conceito-visual-v2.png) e a [proposta comercial](PESQUISA-DE-MERCADO.md#proposta-comercial-para-teste). Os valores servem para discutir o layout e validar a oferta depois do beta.

| Tela | Entrada e próxima ação |
| --- | --- |
| Leitura Beta | A partir do início, apresenta a leitura gratuita de três cartas com texto e áudio. Começar abre a escolha de tema e a pergunta opcional, antes da tiragem que já foi desenhada. |
| Oferta de personalidade | A pessoa entende o que recebe, abre um exemplo e decide se quer prosseguir. No beta, o botão vira “Experimentar leitura”. |
| Perguntas de personalidade | Uma pergunta por tela, com progresso de 1 a 3, opções de resposta e “Pular pergunta”. |
| Resultado de personalidade | Mostra forças, padrões para observar e um passo prático. Usar linguagem de possibilidade baseada no que a pessoa compartilhou. Se ela pular tudo, apresentar uma reflexão geral. |
| Carta do Dia | Mostra a carta, o conselho e o saldo grátis atualizado. Voltar à mesma leitura no mesmo dia mantém o saldo. |
| Saldo grátis esgotado | Ao tentar abrir uma carta nova com saldo zero, apresenta quantidade, valor total e compra avulsa. “Agora não” retorna ao início. No beta, esse estado é uma demonstração da oferta. |
| Oferta de dez cartas | Explica forças, pontos de atenção, futuro simbólico, conselho e áudio. A confirmação leva à seleção e ao resultado aprofundado já desenhados. No beta, a ação pode abrir um teste gratuito, conforme o recorte definido para o piloto. |

[Prancha A — Leitura Beta e personalidade](design/layouts-beta-personalidade-v1.png) · [Prancha B — Carta do Dia e tiragem de dez cartas](design/layouts-carta-do-dia-e-dez-cartas-v1.png)

### Prompts das pranchas

As duas pranchas foram geradas com ImageGen integrado, usando o conceito visual v2 como referência.

#### Leitura Beta e personalidade

```text
Use case: ui-mockup. Create an original companion design board for the Brazilian Portuguese app Cigana do Destino. Input Image 1 is a reference for the existing original brand: preserve the same fictional mature hostess face where shown, warm gold arches, star-in-arch symbol, editorial serif headings, clean sans body and deep aubergine #160D25 with #29163D surfaces, muted antique gold #D8B66A and warm cream #F5D99B. Show full front-facing portrait app viewports in one horizontal row, generous gutters, no phone bezels, no watermarks, no outer decorative labels. Calm and contemporary, accessible text size and clear actions. Common upper back affordance, 1 primary gold button per screen. All quoted copy in Brazilian Portuguese rendered verbatim. Board A, four portrait screens. Screen 1 "Leitura Beta": cropped illustrated portrait of the hostess in a gold arch with three small tarot backs; short text "Uma pergunta, três cartas." and "Leitura completa em texto e áudio."; action "Começar leitura grátis"; secondary hint "Sua pergunta é opcional." Screen 2 "Leitura de Personalidade": a restrained mirrored star motif, short offer "Forças, padrões e um passo prático."; an expandable sample panel labeled "Ver exemplo"; one-time price "R$ 9,90"; button "Comprar leitura"; caption "Compra avulsa". Screen 3 "Leitura de Personalidade": functional questionnaire after entry, small progress "1 de 3", heading "Como você reage a mudanças?", three plain selectable answers "Procuro um plano", "Observo primeiro", "Experimento um caminho"; one highlighted with a checkmark; visible primary "Continuar" and secondary link "Pular pergunta". Screen 4 "Sua leitura": a small arched star, subtitle "Leitura de Personalidade", three distinct compact editorial result blocks with labels "Suas forças", "Padrões para observar", "Um passo prático"; tiny illustrative copy only a short sentence in each, warm and without fixed personality labels, followed by button "Voltar ao início". Polish typography and hierarchy. Do not introduce modern payment provider logos or any brand other than this original app.
```

#### Carta do Dia e tiragem de dez cartas

```text
Use case: ui-mockup. Create an original companion design board for the Brazilian Portuguese app Cigana do Destino. Input Image 1 is a reference for the existing original brand: preserve the same fictional mature hostess face where shown, warm gold arches, star-in-arch symbol, editorial serif headings, clean sans body and deep aubergine #160D25 with #29163D surfaces, muted antique gold #D8B66A and warm cream #F5D99B. Show full front-facing portrait app viewports in one horizontal row, generous gutters, no phone bezels, no watermarks, no outer decorative labels. Calm and contemporary, accessible text size and clear actions. Common upper back affordance, 1 primary gold button per screen. All quoted copy in Brazilian Portuguese rendered verbatim. Board B, three portrait screens. Screen 1 "Carta do Dia": small clear count "2 cartas grátis restantes", one large original golden engraved star card labeled "A Estrela", section "Conselho de hoje", text "Dê espaço ao que renova sua energia.", outlined button "Voltar ao início". Screen 2 "Seu saldo grátis acabou": small row or fan of tarot backs in branded star arches, "7 Cartas do Dia", "Use uma por dia, quando quiser.", large total "R$ 4,90", label "Compra avulsa", gold CTA "Comprar 7 cartas", clear quiet secondary "Agora não". Screen 3 "Tiragem de 10 cartas": original golden tarot card fan on aubergine, short practical benefit list "3 pontos fortes", "3 pontos de atenção", "Futuro simbólico", "Conselho e áudio"; large total "R$ 9,90", label "Compra avulsa", gold CTA "Comprar leitura", quiet secondary "Agora não". Make the screen concepts look like a coherent original product, avoid coin counters, discount badges, ads, and clutter.
```

## Layouts de apoio

| Prancha | Telas e estados, da esquerda para a direita |
| --- | --- |
| [Seleção, histórico e voz](design/layouts-selecao-historico-voz-v1.png) | Seleção de dez cartas com progresso e revelação bloqueada até completar a tiragem. Detalhe de uma tiragem salva com opção de reabrir ou excluir o registro. Preferências de voz com volume e amostra. |
| [Conta](design/layouts-conta-v1.png) | Entrar, criar conta, recuperar senha e editar perfil. |
| [Gestão de dados](design/layouts-gestao-de-dados-v1.png) | Gestão de dados, confirmação para limpar histórico e confirmação para excluir conta. |

As miniaturas repetidas no detalhe de histórico ilustram as posições. Para uma leitura salva, mostrar a arte das três cartas retiradas. A ação “Excluir este registro” pode reutilizar o componente de confirmação da gestão de dados com texto específico para um único item. O campo de e-mail em Editar perfil é somente leitura na proposta, com indicação textual na implementação.

### Prompts dos layouts de apoio

As três pranchas foram geradas com ImageGen integrado, usando o conceito visual v2 como referência.

#### Seleção, histórico e voz

```text
Use case: ui-mockup. Create an original companion board for the existing Brazilian Portuguese mobile app Cigana do Destino. Input Image 1 is the brand reference. Carry forward the same gold star-in-arch symbol, dark aubergine #160D25, #29163D plum surfaces, #D8B66A matte gold primary buttons, cream editorial serif headings, and sans-serif functional text. Show exactly the requested number of complete portrait app screens in a clean horizontal row, equal widths, no frames, no external labels, crisp copy, ample negative space, readable touch targets, a back affordance on each screen, no logo of another product. Render the quoted Portuguese text exactly. Use purple for panels, gold for primary actions only, and muted rose for destructive actions. Board A: three portrait screens. Screen 1 "Escolha dez cartas": compact 2-row position tracker, with readable position chips “1 2 3 4 5” in first row and “6 7 8 9 10” in second row, first six filled and others outlined. “6 de 10 escolhidas”. Separate layout below with a compact grid of selectable ornate face-down cards, no revealed card faces. Under the deck put "Desfazer última" as an outline action and "Revelar cartas" as a visibly disabled action. Screen 2 "Sua tiragem de trabalho": history detail with small badge "3 cartas", example date "23 nov. 2026", three thumbnail cards in a row with position labels "Passado", "Presente", "Futuro simbólico", short summary "Uma mudança pede calma e clareza.", primary "Reabrir leitura" and quiet destructive "Excluir este registro". Screen 3 "Preferências de voz": clearly labeled switch "Voz nas leituras", distinct "Volume" slider with number "60%", gold "Ouvir amostra" and a quiet helper "A voz é opcional." Calm layouts with real native mobile settings patterns. Do not show checkout or money.
```

#### Conta

```text
Use case: ui-mockup. Create an original companion board for the existing Brazilian Portuguese mobile app Cigana do Destino. Input Image 1 is the brand reference. Carry forward the same gold star-in-arch symbol, dark aubergine #160D25, #29163D plum surfaces, #D8B66A matte gold primary buttons, cream editorial serif headings, and sans-serif functional text. Show exactly the requested number of complete portrait app screens in a clean horizontal row, equal widths, no frames, no external labels, crisp copy, ample negative space, readable touch targets, a back affordance on each screen, no logo of another product. Render the quoted Portuguese text exactly. Use purple for panels, gold for primary actions only, and muted rose for destructive actions. Board B: four portrait screens for account. Screen 1 title "Entrar" with labeled fields "E-mail" and "Senha", "Esqueci minha senha", gold "Entrar", text action "Criar conta". Screen 2 "Criar conta" with form fields "Como podemos chamar você?", "E-mail", "Senha" and gold "Criar conta", quiet "Já tenho conta". Screen 3 "Recuperar senha" with short explanatory sentence "Enviaremos um link para seu e-mail.", labeled field "E-mail", primary "Enviar link" and secondary "Voltar para entrar". Screen 4 "Editar perfil" with fields "Nome" and "E-mail", sample name "Marina" and example "marina@exemplo.com", email visually read-only, primary "Salvar alterações". Use wide labeled inputs, password visibility icon, understated art only at the top. No third-party sign-in buttons or promotional text.
```

#### Gestão de dados

```text
Use case: ui-mockup. Create an original companion board for the existing Brazilian Portuguese mobile app Cigana do Destino. Input Image 1 is the brand reference. Carry forward the same gold star-in-arch symbol, dark aubergine #160D25, #29163D plum surfaces, #D8B66A matte gold primary buttons, cream editorial serif headings, and sans-serif functional text. Show exactly the requested number of complete portrait app screens in a clean horizontal row, equal widths, no frames, no external labels, crisp copy, ample negative space, readable touch targets, a back affordance on each screen, no logo of another product. Render the quoted Portuguese text exactly. Use purple for panels, gold for primary actions only, and muted rose for destructive actions. Board C: three portrait screens about data controls. Screen 1 "Gerenciar meus dados": two plain, well-spaced rows "Limpar histórico" and "Excluir conta", each with a short line that explains impact, muted rose accent on destructive text, and back arrow. Screen 2 same screen dimmed with a well-defined bottom confirmation sheet titled "Limpar histórico?" and text "Suas consultas e tiragens salvas serão apagadas. Sua conta continua ativa.", muted rose button "Limpar histórico", quiet action "Cancelar". Screen 3 same screen dimmed with a separate bottom confirmation sheet titled "Excluir conta?" and text "Seu perfil, suas preferências e seu histórico serão apagados.", muted rose button "Excluir conta" and quiet action "Cancelar". Preserve the underlying app context while each sheet is visible. Give Cancelar clear visual weight. No payment, decorative illustrations or faux notices.
```

## Tema, consulta e limites

| Prancha | Telas e estados da esquerda para a direita |
| --- | --- |
| [Tema e estados da consulta](design/layouts-tema-e-consulta-v1.png) | Seleção de tema e pergunta opcional, gravação de áudio, revisão de transcrição e resposta em preparação. |
| [Retomada e limites](design/layouts-retomada-e-limites-v1.png) | Erro com nova tentativa, aviso de duas respostas restantes, cota do chat esgotada e próxima tiragem grátis. |

Ao escolher **Seguir sem pergunta**, o tema é mantido e o campo é descartado. Na tela de erro, a mensagem enviada permanece visível. O aviso de duas respostas usa uma única indicação, junto ao campo. Quando surgir o painel de cota esgotada, o saldo deve aparecer zerado. A prancha usa o selo de duas respostas no fundo como referência de composição.

No beta, as ofertas da prancha são demonstrativas. Depois, a tiragem de três cartas volta a ficar disponível sete dias após a entrega da anterior. A tela de espera mostra quando a pessoa pode tirar de novo. Se quiser outro tipo de leitura agora, pode abrir a oferta de dez cartas. Os valores são hipóteses da [proposta comercial](PESQUISA-DE-MERCADO.md#proposta-comercial-para-teste).

### Prompts de tema, consulta e limites

Gerados com ImageGen integrado a partir da referência visual v2.

#### Tema e estados da consulta

```text
Use case: ui-mockup. Produce an original design continuation for the Brazilian Portuguese "Cigana do Destino" mobile app. Input Image 1 is brand reference only. Keep the same woman with dark wavy hair with gray streaks for chat avatar, eight-point star in gold arch, #160D25 background, #29163D surfaces, antique matte #D8B66A primary buttons, warm cream headings, plum lavender body. Align complete narrow portrait app viewports side by side on dark canvas, equal widths, no phone frames, no external captions, no filler. Editorial serif headings, readable sans body, strong functional hierarchy. Render quoted Portuguese labels verbatim, one primary action per concept. Show exactly four screens. (1) Title "Tema da tiragem"; six small selectable chips "Amor", "Dinheiro", "Trabalho", "Futuro", "Espiritualidade", "Perguntas gerais"; Trabalho selected. Field labeled "Sua pergunta (opcional)" filled with "Que caminho merece atenção agora?" Buttons "Escolher cartas" and quiet "Seguir sem pergunta". (2) "Consulta", compact avatar with “Assistente virtual”, one previous message, bottom recording panel clearly showing "Gravando", time "0:12", a small waveform, primary "Concluir" and quiet "Cancelar". (3) same "Consulta" with editable raised composer panel titled "Revise a transcrição", sample text "Quero entender meu momento no trabalho.", gold "Enviar" and quiet "Descartar". (4) same "Consulta" with user question above a calm assistant bubble "Preparando sua resposta…" and three subtle dots, muted composer at bottom, no result or prices. The four states should be visually distinct and clearly usable.
```

#### Retomada e limites

```text
Use case: ui-mockup. Produce an original design continuation for the Brazilian Portuguese "Cigana do Destino" mobile app. Input Image 1 is brand reference only. Keep the same woman with dark wavy hair with gray streaks for chat avatar, eight-point star in gold arch, #160D25 background, #29163D surfaces, antique matte #D8B66A primary buttons, warm cream headings, plum lavender body. Align complete narrow portrait app viewports side by side on dark canvas, equal widths, no phone frames, no external captions, no filler. Editorial serif headings, readable sans body, strong functional hierarchy. Render quoted Portuguese labels verbatim, one primary action per concept. Show exactly four screens. (1) "Consulta" with the person's message still visible, a small neutral error card "Não foi possível responder." with gold "Tentar de novo", and a composer. (2) "Consulta" with a completed assistant response, subtle inline text "Restam 2 respostas grátis hoje" above editable composer, the balance is visible but does not interrupt the chat. (3) "Consulta" dimmed with a bottom sheet headed "Sua cota de hoje acabou" and "Volte amanhã para conversar de graça."; one-time offer "20 respostas extras · R$ 4,90"; two distinct actions "Comprar 20 respostas" and "Voltar amanhã"; keep conversation visible behind the sheet. (4) "Tarô" with a compact original three-card motif and a status card "Sua próxima tiragem grátis" and "Disponível em 3 dias"; a separate optional invitation "Quer aprofundar hoje?" and explicit "Ver tiragem de 10 cartas"; quiet "Voltar ao início". No urgency badges, account upsell, coins or countdowns beyond the requested availability label.
```

## Geração da prancha inicial de interações

Gerada com ImageGen integrado, usando a [primeira prancha](design/conceito-visual-v1.png) como referência visual. Prompt utilizado:

```text
Use case: ui-mockup. Produce a new companion design board with four equally wide front-facing portrait mobile screens, side by side in a wide landscape canvas. Use the supplied Image 1 only as the visual style reference for a continuation of the same original app "Cigana do Destino": match the pale gold serif display, legible sans interface, dark aubergine #160D25, wine purple #29163D, muted golden #D8B66A buttons, thin arched eight-point star tarot motif, rounded surfaces, intimate elegant tone. Crisp flat UI screenshots, no metallic device frames. Each screen has generous padding, logical hierarchy, clear back or close affordance, typography scaled for an actual phone, especially the body text. All visible words in Brazilian Portuguese. Screen 1 "Escolha suas cartas": tag "Trabalho"; show three clearly distinct small permanent position slots labeled "Passado", "Presente", "Futuro simbólico", two selected; below, separate visible fan of five selectable face-down cards with gold arch motif and touch affordances; progress text "2 de 3 escolhidas"; allow "Desfazer última". Keep the layout simple and avoid duplicate sections. Screen 2 "Sua leitura": one compact row of three revealed illustrated tarot cards, then a readable short section titled "Mensagem da tiragem" with the single line "Observe o que muda quando você combina cautela e iniciativa." A quieter caption "Leitura simbólica" and a gold action "Conversar sobre a leitura". Screen 3 "Histórico": a row of clear filters "Tudo", "Consultas", "Tiragens", two believable list entries titled "Tiragem de trabalho" and "Consulta sobre amor", with dates and chevrons, and a discreet overflow. Screen 4 "Perfil": stacked settings rows "Nome", "Voz", "Privacidade" and a prominent privacy sheet illustration as part of this same screen, titled "Privacidade", with distinct accessible toggle controls "Salvar histórico" and "Memória entre consultas", and a quiet link "Gerenciar meus dados". Gold accent for focus and primary action, destructive color not needed in this board, avoid decorative filler, unrelated labels, faux watermarks and tiny extra copy. Match the first board so these feel like four screens from the same shipped app, as visual concepts.
```
