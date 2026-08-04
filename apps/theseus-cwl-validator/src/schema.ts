import { z } from "zod";

/**
 * A file name must be a non-empty, relative path that cannot escape the temp
 * directory: no absolute paths (POSIX `/…`, Windows `\…` or `C:\…`) and no
 * `..` traversal segments. This is the first line of defence; `safeJoin` in
 * `validate.ts` re-checks containment at write time.
 */
const safeName = z
  .string()
  .min(1, "name must be a non-empty string")
  .refine((n) => !/^([A-Za-z]:)?[\\/]/.test(n), {
    message: "name must be a relative path",
  })
  .refine((n) => !n.split(/[\\/]/).includes(".."), {
    message: "name must not contain '..' path segments",
  });

const documentSchema = z.object({
  name: safeName,
  // Content is written verbatim (string) or YAML-serialized (object); cwltool
  // does the real structural validation, so we leave it opaque here.
  content: z.unknown(),
});

const parameterSchema = z.object({
  name: safeName,
  content: z.unknown(),
});

export const cwlSourceSchema = z.object({
  entrypoint: safeName,
  documents: z
    .array(documentSchema)
    .min(1, "at least one document is required"),
  parameters: z.array(parameterSchema).default([]),
});

export type CwlSourceInput = z.infer<typeof cwlSourceSchema>;
