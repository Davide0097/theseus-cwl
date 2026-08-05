# @theseus-cwl/types

## 2.0.0

### Major Changes

- ead38f2: CWL v1.2 alignment and stricter, ESM-only types.

  - **Breaking:** the package is now published as ESM-only (built with tsup); CommonJS `require()` is no longer supported.
  - **Breaking:** `CwlSource` content and `$graph` unions are tightened, and the remaining `any`/`{}` escape hatches are replaced with precise types — code that relied on the looser shapes may no longer compile.
  - Output, workflow, and tool types are aligned with the CWL v1.2 spec, and spec-valid documents that were previously rejected by the types are now accepted.
  - `Process` is now fully supported, including `arguments`, with improved id handling.

## 1.1.2

### Patch Changes

- Fix lint issues and add control to CI pipeline

## 1.1.1

### Patch Changes

- reinitialize changelogs
