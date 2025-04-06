export class StringUtils {
    /**
     * Capitalizes the first letter of each word in the string.
     */
    static capitalizeWords(str: string): string {
        if (!str) return '';
        return str
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    /**
     * Converts a string to title case, adding spaces between camelCase words.
     */
    static toTitleCase(str: string): string {
        if (!str) return '';
        return str
            .trim()
            .toLowerCase()
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    /**
     * Converts a space-separated string to camelCase.
     */
    static toCamelCase(str: string): string {
        if (!str) return '';
        return str.trim().replace(/\s(.)/g, (_, char) => char.toUpperCase());
    }

    /**
     * Truncates a string to the specified maxLength and appends ellipsis if necessary.
     */
    static truncate(str: string, maxLength: number): string {
        if (!str || maxLength <= 0) return '';
        return str.length > maxLength ? str.trim().slice(0, maxLength) + '...' : str;
    }

    /**
     * Checks whether the string is empty or only contains whitespace.
     */
    static isEmptyString(str: string): boolean {
        return !str || str.trim().length === 0;
    }

    /**
     * Removes all whitespace characters from the string.
     */
    static removeWhitespace(str: string): string {
        if (!str) return '';
        return str.replace(/\s/g, '');
    }

    /**
     * Counts the number of words in the string.
     */
    static countWords(str: string): number {
        if (!str) return 0;
        const words = str.split(/\s+/).filter((word) => word.length > 0);
        return words.length;
    }

    /**
     * Validates if the input is a properly formatted email address.
     */
    static isEmail(str: string): boolean {
        if (!str) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    }

    /**
     * Converts a string into a URL-friendly slug.
     */
    static slugify(str: string): string {
        if (!str) return '';
        return str
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    /**
     * Removes all special characters from the string, preserving alphanumerics and spaces.
     */
    static removeSpecialChars(str: string): string {
        if (!str) return '';
        return str.replace(/[^\w\s]/g, '');
    }

    /**
     * Generates a random alphanumeric string of the specified length.
     */
    static getRandomString(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Pads a string equally on both sides with the specified character to reach the given length.
     */
    static padString(str: string, length: number, char: string = ' '): string {
        if (!str || length <= str.length) return str;
        const pad = char.repeat(length - str.length);
        return pad.slice(0, Math.floor(pad.length / 2)) + str + pad.slice(Math.floor(pad.length / 2));
    }

    /**
     * Reverses the characters in the string.
     */
    static reverse(str: string): string {
        return str.split('').reverse().join('');
    }

    /**
     * Repeats a string a given number of times.
     */
    static repeat(str: string, count: number): string {
        return str.repeat(count);
    }

    /**
     * Checks if a string contains only alphabetic characters.
     */
    static isAlpha(str: string): boolean {
        return /^[a-zA-Z]+$/.test(str);
    }

    /**
     * Checks if a string contains only numeric digits.
     */
    static isNumeric(str: string): boolean {
        return /^[0-9]+$/.test(str);
    }

    /**
     * Extracts all numbers from a string and returns them as an array of numbers.
     */
    static extractNumbers(str: string): number[] {
        const matches = str.match(/\d+/g);
        return matches ? matches.map(Number) : [];
    }

    /**
     * Converts the first character of a string to uppercase.
     */
    static capitalizeFirst(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Checks whether a string starts with a given substring.
     */
    static startsWith(str: string, prefix: string): boolean {
        return str.startsWith(prefix);
    }

    /**
     * Checks whether a string ends with a given substring.
     */
    static endsWith(str: string, suffix: string): boolean {
        return str.endsWith(suffix);
    }
}
