const segmentSchemas = {
  m: ["x", "y"],
  z: [],
  l: ["x", "y"],
  h: ["x"],
  v: ["y"],
  c: ["x1", "y1", "x2", "y2", "x", "y"],
  s: ["x2", "y2", "x", "y"],
  q: ["x1", "y1", "x", "y"],
  t: ["x", "y"],
  a: ["rx", "ry", "xRotation", "largeArc", "sweep", "x", "y"],
} as const;

export const pointGroups = [
  ["x1", "y1"],
  ["x2", "y2"],
  ["x", "y"],
] as const;

const drawingCmdExpr = /[lhvcsqta]/;

export type SegmentType = keyof typeof segmentSchemas;
type Extended = Record<number, number[]>;

export type Segment = {
  type?: SegmentType;
  relative?: boolean;
  extended?: Extended;
  x?: number;
  x1?: number;
  x2?: number;
  y?: number;
  y1?: number;
  y2?: number;
  rx?: number;
  ry?: number;
  xRotation?: number;
  largeArc?: boolean;
  sweep?: boolean;
};

export function getSegmentSchema(type: SegmentType) {
  return segmentSchemas[type.toLowerCase() as SegmentType];
}

export function isDrawingSegment(segment: Segment): boolean {
  return drawingCmdExpr.test(segment.type as SegmentType);
}

export function createLineSegment(points: number[][]) {
  const segment: Segment = { relative: false };

  switch (points.length) {
    case 2:
      {
        segment.type = "l";
      }
      break;
    case 3:
      {
        segment.type = "q";
      }
      break;
    case 4:
      {
        segment.type = "c";
      }
      break;
    default:
      return false;
  }

  for (let i = 1; i < points.length; i++) {
    const g = (i < points.length - 1 ? i : pointGroups.length) - 1;
    const [x, y] = pointGroups[g];

    segment[x] = points[i][0];
    segment[y] = points[i][1];

    if (points[i].length > 2) {
      segment.extended = segment.extended || {};
      segment.extended[g] = points[i].slice(2);
    }
  }

  return segment;
}

export function joinSegments(segmentA: Segment, segmentB: Segment) {
  if (
    segmentA.type === segmentB.type &&
    segmentA.relative === segmentB.relative
  ) {
    const { type, relative, x, y } = segmentB;
    const bothExtended = !!segmentA.extended && !!segmentB.extended;
    const extended: Extended = {};
    const segment: Segment = { type, relative, x, y, extended };

    function setExtended(pointsA: number[], pointsB: number[], type: number) {
      if (pointsA && pointsB) {
        const points = [];
        const pointCount = Math.min(pointsA.length, pointsB.length);

        for (let i = 0; i < pointCount; i++) {
          points.push((pointsA[i] + pointsB[i]) / 2);
        }

        if (segment.extended) {
          segment.extended[type] = points;
        }
      }
    }

    switch (type) {
      case "l":
        break;
      case "q":
        {
          segment.x1 = (((segmentA.x1 as number) + segmentB.x1!) as number) / 2;
          segment.y1 = (((segmentA.y1 as number) + segmentB.y1!) as number) / 2;

          if (bothExtended) {
            setExtended(segmentA.extended![0], segmentB.extended![0], 0);
          }
        }
        break;
      case "c":
        {
          segment.x1 = (segmentA.x1! + segmentA.x2!) / 2;
          segment.y1 = (segmentA.y1! + segmentA.y2!) / 2;
          segment.x2 = (segmentB.x1! + segmentB.x2!) / 2;
          segment.y2 = (segmentB.y1! + segmentB.y2!) / 2;

          if (bothExtended) {
            setExtended(segmentA.extended![0], segmentA.extended![1], 0);
            setExtended(segmentB.extended![0], segmentB.extended![1], 1);
          }
        }
        break;
      default: {
        return false;
      }
    }

    if (segmentB.extended && segmentB.extended[2]) {
      extended[2] = segmentB.extended[2];
    }

    return segment;
  }

  return false;
}
