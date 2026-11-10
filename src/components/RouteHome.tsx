import React from "react";
import fondo from "../images/ruta/fondo.png";
import logoPalms from "../images/ruta/logo-palms.png";
import logoRuta from "../images/ruta/logo-ruta.png";
import regaloS1 from "../images/ruta/regalo-s1.png";
import regaloS2 from "../images/ruta/regalo-s2.png";
import regaloS2Premio from "../images/ruta/regalo-s2-premio.png";
import regaloS3 from "../images/ruta/regalo-s3.png";
import regaloS3Premio from "../images/ruta/regalo-s3-premio.png";
import regaloS4 from "../images/ruta/regalo-s4.png";
import regaloS4Premio from "../images/ruta/regalo-s4-premio.png";
import pillSemana from "../images/ruta/pill-semana.png";
import barraSemana from "../images/ruta/barra-semana.png";
import type { WeekNumber } from "../lib/weeks";

type WeekCard = {
  week: WeekNumber;
  label: string;
  title: string;
  subtitle?: string;
  frame: string;
  prize?: string;
  badge: string;
  left: number;
  top: number;
  size: number;
  badgeLeft: number;
  badgeTop: number;
  badgeWidth: number;
  badgeHeight: number;
};

const weeks: WeekCard[] = [
  {
    week: 1,
    label: "SEMANA 1",
    title: "PlayStation 5",
    subtitle: "+ GTA 5",
    frame: regaloS1,
    badge: pillSemana,
    left: 627,
    top: 101,
    size: 218,
    badgeLeft: 648,
    badgeTop: 269,
    badgeWidth: 176,
    badgeHeight: 51,
  },
  {
    week: 2,
    label: "SEMANA 2",
    title: "Galaxy Tab S11 Ultra",
    subtitle: "256GB",
    frame: regaloS2,
    prize: regaloS2Premio,
    badge: barraSemana,
    left: 945,
    top: 115,
    size: 190,
    badgeLeft: 954,
    badgeTop: 270,
    badgeWidth: 172,
    badgeHeight: 50,
  },
  {
    week: 3,
    label: "SEMANA 3",
    title: "iPhone 18 Pro Max",
    frame: regaloS3,
    prize: regaloS3Premio,
    badge: pillSemana,
    left: 640,
    top: 453,
    size: 190,
    badgeLeft: 647,
    badgeTop: 607,
    badgeWidth: 176,
    badgeHeight: 51,
  },
  {
    week: 4,
    label: "SEMANA 4",
    title: "S/20,000",
    subtitle: "4 GANADORES",
    frame: regaloS4,
    prize: regaloS4Premio,
    badge: pillSemana,
    left: 950,
    top: 453,
    size: 190,
    badgeLeft: 957,
    badgeTop: 607,
    badgeWidth: 176,
    badgeHeight: 51,
  },
];

function WeekButton({
  week,
  onClick,
}: {
  week: WeekCard;
  onClick?: () => void;
}) {
  const center = week.left + week.size / 2;
  const caption = [week.title, week.subtitle].filter(Boolean).join(", ");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${week.label}, ${caption}`}
      className="group absolute cursor-pointer border-0 bg-transparent p-0 transition-transform duration-300 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffce58]"
      style={{
        left: week.left,
        top: week.top,
        width: week.size,
        height: week.badgeTop - week.top + week.badgeHeight + 78,
        transformOrigin: "center top",
      }}
    >
      <img
        src={week.frame}
        alt=""
        className="pointer-events-none absolute left-0 top-0 max-w-none object-cover"
        style={{ width: week.size, height: week.size }}
      />
      {week.prize && (
        <img
          src={week.prize}
          alt=""
          className="pointer-events-none absolute left-0 top-0 max-w-none object-cover opacity-100 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
          style={{ width: week.size, height: week.size }}
        />
      )}
      <img
        src={week.badge}
        alt=""
        className="pointer-events-none absolute max-w-none object-cover"
        style={{
          left: week.badgeLeft - week.left,
          top: week.badgeTop - week.top,
          width: week.badgeWidth,
          height: week.badgeHeight,
        }}
      />
      <p
        className="pointer-events-none absolute m-0 -translate-x-1/2 whitespace-nowrap text-center font-urbanist text-[20px] font-black leading-normal text-white"
        style={{ left: center - week.left, top: week.badgeTop - week.top + 14 }}
      >
        {week.label}
      </p>
      <div
        className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center gap-[4px] text-center"
        style={{ left: center - week.left, top: week.badgeTop - week.top + week.badgeHeight + 3 }}
      >
        <p className="m-0 whitespace-nowrap font-urbanist text-[24px] font-black leading-normal text-white [text-shadow:0px_2px_8px_rgba(0,0,0,0.7)]">
          {week.title}
        </p>
        {week.subtitle && (
          <p className="m-0 whitespace-nowrap font-urbanist text-[14px] font-bold leading-normal text-white/85">
            {week.subtitle}
          </p>
        )}
      </div>
    </button>
  );
}

const RouteHome: React.FC<{ onOpenWeek: (week: WeekNumber) => void }> = ({ onOpenWeek }) => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#192a44]">
      <img
        src={fondo}
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
        <img
          src={logoRuta}
          alt="La Ruta Palms. Juega, acumula opciones diarias y gana cada semana"
          className="absolute left-[40px] top-[196px] h-[440px] w-[447px] max-w-none object-cover"
        />
        {weeks.map((week) => (
          <WeekButton
            key={week.label}
            week={week}
            onClick={() => onOpenWeek(week.week)}
          />
        ))}
      </div>
      </div>
    </div>
  );
};

export default RouteHome;
