import pathTransform, { Path } from "../path/transform";
import { until as interpolateUntil } from "../path/interpolate";
import { createLineSegment, pointGroups, Segment } from "../path/utils";
import { DeltaFunction } from "./extrapolate";
import { Point } from "../path/shape";

const interpolationTypesExpr = /[lqc]/;

export default function interpolate(
  path: Path,
  threshold: number,
  deltaFunction: DeltaFunction
) {
  let prevPoints: number[] = [];

  return pathTransform(path, function (segment) {
    let segments: Segment[] | Segment = segment;

    if (interpolationTypesExpr.test(segment.type!)) {
      const points: Point[] = [prevPoints as Point];

      for (let j = 0; j < pointGroups.length; j++) {
        const [x, y] = pointGroups[j];

        if (x in segment && y in segment) {
          const extendedPoints =
            (segment.extended ? segment.extended[j] : null) || [];
          const pointList: number[] = [
            segment[x]!,
            segment[y]!,
            ...extendedPoints,
          ];

          points.push(pointList as Point);
        }
      }

      const rawSegments = interpolateUntil(points, threshold, deltaFunction);

      if (rawSegments.length > 1) {
        segments = rawSegments.map((rawSegment) =>
          createLineSegment(rawSegment)
        ) as Segment[];
      }
    }

    if ("x" in segment && "y" in segment) {
      const extendedPoints =
        (segment.extended ? segment.extended[2] : null) || [];
      const pointList: number[] = [segment.x!, segment.y!, ...extendedPoints];

      prevPoints = pointList;
    }

    return segments;
  });
}
