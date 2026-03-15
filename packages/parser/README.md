# @theseus-cwl/parser

The main parsing and normalization utility for working with documents inside the Theseus-CWL ecosystem.

[![UI](https://img.shields.io/npm/v/@theseus-cwl/parser.png?label=@theseus-cwl/parser&style=flat-square)](https://www.npmjs.com/package/@theseus-cwl/parser)

<div align="center">
  <img src="../../apps/landing-page/public/theseus-cwl.svg" alt="Theseus CWL logo" width="100" />
</div>

- 📝 Parse and normalize raw sources into a consistent internal shape

It is used internally by @theseus-cwl/ui-react-viewer and @theseus-cwl/ui-react-editor, but can also be used independently.

## 🚀 Installation

```bash
npm install @theseus-cwl/parser
# or
yarn add @theseus-cwl/parser
```

## 🛠 Example Usage

```tsx
import { CwlSource } from "@theseus-cwl/types";
import { CWLSourceHolder } from "@theseus-cwl/parser";

const source: CwlSource = {...};

const holder = await CWLSourceHolder.create(source);

console.log(holder.activeFile);
```

## 📣 Contributing

We welcome contributions! If you’d like to improve Theseus or suggest new features.

## 📄 License

MIT License © 2026 [Davide Giorgiutti]
