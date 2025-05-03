import { LoggerService } from '@nestjs/common';
import * as chalk from 'chalk';

// Simplified color map
const colors = {
    red: chalk.red,
    green: chalk.green,
    blue: chalk.blue,
    yellow: chalk.yellow,
    orange: chalk.hex('#FFA500'),
    teal: chalk.hex('#008080'),
    indigo: chalk.hex('#4B0082'),
    olive: chalk.hex('#808000'),
    plum: chalk.hex('#DDA0DD'),
    navy: chalk.hex('#000080'),
    fuchsia: chalk.hex('#FF00FF'),
    salmon: chalk.hex('#FA8072'),
    turquoise: chalk.hex('#40E0D0'),
    gray: chalk.gray,
    cyan: chalk.cyan,
    magenta: chalk.magenta,
    white: chalk.white,
    black: chalk.black,
};

function normalizeError(error: any): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
        return JSON.stringify(error, null, 2);
    } catch {
        return String(error);
    }
}

export class Chalk implements LoggerService {
    private context?: string;

    constructor(context?: string) {
        if (context) this.context = context;
    }

    setContext(context: string): this {
        this.context = context;
        return this;
    }

    private getTimestamp(): string {
        const now = new Date();
        const isDev = process.env.NODE_ENV === 'development';

        const options: Intl.DateTimeFormatOptions = isDev
            ? {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            }
            : {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            };

        return isDev
            ? now.toLocaleTimeString('en-US', options)
            : now.toLocaleString('en-US', options);
    }

    private formatMessage(level: string, message: string, colorFn: (text: string) => string): string {
        const timestamp = this.getTimestamp();
        const ctx = this.context ? ` ${colors.yellow(`[${this.context}]`)}` : '';
        return `${timestamp}${ctx} ${colorFn(level)} ${colorFn(message)}`;
    }

    log(message: string) {
        console.log(this.formatMessage('LOG:', message, colors.green));
    }

    error(message: string, trace?: string) {
        console.error(
            this.formatMessage('ERROR:', normalizeError(message), colors.red),
            trace ? colors.red(`\nStack Trace: ${trace}`) : ''
        );
    }

    warn(message: string) {
        console.warn(this.formatMessage('WARN:', message, colors.orange));
    }

    debug(message: string) {
        console.debug(this.formatMessage('DEBUG:', message, colors.gray));
    }

    verbose(message: string) {
        console.log(this.formatMessage('VERBOSE:', message, colors.cyan));
    }

    info(message: string) {
        console.info(this.formatMessage('INFO:', message, colors.blue));
    }

    notice(message: string) {
        console.info(this.formatMessage('NOTICE:', message, colors.yellow));
    }

    success(message: string) {
        console.log(this.formatMessage('SUCCESS:', message, colors.green));
    }

    critical(message: string) {
        console.error(this.formatMessage('CRITICAL:', message, colors.magenta));
    }

    fatal(message: string, trace?: string) {
        console.error(
            this.formatMessage('FATAL:', message, chalk.red.bold),
            trace ? chalk.red.bold(`\nStack Trace: ${trace}`) : ''
        );
        process.exit(1);
    }

    exception(error: any) {
        const trace = error instanceof Error ? error.stack : undefined;
        console.error(
            this.formatMessage('EXCEPTION:', normalizeError(error), colors.red),
            trace ? colors.red(`\nStack Trace: ${trace}`) : ''
        );
    }

    logObject(obj: any, level: string = 'OBJECT:') {
        console.log(this.formatMessage(level, JSON.stringify(obj, null, 2), colors.teal));
    }

    // Log a message with a dynamic color
    custom(message: string, color: keyof typeof colors, level = 'CUSTOM') {
        const colorFn = colors[color] || chalk.white;
        console.log(this.formatMessage(`${level.toUpperCase()}:`, message, colorFn));
    }
}
