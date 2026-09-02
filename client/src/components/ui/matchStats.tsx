// StatisticTable.tsx
import React, { useEffect } from "react";

type Statistic = {
    id: number;
    fixture_id: number;
    type_id: number;
    participant_id: number;
    data: { value: number };
    location: "home" | "away";
    type: {
        id: number;
        name: string;
        code: string;
        developer_name: string;
        model_type: string;
        stat_group: string;
    };
};

type StatisticTableProps = {
    stats: Statistic[];
    homeName?: string;
    awayName?: string;
    homeImagePath?: string;
    awayImagePath?: string;
};

export const StatisticTable: React.FC<StatisticTableProps> = ({
    stats,
    homeName = "Home",
    awayName = "Away",
    homeImagePath = "",
    awayImagePath = "",
}) => {

    useEffect(() => {
        console.log("StatisticTable mounted with stats:", stats);
    }, [stats]);
    // Raggruppa per type_id (stessa statistica per home/away)
    const grouped = React.useMemo(() => {
        const map: { [type_id: number]: { type: Statistic["type"]; home?: Statistic; away?: Statistic } } = {};
        stats.forEach(stat => {
            if (!map[stat.type_id]) {
                map[stat.type_id] = { type: stat.type };
            }
            map[stat.type_id][stat.location] = stat;
        });
        // Ordina per nome statistica
        return Object.values(map).sort((a, b) => a.type.name.localeCompare(b.type.name));
    }, [stats]);

    return (
        <div className="w-full select-none font-manrope">
            {/* Header con immagini e titolo */}
            <div className="flex items-center justify-between gap-2 px-6 py-2 bg-gray-100 rounded-t-lg select-none">
                <div className="flex items-center gap-4 select-none">
                    {
                        homeImagePath ? (
                            <img src={homeImagePath} className="w-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer select-none sm:w-10" alt={homeName} draggable={false} />
                        ) : (
                            <img src="#" className="w-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer select-none sm:w-10" alt={homeName} draggable={false} />
                        )
                    }
                </div>
                <p className="text-sm font-semibold tracking-wide select-none sm:text-base">Statistiche</p>
                <div className="flex items-center gap-4 select-none">
                    {
                        awayImagePath ? (
                            <img src={awayImagePath} className="w-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer select-none sm:w-10" alt={awayName} draggable={false} />
                        ) : (
                            <img src="#" className="w-8 transition-all duration-300 ease-in-out border border-transparent cursor-pointer select-none sm:w-10" alt={awayName} draggable={false} />
                        )
                    }
                </div>
            </div>
            {/* Statistiche */}
            <div className="px-6 py-6 mt-4 space-y-4 select-none">
                {grouped.map(({ type, home, away }) => {
                    const homeValue = typeof home?.data.value === "number" ? home.data.value : 0;
                    const awayValue = typeof away?.data.value === "number" ? away.data.value : 0;
                    const total = homeValue + awayValue;
                    const homePerc = total > 0 ? (homeValue / total) * 100 : 50;
                    const awayPerc = total > 0 ? (awayValue / total) * 100 : 50;

                    return (
                        <div key={type.id} className="space-y-1 select-none">
                            <div className="flex items-center justify-between gap-1 text-sm select-none">
                                <p className="text-sm p-1 border transition-all duration-300 ease-in-out cursor-pointer border-transparent min-w-[32px] text-center font-medium select-none">{home?.data.value ?? "-"}</p>
                                <p className="text-sm italic font-normal text-gray-700 select-none">{type.name}</p>
                                <p className="border transition-all duration-300 ease-in-out cursor-pointer border-transparent text-sm p-1 min-w-[32px] text-center font-medium select-none">{away?.data.value ?? "-"}</p>
                            </div>
                            <div className="flex px-2 transition-all duration-500 ease-in-out select-none">
                                <div
                                    className="flex h-1.5 w-full rounded-l-full bg-[#1893C1] transition-all duration-500 ease-in-out border border-transparent select-none"
                                    style={{ width: `${homePerc}%` }}
                                ></div>
                                <div
                                    className="flex h-1.5 w-full rounded-r-full bg-gray-300 transition-all duration-500 ease-in-out border border-transparent select-none"
                                    style={{ width: `${awayPerc}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Funzione che restituisce dati di esempio hardcodati
export function getMockSportMonkEventLiveStatistics(): Statistic[] {
    return [
        {
            "id": 433847693,
            "fixture_id": 19348381,
            "type_id": 46,
            "participant_id": 3867,
            "data": {
                "value": 42
            },
            "location": "home",
            "type": {
                "id": 46,
                "name": "Ball Safe",
                "code": "ball-safe",
                "developer_name": "BALL_SAFE",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847694,
            "fixture_id": 19348381,
            "type_id": 46,
            "participant_id": 14738,
            "data": {
                "value": 45
            },
            "location": "away",
            "type": {
                "id": 46,
                "name": "Ball Safe",
                "code": "ball-safe",
                "developer_name": "BALL_SAFE",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433848285,
            "fixture_id": 19348381,
            "type_id": 51,
            "participant_id": 3867,
            "data": {
                "value": 1
            },
            "location": "home",
            "type": {
                "id": 51,
                "name": "Offsides",
                "code": "offsides",
                "developer_name": "OFFSIDES",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847748,
            "fixture_id": 19348381,
            "type_id": 106,
            "participant_id": 14738,
            "data": {
                "value": 40
            },
            "location": "away",
            "type": {
                "id": 106,
                "name": "Duels Won",
                "code": "duels-won",
                "developer_name": "DUELS_WON",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847749,
            "fixture_id": 19348381,
            "type_id": 100,
            "participant_id": 3867,
            "data": {
                "value": 5
            },
            "location": "home",
            "type": {
                "id": 100,
                "name": "Interceptions",
                "code": "interceptions",
                "developer_name": "INTERCEPTIONS",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847757,
            "fixture_id": 19348381,
            "type_id": 44,
            "participant_id": 3867,
            "data": {
                "value": 28
            },
            "location": "home",
            "type": {
                "id": 44,
                "name": "Dangerous Attacks",
                "code": "dangerous-attacks",
                "developer_name": "DANGEROUS_ATTACKS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847765,
            "fixture_id": 19348381,
            "type_id": 86,
            "participant_id": 3867,
            "data": {
                "value": 3
            },
            "location": "home",
            "type": {
                "id": 86,
                "name": "Shots On Target",
                "code": "shots-on-target",
                "developer_name": "SHOTS_ON_TARGET",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847766,
            "fixture_id": 19348381,
            "type_id": 86,
            "participant_id": 14738,
            "data": {
                "value": 2
            },
            "location": "away",
            "type": {
                "id": 86,
                "name": "Shots On Target",
                "code": "shots-on-target",
                "developer_name": "SHOTS_ON_TARGET",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847767,
            "fixture_id": 19348381,
            "type_id": 42,
            "participant_id": 3867,
            "data": {
                "value": 6
            },
            "location": "home",
            "type": {
                "id": 42,
                "name": "Shots Total",
                "code": "shots-total",
                "developer_name": "SHOTS_TOTAL",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847769,
            "fixture_id": 19348381,
            "type_id": 50,
            "participant_id": 3867,
            "data": {
                "value": 4
            },
            "location": "home",
            "type": {
                "id": 50,
                "name": "Shots Outsidebox",
                "code": "shots-outsidebox",
                "developer_name": "SHOTS_OUTSIDEBOX",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847734,
            "fixture_id": 19348381,
            "type_id": 55,
            "participant_id": 14738,
            "data": {
                "value": 4
            },
            "location": "away",
            "type": {
                "id": 55,
                "name": "Free Kicks",
                "code": "free-kicks",
                "developer_name": "FREE_KICKS",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847754,
            "fixture_id": 19348381,
            "type_id": 1605,
            "participant_id": 14738,
            "data": {
                "value": 25
            },
            "location": "away",
            "type": {
                "id": 1605,
                "name": "Successful Dribbles Percentage",
                "code": "successful-dribbles-percentage",
                "developer_name": "SUCCESSFUL_DRIBBLES_PERCENTAGE",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847750,
            "fixture_id": 19348381,
            "type_id": 100,
            "participant_id": 14738,
            "data": {
                "value": 3
            },
            "location": "away",
            "type": {
                "id": 100,
                "name": "Interceptions",
                "code": "interceptions",
                "developer_name": "INTERCEPTIONS",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847755,
            "fixture_id": 19348381,
            "type_id": 43,
            "participant_id": 3867,
            "data": {
                "value": 39
            },
            "location": "home",
            "type": {
                "id": 43,
                "name": "Attacks",
                "code": "attacks",
                "developer_name": "ATTACKS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847759,
            "fixture_id": 19348381,
            "type_id": 56,
            "participant_id": 3867,
            "data": {
                "value": 4
            },
            "location": "home",
            "type": {
                "id": 56,
                "name": "Fouls",
                "code": "fouls",
                "developer_name": "FOULS",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847770,
            "fixture_id": 19348381,
            "type_id": 50,
            "participant_id": 14738,
            "data": {
                "value": 2
            },
            "location": "away",
            "type": {
                "id": 50,
                "name": "Shots Outsidebox",
                "code": "shots-outsidebox",
                "developer_name": "SHOTS_OUTSIDEBOX",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847817,
            "fixture_id": 19348381,
            "type_id": 78,
            "participant_id": 3867,
            "data": {
                "value": 10
            },
            "location": "home",
            "type": {
                "id": 78,
                "name": "Tackles",
                "code": "tackles",
                "developer_name": "TACKLES",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847871,
            "fixture_id": 19348381,
            "type_id": 57,
            "participant_id": 3867,
            "data": {
                "value": 2
            },
            "location": "home",
            "type": {
                "id": 57,
                "name": "Saves",
                "code": "saves",
                "developer_name": "SAVES",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847904,
            "fixture_id": 19348381,
            "type_id": 49,
            "participant_id": 14738,
            "data": {
                "value": 7
            },
            "location": "away",
            "type": {
                "id": 49,
                "name": "Shots Insidebox",
                "code": "shots-insidebox",
                "developer_name": "SHOTS_INSIDEBOX",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847872,
            "fixture_id": 19348381,
            "type_id": 57,
            "participant_id": 14738,
            "data": {
                "value": 3
            },
            "location": "away",
            "type": {
                "id": 57,
                "name": "Saves",
                "code": "saves",
                "developer_name": "SAVES",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847901,
            "fixture_id": 19348381,
            "type_id": 41,
            "participant_id": 3867,
            "data": {
                "value": 3
            },
            "location": "home",
            "type": {
                "id": 41,
                "name": "Shots Off Target",
                "code": "shots-off-target",
                "developer_name": "SHOTS_OFF_TARGET",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847903,
            "fixture_id": 19348381,
            "type_id": 49,
            "participant_id": 3867,
            "data": {
                "value": 2
            },
            "location": "home",
            "type": {
                "id": 49,
                "name": "Shots Insidebox",
                "code": "shots-insidebox",
                "developer_name": "SHOTS_INSIDEBOX",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847758,
            "fixture_id": 19348381,
            "type_id": 44,
            "participant_id": 14738,
            "data": {
                "value": 30
            },
            "location": "away",
            "type": {
                "id": 44,
                "name": "Dangerous Attacks",
                "code": "dangerous-attacks",
                "developer_name": "DANGEROUS_ATTACKS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847743,
            "fixture_id": 19348381,
            "type_id": 62,
            "participant_id": 3867,
            "data": {
                "value": 51
            },
            "location": "home",
            "type": {
                "id": 62,
                "name": "Long Passes",
                "code": "long-passes",
                "developer_name": "LONG_PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433848634,
            "fixture_id": 19348381,
            "type_id": 580,
            "participant_id": 14738,
            "data": {
                "value": 3
            },
            "location": "away",
            "type": {
                "id": 580,
                "name": "Big Chances Created",
                "code": "big-chances-created",
                "developer_name": "BIG_CHANCES_CREATED",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433848880,
            "fixture_id": 19348381,
            "type_id": 99,
            "participant_id": 14738,
            "data": {
                "value": 2
            },
            "location": "away",
            "type": {
                "id": 99,
                "name": "Accurate Crosses",
                "code": "accurate-crosses",
                "developer_name": "ACCURATE_CROSSES",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847768,
            "fixture_id": 19348381,
            "type_id": 42,
            "participant_id": 14738,
            "data": {
                "value": 9
            },
            "location": "away",
            "type": {
                "id": 42,
                "name": "Shots Total",
                "code": "shots-total",
                "developer_name": "SHOTS_TOTAL",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433848633,
            "fixture_id": 19348381,
            "type_id": 580,
            "participant_id": 3867,
            "data": {
                "value": 0
            },
            "location": "home",
            "type": {
                "id": 580,
                "name": "Big Chances Created",
                "code": "big-chances-created",
                "developer_name": "BIG_CHANCES_CREATED",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433848094,
            "fixture_id": 19348381,
            "type_id": 117,
            "participant_id": 14738,
            "data": {
                "value": 7
            },
            "location": "away",
            "type": {
                "id": 117,
                "name": "Key Passes",
                "code": "key-passes",
                "developer_name": "KEY_PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433848093,
            "fixture_id": 19348381,
            "type_id": 117,
            "participant_id": 3867,
            "data": {
                "value": 4
            },
            "location": "home",
            "type": {
                "id": 117,
                "name": "Key Passes",
                "code": "key-passes",
                "developer_name": "KEY_PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847902,
            "fixture_id": 19348381,
            "type_id": 41,
            "participant_id": 14738,
            "data": {
                "value": 6
            },
            "location": "away",
            "type": {
                "id": 41,
                "name": "Shots Off Target",
                "code": "shots-off-target",
                "developer_name": "SHOTS_OFF_TARGET",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433848665,
            "fixture_id": 19348381,
            "type_id": 581,
            "participant_id": 3867,
            "data": {
                "value": 0
            },
            "location": "home",
            "type": {
                "id": 581,
                "name": "Big Chances Missed",
                "code": "big-chances-missed",
                "developer_name": "BIG_CHANCES_MISSED",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433848666,
            "fixture_id": 19348381,
            "type_id": 581,
            "participant_id": 14738,
            "data": {
                "value": 3
            },
            "location": "away",
            "type": {
                "id": 581,
                "name": "Big Chances Missed",
                "code": "big-chances-missed",
                "developer_name": "BIG_CHANCES_MISSED",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847818,
            "fixture_id": 19348381,
            "type_id": 78,
            "participant_id": 14738,
            "data": {
                "value": 13
            },
            "location": "away",
            "type": {
                "id": 78,
                "name": "Tackles",
                "code": "tackles",
                "developer_name": "TACKLES",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433848663,
            "fixture_id": 19348381,
            "type_id": 34,
            "participant_id": 3867,
            "data": {
                "value": 2
            },
            "location": "home",
            "type": {
                "id": 34,
                "name": "Corners",
                "code": "corners",
                "developer_name": "CORNERS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847746,
            "fixture_id": 19348381,
            "type_id": 27264,
            "participant_id": 14738,
            "data": {
                "value": 15
            },
            "location": "away",
            "type": {
                "id": 27264,
                "name": "Successful Long Passes",
                "code": "successful-long-passes",
                "developer_name": "SUCCESSFUL_LONG_PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847731,
            "fixture_id": 19348381,
            "type_id": 53,
            "participant_id": 3867,
            "data": {
                "value": 7
            },
            "location": "home",
            "type": {
                "id": 53,
                "name": "Goal Kicks",
                "code": "goals-kicks",
                "developer_name": "GOAL_KICKS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433848636,
            "fixture_id": 19348381,
            "type_id": 58,
            "participant_id": 14738,
            "data": {
                "value": 1
            },
            "location": "away",
            "type": {
                "id": 58,
                "name": "Shots Blocked",
                "code": "shots-blocked",
                "developer_name": "SHOTS_BLOCKED",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847747,
            "fixture_id": 19348381,
            "type_id": 106,
            "participant_id": 3867,
            "data": {
                "value": 37
            },
            "location": "home",
            "type": {
                "id": 106,
                "name": "Duels Won",
                "code": "duels-won",
                "developer_name": "DUELS_WON",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433848664,
            "fixture_id": 19348381,
            "type_id": 34,
            "participant_id": 14738,
            "data": {
                "value": 1
            },
            "location": "away",
            "type": {
                "id": 34,
                "name": "Corners",
                "code": "corners",
                "developer_name": "CORNERS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847737,
            "fixture_id": 19348381,
            "type_id": 81,
            "participant_id": 3867,
            "data": {
                "value": 173
            },
            "location": "home",
            "type": {
                "id": 81,
                "name": "Successful Passes",
                "code": "successful-passes",
                "developer_name": "SUCCESSFUL_PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847732,
            "fixture_id": 19348381,
            "type_id": 53,
            "participant_id": 14738,
            "data": {
                "value": 4
            },
            "location": "away",
            "type": {
                "id": 53,
                "name": "Goal Kicks",
                "code": "goals-kicks",
                "developer_name": "GOAL_KICKS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433848286,
            "fixture_id": 19348381,
            "type_id": 51,
            "participant_id": 14738,
            "data": {
                "value": 3
            },
            "location": "away",
            "type": {
                "id": 51,
                "name": "Offsides",
                "code": "offsides",
                "developer_name": "OFFSIDES",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847692,
            "fixture_id": 19348381,
            "type_id": 82,
            "participant_id": 14738,
            "data": {
                "value": 60
            },
            "location": "away",
            "type": {
                "id": 82,
                "name": "Successful Passes Percentage",
                "code": "successful-passes-percentage",
                "developer_name": "SUCCESSFUL_PASSES_PERCENTAGE",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433845450,
            "fixture_id": 19348381,
            "type_id": 45,
            "participant_id": 14738,
            "data": {
                "value": 43
            },
            "location": "away",
            "type": {
                "id": 45,
                "name": "Ball Possession %",
                "code": "ball-possession",
                "developer_name": "BALL_POSSESSION",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847740,
            "fixture_id": 19348381,
            "type_id": 98,
            "participant_id": 14738,
            "data": {
                "value": 9
            },
            "location": "away",
            "type": {
                "id": 98,
                "name": "Total Crosses",
                "code": "total-crosses",
                "developer_name": "TOTAL_CROSSES",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847745,
            "fixture_id": 19348381,
            "type_id": 27264,
            "participant_id": 3867,
            "data": {
                "value": 13
            },
            "location": "home",
            "type": {
                "id": 27264,
                "name": "Successful Long Passes",
                "code": "successful-long-passes",
                "developer_name": "SUCCESSFUL_LONG_PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847751,
            "fixture_id": 19348381,
            "type_id": 27265,
            "participant_id": 3867,
            "data": {
                "value": 25
            },
            "location": "home",
            "type": {
                "id": 27265,
                "name": "Successful Long Passes Percentage",
                "code": "successful-long-passes-percentage",
                "developer_name": "SUCCESSFUL_LONG_PASSES_PERCENTAGE",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433848879,
            "fixture_id": 19348381,
            "type_id": 99,
            "participant_id": 3867,
            "data": {
                "value": 1
            },
            "location": "home",
            "type": {
                "id": 99,
                "name": "Accurate Crosses",
                "code": "accurate-crosses",
                "developer_name": "ACCURATE_CROSSES",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847736,
            "fixture_id": 19348381,
            "type_id": 60,
            "participant_id": 14738,
            "data": {
                "value": 21
            },
            "location": "away",
            "type": {
                "id": 60,
                "name": "Throwins",
                "code": "throwins",
                "developer_name": "THROWINS",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847733,
            "fixture_id": 19348381,
            "type_id": 55,
            "participant_id": 3867,
            "data": {
                "value": 5
            },
            "location": "home",
            "type": {
                "id": 55,
                "name": "Free Kicks",
                "code": "free-kicks",
                "developer_name": "FREE_KICKS",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433848635,
            "fixture_id": 19348381,
            "type_id": 58,
            "participant_id": 3867,
            "data": {
                "value": 0
            },
            "location": "home",
            "type": {
                "id": 58,
                "name": "Shots Blocked",
                "code": "shots-blocked",
                "developer_name": "SHOTS_BLOCKED",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847735,
            "fixture_id": 19348381,
            "type_id": 60,
            "participant_id": 3867,
            "data": {
                "value": 18
            },
            "location": "home",
            "type": {
                "id": 60,
                "name": "Throwins",
                "code": "throwins",
                "developer_name": "THROWINS",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433849753,
            "fixture_id": 19348381,
            "type_id": 54,
            "participant_id": 3867,
            "data": {
                "value": 6
            },
            "location": "home",
            "type": {
                "id": 54,
                "name": "Goal Attempts",
                "code": "goal-attempts",
                "developer_name": "GOAL_ATTEMPTS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847760,
            "fixture_id": 19348381,
            "type_id": 56,
            "participant_id": 14738,
            "data": {
                "value": 5
            },
            "location": "away",
            "type": {
                "id": 56,
                "name": "Fouls",
                "code": "fouls",
                "developer_name": "FOULS",
                "model_type": "statistic",
                "stat_group": "defensive"
            }
        },
        {
            "id": 433847738,
            "fixture_id": 19348381,
            "type_id": 81,
            "participant_id": 14738,
            "data": {
                "value": 113
            },
            "location": "away",
            "type": {
                "id": 81,
                "name": "Successful Passes",
                "code": "successful-passes",
                "developer_name": "SUCCESSFUL_PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847739,
            "fixture_id": 19348381,
            "type_id": 98,
            "participant_id": 3867,
            "data": {
                "value": 9
            },
            "location": "home",
            "type": {
                "id": 98,
                "name": "Total Crosses",
                "code": "total-crosses",
                "developer_name": "TOTAL_CROSSES",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847741,
            "fixture_id": 19348381,
            "type_id": 80,
            "participant_id": 3867,
            "data": {
                "value": 256
            },
            "location": "home",
            "type": {
                "id": 80,
                "name": "Passes",
                "code": "passes",
                "developer_name": "PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847742,
            "fixture_id": 19348381,
            "type_id": 80,
            "participant_id": 14738,
            "data": {
                "value": 187
            },
            "location": "away",
            "type": {
                "id": 80,
                "name": "Passes",
                "code": "passes",
                "developer_name": "PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433849039,
            "fixture_id": 19348381,
            "type_id": 108,
            "participant_id": 3867,
            "data": {
                "value": 6
            },
            "location": "home",
            "type": {
                "id": 108,
                "name": "Dribble Attempts",
                "code": "dribble-attempts",
                "developer_name": "DRIBBLED_ATTEMPTS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433849040,
            "fixture_id": 19348381,
            "type_id": 108,
            "participant_id": 14738,
            "data": {
                "value": 8
            },
            "location": "away",
            "type": {
                "id": 108,
                "name": "Dribble Attempts",
                "code": "dribble-attempts",
                "developer_name": "DRIBBLED_ATTEMPTS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433849041,
            "fixture_id": 19348381,
            "type_id": 109,
            "participant_id": 3867,
            "data": {
                "value": 3
            },
            "location": "home",
            "type": {
                "id": 109,
                "name": "Successful Dribbles",
                "code": "successful-dribbles",
                "developer_name": "SUCCESSFUL_DRIBBLES",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433849042,
            "fixture_id": 19348381,
            "type_id": 109,
            "participant_id": 14738,
            "data": {
                "value": 2
            },
            "location": "away",
            "type": {
                "id": 109,
                "name": "Successful Dribbles",
                "code": "successful-dribbles",
                "developer_name": "SUCCESSFUL_DRIBBLES",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433847691,
            "fixture_id": 19348381,
            "type_id": 82,
            "participant_id": 3867,
            "data": {
                "value": 68
            },
            "location": "home",
            "type": {
                "id": 82,
                "name": "Successful Passes Percentage",
                "code": "successful-passes-percentage",
                "developer_name": "SUCCESSFUL_PASSES_PERCENTAGE",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847753,
            "fixture_id": 19348381,
            "type_id": 1605,
            "participant_id": 3867,
            "data": {
                "value": 50
            },
            "location": "home",
            "type": {
                "id": 1605,
                "name": "Successful Dribbles Percentage",
                "code": "successful-dribbles-percentage",
                "developer_name": "SUCCESSFUL_DRIBBLES_PERCENTAGE",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433845449,
            "fixture_id": 19348381,
            "type_id": 45,
            "participant_id": 3867,
            "data": {
                "value": 57
            },
            "location": "home",
            "type": {
                "id": 45,
                "name": "Ball Possession %",
                "code": "ball-possession",
                "developer_name": "BALL_POSSESSION",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433849461,
            "fixture_id": 19348381,
            "type_id": 84,
            "participant_id": 3867,
            "data": {
                "value": 0
            },
            "location": "home",
            "type": {
                "id": 84,
                "name": "Yellowcards",
                "code": "yellowcards",
                "developer_name": "YELLOWCARDS",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847744,
            "fixture_id": 19348381,
            "type_id": 62,
            "participant_id": 14738,
            "data": {
                "value": 43
            },
            "location": "away",
            "type": {
                "id": 62,
                "name": "Long Passes",
                "code": "long-passes",
                "developer_name": "LONG_PASSES",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847752,
            "fixture_id": 19348381,
            "type_id": 27265,
            "participant_id": 14738,
            "data": {
                "value": 35
            },
            "location": "away",
            "type": {
                "id": 27265,
                "name": "Successful Long Passes Percentage",
                "code": "successful-long-passes-percentage",
                "developer_name": "SUCCESSFUL_LONG_PASSES_PERCENTAGE",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433849462,
            "fixture_id": 19348381,
            "type_id": 84,
            "participant_id": 14738,
            "data": {
                "value": 1
            },
            "location": "away",
            "type": {
                "id": 84,
                "name": "Yellowcards",
                "code": "yellowcards",
                "developer_name": "YELLOWCARDS",
                "model_type": "statistic",
                "stat_group": "overall"
            }
        },
        {
            "id": 433847756,
            "fixture_id": 19348381,
            "type_id": 43,
            "participant_id": 14738,
            "data": {
                "value": 42
            },
            "location": "away",
            "type": {
                "id": 43,
                "name": "Attacks",
                "code": "attacks",
                "developer_name": "ATTACKS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433849754,
            "fixture_id": 19348381,
            "type_id": 54,
            "participant_id": 14738,
            "data": {
                "value": 8
            },
            "location": "away",
            "type": {
                "id": 54,
                "name": "Goal Attempts",
                "code": "goal-attempts",
                "developer_name": "GOAL_ATTEMPTS",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433860881,
            "fixture_id": 19348381,
            "type_id": 64,
            "participant_id": 3867,
            "data": {
                "value": 0
            },
            "location": "home",
            "type": {
                "id": 64,
                "name": "Hit Woodwork",
                "code": "hit-woodwork",
                "developer_name": "HIT_WOODWORK",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        },
        {
            "id": 433860882,
            "fixture_id": 19348381,
            "type_id": 64,
            "participant_id": 14738,
            "data": {
                "value": 1
            },
            "location": "away",
            "location": "away",
            "type": {
                "id": 64,
                "name": "Hit Woodwork",
                "code": "hit-woodwork",
                "developer_name": "HIT_WOODWORK",
                "model_type": "statistic",
                "stat_group": "offensive"
            }
        }
    ];
}
// Componente di esempio che mostra la tabella con i mock
export const StatisticTableWithMockData: React.FC = () => (
    <StatisticTable
        stats={getMockSportMonkEventLiveStatistics()}
        homeName="Vissel Kobe"
        awayName="Sanfrecce Hiroshima"
    />
);
