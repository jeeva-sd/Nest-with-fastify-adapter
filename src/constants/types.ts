export enum MessageStatus {
    success = 'success',
    failure = 'failure',
    error = 'error',
}

export interface MessageData {
    message: string;
    status: MessageStatus;
    error?: string;
}

export interface Messages {
    [key: number]: MessageData;
}
