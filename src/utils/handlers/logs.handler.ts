import { LoggerService } from '@nestjs/common';
import { readError } from './error.handler';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk');

export const redChalk = chalk.hex('#D32F2F');
export const greenChalk = chalk.hex('#1cba2c');
export const blueChalk = chalk.hex('#1976D2');
export const yellowChalk = chalk.hex('#FFFF00');

export const orangeChalk = chalk.hex('#FFA500');
export const tealChalk = chalk.hex('#008080');
export const coralChalk = chalk.hex('#FF7F50');
export const indigoChalk = chalk.hex('#4B0082');
export const oliveChalk = chalk.hex('#808000');
export const plumChalk = chalk.hex('#DDA0DD');
export const navyChalk = chalk.hex('#000080');
export const fuchsiaChalk = chalk.hex('#FF00FF');
export const salmonChalk = chalk.hex('#FA8072');
export const turquoiseChalk = chalk.hex('#40E0D0');

export class Chalk implements LoggerService {
    private context: string | undefined;

    constructor(context?: string) {
        if (context) this.context = context;
    }

    setContext(context: string) {
        this.context = context;
    }

    private getTimestamp(): string {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
        return `${formattedDate}, ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    }

    private formatMessage(level: string, message: string, color: (text: string) => string): string {
        const timestamp = this.getTimestamp();
        const contextPart = this.context ? ` ${yellowChalk(`[${this.context}]`)}` : '';
        const logMessage = ` ${color(message)}`;
        const levelInfo = level ? ` \n${level}` : '';

        return `${timestamp} -${contextPart}${levelInfo}${logMessage}`;
    }

    log(message: string) {
        console.log(this.formatMessage(undefined, message, greenChalk));
    }

    error(message: string, trace?: string) {
        const level = redChalk('ERROR:');

        console.error(
            this.formatMessage(level, readError(message), redChalk),
            trace ? redChalk(`\nStack Trace: ${trace}`) : ''
        );
    }

    warn(message: string) {
        const level = redChalk('[WARN]:');
        console.warn(this.formatMessage(orangeChalk(level), orangeChalk(message), orangeChalk));
    }

    debug(message: string) {
        console.debug(this.formatMessage(undefined, message, chalk.gray));
    }

    verbose(message: string) {
        console.log(this.formatMessage(undefined, message, chalk.cyan));
    }

    info(message: string) {
        console.debug(this.formatMessage(undefined, message, blueChalk));
    }

    exception(error: any) {
        const level = redChalk('EXCEPTION:');
        const trace = error instanceof Error ? error.stack : undefined;

        console.log('\n');
        console.error(
            this.formatMessage(level, readError(error), redChalk),
            trace ? redChalk(`\nStack Trace: ${trace}`) : ''
        );
        console.log('\n');
    }
}
