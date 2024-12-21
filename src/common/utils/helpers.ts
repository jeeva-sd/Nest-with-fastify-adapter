import * as fs from 'fs';
import { randomUUID } from 'crypto';
import * as CryptoJS from 'crypto-js';
import { appConfig } from 'src/configs';

export class Helper {
    // ---------------------------------------
    // General Utility Functions
    // ---------------------------------------

    static wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static parseJSON(str: string): any {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    }

    static encrypt(data: any): string | null {
        try {
            const jsonData = JSON.stringify(data);
            const encrypted = CryptoJS.AES.encrypt(jsonData, appConfig.auth.encryptionKey);
            return encrypted.toString();
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    static decrypt(encryptedData: string): any | null {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedData, appConfig.auth.encryptionKey);
            const parsedData = decrypted.toString(CryptoJS.enc.Utf8);
            return JSON.parse(parsedData);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // ---------------------------------------
    // Array Utilities
    // ---------------------------------------

    static Array = class {
        static groupBy(key: string, formatter?: (value: any) => string) {
            return (array: any[]) => {
                return array.reduce((obj: any, item: any) => {
                    let value = item[key];
                    if (formatter) value = formatter(value); // apply the formatter if provided
                    obj[value] = (obj[value] || []).concat(item);
                    return obj;
                }, {});
            };
        }

        static objectById(key: string) {
            return (array: any[]) => {
                return array.reduce((obj: any, item: any) => {
                    const value = item[key];
                    obj[value] = item;
                    return obj;
                }, {});
            };
        }

        static chunkArray<T>(array: T[], size: number): T[][] {
            const chunks: T[][] = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        }

        static sortByKey<T>(array: T[], key: keyof T, ascending: boolean = true): T[] {
            return array.slice().sort((a, b) => {
                const valueA = a[key];
                const valueB = b[key];
                if (valueA < valueB) return ascending ? -1 : 1;
                if (valueA > valueB) return ascending ? 1 : -1;
                return 0;
            });
        }
    };

    // ---------------------------------------
    // Object Utilities
    // ---------------------------------------

    static Object = class {
        static deepMerge(base, newObj) {
            for (const key of Object.keys(newObj)) {
                if (typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])) {
                    if (!(key in base)) base[key] = {};
                    base[key] = this.deepMerge(base[key], newObj[key]);
                } else {
                    // Only override base value if property exists in newObj
                    if (key in newObj) base[key] = newObj[key];
                }
            }

            return base;
        }

        static deepClone<T>(obj: T): T {
            return JSON.parse(JSON.stringify(obj));
        }

        static isObject(value: any): boolean {
            return typeof value === 'object' && value !== null && !Array.isArray(value);
        }

        static isFunction(value: any): boolean {
            return typeof value === 'function';
        }

        static isObjectEmpty(obj: object): boolean {
            return Object.keys(obj).length === 0;
        }

        static getObjectKeys(obj: object): string[] {
            return Object.keys(obj);
        }

        static getObjectValues(obj: object): any[] {
            return Object.values(obj);
        }

        static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
            const result: Partial<T> = {};
            keys.forEach(key => {
                if (key in obj) {
                    result[key] = obj[key];
                }
            });
            return result as Pick<T, K>;
        }

        static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
            const result: Partial<T> = { ...obj };
            keys.forEach(key => {
                delete result[key];
            });
            return result as Omit<T, K>;
        }

        static flattenObject(obj: object, prefix = ''): object {
            const result: any = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    const newKey = prefix ? `${prefix}.${key}` : key;
                    if (Helper.Object.isObject(value) && !Array.isArray(value)) {
                        Object.assign(result, Helper.Object.flattenObject(value, newKey));
                    } else {
                        result[newKey] = value;
                    }
                }
            }
            return result;
        }

        static unflattenObject(obj: object): object {
            const result: any = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    key.split('.').reduce((acc: any, part: string, index: number, parts: string[]) => {
                        if (index === parts.length - 1) {
                            acc[part] = value;
                        } else {
                            acc[part] = acc[part] || {};
                        }
                        return acc[part];
                    }, result);
                }
            }
            return result;
        }
    };

    // ---------------------------------------
    // String Utilities
    // ---------------------------------------

    static String = class {
        static capitalizeWords(str: string): string {
            if (!str) return '';
            return str
                .trim()
                .toLowerCase()
                .replace(/\b\w/g, char => char.toUpperCase());
        }

        static toTitleCase(str: string): string {
            if (!str) return '';
            return str
                .trim()
                .toLowerCase()
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/\b\w/g, c => c.toUpperCase());
        }

        static toCamelCase(str: string): string {
            if (!str) return '';
            return str.trim().replace(/\s(.)/g, (_, char) => char.toUpperCase());
        }

        static truncate(str: string, maxLength: number): string {
            if (!str || maxLength <= 0) return '';
            return str.length > maxLength ? str.trim().slice(0, maxLength) + '...' : str;
        }

        static isEmptyString(str: string): boolean {
            return !str || str.trim().length === 0;
        }

        static removeWhitespace(str: string): string {
            if (!str) return '';
            return str.replace(/\s/g, '');
        }

        static countWords(str: string): number {
            if (!str) return 0;
            const words = str.split(/\s+/).filter(word => word.length > 0);
            return words.length;
        }

        static isEmail(str: string): boolean {
            if (!str) return false;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
        }

        static slugify(str: string): string {
            if (!str) return '';
            return str
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
        }

        static removeSpecialChars(str: string): string {
            if (!str) return '';
            return str.replace(/[^\w\s]/g, '');
        }

        static getRandomString(length: number): string {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        static padString(str: string, length: number, char: string = ' '): string {
            if (!str || length <= str.length) return str;
            const pad = char.repeat(length - str.length);
            return pad.slice(0, Math.floor(pad.length / 2)) + str + pad.slice(Math.floor(pad.length / 2));
        }
    };

    // ---------------------------------------
    // Filename and Number Utilities
    // ---------------------------------------

    static File = class {
        static generateFilename(originalFilename: string): string {
            const uuid = randomUUID();
            const extension = originalFilename.split('.').pop();
            const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').replace(/\..+/, '');

            return `${Helper.String.slugify(originalFilename)}-${timestamp}-${uuid}.${extension}`;
        }

        static async readFile(filePath: string): Promise<Buffer> {
            try {
                // Check if the file exists
                await fs.promises.access(filePath, fs.constants.F_OK);

                // Read the file
                const data = await fs.promises.readFile(filePath);
                return data; // Return the content as a Buffer
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.error(`File does not exist at ${filePath}`);
                } else {
                    console.error(`Failed to read file at ${filePath}: ${error.message}`);
                }
                throw error;
            }
        }

        static convertBytes(bytes: number, unit: 'B' | 'KB' | 'MB' | 'GB' = 'KB', decimals = 2) {
            if (bytes === 0) return '0 Bytes';

            const units = {
                B: 1,
                KB: 1024,
                MB: 1024 * 1024,
                GB: 1024 * 1024 * 1024
            };

            const value = bytes / units[unit];
            return Number(value.toFixed(decimals));
        }
    };

    static Number = class {
        static roundToDecimal(num: number, decimalPlaces = 2): number {
            if (isNaN(num)) return NaN;
            const factor = Math.pow(10, decimalPlaces);
            return Math.round(num * factor) / factor;
        }

        static generateRandomNumber(min: number, max: number): number {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        static formatNumberWithCommas(num: number): string {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        static formatLargeNumber(num: number): string {
            if (isNaN(num)) return '0';
            if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
            if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
            if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
            return num.toString();
        }

        static getPercentageChange(oldValue: number, newValue: number): string {
            if (oldValue === 0) return 'N/A';
            const change = ((newValue - oldValue) / oldValue) * 100;
            return change.toFixed(2) + '%';
        }
    };
}
