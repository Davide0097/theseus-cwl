# @theseus-cwl/eslint-config

A collection of **internal ESLint configurations** used across the `@theseus-cwl` ecosystem.  
This package provides **ready-to-use ESLint setups** for different environments and can be extended or consumed directly in external projects.

## Installation

```bash
npm install -D @theseus-cwl/eslint-config
# or
pnpm add -D @theseus-cwl/eslint-config
# or
yarn add -D @theseus-cwl/eslint-config
```

## Usage

Import and extend one of the provided configurations:

```ts
import { config } from "@theseus-cwl/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default config;
```

You can also customize or extend the base configuration:

```ts
import { config as baseConfig } from "@theseus-cwl/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    "no-console": "warn",
  },
};
```

## When to Use

When you need a shared ESLint setup for multiple packages in the @theseus-cwl monorepo.
