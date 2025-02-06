FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy gradle files first
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Fix line endings and make gradlew executable
RUN sed -i 's/\r$//' gradlew && \
    chmod +x gradlew

# Download dependencies and cache them
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build the application
RUN --mount=type=cache,target=/root/.gradle \
    ./gradlew clean bootJar --no-daemon

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/app.jar .

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

# Run with proper Java options
CMD ["java", \
    "-XX:MaxRAMPercentage=75", \
    "-XX:InitialRAMPercentage=75", \
    "-XX:+UseG1GC", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]