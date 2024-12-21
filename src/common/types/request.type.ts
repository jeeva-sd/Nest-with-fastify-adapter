export interface TokenUser {
    username: string;
    sub: string;
    iat: number;
    exp: number;
}

export interface RequestX extends Request {
    uploadedFiles?: string[];
    user: TokenUser;
    payload?: any;
}
