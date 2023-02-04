import { getProperty, setProperty } from "./svg/utils";
import pathEncoder from "./path/encoder";
import { euclideanDistance } from "./path/interpolate";
import warpTransform from "./warp/transform";
import warpInterpolate from "./warp/interpolate";
import warpExtrapolate, { DeltaFunction } from "./warp/extrapolate";
import { Segment } from "./path/utils";
import { PointTransformer } from "./types";
import { Point } from "./path/shape";
import parser from "./path/parser";

export class Warp {
  path: Segment[];

  constructor(path: string) {
    this.path = parser(path);
  }

  transform(transformers: PointTransformer | PointTransformer[]) {
    const actualTransformers = Array.isArray(transformers)
      ? transformers
      : [transformers];

    this.path = warpTransform(this.path, actualTransformers);
  }

  interpolate(threshold: number) {
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

    this.path = warpInterpolate(this.path, threshold, deltaFunction);

    return didWork;
  }

  extrapolate(threshold: number) {
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

    this.path = warpExtrapolate(this.path, threshold, deltaFunction);

    return didWork;
  }

  preInterpolate(transformer: PointTransformer, threshold: number) {
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

    const transformed = warpTransform(this.path, [
      function (points) {
        const newPoints = transformer(points.slice(0, 2));
        newPoints.push(...points);

        return newPoints;
      },
    ]);

    const interpolated = warpInterpolate(transformed, threshold, deltaFunction);

    this.path = warpTransform(interpolated, [(points) => points.slice(2)]);

    return didWork;
  }

  preExtrapolate(transformer: PointTransformer, threshold: number) {
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

    const transformed = warpTransform(this.path, [
      function (points) {
        const newPoints = transformer(points.slice(0, 2));
        newPoints.push(...points);

        return newPoints;
      },
    ]);

    const extrapolated = warpExtrapolate(transformed, threshold, deltaFunction);

    this.path = warpTransform(extrapolated, [(points) => points.slice(2)]);

    return didWork;
  }
}
