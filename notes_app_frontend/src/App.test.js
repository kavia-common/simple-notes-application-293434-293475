import { render } from "@testing-library/react";
import App from "./App";

// Basic smoke test (can be extended for actual notes tests)
/* PUBLIC_INTERFACE */
test("renders app without crashing", () => {
  render(<App />);
});
