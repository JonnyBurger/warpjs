import pathTransform, { Path, Transformer } from "../path/transform";
import { pointGroups } from "../path/utils";
import { PointTransformer } from "../types";

export default function transform(
  path: Path,
  transformers: PointTransformer[]
) {
  return pathTransform(path, (segment) => {
    for (let i = 0; i < pointGroups.length; i++) {
      const [x, y] = pointGroups[i];

      if (x in segment && y in segment) {
        const extendedPoints =
          (segment.extended ? segment.extended[i] : null) || [];
        const oldPoints: number[] = [
          segment[x]!,
          segment[y]!,
          ...extendedPoints,
        ];
        const newPoints = transformers.reduce(
          (points, transformer) => transformer(points),
          oldPoints
        );

        if (newPoints.length < 2) {
          throw new Error(`Transformer must return at least 2 points`);
        }

        segment[x] = newPoints[0];
        segment[y] = newPoints[1];

        if (newPoints.length > 2) {
          segment.extended = segment.extended || {};
          segment.extended[i] = newPoints.slice(2);
        }
      }
    }

    return segment;
  });
}
