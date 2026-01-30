# Secure Buffers

Secure buffer utilities provide timing-safe comparisons and memory zeroing for handling sensitive data at the byte level.

## Why Secure Buffers?

Standard string comparison is vulnerable to timing attacks:

```typescript
// VULNERABLE: Timing attack possible
if (userToken === secretToken) {
  // Early exit reveals information about the secret
}
```

Secure comparison prevents timing attacks by always comparing all bytes:

```typescript
import { secureCompare } from '@utilarium/offrecord';

// SECURE: Constant-time comparison
if (secureCompare(userToken, secretToken)) {
  // Safe comparison
}
```

## Timing-Safe Comparison

### String Comparison

```typescript
import { secureCompare } from '@utilarium/offrecord';

const isValid = secureCompare(userInput, expectedValue);
```

### Buffer Comparison

```typescript
import { secureCompareBuffers } from '@utilarium/offrecord';

const buffer1 = Buffer.from('secret');
const buffer2 = Buffer.from('secret');

const isEqual = secureCompareBuffers(buffer1, buffer2);
```

## Memory Zeroing

Clear sensitive data from buffers when done:

```typescript
import { secureZero } from '@utilarium/offrecord';

const secretBuffer = Buffer.from('sensitive-data');

// Use the secret...

// Zero out the memory
secureZero(secretBuffer);
// Buffer now contains all zeros
```

## Secure Buffer Creation

Create buffers with automatic cleanup hints:

```typescript
import { createSecureBuffer } from '@utilarium/offrecord';

const buffer = createSecureBuffer(32);
// Use buffer...
// Remember to zero when done
secureZero(buffer);
```

## String to Buffer Conversion

Convert strings to buffers for secure handling:

```typescript
import { stringToSecureBuffer, secureBufferToString } from '@utilarium/offrecord';

// Convert string to buffer
const buffer = stringToSecureBuffer('my-secret');

// Use the buffer...

// Read and zero in one operation
const value = secureBufferToString(buffer);
// Buffer is now zeroed
```

## API Reference

### secureZero(buffer)

Fills a buffer with zeros.

```typescript
function secureZero(buffer: Buffer): void
```

**Parameters:**
- `buffer` - The buffer to zero out

**Example:**
```typescript
const buf = Buffer.from('secret');
secureZero(buf);
// buf is now <Buffer 00 00 00 00 00 00>
```

### secureCompare(a, b)

Timing-safe string comparison.

```typescript
function secureCompare(a: string, b: string): boolean
```

**Parameters:**
- `a` - First string
- `b` - Second string

**Returns:** `true` if strings are equal

**Example:**
```typescript
secureCompare('abc', 'abc'); // true
secureCompare('abc', 'xyz'); // false
```

### secureCompareBuffers(a, b)

Timing-safe buffer comparison.

```typescript
function secureCompareBuffers(a: Buffer, b: Buffer): boolean
```

**Parameters:**
- `a` - First buffer
- `b` - Second buffer

**Returns:** `true` if buffers are equal

### createSecureBuffer(size)

Creates a new buffer initialized to zeros.

```typescript
function createSecureBuffer(size: number): Buffer
```

**Parameters:**
- `size` - Buffer size in bytes

**Returns:** A new zeroed buffer

### stringToSecureBuffer(value)

Converts a string to a buffer.

```typescript
function stringToSecureBuffer(value: string): Buffer
```

**Parameters:**
- `value` - String to convert

**Returns:** Buffer containing the string data

### secureBufferToString(buffer)

Reads a buffer as string and zeros the buffer.

```typescript
function secureBufferToString(buffer: Buffer): string
```

**Parameters:**
- `buffer` - Buffer to read (will be zeroed)

**Returns:** String content of the buffer

## Security Considerations

### Limitations

Buffer zeroing in JavaScript has limitations:

1. **No guarantee of immediate clearing** - Garbage collection is non-deterministic
2. **Copies may exist** - V8 optimizations may retain copies
3. **Not cryptographically secure** - For cryptographic operations, use Node.js `crypto` module

### When to Use

Secure buffers are appropriate for:

- Token validation
- Password comparison
- API key verification
- Any comparison where timing attacks are a concern

### When to Use Native Crypto

For cryptographic operations, prefer Node.js crypto:

```typescript
import { timingSafeEqual } from 'crypto';

// For cryptographic use cases
const a = Buffer.from('secret');
const b = Buffer.from('secret');
const isEqual = timingSafeEqual(a, b);
```

offrecord's secure buffers are built on `crypto.timingSafeEqual` but provide a more convenient API for common use cases.

## Usage Patterns

### Token Validation

```typescript
import { secureCompare } from '@utilarium/offrecord';

function validateToken(provided: string, expected: string): boolean {
  // Constant-time comparison prevents timing attacks
  return secureCompare(provided, expected);
}
```

### Temporary Secret Storage

```typescript
import { stringToSecureBuffer, secureBufferToString } from '@utilarium/offrecord';

function processSecret(secret: string): void {
  const buffer = stringToSecureBuffer(secret);
  
  try {
    // Work with buffer...
  } finally {
    // Read and zero
    const _ = secureBufferToString(buffer);
  }
}
```

