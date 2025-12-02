import React, { useState, useEffect } from "react";
import Papa from "papaparse";

import imgLanding1 from "../images/bg-vegas.png";
import slotMachine from "../images/slot-machine.svg";
import palmsBetLogo from "../images/palms_bet_logo.svg";

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

const IndexPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<
    "first" | "second" | "third" | "fourth" | "fifth"
  >("first");

  // Datos de ganadores (4 ganadores) - se actualizarán desde el CSV
  const [winners, setWinners] = useState<Winner[]>([
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
    { username: "leon1989", code: "60582345" },
  ]);

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

  const handleStartClick = () => {
    setCurrentPage("second");
  };

  const handleVerSuplentesClick = () => {
    setCurrentPage("fourth");
  };

  const handleTerminarClick = () => {
    setCurrentPage("fifth");
  };

  const handleRegresarFromFifth = () => {
    setCurrentPage("fourth");
  };

  const handleRegresarFromFourth = () => {
    setCurrentPage("third");
  };

  // Función para seleccionar elementos aleatorios de un array
  const getRandomElements = <T,>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Efecto para leer y procesar el CSV cuando estamos en second_page
  useEffect(() => {
    if (currentPage === "second") {
      // Leer el CSV
      fetch("/sorteo_users.csv")
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse<CSVRow>(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const rows = results.data.filter(
                (row) => row["Player Login"] && row["Player ID"]
              );

              // Contar cuántas veces aparece cada usuario
              const userCountMap = new Map<string, { code: string; count: number }>();

              rows.forEach((row) => {
                const username = row["Player Login"].trim();
                const code = row["Player ID"].trim();

                if (username && code) {
                  if (userCountMap.has(username)) {
                    userCountMap.get(username)!.count++;
                  } else {
                    userCountMap.set(username, { code, count: 1 });
                  }
                }
              });

              // Crear array de usuarios únicos con sus conteos
              const userCountsArray: UserCount[] = Array.from(userCountMap.entries()).map(
                ([username, data]) => ({
                  username,
                  code: data.code,
                  count: data.count,
                })
              );

              setUserCounts(userCountsArray);

              // Seleccionar 4 ganadores únicos aleatoriamente
              const selectedWinners = getRandomElements(userCountsArray, 4);
              const winnersData: Winner[] = selectedWinners.map((user) => ({
                username: user.username,
                code: user.code,
              }));

              setWinners(winnersData);

              // Seleccionar 12 suplentes únicos que NO sean ganadores
              const winnerUsernames = new Set(selectedWinners.map((w) => w.username));
              const availableAlternates = userCountsArray.filter(
                (user) => !winnerUsernames.has(user.username)
              );

              const selectedAlternates = getRandomElements(availableAlternates, 12);
              const alternatesData: Winner[] = selectedAlternates.map((user) => ({
                username: user.username,
                code: user.code,
              }));

              setAlternates(alternatesData);
            },
            error: (error: Error) => {
              console.error("Error al parsear CSV:", error);
            },
          });
        })
        .catch((error) => {
          console.error("Error al leer CSV:", error);
        });

      // Después de 2 segundos, cambiar a third_page
      const timer = setTimeout(() => {
        setCurrentPage("third");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  // Efecto para activar el fade-in de los ganadores en third_page y fifth_page
  useEffect(() => {
    if (currentPage === "third" || currentPage === "fifth") {
      // Resetear visibilidad
      setVisibleWinners(new Array(winners.length).fill(false));
      
      // Activar cada ganador con delay de 500ms
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
    } else {
      // Resetear cuando no está en third o fifth
      setVisibleWinners(new Array(winners.length).fill(false));
    }
  }, [currentPage, winners]);

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
        className={`absolute inset-0 z-20 h-screen w-screen flex items-center justify-center ${
          currentPage === "first" ? "" : "hidden"
        }`}
      >
        <div className="absolute left-0 top-0 z-10 ml-20 mt-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="211"
            height="86"
            viewBox="0 0 211 86"
            fill="none"
          >
            <g filter="url(#filter0_dddddd_1_315)">
              <path
                d="M66.5952 48.0326C66.5046 48.3891 66.3236 48.3891 66.2331 47.9434C65.871 46.0715 64.6941 44.0213 61.8878 43.0408C61.7974 43.0408 61.7069 43.1299 61.7069 43.219C61.9783 43.6647 62.3405 44.467 62.3405 45.5367C62.25 48.0326 60.9826 49.548 60.3489 50.172C60.1679 50.3502 59.9869 50.2611 60.0774 49.9937C60.1679 46.9628 57.4521 45.6258 56.9995 43.9321C56.909 43.7538 56.8185 43.7538 56.728 44.0213C55.189 54.9854 46.6796 68.8913 29.1179 61.8493C28.9369 61.7602 28.8463 61.671 29.2084 61.671C48.3091 62.5625 47.2229 44.5562 36.36 36.8009C36.2693 36.7118 36.0883 36.7118 36.0883 36.89C35.9978 39.5643 33.282 40.5448 35.9978 46.0715C36.0883 46.1606 35.9978 46.2498 35.9072 46.2498C30.1136 45.1801 28.4843 40.9906 29.0274 37.6923C29.0274 37.6032 28.9369 37.5141 28.8463 37.6032C25.3159 40.4557 24.7728 44.1104 27.1263 47.8543C27.2168 47.9434 27.0358 48.1217 26.9454 48.0326C19.8844 43.1299 22.057 34.9289 25.5875 32.968C28.6653 31.1851 30.6569 32.5222 30.9283 32.7005C31.1095 32.7896 31.2905 32.6114 31.1095 32.4331C30.7474 31.3633 29.8421 29.4915 30.5664 27.6195C33.1011 20.5774 44.2356 21.0231 47.8565 25.6584C47.9471 25.7475 47.8565 25.9259 47.6755 25.8366C41.2482 24.0539 36.0883 28.7783 35.2736 29.4915C34.9115 29.7588 35.002 29.9372 35.4546 29.7588C42.8776 27.9761 44.0545 33.2353 47.9471 33.2353C48.2186 33.2353 48.3091 33.4135 48.0376 33.5919C43.5114 37.0684 38.804 35.9094 37.5367 35.2855C37.1745 35.1073 37.0841 35.3746 37.4462 35.6421C52.4732 46.3389 45.4123 60.0666 41.4293 60.9578C50.0292 58.8185 53.7407 49.8154 55.2795 44.0213C55.37 43.7538 55.2795 43.7538 55.0985 43.9321C54.4648 44.5562 53.6501 45.6258 53.4691 45.804C51.387 47.7651 49.2145 47.676 48.2186 47.4978C47.9471 47.4085 47.8565 47.3194 48.1281 47.1412C50.8439 45.6258 50.2102 41.2579 53.288 40.634C53.4691 40.634 53.4691 40.4557 53.3786 40.3665C52.8353 39.7425 49.6671 38.762 46.8608 41.0797C46.6796 41.2579 46.4987 41.1688 46.5892 40.9013C46.6796 40.01 47.0418 37.9598 49.6671 36.7118C52.2922 35.4639 54.7364 36.0878 56.2754 37.7814C57.2711 38.9402 57.2711 39.9208 57.2711 40.1882C57.3616 40.4557 57.5427 40.4557 57.7237 40.3665C58.1763 40.0991 58.9006 39.5643 59.9869 39.2968C63.9699 38.4946 67.9531 43.9321 66.5952 48.0326Z"
                fill="url(#paint0_linear_1_315)"
              />
            </g>
            <path
              d="M80.628 56.4369H73.7345C73.4823 56.4369 72.978 56.4369 72.978 55.989C72.978 55.8098 73.062 55.5412 73.3982 55.5412C73.4823 55.5412 73.5664 55.5412 73.7345 55.5412C74.0708 55.5412 74.3231 55.4516 74.5752 55.4516C75.0795 55.3619 75.584 55.2724 75.584 53.4807V39.8647C75.584 34.4003 75.584 33.415 75.4999 32.34C75.4158 31.0859 75.1637 30.7275 74.239 30.5484C73.9868 30.4588 73.5664 30.4588 73.2302 30.4588C72.8939 30.4588 72.8098 30.1902 72.8098 30.0109C72.8098 29.5631 73.2302 29.5631 73.4823 29.5631H81.3005C85.5037 29.5631 87.0169 31.0859 87.5213 31.6234C88.362 32.5191 89.2027 34.1316 89.2027 35.9232C89.2027 40.9397 85.756 44.4332 80.8801 44.4332C80.796 44.4332 80.4598 44.4332 80.2076 44.4332C80.0395 44.4332 79.7033 44.3437 79.7033 43.9853C79.7033 43.4479 80.1235 43.4479 80.796 43.4479C83.9065 43.4479 86.2603 41.0293 86.2603 37.894C86.2603 37.0878 86.2603 34.5796 84.4949 32.6087C83.0659 31.0859 81.5526 30.9068 80.4598 30.9068C80.3758 30.9068 80.2917 30.9068 80.2917 30.9068H80.1235C79.5351 30.9068 79.0307 30.9963 78.7784 31.0859C78.6104 31.1754 78.6104 31.3546 78.6104 31.5338V53.3016C78.6104 55.0932 78.8625 55.0932 79.7033 55.2723C80.0395 55.3619 80.2076 55.3619 80.4598 55.3619L80.7121 55.4516C81.0483 55.5412 81.1323 55.7203 81.1323 55.8994C81.2164 56.3474 80.8801 56.4369 80.628 56.4369Z"
              fill="white"
            />
            <path
              d="M104.905 54.0105H100.07C99.8974 54.0105 99.552 54.0105 99.552 53.6561C99.552 53.479 99.552 53.3904 99.6384 53.3904C99.7247 53.2131 99.9837 53.2131 100.243 53.2131C100.329 53.2131 100.415 53.2131 100.502 53.2131C100.502 53.2131 100.588 53.1246 100.502 52.9474L98.3433 47.5427H92.8179C92.8179 47.5427 92.8179 47.5427 92.7315 47.6313C92.7315 47.6313 91.6092 50.821 91.3502 51.4412C91.0912 52.0613 91.0049 52.593 91.0049 52.9474C91.0049 53.3018 91.4366 53.3904 91.6092 53.3904H91.8682C92.1272 53.3904 92.2999 53.5676 92.2999 53.7448C92.2999 53.8333 92.2136 54.0992 91.7819 54.0992H87.4652C87.2925 54.0992 86.8608 54.0992 86.8608 53.7448C86.8608 53.5676 87.0335 53.3904 87.2062 53.3904C87.2925 53.3904 87.3788 53.3904 87.4652 53.3904C87.5515 53.3904 87.5515 53.3904 87.6378 53.3904C88.5875 53.3018 89.0191 52.593 89.5371 51.3525L95.149 36.4676C95.408 35.7587 95.5806 35.4043 95.926 35.4043C96.2713 35.4043 96.3576 35.6701 96.5303 36.1132C96.5303 36.2017 96.6166 36.2904 96.6166 36.3789C96.7893 36.9105 97.8253 39.3914 99.0341 42.4038C100.243 45.5048 101.624 48.9602 102.401 50.821C103.264 52.9474 103.869 53.2131 104.3 53.3018C104.646 53.3904 104.905 53.3904 105.077 53.3904C105.336 53.3904 105.595 53.5676 105.595 53.8333C105.595 53.8333 105.423 54.0105 104.905 54.0105ZM93.2495 45.9479H97.8253L95.4943 39.5686C95.4943 39.5686 95.4943 39.5686 95.4943 39.4799C95.4943 39.4799 95.4943 39.4799 95.4943 39.5686C95.408 39.8343 93.5949 45.1504 93.2495 45.9479Z"
              fill="white"
            />
            <path
              d="M116.37 54.0992H107.441C106.935 54.0992 106.935 53.8295 106.935 53.6498C106.935 53.4701 107.104 53.2902 107.356 53.2902C107.609 53.2902 107.777 53.2003 108.03 53.2003C108.367 53.1105 108.367 52.8409 108.451 52.1218V52.0319C108.62 51.0432 108.62 49.1558 108.62 46.819V42.5946C108.62 38.8197 108.62 38.1905 108.536 37.4715C108.451 36.6625 108.367 36.393 107.777 36.3031C107.019 36.2133 106.851 36.2133 106.767 35.8537C106.767 35.7638 106.767 35.674 106.851 35.5841C106.935 35.4941 107.188 35.4043 107.356 35.4043H112.242C112.495 35.4043 112.663 35.4941 112.748 35.5841C112.832 35.674 112.832 35.7638 112.832 35.8537C112.832 36.2133 112.579 36.2133 111.821 36.3031C111.316 36.393 111.147 36.5727 111.147 37.4715C111.147 38.1905 111.147 38.9097 111.147 42.5946V46.9088C111.147 49.8748 111.147 51.7624 111.568 52.2118C111.905 52.5712 112.832 52.7509 114.517 52.7509C115.78 52.7509 116.707 52.6611 117.212 52.1218C117.465 51.8522 117.633 51.3129 117.718 50.8635C117.802 50.5939 117.97 50.4141 118.139 50.4141C118.307 50.4141 118.476 50.5039 118.476 50.9534C118.476 51.2231 118.307 52.6611 118.139 53.3802C117.802 54.0093 117.633 54.0992 116.37 54.0992Z"
              fill="white"
            />
            <path
              d="M124.773 54.0992H120.255C119.82 54.0992 119.646 53.9227 119.646 53.6582C119.646 53.4819 119.733 53.3055 120.081 53.3055C120.255 53.3055 120.429 53.3055 120.776 53.2174C121.384 53.1292 121.471 52.6001 121.558 51.7182V51.4537L123.383 36.0215C123.383 35.6688 123.643 35.4043 123.904 35.4043C124.078 35.4043 124.425 35.4925 124.599 35.8452L132.158 50.2191L139.37 35.9335C139.457 35.757 139.631 35.4043 139.978 35.4043C140.152 35.4043 140.5 35.4925 140.586 36.198L142.498 52.4237C142.585 52.9527 142.585 53.0409 143.193 53.1292C143.367 53.1292 143.454 53.1292 143.541 53.2174C143.801 53.2174 144.062 53.3055 144.149 53.3937C144.149 53.4819 144.236 53.4819 144.236 53.6582C144.236 54.011 143.801 54.011 143.541 54.011H138.849C138.501 54.011 138.414 53.8347 138.414 53.6582C138.414 53.4819 138.501 53.2174 138.762 53.2174C139.631 53.1292 139.804 53.0409 139.718 52.5119L138.675 41.1362L132.767 52.6882C132.245 53.7464 132.071 54.011 131.724 54.011C131.376 54.011 131.203 53.6582 130.681 52.8646C130.073 51.8064 128.335 48.72 127.727 47.3973C127.466 46.9563 127.119 46.1627 126.684 45.369C125.902 43.8699 125.12 42.2826 124.686 41.4007L123.73 51.5419C123.73 51.8946 123.73 52.3355 123.73 52.6882C123.73 52.9527 123.904 53.1292 124.165 53.1292C124.512 53.2174 124.773 53.2174 124.947 53.2174C125.034 53.2174 125.034 53.2174 125.12 53.2174C125.381 53.2174 125.468 53.3937 125.468 53.5701C125.468 54.0992 125.034 54.0992 124.773 54.0992Z"
              fill="white"
            />
            <path
              d="M149.514 55.2676C148.799 55.2676 147.103 55.1748 145.853 54.6179C145.406 54.4322 145.406 54.1538 145.406 53.504C145.406 52.1117 145.496 51.0907 145.496 50.9052C145.496 50.7195 145.585 50.2554 145.942 50.2554C146.121 50.2554 146.389 50.3483 146.389 50.7195C146.389 50.9052 146.389 51.2763 146.478 51.5548C146.925 53.6897 149.425 53.8753 150.229 53.8753C152.372 53.8753 153.712 52.6686 153.712 50.8124C153.712 49.1416 152.908 48.399 150.675 46.6354L149.514 45.8C146.925 43.758 145.853 42.18 145.853 40.3238C145.853 37.3535 148.086 35.4043 151.569 35.4043C152.641 35.4043 153.623 35.5899 154.158 35.6827C154.605 35.7756 154.783 35.7756 154.962 35.7756C155.052 35.7756 155.409 35.7756 155.409 36.1468C155.409 36.1468 155.409 36.2397 155.409 36.4253C155.409 36.7966 155.32 37.5392 155.32 38.8386C155.32 39.2099 155.32 39.5812 154.962 39.5812C154.605 39.5812 154.605 39.3027 154.516 39.1171C154.427 38.5602 154.337 38.1889 154.158 37.9104C154.158 37.9104 153.534 36.7966 151.122 36.7966C149.693 36.7966 147.996 37.4463 147.996 39.3027C147.996 40.7879 148.621 41.6233 151.122 43.2939L151.837 43.758C154.783 45.8 155.945 47.6565 155.945 49.8842C155.945 51.7404 155.141 53.2255 153.534 54.3394C152.641 54.9891 151.3 55.2676 149.514 55.2676Z"
              fill="white"
            />
            <path
              d="M171.794 56.4369H163.989C163.564 56.4369 163.394 56.17 163.394 55.9919C163.394 55.814 163.479 55.5471 163.819 55.5471C163.989 55.5471 164.158 55.4581 164.327 55.4581C164.498 55.4581 164.668 55.4581 164.837 55.369C165.347 55.2801 165.516 54.6572 165.685 53.5894C165.855 52.1655 165.855 49.318 165.855 46.0256V39.8855C165.855 34.4572 165.855 33.4785 165.77 32.3216C165.685 31.0758 165.431 30.7198 164.498 30.5419C164.327 30.5419 164.073 30.4529 163.394 30.4529C163.14 30.4529 162.971 30.275 162.971 30.0079C162.971 29.5631 163.479 29.5631 163.65 29.5631H171.116C177.649 29.5631 177.989 34.4572 177.989 34.9912C178.074 38.5507 176.292 40.4194 175.188 41.1313C177.564 41.6652 180.534 44.6908 180.534 48.6062C180.45 52.4326 177.735 56.4369 171.794 56.4369ZM168.825 42.3771V44.4237C168.825 47.0043 168.825 51.4537 168.825 51.9876V52.1655C168.91 53.7674 168.91 54.1232 169.843 54.5682C170.776 55.0132 172.388 55.1021 172.729 55.1021C174.764 55.1021 177.225 53.8563 177.225 50.3859C177.225 49.051 176.886 45.5806 174.085 43.5339C172.983 42.733 172.219 42.644 171.455 42.555C171.116 42.4661 170.182 42.3771 168.825 42.3771ZM168.91 40.9533C169.164 40.9533 169.674 41.0423 170.861 41.0423C172.729 41.0423 173.067 40.9534 173.747 40.2415C174.51 39.3515 174.934 38.1057 174.934 36.8599C174.934 34.1903 173.831 31.0758 170.607 31.0758C170.182 31.0758 169.504 31.0758 169.079 31.2537C168.825 31.3427 168.825 31.3427 168.825 31.4318V40.7753C168.825 40.8644 168.825 40.8644 168.91 40.9533Z"
              fill="white"
            />
            <path
              d="M192.457 54.0992H192.279H183.586C183.142 54.0992 182.965 53.9186 182.965 53.6475C182.965 53.4669 183.142 53.2863 183.32 53.2863C183.497 53.2863 183.586 53.196 183.763 53.196C183.852 53.196 183.941 53.196 184.118 53.1057H184.207C184.562 53.0154 184.739 52.9251 184.739 50.8479V40.0103C184.739 36.3977 184.561 36.3977 183.852 36.3074C183.675 36.3074 183.408 36.3074 183.231 36.2171C182.965 36.2171 182.876 36.0365 182.876 35.8559C182.876 35.5849 183.054 35.4946 183.32 35.4946C184.118 35.4946 191.126 35.5849 191.924 35.5849C192.368 35.5849 192.723 35.4946 192.9 35.4946H192.989C193.077 35.4043 193.255 35.4043 193.344 35.4043C193.521 35.4043 193.698 35.4946 193.698 35.8559C193.698 36.0365 193.432 38.2943 193.344 38.5652C193.255 38.9266 193.166 39.0169 192.9 39.0169C192.811 39.0169 192.545 39.0169 192.545 38.4749C192.545 38.2943 192.545 37.9331 192.457 37.6621C192.368 37.3912 192.191 37.1203 190.86 37.03C190.505 37.03 187.756 36.9397 187.577 36.9397C187.401 36.9397 187.401 37.03 187.401 37.1203V43.5325C187.401 43.5325 187.401 43.5325 187.401 43.6228C188.109 43.6228 190.86 43.6228 191.392 43.5325H191.481C192.013 43.4422 192.279 43.4422 192.545 43.2616L192.634 43.1713C192.811 42.9907 192.9 42.9004 193.077 42.9004C193.255 42.9004 193.432 42.9907 193.432 43.2616C193.432 43.3519 193.432 43.4422 193.432 43.5325C193.344 43.7132 193.344 44.0744 193.255 44.6162C193.166 45.0679 193.166 46.2419 193.166 46.3322C193.166 46.6936 192.9 46.7839 192.811 46.7839C192.545 46.7839 192.457 46.6031 192.457 46.3322C192.457 46.1516 192.457 45.8807 192.368 45.6097C192.279 45.4291 192.279 45.1582 191.304 44.9776C190.683 44.8873 188.199 44.8873 187.667 44.8873V46.8742C187.667 47.1451 187.667 47.5063 187.667 47.9579C187.667 49.132 187.667 50.6672 187.667 50.9382C187.756 52.3832 187.933 52.6541 190.417 52.6541C191.037 52.6541 192.191 52.6541 192.811 52.3832C193.344 52.1123 193.61 51.7511 193.787 50.8479C193.787 50.6672 193.876 50.306 194.231 50.3963C194.319 50.3963 194.585 50.4866 194.585 50.9382C194.585 51.2091 194.408 52.7445 194.231 53.2863C193.61 54.0992 193.255 54.0992 192.457 54.0992Z"
              fill="white"
            />
            <path
              d="M204.789 54.0992H199.688C199.52 54.0992 199.102 54.0992 199.102 53.7396C199.102 53.5599 199.185 53.3802 199.436 53.3802C199.771 53.3802 200.188 53.2902 200.356 53.2003C200.691 53.1105 200.942 53.0206 200.942 51.2231V37.2018H197.847C196.592 37.2018 196.007 37.3817 195.673 37.921C195.505 38.2804 195.422 38.3704 195.338 38.5501V38.6399C195.254 38.8197 195.17 38.9995 194.919 38.9995C194.753 38.9995 194.585 38.8197 194.585 38.6399C194.585 38.4602 194.753 37.7411 195.087 36.2133L195.17 35.9436C195.254 35.7638 195.254 35.4043 195.589 35.4043C195.673 35.4043 195.756 35.4043 195.839 35.4941C196.007 35.5841 196.258 35.674 196.592 35.674C197.261 35.7638 198.098 35.7638 198.349 35.7638H206.128C206.379 35.7638 207.214 35.7638 207.884 35.674C208.218 35.5841 208.469 35.4941 208.636 35.4941C208.72 35.4941 208.804 35.4043 208.887 35.4043C209.221 35.4043 209.306 35.8537 209.306 36.0334C209.306 36.0334 209.306 36.2133 209.389 36.393C209.64 37.6512 209.807 38.4602 209.807 38.6399C209.807 38.9097 209.64 38.9995 209.472 38.9995C209.306 38.9995 209.138 38.9097 209.055 38.6399C208.97 38.4602 208.97 38.3704 208.72 38.0108C208.385 37.5614 207.799 37.2918 206.545 37.2918H203.367V51.3129C203.367 53.2003 203.45 53.2003 204.203 53.2902H204.286C204.789 53.3802 205.123 53.3802 205.123 53.7396C205.123 53.8295 205.123 53.9195 205.04 54.0093C205.123 54.0093 204.957 54.0992 204.789 54.0992Z"
              fill="white"
            />
            <defs>
              <filter
                id="filter0_dddddd_1_315"
                x="7.37042"
                y="7.323"
                width="74.4142"
                height="71.354"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="0.1776" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 1 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_1_315"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="0.3552" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 1 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect1_dropShadow_1_315"
                  result="effect2_dropShadow_1_315"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="1.2432" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 1 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect2_dropShadow_1_315"
                  result="effect3_dropShadow_1_315"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="2.4864" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 1 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect3_dropShadow_1_315"
                  result="effect4_dropShadow_1_315"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="4.2624" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 1 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect4_dropShadow_1_315"
                  result="effect5_dropShadow_1_315"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="7.4592" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 0.2 0 0 0 1 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect5_dropShadow_1_315"
                  result="effect6_dropShadow_1_315"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect6_dropShadow_1_315"
                  result="shape"
                />
              </filter>
              <linearGradient
                id="paint0_linear_1_315"
                x1="33.6043"
                y1="61.0173"
                x2="58.6119"
                y2="38.7959"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.183312" stop-color="#FFD261" />
                <stop offset="0.5" stop-color="#FFF28F" />
                <stop offset="1" stop-color="#FFBE41" />
              </linearGradient>
            </defs>
          </svg>
          <p className="font-urbanist font-bold text-[32px] text-white m-0 mt-8 ml-6 leading-normal">
            TE LLEVAMOS A
          </p>
          <p
            className="font-urbanist font-black text-[64px] w-full m-0 ml-6 leading-normal"
            style={{
              background: "linear-gradient(180deg, #ffd869 0%, #f6c44d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 10px rgba(255, 216, 105, 0.6)",
              filter: "drop-shadow(0 0 10px rgba(255, 216, 105, 0.6))",
            }}
          >
            LAS VEGAS
          </p>
        </div>

        {/* SVG en el centro - Ejemplo con máquina tragamonedas */}
        <div className="absolute h-screen w-screen flex items-center justify-center">
          <div>
            <img
              src={slotMachine}
              alt="Slot machine"
              className="w-full h-full object-contain mb-10"
            />

            <div className="border-2 border-[#006afa] border-solid box-border flex flex-col gap-[10px] items-start p-[2px] rounded-[8px] w-full">
              <button
                onClick={handleStartClick}
                className="bg-[#006afa] border-2 border-[rgba(255,255,255,0.1)] border-solid box-border flex gap-[8px] h-[52px] items-center justify-center px-[16px] py-[8px] rounded-[6px] w-full cursor-pointer transition-all duration-300 hover:bg-[#0056d6] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,106,250,0.4)] active:translate-y-0"
              >
                <span className="font-urbanist font-extrabold text-[20px] text-center text-[#f5f5f5] whitespace-nowrap leading-[normal]">
                  EMPEZAR
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        id="second_page"
        className={`absolute inset-0 z-20 h-screen w-screen flex items-center justify-center ${
          currentPage === "second" ? "" : "hidden"
        }`}
      >
        <img
          src={slotMachine}
          alt="Slot machine"
          className="w-full h-full object-contain mb-10"
        />
      </div>
      <div
        id="third_page"
        className={`absolute inset-0 z-20 h-screen w-screen flex items-center justify-center ${
          currentPage === "third" ? "" : "hidden"
        }`}
      >
        <div>
          <h2
            className="font-urbanist font-black text-[64px] text-center w-full m-0 leading-normal"
              style={{ 
              background: "linear-gradient(180deg, #ffd869 0%, #f6c44d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 10px rgba(255, 216, 105, 0.6)",
              filter: "drop-shadow(0 0 10px rgba(255, 216, 105, 0.6))",
            }}
          >
            GANADORES
          </h2>
          <p className="font-urbanist font-bold text-[32px] text-center w-full m-0 leading-normal text-white">
            Se van a Las Vegas
          </p>
          <div className="flex flex-col items-center mt-6">
            <div className="bg-[rgba(0,0,0,0.5)] border-4 border-[#ffce58] border-solid rounded-[20px] p-8 inline-flex gap-0">
              {winners.map((winner, index) => (
                <div
                  key={index}
                  className={`relative rounded-lg px-6 py-4 flex flex-col items-center justify-center min-w-[200px] transition-opacity duration-500 ${
                    visibleWinners[index] ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {index > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-3/5 bg-white/20"></div>
                  )}
                  <div className="absolute bg-white border-2 border-[rgba(0,0,0,0.11)] border-solid rounded-[28px] w-[28px] h-[28px] flex items-center justify-center -top-2 left-2">
                    <p className="font-urbanist font-medium text-[#192a44] text-[16px]">
                      {index + 1}
                    </p>
                  </div>
                  <p className="font-urbanist font-bold text-[24px] text-white text-center">
                    {winner.username}
                  </p>
                  <p className="font-urbanist font-normal text-[#a9b3bf] text-[16px] text-center mt-1">
                    {winner.code}
                  </p>
                </div>
              ))}
            </div>

            {/* Botón Ver participantes */}
            {userCounts.length > 0 && (
              <button
                onClick={() => setIsTableModalOpen(true)}
                className="bg-[#354865] border-2 border-[rgba(255,255,255,0.11)] border-solid box-border flex items-center justify-center px-[16px] py-0 rounded-[8px] mt-12 cursor-pointer transition-all duration-300 hover:bg-[#2a3a52] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(53,72,101,0.4)] active:translate-y-0 w-[340px]"
              >
                <div className="flex flex-col h-[52px] font-urbanist font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-center text-[#f5f5f5] whitespace-nowrap">
                  <p className="leading-[normal] whitespace-pre">Ver participantes</p>
                </div>
              </button>
            )}

            {/* Botón Ver suplentes */}
            <button
              onClick={handleVerSuplentesClick}
              className="bg-[#006afa] border-2 border-[rgba(255,255,255,0.11)] border-solid box-border flex items-center justify-center px-[16px] py-0 rounded-[8px] mt-24 cursor-pointer transition-all duration-300 hover:bg-[#0056d6] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,106,250,0.4)] active:translate-y-0 w-[340px]"
            >
              <div className="flex flex-col h-[52px] font-urbanist font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-center text-[#f5f5f5] whitespace-nowrap">
                <p className="leading-[normal] whitespace-pre">Ver suplentes</p>
              </div>
            </button>
          </div>
        </div>

        {/* Modal de tabla de participantes */}
        {isTableModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)]"
            onClick={() => setIsTableModalOpen(false)}
          >
            <div
              className="bg-[rgba(25,42,68,0.95)] border-[3px] border-[rgba(255,255,255,0.11)] border-solid rounded-[20px] p-8 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-urbanist font-bold text-[32px] text-white">
                  Participantes
                </h3>
                <button
                  onClick={() => setIsTableModalOpen(false)}
                  className="text-white hover:text-[#a9b3bf] transition-colors"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Tabla con scroll */}
              <div className="overflow-y-auto flex-1">
                <div className="bg-[rgba(0,0,0,0.3)] border-[2px] border-[rgba(255,255,255,0.11)] border-solid rounded-[12px] overflow-hidden">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[rgba(0,0,0,0.5)]">
                      <tr>
                        <th className="font-urbanist font-bold text-[16px] text-white text-left px-4 py-3 border-b border-[rgba(255,255,255,0.11)]">
                          Usuario
                        </th>
                        <th className="font-urbanist font-bold text-[16px] text-white text-left px-4 py-3 border-b border-[rgba(255,255,255,0.11)]">
                          ID
                        </th>
                        <th className="font-urbanist font-bold text-[16px] text-white text-center px-4 py-3 border-b border-[rgba(255,255,255,0.11)]">
                          Participaciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userCounts.map((user, index) => (
                        <tr
                          key={`${user.username}-${user.code}`}
                          className={index % 2 === 0 ? "bg-[rgba(255,255,255,0.02)]" : ""}
                        >
                          <td className="font-urbanist font-medium text-[16px] text-white px-4 py-3">
                            {user.username}
                          </td>
                          <td className="font-urbanist font-normal text-[16px] text-[#a9b3bf] px-4 py-3">
                            {user.code}
                          </td>
                          <td className="font-urbanist font-medium text-[16px] text-white text-center px-4 py-3">
                            {user.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
          <p className="font-urbanist font-bold text-[32px] text-center w-full m-0 leading-normal text-white">
            Suplentes
          </p>

          <div className="flex flex-col items-center mt-16">
            {/* Contenedor de suplentes */}
            <div className="bg-[rgba(0,0,0,0.5)] border-[3px] border-[rgba(255,255,255,0.11)] border-solid box-border flex gap-[20px] items-start p-[24px] rounded-[12px] w-[900px]">
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
                      <div className="relative w-[26px] h-[26px] shrink-0">
                        <div className="absolute bg-white rounded-full w-full h-full"></div>
                        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-urbanist font-bold text-[#192a44] text-[16px]">
                          {index + 1}
                        </p>
                      </div>
                      <p className="relative font-urbanist font-medium text-[20px] text-white">
                        {truncateUsername(alternate.username)}
                        {/* Tooltip */}
                        {hoveredAlternateIndex === index && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                            <div className="bg-[#080F1A] border border-[rgba(255,255,255,0.11)] rounded-[12px] px-4 py-2 relative">
                              <p className="font-urbanist font-medium text-[20px] text-white text-center whitespace-nowrap">
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
                    <p className="font-urbanist font-normal text-[#a9b3bf] text-[16px] text-right">
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
                        <div className="relative w-[26px] h-[26px] shrink-0">
                          <div className="absolute bg-white rounded-full w-full h-full"></div>
                          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-urbanist font-bold text-[#192a44] text-[16px]">
                            {index + 5}
                          </p>
                        </div>
                        <p className="relative font-urbanist font-medium text-[20px] text-white">
                          {truncateUsername(alternate.username)}
                          {/* Tooltip */}
                          {hoveredAlternateIndex === globalIndex && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                              <div className="bg-[#080F1A] border border-[rgba(255,255,255,0.11)] rounded-[12px] px-4 py-2 relative">
                                <p className="font-urbanist font-medium text-[20px] text-white text-center whitespace-nowrap">
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
                      <p className="font-urbanist font-normal text-[#a9b3bf] text-[16px] text-right">
                        {alternate.code}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Separador vertical */}
              <div className="bg-[rgba(255,255,255,0.11)] w-px h-full shrink-0"></div>

              {/* Columna 3 - Elementos 9-12 */}
              <div className="flex flex-col gap-[16px] w-[256px]">
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
                        <div className="relative w-[26px] h-[26px] shrink-0">
                          <div className="absolute bg-white rounded-full w-full h-full"></div>
                          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-urbanist font-bold text-[#192a44] text-[16px]">
                            {index + 9}
                          </p>
                        </div>
                        <p className="relative font-urbanist font-medium text-[20px] text-white">
                          {truncateUsername(alternate.username)}
                          {/* Tooltip */}
                          {hoveredAlternateIndex === globalIndex && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                              <div className="bg-[#080F1A] border border-[rgba(255,255,255,0.11)] rounded-[12px] px-4 py-2 relative">
                                <p className="font-urbanist font-medium text-[20px] text-white text-center whitespace-nowrap">
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
                      <p className="font-urbanist font-normal text-[#a9b3bf] text-[16px] text-right">
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
              <div className="flex flex-col h-[52px] font-urbanist font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-center text-[#f5f5f5] whitespace-nowrap">
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
        <div>
          <div>
            <img src={palmsBetLogo} alt="Palms Bet Logo" className="object-contain mx-auto translate-x-[-25px]" />
          </div>
          <p className="font-urbanist font-bold text-[32px] text-center w-full m-0 leading-normal text-white">
            ¡Felicidades a los ganadores!
          </p>
          <div className="flex flex-col items-center mt-16">
            <div className="bg-[rgba(0,0,0,0.5)] border-4 border-[#ffce58] border-solid rounded-[20px] p-8 inline-flex gap-0">
              {winners.map((winner, index) => (
                <div
                  key={index}
                  className={`relative rounded-lg px-6 py-4 flex flex-col items-center justify-center min-w-[200px] transition-opacity duration-500 ${
                    visibleWinners[index] ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {index > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-3/5 bg-white/20"></div>
                  )}
                  <div className="absolute bg-white border-2 border-[rgba(0,0,0,0.11)] border-solid rounded-[28px] w-[28px] h-[28px] flex items-center justify-center -top-2 left-2">
                    <p className="font-urbanist font-medium text-[#192a44] text-[16px]">
                      {index + 1}
                    </p>
                  </div>
                  <p className="font-urbanist font-bold text-[24px] text-white text-center">
                    {winner.username}
                  </p>
                  <p className="font-urbanist font-normal text-[#a9b3bf] text-[16px] text-center mt-1">
                    {winner.code}
                  </p>
            </div>
          ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
