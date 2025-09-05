/** Converts an hex color string to a RGB color string with an optional opacity */
export const hexToRgba = (hex: string, opacity: number) => {
  hex = hex.replace(/^#/, "");

  // Support short hex (#abc → #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((color) => color + color)
      .join("");
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
