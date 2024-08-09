/* eslint-disable prettier/prettier */
import { MessageData, MessageStatus } from './types';

export const actionMessages: { [key: number]: MessageData } = {
    // Successful
    200: { message: 'Request completed successfully', status: MessageStatus.success },
    201: { message: 'Resource successfully created', status: MessageStatus.success },
    202: { message: 'Request accepted for processing', status: MessageStatus.success },
    203: { message: 'Request succeeded, but details might be rough', status: MessageStatus.success },
    204: { message: 'Action completed', status: MessageStatus.success },
    208: { message: 'Duplicate request detected', status: MessageStatus.success },

    301: { message: 'Resource has been permanently moved', status: MessageStatus.error },
    302: { message: 'Resource has been temporarily moved', status: MessageStatus.error },

    // Client
    400: { message: 'Invalid request syntax or parameters', status: MessageStatus.error },
    401: { message: 'Invalid authentication credentials provided', status: MessageStatus.error },
    403: { message: 'Insufficient permissions to access the resource', status: MessageStatus.error },
    404: { message: 'Requested resource could not be found', status: MessageStatus.error },
    405: { message: 'Requested method is not supported for this endpoint', status: MessageStatus.error },
    406: { message: 'Server cannot generate a response in the requested format', status: MessageStatus.error },
    408: { message: 'Request timed out due to server or network delays', status: MessageStatus.error },
    409: { message: 'Request conflicts with existing data or resources', status: MessageStatus.error },
    410: { message: 'Requested resource is no longer available', status: MessageStatus.error },
    414: { message: 'Request URI exceeds the maximum permissible length', status: MessageStatus.error },
    412: { message: 'One or more preconditions specified in the request failed', status: MessageStatus.error },
    413: { message: 'Request payload exceeds the maximum allowable size', status: MessageStatus.error },
    415: { message: 'Requested media type is not supported', status: MessageStatus.error },
    416: { message: 'Requested range is not satisfiable', status: MessageStatus.error },
    422: { message: 'Invalid payload', status: MessageStatus.error },
    429: { message: 'Too many requests', status: MessageStatus.error },

    // Server
    500: { message: 'Internal server error', status: MessageStatus.error },
    502: { message: 'Bad gateway', status: MessageStatus.error },
    503: { message: 'Service unavailable', status: MessageStatus.error },
    504: { message: 'Gateway timeout', status: MessageStatus.error },
    505: { message: 'HTTP version not supported', status: MessageStatus.error },
    507: { message: 'Insufficient storage', status: MessageStatus.error },
    511: { message: 'Network authentication required', status: MessageStatus.error },

    // Custom
    1000: { message: 'Data found', status: MessageStatus.success },
    1001: { message: 'Data not found', status: MessageStatus.success },
    1003: { message: 'Validation Errors', status: MessageStatus.error },
    1004: { message: 'Unexpected error', status: MessageStatus.error },
    1005: { message: 'Something went wrong', status: MessageStatus.error },
    1006: { message: 'Request timed out', status: MessageStatus.error },

    // Auth
    1050: { message: 'Invalid credentials', status: MessageStatus.failure },
    1051: { message: 'Authentication successful', status: MessageStatus.success },
    1052: { message: 'Logout successful', status: MessageStatus.success },
    1056: { message: 'Password reset successful', status: MessageStatus.success },

    // User
    1200: { message: 'User successfully created', status: MessageStatus.success },
    1201: { message: 'User successfully updated', status: MessageStatus.success },
    1202: { message: 'User successfully deleted', status: MessageStatus.success },
};
