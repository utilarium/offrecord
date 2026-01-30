# offrecord

> Keep secrets off the record - secure secret handling, redaction, and memory safety utilities.

[![npm version](https://badge.fury.io/js/%40utilarium%2Foffrecord.svg)](https://www.npmjs.com/package/@utilarium/offrecord)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Features

- 🔒 **Extensible Redaction** - Register your own patterns, don't rely on hardcoded lists
- 🧵 **SecureString** - Memory-safe secret wrapper preventing accidental exposure
- ⚠️ **Safe Errors** - Sanitize errors before they leak to logs or users
- 🔐 **Secure Buffers** - Timing-safe comparison and memory zeroing utilities
- 🎯 **Zero Dependencies** - Maximum portability, minimal attack surface

## Installation

```bash
npm install @utilarium/offrecord
```

## Quick Start

### Redacting Secrets

```typescript
import { getRedactor } from '@utilarium/offrecord';

const redactor = getRedactor();

// Redact secrets from a string
const log = 'Connecting with api_key="sk-abc123xyz789" to server';
const safe = redactor.redact(log);
// Output: 'Connecting with [REDACTED] to server'

// Detect secrets without redacting
const result = redactor.detect(log);
// result.found === true
// result.matches contains detected secrets
```

### Registering Custom Patterns

```typescript
import { getRedactor } from '@utilarium/offrecord';

const redactor = getRedactor();

// Register a custom pattern (e.g., for your API provider)
redactor.register({
  name: 'my-api',
  patterns: [/myapi-[a-zA-Z0-9]{32}/g],
  validator: (key) => key.startsWith('myapi-'),
  envVar: 'MY_API_KEY',
  description: 'My API service keys',
});
```

### SecureString

```typescript
import { SecureString, secure, secureFromEnv } from '@utilarium/offrecord';

// Create a secure string
const apiKey = secure('sk-secret-key-12345');

// Safe to log - won't expose the secret
console.log(apiKey); // Output: [SecureString]
console.log(JSON.stringify({ key: apiKey })); // Output: {"key":"[SecureString]"}

// Explicitly reveal when needed
const value = apiKey.reveal();

// Use and dispose pattern
apiKey.use((secret) => {
  // Use the secret
  callApi(secret);
}); // Automatically disposed after use

// From environment variable
const envKey = secureFromEnv('API_KEY');
```

### Safe Errors

```typescript
import { createSafeError, withSafeErrors } from '@utilarium/offrecord';

// Sanitize an existing error
try {
  throw new Error('Failed to connect with key sk-secret123');
} catch (error) {
  const safeError = createSafeError(error);
  // safeError.message: 'Failed to connect with key [REDACTED]'
}

// Wrap a function to automatically sanitize errors
const safeFetch = withSafeErrors(async (url: string, apiKey: string) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Request failed with key ${apiKey}`);
  }
  return response.json();
});

// Errors thrown by safeFetch will have secrets redacted
```

## Built-in Patterns

offrecord includes patterns for common secrets:

- Generic API keys and secrets
- Passwords in configuration
- Bearer tokens
- AWS credentials (Access Key ID, Secret Access Key)
- GitHub tokens (ghp_, gho_, ghu_, ghs_, ghr_)
- GitLab tokens (glpat-)
- Slack tokens (xox-)
- Private keys (RSA, EC)
- JSON Web Tokens (JWT)

## API Reference

### Redactor

- `getRedactor()` - Get the global redactor instance
- `configureRedactor(config, registry?)` - Configure the global redactor
- `SecretRedactor` - Class for creating custom redactor instances

### Patterns

- `getPatternRegistry()` - Get the global pattern registry
- `PatternRegistry` - Class for managing patterns
- `DEFAULT_PATTERNS` - Built-in pattern definitions

### SecureString

- `SecureString` - Class for wrapping secrets
- `secure(value)` - Create a SecureString
- `secureFromEnv(envVar)` - Create from environment variable

### Safe Errors

- `createSafeError(error, redactor?, options?)` - Create a sanitized error
- `withSafeErrors(fn, redactor?, context?)` - Wrap sync function
- `withSafeErrorsAsync(fn, redactor?, context?)` - Wrap async function
- `sanitizeMessage(message, redactor?)` - Sanitize a message
- `sanitizeStack(stack, redactor?)` - Sanitize a stack trace

### Secure Buffers

- `secureZero(buffer)` - Zero out buffer contents
- `secureCompare(a, b)` - Timing-safe string comparison
- `secureCompareBuffers(a, b)` - Timing-safe buffer comparison
- `createSecureBuffer(size)` - Create buffer with cleanup hint
- `stringToSecureBuffer(value)` - Convert string to buffer
- `secureBufferToString(buffer)` - Read string and zero buffer

## Provider Integration

offrecord is designed to work with provider-specific libraries. Each provider registers its own patterns:

```typescript
// In your provider library (e.g., execution-openai)
import { getRedactor } from '@utilarium/offrecord';

getRedactor().register({
  name: 'openai',
  patterns: [/sk-[a-zA-Z0-9]{20,}/g],
  validator: (key) => /^sk-(proj-)?[a-zA-Z0-9_-]{20,}$/.test(key),
  envVar: 'OPENAI_API_KEY',
});
```

## Security Considerations

### JavaScript Memory Limitations

SecureString provides best-effort memory protection, but JavaScript cannot guarantee secrets are cleared from memory due to:

- Non-deterministic garbage collection
- String immutability (copies may exist)
- V8 engine optimizations

For high-security applications, consider:
- Using native modules for secret handling
- Minimizing secret lifetime in memory
- Using environment variables with restricted access

### Pattern Limitations

Pattern-based detection cannot catch all secrets:
- Custom or unusual formats may not match
- Encoded or encrypted values won't be detected
- Context-dependent secrets (like UUIDs used as tokens) require custom patterns

## License

Apache-2.0

TEST
