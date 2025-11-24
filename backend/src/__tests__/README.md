# Testing Setup

This directory contains all test files for the Smart Onboarding V2 backend.

## Test Framework

- **Jest**: Main testing framework
- **ts-jest**: TypeScript support for Jest
- **fast-check**: Property-based testing library

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- Unit tests: `**/*.test.ts`
- Property-based tests: Tests tagged with `// Feature: smart-onboarding-v2, Property X:`

## Coverage Targets

- Services: 90%+
- Utilities: 95%+
- Controllers: 80%+

## Configuration

See `jest.config.js` for Jest configuration details.
