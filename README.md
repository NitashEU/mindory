# Mindory

Mindory is a modern web application that helps developers understand and explore their codebase through interactive visualization and AI-powered insights. Built with NestJS (backend) and Vue.js (frontend), it leverages Supabase for data storage and real-time features.

## Features

- 📊 Interactive code visualization
- 🔍 AI-powered code analysis
- 🗃️ Repository management
- 👥 User authentication and profiles
- 🔄 Real-time updates
- 📱 Responsive design

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- TypeScript
- Vite
- Tailwind CSS
- Vue Router
- Pinia for state management
- Vitest for testing

### Backend
- NestJS
- TypeScript
- Supabase
- Jest for testing
- Swagger for API documentation

## Project Structure

```
mindory/
├── frontend/                # Vue.js frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── modules/        # Feature-specific modules
│   │   ├── pages/         # Main application views
│   │   ├── store/         # State management
│   │   └── router/        # Application routing
│   └── ...
├── backend/                # NestJS backend application
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── common/        # Shared utilities
│   │   └── config/        # Configuration
│   └── ...
└── supabase/              # Database migrations and schema
    └── migrations/        # SQL migration files
```

## Quick Start

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/yourusername/mindory.git
   ./setup.sh
   ```

2. Set up environment variables (see HOW-TO.md for details)

3. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run start:dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Documentation

- [How To Guide](HOW-TO.md) - Detailed setup and development guide
- [Contributing Guide](CONTRIBUTING.md) - Guidelines for contributing
- API Documentation - Available at http://localhost:3000/api when running the backend

## Standardized Patterns

### Frontend Patterns
- Module-based architecture for feature organization
- Composition API with `<script setup>` syntax
- Type-safe props and emits
- Consistent naming conventions (PascalCase for components, kebab-case for events)
- Centralized state management with Pinia
- Lazy-loaded routes for better performance

### Backend Patterns
- Module-based architecture following NestJS best practices
- Dependency injection for loose coupling
- DTOs for request/response validation
- Custom decorators for common functionality
- Consistent error handling through filters
- Comprehensive logging system
- Swagger documentation for all endpoints

## Testing

```bash
# Frontend tests
cd frontend && npm run test

# Backend tests
cd backend && npm run test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For detailed information about setup, development, and deployment, please refer to our [How To Guide](HOW-TO.md).
