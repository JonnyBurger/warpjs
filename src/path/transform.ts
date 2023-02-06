import { ReducedInstruction } from "@remotion/paths";

export type Path = ReducedInstruction[];

type Transformer = (
  segment: ReducedInstruction,
  i: number,
  path: Path,
  newPath: Path
) => ReducedInstruction[] | false;

export default function transform(path: Path, transformer: Transformer): Path {
  const newPath = [];

  for (let i = 0; i < path.length; i++) {
    const result = transformer(path[i], i, path, newPath);

    if (result) {
      newPath.push(...result);
    }
  }

  return newPath;
}
