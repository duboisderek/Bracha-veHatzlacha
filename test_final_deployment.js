import http from 'http';

const baseUrl = 'http://localhost:5000';
let sessionCookie = '';

function makeRequest(endpoint, method = 'GET', data = null, useCookie = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + endpoint);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(useCookie && sessionCookie ? { 'Cookie': sessionCookie } : {})
      }
    };

    const req = http.request(url, options, (res) => {
      let responseData = '';
      
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0].split(';')[0];
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

async function runFinalTests() {
  console.log('🚀 BrachaVeHatzlacha - Final Deployment Test\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // 1. API Health Check
  console.log('\n📡 1. Testing API Health...');
  try {
    const health = await makeRequest('/api/health');
    if (health.status === 200 && health.data.status === 'ok') {
      console.log('✅ API is healthy');
      results.push({ test: 'API Health', status: 'PASS' });
    } else {
      console.log('❌ API health check failed');
      results.push({ test: 'API Health', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ API unreachable:', error.message);
    results.push({ test: 'API Health', status: 'ERROR' });
  }
  
  // 2. Current Draw Check
  console.log('\n🎲 2. Testing Current Draw...');
  try {
    const draw = await makeRequest('/api/draws/current');
    if (draw.status === 200 && draw.data.id) {
      console.log(`✅ Current draw found: Draw #${draw.data.drawNumber}`);
      console.log(`   Jackpot: ₪${draw.data.jackpotAmount}`);
      results.push({ test: 'Current Draw', status: 'PASS' });
    } else {
      console.log('❌ No active draw found');
      results.push({ test: 'Current Draw', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Draw check error:', error.message);
    results.push({ test: 'Current Draw', status: 'ERROR' });
  }
  
  // 3. Admin Authentication
  console.log('\n🔐 3. Testing Admin Authentication...');
  try {
    const login = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@brahatz.com',
      password: 'admin123'
    });
    
    if (login.status === 200 && login.data.user) {
      console.log('✅ Admin login successful');
      console.log(`   User: ${login.data.user.email}`);
      console.log(`   Admin: ${login.data.user.isAdmin ? 'Yes' : 'No'}`);
      results.push({ test: 'Admin Login', status: 'PASS' });
      
      // Test authenticated access
      const userInfo = await makeRequest('/api/auth/user', 'GET', null, true);
      if (userInfo.status === 200) {
        console.log('✅ Session verified');
        results.push({ test: 'Session', status: 'PASS' });
      } else {
        console.log('❌ Session verification failed');
        results.push({ test: 'Session', status: 'FAIL' });
      }
    } else {
      console.log('❌ Admin login failed:', login.data.message);
      results.push({ test: 'Admin Login', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    results.push({ test: 'Admin Login', status: 'ERROR' });
  }
  
  // 4. Frontend Check
  console.log('\n🌐 4. Testing Frontend...');
  try {
    const frontend = await makeRequest('/');
    if (frontend.status === 200 && frontend.data.includes('<div id="root">')) {
      console.log('✅ Frontend HTML loaded');
      if (frontend.data.includes('BrachaVeHatzlacha')) {
        console.log('✅ Application title found');
        results.push({ test: 'Frontend', status: 'PASS' });
      } else {
        console.log('⚠️  Frontend loaded but title missing');
        results.push({ test: 'Frontend', status: 'WARN' });
      }
    } else {
      console.log('❌ Frontend not loading properly');
      results.push({ test: 'Frontend', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Frontend error:', error.message);
    results.push({ test: 'Frontend', status: 'ERROR' });
  }
  
  // 5. Multilingual Support
  console.log('\n🌍 5. Testing Multilingual Support...');
  try {
    const multilingual = await makeRequest('/api/test-multilingual');
    if (multilingual.status === 200 && multilingual.data.languages) {
      console.log('✅ Languages supported:', multilingual.data.languages.join(', '));
      results.push({ test: 'Multilingual', status: 'PASS' });
    } else {
      console.log('❌ Multilingual test failed');
      results.push({ test: 'Multilingual', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Multilingual error:', error.message);
    results.push({ test: 'Multilingual', status: 'ERROR' });
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 DEPLOYMENT TEST SUMMARY\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : 
                 r.status === 'FAIL' ? '❌' : 
                 r.status === 'WARN' ? '⚠️' : '🔥';
    console.log(`${icon} ${r.test}: ${r.status}`);
  });
  
  console.log(`\nResults: ${passed} passed, ${failed} failed, ${errors} errors, ${warnings} warnings`);
  console.log(`Success Rate: ${successRate}%`);
  
  console.log('\n' + '=' .repeat(60));
  if (successRate >= 80) {
    console.log('✅ DEPLOYMENT IS READY!');
    console.log('The application is working correctly and can be deployed.');
  } else if (successRate >= 60) {
    console.log('⚠️  DEPLOYMENT NEEDS ATTENTION');
    console.log('Some features are not working properly.');
  } else {
    console.log('❌ DEPLOYMENT NOT READY');
    console.log('Critical issues need to be fixed before deployment.');
  }
}

runFinalTests().catch(console.error);