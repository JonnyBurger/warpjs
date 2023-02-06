import pathTransform, { Path } from "../path/transform";
import { interpolateUntil } from "../path/interpolate";
import { createLineSegment } from "../path/utils";
import { DeltaFunction } from "./extrapolate";
import { Point } from "../path/shape";
import { ReducedInstruction } from "@remotion/paths";

export default function interpolate(
  path: Path,
  threshold: number,
  deltaFunction: DeltaFunction
) {
  let prevPoints: number[] = [];

  return pathTransform(path, function (segment) {
    let segments: ReducedInstruction[] = [segment];

    if (segment.type === "C" || segment.type === "Q" || segment.type === "L") {
      const points: Point[] = [prevPoints as Point];

      if (segment.type === "C") {
        points.push([segment.cp1x, segment.cp1y]);
        points.push([segment.cp2x, segment.cp2y]);
        points.push([segment.x, segment.y]);
      }
      if (segment.type === "L") {
        points.push([segment.x, segment.y]);
      }
      if (segment.type === "Q") {
        points.push([segment.cpx, segment.cpy]);
        points.push([segment.x, segment.y]);
      }

      const rawSegments = interpolateUntil(points, threshold, deltaFunction);

      segments = rawSegments.map((rawSegment) => createLineSegment(rawSegment));
    }

    if ("x" in segment && "y" in segment) {
      const pointList: number[] = [segment.x, segment.y];

      prevPoints = pointList;
    }

    return segments;
  });
}
