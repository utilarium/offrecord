/**
 * Safe error handling utilities
 */

import type { SafeErrorOptions } from './types';
import { getRedactor, SecretRedactor } from './redactor';

/**
 * A sanitized error that has had secrets redacted
 */
export class SafeError extends Error {
    readonly originalName: string;
    readonly context?: string;

    constructor(message: string, originalName: string, stack?: string, context?: string) {
        super(message);
        this.name = 'SafeError';
        this.originalName = originalName;
        this.context = context;
        if (stack) {
            this.stack = stack;
        }
    }
}

/**
 * Create a safe error with secrets redacted
 * @param error - The original error
 * @param redactor - Optional redactor instance (uses global if not provided)
 * @param options - Options for error sanitization
 * @returns A new error with secrets redacted
 */
export function createSafeError(
    error: Error | string | unknown,
    redactor?: SecretRedactor,
    options: SafeErrorOptions = {}
): SafeError {
    const {
        redactStack = true,
        context,
        preserveType = true,
    } = options;

    const r = redactor ?? getRedactor();

    // Handle string errors
    if (typeof error === 'string') {
        return new SafeError(r.redact(error), 'Error', undefined, context);
    }

    // Handle non-Error objects
    if (!(error instanceof Error)) {
        const message = String(error);
        return new SafeError(r.redact(message), 'Error', undefined, context);
    }

    // Redact the message
    const safeMessage = r.redact(error.message);

    // Optionally redact the stack trace
    let safeStack: string | undefined;
    if (error.stack) {
        safeStack = redactStack ? r.redact(error.stack) : error.stack;
    }

    // Get the original error name
    const originalName = preserveType ? error.name : 'Error';

    return new SafeError(safeMessage, originalName, safeStack, context);
}

/**
 * Wrap a synchronous function to catch and sanitize errors
 * @param fn - The function to wrap
 * @param redactor - Optional redactor instance
 * @param context - Optional context for error messages
 * @returns A wrapped function that sanitizes thrown errors
 */
export function withSafeErrors<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    redactor?: SecretRedactor,
    context?: string
): (...args: TArgs) => TReturn {
    return (...args: TArgs): TReturn => {
        try {
            return fn(...args);
        } catch (error) {
            throw createSafeError(error, redactor, { context });
        }
    };
}

/**
 * Wrap an async function to catch and sanitize errors
 * @param fn - The async function to wrap
 * @param redactor - Optional redactor instance
 * @param context - Optional context for error messages
 * @returns A wrapped async function that sanitizes thrown errors
 */
export function withSafeErrorsAsync<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    redactor?: SecretRedactor,
    context?: string
): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
        try {
            return await fn(...args);
        } catch (error) {
            throw createSafeError(error, redactor, { context });
        }
    };
}

/**
 * Sanitize an error message without creating a new error
 * @param message - The message to sanitize
 * @param redactor - Optional redactor instance
 * @returns The sanitized message
 */
export function sanitizeMessage(message: string, redactor?: SecretRedactor): string {
    const r = redactor ?? getRedactor();
    return r.redact(message);
}

/**
 * Sanitize a stack trace
 * @param stack - The stack trace to sanitize
 * @param redactor - Optional redactor instance
 * @returns The sanitized stack trace
 */
export function sanitizeStack(stack: string, redactor?: SecretRedactor): string {
    const r = redactor ?? getRedactor();
    return r.redact(stack);
}

