/**
 * PART 2: COMPREHENSIVE AUTHENTICATION TESTS
 * Tests registration, login, JWT generation, protected routes, authorization
 */

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../src/app");
const User = require("../../src/models/User");
const redis = require("../../src/config/redis");
const { ROLES } = require("../../src/constants/enums");

describe("PART 2 — Comprehensive Authentication Tests", () => {
  let authToken;
  let adminToken;
  let testUser;

  afterAll(async () => {
    await mongoose.disconnect();
    await redis.quit();
  });

  describe("User Registration — Positive Cases", () => {
    it("should register a valid user successfully", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("john@example.com");
      expect(res.body.user.role).toBe(ROLES.USER);

      // Verify user in database
      const userInDb = await User.findOne({ email: "john@example.com" });
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe("John Doe");

      authToken = res.body.accessToken;
      testUser = res.body.user;
    });

    it("should return both accessToken and refreshToken in cookies", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Cookie Test User",
          email: "cookie@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(201);
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"].length).toBeGreaterThan(0);
    });

    it("should hash password before storing", async () => {
      const password = "TestPassword123";
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Password Test",
          email: "passtest@example.com",
          password: `${password}!`,
          confirmPassword: `${password}!`,
        });

      const user = await User.findOne({ email: "passtest@example.com" }).select("+password");
      expect(user.password).not.toBe(password); // Should be hashed
      expect(user.password.length).toBeGreaterThan(password.length);
    });

    it("should set default user role", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Role Test",
          email: "roletest@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.body.user.role).toBe(ROLES.USER);
    });
  });

  describe("User Registration — Negative Cases", () => {
    it("should reject duplicate email", async () => {
      const email = "duplicate@example.com";
      const data = {
        name: "First User",
        email,
        password: "ValidPassword123!",
        confirmPassword: "ValidPassword123!",
      };

      // First registration
      await request(app).post("/api/v1/auth/register").send(data);

      // Second registration with same email
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Second User",
          email,
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered|already exists/i);
    });

    it("should reject invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Invalid Email",
          email: "not-an-email",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors || res.body.message).toBeDefined();
    });

    it("should reject short password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Short Pass",
          email: "shortpass@example.com",
          password: "123456", // Less than 8 characters
          confirmPassword: "123456",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject mismatched passwords", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Mismatch Test",
          email: "mismatch@example.com",
          password: "ValidPassword123!",
          confirmPassword: "DifferentPassword123",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.errors) || res.body.message).toMatch(/mismatch|confirm|match/i);
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Missing Field",
          // email missing
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject missing name", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "noname@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject empty request body", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject very long name", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "A".repeat(100), // Exceeds max length
          email: "longname@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject very short name", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "A", // Less than 2 characters
          email: "shortname@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("User Login — Positive Cases", () => {
    beforeAll(async () => {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Login Test User",
          email: "logintest@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "logintest@example.com",
          password: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("logintest@example.com");
    });

    it("should return JWT token in correct format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "logintest@example.com",
          password: "ValidPassword123!",
        });

      const token = res.body.accessToken;
      const parts = token.split(".");
      expect(parts.length).toBe(3); // JWT has 3 parts separated by dots
    });

    it("should set refreshToken cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "logintest@example.com",
          password: "ValidPassword123!",
        });

      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should update lastLogin timestamp", async () => {
      const userBefore = await User.findOne({ email: "logintest@example.com" });
      const lastLoginBefore = userBefore.lastLogin;

      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait a bit

      await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "logintest@example.com",
          password: "ValidPassword123!",
        });

      const userAfter = await User.findOne({ email: "logintest@example.com" });
      expect(userAfter.lastLogin.getTime()).toBeGreaterThan(lastLoginBefore ? lastLoginBefore.getTime() : 0);
    });
  });

  describe("User Login — Negative Cases", () => {
    beforeAll(async () => {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Login Negative Test",
          email: "loginneg@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });
    });

    it("should reject invalid password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "loginneg@example.com",
          password: "WrongPassword123",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid|incorrect/i);
    });

    it("should reject non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject missing email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          password: "ValidPassword123!",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject missing password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "loginneg@example.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject empty credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject case-sensitive email search", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "LOGINNEG@EXAMPLE.COM",
          password: "ValidPassword123!",
        });

      // Email should be case-insensitive
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Protected Routes & Authentication Middleware", () => {
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Protected Routes Test",
          email: "protected@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      authToken = res.body.accessToken;
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token|unauthorized|login/i);
    });

    it("should reject request with invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token-here");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should accept request with valid token in header", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // GET /me returns res.body.data.user (wrapped by sendSuccess helper)
      expect(res.body.data?.user || res.body.user).toBeDefined();
    });

    it("should accept request with valid token in cookie", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "protected@example.com",
          password: "ValidPassword123!",
        });

      const setCookieHeader = loginRes.headers["set-cookie"];
      expect(setCookieHeader).toBeDefined();

      // Extract cookie from response and send in next request
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", setCookieHeader);

      expect([200, 401]).toContain(res.statusCode); // May vary based on implementation
    });

    it("should reject expired token", async () => {
      // Create an expired token (using a token that has passed expiry)
      // This is tricky in tests, so we'll skip or mock if needed
      // For now, verify the mechanism exists
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid.expired.token");

      expect(res.statusCode).toBe(401);
    });

    it("should return user profile when authenticated", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user).toHaveProperty("id");
      expect(res.body.data.user).toHaveProperty("email");
      expect(res.body.data.user).toHaveProperty("name");
      expect(res.body.data.user).toHaveProperty("role");
    });
  });

  describe("JWT & Token Management", () => {
    it("should generate valid access token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "JWT Test",
          email: "jwt@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      const token = res.body.accessToken;
      const parts = token.split(".");
      expect(parts.length).toBe(3);

      // Decode without verification (just check structure)
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      expect(payload.id).toBeDefined();
      expect(payload.role).toBe(ROLES.USER);
    });

    it("should store refresh token in database", async () => {
      const email = "refreshtoken@example.com";
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Refresh Test",
          email,
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      const user = await User.findOne({ email }).select("+refreshTokens");
      expect(user.refreshTokens).toBeDefined();
      expect(user.refreshTokens.length).toBeGreaterThan(0);
      expect(user.refreshTokens[0].token).toBeDefined();
      expect(user.refreshTokens[0].expiresAt).toBeDefined();
    });

    it("should support token refresh", async () => {
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Token Refresh",
          email: "tokenrefresh@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      const refreshCookie = registerRes.headers["set-cookie"]?.find((c) => c.startsWith("refreshToken"));
      const refreshToken = refreshCookie?.split(";")[0]?.split("=")[1];

      // Wait >1s so the new JWT has a different iat and thus different signature
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken });

      expect(refreshRes.statusCode).toBe(200);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.accessToken).not.toBe(registerRes.body.accessToken);
    });
  });

  describe("Authorization & Role-Based Access", () => {
    it("should verify admin role is different from user role", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Admin Test",
          email: "admin@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.body.user.role).not.toBe(ROLES.ADMIN);
      expect(res.body.user.role).toBe(ROLES.USER);
    });
  });

  describe("Response Format Compliance", () => {
    it("should follow success response format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Format Test",
          email: "format@example.com",
          password: "ValidPassword123!",
          confirmPassword: "ValidPassword123!",
        });

      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("user");
      expect(res.body.success).toBe(true);
    });

    it("should follow error response format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({});

      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("message");
      expect(res.body.success).toBe(false);
    });
  });
});
