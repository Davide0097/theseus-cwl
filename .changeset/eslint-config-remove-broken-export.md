---
"@theseus-cwl/eslint-config": patch
---

Remove the broken `next-js` export (its target never resolved, so it was unusable) and dedupe the `react-internal` config.
