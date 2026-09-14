export interface ThemeConfig {
  gameTitle: string;
  subTitle: string;
  heroTitle: string;
  currencyName: string;
  currencyIcon: string;
  premiumCurrencyName: string;
  premiumCurrencyIcon: string;
  material1Name: string;
  material1Icon: string;
  material2Name: string;
  material2Icon: string;
  material3Name: string;
  material3Icon: string;
  skillSlot1Label: string;
  skillSlot2Label: string;
  enemyFactionName: string;
  weaponTerm: "Zanpakuto" | "Arma" | "Equipamento";
  resetSaveText: string;
}

export const GAME_THEME: ThemeConfig = {
  gameTitle: "Soul Ascension",
  subTitle: "Bleach Auto-RPG (ZPG)",
  heroTitle: "Shinigami Substituto",
  currencyName: "Reiryoku",
  currencyIcon: "💰",
  premiumCurrencyName: "Soul Orbs",
  premiumCurrencyIcon: "💎",
  material1Name: "Fragmentos de Reishi",
  material1Icon: "⚙️",
  material2Name: "Minério Espiritual",
  material2Icon: "🪨",
  material3Name: "Essência Espiritual",
  material3Icon: "🔮",
  skillSlot1Label: "Habilidade Ativa / Hadō",
  skillSlot2Label: "Modo Bankai / Ultimate",
  enemyFactionName: "Horda Hollow Inimiga",
  weaponTerm: "Zanpakuto",
  resetSaveText: "Reiniciar Progresso",
};
