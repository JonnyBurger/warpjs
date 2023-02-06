import { euclideanDistance } from "./path/interpolate";
import warpTransform from "./warp/transform";
import warpInterpolate from "./warp/interpolate";
import warpExtrapolate, { DeltaFunction } from "./warp/extrapolate";
import { PointTransformer } from "./types";
import { Point } from "./path/shape";
import { parsePath, serializeInstructions } from "@remotion/paths";

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
    warpInterpolate(parsePath(path), threshold, deltaFunction)
  );
}

export function transform(
  path: string,
  transformers: PointTransformer[]
): string {
  return serializeInstructions(warpTransform(parsePath(path), transformers));
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
    warpExtrapolate(parsePath(path), threshold, deltaFunction)
  );
};

export const preInterpolate = (
  path: string,
  transformer: PointTransformer,
  threshold: number
): string => {
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

  const transformed = warpTransform(parsePath(path), [
    function (points) {
      const newPoints = transformer(points.slice(0, 2));
      newPoints.push(...points);

      return newPoints;
    },
  ]);

  const interpolated = warpInterpolate(transformed, threshold, deltaFunction);

  return serializeInstructions(
    warpTransform(interpolated, [(points) => points.slice(2)])
  );
};

export const preExtrapolate = (
  path: string,
  transformer: PointTransformer,
  threshold: number
) => {
  let didWork = false;

  const deltaFunction: DeltaFunction = (points) => {
    const linearPoints = [
      points[0].slice(0, 2),
      points[points.length - 1].slice(0, 2),
    ];

    const delta = euclideanDistance(linearPoints as Point[]);
    didWork = didWork || delta <= threshold;

    return delta;
  };

  const transformed = warpTransform(parsePath(path), [
    function (points) {
      const newPoints = transformer(points.slice(0, 2));
      newPoints.push(...points);

      return newPoints;
    },
  ]);

  const extrapolated = warpExtrapolate(transformed, threshold, deltaFunction);

  return serializeInstructions(
    warpTransform(extrapolated, [(points) => points.slice(2)])
  );
};
