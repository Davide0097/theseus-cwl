import { Spin, Splitter } from "antd";
import { observer } from "mobx-react";
import { useState } from "react";

import { CwlSource } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui-react-viewer";
import { CwlCodeEditor } from "@theseus-cwl/ui-react-editor";

import { CWLIde } from "../store";
import { CwlIdeLogs } from "./logs";
import { CwlIdeOpenSideMenu } from "./open-side-menu";
import { CwlIdeSideMenu, SidebarSection } from "./side-menu";
import { CwlIdeTopMenu } from "./top-menu";

export const DEFAULT_SIDE_MENU_SECTION_OPEN_WIDTH = 300;

export type CwlIdeComponentProps = {
  ide: CWLIde;
};

export const CwlIdeComponent = observer((props: CwlIdeComponentProps) => {
  const { ide } = props;

  const [sideMenuSection, setSideMenuSection] = useState<SidebarSection>(
    SidebarSection.EXPLORER,
  );
  const [isResizingViewer, setIsResizingViewer] = useState<boolean>(false);

  return (
    <div className="cwl-ide">
      <CwlIdeTopMenu ide={ide} />
      <div className="cwl-ide-content">
        <CwlIdeSideMenu setSideMenuSection={setSideMenuSection} />
        <Splitter orientation="horizontal">
          {sideMenuSection !== SidebarSection.NONE && (
            <Splitter.Panel defaultSize={DEFAULT_SIDE_MENU_SECTION_OPEN_WIDTH}>
              <CwlIdeOpenSideMenu
                ide={ide}
                section={sideMenuSection}
                source={ide.codeEditor.value}
                activeFileId={ide.store.selectedFileId}
                onOpenFile={(id) => ide.store.setSelectedFileId(id)}
              />
            </Splitter.Panel>
          )}
          <Splitter.Panel>
            <Splitter
              orientation="vertical"
              onResizeStart={() => setIsResizingViewer(true)}
              onResizeEnd={() => setIsResizingViewer(false)}
            >
              <Splitter.Panel>
                <Splitter
                  orientation="horizontal"
                  onResizeStart={() => setIsResizingViewer(true)}
                  onResizeEnd={() => setIsResizingViewer(false)}
                >
                  <Splitter.Panel className="cwl-ide-code-editor">
                    <CwlCodeEditor
                      activeFileId={ide.store.selectedFileId}
                      input={ide.codeEditor.value}
                      onChange={(value: CwlSource) => ide.updateState(value)}
                    />
                  </Splitter.Panel>
                  <Splitter.Panel>
                    <div className="cwl-ide-viewer">
                      {!isResizingViewer ? (
                        <CwlViewer
                          {...ide.viewer.options}
                          input={ide.viewer.value}
                        />
                      ) : (
                        <div className="cwl-ide-viewer-loading">
                          <Spin
                            classNames={{
                              indicator: "cwl-ide-viewer-loading-spinner",
                            }}
                            size="large"
                          />
                        </div>
                      )}
                    </div>
                  </Splitter.Panel>
                </Splitter>
              </Splitter.Panel>
              <Splitter.Panel className="cwl-ide-logs" defaultSize={200}>
                <CwlIdeLogs store={ide.store} />
              </Splitter.Panel>
            </Splitter>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
});
