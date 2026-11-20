export interface Tournament {
    id: number;
    name: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    status: string;
}

export interface Team {
    id?: number;
    name: string;
    neighborhood: string;
}

export interface Match {
    id: number;
    tournament_id: number;
    first_team_id: number;
    first_team: Team;
    second_team: Team;
    round_name: string;
    referee_name: string;
    schedule_at: string;
    best_of_sets: number;
    first_team_sets_won?: number;
    second_team_sets_won?: number;
    status: string;
}

export interface MatchResponse {
    matches: Match[];
}