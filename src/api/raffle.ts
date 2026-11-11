import { AsyncLocalStorage } from "async_hooks";
import * as dotenv from "dotenv";
import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby";
import {
  mockCampaign,
  mockPrizesForWeek,
  mockRaffleForWeek,
  mockWinnersForPrize,
} from "../lib/raffle-mock";
import {
  pickDisplayedPrize,
  pickRaffle,
  prizeLabel,
  raffleForWeek,
  RaffleRequestError,
  toShownWinners,
  type Campaign,
  type PrizeDrawResult,
  type PrizeSlot,
  type RafflePrize,
  type RaffleWinner,
} from "../lib/raffle";

const envFile = dotenv.config({ path: `.env`, override: true });

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function envValue(name: string): string {
  return envFile.parsed?.[name] || process.env[name] || "";
}

function useMock(): boolean {
  const flag = envValue("JAGUAR_USE_MOCK");
  if (flag === "false") return false;
  if (flag === "true") return true;
  return !envValue("JAGUAR_API_KEY");
}

function apiBaseUrl(): string {
  return (
    envValue("JAGUAR_API_BASE_URL") ||
    "https://qa-api-jaguar-core.palms-peru-pe.com/core/v1"
  ).replace(/\/$/, "");
}

type JaguarTrace = {
  method: "GET" | "POST";
  path: string;
  status: number;
  body: unknown;
};

const jaguarTrace = new AsyncLocalStorage<JaguarTrace[]>();

function localBrowserLog(): boolean {
  return process.env.NODE_ENV !== "production";
}

function traceBody(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function withDebug<T extends Record<string, unknown>>(
  payload: T,
  trace: JaguarTrace[]
): T | (T & { debug: JaguarTrace[] }) {
  if (!localBrowserLog()) return payload;
  return { ...payload, debug: trace };
}

async function jaguar(path: string, method: "GET" | "POST"): Promise<Response> {
  const apiKey = envValue("JAGUAR_API_KEY");
  if (!apiKey) {
    throw new RaffleRequestError(
      "Falta JAGUAR_API_KEY en el servidor."
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers: {
        // El POST de ganadores no declara application/json en @Produces.
        // Accept: application/json responde 406 antes de sortear.
        Accept: method === "POST" ? "*/*" : "application/json",
        "X-API-Key": apiKey,
      },
    });
    const trace = jaguarTrace.getStore();
    if (trace) {
      trace.push({
        method,
        path,
        status: response.status,
        body: traceBody(await response.clone().text()),
      });
    }
    return response;
  } catch {
    throw new RaffleRequestError("No se pudo conectar con el servicio de sorteos.");
  }
}

async function problemDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string };
    return typeof body.detail === "string" ? body.detail : "";
  } catch {
    return "";
  }
}

function failureMessage(status: number, detail: string): string {
  if (status === 401) return "La API key del sorteo no es válida.";
  if (status === 404) return detail || "No hay una campaña activa.";
  if (status === 400) return detail || "La solicitud del sorteo no es válida.";
  return detail || "El servicio de sorteos falló. Inténtalo de nuevo.";
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new RaffleRequestError(
      failureMessage(response.status, await problemDetail(response))
    );
  }
  return (await response.json()) as T;
}

async function winnersForPrize(
  prizeId: string,
  mode: "draw" | "read"
): Promise<RaffleWinner[]> {
  if (!UUID.test(prizeId)) {
    throw new RaffleRequestError("El premio recibido no tiene un identificador válido.");
  }

  const path = `/raffles/prizes/${prizeId}/winners`;
  const winners =
    mode === "read" ? await readWinners(path) : await drawWinners(path);

  console.log("[raffle] ganadores Jaguar", {
    prizeId,
    mode,
    path,
    count: winners.length,
    winners,
  });

  return winners;
}

async function readWinners(path: string): Promise<RaffleWinner[]> {
  return readJson<RaffleWinner[]>(await jaguar(path, "GET"));
}

async function drawWinners(path: string): Promise<RaffleWinner[]> {
  const response = await jaguar(path, "POST");
  if (response.status === 409 || response.status === 204) {
    return readWinners(path);
  }
  if (!response.ok) {
    throw new RaffleRequestError(
      failureMessage(response.status, await problemDetail(response))
    );
  }

  const text = await response.text();
  if (!text.trim()) {
    return readWinners(path);
  }
  return JSON.parse(text) as RaffleWinner[];
}

function resultFrom(
  campaign: Campaign,
  prizes: RafflePrize[],
  slot: PrizeSlot,
  winners: RaffleWinner[]
): PrizeDrawResult {
  const raffle = pickRaffle(campaign.raffles || []);
  const prize = pickDisplayedPrize(prizes, slot);
  return {
    raffleName: raffle.name,
    prizeName: prizeLabel(prize),
    winners: toShownWinners(winners),
  };
}

function prizeDrawn(raffleStatus: RafflePrize["status"], prize?: RafflePrize): boolean {
  return raffleStatus === "DRAWN" || prize?.status === "DRAWN";
}

function drawnFlags(raffleStatus: RafflePrize["status"], prizes: RafflePrize[]) {
  const prizeFor = (slot: PrizeSlot) => {
    try {
      return pickDisplayedPrize(prizes, slot);
    } catch {
      return undefined;
    }
  };

  return {
    fifty: prizeDrawn(raffleStatus, prizeFor("fifty")),
    third: prizeDrawn(raffleStatus, prizeFor("bonus")),
    final: prizeDrawn(raffleStatus, prizeFor("principal")),
  };
}

async function weekStatuses(): Promise<
  Array<{
    week: number;
    status: Campaign["raffles"][number]["status"];
    drawn: { fifty: boolean; third: boolean; final: boolean };
  }>
> {
  const raffles = useMock()
    ? mockCampaign.raffles
    : (
        await readJson<Campaign>(await jaguar("/raffles/campaign/active", "GET"))
      ).raffles || [];

  const ordered = [...raffles]
    .sort((a, b) => Date.parse(a.endAt) - Date.parse(b.endAt))
    .slice(0, 4);

  return Promise.all(
    ordered.map(async (raffle, index) => {
      const prizes = useMock()
        ? mockPrizesForWeek(index + 1)
        : await readJson<RafflePrize[]>(
            await jaguar(`/raffles/${raffle.id}/prizes`, "GET")
          );

      return {
        week: index + 1,
        status: raffle.status,
        drawn: drawnFlags(raffle.status, prizes),
      };
    })
  );
}

interface JaguarParticipant {
  playerId: number;
  username: string;
  validTicketsCount: number;
}

async function participantsForWeek(week: number) {
  if (week !== 1 && week !== 2 && week !== 3 && week !== 4) {
    throw new RaffleRequestError("La semana indicada no existe.");
  }

  if (useMock()) return [];

  const campaign = await readJson<Campaign>(
    await jaguar("/raffles/campaign/active", "GET")
  );
  const raffle = raffleForWeek(campaign.raffles || [], week);
  if (!UUID.test(raffle.id)) {
    throw new RaffleRequestError("El sorteo recibido no tiene un identificador válido.");
  }

  const rows = await readJson<JaguarParticipant[]>(
    await jaguar(`/raffles/${raffle.id}/participants`, "GET")
  );

  return rows
    .map((row) => ({
      username: row.username,
      code: String(row.playerId),
      options: row.validTicketsCount,
    }))
    .sort(
      (a, b) => b.options - a.options || a.username.localeCompare(b.username, "es")
    );
}

async function runDraw(slot: PrizeSlot, week?: number): Promise<PrizeDrawResult> {
  if (useMock()) {
    const prizes = mockPrizesForWeek(week);
    const prize = pickDisplayedPrize(prizes, slot);
    const winners = mockWinnersForPrize(prize.id, week);
    console.log("[raffle] ganadores mock", {
      week,
      slot,
      prizeId: prize.id,
      count: winners.length,
      winners,
    });
    return resultFrom(
      { name: mockCampaign.name, raffles: [mockRaffleForWeek(week)] },
      prizes,
      slot,
      winners
    );
  }

  if (week !== 1 && week !== 2 && week !== 3 && week !== 4) {
    throw new RaffleRequestError("La semana indicada no existe.");
  }

  const campaign = await readJson<Campaign>(
    await jaguar("/raffles/campaign/active", "GET")
  );
  const raffle = raffleForWeek(campaign.raffles || [], week);

  if (raffle.status === "PENDING" || raffle.status === "CANCELLED") {
    throw new RaffleRequestError("Esta semana todavía no está lista para sortear.");
  }

  if (!UUID.test(raffle.id)) {
    throw new RaffleRequestError("El sorteo recibido no tiene un identificador válido.");
  }

  const prizes = await readJson<RafflePrize[]>(
    await jaguar(`/raffles/${raffle.id}/prizes`, "GET")
  );
  const prize = pickDisplayedPrize(prizes, slot);
  const mode = prizeDrawn(raffle.status, prize) ? "read" : "draw";
  const winners = await winnersForPrize(prize.id, mode);

  return {
    raffleName: raffle.name,
    prizeName: prizeLabel(prize),
    winners: toShownWinners(winners),
  };
}

function failureDetail(error: unknown): string {
  return error instanceof RaffleRequestError
    ? error.message
    : "El servicio de sorteos falló. Inténtalo de nuevo.";
}

export default function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  res.setHeader("Cache-Control", "no-store");
  const trace: JaguarTrace[] = [];

  return jaguarTrace.run(trace, async () => {
    if (useMock()) {
      trace.push({
        method: "GET",
        path: "(mock)",
        status: 200,
        body: { detail: "Respuesta local de mock. Jaguar no fue llamado." },
      });
    }

    if (req.method === "GET" && req.query.participants === "1") {
      const week = Number(req.query.week);
      try {
        res.status(200).json(withDebug({ participants: await participantsForWeek(week) }, trace));
      } catch (error) {
        res.status(502).json(withDebug({ detail: failureDetail(error) }, trace));
      }
      return;
    }

    if (req.method === "GET") {
      try {
        res.status(200).json(withDebug({ weeks: await weekStatuses() }, trace));
      } catch (error) {
        res.status(502).json(withDebug({ detail: failureDetail(error) }, trace));
      }
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ detail: "Método no permitido." });
      return;
    }

    const body = req.body as { slot?: string; week?: number } | undefined;
    const slot = body?.slot;
    const week = body?.week;
    if (slot !== "fifty" && slot !== "bonus" && slot !== "principal") {
      res.status(400).json({ detail: "Indica si el sorteo es el de S/100 o el premio final." });
      return;
    }

    try {
      res.status(200).json(withDebug({ ...(await runDraw(slot, week)) }, trace));
    } catch (error) {
      res.status(502).json(withDebug({ detail: failureDetail(error) }, trace));
    }
  });
}
