# Flight Booking System

## 🚀 Overview
This is a **Flight Booking System** built using **Node.js**, **Express.js**, and **MySQL**. The system enables users to search for flights, book tickets, and manage reservations. It includes **admin functionalities**, **caching with Redis**, and **message queue processing** for email notifications. The project also features **comprehensive testing**.

## 📌 Features

🌍 Deployed URL

API Base URL: [Rocket Learning Backend](https://rocket-learning-backend-assignment.onrender.com/api/)(https://rocket-learning-backend-assignment.onrender.com/api/)

## 🔴 Additionally, I have attached the `.env` file with the assignment Email


### 1️⃣ User Authentication
- Users can **sign up and log in** using **JWT authentication**.
- Implements **role-based access control (RBAC)** for admin and regular users.

### 2️⃣ Flight Search & Booking
- Users can search for flights using:
  - **Source & Destination**
  - **Date of Travel**
- Users can book flight tickets by selecting **available seats**.
- Booking details are stored in the **database**.

### 3️⃣ Flight Management (Admin Only)
- Admin can **add, update, delete, or reschedule flights**.
- Flight details stored include:
  - **Flight number, airline, seats available, price, etc.**

### 4️⃣ Caching & Performance Optimization
- Implemented **Redis caching** for frequently searched flights.
- Cached **flight details** to reduce database load.

### 5️⃣ Queue-based Ticket Processing
- When a booking is made, a **confirmation email** is sent using a **message queue** (SQS/Kafka/RabbitMQ).
- Processed bookings **asynchronously**.

### 6️⃣ Notifications
- **Email confirmation** sent upon successful booking.
- Users notified if a **flight is canceled or rescheduled**.

### 7️⃣ Database Schema
Using **MySQL (Sequelize)**;

## 🚀 Tech Stack
- **Backend**: Node.js & Express.js
- **Database**: MySQL with Sequelize (AWS RDS) ,sqlite(for testcases)
- **Caching**: Redis
- **Message Queue**: AWS SQS
- **Authentication**: JWT
- **Email Service**: Nodemailer
- **API**: REST API
- **Testing**: Chai with Mocha
- **Deployment** : Render , aws

## 🛠 Project Setup

### Prerequisites
- Node.js
- MySQL Database
- Redis Server
- AWS SQS setup

### Installation
1. Clone the repository:
   ```bash
   git https://github.com/ritesh-2124/rocket-learning-backend-assignment.git
   cd rocket-learning-backend-assignment
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file and add the following details:
   ```env
   DB_USER
   DB_NAME
   DB_PASSWORD
   DB_PORT
   DB_HOST
   JWT_SECRET
   NODE_ENV="test"
   # this is only when want to run testcase for sqlite 

   # Redis config
   REDIS_USERNAME
   REDIS_HOST
   REDIS_PORT
   REDIS_PASSWORD

   # AWS config
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_REGION
   SQS_QUEUE_URL
   EMAIL_USER
   EMAIL_PASSWORD
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Run tests:
   ```bash
   npm test
   ```

## 📝 API Endpoints

### 1️⃣ User Authentication
- `POST /register` → Register a new user
- `POST /login` → Authenticate user & return JWT

### 2️⃣ Flight Management
- `GET /flights` → Fetch available flights
- `GET /flights/getAvailableSeats/:id` → Fetch available seats for a particular flight
- `POST /flights` (Admin) → Add a new flight
- `PUT /flights/:id` (Admin) → Update flight details
- `DELETE /flights/:id` (Admin) → Delete a flight
- `POST /flights/reschedule/:id` (Admin) → Reschedule a flight

### 3️⃣ Booking & Notifications
- `POST /bookings` → Book a flight
- `GET /bookings/:id` → View booking details
- `POST /bookings/cancel/:id` → Cancel a booking

## 🎯 Bonus Features
- **Unit & Integration Tests** used Mocha and Chai.

## 🎯 Future Enhancements

- **Payment Gateway**: Razorpay/Stripe for secure transactions.
- **Advanced Filters**: Price range, airline, duration, direct/connecting flights.
- **GraphQL API** for flexible querying
- can add more testcases

## ✅ Deliverables
- **GitHub Repo** with structured code.
- **README.md** with setup instructions.
- **Postman Collection** for API testing.
- **Test cases** for unit and integration testing.

## 📧 Contact
For any queries, reach out to **riteshyad222000@gmail.com**

