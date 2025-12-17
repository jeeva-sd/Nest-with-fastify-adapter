import axios from 'axios';

export function readError(error: unknown): string | null {
    try {
        if (typeof error === 'string') {
            return error;
        }

        if (axios.isAxiosError(error)) {
            if (error.response?.data?.message) {
                return error.response.data.message;
            }
        }

        if (Array.isArray(error)) {
            return error.length > 0 ? error[0] : null;
        }

        if (error instanceof Error) {
            return error.message;
        }

        if (error && typeof error === 'object') {
            const err = error as Record<string, unknown>;
            if (err.response && typeof err.response === 'object' && err.response !== null) {
                const res = err.response as Record<string, unknown>;
                if (res.data && typeof res.data === 'object' && res.data !== null && 'message' in res.data) {
                    return (res.data as { message: string }).message;
                }

                if (typeof res.data === 'string') {
                    return res.data; // Handle case where the response data is a string
                }

                if ('statusText' in res && typeof res.statusText === 'string') {
                    return res.statusText; // Fallback to HTTP status text
                }
            }

            if ('message' in err && typeof err.message === 'string') {
                return err.message;
            }

            if ('error' in err && typeof err.error === 'object' && err.error !== null && 'message' in err.error) {
                return (err.error as { message: string }).message;
            }

            return (err.toString as () => string)?.() || null;
        }

        return (error as { toString?: () => string })?.toString?.() || null;
    } catch (e) {
        console.error('Error in readError function:', e);
        return 'unknown error';
    }
}
