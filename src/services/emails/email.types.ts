export interface EmailParams {
    to: string;
    subject: string;
    template: string;
    context: unknown;
}

export interface SendHtmlParams {
    to: string;
    subject: string;
    html: string;
}
