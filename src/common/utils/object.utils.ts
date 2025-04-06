export class ObjectUtils {
    /**
     * Deeply merges two objects. Modifies and returns the base object.
     */
    static deepMerge(base, newObj) {
        for (const key of Object.keys(newObj)) {
            // If the value is an object (not null, not array), merge recursively
            if (typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])) {
                if (!(key in base)) base[key] = {};
                base[key] = this.deepMerge(base[key], newObj[key]);
            } else {
                // Overwrite the value from newObj to base
                if (key in newObj) base[key] = newObj[key];
            }
        }

        return base;
    }

    /**
     * Deep clones an object using JSON serialization.
     */
    static deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Checks if a value is a plain object (not null, not array).
     */
    static isObject(value: any): boolean {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    /**
     * Checks if a value is a function.
     */
    static isFunction(value: any): boolean {
        return typeof value === 'function';
    }

    /**
     * Checks if an object has no own enumerable keys.
     */
    static isObjectEmpty(obj: object): boolean {
        return Object.keys(obj).length === 0;
    }

    /**
     * Returns an array of the object's own keys.
     */
    static getObjectKeys(obj: object): string[] {
        return Object.keys(obj);
    }

    /**
     * Returns an array of the object's own values.
     */
    static getObjectValues(obj: object): any[] {
        return Object.values(obj);
    }

    /**
     * Picks specific keys from an object and returns a new object with those key-value pairs.
     */
    static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
        const result: Partial<T> = {};
        keys.forEach((key) => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result as Pick<T, K>;
    }

    /**
     * Omits specific keys from an object and returns a new object without those keys.
     */
    static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
        const result: Partial<T> = { ...obj };
        keys.forEach((key) => {
            delete result[key];
        });
        return result as Omit<T, K>;
    }

    /**
     * Flattens a nested object into a single-level object using dot notation keys.
     */
    static flattenObject(obj: object, prefix = ''): object {
        const result: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (ObjectUtils.isObject(value) && !Array.isArray(value)) {
                    Object.assign(result, ObjectUtils.flattenObject(value, newKey));
                } else {
                    result[newKey] = value;
                }
            }
        }
        return result;
    }

    /**
     * Converts a flattened object (dot notation keys) back into a nested object.
     */
    static unflattenObject(obj: object): object {
        const result: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                // Split the key by dot and build the nested structure
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
}
