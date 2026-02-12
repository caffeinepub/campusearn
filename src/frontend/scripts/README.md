# Draft URL Verification Script

This directory contains a post-deployment verification script to ensure draft URLs are accessible and working correctly.

## Purpose

After deploying CampusEarn, this script verifies that:
- The draft URL is reachable and returns HTTP 200
- The root document contains the expected HTML structure
- The response does not contain "Not Found" errors
- Deep links are handled correctly (SPA fallback)

## Usage

### Basic Usage

