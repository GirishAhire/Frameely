const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Required dependencies for frontend
const requiredFrontendDeps = {
  react: "18.x",
  "react-dom": "18.x",
  "react-router-dom": "6.x",
  axios: "1.x",
  "react-hook-form": "7.x",
  "@hookform/resolvers": "3.x",
  "date-fns": "3.x",
  jspdf: "2.x",
  "jspdf-autotable": "3.x",
  yup: "1.x",
  zustand: "5.x"
};

// Required dependencies for backend
const requiredBackendDeps = {
  express: "4.x",
  mongoose: "8.x",
  jsonwebtoken: "9.x",
  razorpay: "2.x",
  multer: "1.x",
  nodemailer: "6.x",
  zod: "3.x"
};

console.log("Frameely Dependency Check Tool");
console.log("==============================");
console.log("This tool will check if all required dependencies are installed correctly.");

function checkNodeVersion() {
  try {
    const nodeVersion = process.version;
    console.log(`\nNode.js version: ${nodeVersion}`);
    
    const versionNumber = parseFloat(nodeVersion.replace('v', ''));
    if (versionNumber < 18) {
      console.error("⚠️ WARNING: Node.js version should be 18.x or higher for best compatibility.");
    } else {
      console.log("✅ Node.js version is compatible.");
    }
  } catch (error) {
    console.error("Failed to check Node.js version:", error.message);
  }
}

function checkPackageJson(packagePath, requiredDeps, name) {
  console.log(`\nChecking ${name} dependencies...`);
  
  try {
    if (!fs.existsSync(packagePath)) {
      console.error(`⚠️ Could not find package.json at ${packagePath}`);
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    let missingDeps = [];
    
    for (const [dep, version] of Object.entries(requiredDeps)) {
      if (!dependencies[dep]) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length === 0) {
      console.log(`✅ All required ${name} dependencies are present in package.json.`);
      return true;
    } else {
      console.error(`⚠️ Missing dependencies in ${name}:`);
      missingDeps.forEach(dep => console.error(`  - ${dep} (required: ${requiredDeps[dep]})`));
      
      console.log("\nInstall missing dependencies with:");
      console.log(`cd ${path.dirname(packagePath)} && npm install ${missingDeps.join(' ')}`);
      return false;
    }
  } catch (error) {
    console.error(`Failed to check ${name} package.json:`, error.message);
    return false;
  }
}

function checkMongoDB() {
  console.log("\nChecking MongoDB...");
  try {
    // A very basic check - in a real scenario, you would connect to MongoDB
    console.log("ℹ️ This script cannot verify MongoDB connectivity directly.");
    console.log("ℹ️ Make sure MongoDB is running and accessible via the connection string in your .env file.");
  } catch (error) {
    console.error("Failed to check MongoDB:", error.message);
  }
}

function checkEnvFiles() {
  console.log("\nChecking environment files...");
  
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  
  if (!fs.existsSync(frontendEnvPath)) {
    console.error("⚠️ Frontend .env file not found.");
    console.log(`Create a .env file at ${frontendEnvPath} with the following content:`);
    console.log(`
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY=your_razorpay_key_id
`);
  } else {
    console.log("✅ Frontend .env file exists.");
  }
  
  if (!fs.existsSync(backendEnvPath)) {
    console.error("⚠️ Backend .env file not found.");
    console.log(`Create a .env file at ${backendEnvPath} with the following content:`);
    console.log(`
MONGO_URI=mongodb://localhost:27017/frameely
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
`);
  } else {
    console.log("✅ Backend .env file exists.");
  }
}

function main() {
  checkNodeVersion();
  
  const frontendPackagePath = path.join(__dirname, 'frontend', 'package.json');
  const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
  
  const frontendOk = checkPackageJson(frontendPackagePath, requiredFrontendDeps, "Frontend");
  const backendOk = checkPackageJson(backendPackagePath, requiredBackendDeps, "Backend");
  
  checkMongoDB();
  checkEnvFiles();
  
  console.log("\nSummary:");
  if (frontendOk && backendOk) {
    console.log("✅ All required dependencies are present in package.json files.");
    console.log("⚠️ Note: This doesn't guarantee that all node_modules are installed correctly.");
    console.log("Run 'npm install' in both frontend and backend directories to ensure all dependencies are installed.");
  } else {
    console.log("⚠️ Some dependencies are missing. Follow the instructions above to install them.");
  }
  
  console.log("\nFor full setup instructions, please read the README.md file.");
}

main(); 