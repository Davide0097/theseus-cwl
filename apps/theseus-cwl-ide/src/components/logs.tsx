import { observer } from "mobx-react";

import { CwlIdeStore, Log } from "../store";

type LogComponentProps = {
  log: Log;
};

export const LogComponent = (props: LogComponentProps) => {
  const { log } = props;

  let icon = "ℹ️";
  let className = "log-info";

  switch (log.type) {
    case "info":
      icon = "ℹ️";
      className = "log-info";
      break;

    case "error":
      icon = "❌";
      className = "log-error";
      break;

    case "success":
      icon = "✅";
      className = "log-success";
      break;
  }

  return (
    <div className="cwl-ide-log-line">
      <span className="log-time">
        [{new Date(log.timeStamp).toLocaleTimeString()}]
      </span>{" "}
      <span className="log-component">
        {log.component} {">"}{" "}
      </span>
      <span className={className}>
        {icon} {log.text}
      </span>
    </div>
  );
};

export type CwlIdeLogsProps = {
  store: CwlIdeStore;
};

export const CwlIdeLogs = observer((props: CwlIdeLogsProps) => {
  return (
    <div className="cwl-ide-logs">
      <div className="cwl-ide-logs-header">
        <span>Terminal</span>
      </div>

      <div className="cwl-ide-logs-content">
        {props.store.logs.map((log, index) => (
          <LogComponent log={log} key={index} />
        ))}
      </div>
    </div>
  );
});
