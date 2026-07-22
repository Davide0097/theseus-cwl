import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { yaml } from "@codemirror/lang-yaml";
import { syntaxHighlighting } from "@codemirror/language";
import { classHighlighter } from "@lezer/highlight";
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

/**
 * Package-owned editor theme reproducing `@codemirror/theme-one-dark`. Every
 * color is read from a `--cwl-code-editor-*` CSS variable, so consumers
 * re-theme the editor purely through CSS variables. `classHighlighter` tags
 * syntax tokens with stable `tok-*` classes.
 */
const cwlCodeEditorTheme: Extension = [
  EditorView.theme(
    {
      "&": {
        color: "var(--cwl-code-editor-text-color)",
        backgroundColor: "var(--cwl-code-editor-bg)",
      },
      ".cm-content": {
        caretColor: "var(--cwl-code-editor-caret-color)",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--cwl-code-editor-caret-color)",
      },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        {
          backgroundColor: "var(--cwl-code-editor-selection-bg)",
        },
      ".cm-panels": {
        backgroundColor: "var(--cwl-code-editor-panels-bg)",
        color: "var(--cwl-code-editor-panels-text-color)",
      },
      ".cm-panels.cm-panels-top": {
        borderBottom: "2px solid var(--cwl-code-editor-panels-border-color)",
      },
      ".cm-panels.cm-panels-bottom": {
        borderTop: "2px solid var(--cwl-code-editor-panels-border-color)",
      },
      ".cm-searchMatch": {
        backgroundColor: "var(--cwl-code-editor-search-match-bg)",
        outline: "1px solid var(--cwl-code-editor-search-match-outline-color)",
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "var(--cwl-code-editor-search-match-selected-bg)",
      },
      ".cm-activeLine": {
        backgroundColor: "var(--cwl-code-editor-active-line-bg)",
      },
      ".cm-selectionMatch": {
        backgroundColor: "var(--cwl-code-editor-selection-match-bg)",
      },
      "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: "var(--cwl-code-editor-matching-bracket-bg)",
      },
      ".cm-gutters": {
        backgroundColor: "var(--cwl-code-editor-gutter-bg)",
        color: "var(--cwl-code-editor-gutter-text-color)",
        border: "none",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "var(--cwl-code-editor-gutter-active-line-bg)",
      },
      ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: "var(--cwl-code-editor-fold-placeholder-text-color)",
      },
      ".cm-tooltip": {
        border: "none",
        backgroundColor: "var(--cwl-code-editor-autocomplete-bg)",
      },
      ".cm-tooltip .cm-tooltip-arrow:before": {
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
      },
      ".cm-tooltip .cm-tooltip-arrow:after": {
        borderTopColor: "var(--cwl-code-editor-autocomplete-bg)",
        borderBottomColor: "var(--cwl-code-editor-autocomplete-bg)",
      },
      ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
          backgroundColor: "var(--cwl-code-editor-autocomplete-selected-bg)",
          color: "var(--cwl-code-editor-autocomplete-selected-text-color)",
        },
      },
    },
    { dark: true },
  ),
  syntaxHighlighting(classHighlighter),
];

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
      cwlCodeEditorTheme,
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
