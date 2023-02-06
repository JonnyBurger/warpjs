import assert from "assert";

function approximately(
  actual: unknown,
  expected: unknown,

  delta: number,
  message: string
) {
  if (typeof actual === "number" && typeof expected === "number") {
    const diff = Math.abs(actual - expected);
    const larger = Math.max(diff, delta);

    assert.equal(larger, delta, message);
  } else {
    assert.equal(actual, expected, message);
  }
}

function deepEqual(
  actual: object,
  expected: object,
  message: string,
  comparator = assert.equal
) {
  for (let key of Object.keys(expected)) {
    assert.ok(key in actual, message);
  }

  for (let key of Object.keys(actual)) {
    assert.ok(key in expected, message);

    // @ts-expect-error
    if (typeof actual[key] === "object" && typeof expected[key] === "object") {
      // @ts-expect-error
      deepEqual(actual[key], expected[key], message, comparator);
    } else {
      // @ts-expect-error
      comparator(actual[key], expected[key], message);
    }
  }
}

export function approxDeepEqual(
  actual: object,
  expected: object,
  delta: number,
  message: string = "not equal"
) {
  deepEqual(actual, expected, message, (a, b) =>
    approximately(a, b, delta, message)
  );
}
