import { CwlSource } from "@theseus-cwl/types";

import { validateCwl } from "../validate.js";

export const validateCwlService = async (cwl: CwlSource) => {
  const result = await validateCwl(cwl);

  return result;
};
