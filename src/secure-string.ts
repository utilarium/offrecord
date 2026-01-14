/**
 * SecureString - Memory-safe secret wrapper
 * 
 * Note: JavaScript/TypeScript cannot guarantee memory clearing due to:
 * - Garbage collection timing is non-deterministic
 * - String immutability means copies may exist
 * - V8 optimizations may keep values in memory
 * 
 * This class provides best-effort protection and prevents accidental
 * serialization/logging of secrets.
 */

/**
 * A wrapper for sensitive string values that prevents accidental exposure
 */
export class SecureString {
    private value: string | null;
    private disposed = false;

    /**
     * Create a new SecureString
     * @param value - The secret value to wrap
     */
    constructor(value: string) {
        this.value = value;
    }

    /**
     * Explicitly reveal the secret value
     * @throws Error if the SecureString has been disposed
     */
    reveal(): string {
        if (this.disposed) {
            throw new Error('SecureString has been disposed');
        }
        if (this.value === null) {
            throw new Error('SecureString value is null');
        }
        return this.value;
    }

    /**
     * Dispose of the secret with best-effort memory clearing
     * After disposal, reveal() will throw an error
     */
    dispose(): void {
        if (this.disposed) {
            return;
        }
        
        // Best-effort memory clearing
        // Note: This doesn't guarantee the value is cleared from memory
        // due to JavaScript's string immutability and GC behavior
        this.value = null;
        this.disposed = true;
    }

    /**
     * Check if this SecureString has been disposed
     */
    isDisposed(): boolean {
        return this.disposed;
    }

    /**
     * Prevent JSON serialization from exposing the secret
     */
    toJSON(): string {
        return '[SecureString]';
    }

    /**
     * Prevent string coercion from exposing the secret
     */
    toString(): string {
        return '[SecureString]';
    }

    /**
     * Prevent valueOf from exposing the secret
     */
    valueOf(): string {
        return '[SecureString]';
    }

    /**
     * Custom inspect for Node.js console.log
     */
    [Symbol.for('nodejs.util.inspect.custom')](): string {
        return '[SecureString]';
    }

    /**
     * Get the length of the secret without revealing it
     */
    get length(): number {
        if (this.disposed || this.value === null) {
            return 0;
        }
        return this.value.length;
    }

    /**
     * Create a SecureString from an environment variable
     * @param envVar - The environment variable name
     * @returns SecureString or null if the variable is not set
     */
    static fromEnv(envVar: string): SecureString | null {
        const value = process.env[envVar];
        if (value === undefined || value === '') {
            return null;
        }
        return new SecureString(value);
    }

    /**
     * Execute a function with the revealed secret, then dispose
     * @param fn - Function to execute with the secret
     * @returns The result of the function
     */
    use<T>(fn: (secret: string) => T): T {
        try {
            return fn(this.reveal());
        } finally {
            this.dispose();
        }
    }

    /**
     * Execute an async function with the revealed secret, then dispose
     * @param fn - Async function to execute with the secret
     * @returns Promise of the result
     */
    async useAsync<T>(fn: (secret: string) => Promise<T>): Promise<T> {
        try {
            return await fn(this.reveal());
        } finally {
            this.dispose();
        }
    }
}

/**
 * Create a SecureString from a value
 * @param value - The secret value
 */
export function secure(value: string): SecureString {
    return new SecureString(value);
}

/**
 * Create a SecureString from an environment variable
 * @param envVar - The environment variable name
 * @throws Error if the environment variable is not set
 */
export function secureFromEnv(envVar: string): SecureString {
    const result = SecureString.fromEnv(envVar);
    if (result === null) {
        throw new Error(`Environment variable '${envVar}' is not set`);
    }
    return result;
}

