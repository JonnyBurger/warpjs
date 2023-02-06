import { Instruction, ReducedInstruction } from "@remotion/paths";

export type Path = Instruction[];

type Transformer = (
  segment: ReducedInstruction,
  i: number,
  path: Path,
  newPath: Path
) => ReducedInstruction[] | false;

export default function transform(path: Path, transformer: Transformer): Path {
  const newPath = [];

  for (let i = 0; i < path.length; i++) {
    const segment = JSON.parse(JSON.stringify(path[i]));
    const result = transformer(segment, i, path, newPath);

    if (result) {
      newPath.push(...result);
    }
  }

  return newPath;
}
