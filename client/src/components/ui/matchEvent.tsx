import { useEffect, useState } from "react";
import { navigate } from "wouter/use-browser-location";
import { Button } from "@/components/ui/button";

interface MatchEventProps {
    match: any;
    showData?: boolean;
    onClick?: (match: any) => void; // nuova prop facoltativa
    isPartecipante?: boolean; // nuova prop per verificare se è un partecipante
}

const MatchEvent: React.FC<MatchEventProps> = ({ match, showData = false, onClick, isPartecipante = false }) => {
    const home = match.participants?.find((p: any) => p.meta?.location === "home");
    const away = match.participants?.find((p: any) => p.meta?.location === "away");

    const [scores, setScores] = useState<{ home: number; away: number, isPlaying: boolean }>({
        home: 0,
        away: 0,
        isPlaying: false
    });

    useEffect(() => {
        if (Array.isArray(match.scores) && match.scores.length > 0) {
            let homeScore = 0;
            let awayScore = 0;

            match.scores.forEach(element => {
                const goals = Number(element.score?.goals ?? 0);
                if (element.score?.participant === 'home') {
                    homeScore = Math.max(homeScore, goals);
                } else if (element.score?.participant === 'away') {
                    awayScore = Math.max(awayScore, goals);
                }
            });

            setScores({ home: homeScore, away: awayScore, isPlaying: true });
        } else {
            setScores({ home: 0, away: 0, isPlaying: false });
        }
    }, [match]);

    function formatTimeItalian(timestamp: number) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Rome'
        });
    }

    function formatDateItalian(timestamp: number) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'Europe/Rome'
        });
    }

    const defaultCardClick = () => {
        navigate(`/matches/${match.id}`);
    };

    const handleClick = () => {
        if (onClick) {
            onClick(match);
        } else {
            defaultCardClick();
        }
    };

    return (
        <div onClick={handleClick} className="flex flex-col gap-2 p-4 transition-shadow duration-200 bg-white border border-gray-100 rounded-lg shadow-sm cursor-pointer select-none hover:shadow-xl active:shadow-none">
            <div className="relative flex items-center justify-between w-full">
                {/* Home team */}
                <div className="flex items-center w-1/3 min-w-0 gap-2">
                    <div className="flex flex-col items-center w-full gap-1 sm:flex-row sm:items-center sm:gap-2">
                        <img src={home?.image_path} alt={home?.name} className="flex-shrink-0 rounded w-7 h-7" />
                        <span className="font-medium break-words max-w-[120px] line-clamp-2 text-center text-sm sm:text-base sm:text-left">
                            {home?.name}
                        </span>
                    </div>
                </div>
                {/* Score or VS */}
                <div className="absolute flex items-center justify-center w-16 h-full -translate-x-1/2 pointer-events-none left-1/2">
                    {
                        scores.isPlaying ? (
                            <span className="text-sm font-bold sm:text-lg text-primary">
                                {scores.home} - {scores.away}
                            </span>
                        ) : (
                            <span className="flex justify-center w-10 text-xs sm:text-sm text-muted-foreground">vs</span>
                        )
                    }
                </div>
                {/* Away team */}
                <div className="flex items-center justify-end w-1/3 min-w-0 gap-2">
                    <div className="flex flex-col items-center w-full gap-1 sm:flex-row-reverse sm:items-center sm:gap-2">
                        <img src={away?.image_path} alt={away?.name} className="flex-shrink-0 rounded w-7 h-7" />
                        <span className="font-medium break-words max-w-[120px] line-clamp-2 text-center text-sm sm:text-base sm:text-right">
                            {away?.name}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col">
                    {showData && (
                        <span className="text-xs text-gray-500">
                            {formatDateItalian(match.starting_at_timestamp)}
                        </span>
                    )}
                    <span className="text-sm font-semibold text-primary sm:text-base">
                        {formatTimeItalian(match.starting_at_timestamp)}
                    </span>
                </div>
                <span className="text-xs text-gray-500">{match.stage?.name}</span>
            </div>
            {onClick ? (
                <Button
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/matches/${match.id}`);
                    }}
                >
                    Vai al dettaglio evento
                </Button>
            ) : null}
        </div>
    );
};

export default MatchEvent;