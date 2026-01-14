/**
 * Pattern registry for secret detection
 */

import type { PatternRegistration } from './types';

/**
 * Default patterns for common secrets
 * Note: Provider-specific patterns (OpenAI, Anthropic, etc.) should be registered
 * by the provider libraries themselves, not here.
 */
export const DEFAULT_PATTERNS: PatternRegistration[] = [
    {
        name: 'generic-api-key',
        description: 'Generic API key patterns',
        patterns: [
            /api[_-]?key[=:]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
            /apikey[=:]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
        ],
    },
    {
        name: 'generic-secret',
        description: 'Generic secret patterns',
        patterns: [
            /secret[=:]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
            /client[_-]?secret[=:]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi,
        ],
    },
    {
        name: 'generic-password',
        description: 'Password patterns in configuration',
        patterns: [
            /password[=:]\s*['"]?([^\s'"]{8,})['"]?/gi,
            /passwd[=:]\s*['"]?([^\s'"]{8,})['"]?/gi,
        ],
    },
    {
        name: 'bearer-token',
        description: 'Bearer authentication tokens',
        patterns: [
            /bearer\s+([a-zA-Z0-9_.-]{20,})/gi,
        ],
    },
    {
        name: 'aws-access-key',
        description: 'AWS Access Key ID',
        patterns: [
            /AKIA[0-9A-Z]{16}/g,
        ],
        envVar: 'AWS_ACCESS_KEY_ID',
    },
    {
        name: 'aws-secret-key',
        description: 'AWS Secret Access Key',
        patterns: [
            /aws[_-]?secret[_-]?access[_-]?key[=:]\s*['"]?([a-zA-Z0-9/+=]{40})['"]?/gi,
        ],
        envVar: 'AWS_SECRET_ACCESS_KEY',
    },
    {
        name: 'github-token',
        description: 'GitHub personal access tokens',
        patterns: [
            /ghp_[a-zA-Z0-9]{36}/g,
            /gho_[a-zA-Z0-9]{36}/g,
            /ghu_[a-zA-Z0-9]{36}/g,
            /ghs_[a-zA-Z0-9]{36}/g,
            /ghr_[a-zA-Z0-9]{36}/g,
        ],
        envVar: 'GITHUB_TOKEN',
    },
    {
        name: 'gitlab-token',
        description: 'GitLab personal access tokens',
        patterns: [
            /glpat-[a-zA-Z0-9_-]{20,}/g,
        ],
        envVar: 'GITLAB_TOKEN',
    },
    {
        name: 'slack-token',
        description: 'Slack API tokens',
        patterns: [
            /xox[baprs]-[a-zA-Z0-9-]{10,}/g,
        ],
        envVar: 'SLACK_TOKEN',
    },
    {
        name: 'private-key',
        description: 'Private key blocks',
        patterns: [
            /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
            /-----BEGIN\s+EC\s+PRIVATE\s+KEY-----[\s\S]*?-----END\s+EC\s+PRIVATE\s+KEY-----/g,
        ],
    },
    {
        name: 'jwt',
        description: 'JSON Web Tokens',
        patterns: [
            /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
        ],
    },
];

/**
 * Pattern registry class for managing secret patterns
 */
export class PatternRegistry {
    private patterns: Map<string, PatternRegistration> = new Map();

    constructor(includeDefaults = true) {
        if (includeDefaults) {
            this.registerDefaults();
        }
    }

    /**
     * Register the default patterns
     */
    registerDefaults(): void {
        for (const pattern of DEFAULT_PATTERNS) {
            this.register(pattern);
        }
    }

    /**
     * Register a new pattern
     */
    register(registration: PatternRegistration): void {
        this.patterns.set(registration.name, registration);
    }

    /**
     * Unregister a pattern by name
     */
    unregister(name: string): boolean {
        return this.patterns.delete(name);
    }

    /**
     * Get a pattern by name
     */
    get(name: string): PatternRegistration | undefined {
        return this.patterns.get(name);
    }

    /**
     * Get all registered patterns
     */
    getAll(): PatternRegistration[] {
        return Array.from(this.patterns.values());
    }

    /**
     * Check if a pattern is registered
     */
    has(name: string): boolean {
        return this.patterns.has(name);
    }

    /**
     * Clear all patterns
     */
    clear(): void {
        this.patterns.clear();
    }

    /**
     * Get the number of registered patterns
     */
    get size(): number {
        return this.patterns.size;
    }
}

// Global pattern registry instance
let globalRegistry: PatternRegistry | null = null;

/**
 * Get the global pattern registry instance
 */
export function getPatternRegistry(): PatternRegistry {
    if (!globalRegistry) {
        globalRegistry = new PatternRegistry();
    }
    return globalRegistry;
}

/**
 * Reset the global pattern registry (useful for testing)
 */
export function resetPatternRegistry(): void {
    globalRegistry = null;
}

