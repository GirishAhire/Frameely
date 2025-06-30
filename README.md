# Frameely - Custom Photo Frame E-commerce Platform

## Overview
Frameely is a full-stack e-commerce platform that allows users to upload their photos and order custom frames. The application features a React frontend with TypeScript, Node.js backend with Express, and MongoDB for database storage.

## System Requirements
- **Node.js**: v18.x or higher (tested with v21.1.0)
- **npm**: v8.x or higher (tested with v10.2.0)
- **MongoDB**: v4.4 or higher
- **Operating System**: Windows, macOS, or Linux

## Project Structure
```
Frameely-frontend-user/
├── frontend/             # Frontend React application
├── backend/              # Backend Express server
├── frontend-admin/       # Admin panel (if applicable)
├── dependency-check.js   # Script to verify dependencies
└── README.md             # This file
```

## Installation & Setup

### Prerequisites
1. Install [Node.js and npm](https://nodejs.org/)
2. Install [MongoDB](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
3. (Optional) Install [Git](https://git-scm.com/downloads)

### Quick Start
1. Clone or download the repository
2. Run the dependency check script:
   ```
   node dependency-check.js
   ```
3. Follow the instructions provided by the script to install any missing dependencies

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   MONGO_URI=mongodb://localhost:27017/frameely
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   ```
   Replace the placeholder values with your actual MongoDB connection string and Razorpay API keys.

4. Start the backend server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:5000 by default.

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_RAZORPAY_KEY=your_razorpay_key_id
   ```

4. Start the frontend development server:
   ```
   npm run dev
   ```
   The frontend will be available at http://localhost:5173 by default.

## Key Features
- User authentication and registration
- Photo upload and preview
- Frame selection and customization
- Cart functionality
- Secure payment integration with Razorpay
- Order management
- Invoice generation and download

## Dependencies

### Frontend Dependencies
- React 18
- React Router 6 (v6.22.1+)
- Axios (v1.8.4+) for API requests
- Tailwind CSS for styling
- jsPDF (v2.5.1+) and jsPDF-AutoTable (v3.8.1+) for invoice generation
- React Hook Form (v7.51.1+) with Yup validation
- date-fns (v3.3.1+) for date formatting
- Zustand (v5.0.3+) for state management
- Vite as the build tool

### Backend Dependencies
- Express (v4.21.2+)
- MongoDB with Mongoose (v8.14.0+)
- JSON Web Token (JWT) for authentication
- Multer for file uploads
- Razorpay (v2.9.6+) for payment processing
- Nodemailer for email notifications
- Zod for validation

### Required Peer Dependencies
Make sure these dependencies are correctly installed:
- For jsPDF: No specific peer dependencies
- For React Hook Form: @hookform/resolvers (v3.3.4+) when using Yup

## Dependency Verification
The project includes a dependency verification script that helps ensure all required dependencies are installed:

```bash
# From the project root
node dependency-check.js
```

This script will:
1. Check if your Node.js version is compatible
2. Verify that all required dependencies are in the package.json files
3. Check if environment files exist
4. Provide guidance on installing any missing dependencies

## Common Issues & Troubleshooting

### Missing Dependencies
If you encounter errors related to missing modules, run these commands:

```bash
# In the frontend directory
npm install react-hook-form @hookform/resolvers date-fns jspdf jspdf-autotable yup

# In the backend directory  
npm install mongoose express jsonwebtoken razorpay
```

### MongoDB Connection Issues
- Ensure MongoDB is running (if local)
- Check MONGO_URI in the .env file
- Verify network access if using MongoDB Atlas

### Razorpay Integration
- Ensure both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are valid
- For testing, use Razorpay test mode credentials
- Make sure frontend VITE_RAZORPAY_KEY matches backend RAZORPAY_KEY_ID

### PDF Generation Issues
- Install latest jsPDF and jsPDF-autotable packages:
  ```
  npm install jspdf@2.5.1 jspdf-autotable@3.8.1
  ```
- Make sure to import the modules correctly:
  ```javascript
  import { jsPDF } from "jspdf";
  import autoTable from 'jspdf-autotable';
  ```

### Node.js Version Issues
- If you encounter syntax errors or unexpected token errors, ensure you're using Node.js v18.x or higher
- You can use nvm (Node Version Manager) to switch between Node.js versions

### Vite Build Issues
- If you encounter build errors with Vite, try running:
  ```
  npm update
  npm i -D @vitejs/plugin-react@latest
  ```

### Deployment Considerations
- For production, set appropriate environment variables
- Consider using a process manager like PM2 for the backend
- Set up proper CORS configuration for production domains

## Development Workflow

### Code Formatting & Linting
The project uses ESLint and TypeScript for code quality. Run linting with:
```
npm run lint
```

### Building for Production
To build the frontend for production:
```
cd frontend
npm run build
```

The output will be in the `frontend/dist` directory, which can be deployed to any static hosting service.

## Transferring to Another Computer

### Option 1: Using Git (Recommended)
1. Commit all your changes:
   ```
   git add .
   git commit -m "Prepare for transfer"
   git push
   ```

2. On the target computer:
   ```
   git clone <your-repository-url>
   ```

3. Follow the installation steps above for both frontend and backend.

### Option 2: Using ZIP Archive
1. Make sure to exclude these directories before creating the ZIP:
   - `node_modules/` (in root, frontend, and backend directories)
   - `.git/`
   - Any large image uploads in `uploads/` directory

2. On the target computer:
   - Extract the ZIP
   - Run `npm install` in both frontend and backend directories
   - Create the required `.env` files as mentioned in the setup section
   - Run the dependency check: `node dependency-check.js`

## Additional Resources
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Razorpay Documentation](https://razorpay.com/docs/)

## License
This project is proprietary and is not licensed for redistribution or use outside of the intended users.

## Contributors
- Girish Ahire - Initial development 