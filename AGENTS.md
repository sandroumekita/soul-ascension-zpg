# Diretrizes do Projeto Auto-RPG Engine

- **Strict Theme Decoupling:** NUNCA adicione termos específicos de universo (ex: Reiryoku, Soul Orbs, Hollow, Shinigami) diretamente nos componentes React ou na store Zustand. Use sempre as propriedades exportadas pelo manifesto `GAME_THEME` em `src/config/themeConfig.ts`.
- **Garantia de Build Clean:** Toda nova funcionalidade ou refatoração deve obrigatoriamente compilar sem erros no comando `npm run build` antes de realizar o commit ou dar a tarefa como concluída.
- **Progressão via Receitas:** Mantenha a mecânica de receitas de forja como a principal forma determinística de conseguir equipamentos raros, épicos e lendários, utilizando a desmontagem de itens comuns para obtenção de recursos.
- **Mobile First-Fold & Viewport Containment:** O layout da aplicação é estritamente confinado ao viewport (`h-[100dvh] overflow-hidden`).
  - O header (`shrink-0`) fica fixo no topo e a barra de navegação (`shrink-0`) fica fixada no rodapé em todas as telas, sem jamais sair do viewport.
  - O contêiner intermediário `<main className="flex-1 min-h-0 overflow-y-auto">` é a única área rolável por aba, permitindo que telas longas (como o Mapa) rolem de forma fluida sem descolar o menu.
  - Nunca utilizar limites rígidos de altura baixa (como `max-h-72`) em listas filhas quando isso puder deixar buracos vazios em aparelhos compridos (como iPhone 16 Pro Max). Deixar o conteúdo preencher a altura disponível do `main`.
  - Usar grades 2x2 (`grid-cols-2 gap-2 sm:gap-4`) para blocos interativos (distribuição de atributos, slots de Bankai, dificuldades globais) e `min-w-0` / `truncate` para evitar quebras horizontais.
- **Windows PowerShell Command Chaining:** No ambiente Windows com shell PowerShell, nunca encadear comandos usando `&&`. Utilize sempre `;` ou dispare comandos individualmente.
- **Progressão Sequencial de Fases (Stage Gating):** Fases nunca podem ser selecionadas ou avançadas se o jogador ainda não venceu as anteriores a ela (`targetStage <= maxUnlockedStage`). O recuo por derrota jamais apaga o recorde de fases já desbloqueadas pelo jogador naquele bioma/dificuldade.
- **Ciclo de Chefes e Consumo de Chaves:** A sala do Boss (Fase 10) consome estritamente 1 chave por tentativa, inclusive ao renascer após uma derrota. No modo Automático com chaves disponíveis, o loop contra o chefe deve ser contínuo; ao zerar as chaves, o recuo automático para a fase 9 de farm é obrigatório.
- **Linguagem Informal e Direta:** Todos os textos de UI, botões, dicas e logs de batalha devem utilizar linguagem informal, natural e concisa, evitando termos excessivamente formais ou solenes.
- **Integridade de Efeitos de Habilidades:** Propriedades de combate (como `stunSec`, `durationSec`, buffs de velocidade/defesa) devem ter implementação funcional real na simulação de combate em todos os slots (Slot 1 e Slot 2), sem efeitos que existam apenas como texto decorativo.
