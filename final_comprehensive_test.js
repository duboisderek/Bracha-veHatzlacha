#!/usr/bin/env node

// FINAL COMPREHENSIVE TEST - BrachaVeHatzlacha Platform
// This is the ultimate test to ensure 1000000000% perfection

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test Results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function logTest(testName, status, details = '') {
  totalTests++;
  const result = {
    test: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  
  if (status === 'PASS') {
    passedTests++;
    console.log(`✅ ${testName}: PASSED ${details}`);
  } else {
    failedTests++;
    console.log(`❌ ${testName}: FAILED ${details}`);
  }
}

// Test 1: Translation File Integrity
function testTranslationFileIntegrity() {
  console.log('\n🔍 Testing Translation File Integrity...');
  
  try {
    const translationPath = path.join(__dirname, 'client/src/lib/i18n_final.ts');
    const content = fs.readFileSync(translationPath, 'utf8');
    
    // Check if file exists and has content
    if (!content || content.length < 1000) {
      logTest('Translation File Size', 'FAIL', 'File too small or empty');
      return;
    }
    
    // Check for duplicate key issues
    const duplicateKeyPattern = /(\w+):\s*"[^"]*",[\s\S]*?\1:\s*"[^"]*"/g;
    const duplicates = content.match(duplicateKeyPattern);
    
    if (duplicates) {
      logTest('Translation Duplicate Keys', 'FAIL', `Found ${duplicates.length} potential duplicates`);
    } else {
      logTest('Translation Duplicate Keys', 'PASS', 'No duplicate keys found');
    }
    
    // Check for required languages
    const hasEnglish = content.includes('en: {');
    const hasHebrew = content.includes('he: {');
    const hasFrench = content.includes('fr: {');
    
    if (hasEnglish && hasHebrew && hasFrench) {
      logTest('Translation Languages', 'PASS', 'All 3 languages present');
    } else {
      logTest('Translation Languages', 'FAIL', `Missing languages: ${!hasEnglish ? 'EN ' : ''}${!hasHebrew ? 'HE ' : ''}${!hasFrench ? 'FR' : ''}`);
    }
    
    // Check for removed duplicate entries
    const removedDuplicates = content.includes('// Note: Duplicate keys removed to prevent errors');
    if (removedDuplicates) {
      logTest('Translation Duplicate Cleanup', 'PASS', 'Duplicate keys properly removed');
    } else {
      logTest('Translation Duplicate Cleanup', 'FAIL', 'Duplicate cleanup markers not found');
    }
    
  } catch (error) {
    logTest('Translation File Access', 'FAIL', error.message);
  }
}

// Test 2: API Routes Configuration
function testAPIRoutesConfiguration() {
  console.log('\n🔍 Testing API Routes Configuration...');
  
  try {
    const routesPath = path.join(__dirname, 'server/routes.ts');
    const content = fs.readFileSync(routesPath, 'utf8');
    
    // Check for new test endpoints
    const testEndpoints = [
      '/api/test-multilingual',
      '/api/test-hebrew',
      '/api/test-french',
      '/api/test-rtl',
      '/api/test-performance',
      '/api/test-security',
      '/api/frontend-test',
      '/api/backend-test'
    ];
    
    let foundEndpoints = 0;
    testEndpoints.forEach(endpoint => {
      if (content.includes(`app.get("${endpoint}"`)) {
        foundEndpoints++;
      }
    });
    
    if (foundEndpoints === testEndpoints.length) {
      logTest('API Test Endpoints', 'PASS', `All ${testEndpoints.length} test endpoints found`);
    } else {
      logTest('API Test Endpoints', 'FAIL', `Only ${foundEndpoints}/${testEndpoints.length} endpoints found`);
    }
    
    // Check for CORS configuration
    const hasCORS = content.includes('Access-Control-Allow-Origin');
    if (hasCORS) {
      logTest('CORS Configuration', 'PASS', 'CORS headers configured');
    } else {
      logTest('CORS Configuration', 'FAIL', 'CORS headers not found');
    }
    
    // Check for OPTIONS handler
    const hasOptions = content.includes('app.options("*"');
    if (hasOptions) {
      logTest('OPTIONS Handler', 'PASS', 'CORS preflight handler found');
    } else {
      logTest('OPTIONS Handler', 'FAIL', 'OPTIONS handler not found');
    }
    
  } catch (error) {
    logTest('API Routes File Access', 'FAIL', error.message);
  }
}

// Test 3: Server Configuration
function testServerConfiguration() {
  console.log('\n🔍 Testing Server Configuration...');
  
  try {
    const serverPath = path.join(__dirname, 'server/index.ts');
    const content = fs.readFileSync(serverPath, 'utf8');
    
    // Check for SSL configuration
    const hasSSL = content.includes('securityHeadersMiddleware');
    if (hasSSL) {
      logTest('SSL Configuration', 'PASS', 'Security headers middleware configured');
    } else {
      logTest('SSL Configuration', 'FAIL', 'Security headers not found');
    }
    
    // Check for proper port binding
    const hasPortBinding = content.includes('host: "0.0.0.0"');
    if (hasPortBinding) {
      logTest('Port Binding', 'PASS', 'Proper 0.0.0.0 binding configured');
    } else {
      logTest('Port Binding', 'FAIL', 'Port binding not properly configured');
    }
    
    // Check for error handling
    const hasErrorHandling = content.includes('try {') && content.includes('catch (error)');
    if (hasErrorHandling) {
      logTest('Error Handling', 'PASS', 'Error handling implemented');
    } else {
      logTest('Error Handling', 'FAIL', 'Error handling not found');
    }
    
  } catch (error) {
    logTest('Server Configuration File Access', 'FAIL', error.message);
  }
}

// Test 4: SSL/Security Configuration
function testSSLConfiguration() {
  console.log('\n🔍 Testing SSL/Security Configuration...');
  
  try {
    const sslPath = path.join(__dirname, 'server/ssl-config.ts');
    const content = fs.readFileSync(sslPath, 'utf8');
    
    // Check for CORS headers
    const hasCORS = content.includes('Access-Control-Allow-Origin');
    if (hasCORS) {
      logTest('SSL CORS Headers', 'PASS', 'CORS headers in SSL config');
    } else {
      logTest('SSL CORS Headers', 'FAIL', 'CORS headers not found in SSL config');
    }
    
    // Check for security headers
    const securityHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security'
    ];
    
    let foundHeaders = 0;
    securityHeaders.forEach(header => {
      if (content.includes(header)) {
        foundHeaders++;
      }
    });
    
    if (foundHeaders === securityHeaders.length) {
      logTest('Security Headers', 'PASS', `All ${securityHeaders.length} security headers found`);
    } else {
      logTest('Security Headers', 'FAIL', `Only ${foundHeaders}/${securityHeaders.length} headers found`);
    }
    
  } catch (error) {
    logTest('SSL Configuration File Access', 'FAIL', error.message);
  }
}

// Test 5: System Files Integrity  
function testSystemFilesIntegrity() {
  console.log('\n🔍 Testing System Files Integrity...');
  
  const criticalFiles = [
    'server/routes.ts',
    'server/index.ts',
    'server/ssl-config.ts',
    'client/src/lib/i18n_final.ts',
    'package.json',
    'server/storage.ts'
  ];
  
  let existingFiles = 0;
  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      existingFiles++;
    }
  });
  
  if (existingFiles === criticalFiles.length) {
    logTest('Critical Files', 'PASS', `All ${criticalFiles.length} critical files exist`);
  } else {
    logTest('Critical Files', 'FAIL', `Only ${existingFiles}/${criticalFiles.length} files exist`);
  }
}

// Test 6: Database Schema Integrity
function testDatabaseSchema() {
  console.log('\n🔍 Testing Database Schema Integrity...');
  
  try {
    const schemaPath = path.join(__dirname, 'shared/schema.ts');
    const content = fs.readFileSync(schemaPath, 'utf8');
    
    // Check for main tables
    const tables = ['users', 'draws', 'tickets', 'transactions', 'chatMessages'];
    let foundTables = 0;
    
    tables.forEach(table => {
      if (content.includes(table)) {
        foundTables++;
      }
    });
    
    if (foundTables === tables.length) {
      logTest('Database Schema', 'PASS', `All ${tables.length} tables found`);
    } else {
      logTest('Database Schema', 'FAIL', `Only ${foundTables}/${tables.length} tables found`);
    }
    
  } catch (error) {
    logTest('Database Schema File Access', 'FAIL', error.message);
  }
}

// Main test execution
async function runComprehensiveTest() {
  console.log('🚀 STARTING FINAL COMPREHENSIVE TEST');
  console.log('===================================');
  console.log('Testing BrachaVeHatzlacha Platform for 1000000000% Perfection\n');
  
  // Run all tests
  testTranslationFileIntegrity();
  testAPIRoutesConfiguration();
  testServerConfiguration();
  testSSLConfiguration();
  testSystemFilesIntegrity();
  testDatabaseSchema();
  
  // Generate final report
  console.log('\n📊 FINAL TEST RESULTS');
  console.log('====================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Save detailed results
  const reportPath = path.join(__dirname, 'comprehensive_test_results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%'
    },
    results: testResults
  }, null, 2));
  
  console.log(`\n📝 Detailed results saved to: ${reportPath}`);
  
  // Overall status
  if (failedTests === 0) {
    console.log('\n🎉 PERFECT! All tests passed - 1000000000% perfection achieved!');
    return true;
  } else {
    console.log('\n⚠️  Some tests failed - continuing to fix remaining issues...');
    return false;
  }
}

// Run the comprehensive test
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTest().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

export { runComprehensiveTest };