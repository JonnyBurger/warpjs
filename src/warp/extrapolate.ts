import { Point } from "../path/shape";
import pathTransform, { Path } from "../path/transform";
import { joinSegments, SegmentType } from "../path/utils";

const extrapolationTypesExpr = /[lqc]/;

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
        extrapolationTypesExpr.test(segment.type as SegmentType) &&
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

    return segment;
  });
}
