# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-01-13

### Added
- Initial release
- `SecretRedactor` with extensible pattern registration
- Default patterns for common secrets:
  - Generic API keys and secrets
  - Passwords in configuration
  - Bearer tokens
  - AWS credentials (Access Key ID, Secret Access Key)
  - GitHub tokens (ghp_, gho_, ghu_, ghs_, ghr_)
  - GitLab tokens (glpat-)
  - Slack tokens (xox-)
  - Private keys (RSA, EC)
  - JSON Web Tokens (JWT)
- `SecureString` for memory-safe secret handling
- Safe error creation with `createSafeError()`
- Function wrapping with `withSafeErrors()` and `withSafeErrorsAsync()`
- Secure buffer utilities:
  - `secureZero()` - Zero out buffer contents
  - `secureCompare()` - Timing-safe string comparison
  - `secureCompareBuffers()` - Timing-safe buffer comparison
  - `createSecureBuffer()` - Create buffer with cleanup hint
  - `stringToSecureBuffer()` / `secureBufferToString()` - Secure string/buffer conversion
- Comprehensive test suite with 90%+ coverage
- Full TypeScript support with type definitions
- ESM and CommonJS builds

