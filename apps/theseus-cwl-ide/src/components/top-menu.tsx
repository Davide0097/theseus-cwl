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

  const selectedMenuKeys = useMemo(() => {
    const keys: string[] = [];

    if (editor?.options?.wrap) {
      keys.push("codeWrap");
    }
    if (viewer?.options?.minimap) {
      keys.push("showMinimap");
    }
    if (viewer?.options?.wrappers) {
      keys.push("showWrappers");
    }
    if (viewer?.options?.colorEditor) {
      keys.push("showColorEditor");
    }
    if (viewer?.options?.labels) {
      keys.push("showLabels");
    }
    if (viewer?.options?.background?.color !== "transparent") {
      keys.push("showBackground");
    }

    return keys;
  }, [viewer, editor]);

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
        key: "codeWrap",
        onClick: () => {
          editor?.setOptions({
            wrap: !editor?.options?.wrap,
          });
        },
      },
      {
        label: "Font Size +",
        key: "fontPlus",
        onClick: () => {
          editor?.setOptions({
            fontSize: Math.max(10, editor?.options?.fontSize || 10 + 1),
          });
        },
      },
      {
        label: "Font Size -",
        key: "fontMinus",
        onClick: () => {
          editor?.setOptions({
            fontSize: Math.max(10, editor?.options?.fontSize || 10 - 1),
          });
        },
      },
      // {
      //     label: 'Enable autocomplete',
      //     key: 'autocomplete',
      //     onClick: () => {
      //         if (selectedMenuKeys.includes('autocomplete')) {
      //             setSelectedMenuKeys(selectedMenuKeys.filter((key) => key !== 'autocomplete'));
      //         } else {
      //             setSelectedMenuKeys([...selectedMenuKeys, 'autocomplete']);
      //         }

      //         setCodeEditorOptions((prev) => ({
      //             ...prev,
      //             autocomplete: !prev.autocomplete
      //         }));
      //     }
      // }
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
