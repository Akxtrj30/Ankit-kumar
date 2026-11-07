import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import { storage } from './storage';
import { isValidAge } from '../src/utils/appointment';

export const apiRouter = Router();

// Ensure upload directory
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'assets', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer disk storage for local uploads
const storageConfig = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const randomName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, randomName);
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted.'));
    }
  },
});

// Helper: Extract admin session token from cookies, Authorization header, or X-Admin-Token
export const extractAdminToken = (req: Request): string | null => {
  // 1. Check cookies
  if (req.cookies?.admin_token) {
    const cookieToken = String(req.cookies.admin_token).trim();
    if (cookieToken) return cookieToken;
  }
  // 2. Check Authorization header (case-insensitive "Bearer <token>" or raw token)
  const authHeader = (req.header('authorization') || req.header('Authorization') || req.headers['authorization'] || '') as string;
  if (authHeader) {
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch && bearerMatch[1]) {
      return bearerMatch[1].trim();
    }
    if (authHeader.startsWith('authenticated_session_anika_')) {
      return authHeader.trim();
    }
  }
  // 3. Check custom X-Admin-Token header (useful in restrictive proxy/mobile webviews)
  const customHeader = req.header('x-admin-token') || req.headers['x-admin-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  return null;
};

// Middleware: Session Verification
const verifyAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = extractAdminToken(req);
  if (!token || !token.startsWith('authenticated_session_anika_')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No valid session found.' });
  }
  next();
};

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
apiRouter.get('/public/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getSettings() });
});

apiRouter.get('/public/doctors', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getDoctors(false) });
});

apiRouter.get('/public/doctors/:id', (req: Request, res: Response) => {
  const doc = storage.getDoctorById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  res.json({ success: true, data: doc });
});

apiRouter.get('/public/services', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getServices() });
});

apiRouter.get('/public/gallery', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getGallery() });
});

apiRouter.get('/public/testimonials', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getTestimonials(false) });
});

apiRouter.get('/public/welcome-popup', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getSettings().welcomePopup });
});

apiRouter.get('/public/pages/:slug', (req: Request, res: Response) => {
  const slug = req.params.slug || 'home';
  const page = storage.getPage(slug);
  if (!page) {
    return res.status(404).json({ success: false, message: `Page '${slug}' not found.` });
  }
  res.json({ success: true, data: page });
});

apiRouter.post('/public/appointments', (req: Request, res: Response) => {
  const {
    patientName,
    mobileNumber,
    age,
    preferredDoctorId,
    preferredDoctorName,
    preferredDate,
    preferredTimeSlot,
    reasonForConsultation,
  } = req.body;

  if (!patientName || !patientName.trim()) {
    return res.status(400).json({ success: false, message: 'Patient name is required.' });
  }

  const cleanPhone = String(mobileNumber || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'A valid 10-digit mobile number is required.' });
  }

  if (!isValidAge(age)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid patient age between 1 and 120.' });
  }

  if (!preferredDate) {
    return res.status(400).json({ success: false, message: 'Preferred consultation date is required.' });
  }

  if (!reasonForConsultation || !reasonForConsultation.trim()) {
    return res.status(400).json({ success: false, message: 'Please describe your chief complaints or symptoms.' });
  }

  const newApp = storage.createAppointment({
    patientName,
    mobileNumber: cleanPhone.slice(-10),
    age: Number(age),
    preferredDoctorId,
    preferredDoctorName,
    preferredDate,
    preferredTimeSlot: preferredTimeSlot || 'Morning (09:00 AM - 02:00 PM)',
    reasonForConsultation,
  });

  return res.status(201).json({
    success: true,
    message: 'Consultation request securely queued with Anika Homeopathic Clinic.',
    referenceNumber: newApp.referenceNumber,
    data: newApp,
  });
});

// ==========================================
// 2. AUTH ROUTES
// ==========================================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const emailOrUser = String(req.body.email || req.body.username || '').trim();
  const password = String(req.body.password || '').trim();
  if (!emailOrUser || !password) {
    return res.status(400).json({ success: false, message: 'Email/username and password required.' });
  }

  const { user, reason } = storage.verifyAdmin(emailOrUser, password);
  if (!user) {
    return res.status(401).json({ success: false, message: reason || 'Invalid credentials. Access Denied.' });
  }

  // Create secure session token
  const sessionToken = `authenticated_session_anika_${crypto.randomBytes(16).toString('hex')}`;
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';

  res.cookie('admin_token', sessionToken, {
    httpOnly: false,
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: isHttps ? 'none' : 'lax',
    secure: Boolean(isHttps),
  });

  return res.json({
    success: true,
    token: sessionToken,
    user,
  });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('admin_token', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const token = extractAdminToken(req);
  if (!token || !token.startsWith('authenticated_session_anika_')) {
    return res.status(401).json({ success: false, message: 'Session expired or not logged in.' });
  }
  return res.json({ success: true, user: storage.getAdminUser() });
});

apiRouter.post('/auth/change-password', verifyAdminMiddleware, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password required.' });
  }

  const result = storage.changeAdminPassword(currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message });
  }
  return res.json({ success: true, message: result.message });
});

apiRouter.put('/auth/profile', verifyAdminMiddleware, (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }
  const updated = storage.updateAdminProfile(name, email);
  return res.json({ success: true, user: updated, message: 'Profile updated.' });
});

// ==========================================
// 3. ADMIN ROUTES
// ==========================================
apiRouter.use('/admin', verifyAdminMiddleware);

// --- Settings & Entire Front Page CMS Content ---
apiRouter.put('/admin/settings', (req: Request, res: Response) => {
  const updated = storage.updateSettings(req.body);
  res.json({ success: true, data: updated, message: 'Clinic settings and homepage content saved.' });
});

// --- Doctors Management ---
apiRouter.get('/admin/doctors', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getDoctors(true) });
});

apiRouter.post('/admin/doctors', (req: Request, res: Response) => {
  const doc = storage.createDoctor(req.body);
  res.status(201).json({ success: true, data: doc, message: 'Doctor added successfully.' });
});

apiRouter.put('/admin/doctors/:id', (req: Request, res: Response) => {
  const doc = storage.updateDoctor(req.params.id, req.body);
  if (!doc) return res.status(404).json({ success: false, message: 'Doctor not found.' });
  res.json({ success: true, data: doc, message: 'Doctor profile updated.' });
});

apiRouter.delete('/admin/doctors/:id', (req: Request, res: Response) => {
  const ok = storage.deleteDoctor(req.params.id);
  res.json({ success: ok, message: ok ? 'Doctor removed.' : 'Doctor not found.' });
});

// --- Services Management ---
apiRouter.get('/admin/services', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getServices() });
});

apiRouter.post('/admin/services', (req: Request, res: Response) => {
  const s = storage.createService(req.body);
  res.status(201).json({ success: true, data: s, message: 'Service added.' });
});

apiRouter.put('/admin/services/:id', (req: Request, res: Response) => {
  const s = storage.updateService(req.params.id, req.body);
  if (!s) return res.status(404).json({ success: false, message: 'Service not found.' });
  res.json({ success: true, data: s, message: 'Service updated.' });
});

apiRouter.delete('/admin/services/:id', (req: Request, res: Response) => {
  const ok = storage.deleteService(req.params.id);
  res.json({ success: ok, message: ok ? 'Service deleted.' : 'Service not found.' });
});

// --- Gallery Management ---
apiRouter.get('/admin/gallery', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getGallery() });
});

apiRouter.post('/admin/gallery', (req: Request, res: Response) => {
  const item = storage.createGalleryItem(req.body);
  res.status(201).json({ success: true, data: item, message: 'Photo added to clinic gallery.' });
});

apiRouter.put('/admin/gallery/:id', (req: Request, res: Response) => {
  const item = storage.updateGalleryItem(req.params.id, req.body);
  if (!item) return res.status(404).json({ success: false, message: 'Photograph not found.' });
  res.json({ success: true, data: item, message: 'Photograph updated successfully.' });
});

apiRouter.delete('/admin/gallery/:id', (req: Request, res: Response) => {
  const ok = storage.deleteGalleryItem(req.params.id);
  res.json({ success: ok, message: ok ? 'Photo removed.' : 'Item not found.' });
});

// --- Testimonials Management ---
apiRouter.get('/admin/testimonials', (_req: Request, res: Response) => {
  res.json({ success: true, data: storage.getTestimonials(true) });
});

apiRouter.post('/admin/testimonials', (req: Request, res: Response) => {
  const item = storage.createTestimonial(req.body);
  res.status(201).json({ success: true, data: item, message: 'Testimonial created.' });
});

apiRouter.put('/admin/testimonials/:id', (req: Request, res: Response) => {
  const item = storage.updateTestimonial(req.params.id, req.body);
  if (!item) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
  res.json({ success: true, data: item, message: 'Testimonial updated.' });
});

apiRouter.delete('/admin/testimonials/:id', (req: Request, res: Response) => {
  const ok = storage.deleteTestimonial(req.params.id);
  res.json({ success: ok, message: ok ? 'Testimonial deleted.' : 'Item not found.' });
});

// --- Page Builder ---
apiRouter.put('/admin/pages/:slug', (req: Request, res: Response) => {
  const slug = req.params.slug || 'home';
  const updated = storage.savePage(slug, req.body);
  res.json({ success: true, data: updated, message: 'Page layout and styling published live.' });
});

// --- Appointments ---
apiRouter.get('/admin/appointments', (req: Request, res: Response) => {
  const { status, search } = req.query as { status?: string; search?: string };
  const list = storage.getAppointments({ status, search });
  res.json({ success: true, data: list });
});

apiRouter.patch('/admin/appointments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = storage.updateAppointment(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }
  res.json({ success: true, data: updated, message: 'Appointment status updated.' });
});

// --- File Uploads with Multer ---
apiRouter.post('/admin/uploads', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded or invalid file format.' });
  }
  const relativeUrl = `/assets/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    url: relativeUrl,
    imageUrl: relativeUrl,
    filename: req.file.filename,
    message: 'Image uploaded successfully.',
  });
});
