import * as React from 'react';
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card';
import MatchEvent from './matchEvent';
import { motion } from "framer-motion";

type MatchTableProps = {
    data: any[]; // array delle leghe, ognuna con today: match[]
    sectionHeader?: string; // titolo della sezione
    sectionDescription?: string; // descrizione della sezione
};

const MODALS_KEY = "betmasterleague_open_modals";

const MatchTable: React.FC<MatchTableProps> = ({ data, sectionHeader = 'Partite di Oggi', sectionDescription = 'Tutte le partite in programma per oggi, divise per lega' }) => {
    // Stato: { [leagueId]: boolean }
    const [openModals, setOpenModals] = React.useState<{ [key: number]: boolean }>(() => {
        try {
            const saved = localStorage.getItem(MODALS_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Salva lo stato ogni volta che cambia
    React.useEffect(() => {
        localStorage.setItem(MODALS_KEY, JSON.stringify(openModals));
    }, [openModals]);

    // Ripristina lo stato se cambia la lista delle leghe (opzionale, utile se aggiorni i dati)
    React.useEffect(() => {
        const saved = localStorage.getItem(MODALS_KEY);
        if (saved) setOpenModals(JSON.parse(saved));
    }, [data]);

    const handleOpenModal = (leagueId: number) => {
        setOpenModals(prev => ({
            ...prev,
            [leagueId]: !prev[leagueId]
        }));
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{sectionHeader}</CardTitle>
                <CardDescription>
                    {sectionDescription}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                        Nessuna partita disponibile.
                    </div>
                )}
                <div className="flex flex-col gap-8">
                    {data.length !== 0
                        ? data.map(league => {
                            // Calcola la durata solo per apertura
                            const openDuration = 0.2 + (league.today.length * 0.1);
                            const isOpen = openModals[league.id];

                            return (
                                <motion.div
                                    key={league.id}
                                    initial={false}
                                    animate={{ height: isOpen ? "auto" : 56 }}
                                    transition={{
                                        duration: isOpen ? openDuration : 0.3
                                    }}
                                    style={{ overflow: "hidden", backgroundColor: "#fafafa" }}
                                    className="px-4 py-3 mb-2 border shadow-inner rounded-xl border-neutral-300 min-h-14"
                                >
                                    <div className="flex items-center justify-between w-full pb-2 mb-4 border-b border-neutral-300">
                                        <div className='flex items-center'>
                                            <img
                                                src={league.image_path}
                                                alt={league.name}
                                                className="w-8 h-8 mr-2 rounded shadow"
                                            />
                                            <span className="text-lg font-semibold">{league.name}</span>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => handleOpenModal(league.id)}
                                                className="p-1 transition rounded hover:bg-neutral-200"
                                                aria-label={isOpen ? "Chiudi dettagli" : "Apri dettagli"}
                                                style={{ outline: "none", border: "none", background: "none" }}
                                            >
                                                <motion.svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="text-neutral-600"
                                                >
                                                    <path
                                                        d="M5 8L10 13L15 8"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </motion.svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
                                        {league.today.map((match: any) => (
                                            <MatchEvent key={match.id} match={match} />
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })
                        : null}
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">Aggiornato ogni minuto</p>
            </CardFooter>
        </Card>
    );
};


export default MatchTable;