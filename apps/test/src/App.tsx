import { useState } from "react";

import { SUBWORKFLOW_NODE_SCALING_FACTOR } from "@theseus-cwl/configurations";
import { CwlCodeEditor } from "@theseus-cwl/ui-react-editor";
import { CwlViewer } from "@theseus-cwl/ui-react-viewer";

import { SOURCES } from "./examples";

export const ExampleComponent = () => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [useString, setUseString] = useState(false);
  const [minimap, setMinimap] = useState<boolean>(false);
  const [wrappers, setWrappers] = useState<boolean>(false);
  const [labels, setLabels] = useState<boolean>(false);
  const [colorEditor, setColorEditor] = useState<boolean>(false);
  const [scalingFactor, setScalingFactor] = useState<number>(
    SUBWORKFLOW_NODE_SCALING_FACTOR,
  );

  const currentSource = useString
    ? SOURCES[sourceIndex]!.string
    : SOURCES[sourceIndex]!.object;

  return (
    <div className="example">
      <div className="example-actions">
        <label>
          Input source:
          <select
            value={sourceIndex}
            onChange={(event) => setSourceIndex(parseInt(event.target.value))}
          >
            {SOURCES.map((_, index) => (
              <option key={index} value={index}>
                CWL Source {index + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={useString}
            onChange={() => setUseString(!useString)}
          />
          Use string input
        </label>
        <label>
          <input
            type="checkbox"
            checked={minimap}
            onChange={() => setMinimap(!minimap)}
          />
          Minimap
        </label>
        <label>
          <input
            type="checkbox"
            checked={labels}
            onChange={() => setLabels(!labels)}
          />
          Labels
        </label>
        <label>
          <input
            type="checkbox"
            checked={wrappers}
            onChange={() => setWrappers(!wrappers)}
          />
          Wrappers
        </label>
        <label>
          <input
            type="checkbox"
            checked={colorEditor}
            onChange={() => setColorEditor(!colorEditor)}
          />
          Color selector
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          Subworkflow scaling Factor:
          <input
            type="number"
            min={0.4}
            max={1.5}
            step={0.1}
            style={{ width: "60px" }}
            value={scalingFactor}
            onChange={(e) => setScalingFactor(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div className="example-content">
        <CwlViewer
          input={currentSource}
          wrappers={wrappers}
          minimap={minimap}
          colorEditor={colorEditor}
          labels={labels}
          subWorkflowScalingFactor={scalingFactor}
        />
        <CwlCodeEditor activeFileId={undefined} input={currentSource} />
      </div>
    </div>
  );
};

function App() {
  return <ExampleComponent />;
}

export default App;
