const fs = require('fs');
const path = require('path');

const scripts = [
  'run-auth-tests.sh',
  'run-basic-test.sh',
  'run-api-tests.sh',
  'make-script-executable.sh'
];

scripts.forEach(script => {
  const scriptPath = path.join(__dirname, script);
  
  try {
    fs.chmodSync(scriptPath, '755');
    console.log(`Successfully made ${script} executable`);
  } catch (error) {
    console.error(`Error making ${script} executable:`, error);
  }
});
