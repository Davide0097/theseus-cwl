import { Button, Menu, Modal, Space, Tag } from "antd";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { useMemo } from "react";

import { observer } from "mobx-react";
import { CWLIde, RunStatus, ValidationStatus } from "../store";

export type CwlIdeMenuProps = {
  ide: CWLIde;
};

export const CwlIdeTopMenu = observer((props: CwlIdeMenuProps) => {
  const viewer = props.ide.viewer;
  const editor = props.ide.codeEditor;

  const viewerOptions = viewer?.options;
  const editorOptions = editor?.options;

  const selectedMenuKeys = useMemo(() => {
    const keys: string[] = [];

    if (editorOptions?.enableLineWrapping) {
      keys.push("enableLineWrapping");
    }
    if (editorOptions?.readOnly) {
      keys.push("codeReadOnly");
    }
    if (editorOptions?.enableCwlAutoCompletion) {
      keys.push("codeAutocomplete");
    }
    if (editorOptions?.enableCwlHoverTooltip) {
      keys.push("codeHoverTooltip");
    }
    if (editorOptions?.enableLineNumbers) {
      keys.push("codeLineNumbers");
    }
    if (editorOptions?.enableCodeFolding) {
      keys.push("codeFolding");
    }
    if (editorOptions?.enableSearch) {
      keys.push("codeSearch");
    }
    if (editorOptions?.enableBracketMatching) {
      keys.push("codeBracketMatching");
    }
    if (editorOptions?.enableHighlightActiveLine) {
      keys.push("codeHighlightActiveLine");
    }
    if (editorOptions?.tabSize !== undefined) {
      keys.push(`codeTabSize${editorOptions.tabSize}`);
    }
    if (viewerOptions?.minimap) {
      keys.push("showMinimap");
    }
    if (viewerOptions?.wrappers) {
      keys.push("showWrappers");
    }
    if (viewerOptions?.colorEditor) {
      keys.push("showColorEditor");
    }
    if (viewerOptions?.labels) {
      keys.push("showLabels");
    }
    if (viewerOptions?.background?.color !== "transparent") {
      keys.push("showBackground");
    }

    return keys;
  }, [viewerOptions, editorOptions]);

  const items: ItemType<MenuItemType>[] = useMemo(() => {
    const workflowItems: ItemType<MenuItemType>[] = [
      {
        key: "newWorkflow",
        label: "New Workflow",
        extra: "Ctrl+N",
        onClick: () => {
          Modal.confirm({
            centered: true,
            title: "Do you want to create a new workflow?",
            content: "Any unsaved changes will be lost.",
            okText: "Create",
            cancelText: "Cancel",
            onOk: () => {
              // viewer?.store.newWorkflow();
            },
          });
        },
      },
      {
        type: "divider",
      },
      {
        key: "openWorkflow",
        label: "Open Workflow",
        extra: "Ctrl+O",
        onClick: () => {
          Modal.confirm({
            centered: true,
            title: "Do you want to open an existent workflow?",
            content: "Any unsaved changes will be lost.",
            okText: "Open",
            cancelText: "Cancel",
            onOk: () => {
              // viewer?.store.newWorkflow();
            },
          });
        },
      },
      {
        key: "openRecent",
        label: "Open Recent",
        children: [
          {
            key: "1",
            label: "User worflow 1",
            onClick: () => {
              //
            },
          },
          {
            key: "2",
            label: "User Worflow 2",
            onClick: () => {
              //
            },
          },
          {
            key: "3",
            label: "User Worflow 3",
            onClick: () => {
              //
            },
          },
        ],
      },
      {
        type: "divider",
      },
      {
        key: "share",
        label: "Share",
        onClick: () => {
          //
        },
      },
      {
        type: "divider",
      },
      {
        key: "autoSave",
        label: "Auto Save",
        onClick: () => {
          //
        },
      },
      {
        type: "divider",
      },
      {
        key: "exit",
        label: "Exit",
        onClick: () => {
          //
        },
      },
    ];

    const editorViewItems: ItemType<MenuItemType>[] = [
      {
        label: "Wrap Lines",
        key: "enableLineWrapping",
        onClick: () => {
          editor?.setOptions({
            enableLineWrapping: !editor?.options?.enableLineWrapping,
          });
        },
      },
      {
        label: "Read Only",
        key: "codeReadOnly",
        onClick: () => {
          editor?.setOptions({
            readOnly: !editor?.options?.readOnly,
          });
        },
      },
      {
        label: "Enable Autocomplete",
        key: "codeAutocomplete",
        onClick: () => {
          editor?.setOptions({
            enableCwlAutoCompletion: !editor?.options?.enableCwlAutoCompletion,
          });
        },
      },
      {
        label: "Enable Hover Documentation",
        key: "codeHoverTooltip",
        onClick: () => {
          editor?.setOptions({
            enableCwlHoverTooltip: !editor?.options?.enableCwlHoverTooltip,
          });
        },
      },
      {
        label: "Show Line Numbers",
        key: "codeLineNumbers",
        onClick: () => {
          editor?.setOptions({
            enableLineNumbers: !editor?.options?.enableLineNumbers,
          });
        },
      },
      {
        label: "Enable Code Folding",
        key: "codeFolding",
        onClick: () => {
          editor?.setOptions({
            enableCodeFolding: !editor?.options?.enableCodeFolding,
          });
        },
      },
      {
        label: "Enable Search",
        key: "codeSearch",
        onClick: () => {
          editor?.setOptions({
            enableSearch: !editor?.options?.enableSearch,
          });
        },
      },
      {
        label: "Enable Bracket Matching",
        key: "codeBracketMatching",
        onClick: () => {
          editor?.setOptions({
            enableBracketMatching: !editor?.options?.enableBracketMatching,
          });
        },
      },
      {
        label: "Highlight Active Line",
        key: "codeHighlightActiveLine",
        onClick: () => {
          editor?.setOptions({
            enableHighlightActiveLine:
              !editor?.options?.enableHighlightActiveLine,
          });
        },
      },
      {
        label: "Font Size +",
        key: "fontPlus",
        onClick: () => {
          editor?.setOptions({
            fontSize: (editor?.options?.fontSize ?? 14) + 1,
          });
        },
      },
      {
        label: "Font Size -",
        key: "fontMinus",
        onClick: () => {
          editor?.setOptions({
            fontSize: Math.max(10, (editor?.options?.fontSize ?? 14) - 1),
          });
        },
      },
      {
        label: "Tab Size",
        key: "codeTabSize",
        children: [2, 4, 8].map((tabSize) => ({
          label: `${tabSize} Spaces`,
          key: `codeTabSize${tabSize}`,
          onClick: () => {
            editor?.setOptions({ tabSize });
          },
        })),
      },
    ];

    const viewerViewItems: ItemType<MenuItemType>[] = [
      {
        label: "Enable Minimap",
        key: "showMinimap",
        onClick: () => {
          viewer?.setOptions({ minimap: !viewer?.options?.minimap });
        },
      },
      {
        label: "Enable Wrappers",
        key: "showWrappers",
        onClick: () => {
          viewer?.setOptions({ wrappers: !viewer?.options?.wrappers });
        },
      },
      {
        label: "Enable Color Editor",
        key: "showColorEditor",
        onClick: () => {
          viewer?.setOptions({ colorEditor: !viewer?.options?.colorEditor });
        },
      },
      {
        label: "Enable Labels",
        key: "showLabels",
        onClick: () => {
          viewer?.setOptions({ labels: !viewer?.options?.labels });
        },
      },
      {
        label: "Enable Background",
        key: "showBackground",
        onClick: () => {
          viewer?.setOptions({
            background: {
              ...viewer?.options?.background,
              color:
                viewer?.options?.background?.color === "transparent"
                  ? "black"
                  : "transparent",
            },
          });
        },
      },
    ];

    const items: ItemType<MenuItemType>[] = [
      {
        key: "workflow",
        label: "Workflow",
        children: workflowItems,
      },
      {
        label: "Edit",
        key: "edit",
        children: [
          {
            key: "undo",
            label: "Undo",
            extra: "Ctrl+Z",
            onClick: () => {},
          },
          {
            key: "redo",
            label: "Redo",
            extra: "Ctrl+Y",
            onClick: () => {},
          },
        ],
      },
      {
        label: "View",
        key: "view",
        children: [
          {
            key: "editor",
            label: "Editor",
            children: editorViewItems,
          },
          {
            key: "viewer",
            label: "Viewer",
            children: viewerViewItems,
          },
        ],
      },
    ];

    return items;
  }, [editor, viewer]);

  return (
    <div className="cwl-ide-top-menu">
      <img src="./public\theseus-cwl.svg" alt="Theseus cwl logo" />
      <Menu selectedKeys={selectedMenuKeys} mode="horizontal" items={items} />
      <Space>
        {props.ide.store.validationStatus === ValidationStatus.VALIDATING ? (
          <Tag color="gray">Validating...</Tag>
        ) : props.ide.store.validationStatus === ValidationStatus.VALID ? (
          <Tag color="green">Valid</Tag>
        ) : (
          <Tag color="red">Not valid</Tag>
        )}
        <Button
          disabled={
            props.ide.store.validationStatus !== ValidationStatus.VALID ||
            props.ide.store.runStatus === RunStatus.COMPLETED
          }
          onClick={() => props.ide.runWorkflow()}
          size="small"
          color="primary"
          variant="filled"
        >
          ▶ Run
        </Button>
      </Space>
    </div>
  );
});
