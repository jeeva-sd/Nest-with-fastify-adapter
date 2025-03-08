export interface ReplayMessages {
    [key: number]: {
        message: string;
    };
}

export type ReplayCodes = keyof typeof replayMessages;

export const replayMessages = {
    // Successful
    200: { message: 'Request completed successfully' },
    201: { message: 'Resource successfully created' },
    202: { message: 'Request accepted for processing' },
    203: { message: 'Request succeeded, but details might be rough' },
    204: { message: 'Action completed' },
    208: { message: 'Duplicate request detected' },

    301: { message: 'Resource has been permanently moved' },
    302: { message: 'Resource has been temporarily moved' },

    // Client
    400: { message: 'Invalid request syntax or parameters' },
    401: { message: 'Invalid authentication credentials provided' },
    403: { message: 'Insufficient permissions to access the resource' },
    404: { message: 'Requested resource could not be found' },
    405: { message: 'Requested method is not supported for this endpoint' },
    406: { message: 'Server cannot generate a response in the requested format' },
    408: { message: 'Request timed out due to server or network delays' },
    409: { message: 'Request conflicts with existing data or resources' },
    410: { message: 'Requested resource is no longer available' },
    414: { message: 'Request URI exceeds the maximum permissible length' },
    412: { message: 'One or more preconditions specified in the request failed' },
    413: { message: 'Request payload exceeds the maximum allowable size' },
    415: { message: 'Requested media type is not supported' },
    416: { message: 'Requested range is not satisfiable' },
    422: { message: 'Invalid payload' },
    429: { message: 'Too many requests' },

    // Server
    500: { message: 'Internal server error' },
    502: { message: 'Bad gateway' },
    503: { message: 'Service unavailable' },
    504: { message: 'Gateway timeout' },
    505: { message: 'HTTP version not supported' },
    507: { message: 'Insufficient storage' },
    511: { message: 'Network authentication required' },

    // Custom
    1000: { message: 'Data found' },
    1001: { message: 'Data not found' },
    1003: { message: 'Validation Error' },
    1004: { message: 'Unexpected error' },
    1005: { message: 'Something went wrong' },
    1006: { message: 'Request timed out' },

    // Auth
    1050: { message: 'Invalid credentials' },
    1051: { message: 'Authentication successful' },
    1052: { message: 'Logout successful' },
    1056: { message: 'Password reset successful' },
    1058: { message: 'User impersonation successful' }
};
