export type EditorialReading = { title: string; theme: string; reflection: string; action: string };
export type EditorialCard = { key: string; numeral: string; readings: Record<'pt-BR' | 'en-US', EditorialReading> };

export const dailyCatalog: readonly EditorialCard[] = [
  {
    key: 'the-magician', numeral: 'I', readings: {
      'pt-BR': {
        title: 'O Mago', theme: 'Iniciativa',
        reflection: 'Talvez você já tenha algo útil à mão para começar. Observe quais recursos, experiências ou pessoas podem ajudar num próximo passo.',
        action: 'Escolha uma ideia e anote o menor passo que você consegue dar hoje.',
      },
      'en-US': {
        title: 'The Magician', theme: 'Initiative',
        reflection: 'You may already have something useful at hand. Notice which resources, experiences or people could help with a first step.',
        action: 'Choose one idea and write down the smallest step you can take today.',
      },
    },
  },
  {
    key: 'the-hermit', numeral: 'IX', readings: {
      'pt-BR': {
        title: 'O Eremita', theme: 'Escuta interior',
        reflection: 'Uma pausa pode ajudar a separar o que você quer do que esperam de você. Reserve um momento de silêncio e observe o que continua importante.',
        action: 'Passe cinco minutos longe da tela e escreva o que ficou mais claro.',
      },
      'en-US': {
        title: 'The Hermit', theme: 'Inner listening',
        reflection: 'A pause may help you separate what you want from what others expect. Take a quiet moment and notice what still feels important.',
        action: 'Spend five minutes away from your screen and write down what became clearer.',
      },
    },
  },
  {
    key: 'the-hanged-man', numeral: 'XII', readings: {
      'pt-BR': {
        title: 'O Enforcado', theme: 'Mudança de perspectiva',
        reflection: 'Quando uma situação parece parada, olhar por outro ângulo pode abrir espaço para uma pergunta diferente.',
        action: 'Imagine o conselho que você daria a uma pessoa querida na mesma situação.',
      },
      'en-US': {
        title: 'The Hanged Man', theme: 'A change of perspective',
        reflection: 'When a situation feels stuck, looking at it from another angle may leave room for a different question.',
        action: 'Imagine the advice you would give someone you care about in the same situation.',
      },
    },
  },
  {
    key: 'temperance', numeral: 'XIV', readings: {
      'pt-BR': {
        title: 'A Temperança', theme: 'Equilíbrio',
        reflection: 'Se duas necessidades disputam sua atenção, experimente dar um pouco de espaço para cada uma. Uma pequena mudança já pode aliviar a pressa.',
        action: 'Escolha uma tarefa que pode esperar e use esse tempo para algo que lhe faça bem.',
      },
      'en-US': {
        title: 'Temperance', theme: 'Balance',
        reflection: 'If two needs are competing for your attention, try making a little room for each. A small change may ease the feeling of urgency.',
        action: 'Choose one task that can wait and use the time for something that supports you.',
      },
    },
  },
  {
    key: 'the-star', numeral: 'XVII', readings: {
      'pt-BR': {
        title: 'A Estrela', theme: 'Esperança',
        reflection: 'Preste atenção ao que te devolve disposição. A esperança pode começar com um gesto pequeno que torna o dia mais habitável.',
        action: 'Faça algo simples que você gostaria de encontrar com mais frequência na sua rotina.',
      },
      'en-US': {
        title: 'The Star', theme: 'Hope',
        reflection: 'Notice what restores your energy. Hope can begin with a small gesture that makes the day feel easier to live in.',
        action: 'Do one simple thing you would like to have more often in your routine.',
      },
    },
  },
  {
    key: 'the-sun', numeral: 'XIX', readings: {
      'pt-BR': {
        title: 'O Sol', theme: 'Clareza',
        reflection: 'Talvez exista um progresso que passou despercebido. Reconhecer o que já deu certo ajuda a decidir onde colocar sua energia hoje.',
        action: 'Anote uma coisa que melhorou nos últimos dias e o que contribuiu para isso.',
      },
      'en-US': {
        title: 'The Sun', theme: 'Clarity',
        reflection: 'Some progress may have gone unnoticed. Recognizing what has worked can help you decide where to put your energy today.',
        action: 'Write down one thing that improved recently and what helped it happen.',
      },
    },
  },
];
