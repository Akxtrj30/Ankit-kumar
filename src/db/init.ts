import { db, hasSqlConfig, schema } from './index.ts';
import { eq } from 'drizzle-orm';

export async function seedSqlIfNeeded(initialData: any) {
  if (!hasSqlConfig()) return;

  try {
    // 1. Seed Admin User
    await db.insert(schema.adminUsers).values({
      id: initialData.admin.id,
      email: initialData.admin.email,
      name: initialData.admin.name,
      role: initialData.admin.role,
      passwordHash: initialData.admin.passwordHash,
    }).onConflictDoNothing();

    // 2. Seed Settings
    await db.insert(schema.clinicSettings).values({
      id: 'default',
      clinicName: initialData.settings.clinicName,
      logoUrl: initialData.settings.logoUrl,
      taglineHindi: initialData.settings.taglineHindi,
      taglineEnglish: initialData.settings.taglineEnglish,
      phone: initialData.settings.phone,
      whatsapp: initialData.settings.whatsapp,
      email: initialData.settings.email,
      instagram: initialData.settings.instagram,
      facebook: initialData.settings.facebook,
      youtube: initialData.settings.youtube,
      address: initialData.settings.address,
      timings: initialData.settings.timings,
      announcement: initialData.settings.announcement,
      about: initialData.settings.about,
      consultationFee: initialData.settings.consultationFee,
      welcomePopup: initialData.settings.welcomePopup,
    }).onConflictDoNothing();

    // 3. Seed Doctors
    for (const doc of initialData.doctors) {
      await db.insert(schema.doctors).values({
        id: doc._id,
        name: doc.name,
        designation: doc.designation,
        qualification: doc.qualification,
        specialization: doc.specialization,
        experienceYears: String(doc.experienceYears),
        college: doc.college,
        collegeLocation: doc.collegeLocation,
        registrationNumber: doc.registrationNumber,
        nchRegistrationNumber: doc.nchRegistrationNumber,
        ministry: doc.ministry,
        bio: doc.bio,
        consultationFee: String(doc.consultationFee),
        availableDays: doc.availableDays,
        availableTimings: doc.availableTimings,
        phone: doc.phone,
        email: doc.email,
        imageUrl: doc.imageUrl,
        orderIndex: doc.orderIndex,
        isActive: doc.isActive,
        isChief: Boolean(doc.isChief),
      }).onConflictDoNothing();
    }

    // 4. Seed Services
    for (const srv of initialData.services) {
      await db.insert(schema.services).values({
        id: srv._id,
        title: srv.title,
        slug: srv.slug,
        shortDescription: srv.shortDescription,
        fullDescription: srv.fullDescription,
        iconName: srv.iconName,
        imageUrl: srv.imageUrl,
        orderIndex: srv.orderIndex,
        isPublished: srv.isPublished,
      }).onConflictDoNothing();
    }

    // 5. Seed Gallery
    for (const gal of initialData.gallery) {
      await db.insert(schema.gallery).values({
        id: gal._id,
        title: gal.title,
        caption: gal.caption,
        category: gal.category,
        imageUrl: gal.imageUrl,
        orderIndex: gal.orderIndex,
      }).onConflictDoNothing();
    }

    // 6. Seed Testimonials
    for (const test of initialData.testimonials) {
      await db.insert(schema.testimonials).values({
        id: test._id,
        patientName: test.patientName,
        location: test.location,
        conditionTreated: test.conditionTreated,
        rating: test.rating,
        review: test.review,
        date: test.date,
        isApproved: test.isApproved,
      }).onConflictDoNothing();
    }

    // 7. Seed Appointments
    for (const app of initialData.appointments) {
      await db.insert(schema.appointments).values({
        id: app._id,
        referenceNumber: app.referenceNumber,
        patientName: app.patientName,
        mobileNumber: app.mobileNumber,
        age: app.age,
        preferredDoctorId: app.preferredDoctorId,
        preferredDoctorName: app.preferredDoctorName,
        preferredDate: app.preferredDate,
        preferredTimeSlot: app.preferredTimeSlot,
        reasonForConsultation: app.reasonForConsultation,
        status: app.status,
        adminNotes: app.adminNotes,
      }).onConflictDoNothing();
    }

    // 8. Seed Page Builder Home
    const homePage = initialData.pages?.home;
    if (homePage) {
      await db.insert(schema.pages).values({
        slug: homePage.slug,
        title: homePage.title,
        metaDescription: homePage.metaDescription,
        blocks: homePage.blocks,
        isPublished: homePage.isPublished,
      }).onConflictDoNothing();
    }
  } catch (err) {
    console.warn('[Cloud SQL] Automatic seed check failed (lazy pool will connect on query):', err);
  }
}
