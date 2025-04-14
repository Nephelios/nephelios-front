# Nephelios Frontend

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/192220910?s=200&v=4" alt="Nephelios Logo" width="80">
  <h3>Modern Cloud Application Platform</h3>
</div>

## Overview

Nephelios is a modern cloud platform that simplifies application deployment and management. The frontend provides an intuitive interface for deploying, monitoring, and managing your applications in the cloud.

## Features

- **Application Dashboard**: View and manage all your deployed applications in one place
- **One-Click Deployment**: Deploy applications directly from GitHub repositories
- **Application Control**: Start, pause, and delete applications with ease
- **Application Monitoring**: Monitor application performance and status
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Framework**: React with TypeScript
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Validation**: Zod
- **Build Tool**: Vite
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/nephelios-front.git
   cd nephelios-front
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   # Create a .env file in the root directory and add:
   REACT_APP_NEPHELIOS_BACKEND_URL=http://localhost
   REACT_APP_NEPHELIOS_BACKEND_PORT=3030
   ```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist` directory.

## Docker Deployment

Nephelios frontend can be easily deployed using Docker:

```bash
# Build the Docker image
docker build -t nephelios-frontend .

# Run the container
docker run -p 80:80 nephelios-frontend
```

## Project Structure

```
nephelios-front/
├── src/
│   ├── assets/        # Static assets
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and libraries
│   ├── pages/         # Application pages
│   │   ├── app-details.tsx    # Individual app management
│   │   ├── create-app.tsx     # App creation form
│   │   ├── dashboard.tsx      # Main application dashboard
│   │   └── monitor.tsx        # System monitoring
│   ├── App.tsx        # Main application component with routing
│   └── main.tsx       # Application entry point
├── public/            # Public static files
├── Dockerfile         # Docker configuration
└── package.json       # Project dependencies and scripts
```

## Key Pages

- **Dashboard**: Lists all deployed applications with status and basic information
- **Create App**: Form to deploy a new application from a GitHub repository
- **App Details**: Detailed view of an application with management controls
- **Monitor**: System-wide monitoring of the Nephelios platform

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Vite](https://vitejs.dev/)
