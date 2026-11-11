FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/cupcake-store-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx350m", "-Xss256k", "-XX:+UseContainerSupport", "-jar", "app.jar"]