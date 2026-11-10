import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { drawPrize, type PrizeDrawResult, type PrizeSlot } from "../lib/raffle";

import imgLanding1 from "../images/bg-vegas.png";
import slotMachine from "../images/slot-machine.svg";
import palmsBetLogo from "../images/palms_bet_logo.svg";
import ruletaWheel from "../images/ruleta.gif";
import RouteHome from "../components/RouteHome";
import WeekHub from "../components/WeekHub";
import fondoRuta from "../images/ruta/fondo.png";
import logoPalms from "../images/ruta/logo-palms.png";
import confetti from "../images/confetti.gif";
import { getWeek, type WeekNumber, type WeekPrizeId } from "../lib/weeks";
import logoSvg from "../images/logo.svg";
import iconX from "../images/icon-x.svg";
import palmsbetPalm from "../images/palmsbet/03302.svg";
import palmsbetP from "../images/palmsbet/7066c.svg";
import palmsbetA from "../images/palmsbet/8fdca.svg";
import palmsbetL from "../images/palmsbet/00d5e.svg";
import palmsbetM from "../images/palmsbet/59c84.svg";
import palmsbetS from "../images/palmsbet/46730.svg";
import palmsbetB from "../images/palmsbet/347ba.svg";
import palmsbetE from "../images/palmsbet/a7a33.svg";
import palmsbetT from "../images/palmsbet/885e5.svg";
import palmsbetDot from "../images/palmsbet/8f111.svg";
import palmsbetP2 from "../images/palmsbet/ea031.svg";
import palmsbetE2 from "../images/palmsbet/1dcad.svg";


interface Winner {
  username: string;
  code: string;
}

interface CSVRow {
  "Player ID": string;
  "Player Login": string;
}

interface UserCount {
  username: string;
  code: string;
  count: number;
}

const WINNER_COUNT = 10;
const PRIZE_LABEL = "S/ 100";
const FINAL_PRIZE_LABEL = "PlayStation 5 + GTA 5";

function loadParticipants(): Promise<UserCount[]> {
  return fetch("/sorteo_users_7.csv")
    .then((response) => response.text())
    .then(
      (csvText) =>
        new Promise((resolve, reject) => {
          Papa.parse<CSVRow>(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const counts = new Map<string, { code: string; count: number }>();
              results.data.forEach((row) => {
                const username = row["Player Login"]?.trim();
                const code = row["Player ID"]?.trim();
                if (!username || !code) return;
                const current = counts.get(username);
                if (current) {
                  current.count += 1;
                } else {
                  counts.set(username, { code, count: 1 });
                }
              });
              resolve(
                Array.from(counts.entries())
                  .map(([username, data]) => ({
                    username,
                    code: data.code,
                    count: data.count,
                  }))
                  .sort((a, b) => b.count - a.count)
              );
            },
            error: (error: Error) => reject(error),
          });
        })
    );
}

function WinnerCard({
  position,
  username,
  code,
  revealed,
  prizeLabel = PRIZE_LABEL,
  compact = false,
}: {
  position: number;
  username: string;
  code: string;
  revealed: boolean;
  prizeLabel?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-start relative rounded-[16px] border-2 border-solid transition-all duration-500 ${
        compact ? "gap-[2px] px-[12px] py-[8px]" : "gap-[8px] p-[16px]"
      } ${
        revealed
          ? "bg-[rgba(0,0,0,0.5)] border-[#ffce58] drop-shadow-[0px_0px_10px_rgba(255,208,92,0.3)]"
          : "bg-[rgba(0,0,0,0.3)] border-[rgba(255,255,255,0.2)]"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div
          className={`flex items-center justify-center rounded-[14px] shrink-0 size-[28px] ${
            revealed ? "bg-white" : "bg-[rgba(255,255,255,0.4)]"
          }`}
        >
          <p className="font-urbanist font-medium leading-[normal] text-[#192a44] text-[16px]">
            {position}
          </p>
        </div>
        <div
          className={`bg-[rgba(255,206,88,0.15)] border border-[#ffce58] border-solid flex px-[12px] py-[4px] rounded-[999px] ${
            revealed ? "" : "opacity-50"
          }`}
        >
          <p className="font-urbanist font-bold leading-[normal] text-[#ffce58] text-[16px] whitespace-nowrap">
            {prizeLabel}
          </p>
        </div>
      </div>
      <p
        className={`font-urbanist font-bold leading-[normal] truncate w-full ${
          compact ? "text-[20px]" : "text-[24px]"
        } ${revealed ? "text-white" : "text-[#a9b3bf]"}`}
      >
        {revealed ? username : "? ? ?"}
      </p>
      <p
        className={`font-urbanist font-normal leading-[normal] text-[#a9b3bf] whitespace-nowrap ${
          compact ? "text-[14px]" : "text-[16px]"
        }`}
      >
        {revealed ? code : "--------"}
      </p>
    </div>
  );
}

function WinnersGrid({
  winners,
  visible,
  rows = 2,
  columns = 5,
  prizeLabel = PRIZE_LABEL,
  compact = false,
  gap = 16,
}: {
  winners: Winner[];
  visible: boolean[];
  rows?: number;
  columns?: number;
  prizeLabel?: string;
  compact?: boolean;
  gap?: number;
}) {
  return (
    <div
      className="flex flex-col w-[1100px] max-w-[calc(100vw-48px)]"
      style={{ gap }}
    >
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex gap-[16px] w-full">
          {Array.from({ length: columns }, (_, column) => {
            const index = row * columns + column;
            const winner = winners[index];
            return (
              <WinnerCard
                key={index}
                position={index + 1}
                username={winner?.username ?? ""}
                code={winner?.code ?? ""}
                revealed={Boolean(visible[index] && winner)}
                prizeLabel={prizeLabel}
                compact={compact}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

const IndexPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<
    "first" | "week" | "second" | "fifty" | "third" | "fourth" | "fifth" | "final"
  >("first");
  const [animationNext, setAnimationNext] = useState<"fifty" | "third" | "final">("fifty");
  const [spinKey, setSpinKey] = useState(0);
  const [finalWinner, setFinalWinner] = useState<Winner | null>(null);
  const [finalWinners, setFinalWinners] = useState<Winner[]>([]);
  const [finalWinnerVisible, setFinalWinnerVisible] = useState(false);
  const [fiftyWinners, setFiftyWinners] = useState<Winner[]>([]);
  const [visibleFifty, setVisibleFifty] = useState<boolean[]>([]);

  // Datos de ganadores (10 ganadores) - se actualizarán desde el CSV
  const [winners, setWinners] = useState<Winner[]>(
    Array.from({ length: WINNER_COUNT }, () => ({
      username: "leon1989",
      code: "60582345",
    }))
  );

  // Datos de suplentes (12 suplentes) - se actualizarán desde el CSV
  const [alternates, setAlternates] = useState<Winner[]>([
    { username: "leonleon1234", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
  ]);

  // Array con todos los usuarios únicos y sus conteos
  const [userCounts, setUserCounts] = useState<UserCount[]>([]);

  // Estados para controlar la visibilidad de los ganadores con fade-in
  const [visibleWinners, setVisibleWinners] = useState<boolean[]>(
    new Array(winners.length).fill(false)
  );

  // Estados para controlar la visibilidad de los suplentes con fade-in
  const [visibleAlternates, setVisibleAlternates] = useState<boolean[]>(
    new Array(alternates.length).fill(false)
  );

  // Estado para controlar qué tooltip está visible (índice del suplente o null)
  const [hoveredAlternateIndex, setHoveredAlternateIndex] = useState<number | null>(null);

  // Estado para controlar si el modal de la tabla está abierto
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);

  // Estado para controlar la visibilidad del confetti
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<WeekNumber>(1);
  const [drawnByWeek, setDrawnByWeek] = useState<
    Record<WeekNumber, Record<WeekPrizeId, boolean>>
  >({
    1: { fifty: false, third: false, final: false },
    2: { fifty: false, third: false, final: false },
    3: { fifty: false, third: false, final: false },
    4: { fifty: false, third: false, final: false },
  });
  const [instantReveal, setInstantReveal] = useState(false);
  const [bonusPrizeName, setBonusPrizeName] = useState("");
  const [finalPrizeName, setFinalPrizeName] = useState("");
  const draws = useRef<Partial<Record<string, Promise<PrizeDrawResult>>>>({});
  const activeWeekRef = useRef<WeekNumber>(activeWeek);
  activeWeekRef.current = activeWeek;
  const drawsByWeek = useRef<
    Record<
      WeekNumber,
      {
        fifty: Winner[];
        third: Winner[];
        final: Winner | null;
        finalists: Winner[];
        bonusName: string;
        finalName: string;
      }
    >
  >({
    1: { fifty: [], third: [], final: null, finalists: [], bonusName: "", finalName: "" },
    2: { fifty: [], third: [], final: null, finalists: [], bonusName: "", finalName: "" },
    3: { fifty: [], third: [], final: null, finalists: [], bonusName: "", finalName: "" },
    4: { fifty: [], third: [], final: null, finalists: [], bonusName: "", finalName: "" },
  });

  const truncateUsername = (username: string, maxLength: number = 8): string => {
    if (username.length <= maxLength) return username;
    // Respetar espacios - truncar en el último espacio antes del límite si es posible
    const truncated = username.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength - 4) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
  };

  const requestDraw = (slot: PrizeSlot, week: WeekNumber): Promise<PrizeDrawResult> => {
    const key = `${week}:${slot}`;
    const current = draws.current[key];
    if (current) return current;

    const request = drawPrize(slot, week).catch((error: unknown) => {
      delete draws.current[key];
      throw error;
    });
    draws.current[key] = request;
    return request;
  };

  const handleOpenWeek = (week: WeekNumber) => {
    setActiveWeek(week);
    setCurrentPage("week");
  };

  const handleDrawPrize = (prize: WeekPrizeId) => {
    setDrawError(null);
    if (prize === "final") setFinalWinnerVisible(false);
    setAnimationNext(prize);
    setSpinKey((key) => key + 1);
    setCurrentPage("second");
  };

  const handleViewWinners = (prize: WeekPrizeId) => {
    const saved = drawsByWeek.current[activeWeek];
    if (prize === "fifty") {
      setFiftyWinners(saved.fifty);
    } else if (prize === "third") {
      setWinners(saved.third);
      setBonusPrizeName(saved.bonusName);
    } else {
      setFinalWinner(saved.final);
      setFinalWinners(saved.finalists);
      setFinalPrizeName(saved.finalName);
      setFinalWinnerVisible(true);
    }
    setInstantReveal(true);
    setCurrentPage(prize);
  };

  const handleDrawBack = () => {
    setDrawError(null);
    if (animationNext === "final") setCurrentPage("third");
    else if (animationNext === "third") setCurrentPage("fifty");
    else setCurrentPage("week");
  };

  const handleTerminarClick = () => {
    setCurrentPage("fifth");
  };

  const handleRegresarFromFifth = () => {
    setCurrentPage("final");
  };

  const handleRegresarFromFourth = () => {
    setCurrentPage("third");
  };

  useEffect(() => {
    if (currentPage !== "second") return;
    let cancelled = false;
    const started = Date.now();
    const slot: PrizeSlot =
      animationNext === "final" ? "principal" : animationNext === "third" ? "bonus" : "fifty";

    const week = activeWeekRef.current;
    const ready = (async () => {
      if (slot === "fifty") {
        loadParticipants()
          .then(setUserCounts)
          .catch((error) => {
            console.error("Error al leer participantes:", error);
          });
      }
      return requestDraw(slot, week);
    })();

    ready
      .then(async (result) => {
        const remaining = Math.max(0, 9000 - (Date.now() - started));
        await new Promise((resolve) => setTimeout(resolve, remaining));
        if (cancelled) return;
        const saved = drawsByWeek.current[week];
        if (slot === "fifty") {
          saved.fifty = result.winners;
          setFiftyWinners(result.winners);
        } else if (slot === "bonus") {
          saved.third = result.winners;
          saved.bonusName = result.prizeName;
          setWinners(result.winners);
          setBonusPrizeName(result.prizeName);
        } else {
          saved.final = result.winners[0] ?? null;
          saved.finalists = result.winners;
          saved.finalName = result.prizeName;
          setFinalWinner(result.winners[0] ?? null);
          setFinalWinners(result.winners);
          setFinalPrizeName(result.prizeName);
          setFinalWinnerVisible(false);
        }
        setDrawnByWeek((current) => ({
          ...current,
          [week]: { ...current[week], [animationNext]: true },
        }));
        setInstantReveal(false);
        setCurrentPage(animationNext);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setDrawError(
          error instanceof Error ? error.message : "No se pudo realizar el sorteo."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [currentPage, animationNext]);

  useEffect(() => {
    if (currentPage !== "fifty") return;
    if (instantReveal) {
      setVisibleFifty(new Array(fiftyWinners.length).fill(true));
      return;
    }
    setVisibleFifty(new Array(fiftyWinners.length).fill(false));
    const timers: NodeJS.Timeout[] = [];
    fiftyWinners.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleFifty((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, index * 500);
      timers.push(timer);
    });
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [currentPage, fiftyWinners, instantReveal]);

  // Efecto para activar el fade-in de los ganadores en third_page y fifth_page
  useEffect(() => {
    if (currentPage === "fifth") {
      setVisibleWinners(new Array(winners.length).fill(true));
      return;
    }

    if (currentPage === "third") {
      if (instantReveal) {
        setVisibleWinners(new Array(winners.length).fill(true));
        return;
      }
      setVisibleWinners(new Array(winners.length).fill(false));

      const timers: NodeJS.Timeout[] = [];
      winners.forEach((_, index) => {
        const timer = setTimeout(() => {
          setVisibleWinners((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 500);
        timers.push(timer);
      });

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }

    setVisibleWinners(new Array(winners.length).fill(false));
  }, [currentPage, winners, instantReveal]);

  // Efecto para activar el fade-in de los suplentes en fourth_page
  useEffect(() => {
    if (currentPage === "fourth") {
      // Resetear visibilidad
      setVisibleAlternates(new Array(alternates.length).fill(false));
      
      // Activar cada suplente con delay de 200ms
      const timers: NodeJS.Timeout[] = [];
      alternates.forEach((_, index) => {
        const timer = setTimeout(() => {
          setVisibleAlternates((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 200);
        timers.push(timer);
      });

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    } else {
      // Resetear cuando no está en fourth
      setVisibleAlternates(new Array(alternates.length).fill(false));
    }
  }, [currentPage, alternates.length]);

  useEffect(() => {
    if (currentPage !== "week" || userCounts.length > 0) return;
    loadParticipants()
      .then(setUserCounts)
      .catch((error) => {
        console.error("Error al leer participantes:", error);
      });
  }, [currentPage, userCounts.length]);

  // Efecto para mostrar el confetti 4 segundos después de que aparezca second_page
  useEffect(() => {
    if (currentPage === "second") {
      // Resetear visibilidad del confetti
      setShowConfetti(false);
      
      // Mostrar confetti después de 4 segundos
      const timer = setTimeout(() => {
        setShowConfetti(true);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      // Resetear cuando no está en second
      setShowConfetti(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== "final") return;
    setFinalWinnerVisible(false);
    const timer = setTimeout(() => setFinalWinnerVisible(true), 400);
    return () => clearTimeout(timer);
  }, [currentPage]);

  return (
    <div
      className="relative w-screen h-screen min-h-[832px] bg-[#192a44] overflow-hidden"
      data-name="Sorteo"
    >
      {/* Fondo con imagen de Las Vegas */}
      <div className="fixed w-screen h-screen top-0 left-0">
        <img
          alt="Las Vegas background"
          className="w-full h-full object-fit pointer-events-none"
          src={imgLanding1}
        />
      </div>

      {/* Gradiente radial dorado */}
      <div
        className="absolute top-0 left-0 w-screen h-screen pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255, 198, 77, 0.72) 0%, rgba(246, 196, 77, 0.16) 33%, rgba(241, 194, 77, 0.08) 48%, rgba(236, 193, 77, 0) 81%)",
        }}
      ></div>

      <div
        id="first_page"
        className={`absolute inset-0 z-20 h-screen w-screen ${
          currentPage === "first" ? "" : "hidden"
        }`}
      >
        <RouteHome onOpenWeek={handleOpenWeek} />
      </div>
      <div
        id="week_page"
        className={`absolute inset-0 z-20 h-screen w-screen ${
          currentPage === "week" ? "" : "hidden"
        }`}
      >
        <WeekHub
          week={activeWeek}
          drawn={drawnByWeek[activeWeek]}
          onBack={() => setCurrentPage("first")}
          onDraw={handleDrawPrize}
          onViewWinners={handleViewWinners}
          onParticipants={() => setIsTableModalOpen(true)}
        />
      </div>
      <div
        id="second_page"
        className={`absolute inset-0 z-20 h-screen w-screen ${
          currentPage === "second" ? "" : "hidden"
        }`}
      >
        <div className="relative h-full w-full overflow-hidden bg-[#192a44]">
          <img
            src={fondoRuta}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
          />
          <div className="flex h-full w-full items-center justify-center">
            <div className="relative h-[832px] w-[1280px] shrink-0">
              <img
                src={logoPalms}
                alt="Palms Bet"
                className="absolute left-[40px] top-[40px] h-[65px] w-[299px] max-w-none object-cover"
              />
              <div className="absolute left-[90px] top-[122px] flex w-[1100px] flex-col items-center gap-[4px] text-center">
                <p
                  className="m-0 font-urbanist text-[18px] font-bold leading-normal tracking-[2.88px]"
                  style={{
                    background: "linear-gradient(183deg, #ffed87 10%, #ffbe41 92%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {animationNext === "final"
                    ? `SEMANA ${activeWeek} · SORTEO 3 DE 3`
                    : animationNext === "third"
                      ? `SEMANA ${activeWeek} · SORTEO 2 DE 3`
                      : `SEMANA ${activeWeek} · SORTEO 1 DE 3`}
                </p>
                <p
                  className={`m-0 max-w-[1000px] font-urbanist font-black leading-normal ${
                    animationNext === "final" &&
                    getWeek(activeWeek).finalCountdownTitle.length > 12
                      ? "text-[48px]"
                      : "text-[64px]"
                  }`}
                  style={{
                    background: "linear-gradient(187deg, #ffed87 10%, #ffbe41 92%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 10px rgba(255, 216, 105, 0.6))",
                  }}
                >
                  {animationNext === "final"
                    ? getWeek(activeWeek).finalCountdownTitle
                    : animationNext === "third"
                      ? "SORTEO S/ 100"
                      : "SORTEO S/ 50"}
                </p>
                <p className="m-0 font-urbanist text-[24px] font-medium leading-normal text-white [text-shadow:0px_2px_8px_rgba(0,0,0,0.45)]">
                  {animationNext === "final"
                    ? getWeek(activeWeek).finalCountdownDetail
                    : animationNext === "third"
                      ? "10 ganadores · S/ 100 cada uno"
                      : "20 ganadores · S/ 50 cada uno"}
                </p>
              </div>
              <div className="absolute left-[331px] top-[319px] h-[296px] w-[618px] overflow-hidden">
                <img
                  key={spinKey}
                  src={ruletaWheel}
                  alt=""
                  className="pointer-events-none absolute left-1/2 top-1/2 w-[760px] max-w-none -translate-x-1/2 -translate-y-1/2"
                />
              </div>
              {drawError && (
                <div className="absolute bottom-16 left-1/2 z-30 flex w-[640px] -translate-x-1/2 flex-col items-center gap-4 rounded-[16px] bg-[rgba(8,15,26,0.92)] px-8 py-6 text-center">
                  <p className="m-0 font-urbanist text-[22px] font-bold text-white">{drawError}</p>
                  <button
                    onClick={handleDrawBack}
                    className="h-[52px] w-[220px] cursor-pointer rounded-[8px] bg-[#006afa] font-urbanist text-[20px] font-bold text-white"
                  >
                    Volver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        id="fifty_page"
        className={`absolute inset-0 z-20 h-screen w-screen flex items-center justify-center ${
          currentPage === "fifty" ? "" : "hidden"
        }`}
      >
        <div className="flex flex-col gap-[12px] items-center">
          <div className="flex flex-col gap-[4px] items-center">
            <p
              className="font-urbanist font-bold text-[18px] tracking-[2.88px] m-0 leading-normal"
              style={{
                background: "linear-gradient(183deg, #ffed87 10%, #ffbe41 92%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SEMANA {activeWeek} · SORTEO 1 DE 3
            </p>
            <h2
              className="font-urbanist font-black text-[64px] text-center m-0 leading-normal"
              style={{
                background: "linear-gradient(185deg, #ffed87 10%, #ffbe41 92%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 10px rgba(255, 216, 105, 0.6))",
              }}
            >
              GANADORES S/ 50
            </h2>
          </div>
          <WinnersGrid
            winners={fiftyWinners}
            visible={visibleFifty}
            rows={4}
            columns={5}
            prizeLabel="S/ 50"
            compact
            gap={10}
          />
          <button
            type="button"
            onClick={() => setCurrentPage("week")}
            className="flex h-[40px] w-[217px] cursor-pointer items-center justify-center rounded-[32px] bg-[#006afa] px-[12px] font-urbanist text-[16px] font-bold leading-[24px] text-[#f5f5f5] transition-colors hover:bg-[#0056d6]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
      <div
        id="third_page"
        className={`absolute inset-0 z-20 h-screen w-screen flex items-center justify-center ${
          currentPage === "third" ? "" : "hidden"
        }`}
      >
        <div>
          <img src={logoSvg} alt="Logo" className="w-[320px] h-auto mx-auto mb-2" />
          <div className="flex flex-col gap-[4px] items-center">
            <p
              className="font-urbanist font-bold text-[18px] tracking-[2.88px] m-0 leading-normal"
              style={{
                background: "linear-gradient(183deg, #ffed87 10%, #ffbe41 92%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SEMANA {activeWeek} · SORTEO 2 DE 3
            </p>
            <h2
              className="font-urbanist font-black text-[64px] text-center w-full m-0 leading-normal"
              style={{
                background:
                  "linear-gradient(188deg, #ffed87 10%, #ffbe41 92%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 10px rgba(255, 216, 105, 0.6))",
              }}
            >
              GANADORES
            </h2>
            <p className="font-urbanist font-medium text-[28px] text-center w-full m-0 leading-normal text-white">
              {bonusPrizeName || "10 ganadores de S/ 100"}
            </p>
          </div>
          <div className="flex flex-col items-center mt-8">
            <WinnersGrid winners={winners} visible={visibleWinners} />

            <button
              type="button"
              onClick={() => setCurrentPage("week")}
              className="mt-8 flex h-[40px] w-[217px] cursor-pointer items-center justify-center rounded-[32px] bg-[#006afa] px-[12px] font-urbanist text-[16px] font-bold leading-[24px] text-[#f5f5f5] transition-colors hover:bg-[#0056d6]"
            >
              Volver al inicio
            </button>

            
          </div>
        </div>
      </div>

        {/* Modal de tabla de participantes */}
        {isTableModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] px-4"
            onClick={() => setIsTableModalOpen(false)}
          >
            <div
              className="bg-[#0b1220] border-2 border-[#ffce58] border-solid rounded-[20px] shadow-[0px_16px_48px_0px_rgba(0,0,0,0.5)] p-[24px] flex flex-col gap-[16px] w-full max-w-[880px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-[2px]">
                  <h3 className="font-urbanist font-bold text-[28px] text-white m-0 leading-normal">
                    Participantes
                  </h3>
                  <p className="font-urbanist font-normal text-[16px] text-[#a9b3bf] m-0 leading-normal">
                    {userCounts.length.toLocaleString("en-US")} participantes del sorteo · desliza para ver más
                  </p>
                </div>
                <button
                  onClick={() => setIsTableModalOpen(false)}
                  aria-label="Cerrar"
                  className="bg-[rgba(255,255,255,0.1)] rounded-[20px] size-[40px] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <img src={iconX} alt="" />
                </button>
              </div>
              <div className="border border-[rgba(255,255,255,0.12)] border-solid rounded-[12px] w-full overflow-hidden">
                <div className="bg-[rgba(255,206,88,0.12)] flex gap-[16px] items-center px-[16px] py-[12px] font-urbanist font-bold text-[14px] text-[#ffce58] leading-normal">
                  <p className="w-[80px] shrink-0 m-0">N°</p>
                  <p className="flex-1 min-w-0 m-0">USUARIO</p>
                  <p className="w-[200px] shrink-0 text-right m-0">ID</p>
                </div>
                <div
                  className="h-[436px] overflow-y-auto"
                  style={{ scrollbarColor: "rgba(255,255,255,0.25) transparent" }}
                >
                  {userCounts.map((user, index) => (
                    <div
                      key={`${user.username}-${user.code}`}
                      className={`flex gap-[16px] h-[48px] items-center px-[16px] border-b border-[rgba(255,255,255,0.08)] border-solid ${
                        index % 2 === 1 ? "bg-[rgba(255,255,255,0.04)]" : ""
                      }`}
                    >
                      <p className="font-urbanist font-medium text-[16px] text-[#a9b3bf] w-[80px] shrink-0 m-0 truncate">
                        {index + 1}
                      </p>
                      <p className="font-urbanist font-semibold text-[18px] text-white flex-1 min-w-0 m-0 truncate">
                        {user.username}
                      </p>
                      <p className="font-urbanist font-normal text-[16px] text-[#a9b3bf] w-[200px] shrink-0 text-right m-0 truncate">
                        {user.code}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      <div
        id="fourth_page"
        className={`absolute inset-0 z-20 h-screen w-screen flex items-center justify-center ${
          currentPage === "fourth" ? "" : "hidden"
        }`}
      >
        {/* Botón Regresar */}
        <button
          onClick={handleRegresarFromFourth}
          className="absolute left-0 top-0 z-30 ml-20 mt-20 flex gap-[12px] items-center cursor-pointer"
        >
          <div className="bg-[#354865] rounded-[20px] w-[26px] h-[26px] flex items-center justify-center shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-urbanist font-bold text-[16px] text-white whitespace-nowrap">
            Regresar
          </p>
        </button>
        <div>
        <img src={logoSvg} alt="Logo" className="w-[400px] h-auto mx-auto" />
          <p className="font-urbanist font-bold text-[32px] text-center w-full m-0 leading-normal text-white">
            Suplentes
          </p>

          <div className="flex flex-col items-center mt-16">
            {/* Contenedor de suplentes */}
            <div className="bg-[rgba(0,0,0,0.5)] border-[3px] border-[rgba(255,255,255,0.11)] border-solid box-border flex gap-[20px] items-start p-[24px] rounded-[12px] w-[1200px]">
              {/* Columna 1 - Elementos 1-4 */}
              <div className="flex-1 flex flex-col gap-[16px]">
                {alternates.slice(0, 4).map((alternate, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center justify-between border-r border-[rgba(255,255,255,0.11)] pr-[20px] transition-opacity duration-500 ${
                      visibleAlternates[index] ? "opacity-100" : "opacity-0"
                    }`}
                    onMouseEnter={() => setHoveredAlternateIndex(index)}
                    onMouseLeave={() => setHoveredAlternateIndex(null)}
                  >
                    <div className="flex gap-[12px] items-center">
                      <div className="relative w-[32px] h-[32px] shrink-0">
                        <div className="absolute bg-white rounded-full w-full h-full"></div>
                        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-urbanist font-bold text-[#192a44] text-[22px]">
                          {index + 1}
                        </p>
                      </div>
                      <p className="relative font-urbanist font-medium text-[32px] text-white">
                        {truncateUsername(alternate.username)}
                        {/* Tooltip */}
                        {hoveredAlternateIndex === index && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                            <div className="bg-[#080F1A] border border-[rgba(255,255,255,0.11)] rounded-[12px] px-4 py-2 relative">
                              <p className="font-urbanist font-medium text-[30px] text-white text-center whitespace-nowrap">
                                {alternate.username}
                              </p>
                              {/* Cola del tooltip */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#080F1A]"></div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[rgba(255,255,255,0.11)] -mt-[1px]"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </p>
                    </div>
                    <p className="font-urbanist font-normal text-[#a9b3bf] text-[20px] text-right">
                      {alternate.code}
                    </p>
                  </div>
                ))}
              </div>

              {/* Separador vertical */}
              <div className="bg-[rgba(255,255,255,0.11)] w-px h-full shrink-0"></div>

              {/* Columna 2 - Elementos 5-8 */}
              <div className="flex-1 flex flex-col gap-[16px]">
                {alternates.slice(4, 8).map((alternate, index) => {
                  const globalIndex = index + 4;
                  return (
                    <div
                      key={globalIndex}
                      className={`relative flex items-center justify-between border-r border-[rgba(255,255,255,0.11)] pr-[20px] transition-opacity duration-500 ${
                        visibleAlternates[globalIndex] ? "opacity-100" : "opacity-0"
                      }`}
                      onMouseEnter={() => setHoveredAlternateIndex(globalIndex)}
                      onMouseLeave={() => setHoveredAlternateIndex(null)}
                    >
                      <div className="flex gap-[12px] items-center">
                        <div className="relative w-[32px] h-[32px] shrink-0">
                          <div className="absolute bg-white rounded-full w-full h-full"></div>
                          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-urbanist font-bold text-[#192a44] text-[22px]">
                            {index + 5}
                          </p>
                        </div>
                        <p className="relative font-urbanist font-medium text-[32px] text-white">
                          {truncateUsername(alternate.username)}
                          {/* Tooltip */}
                          {hoveredAlternateIndex === globalIndex && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                              <div className="bg-[#080F1A] border border-[rgba(255,255,255,0.11)] rounded-[12px] px-4 py-2 relative">
                                <p className="font-urbanist font-medium text-[30px] text-white text-center whitespace-nowrap">
                                  {alternate.username}
                                </p>
                                {/* Cola del tooltip */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                                  <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#080F1A]"></div>
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[rgba(255,255,255,0.11)] -mt-[1px]"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </p>
                      </div>
                      <p className="font-urbanist font-normal text-[#a9b3bf] text-[20px] text-right">
                        {alternate.code}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Separador vertical */}
              <div className="bg-[rgba(255,255,255,0.11)] w-px h-full shrink-0"></div>

              {/* Columna 3 - Elementos 9-12 */}
              <div className="flex flex-col gap-[16px]">
                {alternates.slice(8, 12).map((alternate, index) => {
                  const globalIndex = index + 8;
                  return (
                    <div
                      key={globalIndex}
                      className={`relative flex items-center justify-between transition-opacity duration-500 ${
                        visibleAlternates[globalIndex] ? "opacity-100" : "opacity-0"
                      }`}
                      onMouseEnter={() => setHoveredAlternateIndex(globalIndex)}
                      onMouseLeave={() => setHoveredAlternateIndex(null)}
                    >
                      <div className="flex gap-[12px] items-center">
                        <div className="relative w-[32px] h-[32px] shrink-0">
                          <div className="absolute bg-white rounded-full w-full h-full"></div>
                          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-urbanist font-bold text-[#192a44] text-[22px]">
                            {index + 9}
                          </p>
                        </div>
                        <p className="relative font-urbanist font-medium text-[32px] text-white">
                          {truncateUsername(alternate.username)}
                          {/* Tooltip */}
                          {hoveredAlternateIndex === globalIndex && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                              <div className="bg-[#080F1A] border border-[rgba(255,255,255,0.11)] rounded-[12px] px-4 py-2 relative">
                                <p className="font-urbanist font-medium text-[30px] text-white text-center whitespace-nowrap">
                                  {alternate.username}
                                </p>
                                {/* Cola del tooltip */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                                  <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#080F1A]"></div>
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[rgba(255,255,255,0.11)] -mt-[1px]"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </p>
                      </div>
                      <p className="font-urbanist font-normal text-[#a9b3bf] text-[20px] text-right">
                        {alternate.code}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botón Terminar */}
            <button
              onClick={handleTerminarClick}
              className="bg-[#006afa] border-2 border-[rgba(255,255,255,0.11)] border-solid box-border flex items-center justify-center px-[16px] py-0 rounded-[8px] mt-24 cursor-pointer transition-all duration-300 hover:bg-[#0056d6] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,106,250,0.4)] active:translate-y-0 w-[340px]"
            >
              <div className="flex flex-col h-[70px] font-urbanist font-bold justify-center leading-[0] relative shrink-0 text-[28px] text-center text-[#f5f5f5] whitespace-nowrap">
                <p className="leading-[normal] whitespace-pre">Terminar</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div
        id="fifth_page"
        className={`absolute inset-0 z-20 h-screen w-screen flex items-center justify-center ${
          currentPage === "fifth" ? "" : "hidden"
        }`}
      >
        <div
          className="absolute top-[38px] right-[90px] z-30 w-[203px] h-[44px]"
          role="img"
          aria-label="palmsbet.pe"
        >
          <img src={palmsbetPalm} alt="" className="absolute left-0 top-0" />
          <img src={palmsbetP} alt="" className="absolute left-[51.21px] top-[15.25px]" />
          <img src={palmsbetA} alt="" className="absolute left-[66.18px] top-[15.25px]" />
          <img src={palmsbetL} alt="" className="absolute left-[81.67px] top-[9.67px]" />
          <img src={palmsbetM} alt="" className="absolute left-[88.84px] top-[15.25px]" />
          <img src={palmsbetS} alt="" className="absolute left-[112.39px] top-[15.25px]" />
          <img src={palmsbetB} alt="" className="absolute left-[126.47px] top-[9.67px]" />
          <img src={palmsbetE} alt="" className="absolute left-[141.58px] top-[15.25px]" />
          <img src={palmsbetT} alt="" className="absolute left-[156.17px] top-[11.59px]" />
          <img src={palmsbetDot} alt="" className="absolute left-[167.43px] top-[26.23px]" />
          <img src={palmsbetP2} alt="" className="absolute left-[174.6px] top-[15.25px]" />
          <img src={palmsbetE2} alt="" className="absolute left-[189.7px] top-[15.25px]" />
        </div>
        {/* Botón Regresar */}
        <button
          onClick={handleRegresarFromFifth}
          className="absolute left-0 top-0 z-30 ml-20 mt-20 flex gap-[12px] items-center cursor-pointer"
        >
          <div className="bg-[#354865] rounded-[20px] w-[26px] h-[26px] flex items-center justify-center shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-urbanist font-bold text-[16px] text-white whitespace-nowrap">
            Regresar
          </p>
        </button>
        <div className="relative z-10 flex flex-col gap-[20px] items-center">
          <p className="font-urbanist font-bold text-[40px] text-center text-white m-0 leading-normal">
            ¡Felicidades a los ganadores!
          </p>
          <div className="bg-[rgba(0,0,0,0.5)] border-4 border-[#ffce58] border-solid rounded-[20px] shadow-[0px_0px_40px_0px_rgba(255,208,92,0.3)] flex gap-[24px] items-center px-[24px] py-[20px]">
            <div className="bg-[rgba(0,0,0,0.35)] border-2 border-dashed border-[#ffce58] rounded-[16px] w-[160px] h-[120px] shrink-0 flex items-center justify-center px-[8px]">
              <p className="font-urbanist font-bold text-[14px] text-center text-white m-0 leading-normal">
                Imagen premio
              </p>
            </div>
            <div className="flex flex-col gap-[4px] items-start min-w-0">
              <p className="font-urbanist font-semibold text-[16px] text-[#ffce58] m-0 leading-normal whitespace-nowrap">
                GANADOR PREMIO FINAL
              </p>
              <p className="font-urbanist font-bold text-[40px] text-white m-0 leading-normal truncate max-w-[520px]">
                {finalWinner?.username ?? "—"}
              </p>
              <p className="font-urbanist font-normal text-[20px] text-[#a9b3bf] m-0 leading-normal">
                {finalWinner?.code ?? "--------"}
              </p>
              <div className="bg-[rgba(255,206,88,0.15)] border border-[#ffce58] border-solid rounded-full px-[12px] py-[4px]">
                <p className="font-urbanist font-bold text-[18px] text-[#ffce58] m-0 leading-normal whitespace-nowrap">
                  {finalPrizeName || FINAL_PRIZE_LABEL}
                </p>
              </div>
            </div>
          </div>
          <p className="font-urbanist font-bold text-[24px] text-center text-white m-0 leading-normal">
            {bonusPrizeName ? `Ganadores de ${bonusPrizeName}` : "Ganadores de S/ 100"}
          </p>
          <WinnersGrid winners={winners} visible={visibleWinners} />
        </div>
      </div>
      <div
        id="final_page"
        className={`absolute inset-0 z-20 h-screen w-screen ${
          currentPage === "final" ? "" : "hidden"
        }`}
      >
        <div className="relative h-full w-full overflow-hidden bg-[#192a44]">
          <img
            src={fondoRuta}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
          />
          <div className="flex h-full w-full items-center justify-center">
            <div className="relative h-[832px] w-[1280px] shrink-0">
              <img
                src={confetti}
                alt=""
                className="pointer-events-none absolute left-0 top-0 h-[720px] w-[1280px] max-w-none object-cover"
              />
              <img
                src={logoPalms}
                alt="Palms Bet"
                className="absolute left-[40px] top-[40px] h-[65px] w-[299px] max-w-none object-cover"
              />
              <div
                className={`absolute left-[90px] flex w-[1100px] -translate-y-1/2 flex-col items-center ${
                  activeWeek === 4
                    ? "top-[calc(50%-20px)] gap-[56px]"
                    : "top-1/2 gap-[72px]"
                }`}
              >
                <div className="flex flex-col items-center gap-[4px]">
                  <p
                    className="m-0 font-urbanist text-[18px] font-bold leading-normal tracking-[2.88px]"
                    style={{
                      background: "linear-gradient(183deg, #ffed87 10%, #ffbe41 92%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    SEMANA {activeWeek} · SORTEO 3 DE 3
                  </p>
                  <h2
                    className="m-0 font-urbanist text-[64px] font-black leading-normal"
                    style={{
                      background: "linear-gradient(187deg, #ffed87 10%, #ffbe41 92%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(0 0 10px rgba(255, 216, 105, 0.6))",
                    }}
                  >
                    PREMIO FINAL
                  </h2>
                  {activeWeek === 4 && (
                    <p className="m-0 font-urbanist text-[24px] font-medium leading-normal text-white [text-shadow:0px_2px_8px_rgba(0,0,0,0.45)]">
                      4 ganadores · S/ 5,000 cada uno
                    </p>
                  )}
                </div>
                <div
                  className={`flex items-center gap-[32px] transition-opacity duration-500 ${
                    finalWinnerVisible ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={getWeek(activeWeek).finalImage}
                    alt=""
                    className="h-[300px] w-[300px] max-w-none object-cover"
                  />
                  {activeWeek === 4 ? (
                    <div className="flex flex-col gap-[16px]">
                      {[0, 1].map((row) => (
                        <div key={row} className="flex gap-[16px]">
                          {[0, 1].map((column) => {
                            const index = row * 2 + column;
                            const winner = finalWinners[index];
                            return (
                              <div
                                key={index}
                                className="flex h-[142px] w-[296px] shrink-0 flex-col items-start justify-center gap-[4px] overflow-hidden rounded-[20px] border-4 border-solid border-[#ffce58] bg-[rgba(0,0,0,0.5)] px-[24px] py-[16px] shadow-[0px_0px_40px_0px_rgba(255,208,92,0.3)]"
                              >
                                <p className="m-0 shrink-0 font-urbanist text-[14px] font-semibold leading-[normal] text-[#ffce58]">
                                  GANADOR {index + 1}
                                </p>
                                <p className="m-0 max-w-full shrink-0 truncate font-urbanist text-[28px] font-bold leading-[normal] text-white">
                                  {winner?.username ?? "—"}
                                </p>
                                <p className="m-0 shrink-0 font-urbanist text-[16px] font-normal leading-[normal] text-[#a9b3bf]">
                                  {winner?.code ?? "--------"}
                                </p>
                                <div className="shrink-0 rounded-full border border-solid border-[#ffce58] bg-[rgba(255,206,88,0.15)] px-[12px] py-[4px]">
                                  <p className="m-0 whitespace-nowrap font-urbanist text-[16px] font-bold leading-[normal] text-[#ffce58]">
                                    S/ 5,000
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-[300px] w-[480px] shrink-0 flex-col items-start justify-center gap-[12px] overflow-hidden rounded-[20px] border-4 border-solid border-[#ffce58] bg-[rgba(0,0,0,0.5)] px-[32px] shadow-[0px_0px_40px_0px_rgba(255,208,92,0.3)]">
                      <p className="m-0 font-urbanist text-[20px] font-semibold leading-normal text-[#ffce58]">
                        GANADOR
                      </p>
                      <p className="m-0 max-w-full truncate font-urbanist text-[48px] font-bold leading-normal text-white">
                        {finalWinner?.username ?? "—"}
                      </p>
                      <p className="m-0 font-urbanist text-[24px] font-normal leading-normal text-[#a9b3bf]">
                        {finalWinner?.code ?? "--------"}
                      </p>
                      <div className="rounded-full border border-solid border-[#ffce58] bg-[rgba(255,206,88,0.15)] px-[12px] py-[4px]">
                        <p className="m-0 whitespace-nowrap font-urbanist text-[20px] font-bold leading-normal text-[#ffce58]">
                          {activeWeek === 1
                            ? finalPrizeName || FINAL_PRIZE_LABEL
                            : getWeek(activeWeek).finalPrizeLabel}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage("week")}
                  className="flex h-[40px] w-[217px] cursor-pointer items-center justify-center rounded-[32px] bg-[#006afa] px-[12px] font-urbanist text-[16px] font-bold leading-[24px] text-[#f5f5f5] transition-colors hover:bg-[#0056d6]"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
