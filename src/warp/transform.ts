import { ReducedInstruction } from "@remotion/paths";
import pathTransform, { Path } from "../path/transform";
export type PointTransformer = (point: { x: number; y: number }) => {
  x: number;
  y: number;
};

export default function transform(path: Path, transformer: PointTransformer) {
  return pathTransform(path, (segment): ReducedInstruction[] => {
    if (segment.type === "L") {
      const { x, y } = transformer({ x: segment.x, y: segment.y });
      return [
        {
          type: "L",
          x,
          y,
        },
      ];
    }
    if (segment.type === "Q") {
      const { x, y } = transformer({ x: segment.x, y: segment.y });
      const { x: cpx, y: cpy } = transformer({
        x: segment.cpx,
        y: segment.cpy,
      });
      return [
        {
          type: "Q",
          x,
          y,
          cpx,
          cpy,
        },
      ];
    }
    if (segment.type === "C") {
      const { x, y } = transformer({ x: segment.x, y: segment.y });
      const { x: cp1x, y: cp1y } = transformer({
        x: segment.cp1x,
        y: segment.cp1y,
      });
      const { x: cp2x, y: cp2y } = transformer({
        x: segment.cp2x,
        y: segment.cp2y,
      });

      return [
        {
          type: "C",
          x,
          y,
          cp1x,
          cp1y,
          cp2x,
          cp2y,
        },
      ];
    }

    if (segment.type === "M") {
      const { x, y } = transformer({ x: segment.x, y: segment.y });
      return [
        {
          type: "M",
          x,
          y,
        },
      ];
    }

    return [segment];
  });
}
