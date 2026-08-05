# @theseus-cwl/parser

## 0.1.0

### Minor Changes

- ead38f2: Hardened parsing and ESM-only packaging.

  - **Breaking:** the package is now published as ESM-only; CommonJS `require()` is no longer supported.
  - Array-form CWL fields are accepted, and outputs and step `in` entries are normalized.
  - Malformed inputs, outputs, step `in` entries, parameters, and step `run` values are now rejected with clear parse errors instead of leaking into the parsed model.
  - The package no longer depends on `@theseus-cwl/configurations`; it depends on `@theseus-cwl/types` instead.

### Patch Changes

- Updated dependencies [ead38f2]
  - @theseus-cwl/types@2.0.0

## 0.0.2

### Patch Changes

- Fix lint issues and add control to CI pipeline
- Updated dependencies
  - @theseus-cwl/configurations@1.1.2

## 0.0.1

### Patch Changes

- reinitialize changelogs
- Updated dependencies
  - @theseus-cwl/configurations@1.1.1
