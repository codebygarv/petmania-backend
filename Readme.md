# PetMania Backend

A comprehensive pet management platform backend built with Domain-Driven Design (DDD) principles for enterprise scalability.

## 🐾 Overview

PetMania is a full-featured pet management system

<!--  that provides services for pet owners, veterinarians, pet stores, and service providers. The backend is architected using Domain-Driven Design principles to ensure maintainability, scalability, and clear separation of concerns. -->

## 🏗️ Architecture

This project follows the **Enterprise/Scalable (Domain-Driven Design - DDD)** folder structure:

<!-- ```
src/
├── domains/                    # Domain Layer - Core business logic
│   ├── pets/                  # Pet domain
│   │   ├── entities/          # Pet-related entities
│   │   ├── value-objects/     # Pet value objects
│   │   ├── repositories/      # Pet repository interfaces
│   │   ├── services/          # Domain services
│   │   └── events/            # Domain events
│   ├── users/                 # User domain
│   ├── appointments/          # Appointment domain
│   ├── medical-records/       # Medical records domain
│   ├── products/              # Product domain
│   └── shared/                # Shared domain concepts
├── application/               # Application Layer - Use cases
│   ├── pets/
│   │   ├── commands/          # Pet command handlers
│   │   ├── queries/           # Pet query handlers
│   │   └── dto/               # Data transfer objects
│   ├── users/
│   ├── appointments/
│   └── shared/
├── infrastructure/            # Infrastructure Layer - External concerns
│   ├── database/             # Database implementations
│   │   ├── entities/         # ORM entities
│   │   ├── repositories/     # Repository implementations
│   │   └── migrations/       # Database migrations
│   ├── external-services/    # Third-party integrations
│   ├── messaging/            # Event messaging
│   └── config/               # Configuration
├── presentation/             # Presentation Layer - API endpoints
│   ├── controllers/          # REST controllers
│   ├── middleware/           # Custom middleware
│   ├── validators/           # Request validators
│   └── dto/                  # API DTOs
└── shared/                   # Shared utilities
    ├── exceptions/           # Custom exceptions
    ├── constants/            # Application constants
    ├── utils/                # Utility functions
    └── types/                # TypeScript types
```

## 🚀 Features

### Core Domains
- **Pets**: Pet registration, profiles, and management
- **Users**: User authentication, authorization, and profiles
- **Appointments**: Veterinary and grooming appointments
- **Medical Records**: Health tracking and medical history
- **Products**: Pet supplies and product catalog
- **Notifications**: Real-time notifications and alerts

### Technical Features
- **Domain-Driven Design**: Clean architecture with clear domain boundaries
- **Event Sourcing**: Track all domain events for audit and replay
- **CQRS**: Separate read and write models for optimal performance
- **Microservices Ready**: Modular design for easy service extraction
- **API Documentation**: Comprehensive OpenAPI/Swagger documentation
- **Database Agnostic**: Repository pattern for easy database switching
- **Event-Driven**: Asynchronous communication between bounded contexts

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js / Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL (primary), Redis (caching)
- **ORM**: Prisma / TypeORM
- **Validation**: Joi / Zod
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI
- **Monitoring**: Winston (logging), Prometheus (metrics)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/petmania-backend.git
   cd petmania-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Database setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs-json`

## 🏛️ Domain-Driven Design Principles

### Bounded Contexts
Each domain represents a bounded context with its own:
- **Entities**: Core business objects with identity
- **Value Objects**: Immutable objects without identity
- **Aggregates**: Consistency boundaries
- **Domain Services**: Business logic that doesn't belong to entities
- **Repositories**: Data access abstractions
- **Domain Events**: Important business occurrences

### Key Patterns
- **Repository Pattern**: Abstract data access
- **Unit of Work**: Transaction management
- **Domain Events**: Loose coupling between contexts
- **CQRS**: Separate read/write models
- **Event Sourcing**: Store events instead of state

## 🔧 Development

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for all business logic
- Document all public APIs

### Git Workflow
- Feature branches from `develop`
- Pull requests for code review
- Automated testing on CI/CD
- Semantic versioning for releases

## 📈 Monitoring & Observability

- **Logging**: Structured logging with Winston
- **Metrics**: Prometheus metrics collection
- **Health Checks**: Application health monitoring
- **Tracing**: Distributed tracing support

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t petmania-backend .

# Run container
docker run -p 3000:3000 petmania-backend
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/petmania
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# External Services
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Team**: Core API development
- **DevOps Team**: Infrastructure and deployment
- **QA Team**: Testing and quality assurance

## 📞 Support

For support, email support@petmania.com or join our Slack channel.

--- -->

**Built with ❤️ for pet lovers everywhere**
