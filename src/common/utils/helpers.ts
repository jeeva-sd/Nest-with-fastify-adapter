import * as CryptoJS from 'crypto-js';
import { appConfig } from '~/configs';
import { ArrayUtils } from './array.utils';
import { ObjectUtils } from './object.utils';
import { StringUtils } from './string.utils';
import { FileUtils } from './file.utils';
import { NumberUtils } from './number.utils';

export class Helper {
    static Array = ArrayUtils;
    static Object = ObjectUtils;
    static String = StringUtils;
    static File = FileUtils;
    static Number = NumberUtils;

    // ---------------------------------------
    // General Utility Functions
    // ---------------------------------------

    /**
     * Returns a Promise that resolves after a specified delay (in milliseconds).
     */
    static wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Encrypts any JavaScript value using AES encryption.
     * Returns the encrypted string or null on error.
     */
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

    /**
     * Decrypts a previously encrypted AES string and parses it back into an object.
     * Returns null on failure.
     */
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
}
