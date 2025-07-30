# 🎓 BunkMate - Student Attendance Management API

BunkMate is a RESTful Spring Boot-based backend application that helps students track their class attendance, calculate attendance percentages, and find out how many classes they need to attend or can afford to skip — all while staying above the required attendance threshold (default: 75%).

- ✅ JWT-based Authentication  
- 📚 Subject-wise Attendance Management  
- 📈 Intelligent Attendance Suggestions  
- 🌐 REST API ready for frontend integration  
- 🐘 PostgreSQL Database Support  

---

## 🚀 Frontend

📦 UI Repository: [BunkMate-UI](https://github.com/F0RREALTHO/BunkMate-UI)

---

## 🔗 Base URL

https://bunksy.netlify.app/


---

## 🔐 Authentication

### Flow

1. Register via `POST /student`  
2. Login via `POST /student/login`  
3. Receive a JWT token  
4. Use the token in this header format:

Authorization: Bearer <your_access_token>


> ⚠️ In production, consider using refresh tokens.

---

## 🧩 Data Models

### Student

| Field      | Type             | Description                     |
|------------|------------------|---------------------------------|
| id         | Long             | Unique ID                       |
| name       | String           | Username                        |
| password   | String           | Hashed password                 |
| subjects   | Array\<Subject\> | List of subject records         |

### Subject

| Field                            | Type    | Description                                                  |
|----------------------------------|---------|--------------------------------------------------------------|
| id                               | Long    | Unique subject ID                                            |
| name                             | String  | Subject name                                                 |
| attendedClasses                  | Integer | Number of attended classes                                   |
| missedClasses                    | Integer | Number of missed classes                                     |
| requiredPercentage               | Integer | Required attendance percentage (default 75%)                |
| currentAttendancePercentage      | Double  | Current attendance (calculated)                              |
| classesNeededToReachRequirement | Integer | Classes required to hit required percentage (calculated)     |
| classesCanBeMissed              | Integer | Classes that can be missed while staying above requirement   |

---

## 🌐 API Endpoints

### 🔓 Public

#### Register

- `POST /student`

```json
{
  "name": "kartikeya",
  "password": "password123"
}
```
- 201 CREATED
- 409 CONFLICT (username exists)

#### Login
- POST /student/login

```json
{
  "name": "kartikeya",
  "password": "password123"
}
```
- 200 OK → Returns accessToken
- 401 UNAUTHORIZED (invalid credentials)

### 🔒 Protected Endpoints

> Requires `Authorization: Bearer <token>`

#### ➕ Add Subject

`POST /student/{studentName}/subject`

```json
{
  "subjectName": "Analytical Geometry",
  "attendedClasses": 1,
  "missedClasses": 0
}
```
### ❌ Delete Subject

`DELETE /student/{studentName}/subject/{subjectName}`

Deletes a subject from a student’s profile.

---

### 🔄 Update Attendance

`PUT /student/{studentName}/subject/{subjectName}/{type}/{change}`

- `type`: `attended` or `missed`  
- `change`: `inc` or `dec`  

**Example:**

```http
PUT /student/kartikeya/subject/DSA/attended/inc
```
```json
{
  "id": 102,
  "name": "DSA",
  "attendedClasses": 2,
  "missedClasses": 0,
  "requiredPercentage": 75,
  "currentAttendancePercentage": 100.0,
  "classesNeededToReachRequirement": 0,
  "classesCanBeMissed": 0
}
```
## ⚠️ Error Codes

| Status | Meaning        | Description                              |
|--------|----------------|------------------------------------------|
| 200    | OK             | Successful operation                     |
| 201    | Created        | Student created successfully             |
| 401    | Unauthorized   | Missing or invalid token                 |
| 404    | Not Found      | Student or subject not found             |
| 409    | Conflict       | Username already taken                   |
| 500    | Server Error   | Unexpected server error                  |

---

## 🧪 Example

If you’ve attended 10 and missed 5 classes:

- Attendance = `10 / (10 + 5) = 66.67%`  
- System tells you how many more to attend to reach 75%.

---

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/bunkmate-backend.git
cd bunkmate-backend
```

### ⚙️ 2. Configure Database

Copy the provided `application.properties.template` to `application.properties`:

```bash
cp src/main/resources/application.properties.template src/main/resources/application.properties
```
and edit the following: 
```properties
spring.application.name=BunkMate

# Database Configuration
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:password}
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/BunkMate}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret.key=${JWT_SECRET:default-jwt-secret-key}

# Spring Security Configuration
spring.security.user.name=${ADMIN_USERNAME:admin}
spring.security.user.password=${ADMIN_PASSWORD:admin123}
```
### 🚀 3. Run the App

```bash
./mvnw spring-boot:run
```
## 🙌 Author

**Kartikeya Aryam**  
GitHub: [F0RREALTHO](https://github.com/F0RREALTHO)

