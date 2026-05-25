/** @format */

import { render, screen } from "@testing-library/react";
import Input from "../Input";

test("renders label and error message", () => {
  render(
    <Input error="Required">
      <Input.Label required>Full Name</Input.Label>
      <Input.Field id="fullName" />
      <Input.Error />
    </Input>,
  );

  expect(screen.getByText("Full Name")).toBeInTheDocument();
  expect(screen.getByText("Required")).toBeInTheDocument();
});
