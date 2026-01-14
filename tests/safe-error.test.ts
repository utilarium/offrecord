import { describe, it, expect, beforeEach } from 'vitest';
import {
    SafeError,
    createSafeError,
    withSafeErrors,
    withSafeErrorsAsync,
    sanitizeMessage,
    sanitizeStack,
} from '../src/safe-error';
import { resetRedactor } from '../src/redactor';
import { resetPatternRegistry } from '../src/patterns';

describe('SafeError', () => {
    beforeEach(() => {
        resetRedactor();
        resetPatternRegistry();
    });

    describe('createSafeError', () => {
        it('should redact secrets from error message', () => {
            const error = new Error('Failed with key ghp_1234567890abcdefghijklmnopqrstuvwxyz');
            const safeError = createSafeError(error);
            expect(safeError.message).not.toContain('ghp_');
            expect(safeError.message).toContain('[REDACTED]');
        });

        it('should preserve original error name', () => {
            class CustomError extends Error {
                constructor(message: string) {
                    super(message);
                    this.name = 'CustomError';
                }
            }
            const error = new CustomError('test');
            const safeError = createSafeError(error);
            expect(safeError.originalName).toBe('CustomError');
        });

        it('should handle string errors', () => {
            const safeError = createSafeError('Error with secret ghp_1234567890abcdefghijklmnopqrstuvwxyz');
            expect(safeError.message).not.toContain('ghp_');
            expect(safeError.message).toContain('[REDACTED]');
        });

        it('should handle non-Error objects', () => {
            const safeError = createSafeError({ toString: () => 'Object error' });
            expect(safeError.message).toBe('Object error');
        });

        it('should redact stack trace by default', () => {
            const error = new Error('test');
            error.stack = 'Error: test\n    at function (ghp_1234567890abcdefghijklmnopqrstuvwxyz)';
            const safeError = createSafeError(error);
            expect(safeError.stack).not.toContain('ghp_');
        });

        it('should preserve stack trace when redactStack is false', () => {
            const error = new Error('test');
            const originalStack = error.stack;
            const safeError = createSafeError(error, undefined, { redactStack: false });
            expect(safeError.stack).toBe(originalStack);
        });

        it('should include context when provided', () => {
            const error = new Error('test');
            const safeError = createSafeError(error, undefined, { context: 'API call' });
            expect(safeError.context).toBe('API call');
        });
    });

    describe('withSafeErrors', () => {
        it('should pass through successful results', () => {
            const fn = (x: number) => x * 2;
            const safeFn = withSafeErrors(fn);
            expect(safeFn(5)).toBe(10);
        });

        it('should sanitize thrown errors', () => {
            const fn = () => {
                throw new Error('Secret: ghp_1234567890abcdefghijklmnopqrstuvwxyz');
            };
            const safeFn = withSafeErrors(fn);
            expect(() => safeFn()).toThrow(SafeError);
            try {
                safeFn();
            } catch (e) {
                expect((e as SafeError).message).not.toContain('ghp_');
            }
        });

        it('should preserve function signature', () => {
            const fn = (a: string, b: number): string => `${a}-${b}`;
            const safeFn = withSafeErrors(fn);
            expect(safeFn('test', 42)).toBe('test-42');
        });

        it('should include context in errors', () => {
            const fn = () => {
                throw new Error('test');
            };
            const safeFn = withSafeErrors(fn, undefined, 'MyContext');
            try {
                safeFn();
            } catch (e) {
                expect((e as SafeError).context).toBe('MyContext');
            }
        });
    });

    describe('withSafeErrorsAsync', () => {
        it('should pass through successful async results', async () => {
            const fn = async (x: number) => x * 2;
            const safeFn = withSafeErrorsAsync(fn);
            expect(await safeFn(5)).toBe(10);
        });

        it('should sanitize rejected promises', async () => {
            const fn = async () => {
                throw new Error('Secret: ghp_1234567890abcdefghijklmnopqrstuvwxyz');
            };
            const safeFn = withSafeErrorsAsync(fn);
            await expect(safeFn()).rejects.toThrow(SafeError);
            try {
                await safeFn();
            } catch (e) {
                expect((e as SafeError).message).not.toContain('ghp_');
            }
        });

        it('should handle async operations', async () => {
            const fn = async (x: number) => {
                await new Promise(resolve => setTimeout(resolve, 1));
                return x * 2;
            };
            const safeFn = withSafeErrorsAsync(fn);
            expect(await safeFn(5)).toBe(10);
        });
    });

    describe('sanitizeMessage', () => {
        it('should redact secrets from message', () => {
            const message = 'Using token ghp_1234567890abcdefghijklmnopqrstuvwxyz';
            const result = sanitizeMessage(message);
            expect(result).not.toContain('ghp_');
            expect(result).toContain('[REDACTED]');
        });

        it('should return clean messages unchanged', () => {
            const message = 'Normal log message';
            expect(sanitizeMessage(message)).toBe(message);
        });
    });

    describe('sanitizeStack', () => {
        it('should redact secrets from stack trace', () => {
            const stack = 'Error: test\n    at fn (file.js:1:1) with ghp_1234567890abcdefghijklmnopqrstuvwxyz';
            const result = sanitizeStack(stack);
            expect(result).not.toContain('ghp_');
            expect(result).toContain('[REDACTED]');
        });
    });
});

