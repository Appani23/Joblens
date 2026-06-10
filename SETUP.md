# JobLens — Setup Guide

## Prerequisites

- Java 17+
- Maven 3.8+
- Docker & Docker Compose

---

## 1. Start infrastructure

```bash
docker compose up -d
```

This starts MySQL 8 (port 3306), Redis 7 (port 6379), Zookeeper, and Kafka (port 9092).
MySQL data is persisted in a named Docker volume (`mysql-data`).

Wait ~10 seconds for MySQL to fully initialize before starting services.

---

## 2. Build the project

```bash
mvn clean install
```

Run from the repo root. Compiles all 5 modules.

---

## 3. Run individual services

Open a separate terminal for each service:

```bash
# API Gateway — port 8080
cd api-gateway && mvn spring-boot:run

# User Service — port 8081
cd user-service && mvn spring-boot:run

# Resume Service — port 8082
cd resume-service && mvn spring-boot:run

# Job Aggregator Service — port 8083
cd job-aggregator-service && mvn spring-boot:run

# Matching Service — port 8084
cd matching-service && mvn spring-boot:run
```

---

## 4. Service ports

| Service                | Port |
|------------------------|------|
| api-gateway            | 8080 |
| user-service           | 8081 |
| resume-service         | 8082 |
| job-aggregator-service | 8083 |
| matching-service       | 8084 |

---

## 5. Verify health endpoints

```bash
curl http://localhost:8080/health
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
curl http://localhost:8084/health
```

Each returns: `{"service":"<name>","status":"UP"}`

---

## 6. Environment variables

Copy `.env.example` to `.env` and fill in the API keys:

```bash
cp .env.example .env
```

---

## 7. Stop infrastructure

```bash
docker compose down
```

To also remove persisted data:

```bash
docker compose down -v
```
