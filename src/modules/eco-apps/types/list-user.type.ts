export interface Supervisor {
    id: string;
    name: string;
    profileImage: string | null;
}

export interface Department {
    id: number;
    name: string;
    title: string | null;
    supervisors: Supervisor[];
}

export interface UserRow {
    id: string;
    fname: string;
    lname: string;
    email: string;
    title: string;
    roleId: number;
    status: number;
    phone: string;
    country: string;
    timezone: string;
    bio: string;
    organizationId: string;
    roleType: string;
    profileImage: string;
    departments: Department[];
}

export interface ApiResponse {
    total: number;
    rows: UserRow[];
}
