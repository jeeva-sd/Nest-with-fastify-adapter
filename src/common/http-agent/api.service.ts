import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';

class ApiService {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string, defaultAuth: string | null = null, headers?: any) {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {}
        });

        if (defaultAuth) this.setAuth(defaultAuth);
        if (headers) this.setHeaders(headers);
    }

    setAuth(auth: string): void {
        this.axiosInstance.defaults.headers.common['Authorization'] = auth;
    }

    removeAuth(): void {
        delete this.axiosInstance.defaults.headers.common['Authorization'];
    }

    // Method to set or update headers dynamically
    setHeaders(headers: Record<string, string | boolean>): void {
        Object.entries(headers).forEach(([key, value]) => {
            this.axiosInstance.defaults.headers.common[key] = value;
        });
    }

    request(
        method: Method,
        url: string,
        data: any = {},
        params: Record<string, any> = {},
        customHeaders: Record<string, string | boolean> = {}
    ) {
        const isAbsoluteURL = /^(?:[a-z]+:)?\/\//i.test(url);
        const config: AxiosRequestConfig = {
            method,
            url: isAbsoluteURL ? url : this.axiosInstance.defaults.baseURL + url,
            data,
            params,
            headers: { ...this.axiosInstance.defaults.headers.common, ...customHeaders }
        };
        return this.axiosInstance.request(config).then(response => response.data);
    }

    get(url: string, params: Record<string, any> = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('GET', url, {}, params, customHeaders);
    }

    post(url: string, data: any = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('POST', url, data, {}, customHeaders);
    }

    put(url: string, data: any = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('PUT', url, data, {}, customHeaders);
    }

    patch(url: string, data: any = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('PATCH', url, data, {}, customHeaders);
    }

    delete(url: string, params: Record<string, any> = {}, customHeaders: Record<string, string | boolean> = {}) {
        return this.request('DELETE', url, {}, params, customHeaders);
    }
}

export { ApiService };

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
