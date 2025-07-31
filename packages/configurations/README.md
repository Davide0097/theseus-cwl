# @theseus-cwl/configurations

A collection of **internal static configurations** shared across the `@theseus-cwl` ecosystem.  
These configurations store **constant values** that are used internally by various `@theseus-cwl` packages but can also be **consumed externally** if needed.

## Installation

```bash
npm install @theseus-cwl/configurations
# or
pnpm add @theseus-cwl/configurations
# or
yarn add @theseus-cwl/configurations
```

## Usage

Import constants or configurations directly:

```ts
import { EDITOR_PADDING } from '@theseus-cwl/configurations';

console.log(EDITOR_PADDING);
```

## When to Use

When you need access to default values or internal constants used across @theseus-cwl packages.
