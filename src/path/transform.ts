import { Segment } from "./utils";

export type Path = Segment[];

export type Transformer = (
  segment: Segment,
  i: number,
  path: Path,
  newPath: Path
) => Segment | Segment[] | false;

export default function transform(path: Path, transformer: Transformer): Path {
  const newPath = [];

  for (let i = 0; i < path.length; i++) {
    const segment = JSON.parse(JSON.stringify(path[i]));
    const result = transformer(segment, i, path, newPath);

    if (Array.isArray(result)) {
      newPath.push(...result);
    } else if (result) {
      newPath.push(result);
    }
  }

  return newPath;
}
