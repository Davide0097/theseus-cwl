/**
 * Converts an hex color string to a RGB color string with an optional opacity
 */
export const hexToRgba = (hex: string, opacity: number) => {
  hex = hex.replace(/^#/, "");

  // Support short hex (#abc to #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((color) => color + color)
      .join("");
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
