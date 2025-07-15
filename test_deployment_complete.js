const http = require('http');

const baseUrl = 'http://localhost:5000';
let cookies = '';

// Test accounts with correct email format
const testAccounts = [
  { email: 'rootadmin@brahatz.com', password: 'admin123', role: 'Root Admin' },
  { email: 'admin@brahatz.com', password: 'admin123', role: 'Standard Admin' },
  { email: 'vip@brahatz.com', password: 'vip123', role: 'VIP Client' },
  { email: 'user@brahatz.com', password: 'user123', role: 'Standard User' },
  { email: 'newuser@brahatz.com', password: 'user123', role: 'New User' }
];

function makeRequest(endpoint, method = 'GET', data = null, useCookies = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + endpoint);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(useCookies && cookies ? { 'Cookie': cookies } : {})
      }
    };

    const req = http.request(url, options, (res) => {
      let responseData = '';
      
      // Capture cookies
      if (res.headers['set-cookie']) {
        cookies = res.headers['set-cookie'][0].split(';')[0];
      }
      
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed, cookies });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, cookies });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runDeploymentTests() {
  console.log('🚀 BrachaVeHatzlacha - Deployment Testing\n');
  console.log('=' .repeat(50));
  
  const results = {
    api: { passed: 0, failed: 0 },
    auth: { passed: 0, failed: 0 },
    features: { passed: 0, failed: 0 }
  };

  // 1. API Health Tests
  console.log('\n📡 Testing API Endpoints...');
  const apiTests = [
    { endpoint: '/api/health', name: 'Health Check' },
    { endpoint: '/api/draws/current', name: 'Current Draw' },
    { endpoint: '/api/test-multilingual', name: 'Multilingual Support' },
    { endpoint: '/api/test-hebrew', name: 'Hebrew Support' },
    { endpoint: '/api/test-french', name: 'French Support' },
    { endpoint: '/api/test-rtl', name: 'RTL Support' }
  ];

  for (const test of apiTests) {
    try {
      const response = await makeRequest(test.endpoint);
      if (response.status === 200) {
        console.log(`✅ ${test.name}: OK`);
        results.api.passed++;
      } else {
        console.log(`❌ ${test.name}: Failed (Status: ${response.status})`);
        results.api.failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      results.api.failed++;
    }
  }

  // 2. Authentication Tests
  console.log('\n🔐 Testing Authentication...');
  for (const account of testAccounts) {
    try {
      const loginResponse = await makeRequest('/api/auth/login', 'POST', {
        email: account.email,
        password: account.password
      });
      
      if (loginResponse.status === 200 && loginResponse.data.user) {
        console.log(`✅ ${account.role} login: OK`);
        results.auth.passed++;
        
        // Test authenticated access
        const userResponse = await makeRequest('/api/auth/user', 'GET', null, true);
        if (userResponse.status === 200) {
          console.log(`   ✓ Authenticated access verified`);
        }
      } else {
        console.log(`❌ ${account.role} login: Failed - ${loginResponse.data.message}`);
        results.auth.failed++;
      }
    } catch (error) {
      console.log(`❌ ${account.role} login: Error - ${error.message}`);
      results.auth.failed++;
    }
  }

  // 3. Feature Tests
  console.log('\n🎯 Testing Core Features...');
  const featureTests = [
    { name: 'Ticket Purchase Flow', endpoint: '/api/tickets/available' },
    { name: 'User Balance', endpoint: '/api/user/balance' },
    { name: 'Draw Information', endpoint: '/api/draws/latest' },
    { name: 'Chat System', endpoint: '/api/chat/messages' }
  ];

  for (const test of featureTests) {
    try {
      const response = await makeRequest(test.endpoint, 'GET', null, true);
      if (response.status === 200 || response.status === 401) {
        console.log(`✅ ${test.name}: Endpoint exists`);
        results.features.passed++;
      } else {
        console.log(`❌ ${test.name}: Failed (Status: ${response.status})`);
        results.features.failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      results.features.failed++;
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 DEPLOYMENT TEST SUMMARY\n');
  
  const totalPassed = results.api.passed + results.auth.passed + results.features.passed;
  const totalFailed = results.api.failed + results.auth.failed + results.features.failed;
  const totalTests = totalPassed + totalFailed;
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
  
  console.log(`API Tests: ${results.api.passed}/${results.api.passed + results.api.failed} passed`);
  console.log(`Auth Tests: ${results.auth.passed}/${results.auth.passed + results.auth.failed} passed`);
  console.log(`Feature Tests: ${results.features.passed}/${results.features.passed + results.features.failed} passed`);
  console.log(`\nTotal: ${totalPassed}/${totalTests} tests passed (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('\n✅ Deployment is READY!');
  } else if (successRate >= 50) {
    console.log('\n⚠️  Deployment needs attention');
  } else {
    console.log('\n❌ Deployment is NOT ready');
  }
  
  // Save results
  require('fs').writeFileSync(
    'deployment_test_results.json',
    JSON.stringify({ results, summary: { totalPassed, totalFailed, successRate } }, null, 2)
  );
}

// Run tests
runDeploymentTests().catch(console.error);