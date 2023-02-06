import pathTransform, { Path } from "../path/transform";
import { interpolateUntil } from "../path/interpolate";
import { createLineSegment } from "../path/utils";
import { DeltaFunction } from "./extrapolate";

export default function interpolate(
  path: Path,
  threshold: number,
  deltaFunction: DeltaFunction
) {
  let prexX = 0;
  let prexY = 0;

  return pathTransform(path, function (segment) {
    const points: [number, number][] = [[prexX, prexY]];

    if (segment.type !== "Z") {
      prexX = segment.x;
      prexY = segment.y;
    }

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

    if (segment.type === "C" || segment.type === "Q" || segment.type === "L") {
      return interpolateUntil(points, threshold, deltaFunction).map(
        (rawSegment) => createLineSegment(rawSegment)
      );
    }

    return [segment];
  });
}
