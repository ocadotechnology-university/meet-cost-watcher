export interface AdditionalCost {
    id: number;
    name: string;
    cost: number;
}

export interface Participant {
    id: number;
    username: string;
    role_name: string;
    hourly_cost: number;
}

export interface Meeting {
    id: number;
    title: string;
    date: string;
    duration: number;
    cost: number;
    token: string;
    room_name: string;
    participants: Participant[];
    additional_costs: AdditionalCost[];
}

export interface MeetingResponse {
    meetings: Meeting[];
    total_cost: number;
}