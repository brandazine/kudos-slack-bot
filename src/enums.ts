export enum UserType {
  User = 'USER',
  Bot = 'BOT',
}

export enum BrandazinePrinciple {
  MaximizeYourPotential = 'MAXIMIZE_YOUR_POTENTIAL',
  HackYourSuccess = 'HACK_YOUR_SUCCESS',
  BeACurator = 'BE_A_CURATOR',
  ChampionTheCommunity = 'CHAMPION_THE_COMMUNITY',
  BeYourTrueSelf = 'BE_YOUR_TRUE_SELF',
}

export const BrandazinePrincipleLabels = Object.freeze({
  [BrandazinePrinciple.MaximizeYourPotential]: 'Maximize your potential',
  [BrandazinePrinciple.HackYourSuccess]: 'Hack your success',
  [BrandazinePrinciple.BeACurator]: 'Be a curator',
  [BrandazinePrinciple.ChampionTheCommunity]: 'Champion the community',
  [BrandazinePrinciple.BeYourTrueSelf]: 'Be your true self',
}) as Record<BrandazinePrinciple, string>;

export const BrandazinePrincipleReactions = Object.freeze({
  [BrandazinePrinciple.MaximizeYourPotential]: 'muscle',
  [BrandazinePrinciple.HackYourSuccess]: 'dark_sunglasses',
  [BrandazinePrinciple.BeACurator]: 'sparkles',
  [BrandazinePrinciple.ChampionTheCommunity]: 'raised_hands',
  [BrandazinePrinciple.BeYourTrueSelf]: 'handshake',
}) as Record<BrandazinePrinciple, string>;
