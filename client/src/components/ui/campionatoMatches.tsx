// CampionatoMatches.tsx
import { useEffect, useState } from "react";
import { useGetMatchsOfLeagueIdQuery } from "@/store/api/sportMonkApi";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext
} from "@/components/ui/pagination";
import MatchEvent from "@/components/ui/matchEvent";
import SchedinaMaker from "@/components/betting/schedinaMaker";
import { Dialog } from "@/components/ui/dialog"; // Usa il tuo componente modale/dialog
import { useLocation } from "wouter";

type Match = {
    id: number;
    participants?: Array<{
        name: string;
        meta?: {
            location?: string;
        };
    }>;
    // Add other properties as needed
};

export default function CampionatoMatches({ campionato, matchStateId, legaId, iscritto }) {
    const [page, setPage] = useState(() => {
        const saved = localStorage.getItem(`campionatoMatchesPage_${campionato.id}`);
        return saved ? Number(saved) : 1;
    });
    const [prevAnim, setPrevAnim] = useState(false);
    const [nextAnim, setNextAnim] = useState(false);
    const [schedinaOpen, setSchedinaOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    const { data, isLoading, error } = useGetMatchsOfLeagueIdQuery(
        { leagueId: campionato.id, page, match_state_filter: matchStateId, havingOdds: "true" },
        { skip: !matchStateId }
    );

    useEffect(() => {
        console.log("Data fetched campionatoMatches:", data);
    }, [data]);


    useEffect(() => {
        localStorage.setItem(`campionatoMatchesPage_${campionato.id}`, page.toString());
    }, [page, campionato.id]);

    useEffect(() => {
        if (prevAnim) {
            const timer = setTimeout(() => setPrevAnim(false), 400);
            return () => clearTimeout(timer);
        }
    }, [prevAnim]);

    useEffect(() => {
        if (nextAnim) {
            const timer = setTimeout(() => setNextAnim(false), 400);
            return () => clearTimeout(timer);
        }
    }, [nextAnim]);

    // Reset pagina se cambio campionato
    useEffect(() => {
        setPage(1);
    }, [campionato.id]);

    const currentPage = data?.pagination?.current_page || page;
    const hasMore = data?.pagination?.has_more ?? false;

    const handleNextClick = () => {
        if (isLoading || error || !hasMore) return;
        setPage(prev => prev + 1);
        setNextAnim(true);
    };

    const handlePrevClick = () => {
        if (isLoading || error || page === 1) return;
        setPage(prev => prev - 1);
        setPrevAnim(true);
    };

    const [, setLocation] = useLocation();

    // Funzione per aprire la modale con i dati del match o fare redirect
    const handleMatchClick = (match) => {
        if (iscritto) {
            setSelectedMatch(match);
            setSchedinaOpen(true);
        } else {
            setLocation(`/matches/${match.id}`);
        }
    };

    // Blocca lo scroll quando la modale è aperta
    useEffect(() => {
        if (schedinaOpen) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        // Cleanup in caso di smontaggio componente
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [schedinaOpen]);

    return (
        <div className="mb-24 select-none">
            {isLoading ? (
                <div className="text-gray-500">Caricamento partite...</div>
            ) : error ? (
                <div className="text-red-500">Errore nel caricamento partite</div>
            ) : !data?.data?.length ? (
                <div className="text-gray-500">Nessuna partita trovata.</div>
            ) : (
                <>
                    <ul className="space-y-2">
                        {data.data.map(match => (
                            <li key={match.id} className="select-none">
                                <MatchEvent
                                    match={match}
                                    showData={true}
                                    onClick={() => handleMatchClick(match)}
                                    isPartecipante={!!iscritto} // <--- aggiungi questa riga
                                />
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-center w-full">
                        <Pagination className="fixed z-50 p-2 mt-4 -translate-x-1/2 border border-gray-200 rounded-lg shadow-lg select-none bg-gray-100/50 w-fit bottom-20 left-1/2">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={handlePrevClick}
                                        aria-disabled={currentPage === 1 || isLoading}
                                        disabled={currentPage === 1 || isLoading}
                                        className={[
                                            currentPage === 1 || isLoading
                                                ? "opacity-50 cursor-not-allowed bg-gray-200"
                                                : "cursor-pointer",
                                            "transition-colors duration-200 hover:bg-transparent active:bg-blue-200"
                                        ].join(" ")}
                                    />
                                </PaginationItem>
                                <span className="px-4 py-2 text-sm font-medium text-gray-700 select-none">
                                    {currentPage}
                                </span>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={handleNextClick}
                                        aria-disabled={!hasMore || isLoading}
                                        disabled={!hasMore || isLoading}
                                        className={[
                                            !hasMore || isLoading
                                                ? "opacity-50 cursor-not-allowed bg-gray-200"
                                                : "cursor-pointer",
                                            "transition-colors duration-200 hover:bg-transparent active:bg-blue-200"
                                        ].join(" ")}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </>
            )}
            {schedinaOpen && selectedMatch && (
                <Dialog open={schedinaOpen} onOpenChange={setSchedinaOpen}>
                    <div
                        className="fixed inset-0 z-50 flex flex-col w-screen h-screen overflow-auto bg-white"
                        style={{ padding: 0, margin: 0 }}
                    >
                        <SchedinaMaker
                            fixtureId={selectedMatch.id}
                            home={selectedMatch.participants?.find(p => p.meta?.location === "home")?.name}
                            away={selectedMatch.participants?.find(p => p.meta?.location === "away")?.name}
                            onClose={() => setSchedinaOpen(false)} // <--- aggiungi questa riga
                            legaId={legaId}
                        />
                    </div>
                </Dialog>
            )}
        </div>
    );
}