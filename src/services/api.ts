const API_BASE = '/api';

// Safe multi-device token storage supporting mobile private browsing and webviews
const memoryStore: Record<string, string> = {};

export const safeTokenStorage = {
  get: (): string => {
    try {
      const fromLocal = localStorage.getItem('anika_admin_token');
      if (fromLocal) return fromLocal;
      const fromSession = sessionStorage.getItem('anika_admin_token');
      if (fromSession) return fromSession;
    } catch {
      // ignore security/quota errors on mobile browsers
    }
    return memoryStore['anika_admin_token'] || '';
  },
  set: (token: string) => {
    memoryStore['anika_admin_token'] = token;
    try {
      localStorage.setItem('anika_admin_token', token);
      sessionStorage.setItem('anika_admin_token', token);
    } catch {
      // ignore
    }
    try {
      document.cookie = `admin_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
    } catch {
      // ignore
    }
  },
  remove: () => {
    delete memoryStore['anika_admin_token'];
    try {
      localStorage.removeItem('anika_admin_token');
      sessionStorage.removeItem('anika_admin_token');
    } catch {
      // ignore
    }
    try {
      document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
    } catch {
      // ignore
    }
  },
};

function getAuthHeader(): Record<string, string> {
  const token = safeTokenStorage.get();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        'X-Admin-Token': token,
      }
    : {};
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const data = await res.json();
      errMessage = data.message || data.error || errMessage;
    } catch {
      errMessage = res.statusText || errMessage;
    }
    const err: any = new Error(errMessage);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function authFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
  return handleResponse(res);
}

export const publicApi = {
  getSettings: () => fetch(`${API_BASE}/public/settings`, { credentials: 'include' }).then(handleResponse),
  getDoctors: () => fetch(`${API_BASE}/public/doctors`, { credentials: 'include' }).then(handleResponse),
  getDoctorById: (id: string) => fetch(`${API_BASE}/public/doctors/${id}`, { credentials: 'include' }).then(handleResponse),
  getServices: () => fetch(`${API_BASE}/public/services`, { credentials: 'include' }).then(handleResponse),
  getGallery: () => fetch(`${API_BASE}/public/gallery`, { credentials: 'include' }).then(handleResponse),
  getTestimonials: () => fetch(`${API_BASE}/public/testimonials`, { credentials: 'include' }).then(handleResponse),
  getWelcomePopup: () => fetch(`${API_BASE}/public/welcome-popup`, { credentials: 'include' }).then(handleResponse),
  getPage: (slug: string) => fetch(`${API_BASE}/public/pages/${slug}`, { credentials: 'include' }).then(handleResponse),
  bookAppointment: (payload: any) =>
    fetch(`${API_BASE}/public/appointments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),
};

export const adminApi = {
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse);
    if (res.token) {
      safeTokenStorage.set(res.token);
    }
    return res;
  },

  logout: async () => {
    safeTokenStorage.remove();
    return fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getAuthHeader() },
    }).then(handleResponse);
  },

  verifySession: () =>
    authFetch(`${API_BASE}/auth/me`),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    authFetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  updateProfile: (payload: { name: string; email: string }) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  updateSettings: (data: any) =>
    fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Doctors
  getDoctors: () =>
    fetch(`${API_BASE}/admin/doctors`, {
      headers: { ...getAuthHeader() },
    }).then(handleResponse),

  createDoctor: (data: any) =>
    fetch(`${API_BASE}/admin/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateDoctor: (id: string, data: any) =>
    fetch(`${API_BASE}/admin/doctors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteDoctor: (id: string) =>
    fetch(`${API_BASE}/admin/doctors/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    }).then(handleResponse),

  // Services
  getServices: () =>
    fetch(`${API_BASE}/admin/services`, {
      headers: { ...getAuthHeader() },
    }).then(handleResponse),

  createService: (data: any) =>
    fetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateService: (id: string, data: any) =>
    fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteService: (id: string) =>
    fetch(`${API_BASE}/admin/services/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    }).then(handleResponse),

  // Gallery
  getGallery: () =>
    fetch(`${API_BASE}/admin/gallery`, {
      headers: { ...getAuthHeader() },
    }).then(handleResponse),

  createGalleryItem: (data: any) =>
    fetch(`${API_BASE}/admin/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateGalleryItem: (id: string, data: any) =>
    fetch(`${API_BASE}/admin/gallery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteGalleryItem: (id: string) =>
    fetch(`${API_BASE}/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    }).then(handleResponse),

  // Testimonials
  getTestimonials: () =>
    fetch(`${API_BASE}/admin/testimonials`, {
      headers: { ...getAuthHeader() },
    }).then(handleResponse),

  createTestimonial: (data: any) =>
    fetch(`${API_BASE}/admin/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateTestimonial: (id: string, data: any) =>
    fetch(`${API_BASE}/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteTestimonial: (id: string) =>
    fetch(`${API_BASE}/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    }).then(handleResponse),

  // Appointments
  getAppointments: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetch(`${API_BASE}/admin/appointments${qs}`, {
      credentials: 'include',
      headers: { ...getAuthHeader() },
    }).then(handleResponse);
  },

  updateAppointment: (id: string, payload: any) =>
    fetch(`${API_BASE}/admin/appointments/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // Page Builder
  savePageBlocks: (slug: string, payload: any) =>
    fetch(`${API_BASE}/admin/pages/${slug}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // File Upload
  uploadImage: (formData: FormData) =>
    fetch(`${API_BASE}/admin/uploads`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getAuthHeader() },
      body: formData,
    }).then(handleResponse),
};
