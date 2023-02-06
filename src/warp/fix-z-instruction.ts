import { ReducedInstruction } from "@remotion/paths";

// Add a line from second to last point to last point and then keep Z so it can be transformed as well
export const fixZInstruction = (
  instructions: ReducedInstruction[]
): ReducedInstruction[] => {
  let prevX = 0;
  let prevY = 0;

  return instructions
    .map((instruction): ReducedInstruction[] => {
      if (instruction.type === "Z") {
        return [
          {
            type: "L",
            x: prevX,
            y: prevY,
          },
          {
            type: "Z",
          },
        ];
      }
      if (instruction.type === "M") {
        prevX = instruction.x;
        prevY = instruction.y;
      }

      return [instruction];
    })
    .flat(1);
};
