import { observer } from "mobx-react";
import { useMemo, useState } from "react";

import { CwlSource } from "@theseus-cwl/types";

import { SidebarSection } from "./side-menu";
import { CWLIde } from "../store";
import { Drawer, Tabs } from "antd";
import { Run } from "../store/cwl-ide-runner";

const { TabPane } = Tabs;

export type RunDetailsDrawerProps = {
  run?: Run;
  visible: boolean;
  onClose: () => unknown;
};

const RunDetailsDrawer = (props: RunDetailsDrawerProps) => {
  const { run, visible, onClose } = props;

  if (!run) {
    return null;
  }

  return (
    <Drawer
      title={`Run ID: ${run.runId}`}
      size={600}
      placement="right"
      onClose={onClose}
      open={visible}
    >
      {/* <p>Status: {run.status.status}</p>
      <p>Exit Code: {run.status.exitCode}</p>
      <p>Finished At: {new Date(run.status.finishedAt).toLocaleString()}</p> */}

      <Tabs defaultActiveKey="1">
        <TabPane tab="Logs" key="1">
          <pre style={{ maxHeight: 400, overflow: "auto" }}>{run.logs}</pre>
        </TabPane>
        <TabPane tab="Outputs" key="2">
          <ul>
            {Object.entries(run.outputs).map(([name, path]) => (
              <li key={name}>
                <a
                  href={`http://localhost:3004/${path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export type ExplorerFile = {
  id: string;
  name: string;
  kind?: "workflow" | string;
};

const buildExplorerTree = (source: CwlSource | undefined): ExplorerFile[] => {
  const documents = [];
  if (source) {
    documents.push(
      ...[...source.documents, ...source.parameters].map((file) => {
        return { id: file.name, name: file.name };
      }),
    );
  }

  return documents;
};

type ExplorerItemProps = {
  name: string;
  onOpenFile: (id: string) => void;
  active: boolean;
};

const ExplorerItem = observer((props: ExplorerItemProps) => {
  return (
    <div
      className={`explorer-item ${props.active && "active"}`}
      onClick={() => props.onOpenFile(props.name)}
    >
      📄 {props.name}
    </div>
  );
});

type CwlFileExplorerProps = {
  source: CwlSource | undefined;
  onOpenFile: (id: string) => void;
  activeFileId: string | undefined;
};

export const CwlFileExplorer = observer((props: CwlFileExplorerProps) => {
  const sortedFiles = useMemo(() => {
    const files = buildExplorerTree(props.source);

    return files;
  }, [props.source]);

  return (
    <div className="cwl-file-explorer">
      {sortedFiles?.map((file) => (
        <ExplorerItem
          active={file.id === props.activeFileId}
          key={file.id}
          name={file.name}
          onOpenFile={(id) => props.onOpenFile(id)}
        />
      ))}
    </div>
  );
});

export type CwlRunsExplorerProps = { ide: CWLIde };

export const CwlRunsExplorer = observer((props: CwlRunsExplorerProps) => {
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>(
    undefined,
  );
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  if (!props.ide.runner.pastRuns.length) {
    return null;
  }

  return (
    <>
      <div className="cwl-file-explorer">
        {props.ide.runner.pastRuns?.map((run) => (
          <ExplorerItem
            key={run.runId}
            name={run.runId}
            active={selectedRunId && selectedRunId === run.runId ? true : false}
            onOpenFile={(name) => {
              setSelectedRunId(name);
              setDrawerVisible(true);
            }}
          />
        ))}
      </div>
      <RunDetailsDrawer
        run={props.ide.runner.pastRuns.find(
          (run) => run.runId === selectedRunId,
        )}
        visible={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedRunId(undefined);
        }}
      />
    </>
  );
});

export type CwlIdeContextualSidebarProps = {
  section: SidebarSection;
  source: CwlSource | undefined;
  onOpenFile: (id: string) => void;
  activeFileId: string | undefined;
  ide: CWLIde;
};

export const CwlIdeOpenSideMenu = observer(
  (props: CwlIdeContextualSidebarProps) => {
    const { section, source, onOpenFile, activeFileId, ide } = props;

    const Content = () => {
      if (section === SidebarSection.NONE) {
        return null;
      } else if (section === SidebarSection.SEARCH) {
        return null;
      } else if (section === SidebarSection.EXPLORER) {
        return (
          <CwlFileExplorer
            activeFileId={activeFileId}
            source={source}
            onOpenFile={(id: string) => onOpenFile(id)}
          />
        );
      } else if (section === SidebarSection.RUN) {
        return <CwlRunsExplorer ide={ide} />;
      }
    };

    return (
      <div className="cwl-ide-open-side-menu">
        <Content />
      </div>
    );
  },
);
