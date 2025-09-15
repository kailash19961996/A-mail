# A-mail

**A full stack modern mailbox with AI features deployed fully on AWS for firms handling heavy client communication.**

Originally prototyped for my current firm, I reimagined this mailbox to handle all client-side communication (direct emails, website form submissions, client portal enquiries) with sleek and secure AI integration and fully deployed on AWS. This system has reduced time spent on client interaction by nearly 80%.

Try it yourself at [www.A-Mail.live](https://www.a-mail.live)

<img width="2380" height="1224" alt="Screenshot 2025-09-14 at 20 10 38" src="https://github.com/user-attachments/assets/f1b45ca3-f89a-4c94-a946-07a9b65f4e8a" />

[Watch the demo video](https://youtu.be/kAlLpC9a_uQ)
Leave your feedbacks [here](https://citrine-hamburger-7f5.notion.site/ebd/26e19d49e5c180fa9829de975e8ddc1a)

## Features

### Core Functionality

* **AI Assistant Integration**: A context-aware chatbot that locks to the first conversation it is opened from, ensuring continuity. Switching to other cases is seamless, but by default it stays tied to the original case for convenience and efficiency.
* **Ticket Management System**: Full CRUD operations for client tickets
* **Real-time Messaging**: Instant communication with a 5-second undo feature
* **Status Management**: Lifecycle states including Open, In Progress, On Hold, Resolved
* **Assignment System**: Distribute workload through ticket assignment
* **Group Management**: Organize tickets by department (Ops, Tech, Litigation)

### Technical Features

* **React + TypeScript Frontend**: Modern, type-safe UI, deployed on AWS Amplify
* **AWS Lambda Backend**: Python-based serverless, scalable architecture
* **Amazon S3**: Used to package Lambda layers
* **AWS API Gateway**: Manages secure connections between frontend and backend
* **DynamoDB Database**: High-performance NoSQL storage for tickets and messages
* **Real-time Updates**: Optimistic UI with backend synchronization
* **CORS Support**: Secure API access

## Architecture

```
AWS Amplify (React + TypeScript)
    ↓
AWS API Gateway (CORS configured)
    ↓
AWS Lambda (Python)
    ↓
DynamoDB (Tickets & Messages)
```

## Project Structure

```
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   ├── contexts/                # React context providers
│   ├── tickets/                 # Ticket management features
│   └── apps/                    # Main application components
├── backend/                      # AWS Lambda backend
│   ├── lambda_function.py       # Main Lambda handler
│   ├── utils.py                 # Database utilities
│   ├── ai.py                    # AI integration
│   └── requirements.txt         # Python dependencies
├── public/                      # Static assets
└── package.json                 # Frontend dependencies
```

## Setup & Installation

### Prerequisites

* Node.js 18+
* npm
* Python 3.9+
* AWS CLI configured

### Frontend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/a-mail.git
cd a-mail

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
export AWS_REGION=eu-west-2
export DYNAMODB_TICKETS_TABLE=Tickets
export DYNAMODB_MESSAGES_TABLE=TicketMessages
```

### Environment Configuration

Create `.env` file in project root:

```env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/prod
VITE_APP_NAME=A-mail
VITE_LOG_LEVEL=info
```

## Deployment

### Frontend Deployment

```bash
npm run build
# Deploy to Netlify, Vercel, or S3
```

### Backend Deployment

```bash
zip -r lambda-deployment.zip lambda_function.py utils.py ai.py
aws lambda update-function-code --function-name a-mail-api --zip-file fileb://lambda-deployment.zip
```

## API Documentation

### Tickets

* `GET /tickets` → List tickets (filterable)
* `GET /tickets/{id}` → Retrieve ticket with messages
* `POST /tickets` → Create new ticket
* `PATCH /tickets/{id}` → Update ticket

### Messages

* `GET /tickets/{id}/messages` → Get messages
* `POST /tickets/{id}/messages` → Add message

### AI Assistant

* `POST /ai/chat` → Chat with AI
* `POST /ai/reset` → Reset AI session

### Health

* `GET /health` → Service health check

## Security Features

* **Input Validation**: All input sanitized
* **CORS Protection**: Strict API rules
* **Error Handling**: No sensitive info leakage
* **Authentication Ready**: Easy integration with auth systems

## UI/UX Features

* **Modern Design**: Clean and professional
* **Responsive Layout**: Mobile + desktop support
* **Real-time Updates**: Optimistic UI feedback
* **Accessibility**: WCAG-compliant
* **Dark Mode Ready**: Easy theming

## Performance

* **Lazy Loading**: On-demand components
* **Optimistic Updates**: Instant feedback
* **Efficient Queries**: DynamoDB optimized
* **Caching**: Strategic performance improvements

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License – see [LICENSE](LICENSE)

## Acknowledgments

* Built to streamline litigation firm workflows
* Inspired by modern customer service platforms
* Developed with scalability and maintainability best practices

**A-mail** – Revolutionizing client communication with AI-powered efficiency.
