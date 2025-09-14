# A-mail

**A full stack modern mailbox with AI driven features for litigation firms**

Originally prototyped for my current firm, this mailbox reimagines all client side communication (direct emails, website form submissions, client portal enquiries) with sleek and secure AI integration which has cut down almost 80% of time spent on client interaction.

Link
Screenshot
Video

## Features

### Core Functionality
- **Ticket Management System**: Complete CRUD operations for client tickets
- **Real-time Messaging**: Instant messaging with 5-second undo functionality
- **AI Assistant Integration**: Intelligent chat support for case analysis and handling
- **Status Management**: Comprehensive ticket lifecycle management (Open, In Progress, On Hold, Resolved)
- **Assignment System**: Ticket assignment and workload distribution
- **Group Management**: Organize tickets by department (Ops Team, Tech, Litigation)

### Technical Features
- **React + TypeScript Frontend**: Modern, type-safe user interface
- **AWS Lambda Backend**: Serverless architecture for scalability
- **DynamoDB Database**: NoSQL database for high performance
- **Real-time Updates**: Optimistic UI updates with backend synchronization
- **Comprehensive Logging**: Detailed logging for debugging and monitoring
- **CORS Support**: Cross-origin resource sharing for secure API access through AWS API gateway

## Architecture

```
Frontend (React + TypeScript)
    ↓
AWS API Gateway
    ↓
AWS Lambda (Python)
    ↓
DynamoDB (Tickets & Messages)
```

## Project Structure

```
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   ├── contexts/               # React context providers
│   ├── tickets/                # Ticket management features
│   └── apps/                   # Main application components
├── backend/                     # AWS Lambda backend
│   ├── lambda_function.py      # Main Lambda handler
│   ├── utils.py               # Database utilities
│   ├── ai.py                  # AI integration
│   └── requirements.txt       # Python dependencies
├── public/                     # Static assets
└── package.json               # Frontend dependencies
```

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ (for backend development)
- AWS CLI configured (for deployment)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/a-mail.git
cd a-mail

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
export AWS_REGION=eu-west-2
export DYNAMODB_TICKETS_TABLE=Tickets
export DYNAMODB_MESSAGES_TABLE=TicketMessages
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_APP_NAME=A-mail
VITE_LOG_LEVEL=info
```

## Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your hosting provider (Netlify, Vercel, S3, etc.)
```

### Backend Deployment
```bash
# Package Lambda function
zip -r lambda-deployment.zip lambda_function.py utils.py ai.py

# Deploy using AWS CLI or Serverless Framework
aws lambda update-function-code --function-name a-mail-api --zip-file fileb://lambda-deployment.zip
```

## API Documentation

### Endpoints

#### Tickets
- `GET /tickets` - List all tickets with optional filtering
- `GET /tickets/{id}` - Get single ticket with messages
- `POST /tickets` - Create new ticket
- `PATCH /tickets/{id}` - Update ticket status/assignment

#### Messages
- `GET /tickets/{id}/messages` - Get ticket messages
- `POST /tickets/{id}/messages` - Add message to ticket

#### AI Assistant
- `POST /ai/chat` - Send message to AI assistant
- `POST /ai/reset` - Reset AI conversation session

#### Health Check
- `GET /health` - Service health status

### Request/Response Examples



## Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **CORS Protection**: Configured for secure cross-origin requests
- **Error Handling**: Comprehensive error handling without information leakage
- **Authentication Ready**: Placeholder authentication system for easy integration

## UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on desktop and mobile devices
- **Real-time Updates**: Optimistic UI updates for better user experience
- **Accessibility**: WCAG compliant design patterns
- **Dark Mode Ready**: CSS custom properties for easy theming

## Performance

- **Lazy Loading**: Components loaded on demand
- **Optimistic Updates**: Immediate UI feedback
- **Efficient Queries**: Optimized DynamoDB queries
- **Caching**: Strategic caching for better performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Originally developed for litigation firm workflow optimization
- Inspired by modern customer service platforms
- Built with best practices for scalability and maintainability

**A-mail** - Revolutionizing client communication for firms with AI-powered efficiency.