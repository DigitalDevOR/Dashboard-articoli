import React, { useState } from "react";

type Team = {
    id: number;
    name: string;
    image_path: string;
};

type PredictionType = {
    id: number;
    name: string;
    code: string;
};

type Prediction = {
    id: number;
    fixture_id: number;
    predictions: Record<string, any>;
    type_id: number;
    type: PredictionType;
};

type MatchPredictionsProps = {
    homeTeam?: Team;
    awayTeam?: Team;
    predictions: Record<string, Prediction>;
};

const getLabel = (type: PredictionType) => {
    return type?.name || type?.code || "Prediction";
};

const getPredictionKeys = (prediction: Prediction) => {
    return Object.keys(prediction.predictions).filter(
        k => typeof prediction.predictions[k] === "number"
    );
};

// Raggruppa predictions per type_id
function groupByTypeId(predictionsArray: Prediction[]) {
    const map: Record<number, Prediction[]> = {};
    for (const pred of predictionsArray) {
        if (!map[pred.type_id]) map[pred.type_id] = [];
        map[pred.type_id].push(pred);
    }
    return map;
}

const MatchPredictions: React.FC<MatchPredictionsProps> = ({
    homeTeam,
    awayTeam,
    predictions,
}) => {
    // Controllo esistenza e coerenza predictions
    if (!predictions || typeof predictions !== "object" || Object.keys(predictions).length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-32 text-gray-500">
                Nessun dato disponibile
            </div>
        );
    }

    // Trasforma l'oggetto predictions in array
    const predictionsArray = Object.values(predictions).filter(Boolean);

    if (!Array.isArray(predictionsArray) || predictionsArray.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-32 text-gray-500">
                Nessun dato disponibile
            </div>
        );
    }

    // Raggruppa per type_id
    const grouped = groupByTypeId(predictionsArray);

    // Ordina i gruppi per type_id
    const sortedTypeIds = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b);

    if (sortedTypeIds.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-32 text-gray-500">
                Nessun dato disponibile
            </div>
        );
    }

    // Stato: quale gruppo/type_id è selezionato
    const [selectedTypeId, setSelectedTypeId] = useState(sortedTypeIds[0] ?? null);

    // Prendi tutte le predictions di quel gruppo
    const selectedPredictions = selectedTypeId ? grouped[selectedTypeId] : [];

    // Usa la prima prediction del gruppo per label/tab
    const firstPrediction = selectedPredictions[0];

    // Se non ci sono predictions selezionate o dati incoerenti
    if (!firstPrediction) {
        return (
            <div className="flex items-center justify-center w-full h-32 text-gray-500">
                Nessun dato disponibile
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md expansion-hub default-page-spacing">
            {/* Header */}
            <div className="flex items-center justify-between w-full px-6 py-2 pb-3 bg-gray-100">
                <div className="flex items-center gap-2">
                    <img
                        src={homeTeam?.image_path || ""}
                        alt={homeTeam?.name || "Home Logo"}
                        className="object-contain w-8 h-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:h-10 sm:w-10"
                    />
                </div>
                <div className="text-sm font-medium sm:text-base">Predictions</div>
                <div className="flex items-center gap-2">
                    <img
                        src={awayTeam?.image_path || ""}
                        alt={awayTeam?.name || "Away Logo"}
                        className="object-contain w-8 h-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:h-10 sm:w-10"
                    />
                </div>
            </div>
            {/* Tabs */}
            <div className="px-2 pb-4 sm:px-4">
                <div className="space-y-10">
                    <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex w-full gap-2 py-6 overflow-x-scroll">
                            {sortedTypeIds.map(typeId => {
                                const pred = grouped[typeId][0];
                                if (!pred || !pred.type) return null;
                                return (
                                    <button
                                        key={typeId}
                                        // --- INIZIO MODIFICA GRAFICA LABEL BUTTON ---
                                        // Imposta larghezza fissa per i pulsanti delle label/tab
                                        // Puoi cambiare w-40/min-w-[160px] per adattare la larghezza desiderata
                                        className={`w-40 min-w-[160px] px-6 py-2 rounded-full ${selectedTypeId === typeId
                                            ? "bg-gray-100 text-gray-700 shadow-xl border border-gray-500"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                                            }`}
                                        onClick={() => setSelectedTypeId(typeId)}
                                    >
                                        <span className="w-fit">{getLabel(pred.type)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Prediction Section */}
                    {firstPrediction ? (
                        <div className="flex flex-col w-full h-auto gap-4">
                            <div className="p-2 ml-3 text-sm uppercase transition-all duration-300 ease-in-out border rounded-md shadow-xl cursor-pointer w-fit border-primary bg-primary/10">
                                {getLabel(firstPrediction.type)}
                            </div>
                            <div
                                className="h-auto px-3 py-6"
                                style={{
                                    overflowY: "visible",
                                    height: "auto",
                                    maxHeight: "none"
                                }}
                            >
                                <div className="w-full">
                                    {/* Special rendering for HT/FT (type_id: 232) */}
                                    {firstPrediction.type_id === 232 ? (
                                        <div className="flex flex-col w-full gap-2">
                                            {/* Header row */}
                                            <div className="grid items-center grid-cols-4 gap-1">
                                                <div className="px-1 py-2 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <div className="text-xs font-medium text-gray-500">HT</div>
                                                        <div className="text-xs font-medium text-gray-500">/</div>
                                                        <div className="text-xs font-medium text-gray-500">FT</div>
                                                    </div>
                                                </div>
                                                <div className="py-1 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <img src={homeTeam?.image_path || ""} alt="Home Team" className="object-contain w-5 h-5 mb-1" />
                                                        <div className="text-xs font-medium text-gray-500">Home</div>
                                                    </div>
                                                </div>
                                                <div className="py-1 text-xs font-medium text-center text-gray-600">Draw</div>
                                                <div className="py-1 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <img src={awayTeam?.image_path || ""} alt="Away Team" className="object-contain w-5 h-5 mb-1" />
                                                        <div className="text-xs font-medium text-gray-500">Away</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic rows */}
                                            {selectedPredictions.map(prediction => {
                                                if (!prediction || !prediction.predictions) return null;
                                                const keys = getPredictionKeys(prediction);
                                                if (!keys || keys.length === 0) return null;
                                                const rows: string[][] = [];
                                                for (let i = 0; i < keys.length; i += 3) {
                                                    rows.push(keys.slice(i, i + 3));
                                                }

                                                return rows.map((row, rowIdx) => (
                                                    <div key={prediction.id + "-" + rowIdx} className="grid items-center grid-cols-4 gap-1">
                                                        <div className="px-1 py-2 text-center">
                                                            <div className="flex items-center justify-center">
                                                                {rowIdx === 0 && (
                                                                    <>
                                                                        <img src={homeTeam?.image_path || ""} alt="Home Team" className="object-contain w-5 h-5 mr-1" />
                                                                        <div className="text-xs font-medium text-gray-500">Home</div>
                                                                    </>
                                                                )}
                                                                {rowIdx === 1 && (
                                                                    <div className="text-xs font-medium text-gray-600">Draw</div>
                                                                )}
                                                                {rowIdx === 2 && (
                                                                    <>
                                                                        <img src={awayTeam?.image_path || ""} alt="Away Team" className="object-contain w-5 h-5 mr-1" />
                                                                        <div className="text-xs font-medium text-gray-500">Away</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {row.map((key, idx) => (
                                                            <div
                                                                key={prediction.id + "-" + key}
                                                                className="p-2 text-center text-gray-700 transition-all duration-200 ease-in-out bg-gray-100 border border-gray-300 rounded-md shadow"
                                                            >
                                                                <div className="text-xs font-semibold">
                                                                    {key
                                                                        .split("_")
                                                                        .map(w => w[0]?.toUpperCase() || "")
                                                                        .join("")}
                                                                </div>
                                                                <div className="text-xs">
                                                                    {prediction.predictions[key] != null
                                                                        ? `${prediction.predictions[key].toFixed(2)}%`
                                                                        : "-"}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ));
                                            })}
                                        </div>

                                    ) : (
                                        // Generic rendering for other predictions
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                            {selectedPredictions.map(prediction =>
                                                prediction && prediction.predictions
                                                    ? getPredictionKeys(prediction).map(key => (
                                                        <div
                                                            key={prediction.id + "-" + key}
                                                            className="p-3 text-center text-gray-700 transition-all duration-300 ease-in-out bg-gray-100 border border-gray-300 rounded shadow-xl cursor-pointer"
                                                        >
                                                            <div className="text-xs font-medium uppercase">{key.replace(/_/g, " ")}</div>
                                                            <div className="text-base font-bold">
                                                                {prediction.predictions[key] != null
                                                                    ? `${prediction.predictions[key].toFixed(2)}%`
                                                                    : "-"}
                                                            </div>
                                                        </div>
                                                    ))
                                                    : null
                                            )}
                                            {/* Se ci sono oggetti annidati tipo "scores" */}
                                            {selectedPredictions.map(prediction =>
                                                prediction && prediction.predictions
                                                    ? Object.entries(prediction.predictions)
                                                        .filter(([k, v]) => typeof v === "object" && v !== null)
                                                        .map(([k, v]) => (
                                                            <div key={prediction.id + "-" + k} className="col-span-full">
                                                                <div className="mb-2 text-xs font-semibold uppercase">{k.replace(/_/g, " ")}</div>
                                                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                                                    {Object.entries(v as Record<string, number>).map(([score, val]) => (
                                                                        <div key={prediction.id + "-" + k + "-" + score} className="p-4 text-xs text-center bg-gray-100 border border-gray-300 rounded shadow-lg">
                                                                            <span className="font-medium text-gray-700">{score}</span>:{" "}
                                                                            <span className="font-medium text-blue-700">{val != null ? `${val.toFixed(2)}%` : "-"}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))
                                                    : null
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full h-32 text-gray-500">
                            Nessun dato disponibile
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchPredictions;