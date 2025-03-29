const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const testDB = require("../config/database_test");
const { expect } = chai;
const User = require("../models/User")(testDB);
const Flight = require("../models/Flight")(testDB);
const Seat = require("../models/Seats")(testDB, Flight);
const Booking = require("../models/Booking")(testDB, Flight, User);
const { client } = require("../config/redis");
const app = "http://localhost:5000";

chai.use(chaiHttp);
let testUser = {
    "name": "ritesh1",
    "email": `ritesh${Date.now()}@example.com`,
    "password": "pass1word",
    "role": "admin"
}

before(async () => {
  await testDB.sync({ force: true }); 
});


 
describe("Flight Controller", () => {
  afterEach(() => {
    sinon.restore();
  });
  let token;
  let admin;
  let flight_id
  before(async () => {
    admin = await chai.request(app).post("/api/users/register").send(testUser);
   token = await chai.request(app).post("/api/users/login").send({
        email: testUser.email,
        password: "pass1word",
    });
});


  describe("POST /api/flights", () => {
    it("should add a new flight and create seats", async () => {
      const flightMock = {
        id: 1,
        airline: "TestAir",
        source: "NYC",
        destination: "LA",
        total_seats: 10,
      };
      sinon.stub(Flight, "create").resolves(flightMock);
      sinon.stub(Seat, "bulkCreate").resolves();
      sinon.stub(client, "keys").resolves([]);
      sinon.stub(client, "del").resolves();

      const res = await chai
        .request(app)
        .post("/api/flights")
        .set("Authorization", `Bearer ${token.body.token}`)
        .send({
          airline: "TestAir",
          source: "NYC",
          destination: "LA",
          flight_no: "TA123",
          date: "2025-04-01",
          total_seats: 10,
          price: 100,
          arrival_time: "12:00",
          departure_time: "10:00",
        })
        flight_id = res.body.id
      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal("Flight added successfully with seats");
    });

    it("should return 401 if no token is provided", async () => {
      const res = await chai
        .request(app)
        .post("/api/flights")
        .send({
          airline: "TestAir",
          source: "NYC",
          destination: "LA",
          flight_no: "TA123",
          date: "2025-04-01",
          total_seats: 10,
          price: 100,
        });

      expect(res.status).to.equal(401);
    });
  });

  describe("GET /api/flights", () => {
       it("should return flights when valid parameters are provided", async () => {
         sinon.stub(client, "get").resolves(null);
         sinon.stub(Flight, "findAndCountAll").resolves({
           count: 1,
           rows: [{ id: 1, source: "NYC", destination: "LA", available_seats: 5 }],
         });
         sinon.stub(client, "setEx").resolves();
   
         const res = await chai
           .request(app)
           .get("/api/flights")
           .query({ source: "NYC", destination: "LA", date: "2025-04-01" });
   
         expect(res.status).to.equal(200);
         expect(res.body.totalFlights).to.equal(1);
       });
   
       it("should return an empty array when no flights are available", async () => {
         sinon.stub(Flight, "findAndCountAll").resolves({ count: 0, rows: [] });
   
         const res = await chai
           .request(app)
           .get("/api/flights")
           .query({ source: "XYZ", destination: "ABC", date: "2025-04-01" });
   

         expect(res.status).to.equal(404);
       });
     });

  describe("GET /flights/getAvailableSeats/:id", () => {
    it("should return available seats for a flight", async () => {
      const res = await chai.request(app).get(`/api/flights/getAvailableSeats/${flight_id}`);

      expect(res.status).to.equal(200);
    });
  });

  describe("PUT /flights/:id", () => {
    it("should update flight details", async () => {
      const flightMock = { update: sinon.stub().resolves() };
      sinon.stub(Flight, "findByPk").resolves(flightMock);

      const res = await chai
        .request(app)
        .put("/api/flights/1")
        .set("Authorization", `Bearer ${token.body.token}`)
        .send({ price: 150 });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Flight updated successfully");
    });

    it("should return 404 if flight not found", async () => {
      sinon.stub(Flight, "findByPk").resolves(null);

      const res = await chai
        .request(app)
        .put("/api/flights/999")
        .set("Authorization", `Bearer ${token.body.token}`)
        .send({ price: 150 });

      expect(res.status).to.equal(404);
    });
  });
  describe("POST /flights/reschedule/:id", () => {
    it("should reschedule a flight and notify users", async () => {
      const flightMock = {
        flight_no: "TA123",
        source: "NYC",
        destination: "LA",
        date: "2025-04-02",
      };
      sinon.stub(Flight, "findByPk").resolves(flightMock);
      sinon.stub(Booking, "findAll").resolves([{ userId: 1, seatsBooked: 2 }]);
      sinon.stub(User, "findByPk").resolves({ name: "John Doe", email: "john@example.com" });

      const res = await chai
        .request(app)
        .post("/api/flights/reschedule/1")
        .set("Authorization", `Bearer ${token.body.token}`)
        .send({ date: "2025-04-03", departure_time: "14:00", arrival_time: "16:00" });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Flight rescheduled successfully");
    });
  });
  describe("DELETE /flights/:id", () => {
    it("should delete a flight", async () => {
      const flightMock = { destroy: sinon.stub().resolves() };
      sinon.stub(Flight, "findByPk").resolves(flightMock);

      const res = await chai
        .request(app)
        .delete("/api/flights/1")
        .set("Authorization", `Bearer ${token.body.token}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Flight deleted successfully");
    });

    it("should return 404 if flight not found", async () => {
      sinon.stub(Flight, "findByPk").resolves(null);

      const res = await chai
        .request(app)
        .delete("/api/flights/999")
        .set("Authorization", `Bearer ${token.body.token}`);

      expect(res.status).to.equal(404);
    });
  });
});
