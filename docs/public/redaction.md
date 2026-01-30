# Redacting Secrets

The redaction system in offrecord provides pattern-based detection and removal of secrets from strings. Unlike hardcoded lists, you can register your own patterns for application-specific secrets.

## Basic Usage

```typescript
import { getRedactor } from '@utilarium/offrecord';

const redactor = getRedactor();

// Simple redaction
const safe = redactor.redact('api_key="sk-abc123xyz789"');
// Result: 'api_key="[REDACTED]"'
```

## Registering Custom Patterns

Register patterns specific to your application:

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

### Pattern Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Unique identifier for the pattern |
| `patterns` | RegExp[] | Array of regex patterns to match |
| `validator` | (value: string) => boolean | Optional validation function |
| `envVar` | string | Associated environment variable |
| `description` | string | Human-readable description |

## Detection vs Redaction

Sometimes you want to detect secrets without modifying the string:

```typescript
const result = redactor.detect('Connect with api_key=sk-secret123');

if (result.found) {
  console.log('Found secrets:', result.matches.length);
  // Handle the security concern
}
```

### Detection Result

```typescript
interface DetectionResult {
  found: boolean;
  matches: Array<{
    pattern: string;      // Pattern name that matched
    value: string;        // The matched secret
    start: number;        // Start index in string
    end: number;          // End index in string
  }>;
}
```

## Global vs Instance

You can use the global singleton or create isolated instances:

```typescript
// Global singleton
import { getRedactor, configureRedactor } from '@utilarium/offrecord';

configureRedactor({ /* config */ });
const global = getRedactor();

// Isolated instance
import { SecretRedactor } from '@utilarium/offrecord';

const local = new SecretRedactor({ /* config */ });
```

## Provider Integration

offrecord is designed to work with provider-specific libraries. Each provider can register its own patterns:

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

## Built-in Patterns

The following patterns are included by default:

| Pattern | Description | Example |
|---------|-------------|---------|
| Generic API keys | Common API key formats | `api_key="..."` |
| Bearer tokens | Authorization headers | `Bearer eyJ...` |
| AWS Access Key | AWS credentials | `AKIA...` |
| GitHub tokens | Personal access tokens | `ghp_...` |
| GitLab tokens | Personal access tokens | `glpat-...` |
| Slack tokens | Bot and user tokens | `xoxb-...` |
| Private keys | PEM format keys | `-----BEGIN PRIVATE KEY-----` |
| JWT tokens | JSON Web Tokens | `eyJhbGci...` |

## Pattern Limitations

Pattern-based detection cannot catch all secrets:

- Custom or unusual formats may not match
- Encoded or encrypted values won't be detected
- Context-dependent secrets (like UUIDs used as tokens) require custom patterns

Always combine pattern detection with other security measures.

