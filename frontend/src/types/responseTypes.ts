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
    is_owner:boolean;
}

export interface Owner{
    id: number;
    username: string;
}

export interface SortData {
    field:string|null;
    order:string|null;
}

export interface MeetingRequest {
    per_page: number;
    page: number;
    name?: string|null;
    duration_min?: number|null;
    duration_max?: number|null;
    cost_min?:number|null;
    cost_max?:number|null;
    participants_ids?:number[]|null;
    start_min?: string|null;
    start_max?: string|null;
    sort_by?: SortData;
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
    description: string;
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

export interface MeetingFiltersState {
    searchTerm: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    durationRange: [number, number];
    costRange: [number, number];
    selectedPersons: Participant[];
    sortOption: string;
}

export interface UserData {
    username: string;
}