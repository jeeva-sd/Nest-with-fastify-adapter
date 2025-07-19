import axios, { AxiosInstance, Method } from 'axios';

export class ApiService {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string, defaultAuth: string | null = null, headers?: Record<string, string | boolean>) {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                ...(defaultAuth && { Authorization: defaultAuth }),
                ...headers
            }
        });
    }

    // Method to set authorization header
    setAuth(token: string): void {
        this.axiosInstance.defaults.headers.common['Authorization'] = token;
    }

    // Method to remove authorization header
    removeAuth(): void {
        this.axiosInstance.defaults.headers.common['Authorization'] = undefined;
    }

    // Method to set or update headers dynamically
    setHeaders(headers: Record<string, string | boolean>): void {
        for (const [key, value] of Object.entries(headers)) {
            this.axiosInstance.defaults.headers.common[key] = value;
        }
    }

    // Generic request method
    private async request(
        method: Method,
        url: string,
        data: unknown = {},
        params: Record<string, unknown> = {},
        customHeaders: Record<string, string | boolean> = {}
    ) {
        const response = await this.axiosInstance({
            method,
            url,
            data,
            params,
            headers: customHeaders
        });
        return response.data;
    }

    get(url: string, params: Record<string, unknown> = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('GET', url, {}, params, customHeaders);
    }

    post(url: string, data: unknown = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('POST', url, data, {}, customHeaders);
    }

    put(url: string, data: unknown = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('PUT', url, data, {}, customHeaders);
    }

    patch(url: string, data: unknown = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('PATCH', url, data, {}, customHeaders);
    }

    delete(url: string, params: Record<string, unknown> = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('DELETE', url, {}, params, customHeaders);
    }
}

// ---------------------------------------------------------------- EXAMPLES ---------------------------------------------------------------

// initialize
// const apiService = new ApiService('https://api.example.com', 'Bearer default_token');

// Set additional headers globally
// apiService.setHeaders({
//     Cookie: `sessionId=abcd1234`,
//     withCredentials: true
// });

// making a POST request with additional headers for this request only
// const userRepoResponse = await apiService.post(
//     '/check-login',
//     {},
//     {
//         Authorization: 'Bearer new_access_token', // override the default Authorization header
//         Cookie: `hubCookieName=hubAccessToken` // set a different cookie for this request
//     }
// );
