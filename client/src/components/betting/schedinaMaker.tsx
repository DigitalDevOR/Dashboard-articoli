import * as React from 'react';
import { X } from "lucide-react";
import { useGetMatchPremiumOddsByFixtureIdQuery, useGetMatchStandardOddsByFixtureIdQuery } from '../../store/api/sportMonkApi';
import { useCreateTempPronosticoMutation } from '../../store/api/tempPronostici';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';



interface SchedinaMakerProps {
    fixtureId?: string;
    home?: string;
    away?: string;
    onClose?: () => void; // <--- aggiungi questa prop
    legaId?: string; // <--- aggiungi questa prop opzionale
}

type Odd = {
    id: number;
    fixture_id: number;
    market_id: number;
    bookmaker_id: number;
    label: string;
    value?: string;
    sort_order?: number;
    market_description?: string;
    name?: string | null;
    probability?: number | null;
    dp3?: string;
    fractional?: string | null;
    american?: string | null;
    winning: boolean;
    stopped: boolean;
    total?: number | null;
    handicap?: string | null;
    partecipants?: any[] | null;
    created_at?: string;
    original_label?: string | null;
    latest_bookmaker_update: string;
};

type SelectedOdd = {
    odd: Odd;
    source: 'premium' | 'standard';
};

const groupByMarket = (odds: Odd[]) => {
    const grouped: Record<number, { description: string; odds: Odd[] }> = {};
    odds.forEach(odd => {
        if (!grouped[odd.market_id]) {
            grouped[odd.market_id] = { description: odd.market_description ?? `Mercato ${odd.market_id}`, odds: [] };
        }
        grouped[odd.market_id].odds.push(odd);
    });
    return grouped;
};

// Menu orizzontale riutilizzabile
const HorizontalMarketMenu: React.FC<{
    markets: { id: number; description: string }[];
    selectedMarketId: number;
    onSelect: (id: number) => void;
}> = ({ markets, selectedMarketId, onSelect }) => (
    <div className="flex gap-2 py-2 mb-6 overflow-x-auto border-b border-neutral-200">
        {markets.map(market => (
            <Button
                key={market.id}
                variant={selectedMarketId === market.id ? "default" : "outline"}
                className="px-4 rounded-full whitespace-nowrap"
                onClick={() => onSelect(market.id)}
            >
                {market.description}
            </Button>
        ))}
    </div>
);

const SchedinaMaker: React.FC<SchedinaMakerProps> = ({ fixtureId, home, away, onClose, legaId }) => {
    const [selectedOdds, setSelectedOdds] = React.useState<SelectedOdd[]>([]);
    const [selectedMarketId, setSelectedMarketId] = React.useState<number | null>(null);

    const { toast } = useToast();
    //const { data: premiumOdds, isLoading: isPremiumLoading, error: premiumError } = useGetMatchPremiumOddsByFixtureIdQuery({ fixtureId: fixtureId ?? "" });
    const { data: standardOdds, isLoading: isStandardLoading, error: standardError } = useGetMatchStandardOddsByFixtureIdQuery({ fixtureId: fixtureId ?? "" });
    const [createTempPronostico, { isLoading: isSaving }] = useCreateTempPronosticoMutation();

    React.useEffect(() => {
        console.log("Standard Odds Data:", standardOdds);
    }, [standardOdds]);

    React.useEffect(() => {
        console.log("Selected selectedOdds: ", selectedOdds);
    }, [selectedOdds]);
    //const premiumOddsArr: Odd[] = premiumOdds?.data || [];
    const standardOddsArr: Odd[] = standardOdds?.oddsData?.data || [];

    //const premiumMarkets = groupByMarket(premiumOddsArr);

    const standardMarkets = groupByMarket(standardOddsArr);

    const allMarketIds = Array.from(new Set([
        //...Object.keys(premiumMarkets).map(Number),
        ...Object.keys(standardMarkets).map(Number)
    ]));

    const marketList = React.useMemo(() => allMarketIds.map(id => ({
        id,
        description: /* premiumMarkets[id]?.description || */ standardMarkets[id]?.description || `Mercato ${id}`
    })), [allMarketIds, /*premiumMarkets,*/ standardMarkets]);

    React.useEffect(() => {
        if (selectedMarketId === null && marketList.length > 0) {
            setSelectedMarketId(marketList[0].id);
        }
    }, [marketList, selectedMarketId]);

    const handleSelect = (odd: Odd, source: 'premium' | 'standard') => {
        if (selectedOdds.length > 0 && selectedOdds[0].odd.id === odd.id) {
            setSelectedOdds([]); // Deseleziona se già selezionata
        } else {
            setSelectedOdds([{ odd, source }]);
        }
    };

    const handleConfermaPronostico = async () => {
        if (!selectedOdds.length) return;
        const sel = selectedOdds[0];
        try {
            await createTempPronostico({
                fixtureId,
                home,
                away,
                odd: {
                    id: sel.odd.id,
                    fixture_id: sel.odd.fixture_id,
                    market_id: sel.odd.market_id,
                    bookmaker_id: sel.odd.bookmaker_id,
                    winning: sel.odd.winning,
                    stopped: sel.odd.stopped,
                    latest_bookmaker_update: sel.odd.latest_bookmaker_update,
                    label: sel.odd.label,

                },
                legaId, // <-- Passa la legaId come prop a SchedinaMaker!
            }).unwrap();
            setSelectedOdds([]);
            if (onClose) onClose();
        } catch (e) {
            // Gestisci errore
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante il salvataggio del pronostico",
                variant: "destructive",
            });
        }
    };

    const premium = /*selectedMarketId ? (premiumMarkets[selectedMarketId]?.odds || []) : [];*/[];
    const standard = selectedMarketId ? (standardMarkets[selectedMarketId]?.odds || []) : [];
    const description = selectedMarketId
        ? (/*premiumMarkets[selectedMarketId]?.description || */standardMarkets[selectedMarketId]?.description || `Mercato ${selectedMarketId}`)
        : '';

    /* if (isPremiumLoading || isStandardLoading) {
         return <div className="flex items-center justify-center h-full">Loading...</div>;
     }
     if (premiumError || standardError) {
         return <div className="flex items-center justify-center h-full text-red-600">Errore nel caricamento delle quote</div>;
     }*/

    return (
        <div className="relative w-full max-w-full min-h-[calc(100vh-64px)] py-4 mx-auto overflow-hidden sm:max-w-2xl">
            {/* Icona X per chiudere */}
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute z-10 p-2 transition border-2 rounded-full top-6 right-4 hover:bg-[#ffd500] border-[#ffd500]"
                    title="Chiudi"
                >
                    <X size={24} />
                </button>
            )}
            <Card className="h-full p-4">
                <CardHeader>
                    <CardTitle>
                        {home} vs {away}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <HorizontalMarketMenu
                        markets={marketList}
                        selectedMarketId={selectedMarketId ?? 0}
                        onSelect={setSelectedMarketId}
                    />

                    <form>
                        {selectedMarketId && (
                            <fieldset className="mb-6">
                                <legend className="mb-2 font-semibold">{description}</legend>
                                <div className="flex flex-wrap gap-3">
                                    {[/*...premium.map(odd => ({ ...odd, source: 'premium' as const })), */...standard.map(odd => ({ ...odd, source: 'standard' as const }))]
                                        .map(odd => (
                                            <Button
                                                key={odd.id}
                                                variant={selectedOdds.length > 0 && selectedOdds[0].odd.id === odd.id ? "default" : "outline"}
                                                className={`flex-1 px-4 ${/*odd.source === 'premium' ? 'border-blue-500' : ''}*/''}`}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleSelect(odd, odd.source);
                                                }}
                                                title={`${odd.label} ${odd.handicap ? `(${odd.handicap})` : ''} @ ${odd.value} ${/*odd.source === 'premium' ? '(Premium)' : ''}*/''}`}
                                            >
                                                <span className={/*odd.source === 'premium' ? "font-bold text-blue-700" : ""*/''}>
                                                    {odd.label} {odd.handicap ? `(${odd.handicap})` : ''} @ {odd.value} {/*{odd.source === 'premium' ? '(Premium)' : ''}*/}
                                                </span>
                                            </Button>
                                        ))}
                                </div>
                            </fieldset>
                        )}
                    </form>
                    <div className="mt-6">
                        <h3 className="mb-2 font-semibold">Schedina selezionata:</h3>
                        <ul className="mb-4">
                            {selectedOdds.map(sel => (
                                <li key={sel.odd.id}>
                                    <b>{sel.odd.market_description}</b>: {sel.odd.label} {sel.odd.handicap ? `(${sel.odd.handicap})` : ''} @ {sel.odd.value} <span className={sel.source === 'premium' ? 'text-blue-700' : 'text-gray-700'}>{sel.source === 'premium' ? 'Premium' : 'Standard'}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            type="button"
                            disabled={selectedOdds.length === 0 || isSaving}
                            onClick={handleConfermaPronostico}
                        >
                            {isSaving ? "Salvataggio..." : "Conferma pronostico"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export const SchedinaMakerTest = () => (
    <SchedinaMaker fixtureId="19427098" home="Napoli" away="Juventus" />
);

export default SchedinaMaker;
