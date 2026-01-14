/**
 * Secret redactor implementation
 */

import type {
    RedactionConfig,
    PatternRegistration,
    DetectionResult,
    DetectedSecret,
    ValidationResult,
} from './types';
import { PatternRegistry, getPatternRegistry } from './patterns';

/**
 * Default redaction configuration
 */
const DEFAULT_CONFIG: Required<RedactionConfig> = {
    replacement: '[REDACTED]',
    includePatternName: false,
    replacementFn: (_, patternName) => `[REDACTED:${patternName}]`,
};

/**
 * SecretRedactor class for detecting and redacting secrets
 */
export class SecretRedactor {
    private config: Required<RedactionConfig>;
    private registry: PatternRegistry;

    constructor(config: RedactionConfig = {}, registry?: PatternRegistry) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.registry = registry ?? getPatternRegistry();
    }

    /**
     * Redact secrets from content
     * @param content - The content to redact secrets from
     * @param source - Optional source identifier for logging
     * @returns The content with secrets redacted
     */
    redact(content: string, _source?: string): string {
        if (!content) {
            return content;
        }

        let result = content;
        const patterns = this.registry.getAll();

        for (const registration of patterns) {
            for (const pattern of registration.patterns) {
                // Reset lastIndex for global patterns
                pattern.lastIndex = 0;
                
                result = result.replace(pattern, (match) => {
                    // If there's a validator, check if this is actually a secret
                    if (registration.validator && !registration.validator(match)) {
                        return match;
                    }

                    if (this.config.includePatternName) {
                        return this.config.replacementFn(match, registration.name);
                    }
                    return this.config.replacement;
                });
            }
        }

        return result;
    }

    /**
     * Detect secrets in content without redacting
     * @param content - The content to scan for secrets
     * @returns Detection result with found secrets
     */
    detect(content: string): DetectionResult {
        if (!content) {
            return { found: false, matches: [] };
        }

        const matches: DetectedSecret[] = [];
        const patterns = this.registry.getAll();

        for (const registration of patterns) {
            for (const pattern of registration.patterns) {
                // Reset lastIndex for global patterns
                pattern.lastIndex = 0;
                
                let match: RegExpExecArray | null;
                while ((match = pattern.exec(content)) !== null) {
                    // If there's a validator, check if this is actually a secret
                    if (registration.validator && !registration.validator(match[0])) {
                        continue;
                    }

                    matches.push({
                        patternName: registration.name,
                        startIndex: match.index,
                        endIndex: match.index + match[0].length,
                        redactedValue: this.redactValue(match[0]),
                    });
                }
            }
        }

        return {
            found: matches.length > 0,
            matches,
        };
    }

    /**
     * Validate a value against a specific pattern
     * @param value - The value to validate
     * @param patternName - The name of the pattern to validate against
     * @returns Validation result
     */
    validateKey(value: string, patternName: string): ValidationResult {
        const registration = this.registry.get(patternName);
        
        if (!registration) {
            return {
                valid: false,
                patternName,
                error: `Pattern '${patternName}' not found`,
            };
        }

        // Check if value matches any of the patterns
        const matchesPattern = registration.patterns.some(pattern => {
            pattern.lastIndex = 0;
            return pattern.test(value);
        });

        if (!matchesPattern) {
            return {
                valid: false,
                patternName,
                error: 'Value does not match pattern format',
            };
        }

        // If there's a validator, use it
        if (registration.validator) {
            const isValid = registration.validator(value);
            return {
                valid: isValid,
                patternName,
                error: isValid ? undefined : 'Value failed validation',
            };
        }

        return {
            valid: true,
            patternName,
        };
    }

    /**
     * Register a new pattern
     */
    register(registration: PatternRegistration): void {
        this.registry.register(registration);
    }

    /**
     * Unregister a pattern by name
     */
    unregister(name: string): boolean {
        return this.registry.unregister(name);
    }

    /**
     * Get the pattern registry
     */
    getRegistry(): PatternRegistry {
        return this.registry;
    }

    /**
     * Redact a single value for display in detection results
     */
    private redactValue(value: string): string {
        if (value.length <= 8) {
            return '***';
        }
        // Show first 2 and last 2 characters
        return `${value.slice(0, 2)}...${value.slice(-2)}`;
    }
}

// Global redactor instance
let globalRedactor: SecretRedactor | null = null;

/**
 * Get the global redactor instance
 */
export function getRedactor(): SecretRedactor {
    if (!globalRedactor) {
        globalRedactor = new SecretRedactor();
    }
    return globalRedactor;
}

/**
 * Configure the global redactor
 * @param config - Configuration options
 * @param registry - Optional custom pattern registry
 */
export function configureRedactor(config: RedactionConfig = {}, registry?: PatternRegistry): SecretRedactor {
    globalRedactor = new SecretRedactor(config, registry);
    return globalRedactor;
}

/**
 * Reset the global redactor (useful for testing)
 */
export function resetRedactor(): void {
    globalRedactor = null;
}

