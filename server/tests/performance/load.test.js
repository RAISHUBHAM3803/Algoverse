const request = require("supertest");
const app = require("../../src/app");

describe("Part 10 - Performance Tests", () => {
  it("should handle 50 concurrent GET requests to health endpoint", async () => {
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(request(app).get("/health"));
    }
    
    const start = Date.now();
    const responses = await Promise.all(promises);
    const end = Date.now();
    
    expect(end - start).toBeLessThan(5000); // Should resolve in under 5 seconds
    
    responses.forEach(res => {
      expect(res.statusCode).toBe(200);
    });
  });
});
