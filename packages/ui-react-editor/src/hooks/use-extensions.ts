import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { yaml } from "@codemirror/lang-yaml";
import {
  basicSetup,
  EditorView,
  Extension,
  hoverTooltip,
} from "@uiw/react-codemirror";
import { useMemo } from "react";

import {
  CWL_FILE_KEYWORDS,
  CWL_FILE_KEYWORDS_DOCUMENTATION,
} from "@theseus-cwl/configurations";

const cwlDocumentAutocompletion = (): Extension => {
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

const cwlDocumentHover = (): Extension => {
  return hoverTooltip((view, pos) => {
    const range = view.state.wordAt(pos);

    if (!range) {
      return null;
    }

    const word = view.state.sliceDoc(range.from, range.to);
    const key: keyof typeof CWL_FILE_KEYWORDS_DOCUMENTATION | string = word;
    const info = CWL_FILE_KEYWORDS_DOCUMENTATION[key];

    if (!info) {
      return null;
    }

    return {
      pos: range.from,
      end: range.to,
      create: () => {
        const dom = document.createElement("div");
        dom.className = "cwl-code-editor-tooltip";

        const summary = document.createElement("div");
        summary.textContent = info.documentation;
        summary.className = "cwl-code-editor-tooltip-title";
        dom.appendChild(summary);

        const officialDocumentation = document.createElement("div");
        officialDocumentation.textContent = info.document;
        officialDocumentation.className = "cwl-code-editor-tooltip-description";
        dom.appendChild(officialDocumentation);

        for (const reference of info.references) {
          const link = document.createElement("a");
          link.href = reference;
          link.textContent = reference;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "cwl-code-editor-tooltip-link";
          dom.appendChild(link);
        }

        return { dom };
      },
    };
  });
};

export type UseExtensionsProps = {
  /**
   * Enables CWL keyword autocompletion in the editor. Only applied when the
   * active file is a CWL document (not a parameter file).
   *
   * @default true
   */
  enableCwlAutoCompletion?: boolean;

  /**
   * Enables a hover tooltip, which shows up when the pointer hovers over CWL
   * keywords. Only applied when the active file is a CWL document (not a
   * parameter file).
   *
   * @default true
   */
  enableCwlHoverTooltip?: boolean;

  /**
   * Enables line wrapping in the editor.
   *
   * @default true
   */
  enableLineWrapping?: boolean;

  /**
   * Shows the line number gutter.
   *
   * @default true
   */
  enableLineNumbers?: boolean;

  /**
   * Shows the code folding gutter, which collapses nested YAML blocks.
   *
   * @default true
   */
  enableCodeFolding?: boolean;

  /**
   * Enables the search panel (Mod-F) and highlights other occurrences of the selection.
   *
   * @default true
   */
  enableSearch?: boolean;

  /**
   * Highlights matching brackets and auto-closes brackets/quotes while typing.
   *
   * @default true
   */
  enableBracketMatching?: boolean;

  /**
   * Highlights the line the cursor is on (content and gutter).
   *
   * @default true
   */
  enableHighlightActiveLine?: boolean;

  /**
   * Number of spaces per indentation level.
   *
   * @default 2
   */
  tabSize?: number;

  /**
   * Font size in pixels of the editor content and gutters. When omitted the
   * editor inherits the surrounding font size.
   */
  fontSize?: number;
};

export const useExtensions = (props: UseExtensionsProps) => {
  const {
    enableCwlAutoCompletion = true,
    enableCwlHoverTooltip = true,
    enableLineWrapping = true,
    enableLineNumbers = true,
    enableCodeFolding = true,
    enableSearch = true,
    enableBracketMatching = true,
    enableHighlightActiveLine = true,
    tabSize = 2,
    fontSize,
  } = props;

  return useMemo(() => {
    const extensions: Extension[] = [
      basicSetup({
        lineNumbers: enableLineNumbers,
        foldGutter: enableCodeFolding,
        foldKeymap: enableCodeFolding,
        searchKeymap: enableSearch,
        highlightSelectionMatches: enableSearch,
        bracketMatching: enableBracketMatching,
        closeBrackets: enableBracketMatching,
        closeBracketsKeymap: enableBracketMatching,
        highlightActiveLine: enableHighlightActiveLine,
        highlightActiveLineGutter: enableHighlightActiveLine,
        autocompletion: false,
        completionKeymap: enableCwlAutoCompletion,
        tabSize: tabSize,
      }),
      yaml(),
    ];

    if (enableCwlAutoCompletion) {
      extensions.push(cwlDocumentAutocompletion());
    }

    if (enableCwlHoverTooltip) {
      extensions.push(cwlDocumentHover());
    }

    if (enableLineWrapping) {
      extensions.push(EditorView.lineWrapping);
    }

    if (fontSize !== undefined) {
      extensions.push(
        EditorView.theme({
          "&": { fontSize: `${fontSize}px` },
        }),
      );
    }

    return { extensions: extensions };
  }, [
    enableCwlAutoCompletion,
    enableCwlHoverTooltip,
    enableLineWrapping,
    enableLineNumbers,
    enableCodeFolding,
    enableSearch,
    enableBracketMatching,
    enableHighlightActiveLine,
    tabSize,
    fontSize,
  ]);
};
