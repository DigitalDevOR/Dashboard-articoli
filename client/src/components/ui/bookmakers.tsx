import React, { useEffect } from "react";
import { useGetAllBookmakersQuery } from "../../store/api/sportMonkApi";

// Funzione per assegnare un colore di sfondo in base al nome
function getBookmakerColor(name: string): string {
    const colors = [
        "bg-blue-600", "bg-green-600", "bg-yellow-500", "bg-red-500",
        "bg-purple-600", "bg-pink-500", "bg-indigo-600", "bg-teal-500"
    ];
    if (!name) return "bg-gray-400";
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
}

const Bookmakers: React.FC = () => {
    const [page, setPage] = React.useState(1);
    const { data, error, isLoading } = useGetAllBookmakersQuery({ page });

    useEffect(() => {
        if (data) {
            console.log("Fetched bookmakers:", data);
        }
    }, [data]);

    if (isLoading) {
        return <div className="px-12 page-content">Caricamento...</div>;
    }
    if (error) {
        return <div className="px-12 text-red-600 page-content">Errore nel caricamento dei bookmakers.</div>;
    }

    const bookmakers = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="px-4 py-8 bg-white shadow-xl md:px-12 page-content rounded-2xl">
            <h2 className="mb-6 text-2xl font-bold">Bookmakers</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {bookmakers.map((bookmaker: any) => (
                    <div
                        key={bookmaker.id}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 shadow rounded-xl"
                    >
                        <div
                            className={`w-12 h-12 flex items-center justify-center rounded-full text-white text-xl font-bold ${getBookmakerColor(bookmaker.name)}`}
                        >
                            {bookmaker.name ? bookmaker.name[0].toUpperCase() : "?"}
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{bookmaker.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Paginazione */}
            {pagination && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Precedente
                    </button>
                    <span>
                        Pagina <b>{pagination.current_page}</b>
                    </span>
                    <button
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!pagination.has_more}
                    >
                        Successiva
                    </button>
                </div>
            )}
        </div>
    );
};

export default Bookmakers;