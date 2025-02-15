# How to Use Mindory

This guide provides detailed instructions for setting up, developing, and deploying Mindory.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git
- Supabase account
- Docker (optional, for local development)

## Local Development Setup

### 1. Environment Configuration

#### Backend Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

#### Frontend Configuration
Create a `.env` file in the `frontend` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

### 2. Database Setup

1. Create a new Supabase project
2. Run migrations:
   ```bash
   cd supabase
   supabase db push
   ```

### 3. Development Workflow

#### Backend Development

1. Start the development server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Run tests:
   ```bash
   # Unit tests
   npm run test
   
   # E2E tests
   npm run test:e2e
   
   # Test coverage
   npm run test:cov
   ```

#### Frontend Development

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Run tests:
   ```bash
   npm run test
   ```

### 4. API Documentation

The API documentation is available at `http://localhost:3000/api` when running the backend server.

## Common Tasks

### Adding a New Feature

1. Backend:
   - Create a new module in `backend/src/modules`
   - Add controller, service, and DTOs
   - Update app.module.ts
   - Add tests

2. Frontend:
   - Add new component in appropriate module
   - Update router if needed
   - Add store module if required
   - Add tests

### Database Changes

1. Create a new migration:
   ```bash
   cd supabase
   supabase migration new your_migration_name
   ```

2. Apply migrations:
   ```bash
   supabase db push
   ```

## Deployment

### Backend Deployment

1. Build the application:
   ```bash
   cd backend
   npm run build
   ```

2. Start production server:
   ```bash
   npm run start:prod
   ```

### Frontend Deployment

1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist` directory to your hosting service

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check Supabase credentials
   - Verify network connectivity
   - Check firewall settings

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript version compatibility
   - Verify environment variables

3. **Test Failures**
   - Check test environment setup
   - Verify mock data
   - Check for outdated snapshots

## Performance Optimization

1. Frontend:
   - Use lazy loading for routes
   - Implement code splitting
   - Optimize asset loading

2. Backend:
   - Implement caching where appropriate
   - Use database indexes
   - Optimize queries

## Security Best Practices

1. Always validate user input
2. Use environment variables for sensitive data
3. Implement rate limiting
4. Keep dependencies updated
5. Use HTTPS in production
6. Implement proper authentication and authorization