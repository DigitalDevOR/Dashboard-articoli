import React, { useEffect } from "react";
import { getEventIcon } from "../../utils/eventIcons";

type EventType = {
    id: number;
    name: string;
    code: string;
    developer_name: string;
    model_type: string;
    stat_group: string | null;
};

type PeriodType = {
    id: number;
    fixture_id: number;
    type_id: number;
    started: number;
    ended: number;
    counts_from: number;
    ticking: boolean;
    sort_order: number;
    description: string;
    time_added: number;
    period_length: number;
    minutes: number;
    seconds: number;
    has_timer: boolean;
};

type PlayerType = {
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
    gender: string;
};

type EventData = {
    id: number;
    fixture_id: number;
    period_id: number;
    participant_id: number;
    type_id: number;
    section: string;
    player_id: number;
    related_player_id: number | null;
    player_name: string;
    related_player_name: string | null;
    result: string | null;
    info: string | null;
    addition: string | null;
    minute: number;
    extra_minute: number | null;
    injured: boolean | null;
    on_bench: boolean;
    coach_id: number | null;
    sub_type_id: number | null;
    detailed_period_id: number;
    rescinded: boolean | null;
    sort_order: number;
    type: EventType;
    period: PeriodType;
    player: PlayerType;
};

type Props = {
    eventiData: EventData[];
    homeImagePath?: string;
    awayImagePath?: string;
    partecipantHomeId: number;
    partecipantAwayId: number;
};

function groupByPeriod(events: EventData[]) {
    const periods: Record<string, EventData[]> = {};
    events.forEach((e) => {
        const key = e.period?.description || "Other";
        if (!periods[key]) periods[key] = [];
        periods[key].push(e);
    });
    return periods;
}

export const MatchEventi: React.FC<Props> = ({
    eventiData,
    homeImagePath = "",
    awayImagePath = "",
    partecipantHomeId,
    partecipantAwayId
}) => {
    if (!eventiData || eventiData.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                Nessun evento disponibile.
            </div>
        );
    }

    const periods = groupByPeriod(eventiData);
    // Ordina gli eventi per ciascun tempo
    (periods["1st-half"] ?? []).sort((a, b) => a.minute - b.minute);
    (periods["2nd-half"] ?? []).sort((a, b) => a.minute - b.minute);


    return (
        <div className="w-full space-y-4 select-none text-default/80">
            {/* Header */}
            <div className="flex items-center justify-between w-full px-6 py-2 pb-3 bg-gray-100 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <img
                        src={homeImagePath || "https://cdn.sportmonks.com/images/soccer/placeholder.png"}
                        alt="Home Logo"
                        className="object-contain w-8 h-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:h-10 sm:w-10"
                        draggable={false}
                    />
                </div>
                <p className="text-sm font-medium sm:text-base">Timeline degli eventi</p>
                <div className="flex items-center gap-2">
                    <img
                        src={awayImagePath || "https://cdn.sportmonks.com/images/soccer/placeholder.png"}
                        alt="Away Logo"
                        className="object-contain w-8 h-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer sm:h-10 sm:w-10"
                        draggable={false}
                    />
                </div>
            </div>
            {/* Events by period */}
            {Object.entries(periods).map(([period, events]) => (
                <div key={period} className="px-6 pt-2 space-y-5">
                    {/* Period label */}
                    <div className="relative flex items-center justify-center">
                        <hr className="absolute left-0 right-0 h-px bg-gray-300 border-none" />
                        <span className="relative z-10 px-3 py-1 text-sm font-bold text-white uppercase bg-black rounded ">
                            {period}
                        </span>
                    </div>
                    {/* Mobile layout */}
                    <div className="block md:hidden">
                        <div className="space-y-4">
                            {events.map((evento) => (
                                <div key={evento.id} className="flex flex-col items-center gap-2">
                                    <div className="flex items-center justify-center rounded-full border-2 border-[#1893C1] bg-white p-2 text-sm font-bold text-[#1893C1] shadow-sm">
                                        {evento.minute}'
                                    </div>
                                    <div className="flex flex-col w-full transition-all duration-300 ease-in-out border border-transparent cursor-pointer">
                                        <div className={`w-full rounded-r border-l-4 ${evento.participant_id === evento.player_id ? "border-default" : "border-primary"} bg-white px-3 py-2 text-right shadow-sm transition-all hover:shadow-md`}>
                                            <div className="flex items-center justify-end space-x-2 text-sm">
                                                <img
                                                    src={evento.player?.image_path || "#"}
                                                    alt={evento.player?.display_name || "Giocatore"}
                                                    className="object-cover w-6 h-6 rounded-full"
                                                    draggable={false}
                                                />
                                                {getEventIcon(evento.type.code) && (
                                                    <img
                                                        src={getEventIcon(evento.type.code)}
                                                        className="w-5 h-5"
                                                        alt={evento.type.name}
                                                        draggable={false}
                                                    />
                                                )}
                                                <span className="font-semibold text-default/80">
                                                    {evento.player?.display_name || "Giocatore"}
                                                    {evento.related_player_name && (
                                                        <> ➜ {evento.related_player_name}</>
                                                    )}
                                                    {evento.result && (
                                                        <> ({evento.result})</>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-xs text-default/40">
                                                {evento.info}
                                                {evento.info && evento.addition && <span> / </span>}
                                                {evento.addition}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Desktop layout */}
                    <div className="hidden md:block">
                        <div className="space-y-4">
                            {events.map((evento) => (
                                <div key={evento.id} className="grid grid-cols-[1fr_auto_1fr]  items-center gap-2">
                                    {/* Home/Away alignment: you can improve this logic if you have team info */}
                                    <div className={('w-full pr-2 transition-all duration-300 ease-in-out border border-transparent cursor-pointer ' + (evento.participant_id === partecipantHomeId ? 'justify-start' : 'col-start-3'))}>
                                        <div className={`w-full rounded-r ${evento.participant_id === partecipantHomeId ? 'border-l-4' : 'border-r-4'}  ${evento.participant_id === partecipantHomeId ? "border-primary" : "border-default"} bg-white px-3 py-2 shadow-sm transition-all hover:shadow-md`}>
                                            <div className={("flex items-center space-x-2 text-sm " + (evento.participant_id === partecipantHomeId ? 'justify-start' : 'justify-end'))}>
                                                <img
                                                    src={evento.player?.image_path || "#"}
                                                    alt={evento.player?.display_name || "Giocatore"}
                                                    className="object-cover w-6 h-6 rounded-full"
                                                    draggable={false}
                                                />
                                                {getEventIcon(evento.type.code) && (
                                                    <img
                                                        src={getEventIcon(evento.type.code)}
                                                        className="w-5 h-5"
                                                        alt={evento.type.name}
                                                        draggable={false}
                                                    />
                                                )}
                                                <span className="font-semibold text-default/80">
                                                    {evento.player?.display_name || "Giocatore"}
                                                    {evento.related_player_name && (
                                                        <> ➜ {evento.related_player_name}</>
                                                    )}
                                                    {evento.result && (
                                                        <> ({evento.result})</>
                                                    )}
                                                </span>
                                            </div>
                                            <div className={('flex mt-1 ml-8 text-xs text-default/40 ' + (evento.participant_id === partecipantHomeId ? 'justify-start' : 'justify-end'))}>
                                                <div className="w-fit">
                                                    {evento.info}
                                                    {evento.info && evento.addition && <span> / </span>}
                                                    {evento.addition}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-start-2 row-start-1">
                                        <div className="flex items-center justify-center rounded-full border-2 border-[#1893C1] bg-white p-2 text-sm font-bold text-[#1893C1] shadow-sm">
                                            {evento.minute}'
                                        </div>
                                    </div>
                                    {/* Away side (empty for now, you can add logic if needed) */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};