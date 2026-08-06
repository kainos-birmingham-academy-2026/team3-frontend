import { describe, it, expect } from "vitest";
import router from "../../src/routes/jobRoleRouter";

describe("routes", () => {
  it("registers GET /health", () => {
    const hasHealth = router.stack.some(
      (layer) => layer.route?.path === "/health"
    );

    expect(hasHealth).toBe(true);
  });
});

