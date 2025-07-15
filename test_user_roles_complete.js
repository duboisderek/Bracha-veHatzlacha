#!/usr/bin/env node

/**
 * Complete User Role Testing Script
 * Tests all user roles with their specific access and features
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

const TEST_ACCOUNTS = [
  {
    username: 'rootadmin',
    password: 'RootAdmin!2024',
    role: 'Root Admin',
    description: 'Full system administrator with complete access to all functions'
  },
  {
    username: 'admin',
    password: 'Admin!2024',
    role: 'Standard Admin',
    description: 'Standard administrator with management capabilities'
  },
  {
    username: 'vip',
    password: 'Vip!2024',
    role: 'VIP Client',
    description: 'Premium client with enhanced features'
  },
  {
    username: 'user',
    password: 'User!2024',
    role: 'Standard User',
    description: 'Regular client with standard lottery features'
  },
  {
    username: 'newuser',
    password: 'NewUser!2024',
    role: 'New User',
    description: 'New client with basic features'
  }
];

const BASE_URL = 'http://localhost:5000';

function makeRequest(endpoint, method = 'GET', data = null, cookies = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(`${BASE_URL}${endpoint}`, options);
}

async function testLogin(username, password) {
  try {
    const response = await makeRequest('/api/auth/login', 'POST', {
      username,
      password
    });
    
    if (response.ok) {
      const cookies = response.headers.get('set-cookie') || '';
      return { success: true, cookies };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testEndpoint(endpoint, cookies, method = 'GET', data = null) {
  try {
    const response = await makeRequest(endpoint, method, data, cookies);
    return {
      endpoint,
      status: response.status,
      success: response.ok,
      response: response.ok ? await response.json() : await response.text()
    };
  } catch (error) {
    return {
      endpoint,
      status: 'ERROR',
      success: false,
      response: error.message
    };
  }
}

async function testUserRole(account) {
  console.log(`\n=== Testing ${account.role} (${account.username}) ===`);
  
  // Test login
  const login = await testLogin(account.username, account.password);
  if (!login.success) {
    console.log(`❌ Login failed: ${login.error}`);
    return;
  }
  
  console.log(`✅ Login successful`);
  
  // Common endpoints for all users
  const endpoints = [
    '/api/auth/user',
    '/api/user/stats',
    '/api/user/profile',
    '/api/user/transactions',
    '/api/user/tickets',
    '/api/lottery/current-draw',
    '/api/lottery/completed-draws'
  ];
  
  // Admin-specific endpoints
  if (account.username === 'rootadmin' || account.username === 'admin') {
    endpoints.push(
      '/api/admin/users',
      '/api/admin/draws',
      '/api/admin/analytics',
      '/api/admin/system-settings',
      '/api/admin/wallets'
    );
  }
  
  // Root admin-specific endpoints
  if (account.username === 'rootadmin') {
    endpoints.push(
      '/api/admin/security-events',
      '/api/admin/backups',
      '/api/admin/email-templates'
    );
  }
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint, login.cookies);
    results.push(result);
    console.log(`${result.success ? '✅' : '❌'} ${endpoint} - Status: ${result.status}`);
  }
  
  return {
    account,
    loginSuccess: true,
    endpoints: results
  };
}

async function generateRoleReport() {
  console.log('\n🔍 BrachaVeHatzlacha - Complete Role Testing Report');
  console.log('=' .repeat(60));
  
  const testResults = [];
  
  for (const account of TEST_ACCOUNTS) {
    const result = await testUserRole(account);
    if (result) {
      testResults.push(result);
    }
  }
  
  console.log('\n📊 FINAL ROLE ACCESS SUMMARY');
  console.log('=' .repeat(60));
  
  for (const result of testResults) {
    console.log(`\n🔐 ${result.account.role}`);
    console.log(`   Username: ${result.account.username}`);
    console.log(`   Password: ${result.account.password}`);
    console.log(`   Description: ${result.account.description}`);
    
    const successfulEndpoints = result.endpoints.filter(e => e.success);
    const failedEndpoints = result.endpoints.filter(e => !e.success);
    
    console.log(`   ✅ Accessible endpoints: ${successfulEndpoints.length}`);
    console.log(`   ❌ Restricted endpoints: ${failedEndpoints.length}`);
    
    if (successfulEndpoints.length > 0) {
      console.log(`   Available features:`);
      successfulEndpoints.forEach(ep => {
        console.log(`     - ${ep.endpoint}`);
      });
    }
  }
  
  return testResults;
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive user role testing...');
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = await generateRoleReport();
    
    // Save results to file
    const reportData = {
      timestamp: new Date().toISOString(),
      testResults: results,
      summary: {
        totalRoles: TEST_ACCOUNTS.length,
        successfulTests: results.length,
        platform: 'BrachaVeHatzlacha Multilingual Lottery'
      }
    };
    
    fs.writeFileSync('user_role_test_results.json', JSON.stringify(reportData, null, 2));
    
    console.log('\n✅ Role testing complete!');
    console.log('📄 Results saved to user_role_test_results.json');
    
  } catch (error) {
    console.error('❌ Error during role testing:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}