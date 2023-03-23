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
  [BrandazinePrinciple.MaximizeYourPotential]: 'trophy',
  [BrandazinePrinciple.HackYourSuccess]: 'hammer_and_wrench',
  [BrandazinePrinciple.BeACurator]: 'bulb',
  [BrandazinePrinciple.ChampionTheCommunity]: 'handshake',
  [BrandazinePrinciple.BeYourTrueSelf]: 'index_pointing_at_the_viewer',
}) as Record<BrandazinePrinciple, string>;
