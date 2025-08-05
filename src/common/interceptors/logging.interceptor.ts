import { LoggerService } from '@nestjs/common';
import * as chalk from 'chalk';
import { appConfig } from '~/configs';

// Performance-optimized color map with pre-computed functions
const colors = {
    red: chalk.red,
    green: chalk.green,
    blue: chalk.blue,
    yellow: chalk.yellow,
    orange: chalk.hex('#FFA500'),
    gray: chalk.gray,
    cyan: chalk.cyan,
    magenta: chalk.magenta,
    white: chalk.white,
} as const;

// Pre-compile timestamp options for better performance
const DEV_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
};

const PROD_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
};

function normalizeError(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
        try {
            return JSON.stringify(error);
        } catch {
            return '[Circular Object]';
        }
    }
    return 'Unknown error';
}

export class Chalk implements LoggerService {
    private context?: string;
    private readonly isDev: boolean;
    private readonly timeOptions: Intl.DateTimeFormatOptions;

    constructor(context?: string) {
        if (context) this.context = context;

        // Cache environment check for better performance
        this.isDev = appConfig.server.mode === 'development';
        this.timeOptions = this.isDev ? DEV_TIME_OPTIONS : PROD_TIME_OPTIONS;
    }

    setContext(context: string): this {
        this.context = context;
        return this;
    }

    private getTimestamp(): string {
        return new Date().toLocaleString('en-US', this.timeOptions);
    }

    private formatMessage(level: string, message: string, colorFn: (text: string) => string): string {
        const timestamp = this.getTimestamp();
        const ctx = this.context ? ` ${colors.yellow(`[${this.context}]`)}` : '';
        return `${timestamp}${ctx} ${colorFn(level)} ${colorFn(message)}`;
    }

    // Optimized logging methods with early returns for production
    log(message: string) {
        if (!this.isDev && process.env.LOG_LEVEL === 'error') return;
        console.log(this.formatMessage('LOG:', message, colors.green));
    }

    error(message: string, trace?: string) {
        const errorMsg = this.formatMessage('ERROR:', normalizeError(message), colors.red);
        if (trace) {
            console.error(errorMsg, colors.red(`\nStack Trace: ${trace}`));
        } else {
            console.error(errorMsg);
        }
    }

    warn(message: string) {
        if (!this.isDev && process.env.LOG_LEVEL === 'error') return;
        console.warn(this.formatMessage('WARN:', message, colors.yellow));
    }

    debug(message: string) {
        if (!this.isDev) return; // Skip debug logs in production
        console.debug(this.formatMessage('DEBUG:', message, colors.gray));
    }

    verbose(message: string) {
        if (!this.isDev) return; // Skip verbose logs in production
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
        const fatalMsg = this.formatMessage('FATAL:', message, chalk.red.bold);
        if (trace) {
            console.error(fatalMsg, chalk.red.bold(`\nStack Trace: ${trace}`));
        } else {
            console.error(fatalMsg);
        }
        process.exit(1);
    }

    exception(error: unknown, traceId?: string) {
        const trace = error instanceof Error ? error.stack : undefined;
        if (traceId) {
            console.error('👇 traceId ', traceId, '👇');
        }
        console.error('EXCEPTION STACK TRACE:\n', trace);
        if (traceId) {
            console.error('👆 traceId ', traceId, '👆');
        }
    }
}
