# API Reference

Complete API documentation for offrecord.

## Redactor

### getRedactor()

Get the global redactor instance.

```typescript
function getRedactor(): SecretRedactor
```

**Example:**
```typescript
import { getRedactor } from '@theunwalked/offrecord';

const redactor = getRedactor();
const safe = redactor.redact('api_key=secret');
```

### configureRedactor(config, registry?)

Configure the global redactor.

```typescript
function configureRedactor(
  config: Partial<RedactorConfig>,
  registry?: PatternRegistry
): void
```

### SecretRedactor

Class for creating custom redactor instances.

```typescript
class SecretRedactor {
  constructor(config?: Partial<RedactorConfig>);
  
  redact(text: string): string;
  detect(text: string): DetectionResult;
  register(pattern: PatternDefinition): void;
}
```

## Patterns

### getPatternRegistry()

Get the global pattern registry.

```typescript
function getPatternRegistry(): PatternRegistry
```

### PatternRegistry

Class for managing patterns.

```typescript
class PatternRegistry {
  constructor();
  
  register(pattern: PatternDefinition): void;
  getPatterns(): PatternDefinition[];
  getPattern(name: string): PatternDefinition | undefined;
}
```

### DEFAULT_PATTERNS

Built-in pattern definitions.

```typescript
const DEFAULT_PATTERNS: PatternDefinition[]
```

### PatternDefinition

```typescript
interface PatternDefinition {
  name: string;
  patterns: RegExp[];
  validator?: (value: string) => boolean;
  envVar?: string;
  description?: string;
}
```

### DetectionResult

```typescript
interface DetectionResult {
  found: boolean;
  matches: Array<{
    pattern: string;
    value: string;
    start: number;
    end: number;
  }>;
}
```

## SecureString

### SecureString Class

```typescript
class SecureString {
  constructor(value: string);
  
  reveal(): string | undefined;
  use(callback: (value: string) => void): void;
  useAsync<T>(callback: (value: string) => Promise<T>): Promise<T>;
  dispose(): void;
  
  toString(): string;      // Returns '[SecureString]'
  toJSON(): string;        // Returns '[SecureString]'
  valueOf(): string;       // Returns '[SecureString]'
}
```

### secure(value)

Create a SecureString.

```typescript
function secure(value: string): SecureString
```

### secureFromEnv(envVar)

Create a SecureString from an environment variable.

```typescript
function secureFromEnv(envVar: string): SecureString | undefined
```

## Safe Errors

### createSafeError(error, redactor?, options?)

Create a sanitized error.

```typescript
function createSafeError(
  error: unknown,
  redactor?: SecretRedactor,
  options?: SafeErrorOptions
): Error

interface SafeErrorOptions {
  includeStack?: boolean;
  maxLength?: number;
}
```

### withSafeErrors(fn, redactor?, context?)

Wrap a synchronous function to sanitize errors.

```typescript
function withSafeErrors<T extends (...args: any[]) => any>(
  fn: T,
  redactor?: SecretRedactor,
  context?: Record<string, unknown>
): T
```

### withSafeErrorsAsync(fn, redactor?, context?)

Wrap an async function to sanitize errors.

```typescript
function withSafeErrorsAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  redactor?: SecretRedactor,
  context?: Record<string, unknown>
): T
```

### sanitizeMessage(message, redactor?)

Sanitize a message string.

```typescript
function sanitizeMessage(
  message: string,
  redactor?: SecretRedactor
): string
```

### sanitizeStack(stack, redactor?)

Sanitize a stack trace.

```typescript
function sanitizeStack(
  stack: string,
  redactor?: SecretRedactor
): string
```

## Secure Buffers

### secureZero(buffer)

Zero out buffer contents.

```typescript
function secureZero(buffer: Buffer): void
```

### secureCompare(a, b)

Timing-safe string comparison.

```typescript
function secureCompare(a: string, b: string): boolean
```

### secureCompareBuffers(a, b)

Timing-safe buffer comparison.

```typescript
function secureCompareBuffers(a: Buffer, b: Buffer): boolean
```

### createSecureBuffer(size)

Create a zeroed buffer.

```typescript
function createSecureBuffer(size: number): Buffer
```

### stringToSecureBuffer(value)

Convert string to buffer.

```typescript
function stringToSecureBuffer(value: string): Buffer
```

### secureBufferToString(buffer)

Read buffer as string and zero it.

```typescript
function secureBufferToString(buffer: Buffer): string
```

## Type Exports

All types are exported from the main module:

```typescript
import type {
  SecretRedactor,
  PatternRegistry,
  PatternDefinition,
  DetectionResult,
  RedactorConfig,
  SecureString,
  SafeErrorOptions,
} from '@theunwalked/offrecord';
```

