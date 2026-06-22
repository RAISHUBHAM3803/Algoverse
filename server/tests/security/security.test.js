const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/User");

let userToken;

describe("Part 9 & 11 - Security & Edge Case Tests", () => {
  beforeAll(async () => {
    const user = await User.create({ name: "Sec User", email: "sec@example.com", password: "Password@123" });
    const login = await request(app).post("/api/v1/auth/login").send({ email: "sec@example.com", password: "Password@123" });
    userToken = login.body.accessToken;
  });

  describe("Security: JWT Bypass & Authorization", () => {
    it("should reject access without token", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      expect(res.statusCode).toBe(401);
    });

    it("should reject access with invalid token", async () => {
      const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer invalid_token_xyz");
      expect(res.statusCode).toBe(401);
    });

    it("should reject access with malformed token header", async () => {
      const res = await request(app).get("/api/v1/auth/me").set("Authorization", "invalid_token_xyz");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("Security: Injection & Payload Manipulation", () => {
    it("should handle invalid ObjectIds gracefully", async () => {
      const res = await request(app)
        .get("/api/v1/problems/invalid_id_format")
        .set("Authorization", `Bearer ${userToken}`);
      
      expect([400, 404, 500]).toContain(res.statusCode); // Depending on how error handler catches CastError
    });
  });

  describe("Edge Cases: Payloads & Limits", () => {
    it("should handle extremely large payloads safely", async () => {
      const hugeString = "A".repeat(1000000); // 1MB string
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: hugeString,
          email: "huge@example.com",
          password: "Password@123",
          confirmPassword: "Password@123"
        });

      // Should hit body parser limits (e.g. 50kb limit) or validation
      expect(res.statusCode).toBeGreaterThanOrEqual(400); 
    });

    it("should handle invalid pagination values", async () => {
      const res = await request(app)
        .get("/api/v1/problems?page=-1&limit=abc")
        .set("Authorization", `Bearer ${userToken}`);
      
      // Should default to page 1 limit 10 or throw 400
      expect([200, 400]).toContain(res.statusCode);
    });
  });
});
