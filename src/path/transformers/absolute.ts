import { isDrawingSegment, Segment } from "../utils";

export default function absoluteGenerator() {
  const xProps = ["x", "x1", "x2"];
  const yProps = ["y", "y1", "y2"];

  let prevX = 0;
  let prevY = 0;
  let pathStartX = NaN;
  let pathStartY = NaN;

  return function absolute(segment: Segment) {
    if (isNaN(pathStartX) && isDrawingSegment(segment)) {
      pathStartX = prevX;
      pathStartY = prevY;
    }

    if (segment.type === "z" && !isNaN(pathStartX)) {
      prevX = pathStartX;
      prevY = pathStartY;
      pathStartX = NaN;
      pathStartY = NaN;
    }

    if (segment.relative) {
      for (let x of xProps) {
        if (x in segment) {
          // @ts-expect-error
          segment[x] += prevX;
        }
      }

      for (let y of yProps) {
        if (y in segment) {
          // @ts-expect-error
          segment[y] += prevY;
        }
      }

      segment.relative = false;
    }

    prevX = "x" in segment ? segment.x! : prevX;
    prevY = "y" in segment ? segment.y! : prevY;

    if (segment.type === "m") {
      pathStartX = prevX;
      pathStartY = prevY;
    }

    return segment;
  };
}
