#!/usr/bin/env node

const axios = require('axios');

async function generateTestTraffic() {
    console.log('🚀 Generating test traffic for dashboard metrics...\n');
    
    const baseUrl = 'http://localhost';
    
    // Generate normal traffic
    console.log('📊 Generating normal API traffic...');
    for (let i = 0; i < 10; i++) {
        try {
            await axios.get(`${baseUrl}/api/health`);
            await axios.get(`${baseUrl}/api/users`);
            console.log(`✅ Normal request ${i + 1}/10`);
        } catch (error) {
            console.log(`❌ Request failed: ${error.message}`);
        }
    }
    
    // Generate some 404 errors for error analysis
    console.log('\n🔍 Generating test errors for error analysis dashboard...');
    for (let i = 0; i < 5; i++) {
        try {
            await axios.get(`${baseUrl}/api/nonexistent-endpoint-${i}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`✅ Generated 404 error ${i + 1}/5`);
            } else {
                console.log(`❌ Unexpected error: ${error.message}`);
            }
        }
    }
    
    // Generate AI service traffic
    console.log('\n🤖 Generating AI service traffic...');
    for (let i = 0; i < 5; i++) {
        try {
            const response = await axios.post(`${baseUrl}/api/chat`, {
                prompt: `Test message ${i + 1}`,
                conversationHistory: ''
            });
            console.log(`✅ AI request ${i + 1}/5 completed`);
        } catch (error) {
            console.log(`❌ AI request failed: ${error.message}`);
        }
    }
    
    console.log('\n✨ Test traffic generation complete!');
    console.log('📈 Check your Grafana dashboards now - you should see data in:');
    console.log('   • HTTP Request Rate panels');
    console.log('   • Error Analysis dashboard (404 errors)');
    console.log('   • AI Request panels');
    console.log('   • System resource usage');
}

generateTestTraffic().catch(console.error);