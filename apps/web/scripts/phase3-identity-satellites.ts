export const PHASE3_IDENTITY_SATELLITE_USER_FKS = [
  { table: "DirectoryProfile", column: "userId", passportColumn: "passportId" },
  { table: "LineageNode", column: "userId", passportColumn: "passportId" },
  { table: "Affiliation", column: "userId", passportColumn: "passportId" },
  { table: "RankAward", column: "userId", passportColumn: "passportId" },
  { table: "FightRecord", column: "userId", passportColumn: "passportId" },
] as const
