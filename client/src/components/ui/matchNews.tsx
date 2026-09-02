import React, { useState } from "react";
import { Button } from "./button";

type NewsLine = {
    id: number;
    newsitem_id: number;
    text: string;
    type: string;
};

type NewsItem = {
    id: number;
    fixture_id: number;
    league_id: number;
    title: string;
    type: string;
    lines: NewsLine[];
};

type Team = {
    name: string;
    image_path: string;
};

type MatchNewsProps = {
    prematchnews?: NewsItem[];
    postmatchnews?: NewsItem[];
    homeTeam?: Team;
    awayTeam?: Team;
};

const MatchNews: React.FC<MatchNewsProps> = ({
    prematchnews = [],
    postmatchnews = [],
    homeTeam,
    awayTeam,
}) => {
    const [selectedTab, setSelectedTab] = useState<"prematch" | "postmatch">("prematch");

    // Scegli la lista da mostrare in base al tab selezionato
    const newsList = selectedTab === "prematch" ? prematchnews : postmatchnews;

    return (
        <div className="max-w-2xl p-4 mx-auto bg-white rounded-lg shadow-md">
            <div className="flex gap-2 mb-4">
                <Button
                    variant={selectedTab === "prematch" ? "default" : "secondary"}
                    onClick={() => setSelectedTab("prematch")}
                >
                    Pre-match
                </Button>
                <Button
                    variant={selectedTab === "postmatch" ? "default" : "secondary"}
                    onClick={() => setSelectedTab("postmatch")}
                >
                    Post-match
                </Button>
            </div>

            {newsList && newsList.length > 0 ? (
                newsList.map((news) => {
                    // Raggruppa le lines per type
                    const introduction = news.lines?.find((line) => line.type === "introduction");
                    const homeLines = news.lines?.filter((line) => line.type === "home") || [];
                    const awayLines = news.lines?.filter((line) => line.type === "away") || [];
                    const lineLines = news.lines?.filter((line) => line.type === "line") || [];
                    const otherLines = news.lines?.filter(
                        (line) =>
                            line.type !== "introduction" &&
                            line.type !== "home" &&
                            line.type !== "away" &&
                            line.type !== "line"
                    ) || [];

                    return (
                        <div key={news.id} className="mb-6">
                            <h3 className="mb-2 text-lg font-bold">{news.title}</h3>
                            {/* Introduction */}
                            {introduction && (
                                <div className="mb-3 text-base font-medium text-gray-800">
                                    {introduction.text}
                                </div>
                            )}

                            {/* Home Section */}
                            {homeLines.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 py-4 mb-1 bg-gray-100 border-t border-b">
                                        {homeTeam?.image_path && (
                                            <img
                                                src={homeTeam.image_path}
                                                alt={homeTeam.name}
                                                className="object-contain w-8 h-8"
                                            />
                                        )}
                                        <span className="font-semibold text-gray-700">{homeTeam?.name || "Home"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {homeLines.map((line) => (
                                            <p key={line.id} className="text-sm text-gray-700">
                                                {line.text}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Away Section */}
                            {awayLines.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 py-4 mb-1 bg-gray-100 border-t border-b">
                                        {awayTeam?.image_path && (
                                            <img
                                                src={awayTeam.image_path}
                                                alt={awayTeam.name}
                                                className="object-contain w-8 h-8"
                                            />
                                        )}
                                        <span className="font-semibold text-gray-700">{awayTeam?.name || "Away"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {awayLines.map((line) => (
                                            <p key={line.id} className="text-sm text-gray-700">
                                                {line.text}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Line Section */}
                            {lineLines.length > 0 && (
                                <div className="space-y-1">
                                    {lineLines.map((line) => (
                                        <p key={line.id} className="text-sm text-gray-700">
                                            {line.text}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Altre linee (se presenti) */}
                            {otherLines.length > 0 && (
                                <div className="space-y-1">
                                    {otherLines.map((line) => (
                                        <p key={line.id} className="text-sm text-gray-700">
                                            {line.text}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="py-8 text-center text-gray-500">
                    Nessuna notizia {selectedTab === "prematch" ? "pre-match" : "post-match"} disponibile.
                </div>
            )}
        </div>
    );
};

export default MatchNews;