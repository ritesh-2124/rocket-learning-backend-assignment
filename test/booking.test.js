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
};

before(async () => {
    await testDB.sync({ force: true });
});

describe("Flight Booking Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    let token;
    let flightId;
    let bookingId;

    before(async () => {
        await chai.request(app).post("/api/users/register").send(testUser);
        const loginRes = await chai.request(app).post("/api/users/login").send({
            email: testUser.email,
            password: "pass1word",
        });
        token = loginRes.body.token;
    });

    describe("POST /api/bookings", () => {
        it("should book a flight successfully", async () => {
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
        
              const createFlight = await chai
                .request(app)
                .post("/api/flights")
                .set("Authorization", `Bearer ${token}`)
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
                flightId = createFlight.body.id
            const res = await chai
                .request(app)
                .post("/api/bookings")
                .set("Authorization", `Bearer ${token}`)
                .send({ flightId, seatsBooked: 1 });
                bookingId = res.body.id
            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal("Flight booked successfully");
        });
    });

    describe("GET /api/bookings/:id", () => {
        it("should retrieve user booking details", async () => {
            const res = await chai
                .request(app)
                .get(`/api/bookings/${bookingId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).to.equal(200);
        });
    });
});
