import React from "react";
import fondo from "../images/ruta/fondo.png";
import logoSemana from "../images/ruta/logo-semana.png";
import pillSemana from "../images/ruta/pill-semana.png";
import iconChevron from "../images/ruta/icon-chevron-left.svg";
import iconCheck from "../images/ruta/icon-check.svg";
import { getWeek, prizeUnlocked, type WeekNumber, type WeekPrizeId } from "../lib/weeks";

export type { WeekPrizeId };

function BackToRoute({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-[40px] top-[40px] flex h-[40px] items-center justify-center gap-[8px] rounded-[32px] border border-white/20 bg-white/[0.11] px-[12px] font-urbanist text-[16px] font-bold leading-[24px] text-[#f5f5f5]"
    >
      <img src={iconChevron} alt="" width={20} height={20} />
      Volver a la ruta
    </button>
  );
}

const WeekHub: React.FC<{
  week: WeekNumber;
  drawn: Record<WeekPrizeId, boolean>;
  onBack: () => void;
  onDraw: (prize: WeekPrizeId) => void;
  onViewWinners: (prize: WeekPrizeId) => void;
  onParticipants: () => void;
}> = ({ week, drawn, onBack, onDraw, onViewWinners, onParticipants }) => {
  const config = getWeek(week);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#192a44]">
      <img
        src={fondo}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
      />
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative h-[832px] w-[1280px] shrink-0">
          <BackToRoute onClick={onBack} />
          <img
            src={logoSemana}
            alt="Palms Bet presenta La Ruta Palms"
            className="pointer-events-none absolute left-[540px] top-[24px] h-[125px] w-[200px] max-w-none object-cover"
          />
          <div className="pointer-events-none absolute left-[538px] top-[153px] h-[59px] w-[203px]">
            <img src={pillSemana} alt="" className="h-full w-full max-w-none object-cover" />
            <p className="absolute left-1/2 top-[12px] m-0 -translate-x-1/2 whitespace-nowrap font-urbanist text-[30px] font-black leading-normal text-white">
              {config.label}
            </p>
          </div>
          {config.prizes.map((prize) => {
            const unlocked = prizeUnlocked(drawn, prize.id);
            const lockedClass = unlocked ? "" : "opacity-40";
            return (
              <React.Fragment key={prize.id}>
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() =>
                    drawn[prize.id] ? onViewWinners(prize.id) : onDraw(prize.id)
                  }
                  aria-label={
                    unlocked
                      ? drawn[prize.id]
                        ? `Ver ganadores de ${prize.title}`
                        : `Sortear ${prize.title}`
                      : `${prize.title} bloqueado hasta sortear el premio anterior`
                  }
                  className={`absolute border-0 bg-transparent p-0 ${
                    unlocked ? "cursor-pointer" : `cursor-not-allowed ${lockedClass}`
                  }`}
                  style={{ left: prize.iconLeft, top: 287, width: 230, height: 230 }}
                >
                  <img
                    src={prize.image}
                    alt=""
                    className="h-[230px] w-[230px] max-w-none object-cover"
                  />
                </button>
                {drawn[prize.id] && (
                  <div
                    className={`pointer-events-none absolute flex h-[28px] items-center gap-[4px] rounded-[21px] bg-[#e9ffea] px-[8px] py-[2px] ${lockedClass}`}
                    style={{ left: prize.tagLeft, top: 287 }}
                  >
                    <img src={iconCheck} alt="" width={14} height={14} />
                    <span className="font-urbanist text-[16px] font-semibold leading-none text-[#4caf50]">
                      Sorteado
                    </span>
                  </div>
                )}
                <div
                  className={`pointer-events-none absolute h-[71px] w-[243px] ${lockedClass}`}
                  style={{ left: prize.pillLeft, top: 487 }}
                >
                  <img src={pillSemana} alt="" className="h-full w-full max-w-none object-cover" />
                  <p
                    className="absolute top-[21px] m-0 -translate-x-1/2 whitespace-nowrap font-urbanist text-[24px] font-black leading-normal text-white"
                    style={{ left: prize.labelLeft - prize.pillLeft }}
                  >
                    {prize.badge}
                  </p>
                </div>
                <div
                  className={`pointer-events-none absolute -translate-x-1/2 text-center ${lockedClass}`}
                  style={{
                    left: prize.labelLeft,
                    top: 561,
                    width: prize.titleWidth,
                  }}
                >
                  <p
                    className={`m-0 font-urbanist text-[44px] font-black leading-[53px] text-white [text-shadow:0px_2px_8px_rgba(0,0,0,0.7)] ${
                      prize.titleWidth ? "" : "whitespace-nowrap"
                    }`}
                  >
                    {prize.title}
                  </p>
                  {prize.subtitle && (
                    <p className="m-0 mt-[4px] whitespace-nowrap font-urbanist text-[14px] font-bold leading-normal text-white [text-shadow:0px_2px_8px_rgba(0,0,0,0.7)]">
                      {prize.subtitle}
                    </p>
                  )}
                </div>
                {drawn[prize.id] && (
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onViewWinners(prize.id)}
                    className={`absolute flex h-[40px] w-[182px] items-center justify-center rounded-[32px] border border-white/20 bg-white/[0.11] font-urbanist text-[16px] font-bold leading-[24px] text-[#f5f5f5] ${
                      unlocked ? "cursor-pointer" : `cursor-not-allowed ${lockedClass}`
                    }`}
                    style={{ left: prize.buttonLeft, top: prize.buttonTop }}
                  >
                    VER GANADORES
                  </button>
                )}
              </React.Fragment>
            );
          })}
          <button
            type="button"
            onClick={onParticipants}
            className="absolute top-[732px] left-1/2 m-0 -translate-x-1/2 cursor-pointer border-0 bg-transparent font-urbanist text-[20px] font-semibold text-white underline"
          >
            Ver participantes
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeekHub;
