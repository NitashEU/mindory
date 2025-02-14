# Mindory

A brief description of Mindory, a project built with NestJS (backend) and Vue.js (frontend).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## Installation

Instructions on how to install and set up the project locally.

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the backend directory and install dependencies:
   ```
   cd backend
   npm install
   ```
3. Navigate to the frontend directory and install dependencies:
   ```
   cd ../frontend
   npm install
   ```
4. Alternatively, from the root directory, run:
   ```
   ./setup.sh
   ```

## Usage

Instructions on how to run the project.

### Backend

To start the backend server, navigate to the backend directory and run:

```
npm run start
```

### Frontend

To start the frontend application, navigate to the frontend directory and run:

```
npm run dev
```

## Architecture

### Backend

The backend is built using NestJS and follows a modular structure:

- **Entry Point:** Located in main.ts which initializes the application.
- **Controllers:** Handle incoming HTTP requests.
- **Services:** Contain business logic for each module.
- **Modules:** Group related controllers and services (e.g. authentication, user management).
- **Common:** Contains shared decorators, filters, interceptors, and pipes.

### Frontend

The frontend is built using Vue.js and is structured as follows:

- **Components:** Reusable UI elements.
- **Modules:** Feature-specific groups, e.g., dashboard and profile modules.
- **Pages:** Main views that compose the application.
- **Routing:** Managed by Vue Router for navigating between pages.
- **State Management:** Often handled by Vuex or similar libraries for managing application state.

## Contributing

Guidelines for contributing to the project.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
