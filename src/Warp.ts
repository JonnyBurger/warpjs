import { euclideanDistance } from "./path/interpolate";
import warpTransform from "./warp/transform";
import warpInterpolate from "./warp/interpolate";
import warpExtrapolate, { DeltaFunction } from "./warp/extrapolate";
import { PointTransformer } from "./types";
import { Point } from "./path/shape";
import parser from "./path/parser";
import encoder from "./path/encoder";

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

  return encoder(warpInterpolate(parser(path), threshold, deltaFunction));
}

export function transform(
  path: string,
  transformers: PointTransformer | PointTransformer[]
): string {
  const actualTransformers = Array.isArray(transformers)
    ? transformers
    : [transformers];

  return encoder(warpTransform(parser(path), actualTransformers));
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

  return encoder(warpExtrapolate(parser(path), threshold, deltaFunction));
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

  const transformed = warpTransform(parser(path), [
    function (points) {
      const newPoints = transformer(points.slice(0, 2));
      newPoints.push(...points);

      return newPoints;
    },
  ]);

  const interpolated = warpInterpolate(transformed, threshold, deltaFunction);

  return encoder(warpTransform(interpolated, [(points) => points.slice(2)]));
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

  const transformed = warpTransform(parser(path), [
    function (points) {
      const newPoints = transformer(points.slice(0, 2));
      newPoints.push(...points);

      return newPoints;
    },
  ]);

  const extrapolated = warpExtrapolate(transformed, threshold, deltaFunction);

  return encoder(warpTransform(extrapolated, [(points) => points.slice(2)]));
};
