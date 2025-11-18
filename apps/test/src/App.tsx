import { useEffect, useState } from "react";
import YAML from "yaml";

import { SUBWORKFLOW_NODE_SCALING_FACTOR } from "@theseus-cwl/configurations";
import { CWLPackedDocument, Shape, Workflow } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui";

import { cwlDocuments as cwlDocumentsAsJson } from "./examples";

export const useCwlFiles = (filenames: string[]) => {
  const [docs, setDocs] = useState<
    (Workflow<Shape.Raw> | CWLPackedDocument<Shape.Raw>)[]
  >([]);

  useEffect(() => {
    Promise.all(
      filenames.map((file) =>
        fetch(`/files/${file}`)
          .then((res) => res.text())
          .then((text) => YAML.parse(text)),
      ),
    ).then(setDocs);
  }, []);

  return docs;
};

export const ExampleComponent = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [minimap, setMinimap] = useState<boolean>(false);
  const [wrappers, setWrappers] = useState<boolean>(false);
  const [labels, setLabels] = useState<boolean>(false);
  const [colorEditor, setColorEditor] = useState<boolean>(false);
  const [scalingFactor, setScalingFactor] = useState<number>(
    SUBWORKFLOW_NODE_SCALING_FACTOR,
  );

  const cwlDocumentsFromFile = useCwlFiles([
    "1.cwl",
    "2.cwl",
    "3.cwl",
    "4.cwl",
    "5.cwl",
    "6.cwl",
    "7.cwl",
    "8.cwl",
    "9.cwl",
    "10.cwl",
    "11.cwl",
  ]);

  const cwlDocuments = [...cwlDocumentsFromFile, ...cwlDocumentsAsJson];

  return (
    <div className="example">
      <div className="example-actions">
        <label>
          Input:
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
          >
            {cwlDocuments.map((_, index) => (
              <option key={index} value={index}>
                CWL Object {index}
              </option>
            ))}
          </select>
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
      <CwlViewer
        input={cwlDocuments[selectedIndex]}
        wrappers={wrappers}
        minimap={minimap}
        colorEditor={colorEditor}
        labels={labels}
        subWorkflowScalingFactor={scalingFactor}
      />
    </div>
  );
};

function App() {
  return <ExampleComponent />;
}

export default App;
