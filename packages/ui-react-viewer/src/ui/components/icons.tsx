export type NodeIconProps = {
  color?: string;
};

export const InputIcon = (props: NodeIconProps) => {
  const { color } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ backgroundColor: color }}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );
};

export const StepIcon = (props: NodeIconProps) => {
  const { color } = props;

  return (
    <svg
      style={{ backgroundColor: color }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
      <path d="M12 2v2"></path>
      <path d="M12 22v-2"></path>
      <path d="m17 20.66-1-1.73"></path>
      <path d="M11 10.27 7 3.34"></path>
      <path d="m20.66 17-1.73-1"></path>
      <path d="m3.34 7 1.73 1"></path>
      <path d="M14 12h8"></path>
      <path d="M2 12h2"></path>
      <path d="m20.66 7-1.73 1"></path>
      <path d="m3.34 17 1.73-1"></path>
      <path d="m17 3.34-1 1.73"></path>
      <path d="m11 13.73-4 6.93"></path>
    </svg>
  );
};

export const OutputIcon = (props: NodeIconProps) => {
  const { color } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={{ backgroundColor: color }}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  );
};
