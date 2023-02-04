import { getSegmentSchema, Segment, SegmentType } from "./utils";

export default function encoder(pathData: Segment[], precision = 2) {
  let prevType: boolean | string = false;
  let magnitude = 10 ** precision;

  return pathData
    .map(function (segment) {
      const output = [];
      const outputType = segment.relative
        ? (segment.type as SegmentType)
        : segment.type!.toUpperCase();
      let first = prevType !== outputType;

      const schema = getSegmentSchema(segment.type as SegmentType);

      if (first) {
        output.push(outputType);
        prevType = outputType;
      }

      for (let property of schema) {
        const value = segment[property];
        let outputValue;

        switch (typeof value) {
          case "boolean":
            {
              outputValue = Number(value) | 0;
            }
            break;
          case "number":
            {
              outputValue = ((value * magnitude) | 0) / magnitude;
            }
            break;
          default:
            throw new Error("Invalid path data");
        }

        if (!first) {
          output.push(" ");
        }

        output.push(outputValue);
        first = false;
      }

      return output.join("");
    })
    .join("");
}
