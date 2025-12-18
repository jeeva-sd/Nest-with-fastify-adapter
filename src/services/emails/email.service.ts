import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as Handlebars from 'handlebars';
import { appConfig } from '~/configs';
import { EmailParams, SendHtmlParams } from './email.types';

@Injectable()
export class EmailsService {
    private readonly logger = new Logger(EmailsService.name);

    constructor() {
        sgMail.setApiKey(appConfig.email.apiKey);

        // Register 'eq' helper for Handlebars if not already registered
        if (!Handlebars.helpers.eq) {
            Handlebars.registerHelper('eq', (a, b) => a === b);
        }
        // Register 'contains' helper for Handlebars if not already registered
        if (!Handlebars.helpers.contains) {
            Handlebars.registerHelper('contains', (str, substr) => typeof str === 'string' && str.includes(substr));
        }
        // Register 'getChangeNumber' helper for Handlebars if not already registered
        if (!Handlebars.helpers.getChangeNumber) {
            Handlebars.registerHelper('getChangeNumber', str => {
                // Extracts the first number (positive or negative, integer or float) from the string
                const match = str.match(/(-?\d+(?:\.\d+)?)/);
                return match ? match[1] : '';
            });
        }
        // Register 'getChangeText' helper for Handlebars if not already registered
        if (!Handlebars.helpers.getChangeText) {
            Handlebars.registerHelper('getChangeText', str => {
                // Removes the first number and any leading + or - from the string
                return str.replace(/^[^a-zA-Z]*(-?\d+(?:\.\d+)?)/, '').trim();
            });
        }
        if (!Handlebars.helpers.isIncrease) {
            Handlebars.registerHelper('isIncrease', str => {
                // Detects 'from X to Y' and returns true if Y > X
                const match = str.match(/from\s+(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)/i);
                if (!match) return false;
                return Number.parseFloat(match[2]) > Number.parseFloat(match[1]);
            });
        }
        if (!Handlebars.helpers.isDecrease) {
            Handlebars.registerHelper('isDecrease', str => {
                // Detects 'from X to Y' and returns true if Y < X
                const match = str.match(/from\s+(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)/i);
                if (!match) return false;
                return Number.parseFloat(match[2]) < Number.parseFloat(match[1]);
            });
        }
        // Register 'or' helper for Handlebars if not already registered
        if (!Handlebars.helpers.or) {
            Handlebars.registerHelper('or', (a, b) => a || b);
        }
    }

    private async compileTemplate(templateName: string, context: unknown): Promise<string> {
        try {
            const templatePath = path.join(process.cwd(), 'src/views', `${templateName}.hbs`);
            const exists = await fs
                .access(templatePath)
                .then(() => true)
                .catch(() => false);

            if (!exists) {
                throw new Error(`Template file not found: ${templatePath}`);
            }

            const source = await fs.readFile(templatePath, 'utf8');
            const compiled = Handlebars.compile(source);
            return compiled(context);
        } catch (error) {
            this.logger.error(`Failed to compile template: ${error.message}`, error.stack);
            throw error;
        }
    }

    async prepareEmail({ template, context }: Pick<EmailParams, 'template' | 'context'>): Promise<string> {
        try {
            const html = await this.compileTemplate(template, context);
            this.logger.log(`Template compiled successfully for template: ${template}`);
            return html;
        } catch (error) {
            this.logger.error(`Failed to prepare email for template: ${template}`, error.stack);
            throw error;
        }
    }

    async send({ to, subject, template, context }: EmailParams): Promise<boolean> {
        const isEnabled = appConfig.email?.enabled;
        if (!isEnabled) {
            this.logger.warn(`Email service is disabled. Skipping email to ${to}`);
            return false;
        }

        try {
            const html = await this.compileTemplate(template, context);

            const msg = {
                to,
                from: appConfig.email.from,
                subject,
                html
            };

            if (!msg.from) {
                throw new Error('Sender email address is not configured.');
            }

            await sgMail.send(msg);
            this.logger.log(`Email sent successfully to ${to}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);

            // Log SendGrid-specific errors if available
            if (error.response) {
                this.logger.error(`SendGrid response: ${JSON.stringify(error.response.body)}`);
            }

            return false;
        }
    }
}
