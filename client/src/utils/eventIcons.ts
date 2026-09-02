const EVENTICONS: Record<string, string> = {
  goal: "/icon/goal.svg",
  yellowcard: "/icon/yellowcard.svg",
  redcard:"/icon/redcard.svg",
  substitution: "/icon/Sub_in.svg",
};


const PLAYERSTATSICONS: Record<string, string> = {
  SUBSTITUTIONS: "/icon/Sub_in.svg",
  OWN_GOALS: "/icon/goal.svg",
  GOALS_CONCEDED: "",
  MINUTES_PLAYED: "",
  APPEARANCES:"",
  LINEUPS: "",
  BENCH: "",
}

export function getEventIcon(typeCode: string): string {
  return EVENTICONS[typeCode] || "";
}

export function getPlayerStatIcon(statType: string): string {
  console.log("getPlayerStatIcon called with:", PLAYERSTATSICONS[statType] );
  return PLAYERSTATSICONS[statType] || "";
}
