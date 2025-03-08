import axios, {
    AxiosBasicCredentials,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosRequestHeaders,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios';

export const httpMethods = {
    GET: 'GET' as const,
    POST: 'POST' as const,
    PUT: 'PUT' as const,
    PATCH: 'PATCH' as const,
    DELETE: 'DELETE' as const
};

class ApiService {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string, timeout: number = 20000, headers?: Record<string, string>) {
        this.axiosInstance = axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });

        // Request interceptor
        this.axiosInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            error => {
                return Promise.reject(error);
            }
        );
    }

    // Method to update headers
    public setHeaders(headers: Record<string, string>): void {
        this.axiosInstance.defaults.headers.common = {
            ...this.axiosInstance.defaults.headers.common,
            ...headers
        };
    }

    public updateConfig({
        headers,
        withCredentials = false,
        auth
    }: {
        headers?: AxiosRequestHeaders;
        withCredentials?: boolean;
        auth?: AxiosBasicCredentials;
    }) {
        if (headers) {
            this.axiosInstance.defaults.headers.common = {
                ...this.axiosInstance.defaults.headers.common,
                ...headers
            };
        }

        this.axiosInstance.defaults.withCredentials = withCredentials;

        if (auth) {
            this.axiosInstance.defaults.auth = auth;
        }
    }

    public async request<T>({
        url,
        method,
        data,
        headers,
        withCredentials,
        auth
    }: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        data?: unknown;
        headers?: AxiosRequestHeaders;
        withCredentials?: boolean;
        auth?: AxiosBasicCredentials;
    }): Promise<T> {
        const config: AxiosRequestConfig = {
            method,
            url,
            data,
            headers: {
                ...this.axiosInstance.defaults.headers.common,
                ...headers
            },
            withCredentials,
            auth
        };

        const response = await this.axiosInstance.request<T>(config);
        return response.data;
    }

    public async get<T>(url: string): Promise<T> {
        return this.request<T>({ url, method: httpMethods.GET });
    }

    public async post<T>(url: string, data: unknown): Promise<T> {
        return this.request<T>({ url, method: httpMethods.POST, data });
    }

    public async put<T>(url: string, data: unknown): Promise<T> {
        return this.request<T>({ url, method: httpMethods.PUT, data });
    }

    public async patch<T>(url: string, data: unknown): Promise<T> {
        return this.request<T>({ url, method: httpMethods.PATCH, data });
    }

    public async delete<T>(url: string): Promise<T> {
        return this.request<T>({ url, method: httpMethods.DELETE });
    }
}

export { ApiService };
