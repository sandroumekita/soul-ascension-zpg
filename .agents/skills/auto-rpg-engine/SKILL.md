---
name: auto-rpg-engine
description: Cheatsheet de arquitetura e procedimentos para o Auto-RPG Engine Data-Driven (Horda, Forja, 0 CLS, Pixel Sprites e Balanceamento de 2 Semanas).
---

# Auto-RPG Engine - Guia do Desenvolvedor

Esta skill documenta as diretrizes arquiteturais para manutenção e evolução do projeto Auto-RPG.

## 1. Desacoplamento de Temas (Theme-Agnostic)
- Toda a interface UI deve consumir as variáveis exportadas em `src/config/themeConfig.ts` (`GAME_THEME`).
- O estado Zustand (`useGameStore.ts`) e tipos (`types/game.ts`) utilizam identificadores neutros de RPG: `gold`, `gems`, `material1`, `material2`, `material3`.
- Para alterar o tema do jogo (ex: de Bleach para Naruto, Fantasia Medieval ou Sci-Fi), altere apenas os valores dentro de `themeConfig.ts`.

## 2. Arena Anti-CLS & Mobs da Horda
- A lista de inimigos ativos da horda (`currentEnemies: Enemy[]`) varia entre 1 e 3 mobs simultâneos.
- **Regra Anti-CLS:** O container do lado direito DEVE pré-alocar 3 slots de altura fixa (`h-[195px]`). Slots vazios devem renderizar um placeholder transparente para nunca esticar ou encolher o layout da tela durante a batalha.
- **Navegação Interativa de Estágios:** Todos os nós da barra de fases (1 a 10) devem ser botões que chamam `selectStage(targetStage)` permitindo ao jogador farmar ou navegar livremente por qualquer fase.

## 3. UI & Sprites em Pixel Art Transparente
- Personagens e Mobs devem usar componentes SVG pixel-perfect (`shapeRendering: crispEdges`) ou PNGs com transparência alpha real sem bordas ou quadros xadrez.
- Habilidades exibidas na UI devem sempre buscar os nomes amigáveis em `SKILLS_CATALOG` para evitar textos crus com underline.

## 4. Sistema de Atributos & Alocação em Lote
- O botão de alocação de pontos aceita multiplicadores (`+1`, `+5`, `+10`, `MAX`) através de `allocateStatPoint(stat, amount)`.
- Atributo SPD possui Soft Cap a partir de `2.50 atks/s` (+0.025/pt) e Hard Cap a partir de `4.00/s` (+0.01/pt).

## 5. Curva de Balanceamento (2 Semanas de Gameplay)
- Multiplicadores de Dificuldade Global: `Normal 1.0x`, `Hard 8.5x`, `Nightmare 65.0x`, `Hell 500.0x`.
- Escala Exponencial de EXP por Nível: `1.75x`.
