---
name: auto-rpg-engine
description: Cheatsheet de arquitetura e procedimentos para o Auto-RPG Engine Data-Driven (Horda, Forja, Drops e Decoupled Themes).
---

# Auto-RPG Engine - Guia do Desenvolvedor

Esta skill documenta as diretrizes arquiteturais para manutenção e evolução do projeto Auto-RPG Engine.

## 1. Desacoplamento de Temas (Theme-Agnostic)
- Toda a interface UI deve consumir as variáveis exportadas em `src/config/themeConfig.ts` (`GAME_THEME`).
- O estado Zustand (`useGameStore.ts`) e os tipos (`types/game.ts`) utilizam identificadores neutros de RPG: `gold`, `gems`, `material1`, `material2`, `material3`.
- Para alterar o tema do jogo (ex: de Bleach para Naruto, Fantasia Medieval ou Sci-Fi), altere apenas os valores dentro de `themeConfig.ts`.

## 2. Horda & Ataques AoE
- Os inimigos vivos residem no array `currentEnemies: Enemy[]`.
- Ataques simples focam no alvo primário (`currentEnemies[0]`).
- Habilidades com `isAoE: true` atingem até `maxTargets` mobs simultaneamente.

## 3. Forja & Reciclagem (Crafting Engine)
- Mobs normais possuem 15% de chance de drop.
- Itens de sobra devem ser reciclados via `salvageItem(instanceId)` no inventário para gerar materiais de forja.
- As receitas de forja garantida residem em `CRAFTING_RECIPES_CATALOG` (`gameCatalog.ts`).

## 4. Controles de Estágio
- O botão de desafio do Boss da fase 10 só aparece quando o jogador atinge o Estágio 9+.
- O jogador pode alternar entre *Horda Contínua ON* e *Farm Fixo (Parado)*.
