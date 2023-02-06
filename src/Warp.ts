import { euclideanDistance } from "./path/interpolate";
import warpTransform, { PointTransformer } from "./warp/transform";
import warpInterpolate from "./warp/interpolate";
import warpExtrapolate, { DeltaFunction } from "./warp/extrapolate";

import { Point } from "./path/shape";
import {
  parsePath,
  ReducedInstruction,
  reduceInstructions,
  serializeInstructions,
} from "@remotion/paths";

function interpolate(
  path: ReducedInstruction[],
  threshold: number
): ReducedInstruction[] {
  let didWork = false;

  const deltaFunction: DeltaFunction = (points) => {
    const linearPoints = [
      points[0].slice(0, 2),
      points[points.length - 1].slice(0, 2),
    ] as Point[];

    const delta = euclideanDistance(linearPoints);
    didWork = didWork || delta > threshold;

    return delta;
  };

  return warpInterpolate(path, threshold, deltaFunction);
}

export function transform(
  path: string,
  transformer: PointTransformer,
  interpolationThreshold: number
): string {
  return serializeInstructions(
    warpTransform(
      interpolate(reduceInstructions(parsePath(path)), interpolationThreshold),
      transformer
    )
  );
}

export const extrapolate = (path: string, threshold: number): string => {
  let didWork = false;

  const deltaFunction: DeltaFunction = (points) => {
    const linearPoints = [
      points[0].slice(0, 2),
      points[points.length - 1].slice(0, 2),
    ] as Point[];

    const delta = euclideanDistance(linearPoints);
    didWork = didWork || delta <= threshold;

    return delta;
  };

  return serializeInstructions(
    warpExtrapolate(
      reduceInstructions(parsePath(path)),
      threshold,
      deltaFunction
    )
  );
};
