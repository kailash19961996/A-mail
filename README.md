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
- `/admin/users` - User Management (Fully Implemented)

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

### Environment Variables
The application automatically detects the environment using `VITE_IS_PRODUCTION`:
- **Production Mode**: `VITE_IS_PRODUCTION = true`
- **Beta Mode**: `VITE_IS_PRODUCTION = false`

### Build Scripts
- **`npm run dev`**: Production mode (production API endpoints)
- **`npm run dev:beta`**: Beta mode (beta API endpoints)
- **`npm run build`**: Production build
- **`npm run build:beta`**: Beta build

### Local Development
- **Production mode**: Direct API calls to production endpoints
- **Beta mode**: Direct API calls to beta endpoints
- No proxy configuration needed - direct API calls based on build mode

### CORS and Local File Access
- **Local Development Server**: Use `npm run dev` or `npm run dev:beta` for proper CORS handling
- **Direct File Access**: Opening `dist/index.html` directly in browser may cause CORS errors
  - This is expected behavior for security reasons
  - Not an issue when deployed to a proper domain
  - Always use the development server for local testing

#### Solution: Test Built Files Locally Without CORS
After building, you can test the production build locally without CORS issues:

```bash
# Build the application first
npm run build

# Then serve it locally (choose one):
npm run serve          # Lightweight static server (recommended)
npm run preview        # Vite's built-in preview server
npm run preview:local  # Network-accessible preview server
```

**Quick Start Scripts** (Windows):
- **Batch File**: Double-click `test-local.bat` to build and serve automatically
- **PowerShell**: Right-click `test-local.ps1` → "Run with PowerShell"

These scripts will:
1. Build your application (`npm run build`)
2. Start the local server (`npm run serve`)
3. Open your browser to `http://localhost:4173`

This approach:
- ✅ Eliminates CORS errors
- ✅ Provides proper asset loading
- ✅ Maintains production build integrity
- ✅ No impact on AWS Amplify deployments
- ✅ Allows testing of the exact production build locally

### Deployment
- **Main branch**: Production API endpoints (AWS Amplify automatically runs `npm run build`)
- **Other branches**: Beta API endpoints (AWS Amplify automatically runs `npm run build:beta`)
- Automatic environment detection in Amplify based on branch name

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
   # Development (production API)
   npm run dev
   
   # Development (beta API)
   npm run dev:beta
   ```

### Build
```bash
# Production build
npm run build

# Beta build
npm run build:beta
```

### Local Testing of Built Files
```bash
# After building, test locally without CORS issues:
npm run serve          # Lightweight static server (recommended)
npm run preview        # Vite's built-in preview server
npm run preview:local  # Network-accessible preview server
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

### Complete Login Process

#### 1. Email Input & Validation
- User enters email address in the login form
- Real-time email format validation using regex pattern
- System checks if email is valid before allowing submission
- **API Endpoint**: `POST /login`
- **Request**: `{ email: string }`
- **Response**: 
  ```json
  {
    "user_id": "string",
    "auth_options": ["email", "sms"],
    "sms_otp_num": "string | null"
  }
  ```

#### 2. Authentication Method Selection
- **Single Method Available**: Automatically proceeds to OTP request
- **Multiple Methods Available**: User chooses between:
  - Email OTP (always available)
  - SMS OTP (if `sms_otp_num` is provided)
- **API Endpoint**: `POST /otp-request`
- **Request**: `{ user_id: string, otp_method: "email" | "sms" }`
- **Response**:
  ```json
  {
    "user_id": "string",
    "otp_method": "email" | "sms",
    "otp_code_expire": number // Unix timestamp
  }
  ```

#### 3. OTP Verification
- User receives 6-digit OTP code via selected method
- **Countdown Timer**: Shows remaining time before code expires
- **Input Validation**: Only numeric input, max 6 digits
- **API Endpoint**: `POST /otp-verify`
- **Request**: 
  ```json
  {
    "user_id": "string",
    "otp_code": "string",
    "otp_method": "email" | "sms"
  }
  ```

#### 4. Authentication Success
- OTP verification successful
- User is redirected to `/home`
- **AuthContext** automatically runs authentication check
- User session is established with cookies
- Navigation to protected routes is enabled

### Security Features
- **OTP Expiration**: Automatic timeout with countdown display
- **Rate Limiting**: API-level protection against brute force
- **Secure Cookies**: `withCredentials: true` for session management
- **Error Handling**: Custom error messages from API responses
- **Session Validation**: Continuous authentication checks on route changes

### Error Handling
- **Invalid Email**: Real-time validation feedback
- **Login Failures**: Custom error messages from API (400/401 status)
- **OTP Failures**: Specific error messages for verification issues
- **Network Errors**: Graceful fallback with administrator contact info
- **Session Expiry**: Automatic redirect to login page

### API Error Response Format
```json
{
  "status": 400 | 401,
  "data": {
    "responseMsg": "Custom error message from server"
  }
}
```

### Form Validation
- Email must be valid format
- OTP code must be exactly 6 digits
- Real-time validation feedback
- Error messages for failed attempts

## Development

### Development Logging with dev_log()

The application includes a comprehensive logging system using the `dev_log()` function from `coreUtils.ts`. This function:

#### Duplicate API Call Prevention
The system includes safeguards to prevent duplicate API calls:
- **Auth Check Protection**: Prevents multiple simultaneous authentication checks
- **Initial Auth Guard**: Ensures the initial auth check only runs once per session  
- **API Instance Optimization**: Creates API instances only when needed to avoid recreation
- **Render Optimization**: Simplified main.tsx to prevent multiple AuthContext recreations

- **Only logs in beta/development mode** (`npm run dev:beta`)
- **Silent in production mode** (`npm run dev` or `npm run build`)
- **Provides detailed visibility** into application behavior
- **Uses emojis** for easy identification of log types

#### Log Categories
- 🔐 **Authentication**: Login, logout, auth checks, user state, OTP requests/verification
- 🧭 **Navigation**: Route changes, navigation requests, page access
- 📡 **API Calls**: Request/response data, error handling, payload information
- 🔐 **Access Control**: User permissions, route protection, admin page access
- 🎭 **Component Lifecycle**: Renders, effects, state changes, page mounting
- 🌐 **API Configuration**: Instance creation, environment detection, base URL setup
- 👥 **User Management**: Page access, data loading, user actions
- 🔧 **Client Review**: Data loading, bulk operations, individual actions, approval/rejection
- 🏠 **Home Page**: Dashboard data loading, user type detection, mock data setup
- ⚙️ **Admin Pages**: Page access logging for all admin sections

#### Usage Example
```typescript
import { dev_log } from '../utils/coreUtils';

// Log with context
dev_log('🔐 User authentication started:', { userId, timestamp });

// Log API responses
dev_log('📡 API response received:', response.data);

// Log errors
dev_log('💥 Error occurred:', error);
```

#### Implementation Details
The logging system is implemented across all major components and pages:

**Authentication & User Management**
- LoginPage: Email validation, OTP requests, verification attempts
- AuthContext: Authentication checks, user state changes, logout process
- UserManagement: Page access, data loading, user actions

**Navigation & Routing**
- AppMain: Route changes, authentication verification, navigation events
- Sidebar: Navigation requests, user access levels, available sections
- Header: Logout initiation and user interactions

**Data Operations**
- HomePage: Dashboard data loading, user type detection
- ClientReviewPage: Client data loading, bulk operations, individual actions
- All admin pages: Access logging and page interactions

**API & Configuration**
- coreUtils: API instance creation, environment detection
- All API calls: Request/response logging, error handling
- Environment setup: Production vs beta mode detection

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

- **Main branch**: Production API endpoints (runs `npm run build`)
- **Feature branches**: Beta API endpoints (runs `npm run build:beta`)

### Build Commands
- Production: `npm run build`
- Beta: `npm run build:beta`

### Local Testing of Built Files
After building, you can test the production build locally without CORS issues:

- **Vite Preview Server**: `npm run preview` (default Vite preview)
- **Local Network Preview**: `npm run preview:local` (accessible from other devices on network)
- **Static File Server**: `npm run serve` (lightweight server, best for local testing)

**Note**: These commands only affect local testing and have no impact on AWS Amplify deployments.

### Node.js Version
- **Local Development**: Node.js 20+ recommended
- **AWS Amplify**: Automatically uses Node.js 20 via `nvm use 20`
- **Build Environment**: Verified Node.js and npm versions during build

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

### 🆕 Recent Additions (Latest Update)
- **User Management Page**: Fully implemented admin page for managing system users
  - User search and filtering capabilities
  - User type and status filters (Active/Inactive/Suspended)
  - Mock data integration with proper TypeScript interfaces
  - Role-based access control (Admin/SysAdmin only)
  - Responsive table layout with user actions (Edit, Suspend, Delete)
- **Environment Configuration**: Streamlined build and development setup
  - `npm run dev` now uses production API endpoints
  - `npm run dev:beta` uses beta API endpoints
  - Automatic environment detection via `VITE_IS_PRODUCTION`
  - Cleaned up vite.config.ts (removed unnecessary proxy configuration)
- **Comprehensive Development Logging**: Added `dev_log()` function throughout the application
  - **LoginPage**: Complete authentication flow logging (email validation, OTP requests, verification)
  - **AuthContext**: Authentication checks, logout process, user state changes
  - **AppMain**: Route changes, authentication verification, navigation events
  - **Sidebar**: Navigation requests, user access levels, available navigation groups
  - **Header**: Logout initiation logging
  - **HomePage**: Dashboard data loading, user type detection, mock data setup
  - **ClientReviewPage**: Data loading, client selection, bulk operations, approval/rejection actions
  - **UserManagement**: Page access, data loading, user actions
  - **Admin Pages**: Access logging for all admin sections (General, Templates, Lenders, Actions)
  - **coreUtils**: API instance creation and configuration logging
- **Code Cleanup**: Removed unused page files (AdminPage.tsx, CasesPage.tsx)
- **AWS Amplify**: Updated build configuration with Node.js 20 support

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
