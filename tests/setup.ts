import { vi } from 'vitest';

// Mock console methods to prevent output during tests
global.console = {
    ...console,
    // Keep error logging for debugging
    error: vi.fn(),
    // Suppress other console output
    log: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
};

