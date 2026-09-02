import React from "react";
import { useLocation } from "wouter";

type SidelinePlayer = {
    id: number;
    fixture_id: number;
    sideline_id: number;
    participant_id: number;
    sideline: {
        id: number;
        player_id: number;
        type_id: number;
        category: string;
        team_id: number;
        season_id: number | null;
        start_date: string;
        end_date: string;
        games_missed: number;
        completed: boolean;
        player: {
            id: number;
            sport_id: number;
            country_id: number;
            nationality_id: number;
            city_id: number | null;
            position_id: number;
            detailed_position_id: number;
            type_id: number | null;
            common_name: string;
            firstname: string;
            lastname: string;
            name: string;
            display_name: string;
            image_path: string;
            height: number | null;
            weight: number | null;
            date_of_birth: string;
            gender: string;
        };
        type: {
            id: number;
            name: string;
            code: string;
            developer_name: string;
            model_type: string;
            stat_group: string | null;
        };
    };
};

type SidelineListProps = {
    sidelined: SidelinePlayer[];
    homeImagePath?: string;
    awayImagePath?: string;
    homeTeamName?: string;
    awayTeamName?: string;
};

export const MatchInfortunati: React.FC<SidelineListProps> = ({
    sidelined,
    homeImagePath = "",
    awayImagePath = "",
    homeTeamName = "Home",
    awayTeamName = "Away",
}) => {
    const [, setLocation] = useLocation();

    const handlePlayerClick = (player: SidelinePlayer) => {
        setLocation(`/player-detailed/${player.sideline.player_id}`);
    }

    // Raggruppa per squadra
    const grouped = React.useMemo(() => {
        const home: SidelinePlayer[] = [];
        const away: SidelinePlayer[] = [];
        sidelined.forEach((item) => {
            if (item.sideline.team_id === item.participant_id) {
                // fallback: home se team_id === participant_id
                home.push(item);
            } else {
                away.push(item);
            }
        });
        // fallback: se tutti hanno lo stesso participant_id, metti tutti in home
        if (home.length === 0 && sidelined.length > 0) {
            return { home: sidelined, away: [] };
        }
        return { home, away };
    }, [sidelined]);

    return (
        <div className="w-full bg-white select-none default-spacing">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-6 py-2 bg-gray-100 rounded-t-lg">
                <div className="flex items-center gap-4">
                    <img
                        src={homeImagePath || "https://cdn.sportmonks.com/images/soccer/placeholder.png"}
                        className="w-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:w-10"
                        alt={homeTeamName}
                        draggable={false}
                    />
                </div>
                <p className="text-sm font-medium sm:text-base">Infortunati</p>
                <div className="flex items-center gap-4">
                    <img
                        src={awayImagePath || "https://cdn.sportmonks.com/images/soccer/placeholder.png"}
                        className="w-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:w-10"
                        alt={awayTeamName}
                        draggable={false}
                    />
                </div>
            </div>
            {/* Body */}
            <div className="flex flex-col w-full gap-2 px-2 py-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8 lg:px-8">
                {/* Home */}
                <div className="flex-1">
                    <div className="mb-2 text-sm text-center text-default/60">
                        {grouped.home.length} Giocator{grouped.home.length !== 1 ? "i" : "e"}
                    </div>
                    <div className="space-y-4">
                        {grouped.home.map((item) => {
                            const { player, type } = item.sideline;
                            return (
                                <div
                                    onClick={() => handlePlayerClick(item)}
                                    key={item.id}
                                    className="flex items-center gap-4 px-4 py-3 text-xs transition-all duration-300 ease-in-out border border-transparent rounded-lg shadow cursor-pointer bg-gradient-to-br from-white to-gray-50 hover:shadow-md md:text-base"
                                >
                                    <img
                                        src={player.image_path}
                                        alt={player.display_name}
                                        className="object-cover w-12 h-12 rounded-full"
                                        draggable={false}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-default/80 md:text-base">{player.display_name}</span>
                                        <span className="text-xs text-default/50 md:text-sm">{type.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Away */}
                <div className="flex-1">
                    <div className="mb-2 text-sm text-center text-default/60">
                        {grouped.away.length} Giocator{grouped.away.length !== 1 ? "i" : "e"}
                    </div>
                    <div className="space-y-4">
                        {grouped.away.map((item) => {
                            const { player, type } = item.sideline;
                            return (
                                <div
                                    onClick={() => handlePlayerClick(item)}
                                    key={item.id}
                                    className="flex items-center gap-4 px-4 py-3 text-xs transition-all duration-300 ease-in-out border border-transparent rounded-lg shadow cursor-pointer bg-gradient-to-br from-white to-gray-50 hover:shadow-md md:text-base"
                                >
                                    <img
                                        src={player.image_path}
                                        alt={player.display_name}
                                        className="object-cover w-12 h-12 rounded-full"
                                        draggable={false}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-default/80 md:text-base">{player.display_name}</span>
                                        <span className="text-xs text-default/50 md:text-sm">{type.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};