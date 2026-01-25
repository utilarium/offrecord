# Getting Started

> Keep secrets off the record - secure secret handling, redaction, and memory safety utilities.

## Features

- 🔒 **Extensible Redaction** - Register your own patterns, don't rely on hardcoded lists
- 🧵 **SecureString** - Memory-safe secret wrapper preventing accidental exposure
- ⚠️ **Safe Errors** - Sanitize errors before they leak to logs or users
- 🔐 **Secure Buffers** - Timing-safe comparison and memory zeroing utilities
- 🎯 **Zero Dependencies** - Maximum portability, minimal attack surface

## Installation

```bash
npm install @theunwalked/offrecord
```

Or with your preferred package manager:

```bash
yarn add @theunwalked/offrecord
pnpm add @theunwalked/offrecord
```

## Quick Start

### Redacting Secrets

```typescript
import { getRedactor } from '@theunwalked/offrecord';

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

### Using SecureString

```typescript
import { secure } from '@theunwalked/offrecord';

// Create a secure string
const apiKey = secure('sk-secret-key-12345');

// Safe to log - won't expose the secret
console.log(apiKey);          // Output: [SecureString]
console.log(JSON.stringify({ key: apiKey })); // Output: {"key":"[SecureString]"}

// Explicitly reveal when needed
const value = apiKey.reveal();
```

### Safe Error Handling

```typescript
import { createSafeError } from '@theunwalked/offrecord';

try {
  throw new Error('Failed to connect with key sk-secret123');
} catch (error) {
  const safeError = createSafeError(error);
  // safeError.message: 'Failed to connect with key [REDACTED]'
}
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

## Next Steps

- Learn about [Redacting Secrets](./redaction.md) in detail
- Explore [SecureString](./secure-string.md) for memory-safe secrets
- Set up [Safe Errors](./safe-errors.md) in your application
- Check the [API Reference](./api-reference.md) for complete documentation

