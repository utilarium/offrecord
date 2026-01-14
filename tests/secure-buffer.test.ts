import { describe, it, expect } from 'vitest';
import {
    secureZero,
    secureCompare,
    secureCompareBuffers,
    createSecureBuffer,
    stringToSecureBuffer,
    secureBufferToString,
} from '../src/secure-buffer';

describe('Secure Buffer Utilities', () => {
    describe('secureZero', () => {
        it('should zero buffer contents', () => {
            const buffer = Buffer.from('secret');
            secureZero(buffer);
            expect(buffer.every(b => b === 0)).toBe(true);
        });

        it('should handle empty buffer', () => {
            const buffer = Buffer.alloc(0);
            secureZero(buffer);
            expect(buffer.length).toBe(0);
        });

        it('should zero buffer with binary data', () => {
            const buffer = Buffer.from([0xff, 0xfe, 0xfd, 0xfc]);
            secureZero(buffer);
            expect(buffer.every(b => b === 0)).toBe(true);
        });
    });

    describe('secureCompare', () => {
        it('should return true for equal strings', () => {
            expect(secureCompare('secret', 'secret')).toBe(true);
        });

        it('should return false for different strings', () => {
            expect(secureCompare('secret', 'Secret')).toBe(false);
        });

        it('should return false for different lengths', () => {
            expect(secureCompare('short', 'longer')).toBe(false);
        });

        it('should handle empty strings', () => {
            expect(secureCompare('', '')).toBe(true);
            expect(secureCompare('', 'a')).toBe(false);
        });

        it('should handle unicode strings', () => {
            expect(secureCompare('🔐secret', '🔐secret')).toBe(true);
            expect(secureCompare('🔐secret', '🔑secret')).toBe(false);
        });
    });

    describe('secureCompareBuffers', () => {
        it('should return true for equal buffers', () => {
            const a = Buffer.from('secret');
            const b = Buffer.from('secret');
            expect(secureCompareBuffers(a, b)).toBe(true);
        });

        it('should return false for different buffers', () => {
            const a = Buffer.from('secret');
            const b = Buffer.from('Secret');
            expect(secureCompareBuffers(a, b)).toBe(false);
        });

        it('should return false for different lengths', () => {
            const a = Buffer.from('short');
            const b = Buffer.from('longer');
            expect(secureCompareBuffers(a, b)).toBe(false);
        });

        it('should handle empty buffers', () => {
            const a = Buffer.alloc(0);
            const b = Buffer.alloc(0);
            expect(secureCompareBuffers(a, b)).toBe(true);
        });
    });

    describe('createSecureBuffer', () => {
        it('should create buffer of specified size', () => {
            const buffer = createSecureBuffer(32);
            expect(buffer.length).toBe(32);
        });

        it('should create zero-filled buffer', () => {
            const buffer = createSecureBuffer(16);
            expect(buffer.every(b => b === 0)).toBe(true);
        });

        it('should handle zero size', () => {
            const buffer = createSecureBuffer(0);
            expect(buffer.length).toBe(0);
        });
    });

    describe('stringToSecureBuffer', () => {
        it('should create buffer from string', () => {
            const buffer = stringToSecureBuffer('test');
            expect(buffer.toString('utf8')).toBe('test');
        });

        it('should handle empty string', () => {
            const buffer = stringToSecureBuffer('');
            expect(buffer.length).toBe(0);
        });

        it('should handle unicode', () => {
            const buffer = stringToSecureBuffer('🔐');
            expect(buffer.toString('utf8')).toBe('🔐');
        });
    });

    describe('secureBufferToString', () => {
        it('should read string and zero buffer', () => {
            const buffer = Buffer.from('secret');
            const value = secureBufferToString(buffer);
            expect(value).toBe('secret');
            expect(buffer.every(b => b === 0)).toBe(true);
        });

        it('should handle empty buffer', () => {
            const buffer = Buffer.alloc(0);
            const value = secureBufferToString(buffer);
            expect(value).toBe('');
        });

        it('should handle unicode', () => {
            const buffer = Buffer.from('🔐secret');
            const value = secureBufferToString(buffer);
            expect(value).toBe('🔐secret');
            expect(buffer.every(b => b === 0)).toBe(true);
        });
    });
});

