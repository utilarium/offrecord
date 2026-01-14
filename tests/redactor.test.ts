import { describe, it, expect, beforeEach } from 'vitest';
import {
    SecretRedactor,
    getRedactor,
    configureRedactor,
    resetRedactor,
} from '../src/redactor';
import { PatternRegistry, resetPatternRegistry } from '../src/patterns';

describe('SecretRedactor', () => {
    beforeEach(() => {
        resetRedactor();
        resetPatternRegistry();
    });

    describe('redact', () => {
        it('should redact generic API keys', () => {
            const redactor = new SecretRedactor();
            const input = 'api_key="sk-abcdefghijklmnopqrstuvwxyz123456"';
            const result = redactor.redact(input);
            expect(result).toBe('[REDACTED]');
        });

        it('should redact bearer tokens', () => {
            const redactor = new SecretRedactor();
            const input = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            const result = redactor.redact(input);
            expect(result).toContain('[REDACTED]');
        });

        it('should redact AWS access keys', () => {
            const redactor = new SecretRedactor();
            const input = 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE';
            const result = redactor.redact(input);
            expect(result).toBe('AWS_ACCESS_KEY_ID=[REDACTED]');
        });

        it('should redact GitHub tokens', () => {
            const redactor = new SecretRedactor();
            const input = 'GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz';
            const result = redactor.redact(input);
            expect(result).toBe('GITHUB_TOKEN=[REDACTED]');
        });

        it('should redact Slack tokens', () => {
            const redactor = new SecretRedactor();
            // Use a clearly fake token that matches the pattern but won't trigger GitHub secret scanning
            const fakeSlackToken = ['xoxb', 'FAKE', 'TEST', 'notarealtoken'].join('-');
            const input = `token: ${fakeSlackToken}`;
            const result = redactor.redact(input);
            expect(result).toBe('token: [REDACTED]');
        });

        it('should redact JWTs', () => {
            const redactor = new SecretRedactor();
            const input = 'token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.signature123';
            const result = redactor.redact(input);
            expect(result).toContain('[REDACTED]');
        });

        it('should handle empty strings', () => {
            const redactor = new SecretRedactor();
            expect(redactor.redact('')).toBe('');
        });

        it('should handle strings without secrets', () => {
            const redactor = new SecretRedactor();
            const input = 'Hello, this is a normal log message';
            expect(redactor.redact(input)).toBe(input);
        });

        it('should redact multiple secrets in one string', () => {
            const redactor = new SecretRedactor();
            // Construct the slack token at runtime to avoid triggering GitHub secret scanning
            const fakeSlackToken = ['xoxb', 'FAKE123456', 'TEST789012'].join('-');
            const input = `api_key="key12345678901234567890" and token ${fakeSlackToken}`;
            const result = redactor.redact(input);
            expect(result).not.toContain('key12345678901234567890');
            expect(result).not.toContain(fakeSlackToken);
        });
    });

    describe('detect', () => {
        it('should detect secrets without redacting', () => {
            const redactor = new SecretRedactor();
            const input = 'GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz';
            const result = redactor.detect(input);
            expect(result.found).toBe(true);
            expect(result.matches.length).toBeGreaterThan(0);
            expect(result.matches[0].patternName).toBe('github-token');
        });

        it('should return empty matches for clean content', () => {
            const redactor = new SecretRedactor();
            const input = 'No secrets here';
            const result = redactor.detect(input);
            expect(result.found).toBe(false);
            expect(result.matches).toHaveLength(0);
        });

        it('should handle empty strings', () => {
            const redactor = new SecretRedactor();
            const result = redactor.detect('');
            expect(result.found).toBe(false);
            expect(result.matches).toHaveLength(0);
        });
    });

    describe('validateKey', () => {
        it('should validate against registered patterns', () => {
            const redactor = new SecretRedactor();
            redactor.register({
                name: 'test-key',
                patterns: [/^test-[a-z]{10}$/g],
                validator: (v) => v.startsWith('test-'),
            });

            const result = redactor.validateKey('test-abcdefghij', 'test-key');
            expect(result.valid).toBe(true);
        });

        it('should return error for unknown pattern', () => {
            const redactor = new SecretRedactor();
            const result = redactor.validateKey('some-value', 'unknown-pattern');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('not found');
        });
    });

    describe('custom configuration', () => {
        it('should use custom replacement string', () => {
            const redactor = new SecretRedactor({ replacement: '***HIDDEN***' });
            const input = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
            const result = redactor.redact(input);
            expect(result).toBe('***HIDDEN***');
        });

        it('should include pattern name when configured', () => {
            const redactor = new SecretRedactor({ includePatternName: true });
            const input = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
            const result = redactor.redact(input);
            expect(result).toContain('github-token');
        });
    });

    describe('pattern registration', () => {
        it('should allow registering custom patterns', () => {
            const redactor = new SecretRedactor();
            redactor.register({
                name: 'custom',
                patterns: [/CUSTOM_[A-Z0-9]{20}/g],
            });

            const input = 'key: CUSTOM_ABCDEFGHIJ1234567890';
            const result = redactor.redact(input);
            expect(result).toBe('key: [REDACTED]');
        });

        it('should allow unregistering patterns', () => {
            const redactor = new SecretRedactor();
            redactor.unregister('github-token');

            const input = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
            const result = redactor.redact(input);
            // Should not be redacted since pattern was removed
            expect(result).toBe(input);
        });
    });

    describe('global redactor', () => {
        it('should return the same instance', () => {
            const r1 = getRedactor();
            const r2 = getRedactor();
            expect(r1).toBe(r2);
        });

        it('should be configurable', () => {
            configureRedactor({ replacement: '<<SECRET>>' });
            const redactor = getRedactor();
            const input = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
            const result = redactor.redact(input);
            expect(result).toBe('<<SECRET>>');
        });
    });
});

