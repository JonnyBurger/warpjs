import { shapesToPaths, preparePaths } from "./svg/normalize";
import { getProperty, setProperty } from "./svg/utils";
import pathParser from "./path/parser";
import pathEncoder from "./path/encoder";
import { euclideanDistance } from "./path/interpolate";
import warpTransform from "./warp/transform";
import warpInterpolate from "./warp/interpolate";
import warpExtrapolate, { DeltaFunction } from "./warp/extrapolate";
import { Segment } from "./path/utils";
import { PointTransformer } from "./types";
import { Point } from "./path/shape";

export class Warp {
  element: SVGElement;
  paths: { pathElement: SVGPathElement; pathData: Segment[] }[];
  constructor(element: SVGElement, curveType = "q") {
    this.element = element;

    shapesToPaths(element);
    preparePaths(element, curveType);

    const pathElements = Array.from(element.querySelectorAll("path"));

    this.paths = pathElements.map((pathElement) => {
      const pathString = getProperty(pathElement, "d");
      const pathData = pathParser(pathString);

      return { pathElement, pathData };
    });
  }

  update() {
    for (let { pathElement, pathData } of this.paths) {
      const pathString = pathEncoder(pathData);
      setProperty(pathElement, "d", pathString);
    }
  }

  transform(transformers: PointTransformer | PointTransformer[]) {
    const actualTransformers = Array.isArray(transformers)
      ? transformers
      : [transformers];

    for (let path of this.paths) {
      path.pathData = warpTransform(path.pathData, actualTransformers);
    }

    this.update();
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

    for (let path of this.paths) {
      path.pathData = warpInterpolate(path.pathData, threshold, deltaFunction);
    }

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

    for (let path of this.paths) {
      path.pathData = warpExtrapolate(path.pathData, threshold, deltaFunction);
    }

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

    for (let path of this.paths) {
      const transformed = warpTransform(path.pathData, [
        function (points) {
          const newPoints = transformer(points.slice(0, 2));
          newPoints.push(...points);

          return newPoints;
        },
      ]);

      const interpolated = warpInterpolate(
        transformed,
        threshold,
        deltaFunction
      );

      path.pathData = warpTransform(interpolated, [
        (points) => points.slice(2),
      ]);
    }

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

    for (let path of this.paths) {
      const transformed = warpTransform(path.pathData, [
        function (points) {
          const newPoints = transformer(points.slice(0, 2));
          newPoints.push(...points);

          return newPoints;
        },
      ]);

      const extrapolated = warpExtrapolate(
        transformed,
        threshold,
        deltaFunction
      );

      path.pathData = warpTransform(extrapolated, [
        (points) => points.slice(2),
      ]);
    }

    return didWork;
  }
}
