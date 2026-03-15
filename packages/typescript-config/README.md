# @theseus-cwl/typescript-config

A collection of **internal TypeScript configurations** used across the `@theseus-cwl` ecosystem.  
This package provides predefined TypeScript config setups for different environments and can be consumed internally or externally.

## Installation

```bash
npm install -D @theseus-cwl/typescript-config
# or
pnpm add -D @theseus-cwl/typescript-config
# or
yarn add -D @theseus-cwl/typescript-config
```

## Usage

Extend one of the provided configurations in your tsconfig.json:

```ts
// Base config
{
  "extends": "@theseus-cwl/typescript-config/base"
}

// React config
{
  "extends": "@theseus-cwl/typescript-config/react-library.json"
}

// Merge it with your settings
{
  "extends": "@theseus-cwl/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```
