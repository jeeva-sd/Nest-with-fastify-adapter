export class NumberUtils {
    /**
     * Rounds a number to a specified number of decimal places.
     * @param num - The number to round.
     * @param decimalPlaces - Number of decimal places (default is 2).
     * @returns The rounded number.
     */
    static roundToDecimal(num: number, decimalPlaces = 2): number {
        if (isNaN(num)) return NaN;
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(num * factor) / factor;
    }

    /**
     * Generates a random integer between min and max (inclusive).
     * @param min - Minimum number.
     * @param max - Maximum number.
     * @returns A random number between min and max.
     */
    static generateRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Formats a number with comma separators (e.g., 1234567 -> "1,234,567").
     * @param num - Number to format.
     * @returns The formatted string.
     */
    static formatNumberWithCommas(num: number): string {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Converts large numbers into a compact format with suffix (K, M, B).
     * @param num - Number to format.
     * @returns Formatted string (e.g., 1500 -> "1.5K").
     */
    static formatLargeNumber(num: number): string {
        if (isNaN(num)) return '0';
        if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
        if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
        return num.toString();
    }

    /**
     * Calculates the percentage change between two numbers.
     * @param oldValue - The original number.
     * @param newValue - The new number.
     * @returns Percentage change as a string with '%' (e.g., "-25.00%").
     */
    static getPercentageChange(oldValue: number, newValue: number): string {
        if (oldValue === 0) return 'N/A';
        const change = ((newValue - oldValue) / oldValue) * 100;
        return change.toFixed(2) + '%';
    }

    /**
     * Checks if a number is even.
     * @param num - The number to check.
     * @returns True if even, false if odd.
     */
    static isEven(num: number): boolean {
        return num % 2 === 0;
    }

    /**
     * Checks if a number is a whole number (no decimal part).
     * @param num - The number to check.
     * @returns True if whole number, false otherwise.
     */
    static isWholeNumber(num: number): boolean {
        return Number.isInteger(num);
    }

    /**
     * Clamps a number between a minimum and a maximum value.
     * @param num - The number to clamp.
     * @param min - The lower bound.
     * @param max - The upper bound.
     * @returns The clamped value.
     */
    static clamp(num: number, min: number, max: number): number {
        return Math.min(Math.max(num, min), max);
    }

    /**
     * Converts a number to a fixed decimal string and removes trailing zeroes.
     * @param num - The number to format.
     * @param decimals - Maximum number of decimals.
     * @returns A cleaned string representation.
     */
    static toCleanFixed(num: number, decimals = 2): string {
        return parseFloat(num.toFixed(decimals)).toString();
    }

    /**
     * Converts a number to a percentage string.
     * @param fraction - A number between 0 and 1.
     * @param decimals - Number of decimal places.
     * @returns Percentage string (e.g., 0.1234 -> "12.34%").
     */
    static toPercentage(fraction: number, decimals = 2): string {
        return (fraction * 100).toFixed(decimals) + '%';
    }
}
