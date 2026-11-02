# ☕ Cafetería App

Sistema Full-Stack de pedidos en tiempo real para una cafetería local. Los clientes ordenan escaneando un QR en su mesa, el barista recibe los pedidos al instante en una pantalla KDS y el admin gestiona todo desde un dashboard.

[![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)](https://spring.io/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

---

### ✨ Lo que hace

- **Cliente**: menú digital, personalización de productos, carrito y seguimiento del pedido en vivo vía QR.
- **Barista (KDS)**: pedidos en tiempo real con WebSockets, gestión de estados y mesas ocupadas.
- **Admin**: estadísticas en vivo, CRUD de menú, mesas y baristas, todo con seguridad JWT y roles.

### 🧱 Stack

**Backend** · Spring Boot 4 · Spring Data JPA · Spring Security + JWT · WebSockets (STOMP) · PostgreSQL 16  
**Frontend** · React 19 · Vite · Tailwind CSS · PWA · SockJS  
**Infra** · Docker · Render · Vercel

### 🚀 Correr en local

```bash
docker compose up -d              # PostgreSQL
cd cafeteria-backend && ./mvnw spring-boot:run
cd frontend && npm run dev        # Cliente → :5173
cd frontend-kds && npm run dev    # KDS     → :5174
cd frontend-admin && npm run dev  # Admin   → :5175