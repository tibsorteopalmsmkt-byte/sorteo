export interface RaffleSummary {
  id: string;
  name: string;
  endAt: string;
  status: "PENDING" | "CONSOLIDATED" | "DRAWN" | "CANCELLED";
  drawnAt: string | null;
}

export interface Campaign {
  name: string;
  raffles: RaffleSummary[];
}

export interface RafflePrize {
  id: string;
  name: string | null;
  category: "PRINCIPAL" | "SECONDARY";
  awardOrder: number;
  winnersCount: number;
  status?: "PENDING" | "CONSOLIDATED" | "DRAWN" | "CANCELLED";
  desktopImageUrl?: string;
}

export interface RaffleWinner {
  id: string;
  username: string;
  winnerType: "PRIMARY" | "ALTERNATE";
  selectionOrder: number;
  winningTicketNumber: number;
}

export type PrizeSlot = "fifty" | "bonus" | "principal";

export interface PrizeDrawResult {
  raffleName: string;
  prizeName: string;
  winners: Array<{
    username: string;
    code: string;
  }>;
}

export class RaffleRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RaffleRequestError";
  }
}

export function raffleForWeek(raffles: RaffleSummary[], week: number): RaffleSummary {
  if (week !== 1 && week !== 2 && week !== 3 && week !== 4) {
    throw new RaffleRequestError("La semana indicada no existe.");
  }

  const raffle = [...raffles].sort(
    (a, b) => Date.parse(a.endAt) - Date.parse(b.endAt)
  )[week - 1];

  if (!raffle) {
    throw new RaffleRequestError("La semana indicada no existe en la campaña.");
  }

  return raffle;
}

export function pickRaffle(raffles: RaffleSummary[]): RaffleSummary {
  const consolidated = raffles
    .filter((raffle) => raffle.status === "CONSOLIDATED")
    .sort((a, b) => Date.parse(a.endAt) - Date.parse(b.endAt));

  if (consolidated[0]) return consolidated[0];

  const drawn = raffles
    .filter((raffle) => raffle.status === "DRAWN")
    .sort(
      (a, b) =>
        Date.parse(b.drawnAt || b.endAt) - Date.parse(a.drawnAt || a.endAt)
    );

  if (drawn[0]) return drawn[0];

  throw new RaffleRequestError(
    "No hay un sorteo listo. Los tickets de la campaña todavía no están consolidados."
  );
}

export function pickDisplayedPrize(
  prizes: RafflePrize[],
  slot: PrizeSlot
): RafflePrize {
  const ordered = [...prizes].sort((a, b) => a.awardOrder - b.awardOrder);

  if (slot === "principal") {
    const prize = ordered.find((item) => item.category === "PRINCIPAL");
    if (!prize) {
      throw new RaffleRequestError("No hay premio principal en este sorteo.");
    }
    return prize;
  }

  if (slot === "fifty") {
    const prize = ordered.find(
      (item) => item.category === "SECONDARY" && item.winnersCount >= 20
    );
    if (!prize) {
      throw new RaffleRequestError("No hay premio de S/50 en este sorteo.");
    }
    return prize;
  }

  const bonus = ordered.filter(
    (item) => item.category === "SECONDARY" && item.winnersCount < 20
  );
  const prize = bonus.find((item) => item.winnersCount === 10) || bonus[0];
  if (!prize) {
    throw new RaffleRequestError("No hay premio de S/100 en este sorteo.");
  }
  return prize;
}

export function prizeLabel(prize: { name: string | null; awardOrder: number }): string {
  const name = prize.name?.trim();
  return name || `Premio ${prize.awardOrder}`;
}

export function toShownWinners(winners: RaffleWinner[]): PrizeDrawResult["winners"] {
  return winners
    .filter((winner) => winner.winnerType === "PRIMARY")
    .sort((a, b) => a.selectionOrder - b.selectionOrder)
    .map((winner) => ({
      username: winner.username,
      code: String(winner.winningTicketNumber),
    }));
}

export interface WeekPrizeDrawn {
  fifty: boolean;
  third: boolean;
  final: boolean;
}

export interface WeekRaffleStatus {
  week: number;
  status: RaffleSummary["status"];
  drawn?: WeekPrizeDrawn;
}

export interface RaffleParticipant {
  username: string;
  code: string;
  options: number;
}

export async function fetchParticipants(week: number): Promise<RaffleParticipant[]> {
  const response = await fetch(`/api/raffle?participants=1&week=${week}`);
  const body = (await response.json().catch(() => null)) as
    | { participants?: RaffleParticipant[]; detail?: string }
    | null;

  if (!response.ok) {
    throw new RaffleRequestError(
      body?.detail || "No se pudo leer la lista de participantes."
    );
  }

  return body?.participants ?? [];
}

export async function fetchWeekStatuses(): Promise<WeekRaffleStatus[]> {
  const response = await fetch("/api/raffle");
  const body = (await response.json().catch(() => null)) as
    | { weeks?: WeekRaffleStatus[]; detail?: string }
    | null;

  if (!response.ok) {
    throw new RaffleRequestError(
      body?.detail || "No se pudo leer el estado de las semanas."
    );
  }

  return body?.weeks ?? [];
}

export async function drawPrize(slot: PrizeSlot, week?: number): Promise<PrizeDrawResult> {
  const response = await fetch("/api/raffle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot, week }),
  });
  const body = (await response.json().catch(() => null)) as
    | PrizeDrawResult
    | { detail?: string }
    | null;

  if (!response.ok) {
    const detail = body && "detail" in body ? body.detail : undefined;
    throw new RaffleRequestError(detail || "No se pudo realizar el sorteo.");
  }

  console.log("[raffle] resultado del sorteo", { slot, week, body });

  return body as PrizeDrawResult;
}
