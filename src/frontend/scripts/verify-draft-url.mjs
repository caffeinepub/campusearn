#!/usr/bin/env node

/**
 * Post-deployment verification script for CampusEarn draft URLs
 * 
 * Usage: node verify-draft-url.mjs <DRAFT_URL>
 * Example: node verify-draft-url.mjs https://example.com/my-app
 */

import https from 'https';
import http from 'http';

const TIMEOUT_MS = 10000;

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, { timeout: TIMEOUT_MS }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    });
  });
}

async function verifyDraftUrl(draftUrl) {
  console.log(`\n🔍 Verifying draft URL: ${draftUrl}\n`);
  
  try {
    // Test root path
    console.log('Testing root path (/)...');
    const response = await fetchUrl(draftUrl);
    
    if (response.statusCode !== 200) {
      console.error(`❌ FAILED: Root path returned HTTP ${response.statusCode}`);
      console.error(`   Expected: 200`);
      console.error(`   URL: ${draftUrl}`);
      process.exit(1);
    }
    
    // Check for "Not Found" in response body
    if (response.body.toLowerCase().includes('not found')) {
      console.error(`❌ FAILED: Root path contains "Not Found" text`);
      console.error(`   URL: ${draftUrl}`);
      console.error(`   This indicates the deployment did not complete successfully.`);
      process.exit(1);
    }
    
    // Check for expected HTML structure
    if (!response.body.includes('<div id="root">') && !response.body.includes('<div id=\'root\'>')) {
      console.error(`❌ FAILED: Root path does not contain expected HTML structure`);
      console.error(`   URL: ${draftUrl}`);
      console.error(`   Expected to find: <div id="root">`);
      process.exit(1);
    }
    
    console.log('✅ Root path is accessible and returns valid HTML');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    
    // Test a deep link (should also return 200 with SPA fallback)
    const deepLinkPath = '/student/dashboard';
    const deepLinkUrl = new URL(deepLinkPath, draftUrl).href;
    
    console.log(`\nTesting deep link (${deepLinkPath})...`);
    const deepLinkResponse = await fetchUrl(deepLinkUrl);
    
    if (deepLinkResponse.statusCode !== 200 && deepLinkResponse.statusCode !== 404) {
      console.warn(`⚠️  WARNING: Deep link returned HTTP ${deepLinkResponse.statusCode}`);
      console.warn(`   URL: ${deepLinkUrl}`);
      console.warn(`   This may indicate SPA fallback is not configured correctly.`);
    } else {
      console.log(`✅ Deep link handling is working (status: ${deepLinkResponse.statusCode})`);
    }
    
    console.log('\n✅ Draft URL verification PASSED\n');
    process.exit(0);
    
  } catch (error) {
    console.error(`❌ FAILED: Unable to reach draft URL`);
    console.error(`   URL: ${draftUrl}`);
    console.error(`   Error: ${error.message}`);
    console.error(`\nPossible causes:`);
    console.error(`   - Deployment did not complete successfully`);
    console.error(`   - URL is incorrect or not yet available`);
    console.error(`   - Network connectivity issues`);
    process.exit(1);
  }
}

// Main execution
const draftUrl = process.argv[2];

if (!draftUrl) {
  console.error('❌ ERROR: Draft URL is required');
  console.error('\nUsage: node verify-draft-url.mjs <DRAFT_URL>');
  console.error('Example: node verify-draft-url.mjs https://example.com/my-app');
  process.exit(1);
}

// Validate URL format
try {
  new URL(draftUrl);
} catch (error) {
  console.error(`❌ ERROR: Invalid URL format: ${draftUrl}`);
  console.error(`   ${error.message}`);
  process.exit(1);
}

verifyDraftUrl(draftUrl);
