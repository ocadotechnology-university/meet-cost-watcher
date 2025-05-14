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

export interface Owner{
    id: number;
    username: string;
}

export interface Meeting {
    id: number;
    title: string;
    date: string;
    duration: number;
    cost: number;
    token: string;
    room_name: string;
    owner: Owner;
    participants: Participant[];
    additional_costs: AdditionalCost[];
}

export interface ResponseContent {
    meetings: Meeting[];
    total_cost: number;
}

export interface MeetingResponse {
    code: string;
    value: ResponseContent;
}