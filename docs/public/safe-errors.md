# Safe Errors

Safe errors prevent secrets from leaking through error messages and stack traces. When an error occurs, sensitive information might be included in the message - offrecord helps sanitize these before logging or displaying.

## Basic Usage

### Sanitizing Errors

```typescript
import { createSafeError } from '@theunwalked/offrecord';

try {
  throw new Error('Failed to connect with key sk-secret123');
} catch (error) {
  const safeError = createSafeError(error);
  // safeError.message: 'Failed to connect with key [REDACTED]'
}
```

### Wrapping Functions

Wrap functions to automatically sanitize any errors they throw:

```typescript
import { withSafeErrors, withSafeErrorsAsync } from '@theunwalked/offrecord';

// Sync function
const safeProcess = withSafeErrors((data: string) => {
  // May throw error containing secrets
  processData(data);
});

// Async function
const safeFetch = withSafeErrorsAsync(async (url: string, apiKey: string) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Request failed with key ${apiKey}`);
  }
  return response.json();
});

// Errors thrown are automatically sanitized
try {
  await safeFetch('https://api.example.com', 'sk-secret');
} catch (error) {
  // Error message has secrets redacted
  console.error(error.message);
}
```

## Message Sanitization

Sanitize individual messages:

```typescript
import { sanitizeMessage } from '@theunwalked/offrecord';

const original = 'Connection failed: postgres://user:password@host/db';
const safe = sanitizeMessage(original);
// Result: 'Connection failed: [REDACTED]'
```

## Stack Trace Sanitization

Stack traces can contain sensitive paths and information:

```typescript
import { sanitizeStack } from '@theunwalked/offrecord';

try {
  throw new Error('Error with api_key=secret123');
} catch (error) {
  if (error instanceof Error && error.stack) {
    const safeStack = sanitizeStack(error.stack);
    // Stack trace with secrets redacted
  }
}
```

## Configuration Options

Customize safe error behavior:

```typescript
import { createSafeError } from '@theunwalked/offrecord';
import { getRedactor } from '@theunwalked/offrecord';

// Custom redactor
const customRedactor = getRedactor();
customRedactor.register({
  name: 'custom',
  patterns: [/CUSTOM-[A-Z0-9]+/g],
});

const safeError = createSafeError(error, customRedactor, {
  includeStack: false,    // Omit stack trace entirely
  maxLength: 500,         // Truncate long messages
});
```

## Error Context

Add context to safe errors for debugging:

```typescript
import { withSafeErrors } from '@theunwalked/offrecord';

const safeDbQuery = withSafeErrors(
  (sql: string) => db.query(sql),
  undefined, // Use default redactor
  { operation: 'database-query', component: 'user-service' }
);
```

## Patterns in Error Messages

The same patterns used in redaction apply to error sanitization:

- API keys and tokens
- Passwords and connection strings
- JWT tokens
- Private keys
- AWS credentials
- Provider-specific patterns

## Best Practices

### 1. Wrap at Boundaries

Apply safe error handling at system boundaries:

```typescript
// API endpoint
app.post('/api/action', async (req, res) => {
  try {
    await performAction(req.body);
    res.json({ success: true });
  } catch (error) {
    const safe = createSafeError(error);
    logger.error('Action failed', { error: safe.message });
    res.status(500).json({ error: 'An error occurred' });
  }
});
```

### 2. Log Internal, Display External

Keep full details for internal logging:

```typescript
try {
  await riskyOperation();
} catch (error) {
  const safeError = createSafeError(error);
  
  // Internal logging with full context
  logger.error('Operation failed', {
    originalMessage: error.message,
    safeMessage: safeError.message,
    stack: error.stack,
  });
  
  // External display with sanitized message
  displayError(safeError.message);
}
```

### 3. Combine with SecureString

Use SecureString to prevent secrets from appearing in errors:

```typescript
import { secure, withSafeErrors } from '@theunwalked/offrecord';

const apiKey = secure(process.env.API_KEY!);

// Even if this throws, the secret won't be in the message
const safeCall = withSafeErrors((key: SecureString) => {
  // SecureString.toString() returns '[SecureString]'
  throw new Error(`Failed with key: ${key}`);
  // Error message: 'Failed with key: [SecureString]'
});
```

## Error Types

createSafeError works with any error type:

```typescript
// Standard Error
createSafeError(new Error('message'));

// Custom errors
class ApiError extends Error {
  constructor(message: string, public code: number) {
    super(message);
  }
}
createSafeError(new ApiError('Failed', 500));

// Unknown thrown values
createSafeError('string error');
createSafeError({ message: 'object error' });
```

