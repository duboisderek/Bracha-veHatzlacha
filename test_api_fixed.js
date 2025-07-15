#!/usr/bin/env node

// Comprehensive API Testing Script for BrachaVeHatzlacha System
// This script tests all API endpoints and ensures they return JSON responses

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:5000';

// Test endpoints to verify they return JSON instead of HTML
const testEndpoints = [
  {
    name: 'Multilingual Test',
    endpoint: '/api/test-multilingual',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'languages', 'message']
  },
  {
    name: 'Hebrew Test',
    endpoint: '/api/test-hebrew',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'hebrew', 'message']
  },
  {
    name: 'French Test',
    endpoint: '/api/test-french',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'french', 'message']
  },
  {
    name: 'RTL Test',
    endpoint: '/api/test-rtl',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'rtl', 'message']
  },
  {
    name: 'Performance Test',
    endpoint: '/api/test-performance',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'responseTime', 'message']
  },
  {
    name: 'Security Test',
    endpoint: '/api/test-security',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'security', 'message']
  },
  {
    name: 'Frontend Test',
    endpoint: '/api/frontend-test',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'frontend', 'message']
  },
  {
    name: 'Backend Test',
    endpoint: '/api/backend-test',
    method: 'GET',
    expectedStatus: 200,
    expectedFields: ['status', 'backend', 'message']
  }
];

// Function to make HTTP requests
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            isJson: false,
            parsedData: null
          };
          
          // Try to parse as JSON
          if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
            try {
              result.parsedData = JSON.parse(responseData);
              result.isJson = true;
            } catch (e) {
              result.parseError = e.message;
            }
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Main testing function
async function runTests() {
  console.log('🚀 Starting BrachaVeHatzlacha API Testing...\n');
  
  const results = [];
  let passedTests = 0;
  let failedTests = 0;
  
  for (const test of testEndpoints) {
    console.log(`⏳ Testing: ${test.name}`);
    
    try {
      const result = await makeRequest(test.endpoint, test.method);
      
      // Check if response is JSON
      if (!result.isJson) {
        console.log(`❌ FAILED: ${test.name} - Response is not JSON`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Content-Type: ${result.headers['content-type']}`);
        console.log(`   Response: ${result.data.substring(0, 200)}...`);
        failedTests++;
        results.push({
          test: test.name,
          status: 'FAILED',
          reason: 'Response is not JSON',
          httpStatus: result.status,
          response: result.data.substring(0, 200)
        });
        continue;
      }
      
      // Check HTTP status
      if (result.status !== test.expectedStatus) {
        console.log(`❌ FAILED: ${test.name} - Wrong HTTP status`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${result.status}`);
        failedTests++;
        results.push({
          test: test.name,
          status: 'FAILED',
          reason: `Wrong HTTP status: ${result.status}`,
          response: result.parsedData
        });
        continue;
      }
      
      // Check expected fields
      const missingFields = test.expectedFields.filter(field => !(field in result.parsedData));
      if (missingFields.length > 0) {
        console.log(`❌ FAILED: ${test.name} - Missing fields: ${missingFields.join(', ')}`);
        failedTests++;
        results.push({
          test: test.name,
          status: 'FAILED',
          reason: `Missing fields: ${missingFields.join(', ')}`,
          response: result.parsedData
        });
        continue;
      }
      
      console.log(`✅ PASSED: ${test.name}`);
      console.log(`   Status: ${result.parsedData.status}`);
      console.log(`   Message: ${result.parsedData.message}`);
      if (result.parsedData.responseTime) {
        console.log(`   Response Time: ${result.parsedData.responseTime}`);
      }
      
      passedTests++;
      results.push({
        test: test.name,
        status: 'PASSED',
        response: result.parsedData
      });
      
    } catch (error) {
      console.log(`❌ FAILED: ${test.name} - ${error.message}`);
      failedTests++;
      results.push({
        test: test.name,
        status: 'FAILED',
        reason: error.message
      });
    }
    
    console.log('');
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Success Rate: ${((passedTests / testEndpoints.length) * 100).toFixed(1)}%`);
  
  // Save results to file
  const reportPath = path.join(__dirname, 'api_test_results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: testEndpoints.length,
      passed: passedTests,
      failed: failedTests,
      successRate: ((passedTests / testEndpoints.length) * 100).toFixed(1) + '%'
    },
    results: results
  }, null, 2));
  
  console.log(`\n📝 Detailed results saved to: ${reportPath}`);
  
  // Return overall status
  return failedTests === 0;
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(success => {
    if (success) {
      console.log('\n🎉 All API tests passed! JSON responses are working correctly.');
      process.exit(0);
    } else {
      console.log('\n💥 Some API tests failed. Check the results above.');
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

export { runTests };