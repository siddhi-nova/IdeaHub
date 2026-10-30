# IDEAHUB Backend

Spring Boot + Maven + MySQL backend for the IDEAHUB React frontend.

## Requirements
- Java 17+
- Maven 3.9+
- MySQL 8+

## Configure MySQL
Open:
src/main/resources/application.properties

Change:
spring.datasource.password=YOUR_MYSQL_PASSWORD

The `ideahub_db` database is created automatically.

## Run
mvn spring-boot:run

Backend:
http://localhost:8080

## Main API
GET    /api/ideas
GET    /api/ideas/{id}
GET    /api/ideas/user/{userId}
POST   /api/ideas
PUT    /api/ideas/{id}
DELETE /api/ideas/{id}
POST   /api/ideas/{id}/like

GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
