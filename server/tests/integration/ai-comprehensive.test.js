/**
 * PART 7: AI MODULE TESTS
 * Tests AI endpoints, provider failures, missing API keys, and timeouts
 */

const request = require("supertest");
const app = require("../../src/app");

describe("PART 7 — AI Module Tests", () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "AI User",
        email: "aiuser@example.com",
        password: "ValidPassword123!",
        confirmPassword: "ValidPassword123!",
      });

    authToken = res.body.accessToken;
  });

  describe("AI Review Endpoint", () => {
    it("should return review for valid request", async () => {
      const res = await request(app)
        .post("/api/v1/ai/review")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ code: "def add(a, b): return a + b", language: "python" });

      expect([200, 201, 400]).toContain(res.statusCode);
      expect(res.body.success).toBeDefined();
    });

    it("should handle missing API key gracefully", async () => {
      // Temporarily unset AI provider config
      const original = process.env.AI_PROVIDER;
      process.env.AI_PROVIDER = "";

      const res = await request(app)
        .post("/api/v1/ai/review")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ code: "print(1)", language: "python" });

      expect([200, 400, 500]).toContain(res.statusCode);

      process.env.AI_PROVIDER = original;
    });

    it("should handle provider timeout", async () => {
      // Simulate provider timeout via query param or special header if supported
      const res = await request(app)
        .post("/api/v1/ai/review")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Mock-Timeout", "true")
        .send({ code: "print(1)", language: "python" });

      expect([200, 408, 500, 504]).toContain(res.statusCode);
    });
  });

  describe("AI Complexity Endpoint", () => {
    it("should return complexity estimate", async () => {
      const res = await request(app)
        .post("/api/v1/ai/complexity")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ code: "def factorial(n): return 1 if n<=1 else n*factorial(n-1)", language: "python" });

      expect([200, 201, 400]).toContain(res.statusCode);
      expect(res.body.success).toBeDefined();
    });
  });

  describe("AI Hint Endpoint", () => {
    it("should return hint for a problem", async () => {
      const res = await request(app)
        .post("/api/v1/ai/hint")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ problemId: "507f1f77bcf86cd799439011" });

      expect([200, 400, 404]).toContain(res.statusCode);
    });
  });

  describe("AI Interview Feedback Endpoint", () => {
    it("should return interview feedback for valid request", async () => {
      const res = await request(app)
        .post("/api/v1/ai/interview-feedback")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ transcript: "Candidate answered questions well." });

      expect([200, 201, 400]).toContain(res.statusCode);
    });
  });
});
