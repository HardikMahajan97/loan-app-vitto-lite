const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status, code, errors) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors || [];
  }
}

const request = async (method, path, body, params) => {
  const url = new URL(`${BASE_URL}/api${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      data.message || 'Something went wrong',
      res.status,
      data.code,
      data.errors
    );
  }

  return data;
};

export const api = {
  submitApplication: (payload) => request('POST', '/applications', payload),

  getApplications: (params) => request('GET', '/applications', null, params),

  getApplication: (id) => request('GET', `/applications/${id}`),

  updateStatus: (id, status) => request('PATCH', `/applications/${id}/status`, { status }),

  getSummary: () => request('GET', '/summary'),
};

export { ApiError };
