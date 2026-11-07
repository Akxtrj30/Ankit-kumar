export interface WelcomePopupSettings {
  isEnabled: boolean;
  badgeText: string;
  hindiHeading: string;
  englishSubheading: string;
  highlightNotice: string;
  buttonText: string;
  accentColor: string;
}

export interface ClinicPillar {
  title: string;
  description: string;
}

export interface ClinicSettings {
  clinicName: string;
  logoUrl?: string;
  taglineHindi: string;
  taglineEnglish: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook?: string;
  youtube?: string;
  address: {
    street: string;
    municipality: string;
    district: string;
    state: string;
    pincode: string;
    googleMapsEmbedUrl?: string;
  };
  timings: {
    morning: string;
    evening: string;
    closedDays: string[];
    emergencyNote?: string;
  };
  announcement: {
    isActive: boolean;
    text: string;
  };
  about: {
    heading: string;
    subheading: string;
    description: string;
    establishedYear: string;
    pillars: ClinicPillar[];
  };
  consultationFee: {
    firstVisit: string;
    followUp: string;
    medicinePolicy: string;
  };
  welcomePopup: WelcomePopupSettings;
}

export interface DoctorProfile {
  _id: string;
  name: string;
  designation: string;
  qualification: string;
  specialization: string;
  experienceYears: number | string;
  college: string;
  collegeLocation: string;
  registrationNumber: string;
  nchRegistrationNumber: string;
  ministry: string;
  bio: string;
  consultationFee: number | string;
  availableDays: string;
  availableTimings: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  orderIndex: number;
  isActive: boolean;
  isChief?: boolean;
}

export interface ServiceItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  iconName?: string;
  imageUrl?: string;
  orderIndex: number;
  isPublished: boolean;
}

export interface GalleryItem {
  _id: string;
  title: string;
  caption?: string;
  category: string;
  imageUrl: string;
  orderIndex: number;
}

export interface TestimonialItem {
  _id: string;
  patientName: string;
  location: string;
  conditionTreated: string;
  rating: number;
  review: string;
  date: string;
  isApproved: boolean;
}

export interface PageBlock {
  id: string;
  type:
    | 'HeroBlock'
    | 'AboutBlock'
    | 'ServicesBlock'
    | 'DoctorBlock'
    | 'GalleryBlock'
    | 'TestimonialsBlock'
    | 'AppointmentBlock'
    | 'ContactBlock'
    | 'CustomRichTextBlock';
  title: string;
  subtitle: string;
  content: Record<string, any>;
  styles: {
    backgroundColor: string;
    textColor: string;
    paddingY: string;
  };
  orderIndex: number;
  isVisible: boolean;
}

export interface PageData {
  title: string;
  slug: string;
  metaDescription: string;
  blocks: PageBlock[];
  isPublished: boolean;
}

export interface Appointment {
  _id: string;
  referenceNumber: string;
  patientName: string;
  mobileNumber: string;
  age: number;
  preferredDoctorId?: string;
  preferredDoctorName?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  reasonForConsultation: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  adminNotes: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
}
