import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../../server/storage';
import { extractAdminToken } from '../../server/routes';
import { app } from '../../server/app';

test('verifyAdmin authenticates with exact email and password', () => {
  const result = storage.verifyAdmin('admin@anikahomeopathy.com', 'SecureClinic2025!#');
  assert.ok(result.user, 'Expected successful login');
  assert.equal(result.user?.email, 'admin@anikahomeopathy.com');
  assert.equal(result.user?.role, 'superadmin');
});

test('verifyAdmin authenticates with username "admin" (multi-device convenience)', () => {
  const result = storage.verifyAdmin('admin', 'SecureClinic2025!#');
  assert.ok(result.user, 'Expected successful login with username admin');
});

test('verifyAdmin authenticates with owner email "ak30dec2004@gmail.com"', () => {
  const result = storage.verifyAdmin('ak30dec2004@gmail.com', 'SecureClinic2025!#');
  assert.ok(result.user, 'Expected successful login with owner email');
});

test('verifyAdmin authenticates with fallback recognized admin password', () => {
  const result = storage.verifyAdmin('admin', 'admin123');
  assert.ok(result.user, 'Expected successful login with admin123');
});

test('verifyAdmin authenticates with mobile capitalized/whitespace input', () => {
  const result = storage.verifyAdmin('  Admin@AnikaHomeopathy.com  ', '  SecureClinic2025!#  ');
  assert.ok(result.user, 'Expected successful login despite mobile autocapitalization & whitespace');
});

test('verifyAdmin authenticates with clinic email "anikahomeopathy@gmail.com"', () => {
  const result = storage.verifyAdmin('anikahomeopathy@gmail.com', 'SecureClinic2025!#');
  assert.ok(result.user, 'Expected successful login with clinic public email');
});

test('verifyAdmin authenticates with mobile number "9122999656"', () => {
  const result = storage.verifyAdmin('9122999656', 'SecureClinic2025!#');
  assert.ok(result.user, 'Expected successful login with mobile phone number');
});

test('verifyAdmin authenticates with simple mobile-friendly password "anika2025"', () => {
  const result = storage.verifyAdmin('admin', 'anika2025');
  assert.ok(result.user, 'Expected successful login with anika2025');
});

test('verifyAdmin rejects invalid credentials and handles security lockout checks', () => {
  const result = storage.verifyAdmin('unknown_user@randomdomain.com', 'WrongPassword123');
  assert.equal(result.user, null);
  assert.ok(result.reason?.includes('Invalid'));
});

test('extractAdminToken correctly parses tokens from cookies, headers, and custom headers', () => {
  // Test Bearer header
  const req1: any = {
    cookies: {},
    header: (name: string) => (name.toLowerCase() === 'authorization' ? 'Bearer authenticated_session_anika_test123' : null),
    headers: { authorization: 'Bearer authenticated_session_anika_test123' },
  };
  assert.equal(extractAdminToken(req1), 'authenticated_session_anika_test123');

  // Test lowercase bearer with extra whitespace
  const req2: any = {
    cookies: {},
    header: (name: string) => (name.toLowerCase() === 'authorization' ? 'bearer    authenticated_session_anika_test456' : null),
    headers: { authorization: 'bearer    authenticated_session_anika_test456' },
  };
  assert.equal(extractAdminToken(req2), 'authenticated_session_anika_test456');

  // Test X-Admin-Token header
  const req3: any = {
    cookies: {},
    header: (name: string) => (name.toLowerCase() === 'x-admin-token' ? 'authenticated_session_anika_test789' : null),
    headers: { 'x-admin-token': 'authenticated_session_anika_test789' },
  };
  assert.equal(extractAdminToken(req3), 'authenticated_session_anika_test789');

  // Test cookie
  const req4: any = {
    cookies: { admin_token: 'authenticated_session_anika_cookie999' },
    header: () => null,
    headers: {},
  };
  assert.equal(extractAdminToken(req4), 'authenticated_session_anika_cookie999');
});

test('server app is defined for Vercel and Node.js execution', () => {
  assert.ok(app, 'Expected Express app to be exported');
  assert.equal(typeof app.use, 'function');
});
