import { ReducedInstruction } from "@remotion/paths";
import pathTransform, { Path } from "../path/transform";
import { PointTransformer } from "../types";

export default function transform(path: Path, transformer: PointTransformer) {
  return pathTransform(path, (segment): ReducedInstruction[] => {
    if (segment.type === "L") {
      const [x, y] = transformer([segment.x, segment.y]);
      return [
        {
          type: "L",
          x,
          y,
        },
      ];
    }
    if (segment.type === "Q") {
      const [x, y] = transformer([segment.x, segment.y]);
      const [cpx, cpy] = transformer([segment.cpx, segment.cpy]);
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
      const [x, y] = transformer([segment.x, segment.y]);
      const [cp1x, cp1y] = transformer([segment.cp1x, segment.cp1y]);
      const [cp2x, cp2y] = transformer([segment.cp2x, segment.cp2y]);

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

    // TODO: Could interpolate Z as well
    return [segment];
  });
}
