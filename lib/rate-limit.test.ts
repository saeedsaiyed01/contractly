import { describe, expect, it } from "vitest";

import { consumeSubmitRateToken } from "@/lib/rate-limit";

describe("consumeSubmitRateToken", () => {
  it("allows up to the configured limit per window", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 40; i++) {
      expect(consumeSubmitRateToken(key)).toBe(true);
    }
    expect(consumeSubmitRateToken(key)).toBe(false);
  });
});
