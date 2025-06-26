const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost';
const AI_SERVICE_URL = 'http://localhost:3002'; // Direct access for AI service
const SIMULATION_DURATION = 60000; // 1 minute
const REQUEST_INTERVAL = 2000; // 2 seconds

// Sample data for simulation
const subjects = ['math', 'science', 'english', 'history', 'physics', 'chemistry'];
const gradeLevels = ['elementary', 'middle', 'high'];
const questions = [
  'What is 2 + 2?',
  'Explain photosynthesis',
  'What is the capital of France?',
  'How does gravity work?',
  'What is the periodic table?',
  'Explain the water cycle',
  'What is algebra?',
  'How do plants grow?',
  'What is a noun?',
  'Explain the solar system'
];

const userTypes = ['student', 'teacher', 'parent'];

// Helper function to get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate user registration/login
async function simulateAuth() {
  try {
    const userData = {
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      password: 'password123',
      name: `Test User ${Math.floor(Math.random() * 1000)}`,
      grade: getRandomElement(gradeLevels),
      subject: getRandomElement(subjects)
    };

    // Try to register
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData, {
      timeout: 5000
    });
    
    console.log('✅ Simulated user registration');
    return response.data;
  } catch (error) {
    // If registration fails (user exists), try login
    try {
      const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'testuser@example.com',
        password: 'password123'
      }, {
        timeout: 5000
      });
      console.log('✅ Simulated user login');
      return loginResponse.data;
    } catch (loginError) {
      console.log('⚠️ Auth simulation failed, continuing without auth');
      return null;
    }
  }
}

// Simulate AI chat interactions
async function simulateAiChat() {
  try {
    const question = getRandomElement(questions);
    const subject = getRandomElement(subjects);
    
    const response = await axios.post(`${AI_SERVICE_URL}/api/chat`, {
      prompt: question,
      learningContext: {
        subject: subject,
        gradeLevel: getRandomElement(gradeLevels)
      }
    }, {
      timeout: 10000
    });
    
    console.log(`✅ AI Chat: "${question}" (${subject})`);
    return response.data;
  } catch (error) {
    console.log(`❌ AI Chat failed: ${error.message}`);
    return null;
  }
}

// Simulate backend API calls
async function simulateBackendActivity() {
  try {
    // Health check
    await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    console.log('✅ Backend health check');

    // Simulate getting user profile (will likely fail without auth, but generates metrics)
    try {
      await axios.get(`${BACKEND_URL}/api/users/profile`, { timeout: 5000 });
    } catch (error) {
      // Expected to fail without proper auth
    }

    // Simulate learning materials request
    try {
      await axios.get(`${BACKEND_URL}/api/materials`, { timeout: 5000 });
    } catch (error) {
      // Expected to fail without proper auth
    }

    return true;
  } catch (error) {
    console.log(`❌ Backend activity failed: ${error.message}`);
    return false;
  }
}

// Simulate user engagement metrics
async function simulateUserEngagement() {
  const sessionDuration = Math.floor(Math.random() * 1800) + 300; // 5 minutes to 30 minutes
  const userType = getRandomElement(userTypes);
  
  console.log(`👤 Simulating ${userType} session (${sessionDuration}s)`);
  
  // Simulate multiple questions during a session
  const questionsInSession = Math.floor(Math.random() * 5) + 1;
  
  for (let i = 0; i < questionsInSession; i++) {
    await simulateAiChat();
    await delay(Math.random() * 3000 + 1000); // 1-4 seconds between questions
  }
}

// Simulate mobile traffic
async function simulateMobileTraffic() {
  try {
    const mobileUserAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
      'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
    ];

    const headers = {
      'User-Agent': getRandomElement(mobileUserAgents)
    };

    await axios.get(`${BACKEND_URL}/health`, { headers, timeout: 5000 });
    await axios.post(`${AI_SERVICE_URL}/api/chat`, {
      prompt: getRandomElement(questions)
    }, { headers, timeout: 10000 });

    console.log('📱 Simulated mobile traffic');
  } catch (error) {
    console.log(`❌ Mobile simulation failed: ${error.message}`);
  }
}

// Main simulation function
async function runSimulation() {
  console.log('🚀 Starting BrainBytes activity simulation...');
  console.log(`Duration: ${SIMULATION_DURATION / 1000} seconds`);
  console.log(`Request interval: ${REQUEST_INTERVAL / 1000} seconds`);
  console.log('');

  const startTime = Date.now();
  let requestCount = 0;

  while (Date.now() - startTime < SIMULATION_DURATION) {
    requestCount++;
    console.log(`\n--- Request ${requestCount} ---`);

    // Run different types of simulations
    const simulations = [
      simulateAuth(),
      simulateAiChat(),
      simulateBackendActivity(),
      simulateUserEngagement(),
      simulateMobileTraffic()
    ];

    // Run 2-3 random simulations per cycle
    const numSimulations = Math.floor(Math.random() * 2) + 2;
    const selectedSimulations = simulations
      .sort(() => 0.5 - Math.random())
      .slice(0, numSimulations);

    await Promise.all(selectedSimulations);

    // Wait before next cycle
    await delay(REQUEST_INTERVAL);
  }

  console.log('\n🎉 Simulation completed!');
  console.log(`Total requests: ${requestCount}`);
  console.log('\n📊 Check Prometheus metrics at:');
  console.log('- Backend metrics: http://localhost:3000/metrics');
  console.log('- AI Service metrics: http://localhost:3002/metrics');
  console.log('- Prometheus UI: http://localhost:9090');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Simulation stopped by user');
  process.exit(0);
});

// Start simulation
if (require.main === module) {
  runSimulation().catch(error => {
    console.error('❌ Simulation failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runSimulation,
  simulateAuth,
  simulateAiChat,
  simulateBackendActivity,
  simulateUserEngagement,
  simulateMobileTraffic
};