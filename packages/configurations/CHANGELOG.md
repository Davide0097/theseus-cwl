# @theseus-cwl/configurations

## 2.0.1

### Patch Changes

- 0b041a4: Add a NODE_BACKGROUND_OPACITY configuration value controlling the node card background opacity

## 2.0.0

### Major Changes

- ead38f2: Runtime-overridable configuration, published as ESM-only.

  - **Breaking:** the package is now published as ESM-only; CommonJS `require()` is no longer supported.
  - New `configureTheseusCwl(...)` runtime overrides: node sizes, colors, timings, and other constants are live bindings that can be reconfigured at startup.
  - CWL keyword documentation is now structured with spec text and reference links.

## 1.1.2

### Patch Changes

- Fix lint issues and add control to CI pipeline

## 1.1.1

### Patch Changes

- reinitialize changelogs
