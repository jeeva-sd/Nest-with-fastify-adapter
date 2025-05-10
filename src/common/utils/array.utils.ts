export class ArrayUtils {
    /**
     * Groups an array of objects by the specified key.
     * Optionally accepts a formatter function to customize the grouping key.
     */
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

    /**
     * Converts an array of objects into an object, using the specified key as the object's key.
     * Each key will point to the corresponding object.
     */
    static objectById(key: string) {
        return (array: any[]) => {
            return array.reduce((obj: any, item: any) => {
                const value = item[key];
                obj[value] = item;
                return obj;
            }, {});
        };
    }

    /**
     * Breaks an array into chunks of the specified size.
     */
    static chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Sorts an array of objects by the specified key, optionally in ascending or descending order.
     */
    static sortByKey<T>(array: T[], key: keyof T, ascending: boolean = true): T[] {
        return array.slice().sort((a, b) => {
            const valueA = a[key];
            const valueB = b[key];
            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
        });
    }

    /**
     * Removes duplicates from an array based on primitive values (strings, numbers, etc).
     */
    static unique<T>(array: T[]): T[] {
        return Array.from(new Set(array));
    }

    /**
     * Removes duplicates from an array of objects based on a specified key.
     */
    static uniqueBy<T>(array: T[], key: keyof T): T[] {
        const seen = new Set();
        return array.filter(item => {
            const val = item[key];
            if (seen.has(val)) return false;
            seen.add(val);
            return true;
        });
    }

    /**
     * Flattens an array one level deep.
     */
    static flatten<T>(array: any[][]): T[] {
        return array.reduce((acc, val) => acc.concat(val), []);
    }

    /**
     * Returns the intersection of two arrays (elements common in both).
     */
    static intersection<T>(array1: T[], array2: T[]): T[] {
        const set = new Set(array2);
        return array1.filter(item => set.has(item));
    }

    /**
     * Returns the difference between two arrays (items in array1 not in array2).
     */
    static difference<T>(array1: T[], array2: T[]): T[] {
        const set = new Set(array2);
        return array1.filter(item => !set.has(item));
    }

    /**
     * Shuffles an array in place using Fisher-Yates algorithm.
     */
    static shuffle<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Returns a random element from the array.
     */
    static randomElement<T>(array: T[]): T | undefined {
        if (!array.length) return undefined;
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }
}
