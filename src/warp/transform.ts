import { ReducedInstruction } from "@remotion/paths";
import pathTransform, { Path } from "../path/transform";
import { PointTransformer } from "../types";

export default function transform(
  path: Path,
  transformers: PointTransformer[]
) {
  return pathTransform(path, (segment): ReducedInstruction[] => {
    if (segment.type === "L") {
      const newPoints = transformers.reduce(
        (points, transformer) => transformer(points),
        [segment.x, segment.y]
      );
      return [
        {
          type: "L",
          x: newPoints[0],
          y: newPoints[1],
        },
      ];
    }
    if (segment.type === "Q") {
      const newXPoints = transformers.reduce(
        (points, transformer) => transformer(points),
        [segment.x, segment.y]
      );
      const newCpPoints = transformers.reduce(
        (points, transformer) => transformer(points),
        [segment.cpx, segment.cpy]
      );
      return [
        {
          type: "Q",
          x: newXPoints[0],
          y: newXPoints[1],
          cpx: newCpPoints[0],
          cpy: newCpPoints[1],
        },
      ];
    }
    if (segment.type === "C") {
      const newXPoints = transformers.reduce(
        (points, transformer) => transformer(points),
        [segment.x, segment.y]
      );
      const newCp1Points = transformers.reduce(
        (points, transformer) => transformer(points),
        [segment.cp1x, segment.cp1y]
      );
      const newCp2Points = transformers.reduce(
        (points, transformer) => transformer(points),
        [segment.cp2x, segment.cp2y]
      );
      return [
        {
          type: "C",
          x: newXPoints[0],
          y: newXPoints[1],
          cp1x: newCp1Points[0],
          cp1y: newCp1Points[1],
          cp2x: newCp2Points[0],
          cp2y: newCp2Points[1],
        },
      ];
    }

    // TODO: Could interpolate Z as well
    return [segment];
  });
}
