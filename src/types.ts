/**
 * Core type definitions for offrecord
 */

/**
 * Configuration for redaction behavior
 */
export interface RedactionConfig {
    /** The string to replace secrets with (default: '[REDACTED]') */
    replacement?: string;
    /** Whether to include the pattern name in the replacement (default: false) */
    includePatternName?: boolean;
    /** Custom replacement function */
    replacementFn?: (match: string, patternName: string) => string;
}

/**
 * Registration for a secret pattern
 */
export interface PatternRegistration {
    /** Unique name for this pattern */
    name: string;
    /** Regular expression patterns to match secrets (should have global flag) */
    patterns: RegExp[];
    /** Optional validator function to confirm a match is actually a secret */
    validator?: (value: string) => boolean;
    /** Optional environment variable name associated with this secret type */
    envVar?: string;
    /** Optional description of what this pattern matches */
    description?: string;
}

/**
 * Result of detecting secrets in content
 */
export interface DetectionResult {
    /** Whether any secrets were detected */
    found: boolean;
    /** List of detected secrets with their locations */
    matches: DetectedSecret[];
}

/**
 * A single detected secret
 */
export interface DetectedSecret {
    /** The pattern name that matched */
    patternName: string;
    /** Start index in the original string */
    startIndex: number;
    /** End index in the original string */
    endIndex: number;
    /** The matched value (redacted for safety) */
    redactedValue: string;
}

/**
 * Result of validating a potential secret value
 */
export interface ValidationResult {
    /** Whether the value is valid for the given pattern */
    valid: boolean;
    /** The pattern name used for validation */
    patternName: string;
    /** Optional error message if validation failed */
    error?: string;
}

/**
 * Options for creating safe errors
 */
export interface SafeErrorOptions {
    /** Whether to redact the stack trace (default: true) */
    redactStack?: boolean;
    /** Additional context to include in the error */
    context?: string;
    /** Whether to preserve the original error type (default: true) */
    preserveType?: boolean;
}

