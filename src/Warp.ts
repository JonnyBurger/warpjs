import { euclideanDistance } from "./path/interpolate";
import warpTransform from "./warp/transform";
import warpInterpolate from "./warp/interpolate";
import warpExtrapolate, { DeltaFunction } from "./warp/extrapolate";
import { PointTransformer } from "./types";
import { Point } from "./path/shape";
import {
  parsePath,
  reduceInstructions,
  serializeInstructions,
} from "@remotion/paths";

export function interpolate(path: string, threshold: number): string {
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

  return serializeInstructions(
    warpInterpolate(
      reduceInstructions(parsePath(path)),
      threshold,
      deltaFunction
    )
  );
}

export function transform(
  path: string,
  transformers: PointTransformer[]
): string {
  return serializeInstructions(
    warpTransform(reduceInstructions(parsePath(path)), transformers)
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
