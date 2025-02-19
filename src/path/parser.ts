import { getSegmentSchema, Segment, SegmentType } from "./utils";

const segmentExpr = /([mzlhvcsqta])([^mzlhvcsqta]*)/gi;
const numberExpr = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;

export default function parser(pathString: string) {
  const pathData = [];

  let segmentMatch;
  segmentExpr.lastIndex = 0;

  while ((segmentMatch = segmentExpr.exec(pathString))) {
    const type = segmentMatch[1].toLowerCase() as SegmentType;
    const numbers = (segmentMatch[2].match(numberExpr) || []).map(parseFloat);
    const relative = type === segmentMatch[1];

    const schema = getSegmentSchema(type as SegmentType);

    if (numbers.length < schema.length) {
      throw new Error(
        `Malformed path data: type "${type}" has ${numbers.length} arguments, expected ${schema.length}`
      );
    }

    if (schema.length > 0) {
      if (numbers.length % schema.length !== 0) {
        throw new Error(
          `Malformed path data: type "${type}" has ${
            numbers.length
          } arguments, ${numbers.length % schema.length} too many`
        );
      }

      for (let i = 0; i < numbers.length / schema.length; i++) {
        const segmentData: Segment = { type, relative };

        for (let j = 0; j < schema.length; j++) {
          // @ts-ignore
          segmentData[schema[j]] = numbers[i * schema.length + j];
        }

        pathData.push(segmentData);
      }
    } else {
      pathData.push({ type, relative });
    }
  }

  return pathData;
}
