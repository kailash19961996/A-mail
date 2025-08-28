# BlueLion Claims Ecosystem Portal Frontend

A comprehensive React TypeScript frontend application for the BlueLion Claims ecosystem portal, featuring authentication, role-based access control, and a modern user interface.

## Features

- **Authentication System**: Secure login with email/password and OTP verification (SMS or Email)
- **Role-Based Access Control**: Different navigation and features based on user types and roles
- **Responsive Design**: Modern, mobile-friendly interface with collapsible sidebar
- **Route Protection**: Automatic authentication checks and redirects
- **Loading States**: Smooth loading experiences with spinners and transitions
- **Form Validation**: Real-time email validation and OTP code verification
- **Environment Management**: Automatic API endpoint switching between beta and production

## Architecture

### App Structure
- **AppLogin**: Handles all unauthenticated routes, redirects to login page
- **AppMain**: Main application with header, sidebar, and protected routes
- **AuthContext**: Global authentication state management with integrated API calls
- **API Service**: Centralized HTTP client with authentication interceptors

### Routing Structure
The application now features a hierarchical navigation system with the following main sections:

#### Main Section
- `/home` - Dynamic home page (content varies by user type)

#### Validation Screens
- `/validate/client-review` - **Client Review** - Fully implemented with table view, signature display, bulk actions, and approval/rejection workflow
- `/validate/id-review` - ID document review (In Development)

#### Review Screens
- `/review/sar` - SAR document review (In Development)
- `/review/presub` - PreSub document review (In Development)
- `/review/floc` - FLOC document review (In Development)

#### All Data
- `/all-clients` - Complete client database (In Development)
- `/all-cases` - Complete case database (In Development)

#### Admin Section (Admin/SysAdmin only)
- `/admin/config` - General configuration (In Development)
- `/admin/templates` - Communication templates configuration (In Development)
- `/admin/lenders` - Lenders configuration (In Development)
- `/admin/actions` - Actions configuration (In Development)

### User Types and Access Control
The system now supports three user types with different access levels:

- **SysAdmin**: Full access to all sections and features
- **Admin**: Access to all main sections and admin configuration
- **CaseHandler**: Access to main sections and validation/review screens

### Components
- **Header**: Logo, business name, user welcome message, and logout button
- **Sidebar**: Collapsible navigation with grouped sections and role-based access
- **Loader**: Reusable loading spinner component with customizable sizes
- **Pages**: Individual page components for different sections

## Environment Configuration

### API Endpoints
- **Production**: `https://api.bluelionclaims.co.uk/internal`
- **Beta**: `https://beta-api.bluelionclaims.co.uk/internal`

### Local Development
- Uses proxy configuration to route `/api/*` requests to beta API
- Automatically switches between environments based on build mode

### Deployment
- **Main branch**: Production API endpoints
- **Other branches**: Beta API endpoints
- Automatic environment detection in Amplify

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   # Development (beta API)
   npm run dev
   
   # Development with production API
   npm run dev:prod
   ```

### Build
```bash
# Production build
npm run build

# Beta build
npm run build:beta
```

## API Endpoints

The application expects the following API endpoints:

- `GET /auth-check` - Authentication check (returns user_type and user_roles)
- `POST /login` - User login (email submission)
- `POST /otp-request` - Request OTP code (SMS or Email)
- `POST /otp-verify` - Verify OTP code
- `POST /logout` - User logout
- `GET /general-data/lead-gen-summary` - Lead generation summary (Admin/SysAdmin)
- `GET /general-data/user-summary` - User summary (CaseHandler)

### Client Review API (Fully Implemented)
- `GET /validation/client-review` - Retrieve client list with signatures for review
- `POST /validation/client-review` - Submit approval/rejection actions for clients

## User Types and Roles

### User Types
- **SysAdmin**: Full system access with all permissions
- **Admin**: Administrative access with configuration capabilities
- **CaseHandler**: Case management and review access

### User Roles (Future Implementation)
The system is designed to support granular role-based permissions including:
- AdminTemplates, AdminLenders, AdminActions, AdminConfig
- ReviewClient, ReviewID, ReviewSAR, ReviewPreSub, ReviewFLOC
- CasesAll, CasesAllViewOnly, ClientsAll, ClientsAllViewOnly
- TicketsAll, ProcessUTL, ProcessSAR, ProcessPreSub, ProcessFLOC
- DataExportAll

## Authentication Flow

### Login Process
1. User enters email address
2. System validates email format
3. User selects authentication method (SMS or Email)
4. OTP code is sent to selected method
5. User enters 6-digit OTP code
6. Code is verified and user is authenticated
7. User is redirected to dashboard

### Form Validation
- Email must be valid format
- OTP code must be exactly 6 digits
- Real-time validation feedback
- Error messages for failed attempts

## Development

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `AppMain.tsx` with appropriate access control
3. Add navigation item in `Sidebar.tsx` with appropriate user type/role restrictions

### Styling
The application uses custom CSS utilities similar to Tailwind CSS. Add new utility classes in `src/index.css` as needed.

### Authentication Flow
1. App loads with initial loader (embedded in HTML)
2. AuthContext checks authentication status
3. Routes to AppLogin or AppMain based on auth state
4. Continuous auth checks on navigation
5. Automatic logout and redirect on auth failure

## Deployment

### Amplify Configuration
The application is configured for AWS Amplify deployment with automatic environment detection:

- **Main branch**: Production API endpoints
- **Feature branches**: Beta API endpoints

### Build Commands
- Production: `npm run build`
- Beta: `npm run build:beta`

## Security Features

- Secure cookie handling with `withCredentials: true`
- Role-based route protection based on user types and roles
- Automatic authentication verification
- Secure logout with cookie cleanup
- API error handling with automatic redirects
- Form validation and sanitization
- OTP-based authentication for enhanced security

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Current Status

### ✅ Resolved Issues
- TypeScript `any` type usage replaced with proper typing
- Unused variable warnings resolved
- Build errors fixed
- Proper error handling for API calls
- Removed separate AuthApiService class
- Integrated API calls directly into AuthContext functions
- Enhanced error handling for `responseMsg` field in API responses
- Updated branding from "BlueLion Law" to "BlueLion Claims"
- Implemented new navigation structure with grouped sections
- Added user type and role-based access control
- Updated HomePage to show different content based on user type
- Created dedicated page components for all routes
- Implemented fully functional Client Review page with:
  - Table view of clients with signatures
  - Bulk selection and actions
  - Individual approve/reject buttons
  - Rejection reason modal
  - API integration for all actions
  - Proper error handling and loading states

### ⚠️ Known Warnings
- Fast refresh warning in AuthContext (doesn't affect functionality)

### 🔧 Technical Improvements
- Enhanced error handling with proper TypeScript types
- Improved API response handling
- Better type safety throughout the application
- Direct API integration in AuthContext for better maintainability
- Proper error message extraction from API responses (400/401 status codes)
- New hierarchical navigation system with grouped sections
- User type and role-based access control system
- Dynamic content rendering based on user permissions
- Modular page component architecture
- Comprehensive client review functionality with full CRUD operations

## Error Handling

### API Error Response Format
The application properly handles API error responses and extracts custom error messages:

```typescript
// Example API error response structure
{
  "status": 400,
  "data": {
    "responseMsg": "Custom error message from API"
  }
}
```

### Error Handling in AuthContext
- **checkAuth()**: Handles authentication failures and extracts custom error messages from API responses
- **logout()**: Handles logout failures and extracts custom error messages from API responses
- Both functions properly handle 400 and 401 status codes and look for `responseMsg` field

### Error Handling in LoginPage
- **handleEmailSubmit()**: Extracts custom error messages for login failures
- **handleOtpRequest()**: Extracts custom error messages for OTP request failures  
- **handleOtpSubmit()**: Extracts custom error messages for OTP verification failures
- All functions properly handle 400 and 401 status codes and display custom error messages to users

### Error Handling in ClientReviewPage
- **loadClientReviewData()**: Handles API errors when loading client review data
- **submitClientAction()**: Handles API errors when submitting approval/rejection actions
- Proper error display and user feedback for all operations

## Client Review Functionality

The Client Review page (`/validate/client-review`) is fully implemented with the following features:

### Data Display
- Table view of clients with columns: Client ID, First Name, Last Name, Date of Birth, Signature, Actions
- Signature images displayed from base64 encoded data
- Minimum row height of 25px for signature column
- Responsive table with horizontal scrolling

### Bulk Operations
- Checkbox selection for multiple clients
- "Approve Selected" button for bulk approvals
- "Reject Selected" button with rejection reason modal
- Select all/none functionality

### Individual Actions
- Approve button for each client row
- Reject button for each client row
- Consistent styling and behavior with bulk operations

### Rejection Workflow
- Modal popup for selecting rejection reason
- Default reasons: "Hoax Name", "Invalid Signature"
- Proper form validation and submission

### API Integration
- `GET /validation/client-review` - Loads client data on page load
- `POST /validation/client-review` - Submits approval/rejection actions
- Proper error handling and user feedback
- Loading states during API operations

### User Experience
- Loading spinners during data fetch and operations
- Error messages for failed operations
- Success feedback with automatic list updates
- Responsive design for all screen sizes

## License

Private - BlueLion Claims
