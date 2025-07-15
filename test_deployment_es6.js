import http from 'http';
import fs from 'fs';

const baseUrl = 'http://localhost:5000';
let cookies = '';

// Test with the working account from database
const testAccounts = [
  { email: 'admin@lotopro.com', password: 'admin123', role: 'Admin' }
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
      
      if (res.headers['set-cookie']) {
        cookies = res.headers['set-cookie'][0].split(';')[0];
      }
      
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
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

async function testDeployment() {
  console.log('🚀 Testing BrachaVeHatzlacha Deployment\n');
  
  let passedTests = 0;
  let totalTests = 0;

  // 1. Test API Health
  console.log('📡 Testing API Health...');
  try {
    const health = await makeRequest('/api/health');
    totalTests++;
    if (health.status === 200) {
      console.log('✅ API Health: OK');
      passedTests++;
    } else {
      console.log('❌ API Health: Failed');
    }
  } catch (error) {
    console.log('❌ API Health: Error -', error.message);
    totalTests++;
  }

  // 2. Test Current Draw
  try {
    const draw = await makeRequest('/api/draws/current');
    totalTests++;
    if (draw.status === 200 && draw.data.id) {
      console.log('✅ Current Draw: OK (Draw #' + draw.data.drawNumber + ')');
      passedTests++;
    } else {
      console.log('❌ Current Draw: Failed');
    }
  } catch (error) {
    console.log('❌ Current Draw: Error');
    totalTests++;
  }

  // 3. Test Authentication
  console.log('\n🔐 Testing Authentication...');
  try {
    const login = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@lotopro.com',
      password: 'admin123'
    });
    totalTests++;
    
    if (login.status === 200) {
      console.log('✅ Admin Login: OK');
      passedTests++;
      
      // Test authenticated endpoint
      const user = await makeRequest('/api/auth/user', 'GET', null, true);
      totalTests++;
      if (user.status === 200) {
        console.log('✅ User Session: OK');
        passedTests++;
      } else {
        console.log('❌ User Session: Failed');
      }
    } else {
      console.log('❌ Admin Login: Failed -', login.data.message);
    }
  } catch (error) {
    console.log('❌ Authentication: Error');
    totalTests++;
  }

  // 4. Test Frontend
  console.log('\n🌐 Testing Frontend...');
  try {
    const frontend = await makeRequest('/');
    totalTests++;
    if (frontend.status === 200 && frontend.data.includes('BrachaVeHatzlacha')) {
      console.log('✅ Frontend HTML: OK');
      passedTests++;
    } else {
      console.log('❌ Frontend HTML: Failed');
    }
  } catch (error) {
    console.log('❌ Frontend: Error');
    totalTests++;
  }

  // Summary
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log('\n' + '='.repeat(50));
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} passed (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('\n✅ DEPLOYMENT READY!');
    console.log('The application is working correctly and ready for deployment.');
  } else {
    console.log('\n⚠️  DEPLOYMENT NEEDS FIXES');
    console.log('Some tests failed. Please check the errors above.');
  }
}

testDeployment().catch(console.error);