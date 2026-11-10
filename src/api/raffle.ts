import * as dotenv from "dotenv";
import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby";
import { mockCampaign, mockPrizes, mockWinnersForPrize } from "../lib/raffle-mock";
import {
  pickDisplayedPrize,
  pickRaffle,
  prizeLabel,
  RaffleRequestError,
  toShownWinners,
  type Campaign,
  type PrizeDrawResult,
  type PrizeSlot,
  type RafflePrize,
  type RaffleWinner,
} from "../lib/raffle";

dotenv.config({ path: `.env`, override: true });

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function useMock(): boolean {
  const flag = process.env.JAGUAR_USE_MOCK;
  if (flag === "false") return false;
  if (flag === "true") return true;
  return !process.env.JAGUAR_API_KEY;
}

function apiBaseUrl(): string {
  return (
    process.env.JAGUAR_API_BASE_URL ||
    "https://qa-api-jaguar-core.palms-peru-pe.com/core/v1"
  ).replace(/\/$/, "");
}

async function jaguar(path: string, method: "GET" | "POST"): Promise<Response> {
  const apiKey = process.env.JAGUAR_API_KEY;
  if (!apiKey) {
    throw new RaffleRequestError(
      "Falta JAGUAR_API_KEY en el servidor. Agrégala al .env."
    );
  }

  try {
    return await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
    });
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

  if (mode === "read") {
    return readJson<RaffleWinner[]>(
      await jaguar(`/raffles/prizes/${prizeId}/winners`, "GET")
    );
  }

  const response = await jaguar(`/raffles/prizes/${prizeId}/winners`, "POST");
  if (response.status === 409) {
    return readJson<RaffleWinner[]>(
      await jaguar(`/raffles/prizes/${prizeId}/winners`, "GET")
    );
  }

  return readJson<RaffleWinner[]>(response);
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

async function runDraw(slot: PrizeSlot, week?: number): Promise<PrizeDrawResult> {
  if (useMock()) {
    const prize = pickDisplayedPrize(mockPrizes, slot);
    return resultFrom(
      mockCampaign,
      mockPrizes,
      slot,
      mockWinnersForPrize(prize.id, week)
    );
  }

  const campaign = await readJson<Campaign>(
    await jaguar("/raffles/campaign/active", "GET")
  );
  const raffle = pickRaffle(campaign.raffles || []);

  if (!UUID.test(raffle.id)) {
    throw new RaffleRequestError("El sorteo recibido no tiene un identificador válido.");
  }

  const prizes = await readJson<RafflePrize[]>(
    await jaguar(`/raffles/${raffle.id}/prizes`, "GET")
  );
  const prize = pickDisplayedPrize(prizes, slot);
  const winners = await winnersForPrize(
    prize.id,
    raffle.status === "DRAWN" ? "read" : "draw"
  );

  return {
    raffleName: raffle.name,
    prizeName: prizeLabel(prize),
    winners: toShownWinners(winners),
  };
}

export default async function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  res.setHeader("Cache-Control", "no-store");

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
    res.status(200).json(await runDraw(slot, week));
  } catch (error) {
    const detail =
      error instanceof RaffleRequestError
        ? error.message
        : "El servicio de sorteos falló. Inténtalo de nuevo.";
    res.status(502).json({ detail });
  }
}
