export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export function generateReferenceToken(randomSeed?: string): string {
  if (randomSeed) {
    const clean = randomSeed.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
    return `AHC-${clean.padEnd(6, 'X')}`;
  }
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let token = '';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    token += chars[idx];
  }
  return `AHC-${token}`;
}

export function isValidReferenceToken(token: string): boolean {
  return /^AHC-[A-Z0-9]{6}$/.test(token);
}

export function isValidIndianPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return /^[6-9]\d{9}$/.test(digitsOnly);
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(digitsOnly);
  }
  return false;
}

export function isValidAge(age: number | string): boolean {
  const num = typeof age === 'string' ? parseInt(age, 10) : age;
  return !isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 120;
}

export function canTransitionStatus(
  current: AppointmentStatus,
  next: AppointmentStatus
): boolean {
  if (current === next) return true;
  if (current === 'Completed') return false; // terminal status
  if (current === 'Cancelled') {
    // Can only be reopened to Pending
    return next === 'Pending';
  }
  if (current === 'Pending') {
    return ['Confirmed', 'Cancelled'].includes(next);
  }
  if (current === 'Confirmed') {
    return ['Completed', 'Cancelled'].includes(next);
  }
  return false;
}
