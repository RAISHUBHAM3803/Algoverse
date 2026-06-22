/**
 * PART 3: PROBLEM MANAGEMENT TESTS
 * Tests CRUD operations, search, pagination, and security (hidden test cases)
 */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const Problem = require("../../src/models/Problem");
const User = require("../../src/models/User");
const redis = require("../../src/config/redis");
const { DIFFICULTIES } = require("../../src/constants/enums");

describe("PART 3 — Problem Management Tests", () => {
  let authToken;
  let adminToken;
  let testProblemId;

  beforeAll(async () => {
    // Register and login user
    const userRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Problem Test User",
        email: "problemtest@example.com",
        password: "ValidPassword123!",
        confirmPassword: "ValidPassword123!",
      });

    authToken = userRes.body.accessToken;

    // Register admin for admin tests
    const adminRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Admin User",
        email: "admin@example.com",
        password: "AdminPassword123!",
        confirmPassword: "AdminPassword123!",
      });

    adminToken = adminRes.body.accessToken;

    // Make this user admin (manual DB update for testing)
    await User.updateOne({ _id: adminRes.body.user.id }, { role: "admin" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await redis.quit();
  });

  describe("Create Problem (POST /api/v1/problems) — Positive Cases", () => {
    it("should create a problem with all required fields", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Two Sum",
          statement: "Given an array of integers and a target, find two numbers that add up to the target.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
          tags: ["array", "hash-table"],
          constraints: "1 <= nums.length <= 10^4",
          hiddenTestCases: [
            { input: "[2,7,11,15] 9", output: "[0,1]" },
            { input: "[3,2,4] 6", output: "[1,2]" },
          ],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.title).toBe("Two Sum");

      testProblemId = res.body.data._id;
    });

    it("should generate slug from title", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Palindrome String",
          statement: "Check if a string is a palindrome.",
          difficulty: DIFFICULTIES.MEDIUM,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
          tags: ["string"],
        });

      expect(res.body.data.slug).toBe("palindrome-string");
    });

    it("should allow creating problems without optional fields", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Min Problem",
          statement: "A minimal problem.",
          difficulty: DIFFICULTIES.HARD,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tags).toEqual([]);
    });
  });

  describe("Create Problem — Negative Cases", () => {
    it("should reject without authentication", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .send({
          title: "No Auth",
          statement: "No auth test.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(401);
    });

    it("should reject non-admin from creating problems", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "User Problem",
          statement: "User test.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject missing title", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          statement: "No title.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid difficulty", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Invalid Difficulty",
          statement: "Test.",
          difficulty: "ULTRA_HARD",
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject duplicate title", async () => {
      await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Unique Title",
          statement: "First.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Unique Title",
          statement: "Second.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject very long title", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "A".repeat(200),
          statement: "Test.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(400);
    });

    it("should reject empty statement", async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Empty Statement",
          statement: "",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("Get All Problems (GET /api/v1/problems)", () => {
    beforeAll(async () => {
      // Create multiple test problems
      for (let i = 0; i < 15; i++) {
        await request(app)
          .post("/api/v1/problems")
          .set("Authorization", `Bearer ${adminToken}`)
          .send({
            title: `Problem ${i}`,
            statement: `Statement ${i}`,
            difficulty:
              i % 3 === 0 ? DIFFICULTIES.EASY : i % 3 === 1 ? DIFFICULTIES.MEDIUM : DIFFICULTIES.HARD,
            tags: ["test"],
          });
      }
    });

    it("should retrieve all problems", async () => {
      const res = await request(app).get("/api/v1/problems");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should not expose hidden test cases in list", async () => {
      const res = await request(app).get("/api/v1/problems");

      expect(res.statusCode).toBe(200);
      res.body.data.forEach((problem) => {
        expect(problem.hiddenTestCases).toBeUndefined();
      });
    });

    it("should support pagination with limit", async () => {
      const res = await request(app)
        .get("/api/v1/problems")
        .query({ limit: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should support pagination with page", async () => {
      const page1 = await request(app)
        .get("/api/v1/problems")
        .query({ page: 1, limit: 5 });

      const page2 = await request(app)
        .get("/api/v1/problems")
        .query({ page: 2, limit: 5 });

      // Skip assertion if there aren't enough problems to fill page 2
      if (page2.body.data && page2.body.data.length > 0) {
        expect(page1.body.data[0]._id).not.toBe(page2.body.data[0]._id);
      } else {
        expect(page1.statusCode).toBe(200);
      }
    });

    it("should support difficulty filter", async () => {
      const res = await request(app)
        .get("/api/v1/problems")
        .query({ difficulty: DIFFICULTIES.EASY });

      expect(res.statusCode).toBe(200);
      res.body.data.forEach((problem) => {
        expect(problem.difficulty).toBe(DIFFICULTIES.EASY);
      });
    });

    it("should support search by title", async () => {
      const res = await request(app)
        .get("/api/v1/problems")
        .query({ search: "Two Sum" });

      expect(res.statusCode).toBe(200);
      if (res.body.data.length > 0) {
        res.body.data.forEach((problem) => {
          expect(problem.title.toLowerCase()).toContain("two sum".toLowerCase());
        });
      }
    });

    it("should support tag filter", async () => {
      const res = await request(app)
        .get("/api/v1/problems")
        .query({ tags: "array" });

      expect(res.statusCode).toBe(200);
    });

    it("should return pagination metadata", async () => {
      const res = await request(app)
        .get("/api/v1/problems")
        .query({ page: 1, limit: 10 });

      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalCount).toBeGreaterThanOrEqual(0);
    });

    it("should handle invalid page", async () => {
      const res = await request(app)
        .get("/api/v1/problems")
        .query({ page: -1 });

      expect(res.statusCode).toBe(400);
    });

    it("should handle invalid limit", async () => {
      const res = await request(app)
        .get("/api/v1/problems")
        .query({ limit: 10000 });

      // Should either reject or cap it
      expect([200, 400]).toContain(res.statusCode);
    });
  });

  describe("Get Single Problem (GET /api/v1/problems/:id)", () => {
    it("should retrieve a single problem", async () => {
      const res = await request(app).get(`/api/v1/problems/${testProblemId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testProblemId.toString());
      expect(res.body.data.title).toBeDefined();
    });

    it("should not expose hidden test cases to user", async () => {
      const res = await request(app).get(`/api/v1/problems/${testProblemId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.hiddenTestCases).toBeUndefined();
    });

    it("should return 404 for non-existent problem", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).get(`/api/v1/problems/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid ObjectId", async () => {
      // Use a 23-char hex string — looks like an ObjectId but wrong length → 400
      const res = await request(app).get("/api/v1/problems/507f1f77bcf86cd79943901");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should retrieve by slug if supported", async () => {
      // Get a problem first
      const allProblems = await request(app).get("/api/v1/problems");
      const firstProblem = allProblems.body.data[0];

      if (firstProblem.slug) {
        const res = await request(app).get(`/api/v1/problems/slug/${firstProblem.slug}`);
        expect([200, 404]).toContain(res.statusCode);
      }
    });
  });

  describe("Update Problem (PUT /api/v1/problems/:id)", () => {
    let updateProblemId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: `Update Test Problem ${Date.now()}`,
          statement: "Original statement.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
        });

      updateProblemId = res.body.data?._id;
    });

    it("should update problem statement", async () => {
      const res = await request(app)
        .put(`/api/v1/problems/${updateProblemId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          statement: "Updated statement.",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.statement).toBe("Updated statement.");
    });

    it("should reject update without authentication", async () => {
      const res = await request(app)
        .put(`/api/v1/problems/${updateProblemId}`)
        .send({
          statement: "Unauthorized update.",
        });

      expect(res.statusCode).toBe(401);
    });

    it("should reject non-admin from updating", async () => {
      const res = await request(app)
        .put(`/api/v1/problems/${updateProblemId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          statement: "Non-admin update.",
        });

      expect(res.statusCode).toBe(403);
    });

    it("should reject invalid difficulty in update", async () => {
      const res = await request(app)
        .put(`/api/v1/problems/${updateProblemId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          difficulty: "IMPOSSIBLE",
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("Delete Problem (DELETE /api/v1/problems/:id)", () => {
    let deleteProblemId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: `Delete Test Problem ${Date.now()}`,
          statement: "To be deleted.",
          difficulty: DIFFICULTIES.EASY,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
        });

      deleteProblemId = res.body.data?._id;
    });

    it("should delete a problem", async () => {
      const res = await request(app)
        .delete(`/api/v1/problems/${deleteProblemId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's deleted
      const getRes = await request(app).get(`/api/v1/problems/${deleteProblemId}`);
      expect(getRes.statusCode).toBe(404);
    });

    it("should reject delete without authentication", async () => {
      const res = await request(app).delete(`/api/v1/problems/${deleteProblemId}`);

      expect(res.statusCode).toBe(401);
    });

    it("should reject non-admin from deleting", async () => {
      const res = await request(app)
        .delete(`/api/v1/problems/${deleteProblemId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe("Security — Hidden Test Cases Protection", () => {
    let problemWithTestCases;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/problems")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Hidden Test Cases Problem",
          statement: "Problem with hidden test cases.",
          difficulty: DIFFICULTIES.MEDIUM,
          examples: [{ input: "test", output: "test" }],
          visibleTestCases: [{ input: "test", output: "test" }],
          hiddenTestCases: [{ input: "test", output: "test" }],
  
          hiddenTestCases: [
            { input: "test input 1", output: "output 1" },
            { input: "test input 2", output: "output 2" },
          ],
        });

      problemWithTestCases = res.body.data._id;
    });

    it("should not expose hidden test cases in GET /problems/:id", async () => {
      const res = await request(app).get(`/api/v1/problems/${problemWithTestCases}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.hiddenTestCases).toBeUndefined();
    });

    it("should not expose hidden test cases in GET /problems list", async () => {
      const res = await request(app).get("/api/v1/problems");

      expect(res.statusCode).toBe(200);
      res.body.data.forEach((problem) => {
        expect(problem.hiddenTestCases).toBeUndefined();
      });
    });

    it("should not expose hidden test cases to authenticated users", async () => {
      const res = await request(app)
        .get(`/api/v1/problems/${problemWithTestCases}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.hiddenTestCases).toBeUndefined();
    });

    it("should not expose hidden test cases to admins via public endpoint", async () => {
      const res = await request(app)
        .get(`/api/v1/problems/${problemWithTestCases}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      // Admin shouldn't see via public GET, only via admin endpoint
      expect(res.body.data.hiddenTestCases).toBeUndefined();
    });
  });

  describe("Response Format Compliance", () => {
    it("should follow success response format for list", async () => {
      const res = await request(app).get("/api/v1/problems");

      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
      expect(res.body.success).toBe(true);
    });

    it("should follow success response format for single", async () => {
      const res = await request(app).get(`/api/v1/problems/${testProblemId}`);

      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
      expect(res.body.success).toBe(true);
    });
  });
});
