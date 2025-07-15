# Available Commands

## Development Commands

### `npm run dev`
- Starts the development server
- Uses `.env.development` configuration
- API URL: http://localhost:5000
- Frontend URL: http://localhost:3000

### `npm run prod`
- Starts the production server locally
- Uses `.env.production` configuration
- API URL: https://your-backend.onrender.com
- Frontend URL: https://notify-sepia.vercel.app

## Build Commands

### `npm run build:dev`
- Builds for development environment
- Uses development API endpoints

### `npm run build:prod`
- Builds for production environment
- Uses production API endpoints

## Standard Commands

### `npm start`
- Default React start command
- Uses current environment configuration

### `npm run build`
- Default build command
- Uses current environment configuration

## Usage Examples

```bash
# Development (localhost)
npm run dev

# Production (local testing with production config)
npm run prod

# Build for deployment
npm run build:prod
```

## Environment Detection

The app will automatically:
- Load the correct environment file
- Use the appropriate API base URL
- Show the current environment in the login page
- Log the configuration to console 