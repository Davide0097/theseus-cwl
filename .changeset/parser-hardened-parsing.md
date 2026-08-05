---
"@theseus-cwl/parser": minor
---

Hardened parsing and ESM-only packaging.

- **Breaking:** the package is now published as ESM-only; CommonJS `require()` is no longer supported.
- Array-form CWL fields are accepted, and outputs and step `in` entries are normalized.
- Malformed inputs, outputs, step `in` entries, parameters, and step `run` values are now rejected with clear parse errors instead of leaking into the parsed model.
- The package no longer depends on `@theseus-cwl/configurations`; it depends on `@theseus-cwl/types` instead.
