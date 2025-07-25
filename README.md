# Med Mingle - Health Engagement Platform

A comprehensive health engagement platform that connects individuals with chronic conditions through AI-driven matching, product discovery, and community support.

## Features

- 🤖 **AI-Powered Matching**: Intelligent user matching based on conditions and preferences
- 🛍️ **Product Discovery**: Curated wellness products from multiple sources
- 👥 **Community Support**: Social features with moderation and safety
- 📱 **Responsive Design**: Beautiful pastel UI that works on all devices
- 🔒 **Secure Authentication**: JWT-based user authentication
- 📊 **Health Analytics**: Personalized insights and recommendations

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL with Sequelize ORM
- JWT Authentication
- OpenAI Integration for AI features
- Web scraping for product data

### Frontend
- React 18 with Material-UI
- Responsive design with pastel color scheme
- React Router for navigation
- Axios for API communication

## Quick Start

### Prerequisites
- Node.js 18.x
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Health-Engagement
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd health-engagement-frontend
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   npm start
   
   # Terminal 2 - Frontend
   cd health-engagement-frontend
   npm start
   ```

## Deployment Options

### Option 1: Vercel (Recommended)
Vercel provides seamless deployment for both frontend and backend.

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

### Option 2: Heroku
Deploy backend to Heroku and frontend to Netlify.

#### Backend (Heroku)
1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL addon**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set OPENAI_API_KEY=your_openai_api_key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### Frontend (Netlify)
1. **Build the frontend**
   ```bash
   cd health-engagement-frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Update API base URL to your Heroku backend URL

### Option 3: Railway
Railway provides easy deployment for full-stack applications.

1. **Connect GitHub repository to Railway**
2. **Set environment variables**
3. **Deploy automatically on push**

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products/search` - Search products
- `GET /api/products/trending` - Get trending products

### Events
- `GET /api/events/recommended` - Get recommended events

### Social
- `GET /api/posts/all` - Get all posts
- `POST /api/posts/create` - Create new post
- `POST /api/posts/:id/like` - Like a post

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the GitHub repository.
