import React, { useEffect, useState } from "react";
import { useGetMatchDataByIdQuery, useGetMatchLineupByFixtureIdQuery, useGetMatchPredictionsByIdQuery, useGetMatchSidelinedPlayersByFixtureIdQuery, useGetMatchStatisticsByIdQuery } from "../../store/api/syncedPoolDataApi";
import { StatisticTable, StatisticTableWithMockData } from "../../components/ui/matchStats";
import { MatchInfortunati } from "../../components/ui/matchInfortunati";
import { MatchEventi } from "../../components/ui/matchEventi";
import { getEventIcon } from "../../utils/eventIcons";
import Header from '../../components/layout/Header';
import LineupsViewer from "../../components/ui/lineups-viewer";
import MatchPredictions from "../../components/ui/matchPredictions";
import MatchNews from "../../components/ui/matchNews";

type Props = {
  matchId: any;
};

const TAB_STORAGE_KEY = "matchDetailsActiveTab";

const SportMonksMatchDetails: React.FC<Props> = ({ matchId }) => {
  // Leggi il tab da localStorage, fallback su "eventi"
  const [activeTab, setActiveTab] = useState<"eventi" | "infortuni" | "statistiche" | "formazione" | "predizioni" | "notizie">(
    () => (localStorage.getItem(TAB_STORAGE_KEY) as any) || "eventi"
  );

  // Salva il tab selezionato su localStorage ogni volta che cambia
  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const { data, isLoading, error } = useGetMatchDataByIdQuery(
    {
      id: matchId,
    },
    {
      pollingInterval: 10000,
    }
  );

  const { data: predictionsData, isLoading: predictionsLoading, error: predictionsError } = useGetMatchPredictionsByIdQuery(
    {
      fixtureId: matchId,
    },
    {
      pollingInterval: 10000,
    }
  );

  const { data: lineupData, isLoading: lineupLoading, error: lineupError } = useGetMatchLineupByFixtureIdQuery(
    {
      fixtureId: matchId,
    },
    {
      pollingInterval: 10000,
    }
  );

  const { data: matchStatisticsData, isLoading: statisticsLoading, error: statisticsError } = useGetMatchStatisticsByIdQuery(
    {
      fixtureId: matchId,
    },
    {
      pollingInterval: 10000,
    }
  );

  const { data: sidelinedPlayersData, isLoading: sidelinedLoading, error: sidelinedError } = useGetMatchSidelinedPlayersByFixtureIdQuery(
    {
      fixtureId: matchId,
    },
    {
      pollingInterval: 10000,
    }
  );

  useEffect(() => {
    console.log("match data: ", data);
  }, [data]);

  useEffect(() => {
    console.log("predictions data: ", predictionsData);
  }, [predictionsData]);

  useEffect(() => {
    console.log("lineup data: ", lineupData);
  }, [lineupData]);

  useEffect(() => {
    console.log("match statistics data: ", matchStatisticsData);
  }, [matchStatisticsData]);

  useEffect(() => {
    console.log("sidelined players data: ", sidelinedPlayersData);
  }, [sidelinedPlayersData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <span className="mr-2 animate-spin">⏳</span>Caricamento...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-8 text-center text-red-500">
        Errore nel caricamento dei dati della partita.
      </div>
    );
  }

  // Controlli di esistenza
  const league = data.sportMonkEventLeague || {};
  const venue = data.sportMonkEventVenue || {};
  const state = data.sportMonkEventState || {};
  const participants = Array.isArray(data.sportMonkEventParticipants) ? data.sportMonkEventParticipants : [];
  const home = participants.find((t: any) => t?.meta?.location === "home") || {};
  const away = participants.find((t: any) => t?.meta?.location === "away") || {};

  // Score
  const scores = Array.isArray(data.sportMonkEventScores) ? data.sportMonkEventScores : [];
  const homeGoals =
    scores.find((s: any) => s.description === "CURRENT" && s.participant_id === home.id)?.score?.goals ?? 0;
  const awayGoals =
    scores.find((s: any) => s.description === "CURRENT" && s.participant_id === away.id)?.score?.goals ?? 0;

  // Eventi principali
  const events = Array.isArray(data.sportMonkEventLiveEvents) ? data.sportMonkEventLiveEvents : [];
  const mainEvents = events.filter(
    (e: any) =>
      e?.type?.code &&
      ["goal", "yellowcard", "substitution"].includes(e.type.code)
  );
  const periods = Array.from(
    new Set(mainEvents.map((e: any) => e?.period?.description).filter(Boolean))
  );

  return (
    <>
      <Header showLogo={true} showMenu={true} />
      <div className="relative flex flex-col text-black rounded-md bg-radial-gradient min-h-32 sm:min-h-48 2xl:min-h-64">
        {/* Header */}
        <div className="flex items-center gap-4 px-2 sm:px-4 xl:px-6">
          <div className="flex items-center w-1/3 gap-2 text-xs transition-all duration-300 ease-in-out border border-transparent opacity-50 cursor-pointer hover:opacity-100 sm:text-sm">
            <span className="hidden material-symbols-outlined icon-sm sm:inline">Data</span>
            <p>{data.sportMonkMatchStartingDate?.split(" ")[0] || "-"}</p>
          </div>
          {/* Icona lega */}
          <div className="flex items-center justify-center w-1/3 gap-1 py-2 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:gap-2 sm:py-4">
            <div className="grid w-5 h-5 bg-white rounded-full place-items-center text-default sm:h-8 sm:w-8">
              {league.image_path && (
                <img src={league.image_path} className="w-3 h-3 sm:h-6 sm:w-6" alt={league.name || "League"} />
              )}
            </div>
            <p className="text-xs sm:text-sm">{league.name || "-"}</p>
          </div>
          {/* Stadio */}
          <div className="flex items-center justify-end w-1/3 gap-2 text-xs transition-all duration-300 ease-in-out border border-transparent opacity-50 cursor-pointer hover:opacity-100 sm:text-sm">
            <span className="hidden material-symbols-outlined icon-sm sm:inline">Stadio</span>
            <p className="truncate">{venue.name || "-"}</p>
          </div>
        </div>

        {/* Squadre e risultato */}
        <div>
          <div className="flex items-center gap-4 px-2 pt-2 sm:gap-10 sm:px-4 2xl:pt-8">
            <div className="flex justify-end w-4/12 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:w-5/12">
              <div className="flex flex-col-reverse items-center gap-1 text-center 2xl:flex-row 2xl:gap-4">
                <p className="text-xs truncate sm:text-lg">{home.name || "-"}</p>
                {home.image_path && (
                  <img src={home.image_path} className="object-contain w-10 h-10 sm:h-16 sm:w-16 md:h-24 md:w-24" alt={home.name || "Home"} />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-between w-4/12 sm:w-2/12">
              <div className="px-2 transition-all duration-300 ease-in-out border border-transparent cursor-pointer">
                <p className="text-xs text-center sm:text-sm"><span>{state.short_name || "-"}</span></p>
              </div>
              <div className="flex flex-col items-center w-full px-2">
                <div className="flex items-center justify-between w-full gap-1 px-3 py-1 transition-all duration-300 ease-in-out border border-transparent rounded-full cursor-pointer bg-default md:px-6 md:py-2">
                  <p className="pt-1 text-sm leading-none sm:text-base md:text-lg">{homeGoals}</p>
                  <p className="pt-1 text-sm leading-none sm:text-base md:text-lg">-</p>
                  <p className="pt-1 text-sm leading-none sm:text-base md:text-lg">{awayGoals}</p>
                </div>
              </div>
            </div>
            <div className="flex w-4/12 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:w-5/12">
              <div className="flex flex-col items-center gap-1 text-center 2xl:flex-row 2xl:gap-4">
                {away.image_path && (
                  <img src={away.image_path} className="object-contain w-10 h-10 sm:h-16 sm:w-16 md:h-24 md:w-24" alt={away.name || "Away"} />
                )}
                <p className="text-xs truncate sm:text-lg">{away.name || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Eventi principali */}
        {mainEvents.length > 0 && (
          <div className="flex items-start justify-center gap-6 px-2 pb-4 pt-4 text-[10px] sm:text-xs 2xl:pb-6 2xl:pt-6">
            <div className="flex flex-col items-end w-1/2 space-y-1">
              {mainEvents
                .filter((e: any) => e.participant_id === home.id)
                .map((e: any) => (
                  <div key={e.id} className="flex items-center gap-2 transition-all duration-300 ease-in-out border border-transparent cursor-pointer">
                    <p className="truncate">{e.player_name}</p>
                    <div className="flex items-center gap-2">
                      <div className="relative text-[#1893C1]">
                        <div className="flex items-center gap-1">
                          <div className="relative flex items-end text-[#1893C1]">
                            <p className="">{e.minute}</p>
                          </div>
                        </div>
                      </div>
                      {e.type.code === "goal" && (
                        <img src={getEventIcon(e.type.code)} className="w-5 h-5" alt="Goal" />
                      )}
                      {e.type.code === "yellowcard" && (
                        <img src={getEventIcon(e.type.code)} className="w-5 h-5" alt="Yellow card" />
                      )}
                      {e.type.code === "redcard" && (
                        <img src={getEventIcon(e.type.code)} className="w-5 h-5" alt="Red card" />
                      )}
                      {e.type.code === "substitution" && (
                        <img src={getEventIcon(e.type.code)} className="w-5 h-5" alt="Substitution" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex flex-col w-1/2 space-y-1">
              {mainEvents
                .filter((e: any) => e.participant_id === away.id)
                .map((e: any) => (
                  <div key={e.id} className="flex items-center gap-2 transition-all duration-300 ease-in-out border border-transparent cursor-pointer">
                    <p className="truncate">{e.player_name}</p>
                    <div className="flex items-center gap-2">
                      <div className="relative text-[#1893C1]">
                        <div className="flex items-center gap-1">
                          <div className="relative flex items-end text-[#1893C1]">
                            <p className="">{e.minute}</p>
                          </div>
                        </div>
                      </div>
                      {e.type.code === "goal" && (
                        <img src={getEventIcon(e.type.code)} className="w-5 h-5" alt="Goal" />
                      )}
                      {e.type.code === "yellowcard" && (
                        <img src={getEventIcon(e.type.code)} className="w-5 h-5" alt="Yellow card" />
                      )}
                      {e.type.code === "redcard" && (
                        <img src={getEventIcon(e.type.code)} className="w-5 h-5" alt="Red card" />
                      )}
                      {e.type.code === "substitution" && (
                        <img src={getEventIcon(e.type.code)} className="w-5 h-5" alt="Substitution" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-col items-center w-full gap-4 bg-white select-none expansion-hub h-fit rounded-b-md">
          <div className="flex flex-col items-center w-full py-6 space-y-6">
            <div className="flex justify-center w-full">
              <div className="flex flex-wrap justify-center w-full gap-2 px-4 py-4 text-xs bg-white border border-gray-100 rounded-md sm:text-sm md:text-base">
                {["eventi", "infortuni", "statistiche", "formazione", "predizioni", "notizie"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-1 text-black transition-colors duration-200 rounded-full ${activeTab === tab ? "font-bold" : "font-normal"
                      }`}
                    onClick={() => setActiveTab(tab as "eventi" | "infortuni" | "statistiche" | "formazione" | "predizioni" | "notizie")}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sezioni tab */}
          <div className="w-full h-full">
            {activeTab === "eventi" && (
              <MatchEventi
                eventiData={data.sportMonkEventLiveEvents || []}
                partecipantHomeId={home.id}
                partecipantAwayId={away.id}
                homeImagePath={home.image_path || ""}
                awayImagePath={away.image_path || ""}
              />
            )}

            {activeTab === "infortuni" && (
              <MatchInfortunati
                sidelined={sidelinedPlayersData || []}
                homeImagePath={home.image_path || ""}
                awayImagePath={away.image_path || ""}
              />
            )}

            {activeTab === "statistiche" && (
              <StatisticTable
                stats={matchStatisticsData.statistics || []}
                homeImagePath={home.image_path || ""}
                awayImagePath={away.image_path || ""}
              />
            )}

            {activeTab === "formazione" && (
              <LineupsViewer
                lineupData={lineupData}
                homeTeamId={home.id}
                homeImagePath={home.image_path || ""}
                awayImagePath={away.image_path || ""}
              />
            )}

            {activeTab === "predizioni" && (
              <MatchPredictions
                homeTeam={home}
                awayTeam={away}
                predictions={predictionsData.data.predictions || []}
              />
            )}

            {activeTab === "notizie" && (
              <MatchNews
                prematchnews={data.sportMonkEventNews?.prematchnews || []}
                postmatchnews={data.sportMonkEventNews?.postmatchnews || []}
                homeTeam={home}
                awayTeam={away}
              />
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default SportMonksMatchDetails;