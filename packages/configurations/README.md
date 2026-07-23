# @theseus-cwl/configurations

A collection of **internal static configurations** shared across the `@theseus-cwl` ecosystem.  
These configurations store **default values** that are used internally by various `@theseus-cwl` packages but can also be **consumed and overridden externally** if needed.

## Installation

```bash
npm install @theseus-cwl/configurations
# or
pnpm add @theseus-cwl/configurations
# or
yarn add @theseus-cwl/configurations
```

## Usage

### Reading values

Import constants directly:

```ts
import { VIEWER_PADDING } from "@theseus-cwl/configurations";

console.log(VIEWER_PADDING);
```

These are **live bindings**: if you override a value at runtime (see below), any
consumer that reads it at call time observes the new value.

### Overriding values at runtime

Use `configureTheseusCwl` to override one or more values. Only the keys you pass
are changed; everything else keeps its current value. Call it once at app
startup, before the viewer/editor mounts..

```ts
import { configureTheseusCwl } from "@theseus-cwl/configurations";

configureTheseusCwl({
  NODE_WIDTH: 140,
  INPUT_NODE_COLOR: "#aabbcc",
  ANIMATION_TIME: 300,
});
```

> **Note:** if you override `NODE_HEIGHT` without also passing `NODE_WIDTH`, the
> width is recomputed from the new height using the golden ratio (matching the
> default behaviour). Pass `NODE_WIDTH` explicitly to opt out.

### Resetting the configuration

```ts
import { resetTheseusCwlConfiguration } from "@theseus-cwl/configurations";

// Restore every value to its built-in default.
resetTheseusCwlConfiguration();
```

## When to Use

When you need access to default values or internal constants used across
`@theseus-cwl` packages, or when you want to customize them globally at runtime.

## 📘 Learn More about CWL

- [Common Workflow Language (CWL)](https://www.commonwl.org/)

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features.

## 📄 License

MIT License © 2026 [Davide Giorgiutti]
