import { describe, it, expect, beforeEach } from 'vitest';
import {
    PatternRegistry,
    getPatternRegistry,
    resetPatternRegistry,
    DEFAULT_PATTERNS,
} from '../src/patterns';

describe('PatternRegistry', () => {
    beforeEach(() => {
        resetPatternRegistry();
    });

    describe('construction', () => {
        it('should include default patterns by default', () => {
            const registry = new PatternRegistry();
            expect(registry.size).toBeGreaterThan(0);
            expect(registry.has('github-token')).toBe(true);
        });

        it('should allow excluding default patterns', () => {
            const registry = new PatternRegistry(false);
            expect(registry.size).toBe(0);
        });
    });

    describe('register', () => {
        it('should register a new pattern', () => {
            const registry = new PatternRegistry(false);
            registry.register({
                name: 'test-pattern',
                patterns: [/test-[a-z]+/g],
            });
            expect(registry.has('test-pattern')).toBe(true);
        });

        it('should overwrite existing pattern with same name', () => {
            const registry = new PatternRegistry(false);
            registry.register({
                name: 'test',
                patterns: [/first/g],
            });
            registry.register({
                name: 'test',
                patterns: [/second/g],
            });
            const pattern = registry.get('test');
            expect(pattern?.patterns[0].source).toBe('second');
        });
    });

    describe('unregister', () => {
        it('should remove a registered pattern', () => {
            const registry = new PatternRegistry();
            expect(registry.has('github-token')).toBe(true);
            const result = registry.unregister('github-token');
            expect(result).toBe(true);
            expect(registry.has('github-token')).toBe(false);
        });

        it('should return false for non-existent pattern', () => {
            const registry = new PatternRegistry();
            const result = registry.unregister('nonexistent');
            expect(result).toBe(false);
        });
    });

    describe('get', () => {
        it('should return registered pattern', () => {
            const registry = new PatternRegistry();
            const pattern = registry.get('github-token');
            expect(pattern).toBeDefined();
            expect(pattern?.name).toBe('github-token');
        });

        it('should return undefined for non-existent pattern', () => {
            const registry = new PatternRegistry();
            expect(registry.get('nonexistent')).toBeUndefined();
        });
    });

    describe('getAll', () => {
        it('should return all registered patterns', () => {
            const registry = new PatternRegistry();
            const patterns = registry.getAll();
            expect(patterns.length).toBeGreaterThan(0);
            expect(patterns.some(p => p.name === 'github-token')).toBe(true);
        });
    });

    describe('clear', () => {
        it('should remove all patterns', () => {
            const registry = new PatternRegistry();
            expect(registry.size).toBeGreaterThan(0);
            registry.clear();
            expect(registry.size).toBe(0);
        });
    });

    describe('global registry', () => {
        it('should return the same instance', () => {
            const r1 = getPatternRegistry();
            const r2 = getPatternRegistry();
            expect(r1).toBe(r2);
        });

        it('should reset properly', () => {
            const r1 = getPatternRegistry();
            resetPatternRegistry();
            const r2 = getPatternRegistry();
            expect(r1).not.toBe(r2);
        });
    });

    describe('DEFAULT_PATTERNS', () => {
        it('should include common secret patterns', () => {
            const names = DEFAULT_PATTERNS.map(p => p.name);
            expect(names).toContain('github-token');
            expect(names).toContain('aws-access-key');
            expect(names).toContain('bearer-token');
            expect(names).toContain('jwt');
        });

        it('should have valid regex patterns', () => {
            for (const registration of DEFAULT_PATTERNS) {
                for (const pattern of registration.patterns) {
                    expect(pattern).toBeInstanceOf(RegExp);
                    expect(pattern.flags).toContain('g');
                }
            }
        });
    });
});

