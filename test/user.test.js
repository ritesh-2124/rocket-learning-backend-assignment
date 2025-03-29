const chai = require("chai");
const chaiHttp = require("chai-http");
const testDB = require("../config/database_test");

chai.use(chaiHttp);
const { expect } = chai;

let expressUrl = "http://localhost:5000";

describe("User API Tests", () => {
    let testUser = {
        "name": "ritesh1",
        "email": `ritesh${Date.now()}@example.com`,
        "password": "pass1word",
        "role": "user"
    }
    before(async () => {
        await testDB.sync({ force: true }); 
    });
    

    it("should create a new user", async () => {
        const res = await chai.request(expressUrl).post("/api/users/register").send(testUser);
        expect(res).to.have.status(201);
    });

    it("should create a new admin user", async () => {
        testUser.role = "admin";
        testUser.email = `ritesh${Date.now()}@example.com`;
        const res = await chai.request(expressUrl).post("/api/users/register").send(testUser);
        expect(res).to.have.status(201);
    });

    it("should not allow duplicate email registration", async () => {
        const res = await chai.request(expressUrl).post("/api/users/register").send({
            name: "John Doe",
            email: testUser.email,
            password: "password123",
            role: "user",
        });

        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message").that.includes("Email already exists");
    });

    it("should login an existing user", async () => {
        const res = await chai.request(expressUrl).post("/api/users/login").send({
            email: testUser.email,
            password: "pass1word",
        });

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("token");
    });

    it("should not login with wrong password", async () => {
        const res = await chai.request(expressUrl).post("/api/users/login").send({
            email: "johndoe@example.com",
            password: "wrongpassword",
        });

        expect(res).to.have.status(401);
        expect(res.body).to.have.property("message").that.includes("Invalid email or password");
    });
});
