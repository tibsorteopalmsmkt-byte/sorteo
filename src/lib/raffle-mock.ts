import type { Campaign, RafflePrize, RaffleWinner } from "./raffle";

export interface JaguarWinner extends RaffleWinner {
  playerId: string;
  createdAt: string;
}

const DRAWN_AT = "2026-11-09T14:26:00Z";

export const mockCampaign: Campaign = {
  name: "Mega Sorteo Fin de Año",
  raffles: [
    {
      id: "111e4567-e89b-12d3-a456-426614174001",
      name: "Sorteo Semana 1",
      endAt: "2026-11-07T23:59:59Z",
      status: "CONSOLIDATED",
      drawnAt: null,
    },
  ],
};

export const mockPrizes: RafflePrize[] = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
    name: "PlayStation 5 + GTA 5",
    category: "PRINCIPAL",
    awardOrder: 1,
    winnersCount: 1,
  },
  {
    id: "b2c3d4e5-f6a7-8901-2345-6789abcdef01",
    name: "S/100 para jugar",
    category: "SECONDARY",
    awardOrder: 2,
    winnersCount: 10,
  },
  {
    id: "c3d4e5f6-a7b8-9012-3456-789abcdef012",
    name: "S/50 para jugar",
    category: "SECONDARY",
    awardOrder: 3,
    winnersCount: 20,
  },
];

const bonusWinners: JaguarWinner[] = [
  ["asael11", 60299914],
  ["leon1989", 60582538],
  ["mariachr18", 60437451],
  ["joskanol", 60650375],
  ["pamela84", 60579627],
  ["melek19", 60577759],
  ["jandi10", 60490289],
  ["pablito1978", 60627474],
  ["aljhcm", 60237405],
  ["eladio18", 60343060],
].map(([username, ticket], index) => ({
  id: `123e4567-e89b-12d3-a456-4266141740${index.toString(16).padStart(2, "0")}`,
  playerId: `987f6543-e21b-34d5-c678-5432109876${index.toString(16).padStart(2, "0")}`,
  username: String(username),
  winnerType: "PRIMARY",
  selectionOrder: index + 1,
  winningTicketNumber: Number(ticket),
  createdAt: DRAWN_AT,
}));

const principalWinner: JaguarWinner = {
  id: "223e4567-e89b-12d3-a456-426614174010",
  playerId: "887f6543-e21b-34d5-c678-543210987610",
  username: "jpiero",
  winnerType: "PRIMARY",
  selectionOrder: 1,
  winningTicketNumber: 60604072,
  createdAt: DRAWN_AT,
};

const fiftyWinners: JaguarWinner[] = [
  ["leon1989", 60582345],
  ["mariaq_22", 71234098],
  ["jperez87", 45893210],
  ["carlos99", 60111223],
  ["sofia_m", 60998877],
  ["diego_pe", 60334455],
  ["lucia12", 60776655],
  ["andre_s", 60221100],
  ["valeria8", 60887766],
  ["marco_t", 60445566],
  ["nina_k", 60199887],
  ["pedro_v", 60661234],
  ["camila_r", 60990011],
  ["hugo21", 60337788],
  ["elena_g", 60556677],
  ["raul_mz", 60881234],
  ["irene_p", 60224567],
  ["tomas_q", 60778899],
  ["noa_lr", 60441122],
  ["ivan_hc", 60992345],
].map(([username, ticket], index) => ({
  id: `323e4567-e89b-12d3-a456-4266141740${index.toString(16).padStart(2, "0")}`,
  playerId: `187f6543-e21b-34d5-c678-5432109876${index.toString(16).padStart(2, "0")}`,
  username: String(username),
  winnerType: "PRIMARY" as const,
  selectionOrder: index + 1,
  winningTicketNumber: Number(ticket),
  createdAt: DRAWN_AT,
}));

const weekFourCashWinners: JaguarWinner[] = [
  ["lucia_pr", 70112233],
  ["diego_hc", 70224455],
  ["sofia_vl", 70336677],
  ["marco_qz", 70448899],
].map(([username, ticket], index) => ({
  id: `423e4567-e89b-12d3-a456-4266141740${index.toString(16).padStart(2, "0")}`,
  playerId: `287f6543-e21b-34d5-c678-5432109876${index.toString(16).padStart(2, "0")}`,
  username: String(username),
  winnerType: "PRIMARY" as const,
  selectionOrder: index + 1,
  winningTicketNumber: Number(ticket),
  createdAt: DRAWN_AT,
}));

const draws = new Map<string, JaguarWinner[]>();

export function mockWinnersForPrize(prizeId: string, week?: number): JaguarWinner[] {
  const key = week === 4 && prizeId === mockPrizes[0].id ? `${prizeId}:week4` : prizeId;
  const stored = draws.get(key);
  if (stored) return stored;

  const winners =
    key.endsWith(":week4")
      ? weekFourCashWinners
      : prizeId === mockPrizes[0].id
        ? [principalWinner]
        : prizeId === mockPrizes[2].id
          ? fiftyWinners
          : bonusWinners;
  draws.set(key, winners);
  return winners;
}
