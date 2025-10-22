import { useEffect } from "react";

export interface Position {
  x: number;
  y: number;
}

export interface ContextMenuPosition {
  position: Position;
  transformOrigin: string;
}

export const calculateContextMenuPosition = (
  clickPosition: Position,
  menuWidth: number,
  menuHeight: number
): ContextMenuPosition => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let x = clickPosition.x;
  let y = clickPosition.y;
  let transformOrigin = "top left";

  // Check right edge
  if (x + menuWidth > windowWidth) {
    x = clickPosition.x - menuWidth;
    transformOrigin = "top right";
  }

  // Check left edge (if we flipped to left)
  if (x < 0) {
    x = 10; // Add small margin
    transformOrigin = "top left";
  }

  // Check bottom edge
  if (y + menuHeight > windowHeight) {
    y = clickPosition.y - menuHeight;
    transformOrigin = transformOrigin.includes("top")
      ? "bottom left"
      : "bottom right";
  }

  // Check top edge (if we flipped to top)
  if (y < 0) {
    y = 10; // Add small margin
    transformOrigin = transformOrigin.includes("bottom")
      ? "top left"
      : "top right";
  }

  return {
    position: { x, y },
    transformOrigin,
  };
};