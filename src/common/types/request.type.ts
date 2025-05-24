export interface TokenUser {
    userId: string;
    sub: string;
    iat: number;
    exp: number;
    permissions: string[];
    roles: string[];
}

export interface RequestX extends Request {
    uploadedFiles?: string[];
    user: TokenUser;
    payload?: any;
}
