import { ReducedInstruction } from "@remotion/paths";

export function createLineSegment(points: number[][]): ReducedInstruction {
  switch (points.length) {
    case 2:
      return {
        type: "L",
        x: points[1][0],
        y: points[1][1],
      };

    case 3:
      return {
        type: "Q",
        cpx: points[1][0],
        cpy: points[1][1],
        x: points[2][0],
        y: points[2][1],
      };

    case 4:
      return {
        type: "C",
        cp1x: points[1][0],
        cp1y: points[1][1],
        cp2x: points[2][0],
        cp2y: points[2][1],
        x: points[3][0],
        y: points[3][1],
      };
    default:
      throw new Error(
        "Expected 2, 3 or 4 points for a line segment, got " + points.length
      );
  }
}

export function joinSegments(
  segmentA: ReducedInstruction,
  segmentB: ReducedInstruction
): ReducedInstruction | null {
  if (segmentA.type === segmentB.type) {
    switch (segmentB.type) {
      case "L":
        return {
          type: "L",
          x: segmentB.x,
          y: segmentB.y,
        };
      case "Q": {
        if (segmentA.type !== "Q") {
          throw new Error("expected Q for A segment");
        }
        return {
          type: "Q",
          cpx: (segmentA.cpx + segmentB.cpx) / 2,
          cpy: (segmentA.cpy + segmentB.cpy) / 2,
          x: segmentB.x,
          y: segmentB.y,
        };
      }
      case "C":
        if (segmentA.type !== "C") {
          throw new Error("expected C for A segment");
        }

        return {
          type: "C",
          cp1x: (segmentA.cp1x + segmentB.cp1x) / 2,
          cp1y: (segmentA.cp1y + segmentB.cp1y) / 2,
          cp2x: (segmentA.cp2x + segmentB.cp2x) / 2,
          cp2y: (segmentA.cp2y + segmentB.cp2y) / 2,
          x: segmentB.x,
          y: segmentB.y,
        };
      default: {
        return null;
      }
    }
  }

  return null;
}
