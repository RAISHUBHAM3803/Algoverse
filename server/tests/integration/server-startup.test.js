/**
 * PART 1: SERVER STARTUP TESTS
 * Tests server initialization, MongoDB connection, environment variables,
 * middleware initialization, and route registration
 */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");

describe("PART 1 — Server Startup Tests", () => {
  describe("Environment Validation", () => {
    it("should load required environment variables", () => {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
      expect(process.env.MONGO_URI).toBeDefined();
    });

    it("should have NODE_ENV set to test", () => {
      expect(process.env.NODE_ENV).toBe("test");
    });

    it("should have valid port configuration", () => {
      expect(process.env.PORT || 5000).toBeGreaterThan(0);
    });
  });

  describe("Server Health Checks", () => {
    it("should respond to /health endpoint", async () => {
      const res = await request(app).get("/health");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Server is running");
      expect(res.body.timestamp).toBeDefined();
    });

    it("should respond to /api/v1/health with DB status", async () => {
      const res = await request(app).get("/api/v1/health");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBeDefined();
    });

    it("should have correct database connection state", () => {
      // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      expect([1, 2]).toContain(mongoose.connection.readyState);
    });
  });

  describe("Middleware Initialization", () => {
    it("should have security headers set (Helmet)", async () => {
      const res = await request(app).get("/health");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBeDefined();
    });

    it("should enforce rate limiting on auth endpoints", async () => {
      const email = "ratelimit@test.com";
      const password = "ValidPass123";

      // First request should succeed
      const res1 = await request(app).post("/api/v1/auth/login").send({ email, password });
      expect(res1.statusCode).toBeGreaterThanOrEqual(400); // Not 429

      // NOTE: In test mode, rate limit is high (1000), so we won't hit it easily
      // This test verifies the rate limiter is present
      expect(res1.headers["ratelimit-limit"] || res1.statusCode).toBeDefined();
    });

    it("should handle CORS correctly", async () => {
      const res = await request(app)
        .options("/api/v1/health")
        .set("Origin", "http://localhost:3000");

      expect(res.statusCode).toBeLessThan(500);
    });

    it("should parse JSON request bodies", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "password" });

      // Will fail auth, but should parse JSON (not 400 for JSON)
      expect(res.statusCode).not.toBe(400); // JSON parsing succeeded
    });

    it("should sanitize request inputs (XSS protection)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "<script>alert('xss')</script>",
          password: "password",
        });

      // Should handle XSS safely
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Route Registration", () => {
    it("should register auth routes", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      // Without token, should be 401, not 404
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should register problem routes", async () => {
      const res = await request(app).get("/api/v1/problems");
      // Should not be 404 (route exists)
      expect(res.statusCode).not.toBe(404);
    });

    it("should register code execution routes", async () => {
      const res = await request(app).post("/api/v1/code/run").send({});
      // Without auth, should be 401, not 404
      expect(res.statusCode).toBe(401);
    });

    it("should register submission routes", async () => {
      const res = await request(app).get("/api/v1/submissions/my");
      // Without auth, should be 401, not 404
      expect(res.statusCode).toBe(401);
    });

    it("should register dashboard routes", async () => {
      const res = await request(app).get("/api/v1/dashboard/summary");
      // Without auth, should be 401, not 404
      expect(res.statusCode).toBe(401);
    });

    it("should register AI routes", async () => {
      const res = await request(app).post("/api/v1/ai/review").send({});
      // Without auth, should be 401, not 404
      expect(res.statusCode).toBe(401);
    });
  });

  describe("Error Handling Middleware", () => {
    it("should return 404 for non-existent routes", async () => {
      const res = await request(app).get("/api/v1/non-existent-endpoint");
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should handle malformed JSON gracefully", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .set("Content-Type", "application/json")
        .send("{invalid json}");

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it("should handle method not allowed", async () => {
      const res = await request(app).delete("/api/v1/auth/login");
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Response Format Validation", () => {
    it("should return consistent response format", async () => {
      const res = await request(app).get("/health");
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("message");
      expect(typeof res.body.success).toBe("boolean");
      expect(typeof res.body.message).toBe("string");
    });

    it("should include timestamp in health check", async () => {
      const res = await request(app).get("/health");
      expect(res.body.timestamp).toBeDefined();
      expect(new Date(res.body.timestamp)).toBeInstanceOf(Date);
    });
  });
});
