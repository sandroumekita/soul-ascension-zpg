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
  material1Name: "Reishi",
  material1Icon: "⚙️",
  material2Name: "Minério",
  material2Icon: "🪨",
  material3Name: "Essência",
  material3Icon: "🔮",
  skillSlot1Label: "Habilidade",
  skillSlot2Label: "Bankai",
  enemyFactionName: "Horda Hollow",
  weaponTerm: "Zanpakuto",
  resetSaveText: "Resetar",
};
