# Stage 1: Build the app using Maven + OpenJDK 21
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the built JAR with a slim OpenJDK 21 image
FROM eclipse-temurin:21-jdk-alpine
COPY --from=build /app/target/BunkMate-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
