import React from "react";
import { useLocation } from "wouter";

interface PlayerInfo {
    id: number;
    sport_id: number;
    country_id: number;
    nationality_id: number;
    city_id: number | null;
    position_id: number;
    detailed_position_id: number | null;
    type_id: number | null;
    common_name: string;
    firstname: string;
    lastname: string;
    name: string;
    display_name: string;
    image_path: string;
    height: number;
    weight: number | null;
    date_of_birth: string;
    gender: string | null;
}

interface LineupType {
    id: number;
    name: string;
    code: string;
    developer_name: string;
}

interface LineupPlayerDetails {
    common_name: string;
    display_name: string;
    firstname: string;
    formation_field: string;
    formation_position: number | null;
    image_path: string;
    jersey_number: string | null;
    lastname: string;
    name: string;
    player_name: string;
    position_id: number;
    team_id: number;
    player_id: number;
    type: LineupType;
}

interface LineupPlayer {
    fixture_id: number;
    players: LineupPlayerDetails[];
}

interface FormationViewerProps {
    lineupData: LineupPlayer;
    homeTeamId: number;
    homeImagePath: string;
    awayImagePath: string;
}

const LineupsViewer: React.FC<FormationViewerProps> = ({
    lineupData,
    homeTeamId,
    homeImagePath = "",
    awayImagePath = "",
}) => {
    const [, setLocation] = useLocation();

    if (!lineupData || !lineupData.players || lineupData.players.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64 gap-4 p-8 bg-gray-50 rounded-xl">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-600">Formazioni non disponibili</h3>
                    <p className="text-sm text-gray-500">Le formazioni per questa partita non sono ancora state pubblicate</p>
                </div>
            </div>
        );
    }

    // Safe fallback for lineupData
    const filteredLineup = lineupData.players.filter(
        (player) =>
            player &&
            player.type?.code === "lineup" &&
            player.formation_field &&
            player.formation_position !== null
    );

    const handlePlayerClick = (player: LineupPlayerDetails) => {
        if (player && player.player_id) {
            setLocation(`/player-detailed/${player.player_id}`);
        }
    };

    const getTeamPlayers = (teamId: number): LineupPlayerDetails[] =>
        filteredLineup.filter((player) => player && player.team_id === teamId);

    const renderPlayer = (player: LineupPlayerDetails) => {
        const imgSrc = player?.image_path || "";
        const displayName = player?.display_name || player?.player_name || "N/D";
        const jerseyNumber = player?.jersey_number ?? "-";
        return (
            <div
                onClick={() => handlePlayerClick(player)}
                key={player?.player_id ?? Math.random()}
                className="flex flex-col items-center justify-center p-2 text-xs text-center bg-white shadow cursor-pointer min-w-16 md:w-24 h-28 rounded-xl hover:shadow-xl"
            >
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={displayName}
                        className="object-cover w-12 h-12 mb-1 rounded-full"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                ) : (
                    <div onClick={() => handlePlayerClick(player)} className="flex items-center justify-center w-12 h-12 mb-1 text-gray-400 bg-gray-200 rounded-full">
                        <span className="text-2xl material-symbols-outlined">P</span>
                    </div>
                )}
                <span className="font-semibold">{jerseyNumber}</span>
                <span className="overflow-hidden ">{displayName}</span>
            </div>
        );
    };

    // Corretto: renderFormation prende un array di LineupPlayerDetails
    const renderFormation = (players: LineupPlayerDetails[]) => {
        if (!Array.isArray(players) || players.length === 0) {
            return (
                <div className="py-8 text-center text-gray-400">Nessuna formazione disponibile</div>
            );
        }
        const sorted = [...players].sort(
            (a, b) => (a?.formation_position ?? 0) - (b?.formation_position ?? 0)
        );

        const rows: { [key: string]: LineupPlayerDetails[] } = {};
        sorted.forEach((player) => {
            const rowKey = player?.formation_field?.split(":")[0] ?? "0";
            if (!rows[rowKey]) rows[rowKey] = [];
            rows[rowKey].push(player);
        });

        return Object.entries(rows).map(([rowKey, rowPlayers]) => (
            <div key={rowKey} className="flex justify-center gap-2 mb-3 min-h-[7rem]">
                {rowPlayers.map(renderPlayer)}
            </div>
        ));
    };

    // Safe teamIds
    const teamIds = Array.isArray(filteredLineup)
        ? [...new Set(filteredLineup.map((p) => p?.team_id).filter(Boolean))]
        : [];
    const awayTeamId = teamIds.find((id) => id !== homeTeamId);

    return (
        <div className="flex flex-col h-full gap-8 p-4 pb-12 lg:flex-row">
            <div key={homeTeamId} className="flex flex-col w-full h-auto">
                <div className="flex justify-center w-full pb-8">
                    {homeImagePath ? (
                        <img
                            src={homeImagePath}
                            className="object-contain w-24 h-24"
                            alt="Home team logo"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                    ) : (
                        <div className="flex items-center justify-center object-contain w-10 h-10 text-gray-400 bg-gray-200 sm:h-16 sm:w-16 md:h-24 md:w-24">
                            <span className="text-2xl material-symbols-outlined">shield</span>
                        </div>
                    )}
                </div>
                <div className="p-4 h-full bg-[#fafafa] rounded-xl shadow-lg min-h-[24rem] flex flex-col justify-center">
                    {renderFormation(getTeamPlayers(homeTeamId))}
                </div>
            </div>
            {awayTeamId && (
                <div key={awayTeamId} className="flex flex-col w-full h-auto">
                    <div className="flex justify-center w-full pb-8">
                        {awayImagePath ? (
                            <img
                                src={awayImagePath}
                                className="object-contain w-24 h-24"
                                alt="Away team logo"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                        ) : (
                            <div className="flex items-center justify-center object-contain w-10 h-10 text-gray-400 bg-gray-200 sm:h-16 sm:w-16 md:h-24 md:w-24">
                                <span className="text-2xl material-symbols-outlined">shield</span>
                            </div>
                        )}
                    </div>
                    <div className="p-4 h-full bg-[#fafafa] rounded-xl shadow-lg min-h-[24rem] flex flex-col justify-center">
                        {renderFormation(getTeamPlayers(awayTeamId))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineupsViewer;
