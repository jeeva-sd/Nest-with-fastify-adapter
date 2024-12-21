import { LoggerService } from '@nestjs/common';
import * as chalk from 'chalk';
import { readError } from '../utils';

// Define colors
const colors = {
    red: chalk.red,
    green: chalk.green,
    blue: chalk.blue,
    yellow: chalk.yellow,
    orange: chalk.hex('#FFA500'),
    teal: chalk.hex('#008080'),
    coral: chalk.hex('#FF7F50'),
    indigo: chalk.hex('#4B0082'),
    olive: chalk.hex('#808000'),
    plum: chalk.hex('#DDA0DD'),
    navy: chalk.hex('#000080'),
    fuchsia: chalk.hex('#FF00FF'),
    salmon: chalk.hex('#FA8072'),
    turquoise: chalk.hex('#40E0D0')
};

export class Chalk implements LoggerService {
    private context?: string;

    constructor(context?: string) {
        if (context) this.context = context;
    }

    setContext(context: string) {
        this.context = context;
    }

    private getTimestamp(): string {
        const now = new Date();

        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };

        if (process.env.NODE_ENV === 'development') {
            // Time only format for development
            return now.toLocaleTimeString('en-US', options);
        } else {
            // Full date and time format for other environments
            const fullOptions: Intl.DateTimeFormatOptions = {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            return now.toLocaleString('en-US', fullOptions);
        }
    }

    private formatMessage(level: string | undefined, message: string, color: (text: string) => string): string {
        const timestamp = this.getTimestamp();
        const contextPart = this.context ? ` ${colors.yellow(`[${this.context}]`)}` : '';
        const levelInfo = level ? ` ${color(level)}` : '';
        return `${timestamp}${contextPart}${levelInfo} ${color(message)}`;
    }

    log(message: string) {
        console.log(this.formatMessage(undefined, message, colors.green));
    }

    error(message: string, trace?: string) {
        const level = colors.red('ERROR:');
        console.error(
            this.formatMessage(level, readError(message), colors.red),
            trace ? colors.red(`\nStack Trace: ${trace}`) : ''
        );
    }

    warn(message: string) {
        const level = colors.orange('WARN:');
        console.warn(this.formatMessage(level, message, colors.orange));
    }

    debug(message: string) {
        console.debug(this.formatMessage(undefined, message, chalk.gray));
    }

    verbose(message: string) {
        console.log(this.formatMessage(undefined, message, chalk.cyan));
    }

    info(message: string) {
        console.debug(this.formatMessage(undefined, message, colors.blue));
    }

    exception(error: any) {
        const level = colors.red('EXCEPTION:');
        const trace = error instanceof Error ? error.stack : undefined;

        console.log('\n');
        console.error(
            this.formatMessage(level, readError(error), colors.red),
            trace ? colors.red(`\nStack Trace: ${trace}`) : ''
        );
        console.log('\n');
    }
}
