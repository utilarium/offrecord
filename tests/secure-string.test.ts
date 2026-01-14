import { describe, it, expect } from 'vitest';
import { SecureString, secure, secureFromEnv } from '../src/secure-string';

describe('SecureString', () => {
    describe('construction', () => {
        it('should create a SecureString from a value', () => {
            const ss = new SecureString('secret-value');
            expect(ss).toBeInstanceOf(SecureString);
            expect(ss.isDisposed()).toBe(false);
        });

        it('should create using secure() helper', () => {
            const ss = secure('secret-value');
            expect(ss).toBeInstanceOf(SecureString);
        });
    });

    describe('reveal', () => {
        it('should reveal the secret value', () => {
            const ss = new SecureString('my-secret');
            expect(ss.reveal()).toBe('my-secret');
        });

        it('should throw after disposal', () => {
            const ss = new SecureString('my-secret');
            ss.dispose();
            expect(() => ss.reveal()).toThrow('SecureString has been disposed');
        });
    });

    describe('disposal', () => {
        it('should mark as disposed after dispose()', () => {
            const ss = new SecureString('secret');
            expect(ss.isDisposed()).toBe(false);
            ss.dispose();
            expect(ss.isDisposed()).toBe(true);
        });

        it('should be idempotent', () => {
            const ss = new SecureString('secret');
            ss.dispose();
            ss.dispose(); // Should not throw
            expect(ss.isDisposed()).toBe(true);
        });
    });

    describe('serialization prevention', () => {
        it('should return [SecureString] from toString()', () => {
            const ss = new SecureString('secret');
            expect(ss.toString()).toBe('[SecureString]');
        });

        it('should return [SecureString] from toJSON()', () => {
            const ss = new SecureString('secret');
            expect(ss.toJSON()).toBe('[SecureString]');
        });

        it('should return [SecureString] from valueOf()', () => {
            const ss = new SecureString('secret');
            expect(ss.valueOf()).toBe('[SecureString]');
        });

        it('should serialize safely in JSON.stringify', () => {
            const ss = new SecureString('secret');
            const obj = { key: ss };
            const json = JSON.stringify(obj);
            expect(json).toBe('{"key":"[SecureString]"}');
            expect(json).not.toContain('secret');
        });

        it('should not expose secret in string concatenation', () => {
            const ss = new SecureString('secret');
            const result = 'Value: ' + ss;
            expect(result).toBe('Value: [SecureString]');
            expect(result).not.toContain('secret');
        });
    });

    describe('length', () => {
        it('should return the length of the secret', () => {
            const ss = new SecureString('12345');
            expect(ss.length).toBe(5);
        });

        it('should return 0 after disposal', () => {
            const ss = new SecureString('12345');
            ss.dispose();
            expect(ss.length).toBe(0);
        });
    });

    describe('use', () => {
        it('should execute function with revealed secret', () => {
            const ss = new SecureString('secret');
            const result = ss.use((s) => s.toUpperCase());
            expect(result).toBe('SECRET');
        });

        it('should dispose after use', () => {
            const ss = new SecureString('secret');
            ss.use(() => {});
            expect(ss.isDisposed()).toBe(true);
        });

        it('should dispose even if function throws', () => {
            const ss = new SecureString('secret');
            expect(() => ss.use(() => {
                throw new Error('test');
            })).toThrow('test');
            expect(ss.isDisposed()).toBe(true);
        });
    });

    describe('useAsync', () => {
        it('should execute async function with revealed secret', async () => {
            const ss = new SecureString('secret');
            const result = await ss.useAsync(async (s) => {
                await Promise.resolve();
                return s.toUpperCase();
            });
            expect(result).toBe('SECRET');
        });

        it('should dispose after async use', async () => {
            const ss = new SecureString('secret');
            await ss.useAsync(async () => {
                await Promise.resolve();
            });
            expect(ss.isDisposed()).toBe(true);
        });

        it('should dispose even if async function throws', async () => {
            const ss = new SecureString('secret');
            await expect(ss.useAsync(async () => {
                await Promise.resolve();
                throw new Error('test');
            })).rejects.toThrow('test');
            expect(ss.isDisposed()).toBe(true);
        });
    });

    describe('fromEnv', () => {
        it('should return null for unset env var', () => {
            const result = SecureString.fromEnv('NONEXISTENT_VAR_12345');
            expect(result).toBeNull();
        });

        it('should return null for empty env var', () => {
            process.env.EMPTY_TEST_VAR = '';
            const result = SecureString.fromEnv('EMPTY_TEST_VAR');
            expect(result).toBeNull();
            delete process.env.EMPTY_TEST_VAR;
        });

        it('should create SecureString from set env var', () => {
            process.env.TEST_SECRET_VAR = 'test-secret-value';
            const result = SecureString.fromEnv('TEST_SECRET_VAR');
            expect(result).toBeInstanceOf(SecureString);
            expect(result?.reveal()).toBe('test-secret-value');
            delete process.env.TEST_SECRET_VAR;
        });
    });

    describe('secureFromEnv', () => {
        it('should throw for unset env var', () => {
            expect(() => secureFromEnv('NONEXISTENT_VAR_12345'))
                .toThrow("Environment variable 'NONEXISTENT_VAR_12345' is not set");
        });

        it('should return SecureString for set env var', () => {
            process.env.TEST_SECRET_VAR2 = 'another-secret';
            const result = secureFromEnv('TEST_SECRET_VAR2');
            expect(result).toBeInstanceOf(SecureString);
            expect(result.reveal()).toBe('another-secret');
            delete process.env.TEST_SECRET_VAR2;
        });
    });
});

