export type AdditionalCost = {
    id: number;
    name: string;
    cost: number;
}

export type Participant = {
    id: number;
    username: string;
    role_name: string;
    hourly_cost: number;
    is_owner:boolean;
}

export type Owner ={
    id: number;
    username: string;
}

export type SortData = {
    field:string|null;
    order:string|null;
}

export type MeetingRequest = {
    per_page: number;
    page: number;
    name?: string|null;
    duration_min?: number|null;
    duration_max?: number|null;
    cost_min?:number|null;
    cost_max?:number|null;
    participant_ids?:number[]|null;
    start_min?: string|null;
    start_max?: string|null;
    sort_by?: SortData;
}

export type Meeting = {
    id: number;
    title: string;
    date: string;
    duration: number;
    cost: number;
    token: string;
    room_name: string;
    owner: Owner;
    description: string;
    participants: Participant[];
    additional_costs: AdditionalCost[];
}

export type ResponseContent = {
    meetings: Meeting[];
    total_cost: number;
}

export type MeetingResponse = {
    code: string;
    value: ResponseContent;
}

export type DateTimeState = {
    date: string;
    time: string;
}