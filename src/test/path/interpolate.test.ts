import { describe, it } from "vitest";
import { split } from "../../path/interpolate";
import { approxDeepEqual } from "../approx-deep-equal";

describe("split()", function () {
  it("should split straight line", function () {
    approxDeepEqual(
      [
        [
          [10, 10],
          [15, 20],
        ],
        [
          [15, 20],
          [20, 30],
        ],
      ],
      split([
        [10, 10],
        [20, 30],
      ]),
      0.01
    );
  });

  it("should split quadratic bezier", function () {
    approxDeepEqual(
      [
        [
          [10, 10],
          [15, 10],
          [20, 10],
        ],
        [
          [20, 10],
          [25, 10],
          [30, 10],
        ],
      ],
      split([
        [10, 10],
        [20, 10],
        [30, 10],
      ]),
      0.01
    );
  });
});
