const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/User");

let userToken;

describe("Layer 6 - Dashboard & Analytics Tests", () => {
  beforeAll(async () => {
    const user = await User.create({ name: "Dash User", email: "dash@example.com", password: "Password@123" });
    const login = await request(app).post("/api/v1/auth/login").send({ email: "dash@example.com", password: "Password@123" });
    userToken = login.body.accessToken;
  });

  describe("GET /api/v1/dashboard/summary", () => {
    it("should return dashboard summary metrics", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/summary")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSolved).toBeDefined();
    });
  });

  describe("GET /api/v1/dashboard/difficulty", () => {
    it("should return difficulty breakdown", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/difficulty")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      // API returns an array: [{ difficulty: "Easy", solved, total }, ...]
      expect(Array.isArray(res.body.data)).toBe(true);
      const easy = res.body.data.find((d) => d.difficulty === "Easy");
      expect(easy).toBeDefined();
    });
  });

  describe("GET /api/v1/dashboard/languages", () => {
    it("should return language analytics", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/languages")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(typeof res.body.data).toBe('object');
    });
  });

  describe("GET /api/v1/dashboard/submissions", () => {
    it("should return submission analytics by verdict", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/submissions")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(typeof res.body.data).toBe('object');
    });
  });

  describe("GET /api/v1/dashboard/activity", () => {
    it("should return activity heatmap data", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/activity")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
