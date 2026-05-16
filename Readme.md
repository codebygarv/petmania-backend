# Adoptirx Backend — Codebase Overview

This repository contains the backend for Adoptirx, a modular Node.js service focused on managing users and pets. The README below highlights the codebase layout, core modules (models, routes, controllers), configuration, and quick run instructions so contributors can onboard quickly.

**Repository Root**: Project entry points and global config
- **[src/app.js](src/app.js)**: Express app configuration and middleware setup.
- **[src/server.js](src/server.js)**: Server bootstrap (port, startup logging).

**Core Folders**
- **[src/config/](src/config/)**: App-level config and integrations (links below).
- **[src/database/](src/database/)**: Database connection helpers.
- **[src/modules/](src/modules/)**: Domain modules (users, pets, etc.).

**High-level Modules**
- **Users**
  - **Controllers & Routes**: [src/modules/user/user.controller.js](src/modules/user/user.controller.js), [src/modules/user/user.routes.js](src/modules/user/user.routes.js)
  - **Middleware & Validation**: [src/modules/user/user.middleware.js](src/modules/user/user.middleware.js), [src/modules/user/user.validation.js](src/modules/user/user.validation.js)
  - **Models**: [src/modules/user/models/user.model.js](src/modules/user/models/user.model.js), [src/modules/user/models/userForgotOtp.model.js](src/modules/user/models/userForgotOtp.model.js), [src/modules/user/models/userRegisterOtp.model.js](src/modules/user/models/userRegisterOtp.model.js)

- **Pets**
  - **Models**: [src/modules/pets/models/pets.models.js](src/modules/pets/models/pets.models.js)
  - Controllers & routes for pets live under `src/modules/pets/` (register, list, update, delete endpoints).

**Config & Integrations**
- **[src/config/cloudinary.js](src/config/cloudinary.js)**: Cloudinary image upload configuration.
- **[src/config/emailService.js](src/config/emailService.js)**: Email sending helper.
- **[src/config/jwt.js](src/config/jwt.js)**: JWT sign/verify helpers.
- **[src/config/otpGenerate.js](src/config/otpGenerate.js)**, **[src/config/saveOtpToDB.js](src/config/saveOtpToDB.js)**, **[src/config/saveRegisterOtpToDB.js](src/config/saveRegisterOtpToDB.js)**: OTP generation and persistence helpers.
- **Email templates**: [src/config/emailTemplate/otpGenerationTemplate.js](src/config/emailTemplate/otpGenerationTemplate.js), [src/config/emailTemplate/RegisterOtpTemplate.js](src/config/emailTemplate/RegisterOtpTemplate.js), [src/config/emailTemplate/userSuccessRegisterTemplate.js](src/config/emailTemplate/userSuccessRegisterTemplate.js)

**Database**
- **Connection helpers**: [src/database/connection.js](src/database/connection.js), [src/database/sqlConnection.js](src/database/sqlConnection.js)
- Models in `src/modules/*/models` map to your persistence layer. Review each model for schema details.

**Typical Request Flow (example)**
- Incoming HTTP request -> route handler (`src/modules/*/ *.routes.js`) -> controller (`src/modules/*/ *.controller.js`) -> validation / middleware -> service / model -> DB via `src/database/*` -> response.

**API Surface (summary)**
- **Users**: register, login, forgot-password, reset-password, profile, verify-otp — implemented in `src/modules/user/*`.
- **Pets**: create, read, update, delete, list — implemented in `src/modules/pets/*`.

Note: For concrete route paths and payloads, open the route files: [src/modules/user/user.routes.js](src/modules/user/user.routes.js) and your pets routes file if present under `src/modules/pets/`.

**Run & Develop**
- Install dependencies:

```bash
npm install
```

- Local development (common scripts):

```bash
npm run dev
```

- Environment variables (examples)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/Adoptirx

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# External
REDIS_URL=redis://localhost:6379
```

**Testing**
- Add/extend tests in a `test/` folder (Jest + Supertest recommended). Example commands if present in `package.json`:

```bash
npm test
npm run test:coverage
```

**Contributing & Next Steps**
- Follow the existing code style in `src/`.
- Add API docs or Swagger for endpoints to make routes explicit.
- Consider adding a `README.dev.md` with local setup, Docker compose, and database migration steps.

---

If you'd like, I can:
- extract an explicit endpoints list by scanning `src/modules/*/` and generating an OpenAPI fragment, or
- add a short `README.dev.md` with Docker/compose and migration scripts.

**Built with ❤️ for pet lovers everywhere**