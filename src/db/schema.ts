import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Admin accounts & fallback credential hash table
export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('superadmin'),
  passwordHash: text('password_hash').notNull(),
  failedAttempts: integer('failed_attempts').default(0),
  lockoutUntil: timestamp('lockout_until'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Clinic settings single-row configuration
export const clinicSettings = pgTable('clinic_settings', {
  id: text('id').primaryKey(),
  clinicName: text('clinic_name').notNull(),
  logoUrl: text('logo_url'),
  taglineHindi: text('tagline_hindi'),
  taglineEnglish: text('tagline_english'),
  phone: text('phone').notNull(),
  whatsapp: text('whatsapp').notNull(),
  email: text('email').notNull(),
  instagram: text('instagram'),
  facebook: text('facebook'),
  youtube: text('youtube'),
  address: jsonb('address').notNull(),
  timings: jsonb('timings').notNull(),
  announcement: jsonb('announcement').notNull(),
  about: jsonb('about').notNull(),
  consultationFee: jsonb('consultation_fee').notNull(),
  welcomePopup: jsonb('welcome_popup').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Doctor Profiles Table
export const doctors = pgTable('doctors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  designation: text('designation').notNull(),
  qualification: text('qualification').notNull(),
  specialization: text('specialization').notNull(),
  experienceYears: text('experience_years').notNull(),
  college: text('college').notNull(),
  collegeLocation: text('college_location').notNull(),
  registrationNumber: text('registration_number').notNull(),
  nchRegistrationNumber: text('nch_registration_number').notNull(),
  ministry: text('ministry').notNull(),
  bio: text('bio').notNull(),
  consultationFee: text('consultation_fee').notNull(),
  availableDays: text('available_days').notNull(),
  availableTimings: text('available_timings').notNull(),
  phone: text('phone'),
  email: text('email'),
  imageUrl: text('image_url'),
  orderIndex: integer('order_index').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  isChief: boolean('is_chief').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Clinical Services Table
export const services = pgTable('services', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  shortDescription: text('short_description').notNull(),
  fullDescription: text('full_description'),
  iconName: text('icon_name'),
  imageUrl: text('image_url'),
  orderIndex: integer('order_index').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Clinic Photographs Gallery Table
export const gallery = pgTable('gallery', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  caption: text('caption'),
  category: text('category').notNull(),
  imageUrl: text('image_url').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Patient Testimonials Table
export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey(),
  patientName: text('patient_name').notNull(),
  location: text('location').notNull(),
  conditionTreated: text('condition_treated').notNull(),
  rating: integer('rating').notNull().default(5),
  review: text('review').notNull(),
  date: text('date').notNull(),
  isApproved: boolean('is_approved').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Appointments Queue Table
export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  referenceNumber: text('reference_number').notNull().unique(),
  patientName: text('patient_name').notNull(),
  mobileNumber: text('mobile_number').notNull(),
  age: integer('age').notNull(),
  preferredDoctorId: text('preferred_doctor_id'),
  preferredDoctorName: text('preferred_doctor_name'),
  preferredDate: text('preferred_date').notNull(),
  preferredTimeSlot: text('preferred_time_slot').notNull(),
  reasonForConsultation: text('reason_for_consultation').notNull(),
  status: text('status').notNull().default('Pending'),
  adminNotes: text('admin_notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Page Builder & Content Storage Table
export const pages = pgTable('pages', {
  slug: text('slug').primaryKey(),
  title: text('title').notNull(),
  metaDescription: text('meta_description').default(''),
  blocks: jsonb('blocks').notNull(),
  isPublished: boolean('is_published').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});
