# SecureString

SecureString provides a memory-safe wrapper for secrets that prevents accidental exposure in logs, serialization, and debugging.

## Why SecureString?

Plain strings containing secrets are dangerous:

```typescript
// DANGEROUS: Secret exposed in logs and serialization
const apiKey = 'sk-secret-key-12345';
console.log({ apiKey });          // { apiKey: 'sk-secret-key-12345' } 😱
console.log(JSON.stringify({ apiKey })); // {"apiKey":"sk-secret-key-12345"} 😱
```

SecureString protects against accidental exposure:

```typescript
import { secure } from '@utilarium/offrecord';

const apiKey = secure('sk-secret-key-12345');
console.log({ apiKey });          // { apiKey: [SecureString] } ✓
console.log(JSON.stringify({ apiKey })); // {"apiKey":"[SecureString]"} ✓
```

## Creating SecureStrings

### From a Value

```typescript
import { secure, SecureString } from '@utilarium/offrecord';

// Using factory function
const key1 = secure('my-secret');

// Using constructor
const key2 = new SecureString('my-secret');
```

### From Environment Variable

```typescript
import { secureFromEnv } from '@utilarium/offrecord';

// Returns SecureString | undefined
const apiKey = secureFromEnv('API_KEY');

if (apiKey) {
  // Use the key
}
```

## Accessing the Value

The secret value is intentionally hidden. Use `reveal()` when you need the actual value:

```typescript
const apiKey = secure('sk-secret-key');

// Get the value when needed
const value = apiKey.reveal();
callApi(value);
```

### Use and Dispose Pattern

For single-use scenarios, use the callback pattern:

```typescript
const apiKey = secure('sk-secret-key');

apiKey.use((secret) => {
  // Use the secret
  callApi(secret);
}); // Automatically disposed after callback
```

For async operations:

```typescript
await apiKey.useAsync(async (secret) => {
  await callApiAsync(secret);
});
```

## Disposal

SecureString supports explicit disposal to clear the value from memory:

```typescript
const apiKey = secure('sk-secret-key');

// Use the key...

// Explicitly dispose when done
apiKey.dispose();

// After disposal, reveal() returns undefined
apiKey.reveal(); // undefined
```

### Auto-Dispose with `use()`

The `use()` and `useAsync()` methods automatically dispose after the callback:

```typescript
const apiKey = secure('sk-secret-key');

apiKey.use((secret) => {
  // secret is available here
});

// After use(), the SecureString is disposed
apiKey.reveal(); // undefined
```

## Serialization Protection

SecureString protects against various serialization methods:

```typescript
const key = secure('secret');

// All of these are safe:
String(key);           // '[SecureString]'
key.toString();        // '[SecureString]'
JSON.stringify(key);   // '"[SecureString]"'
`${key}`;             // '[SecureString]'
key.valueOf();        // '[SecureString]'
```

## Security Considerations

### JavaScript Memory Limitations

SecureString provides **best-effort** memory protection, but JavaScript cannot guarantee secrets are cleared from memory due to:

- **Non-deterministic garbage collection** - Memory may not be cleared immediately
- **String immutability** - JavaScript strings cannot be mutated, copies may exist
- **V8 engine optimizations** - The engine may retain values for performance

### Recommendations

For high-security applications:

1. **Minimize secret lifetime** - Dispose secrets as soon as possible
2. **Use native modules** - Consider native addons for truly secure memory handling
3. **Environment variables** - Load from environment with restricted access
4. **Avoid logging** - Never log objects that might contain secrets

```typescript
// Good: Minimal lifetime
const apiKey = secureFromEnv('API_KEY');
if (apiKey) {
  apiKey.use((secret) => {
    // Single use, immediate disposal
    makeApiCall(secret);
  });
}

// Avoid: Long-lived secret objects
class ApiClient {
  // Secret lives as long as the instance
  private key = secure(process.env.API_KEY!);
}
```

## Type Safety

SecureString is fully typed:

```typescript
import { SecureString, secure, secureFromEnv } from '@utilarium/offrecord';

// Type: SecureString
const key = secure('value');

// Type: SecureString | undefined
const envKey = secureFromEnv('VAR');

// Type narrowing required
if (envKey) {
  envKey.reveal(); // OK
}
```

