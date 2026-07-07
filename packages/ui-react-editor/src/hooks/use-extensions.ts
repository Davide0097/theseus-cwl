import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { yaml } from "@codemirror/lang-yaml";
import { EditorView, hoverTooltip, lineNumbers } from "@uiw/react-codemirror";
import { useMemo } from "react";

import {
  CWL_FILE_KEYWORDS,
  CWL_FILE_KEYWORDS_DOCUMENTATION,
} from "@theseus-cwl/configurations";

const cwlCompletion = () => {
  return autocompletion({
    override: [
      (ctx: CompletionContext) => {
        const word = ctx.matchBefore(/\w*/);
        if (!word) {
          return null;
        }

        return {
          from: word.from,
          options: CWL_FILE_KEYWORDS.filter((keyword) =>
            keyword.startsWith(word.text),
          ).map((keyword) => ({ label: keyword, type: "keyword" })),
        };
      },
    ],
  });
};

const cwlHover = () => {
  return hoverTooltip((view, pos) => {
    const word = view.state.doc
      .sliceString(pos - 20, pos + 20)
      .match(/\b\w+\b/);

    if (!word) {
      return null;
    }

    const key = word[0] as keyof typeof CWL_FILE_KEYWORDS_DOCUMENTATION;
    const info = CWL_FILE_KEYWORDS_DOCUMENTATION[key];

    if (!info) {
      return null;
    }

    return {
      pos: pos,
      end: pos,
      create: () => {
        const dom = document.createElement("div");
        dom.textContent = info;
        dom.style.padding = "4px";
        dom.style.backgroundColor = "#222";
        dom.style.color = "white";
        dom.style.borderRadius = "4px";
        return { dom };
      },
    };
  });
};

export const useExtensions = (wrap: boolean) => {
  const extensions = useMemo(() => {
    return [
      yaml(),
      lineNumbers(),
      cwlCompletion(),
      cwlHover(),
      wrap ? EditorView.lineWrapping : [],
    ];
  }, [wrap]);

  return { extensions };
};
