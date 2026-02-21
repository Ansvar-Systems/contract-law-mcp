# Golden Test Fixtures

This directory contains contract test definitions for the contract-law-mcp server.

## File: golden-tests.json

A JSON array of test definitions. Each test specifies:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique test identifier (e.g., `clause-001`) |
| `category` | string | Test category grouping |
| `description` | string | Human-readable description |
| `tool` | string | MCP tool name to invoke |
| `input` | object | Arguments passed to the tool |
| `assertions` | string[] | List of assertion checks |

## Assertion Types

| Assertion | Description |
|-----------|-------------|
| `result_not_empty` | Result is not null/undefined/empty |
| `fields_present:field1,field2` | Dot-path fields exist on the result object |
| `min_results:N` | Array result has at least N entries |
| `any_result_contains:text` | JSON-stringified result contains the text (case-insensitive) |
| `field_equals:path,value` | Specific dot-path field equals a literal value (`null`, `[]`, `true`, `false`, number, or string) |

## Running

```bash
npm run test:contract
```

## Adding Tests

1. Add a new entry to `golden-tests.json`
2. Use an existing tool name from the registry
3. Include at least one assertion
4. Run `npm run test:contract` to verify
