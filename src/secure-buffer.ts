/**
 * Secure buffer utilities for low-level secret handling
 * 
 * Note: These utilities provide defense-in-depth but cannot guarantee
 * secrets are cleared from memory due to JavaScript's runtime behavior.
 */

import { timingSafeEqual } from 'node:crypto';

/**
 * Zero out a buffer's contents
 * 
 * @param buffer - The buffer to zero
 */
export function secureZero(buffer: Buffer): void {
    buffer.fill(0);
}

/**
 * Timing-safe comparison of two strings
 * 
 * Prevents timing attacks by ensuring comparison takes constant time
 * regardless of where strings differ.
 * 
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
    // Convert to buffers for timing-safe comparison
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
  
    // If lengths differ, we still need constant-time comparison
    // to avoid leaking length information
    if (bufA.length !== bufB.length) {
        // Compare against self to maintain constant time
        timingSafeEqual(bufA, bufA);
        return false;
    }
  
    return timingSafeEqual(bufA, bufB);
}

/**
 * Timing-safe comparison of two buffers
 * 
 * @param a - First buffer
 * @param b - Second buffer
 * @returns true if buffers are equal
 */
export function secureCompareBuffers(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) {
        timingSafeEqual(a, a);
        return false;
    }
    return timingSafeEqual(a, b);
}

/**
 * Create a buffer that will be zeroed when no longer referenced
 * 
 * Note: This is best-effort. JavaScript's GC doesn't guarantee
 * when or if finalizers run.
 * 
 * @param size - Size of the buffer
 * @returns A buffer with a weak reference for cleanup
 */
export function createSecureBuffer(size: number): Buffer {
    const buffer = Buffer.alloc(size);
  
    // Use FinalizationRegistry if available (Node.js 14.6+)
    // Note: We create a separate reference to the buffer's data for the held value
    // because target and holdings cannot be the same object
    if (typeof FinalizationRegistry !== 'undefined') {
        // Store the buffer reference in an object that can be used in the finalizer
        const bufferRef = { buf: buffer };
        const registry = new FinalizationRegistry((heldValue: { buf: Buffer }) => {
            heldValue.buf.fill(0);
        });
        registry.register(buffer, bufferRef);
    }
  
    return buffer;
}

/**
 * Securely copy a string to a buffer
 * 
 * @param value - The string to copy
 * @returns A buffer containing the string
 */
export function stringToSecureBuffer(value: string): Buffer {
    const buffer = Buffer.alloc(Buffer.byteLength(value, 'utf8'));
    buffer.write(value, 'utf8');
    return buffer;
}

/**
 * Read a string from a buffer and zero the buffer
 * 
 * @param buffer - The buffer to read from
 * @returns The string value
 */
export function secureBufferToString(buffer: Buffer): string {
    const value = buffer.toString('utf8');
    buffer.fill(0);
    return value;
}

