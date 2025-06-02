import * as React from "npm:react";
import { Hr as ReactEmailHr } from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

const Hr = () => <ReactEmailHr style={hrStyle} />;
export default Hr;

const hrStyle = {
  margin: "32px 0",
  borderColor: assignments.colors.border.elevated,
  borderTopWidth: 1,
};
