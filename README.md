# JobLens

### AI-powered job aggregator that matches every listing to your resume — so you only see jobs worth applying for.

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=openjdk&logoColor=white" alt="Java 17"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot 3.3"/>
  <img src="https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Apache%20Kafka-3.x-231F20?style=flat-square&logo=apachekafka&logoColor=white" alt="Kafka"/>
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/AWS-EC2%20%2F%20S3-FF9900?style=flat-square&logo=amazonaws&logoColor=white" alt="AWS"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"/>
</p>

---

## 📌 About

Job hunting is noisy. Boards surface hundreds of listings per search, most of which are irrelevant — wrong seniority level, missing required skills, or simply a bad fit. Applicants waste hours filtering manually, often missing the roles they'd actually land.

**JobLens solves this by turning your resume into a personal relevance engine.**

Upload your resume once. JobLens pulls listings from multiple job APIs (starting with Adzuna), runs each one through an AI scoring model, and surfaces only the listings with a strong match — ranked by relevance, not recency. When you find a role you want, you click through to apply on the original site. JobLens never intercepts applications; it's a pure **aggregate-and-redirect** model, similar to how Glassdoor or Indeed work.

The result: a single dashboard that shows *your* job market, not everyone's.

---

## ✨ Key Features

- **AI Resume Matching** — every job listing is scored 0–100% against your uploaded resume using the Claude API; low-scoring listings are filtered out before they reach your feed
- **Multi-source Aggregation** — ingests listings from Adzuna with a plugin architecture designed to add more sources (LinkedIn, Greenhouse, etc.) without touching business logic
- **Smart Filters** — filter by job type (full-time / part-time / contract / remote), date posted, and sort by AI relevance score or most recent
- **One-click Apply** — clicking a listing redirects to the original job posting; no fake "Easy Apply" wrappers
- **Premium UI** — built with React, TypeScript, and Tailwind CSS for a clean, fast, responsive experience

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│              (TypeScript · Tailwind CSS · Vite)              │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼─────────────────────────────────┐
│               API Gateway  :8080                             │
│          (Spring Cloud Gateway · route + auth filter)        │
└──────┬────────────┬──────────────┬──────────────┬────────────┘
       │            │              │              │
       ▼            ▼              ▼              ▼
  ┌─────────┐ ┌──────────┐ ┌───────────────┐ ┌──────────────┐
  │  User   │ │  Resume  │ │Job Aggregator │ │  Matching    │
  │ :8081   │ │  :8082   │ │    :8083      │ │   :8084      │
  └────┬────┘ └────┬─────┘ └──────┬────────┘ └──────┬───────┘
       │           │              │                  │
       ▼           ▼              ▼                  ▼
  ┌─────────────────────────────────────────────────────────┐
  │              MySQL 8   ·   Redis 7   ·   Kafka          │
  └─────────────────────────────────────────────────────────┘
```

| Service | Port | Responsibility |
|---|---|---|
| **api-gateway** | 8080 | Single entry point — routing, auth filter, rate limiting |
| **user-service** | 8081 | Registration, login, JWT issuance, profile management |
| **resume-service** | 8082 | Resume upload (S3), parsing, skill extraction |
| **job-aggregator-service** | 8083 | Polls external job APIs via Spring Batch, publishes to Kafka |
| **matching-service** | 8084 | Consumes Kafka events, scores jobs against resume via Claude API |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3, Microservices, Spring Cloud Gateway, Hibernate / JPA |
| **Data** | MySQL 8, Redis 7, Apache Kafka, Spring Batch |
| **Resilience** | Resilience4j (circuit breaker, retry, rate limiter) |
| **Security** | Spring Security, JWT |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **AI** | Anthropic Claude API |
| **DevOps** | Docker, Kubernetes, Maven, GitHub Actions, Jenkins |
| **Cloud** | AWS EC2, AWS S3 |
| **Testing** | JUnit 5, Mockito |
| **Docs** | Swagger / OpenAPI, Postman |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- Docker & Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/vigneshappani/joblens.git
cd joblens
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Open .env and fill in your API keys:
#   ADZUNA_APP_ID      — from developer.adzuna.com
#   ADZUNA_APP_KEY     — from developer.adzuna.com
#   ANTHROPIC_API_KEY  — from console.anthropic.com
```

### 3. Start infrastructure

```bash
docker compose up -d
```

Starts MySQL 8 (3306), Redis 7 (6379), Zookeeper, and Kafka (9092).
Allow ~10 seconds for MySQL to finish initialising before starting services.

### 4. Build the project

```bash
mvn clean install
```

### 5. Run the services

Open a dedicated terminal for each service:

```bash
cd api-gateway            && mvn spring-boot:run   # :8080
cd user-service           && mvn spring-boot:run   # :8081
cd resume-service         && mvn spring-boot:run   # :8082
cd job-aggregator-service && mvn spring-boot:run   # :8083
cd matching-service       && mvn spring-boot:run   # :8084
```

### 6. Verify all services are up

```bash
curl http://localhost:8080/health   # {"status":"UP","service":"api-gateway"}
curl http://localhost:8081/health   # {"status":"UP","service":"user-service"}
curl http://localhost:8082/health   # {"status":"UP","service":"resume-service"}
curl http://localhost:8083/health   # {"status":"UP","service":"job-aggregator-service"}
curl http://localhost:8084/health   # {"status":"UP","service":"matching-service"}
```

---

## 📍 Project Status

This project is being built in public as a portfolio piece demonstrating production-style Java microservices architecture.

- [x] **Phase 1** — Multi-module Maven scaffold, Docker Compose infra (MySQL, Redis, Kafka), health endpoints on all 5 services
- [ ] **Phase 2** — User registration & login, JWT auth, Spring Security configuration
- [ ] **Phase 3** — Resume upload to S3, PDF parsing, skill extraction
- [ ] **Phase 4** — Job ingestion pipeline (Adzuna API → Spring Batch → Kafka)
- [ ] **Phase 5** — AI matching engine (Claude API, match scoring, persistence)
- [ ] **Phase 6** — React frontend — job feed, filters, resume upload UI
- [ ] **Phase 7** — Kubernetes deployment, CI/CD pipeline (GitHub Actions + Jenkins)
- [ ] **Phase 8** — AWS production deployment (EC2, S3, RDS)

---

## 👤 Author

**Vignesh Appani** — Full Stack Java Developer

- LinkedIn: [linkedin.com/in/vigneshappani](https://linkedin.com/in/vigneshappani)
- GitHub: [github.com/vigneshappani](https://github.com/vigneshappani)

---

## License

This project is licensed under the [MIT License](LICENSE).
