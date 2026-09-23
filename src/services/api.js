const API_BASE = 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('silentos_token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response
    .json()
    .catch(() => ({
      success: false,
      error: 'Malformed server response',
    }));

  if (!response.ok || !data.success) {
    const message =
      data.error ||
      (data.details
        ? data.details.map((d) => d.message).join(', ')
        : 'Request failed');

    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  async register(body) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async login(body) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async getMe() {
    return request('/auth/me');
  },

  async logout() {
    
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  // Emergency Contacts
  async getContacts() {
    const res = await request('/contacts');
    return res.data;
  },

  async createContact(contact) {
    const res = await request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });

    return res.data;
  },

  async updateContact(id, contact) {
    const res = await request(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(contact),
    });

    return res.data;
  },

  async deleteContact(id) {
    return request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },

  // Alerts
  async createAlert(location) {
    const res = await request('/alerts', {
      method: 'POST',
      body: JSON.stringify(location),
    });

    return res.data;
  },

  async getAlerts(params = {}) {
    const query = new URLSearchParams();

    if (params.page) {
      query.set('page', params.page.toString());
    }

    if (params.limit) {
      query.set('limit', params.limit.toString());
    }

    if (params.status) {
      query.set('status', params.status);
    }

    const qs = query.toString() ? `?${query.toString()}` : '';

    return request(`/alerts${qs}`);
  },

  async getAlertById(id) {
    const res = await request(`/alerts/${id}`);
    return res.data;
  },

  async updateAlertLocation(id, location) {
    const res = await request(`/alerts/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify(location),
    });

    return res.data;
  },

  async acknowledgeAlert(id, note) {
    const res = await request(`/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });

    return res.data;
  },

  async resolveAlert(id, note) {
    const res = await request(`/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });

    return res.data;
  },

  // Admin
  async getAdminAlerts(params = {}) {
    const query = new URLSearchParams();

    if (params.page) {
      query.set('page', params.page.toString());
    }

    if (params.limit) {
      query.set('limit', params.limit.toString());
    }

    if (params.status) {
      query.set('status', params.status);
    }

    const qs = query.toString() ? `?${query.toString()}` : '';

    return request(`/admin/alerts${qs}`);
  },

  async getAdminMetrics() {
    const res = await request('/admin/metrics');
    return res.data;
  },
};