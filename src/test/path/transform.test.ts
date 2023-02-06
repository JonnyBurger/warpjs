import assert from "assert";
import { describe, it } from "vitest";
import transform from "../../path/transform";

describe("transform()", function () {
  it("should not transform if transformer returns the same segment", function () {
    assert.deepEqual(
      [
        { type: "M", x: 0, y: 1 },
        { type: "L", x: 2, y: 3 },
      ],
      transform(
        [
          { type: "M", x: 0, y: 1 },
          { type: "L", x: 2, y: 3 },
        ],
        (segment) => [segment]
      )
    );
  });

  it("should extend the path when transformer returns array of segments", function () {
    assert.deepEqual(
      [
        { type: "M", x: 0, y: 1 },
        { type: "M", x: 0, y: 1 },
        { type: "L", x: 2, y: 3 },
      ],
      transform(
        [
          { type: "M", x: 0, y: 1 },
          { type: "L", x: 2, y: 3 },
        ],
        (segment) => (segment.type === "M" ? [segment, segment] : [segment])
      )
    );
  });

  it("should remove a segment when transformer returns a falsy value", function () {
    assert.deepEqual(
      [{ type: "L", x: 2, y: 3 }],
      transform(
        [
          { type: "M", x: 0, y: 1 },
          { type: "L", x: 2, y: 3 },
        ],
        (segment) => (segment.type === "M" ? false : [segment])
      )
    );
  });
});
