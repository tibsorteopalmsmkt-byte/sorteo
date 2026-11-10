import regalo50 from "../images/ruta/regalo-50.png";
import regalo100 from "../images/ruta/regalo-100.png";
import regaloPs5 from "../images/ruta/regalo-ps5.png";
import regaloS1 from "../images/ruta/regalo-s1.png";
import regaloS2 from "../images/ruta/regalo-s2.png";
import regaloS3 from "../images/ruta/regalo-s3.png";
import regaloS4 from "../images/ruta/regalo-s4.png";

export type WeekNumber = 1 | 2 | 3 | 4;
export type WeekPrizeId = "fifty" | "third" | "final";

export type WeekPrize = {
  id: WeekPrizeId;
  image: string;
  badge: string;
  title: string;
  subtitle?: string;
  titleWidth?: number;
  iconLeft: number;
  pillLeft: number;
  labelLeft: number;
  buttonLeft: number;
  tagLeft: number;
  buttonTop: number;
};

export type WeekConfig = {
  week: WeekNumber;
  label: string;
  finalCountdownTitle: string;
  finalCountdownDetail: string;
  finalImage: string;
  finalPrizeLabel: string;
  prizes: WeekPrize[];
};

const fiftyPrize: WeekPrize = {
  id: "fifty",
  image: regalo50,
  badge: "20 GANADORES",
  title: "S/50",
  iconLeft: 166,
  pillLeft: 158,
  labelLeft: 281,
  buttonLeft: 190,
  tagLeft: 295,
  buttonTop: 628,
};

const hundredPrize: WeekPrize = {
  id: "third",
  image: regalo100,
  badge: "10 GANADORES",
  title: "S/ 100",
  iconLeft: 525,
  pillLeft: 517,
  labelLeft: 640,
  buttonLeft: 549,
  tagLeft: 654,
  buttonTop: 628,
};

function finalPrize(
  prize: Pick<WeekPrize, "image" | "badge" | "title"> &
    Partial<Pick<WeekPrize, "subtitle" | "titleWidth" | "buttonTop">>
): WeekPrize {
  return {
    id: "final",
    iconLeft: 884,
    pillLeft: 876,
    labelLeft: 999.5,
    buttonLeft: 908,
    tagLeft: 1013,
    buttonTop: 628,
    ...prize,
  };
}

export const weeks: Record<WeekNumber, WeekConfig> = {
  1: {
    week: 1,
    label: "SEMANA 1",
    finalCountdownTitle: "PS5 + GTA5",
    finalCountdownDetail: "1 ganador",
    finalImage: regaloS1,
    finalPrizeLabel: "PlayStation 5 + GTA 5",
    prizes: [
      fiftyPrize,
      hundredPrize,
      finalPrize({
        image: regaloPs5,
        badge: "1 GANADOR",
        title: "PS5 + GTA5",
      }),
    ],
  },
  2: {
    week: 2,
    label: "SEMANA 2",
    finalCountdownTitle: "Galaxy Tab S11 Ultra",
    finalCountdownDetail: "1 ganador",
    finalImage: regaloS2,
    finalPrizeLabel: "Galaxy Tab S11 Ultra",
    prizes: [
      fiftyPrize,
      hundredPrize,
      finalPrize({
        image: regaloS2,
        badge: "1 GANADOR",
        title: "Galaxy Tab S11 Ultra",
        titleWidth: 240,
        buttonTop: 681,
      }),
    ],
  },
  3: {
    week: 3,
    label: "SEMANA 3",
    finalCountdownTitle: "iPhone 18 Pro Max",
    finalCountdownDetail: "1 ganador",
    finalImage: regaloS3,
    finalPrizeLabel: "iPhone 18 Pro Max",
    prizes: [
      fiftyPrize,
      hundredPrize,
      finalPrize({
        image: regaloS3,
        badge: "1 GANADOR",
        title: "iPhone 18 Pro Max",
        titleWidth: 200,
        buttonTop: 681,
      }),
    ],
  },
  4: {
    week: 4,
    label: "SEMANA 4",
    finalCountdownTitle: "S/20,000",
    finalCountdownDetail: "4 ganadores · S/ 5,000 cada uno",
    finalImage: regaloS4,
    finalPrizeLabel: "S/ 5,000",
    prizes: [
      fiftyPrize,
      hundredPrize,
      finalPrize({
        image: regaloS4,
        badge: "4 GANADORES",
        title: "S/20,000",
        subtitle: "4 Ganadores de S/5000",
        buttonTop: 681,
      }),
    ],
  },
};

export function getWeek(week: WeekNumber): WeekConfig {
  return weeks[week];
}
