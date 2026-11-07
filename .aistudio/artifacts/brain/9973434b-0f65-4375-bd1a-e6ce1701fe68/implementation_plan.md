# Implementation Plan - Update 3D ESTD Year & Fix Doctor Photo Upload

## User Review & Critical Decisions

> [!IMPORTANT]
> - **3D Emblem Year**: Changing "ESTD 2021" to "ESTD 2026" in `HeroCanvas.tsx`.
> - **Doctor Photo Upload Reliability**: Ensuring file inputs reset properly (`e.target.value = ''`) and preview image rendering is robust across the Add/Edit Doctor modal and Doctor cards.

---

## 1. Overview & Core Concept

- **What It Does**: Updates the 3D Hero emblem badge to display "ESTD 2026" and ensures that uploading doctor portrait photos in the admin portal is 100% reliable, instantly previewed, and correctly persisted.
- **Key Value**: Flawless admin media management and up-to-date practice establishment year.

---

## 2. Technical Changes

### A. 3D Hero Canvas (`src/components/3d/HeroCanvas.tsx`)
- Locate the top badge text `"ESTD 2021 • AYUSH CERTIFIED"` and update it to `"ESTD 2026 • AYUSH CERTIFIED"`.

### B. Doctor Portrait Upload & Preview (`src/admin/pages/DoctorsManager.tsx`)
- Reset `e.target.value = ''` at the end of `handleFileUpload` so users can re-upload or select files repeatedly without browser caching issues.
- Ensure `formData.imageUrl` and `doc.imageUrl` render previews reliably (handling both absolute and relative static paths correctly).
- Apply the same file input reset fix to `GalleryManager.tsx` and `ClinicSettingsEditor.tsx` for consistency.

---

## 3. Verification Plan

- **Automated Checks**:
  - Run `compile_applet` and `lint_applet`.
  - Run appointment unit tests (`npx tsx --test src/utils/appointment.test.ts`).
- **Interactive Browser Verification**:
  - Open app via Playwright, check 3D hero emblem for "ESTD 2026".
  - Navigate to `/admin/doctors`, click "Add New Doctor", upload a test portrait image, verify thumbnail preview updates instantly, and save successfully.
