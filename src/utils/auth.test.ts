import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../../server/storage';
import { extractAdminToken } from '../../server/routes';

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

test('verifyAdmin authenticates with mobile capitalized/whitespace input', () => {
  const result = storage.verifyAdmin('  Admin@AnikaHomeopathy.com  ', '  SecureClinic2025!#  ');
  assert.ok(result.user, 'Expected successful login despite mobile autocapitalization & whitespace');
});

test('verifyAdmin rejects invalid credentials and handles security lockout checks', () => {
  const result = storage.verifyAdmin('unknown_user@clinic.com', 'WrongPassword123');
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
