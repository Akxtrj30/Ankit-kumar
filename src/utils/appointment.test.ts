import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateReferenceToken,
  isValidReferenceToken,
  isValidIndianPhone,
  isValidAge,
  canTransitionStatus,
} from './appointment';

test('generateReferenceToken creates valid clinical token matching AHC-XXXXXX pattern', () => {
  const token = generateReferenceToken();
  assert.equal(token.startsWith('AHC-'), true);
  assert.equal(token.length, 10);
  assert.equal(isValidReferenceToken(token), true);
});

test('generateReferenceToken deterministic seed works', () => {
  const token = generateReferenceToken('a1b2c3');
  assert.equal(token, 'AHC-A1B2C3');
});

test('isValidIndianPhone validates 10-digit mobile numbers', () => {
  assert.equal(isValidIndianPhone('9122999656'), true);
  assert.equal(isValidIndianPhone('+91 9122999656'), true);
  assert.equal(isValidIndianPhone('8800112233'), true);
  assert.equal(isValidIndianPhone('12345'), false);
  assert.equal(isValidIndianPhone('0122999656'), false); // starts with 0
});

test('isValidAge validates reasonable patient age bounds', () => {
  assert.equal(isValidAge(28), true);
  assert.equal(isValidAge('45'), true);
  assert.equal(isValidAge(0), false);
  assert.equal(isValidAge(130), false);
  assert.equal(isValidAge('invalid'), false);
});

test('canTransitionStatus validates clinical workflow transitions', () => {
  assert.equal(canTransitionStatus('Pending', 'Confirmed'), true);
  assert.equal(canTransitionStatus('Pending', 'Cancelled'), true);
  assert.equal(canTransitionStatus('Confirmed', 'Completed'), true);
  assert.equal(canTransitionStatus('Confirmed', 'Cancelled'), true);
  assert.equal(canTransitionStatus('Completed', 'Pending'), false);
  assert.equal(canTransitionStatus('Cancelled', 'Pending'), true);
});
