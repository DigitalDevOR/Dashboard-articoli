import React, { useEffect } from "react";
import { getPlayerStatIcon } from "../utils/eventIcons";
import { useGetPlayerDataByIdQuery, useGetPlayerStatisticsByIdQuery } from "../store/api/sportMonkApi";
import { Skeleton } from "../components/ui/skeleton";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../components/ui/select";
import Header from '@/components/layout/Header';

// Tipi strutturati
type Team = {
    id: number;
    name: string;
    image_path: string;
    jersey_number?: number;
};

type Country = {
    name: string;
    image_path: string;
};

type Position = {
    name: string;
};

type City = {
    name: string;
};

type StatDetail = {
    id: number;
    type_id: number; // AGGIORNATO: era string
    value: string | number | Record<string, string | number>;
    type?: {
        id: number;
        name: string;
        code: string;
        developer_name: string;
        model_type: string;
        stat_group: string | null;
    }
};

type Statistic = {
    id: number;
    details: StatDetail[];
};

type Trophy = {
    id: number;
    trophy: {
        name: string;
        position: number;
    };
    league_id: number;
    season_id: number;
};

type Transfer = {
    id: number;
    date: string;
    fromteam?: Team;
    toteam?: Team;
    amount?: number;
};

type Player = {
    image_path: string;
    display_name: string;
    position?: Position;
    detailedposition?: Position;
    country?: Country;
    city?: City;
    date_of_birth?: string;
    height?: number;
    weight?: number;
    teams?: (Transfer & { team?: Team })[];
    statistics?: Statistic[];
    trophies?: Trophy[];
    transfers?: Transfer[];
};

type PlayerData = {
    playerId: string;
};

const PlayerProfile: React.FC<PlayerData> = ({ playerId }) => {
    const [controllerState, setControllerState] = React.useState({
        panoramica: true,
        statistiche: false,
        trofei: false,
        trasferimenti: false,
    });
    const [selectedSeason, setSelectedSeason] = React.useState<string | null>(null);
    const [selectedLeague, setSelectedLeague] = React.useState<string | null>(null);
    const { data: playerData, isLoading: playerDataLoading, isError: playerDataError } = useGetPlayerDataByIdQuery({ playerId: playerId });
    const { data: playerStatsData, isLoading: playerStatsLoading, isError: playerStatsError } = useGetPlayerStatisticsByIdQuery({ playerId: playerId });

    useEffect(() => {
        console.log("Player Data:", playerData);
        console.log("Player Stats Data:", playerStatsData);
    }, [playerData, playerStatsData]);

    if (playerDataLoading || playerStatsLoading) {
        return <Skeleton />;
    }

    const player = playerData?.data ?? {};
    const today = new Date();
    const teams = Array.isArray(player.teams) ? player.teams : [];
    let lastTeam: (Transfer & { team?: Team }) | undefined = undefined;

    if (teams.length > 0) {
        const teamsWithStart = teams.filter(t => t?.start && !isNaN(Date.parse(t.start)));
        const startedTeams = teamsWithStart.filter(t => new Date(t.start) <= today);
        if (startedTeams.length > 0) {
            lastTeam = startedTeams.reduce((a, b) =>
                new Date(a.start) > new Date(b.start) ? a : b
            );
        } else if (teamsWithStart.length > 0) {
            lastTeam = teamsWithStart.reduce((a, b) =>
                new Date(a.start) < new Date(b.start) ? a : b
            );
        } else if (teams.length > 0) {
            lastTeam = teams[teams.length - 1];
        }
    }

    const statsWithDetails = Array.isArray(player.statistics)
        ? player.statistics.filter(s => Array.isArray(s.details) && s.details.length > 0)
        : [];

    const trophies = Array.isArray(player.trophies) ? player.trophies : [];
    const transfers = Array.isArray(player.transfers) ? player.transfers : [];

    const statsData = Array.isArray(playerStatsData?.data) ? playerStatsData.data : [];

    const seasons = Array.from(
        new Set(
            statsData
                .filter((s: any) => Array.isArray(s.details) && s.details.length > 0)
                .map((s: any) => s.season?.name)
                .filter(Boolean)
        )
    );

    const leagueOptions: { name: string; image: string }[] = Array.from(
        new Map(
            statsData
                .map((s: any) => [
                    s.season?.league?.name,
                    { name: s.season?.league?.name ?? "", image: s.season?.league?.image_path ?? "" },
                ])
                .filter(([name, val]) => !!name && !!val.image)
        ).values()
    ) as { name: string; image: string }[];

    const filteredStats = statsData.filter((s: any) => {
        const seasonMatch = selectedSeason ? s.season?.name === selectedSeason : true;
        const leagueMatch = selectedLeague ? s.season?.league?.name === selectedLeague : true;
        const hasStats = Array.isArray(s.details) && s.details.length > 0;
        return seasonMatch && leagueMatch && (selectedSeason ? true : hasStats);
    });

    const handleControllerClick = (section: string) => {
        setControllerState(() => ({
            panoramica: section === "panoramica",
            statistiche: section === "statistiche",
            trofei: section === "trofei",
            trasferimenti: section === "trasferimenti",
        }));
    };

    const safeImg = (src?: string, alt?: string, className?: string) =>
        src ? (
            <img src={src} alt={alt ?? ""} className={className} onError={e => (e.currentTarget.style.display = "none")} />
        ) : (
            <span className={className + " bg-gray-200 flex items-center justify-center"}>?</span>
        );

    return (
        <>
            <Header showLogo={true} showMenu={true} />
            <div className="p-4 overflow-hidden rounded-xl page-content">
                <div className="bg-white">
                    <div className="flex items-center justify-center">
                        <div className="flex flex-col gap-4 w-fit">
                            <div className="flex justify-center">
                                {safeImg(player.image_path, player.display_name, "w-24 h-24 border rounded-full")}
                            </div>
                            <div className="flex justify-center gap-4">
                                <div className="flex items-center">
                                    <h2 className="text-2xl font-bold text-center">{player.display_name ?? "Nome non disponibile"}</h2>
                                </div>
                                {lastTeam && (lastTeam.toteam?.image_path || lastTeam.team?.image_path) ? (
                                    <div className="flex items-center gap-2">
                                        {safeImg(
                                            lastTeam.toteam?.image_path || lastTeam.team?.image_path,
                                            lastTeam.toteam?.name || lastTeam.team?.name,
                                            "w-16 aspect-auto"
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400"></span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Controller */}
                    <div className="flex justify-center mt-4 mb-12">
                        <div className="flex justify-between">
                            <button onClick={() => handleControllerClick("panoramica")} className={'px-4 py-2 transition-colors duration-200 border-b-2 border-transparent text-black/80 hover:text-black ' + (controllerState.panoramica ? 'border-black/30' : '')}>
                                Panoramica
                            </button>
                            <button onClick={() => handleControllerClick("statistiche")} className={'px-4 py-2 transition-colors duration-200 border-b-2 border-transparent text-black/80 hover:text-black ' + (controllerState.statistiche ? 'border-black/30' : '')}>
                                Statistiche
                            </button>
                            <button onClick={() => handleControllerClick("trofei")} className={'px-4 py-2 transition-colors duration-200 border-b-2 border-transparent text-black/80 hover:text-black ' + (controllerState.trofei ? 'border-black/30' : '')}>
                                Trofei
                            </button>
                            <button onClick={() => handleControllerClick("trasferimenti")} className={'px-4 py-2 transition-colors duration-200 border-b-2 border-transparent text-black/80 hover:text-black ' + (controllerState.trasferimenti ? 'border-black/30' : '')}>
                                Trasferimenti
                            </button>
                        </div>
                    </div>
                    {/* Panoramica section */}
                    {controllerState.panoramica && (
                        <div className="p-4 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-3 gap-6">
                                {/* Nazionalità */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        {player.country?.image_path
                                            ? safeImg(player.country.image_path, player.country.name, "inline w-5 h-5 ml-1")
                                            : null}
                                        <span className="text-black">{player.country?.name ?? "N/D"}</span>
                                    </div>
                                    <span className="text-gray-600 w-fit">Nazionalità</span>
                                </div>
                                {/* Età */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-black">
                                        {player.date_of_birth
                                            ? (new Date().getFullYear() - new Date(player.date_of_birth).getFullYear()) + " Anni"
                                            : "N/D"}
                                    </span>
                                    <span className="text-gray-600 w-fit">{player.date_of_birth ?? "N/D"}</span>
                                </div>
                                {/* Ruolo */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-black">{player.position?.name ?? "N/D"}</span>
                                    <span className="text-gray-600 w-fit">Ruolo</span>
                                </div>
                                {/* Altezza */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-black">{player.height ? `${player.height} cm` : "N/D"}</span>
                                    <span className="text-gray-600 w-fit">Altezza</span>
                                </div>
                                {/* Peso */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-black">{player.weight ? `${player.weight} kg` : "N/D"}</span>
                                    <span className="text-gray-600 w-fit">Peso</span>
                                </div>
                                {/* Città di nascita */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-black">{player.city?.name ?? "N/D"}</span>
                                    <span className="text-gray-600 w-fit">Città di nascita</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Statistiche section */}
                    {controllerState.statistiche && (
                        <div className="p-4 rounded-lg bg-gray-50">
                            <div className="flex gap-4 mb-4">
                                {/* Select stagione (anno) */}
                                <Select
                                    value={selectedSeason ?? "all"}
                                    onValueChange={val => setSelectedSeason(val === "all" ? null : val)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Tutte le stagioni" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Tutte le stagioni
                                        </SelectItem>
                                        {seasons.map(season => (
                                            <SelectItem key={String(season)} value={String(season)}>
                                                {String(season)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/* Select lega */}
                                <Select
                                    value={selectedLeague ?? "all"}
                                    onValueChange={val => setSelectedLeague(val === "all" ? null : val)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Tutte le leghe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Tutte le leghe
                                        </SelectItem>
                                        {leagueOptions.map(league => (
                                            <SelectItem key={league.name} value={league.name}>
                                                <span className="flex items-center gap-2">
                                                    {league.image
                                                        ? safeImg(league.image, league.name, "w-5 h-5")
                                                        : null}
                                                    {league.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-10">
                                {filteredStats.length > 0 ? (
                                    filteredStats.map((stat: any, idx: number) => (
                                        <React.Fragment key={stat.id}>
                                            {/* Header Lega + Stagione */}
                                            <div className="flex items-center gap-3 px-4 py-2 mb-4 bg-gray-100 border border-gray-200 rounded">
                                                {stat.season?.league?.image_path
                                                    ? safeImg(stat.season.league.image_path, stat.season.league.name, "w-8 h-8 rounded")
                                                    : null}
                                                <span className="text-lg font-semibold">{stat.season?.league?.name ?? "N/D"}</span>
                                                <span className="text-base text-gray-500">({stat.season?.name ?? "N/D"})</span>
                                            </div>
                                            {/* Griglia statistiche */}
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                                {Array.isArray(stat.details) && stat.details.length > 0 ? stat.details.map((detail: any) => (
                                                    <div
                                                        key={detail.id}
                                                        className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm p-4 min-h-[80px]"
                                                    >
                                                        <span className="mb-1 text-sm text-center text-gray-500">{detail.type?.name ?? detail.type_id ?? "N/D"}</span>
                                                        <span className="text-xl font-bold text-center text-black">
                                                            {typeof detail.value === "object"
                                                                ? Object.entries(detail.value).map(([k, v]) =>
                                                                    k === "total"
                                                                        ? <span key={k}>{String(v)}</span>
                                                                        : <span key={k} className="block text-xs text-gray-400">{k}: {String(v)}</span>
                                                                )
                                                                : String(detail.value ?? "N/D")}
                                                        </span>
                                                    </div>
                                                )) : (
                                                    <span className="text-gray-400">Nessun dettaglio</span>
                                                )}
                                            </div>
                                            {/* Separatore tra le leghe */}
                                            {idx < filteredStats.length - 1 && (
                                                <hr className="my-8 border-gray-300" />
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <span className="text-gray-400">Nessuna statistica</span>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Trofei section */}
                    {controllerState.trofei && (
                        <div className="p-4 rounded-lg bg-gray-50">
                            <h3 className="mb-4 text-lg font-semibold">Trofei</h3>
                            {trophies.length > 0 ? (
                                <div className="space-y-6">
                                    {trophies
                                        .reduce((acc: any[], trophy) => {
                                            const key = `${trophy.league?.id}-${trophy.trophy?.id}`;
                                            const found = acc.find(
                                                (item) =>
                                                    item.league?.id === trophy.league?.id &&
                                                    item.trophy?.id === trophy.trophy?.id
                                            );
                                            if (found) {
                                                found.seasons.push(trophy.season_id);
                                            } else {
                                                acc.push({
                                                    league: trophy.league,
                                                    trophy: trophy.trophy,
                                                    seasons: [trophy.season_id],
                                                });
                                            }
                                            return acc;
                                        }, [])
                                        .sort((a, b) => {
                                            const dateA = a.league?.last_played_at ? new Date(a.league.last_played_at).getTime() : 0;
                                            const dateB = b.league?.last_played_at ? new Date(b.league.last_played_at).getTime() : 0;
                                            return dateB - dateA;
                                        })
                                        .map((item, idx) => (
                                            <div
                                                key={`${item.league?.id}-${item.trophy?.id}`}
                                                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                                            >
                                                {item.league?.image_path
                                                    ? safeImg(item.league.image_path, item.league.name, "w-10 h-10 rounded")
                                                    : null}
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-base font-semibold">{item.league?.name ?? "N/D"}</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold
                                                            ${item.trophy?.name === "Winner"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-yellow-100 text-yellow-700"}`}>
                                                            {item.trophy?.name === "Winner"
                                                                ? "Vincitore"
                                                                : item.trophy?.name === "Runner-up"
                                                                    ? "Secondo classificato"
                                                                    : item.trophy?.name ?? "N/D"}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {item.seasons.length > 1
                                                                ? `${item.seasons.length} stagioni`
                                                                : "1 stagione"}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-400">
                                                        {item.seasons
                                                            .filter(Boolean)
                                                            .map((seasonId: number, i: number) => {
                                                                const trophyObj = trophies.find(
                                                                    (t) =>
                                                                        t.season_id === seasonId &&
                                                                        t.league?.id === item.league?.id &&
                                                                        t.trophy?.id === item.trophy?.id
                                                                );
                                                                const date =
                                                                    trophyObj?.league?.last_played_at
                                                                        ? new Date(trophyObj.league.last_played_at).toLocaleDateString()
                                                                        : "";
                                                                return (
                                                                    <span key={seasonId}>
                                                                        {date || "N/D"}
                                                                        {i < item.seasons.length - 1 && <span>, </span>}
                                                                    </span>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <span className="text-gray-400">Nessun trofeo</span>
                            )}
                        </div>
                    )}
                    {/* Trasferimenti section */}
                    {controllerState.trasferimenti && (
                        <div className="p-4 rounded-lg bg-gray-50">
                            <h3 className="mb-4 text-lg font-semibold">Trasferimenti</h3>
                            {transfers.length > 0 ? (
                                <div className="space-y-4">
                                    {transfers
                                        .slice()
                                        .sort((a, b) => new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime())
                                        .map(tr => (
                                            <div
                                                key={tr.id}
                                                className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                                            >
                                                {/* Data */}
                                                <span className="w-20 text-xs text-gray-500">
                                                    {tr.date ? new Date(tr.date).toLocaleDateString() : "N/D"}
                                                </span>
                                                {/* Da */}
                                                <div className="flex items-center gap-2 min-w-[120px]">
                                                    {tr.fromteam?.image_path
                                                        ? safeImg(tr.fromteam.image_path, tr.fromteam.name, "w-8 h-8 rounded")
                                                        : null}
                                                    <span className="text-sm">{tr.fromteam?.name ?? "?"}</span>
                                                </div>
                                                {/* Freccia */}
                                                <span className="mx-2 text-lg text-gray-400">→</span>
                                                {/* A */}
                                                <div className="flex items-center gap-2 min-w-[120px]">
                                                    {tr.toteam?.image_path
                                                        ? safeImg(tr.toteam.image_path, tr.toteam.name, "w-8 h-8 rounded")
                                                        : null}
                                                    <span className="text-sm">{tr.toteam?.name ?? "?"}</span>
                                                </div>
                                                {/* Importo */}
                                                <span className="ml-auto text-sm font-semibold text-green-700">
                                                    {typeof tr.amount === "number" && !isNaN(tr.amount)
                                                        ? `${tr.amount.toLocaleString()} €`
                                                        : ""}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <span className="text-gray-400">Nessun trasferimento</span>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </>
    );
};

export default PlayerProfile;