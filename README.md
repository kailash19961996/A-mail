# A-Mail

**A full stack, modern, AI mailbox deployed fully on AWS for firms handling heavy client communication.**

Originally prototyped for my current firm, I reimagined this AI infused mailbox to handle all client-side communication (direct emails, website form submissions, client portal enquiries) with sleek and secure AI integration and fully deployed on AWS. This system has reduced time spent on client interaction by <span style="color:red; font-weight:bold;">nearly 70%.</span>

Try it yourself at [www.A-Mail.live](https://www.a-mail.live)

<img width="2380" height="700" alt="Screenshot 2025-09-14 at 20 10 38" src="https://github.com/user-attachments/assets/f1b45ca3-f89a-4c94-a946-07a9b65f4e8a" />

[CLICK HERE FOR DEMO VIDEO](https://youtu.be/kAlLpC9a_uQ)

[LEAVE YOUR FEEDBACK HERE](https://slately.notion.site/26e19d49e5c180fa9829de975e8ddc1a?pvs=105)

### Technical Features

| Tech | Description |
|---------|-------------|
| <span style="color:red; font-weight:bold;">AWS Route 52</span> | Domain, routing and metrics |
| <span style="color:red; font-weight:bold;">AWS Amplify - React + TypeScript - Frontend</span> | Modern, type-safe UI, deployed on AWS Amplify |
| <span style="color:red; font-weight:bold;">AWS Lambda - Python - Backend</span> | Python-based serverless, scalable architecture |
| <span style="color:red; font-weight:bold;">Amazon S3</span> | Used to package Lambda layers |
| <span style="color:red; font-weight:bold;">AWS API Gateway</span> | Manages secure connections between frontend and backend |
| <span style="color:red; font-weight:bold;">AWS DynamoDB Database</span> | High-performance NoSQL storage for tickets and messages |
| <span style="color:red; font-weight:bold;">CloudWatch</span> | For logging and monitoring |
| <span style="color:red; font-weight:bold;">CORS Support</span> | Secure API access |
| <span style="color:red; font-weight:bold;">OpenAI API</span> | For LLM support |
| <span style="color:red; font-weight:bold;">Github Action</span> | For CI/CD |

### Core Functionality

* **AI Assistant Integration**: A context-aware chatbot that locks to the first conversation it is opened from, ensuring continuity. Switching to other cases is seamless, but by default it stays tied to the original case for convenience and efficiency.
* **Ticket Management System**: Full CRUD operations for client tickets
* **Real-time Messaging**: Instant communication with a 5-second undo feature
* **Status Management**: Lifecycle states including Open, In Progress, On Hold, Resolved
* **Assignment System**: Distribute workload through ticket assignment
* **Group Management**: Organize tickets by department (Ops, Tech, Litigation)

## Architecture

```
AWS Route 52
    ↓
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
