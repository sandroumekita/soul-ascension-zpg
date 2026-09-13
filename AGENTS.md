# Diretrizes do Projeto Auto-RPG Engine

- **Strict Theme Decoupling:** NUNCA adicione termos específicos de universo (ex: Reiryoku, Soul Orbs, Hollow, Shinigami) diretamente nos componentes React ou na store Zustand. Use sempre as propriedades exportadas pelo manifesto `GAME_THEME` em `src/config/themeConfig.ts`.
- **Garantia de Build Clean:** Toda nova funcionalidade ou refatoração deve obrigatoriamente compilar sem erros no comando `npm run build` antes de realizar o commit ou dar a tarefa como concluída.
- **Progressão via Receitas:** Mantenha a mecânica de receitas de forja como a principal forma determinística de conseguir equipamentos raros, épicos e lendários, utilizando a desmontagem de itens comuns para obtenção de recursos.
