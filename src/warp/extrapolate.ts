import { Point } from "../path/shape";
import pathTransform, { Path } from "../path/transform";
import { joinSegments } from "../path/utils";

export type DeltaFunction = (points: Point[]) => number;

export default function extrapolate(
  path: Path,
  threshold: number,
  deltaFunction: DeltaFunction
) {
  return pathTransform(path, function (segment, i, oldPath, newPath) {
    if (i > 1) {
      const prevSegment = newPath[newPath.length - 1];
      const prevSegment2 = newPath[newPath.length - 2];

      if (
        (segment.type === "L" ||
          segment.type === "Q" ||
          segment.type === "C") &&
        (prevSegment.type === "L" ||
          prevSegment.type === "Q" ||
          prevSegment.type === "C") &&
        (prevSegment2.type === "L" ||
          prevSegment2.type === "Q" ||
          prevSegment2.type === "C") &&
        prevSegment.type === segment.type
      ) {
        const points: Point[] = [
          [prevSegment2.x!, prevSegment2.y!],
          [segment.x!, segment.y!],
        ];

        if (deltaFunction(points) <= threshold) {
          const newSegment = joinSegments(prevSegment, segment);

          if (newSegment) {
            newPath[newPath.length - 1] = newSegment;

            return false;
          }
        }
      }
    }

    return [segment];
  });
}
