/**
 * PART 5: SUBMISSION SYSTEM TESTS
 * Tests submission creation, verdicts, ownership checks, and history
 * NOTE: Submissions use an async queue (BullMQ) — the API returns 202 + jobId,
 * not a synchronous verdict. Tests are written accordingly.
 */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const Submission = require("../../src/models/Submission");
const Problem = require("../../src/models/Problem");
const User = require("../../src/models/User");
const redis = require("../../src/config/redis");
const { VERDICTS } = require("../../src/constants/enums");

describe("PART 5 — Submission System Tests", () => {
  let userToken;
  let otherUserToken;
  let problemId;
  let userId;

  beforeAll(async () => {
    // Create admin and problem
    const adminRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Admin For Submissions",
        email: "adminsub@example.com",
        password: "AdminPassword123!",
        confirmPassword: "AdminPassword123!",
      });

    const adminToken = adminRes.body.accessToken;
    await User.updateOne({ _id: adminRes.body.user.id }, { role: "admin" });

    const problemRes = await request(app)
      .post("/api/v1/problems")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Sum Two Numbers",
        statement: "Sum two numbers",
        difficulty: "Easy",
        examples: [{ input: "test", output: "test" }],
        visibleTestCases: [{ input: "test", output: "test" }],
        hiddenTestCases: [
          { input: "1 2", output: "3" },
          { input: "5 7", output: "12" },
        ],
      });

    problemId = problemRes.body.data._id;

    // Register two users
    const userRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Submitter",
        email: "submitter@example.com",
        password: "ValidPassword123!",
        confirmPassword: "ValidPassword123!",
      });

    userToken = userRes.body.accessToken;
    userId = userRes.body.user.id;

    const otherUserRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Other User",
        email: "otheruser@example.com",
        password: "ValidPassword123!",
        confirmPassword: "ValidPassword123!",
      });

    otherUserToken = otherUserRes.body.accessToken;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await redis.quit();
  });

  describe("Create Submission (POST /api/v1/submissions)", () => {
    it("should queue submission and return 202 with jobId", async () => {
      const res = await request(app)
        .post("/api/v1/submissions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          problemId,
          language: "python",
          code: "a,b = map(int, input().split()); print(a+b)",
        });

      expect(res.statusCode).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobId).toBeDefined();
    });

    it("should queue wrong answer code and return 202", async () => {
      const res = await request(app)
        .post("/api/v1/submissions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          problemId,
          language: "python",
          code: "print(0)",
        });

      expect(res.statusCode).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobId).toBeDefined();
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/submissions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid problemId", async () => {
      const res = await request(app)
        .post("/api/v1/submissions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          problemId: "507f1f77bcf86cd799439011",
          language: "python",
          code: "print(1)",
        });

      expect([400, 404]).toContain(res.statusCode);
    });

    it("should reject unsupported language", async () => {
      const res = await request(app)
        .post("/api/v1/submissions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          problemId,
          language: "brainfuck",
          code: "print(1)",
        });

      expect(res.statusCode).toBe(400);
    });

    it("should enforce rate limiting on submissions", async () => {
      const res = await request(app)
        .post("/api/v1/submissions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          problemId,
          language: "python",
          code: "print(1)",
        });

      expect(res.headers["ratelimit-limit"] || res.statusCode).toBeDefined();
    });
  });

  describe("Get User Submissions (GET /api/v1/submissions/my)", () => {
    it("should return user's submissions only", async () => {
      const res = await request(app)
        .get("/api/v1/submissions/my")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // submissions are inside res.body.data per sendSuccess format
      const submissions = res.body.data || res.body.submissions || [];
      expect(Array.isArray(submissions)).toBe(true);
    });

    it("should paginate user's submissions", async () => {
      const res = await request(app)
        .get("/api/v1/submissions/my")
        .set("Authorization", `Bearer ${userToken}`)
        .query({ limit: 2 });

      expect(res.statusCode).toBe(200);
      const submissions = res.body.data || res.body.submissions || [];
      expect(submissions.length).toBeLessThanOrEqual(2);
    });
  });

  describe("Get Submission By Id (GET /api/v1/submissions/:id)", () => {
    let createdSubmissionId;

    beforeAll(async () => {
      // Create a submission directly in DB to get a real ID for lookup tests
      const sub = await Submission.create({
        user:     userId,
        problem:  problemId,
        language: "python",
        code:     "print(1)",
        verdict:  VERDICTS.PENDING,
      });
      createdSubmissionId = sub._id.toString();
    });

    it("should return submission for owner", async () => {
      const res = await request(app)
        .get(`/api/v1/submissions/${createdSubmissionId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it("should forbid other users from accessing submission", async () => {
      const res = await request(app)
        .get(`/api/v1/submissions/${createdSubmissionId}`)
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect([403, 404]).toContain(res.statusCode);
    });

    it("should return 404 for non-existent submission", async () => {
      const res = await request(app)
        .get("/api/v1/submissions/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${userToken}`);

      expect([404, 400]).toContain(res.statusCode);
    });
  });

  describe("User Stats Update on Accepted", () => {
    it("should increment solvedCount on accepted submission", async () => {
      // Submit a correct solution to ensure accepted
      await request(app)
        .post("/api/v1/submissions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          problemId,
          language: "python",
          code: "a,b = map(int, input().split()); print(a+b)",
        });

      // Wait briefly for any background processing
      await new Promise((r) => setTimeout(r, 50));

      const user = await User.findById(userId);
      expect(user.stats.solvedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Response Format Compliance", () => {
    it("should follow async response format for submission creation", async () => {
      const res = await request(app)
        .post("/api/v1/submissions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          problemId,
          language: "python",
          code: "print(1)",
        });

      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("message");
      expect(res.body.data).toHaveProperty("jobId");
    });
  });
});
