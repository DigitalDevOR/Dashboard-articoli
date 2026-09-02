import React, { useEffect, useState } from 'react';
import { useGetUserSchedineQuery } from '../store/api/schedinaApi';

interface Schedina {
    _id?: string;
    pronostici: any[]; // Puoi specificare meglio il tipo se conosci la struttura dei pronostici
    userId?: string;
    legaId: {
        _id: string;
        nome: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface Pronostico {
    fixtureId: string;
    home: string;
    away: string;
    odd: {
        id: string;
        label: string;
    };
    legaId: string;
    userId: string;
}

interface SchedinaGrouped {
    legaNome: string;
    legaId: string;
    schedine: Schedina[];
    totalScheduline: number;
}

const PlayerSchedine: React.FC = () => {
    const { data, isLoading, error } = useGetUserSchedineQuery();
    const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());
    const [groupedScheduline, setGroupedScheduline] = useState<SchedinaGrouped[]>([]);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            // Cast dei dati al tipo locale Schedina
            const localData = data as Schedina[];

            // Raggruppa le schedine per lega
            const grouped = localData.reduce((acc: { [key: string]: SchedinaGrouped }, schedina: Schedina) => {
                const legaNome = schedina.legaId?.nome || 'Lega sconosciuta';
                const legaId = schedina.legaId?._id || 'unknown';

                if (!acc[legaId]) {
                    acc[legaId] = {
                        legaNome,
                        legaId,
                        schedine: [],
                        totalScheduline: 0
                    };
                }

                acc[legaId].schedine.push(schedina);
                acc[legaId].totalScheduline++;

                return acc;
            }, {});

            // Converti in array e ordina per nome lega
            const groupedArray = Object.values(grouped).sort((a, b) =>
                a.legaNome.localeCompare(b.legaNome)
            );

            setGroupedScheduline(groupedArray);
        }
    }, [data]);

    const toggleLeague = (legaId: string) => {
        const newExpanded = new Set(expandedLeagues);
        if (newExpanded.has(legaId)) {
            newExpanded.delete(legaId);
        } else {
            newExpanded.add(legaId);
        }
        setExpandedLeagues(newExpanded);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Data non disponibile';
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <span className="text-gray-600">Caricamento schedine...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="flex items-center justify-center w-16 h-16 mb-4 text-red-500 bg-red-100 rounded-full">
                    <span className="text-2xl material-symbols-outlined">error</span>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-red-700">Errore nel caricamento</h2>
                <p className="text-red-600">Impossibile recuperare le schedine</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="flex items-center justify-center w-16 h-16 mb-4 text-gray-400 bg-gray-100 rounded-full">
                    <span className="text-2xl material-symbols-outlined">description</span>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-700">Nessuna schedina trovata</h2>
                <p className="text-gray-600">Non hai ancora giocato nessuna schedina</p>
            </div>
        );
    }

    return (
        <div className="p-4 select-none bg-neutral-50 page-content">
            <div className="mb-8">
                <h1 className="mb-4 text-lg font-semibold text-primary">Le Mie Schedine</h1>
                <p className="text-sm text-gray-600">
                    Visualizza tutte le tue schedine raggruppate per lega
                </p>
            </div>

            <div className="space-y-4">
                {groupedScheduline.map((group) => (
                    <div key={group.legaId} className="bg-white border border-gray-200 rounded-lg shadow-md">
                        {/* Header della lega */}
                        <div
                            className="flex items-center justify-between gap-4 p-4 transition-colors cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleLeague(group.legaId)}
                        >
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-primary">
                                        {group.legaNome}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {group.totalScheduline} schedina{group.totalScheduline !== 1 ? 'e' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                                    {group.totalScheduline}
                                </span>
                                <span className={`material-symbols-outlined transition-transform ${expandedLeagues.has(group.legaId) ? 'rotate-180' : ''
                                    }`}>
                                    <i className="ri-arrow-right-s-line"></i>
                                </span>
                            </div>
                        </div>

                        {/* Schedine espanse */}
                        {expandedLeagues.has(group.legaId) && (
                            <div className="border-t border-gray-200">
                                {group.schedine.map((schedina, index) => (
                                    <div key={schedina._id || `schedina-${index}`} className={`p-4 ${index !== group.schedine.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-800">
                                                Schedina #{schedina._id?.slice(-6) || `temp-${index}`}
                                            </h4>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(schedina.createdAt)}
                                            </span>
                                        </div>

                                        {/* Pronostici della schedina */}
                                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                            {schedina.pronostici && schedina.pronostici.map((pronostico: any, idx: number) => (
                                                <div key={`${pronostico?.fixtureId || idx}-${idx}`} className="p-3 rounded-lg bg-gray-50">
                                                    <div className="mb-1 text-sm font-medium text-gray-800">
                                                        {pronostico?.home || 'N/A'} vs {pronostico?.away || 'N/A'}
                                                    </div>
                                                    <div className="text-xs font-medium text-blue-600">
                                                        {pronostico?.odd?.label || 'N/A'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between mt-3 text-sm">
                                            <span className="text-gray-600">
                                                {schedina.pronostici?.length || 0} pronostic{(schedina.pronostici?.length || 0) !== 1 ? 'i' : 'o'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerSchedine;