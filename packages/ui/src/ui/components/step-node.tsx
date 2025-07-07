/**
 *
 */
export type StepNodeComponentProps = {
  step?: {
    id: string;
    content: {
      run: string;
      in: Record<
        string,
        {
          source: string;
        }
      >;
      out: string;
    };
  };
  onAddStepNode?: () => void;
};

/**
 *
 */
export const StepNodeComponent = (props: StepNodeComponentProps) => {
  const { step, onAddStepNode } = props;

  if (step && !onAddStepNode) {
    return (
      <div className="node-component ">
        <h1 style={{ fontFamily: "monospace" }}> {step.id}</h1>
        <h1>Run: {step.content.run}</h1>
        <h1>In:</h1>
        <div className="input-list">
          {Object.entries(step.content.in).map(([key, value]) => (
            <div key={key} className="input-item">
              <strong>{key}:</strong> <span>{value.source}</span>
            </div>
          ))}
        </div>
        <h1>Out: {step.content.out}</h1>
      </div>
    );
  }

  if (!step && onAddStepNode) {
    return (
      <div onClick={props.onAddStepNode} className="node-component-placeholder">
        <span>+ New step node</span>
      </div>
    );
  }
};
