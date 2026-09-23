// All requests go through the Vite dev proxy: /api/* -> http://localhost:8000/*
// (backend is untouched; proxy strips the /api prefix, so no CORS needed).

const BASE = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function request(path, { method = 'GET', body, form, auth = false } = {}) {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form ? form : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const detail =
      data && typeof data.detail === 'string'
        ? data.detail
        : `Request failed (${res.status})`;
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---- Auth ----
export const register = (payload) =>
  request('/auth/register', { method: 'POST', body: payload });

export async function login(username, password) {
  const form = new URLSearchParams();
  form.append('username', username); // OAuth2PasswordRequestForm expects username field
  form.append('password', password);
  return request('/auth/login', { method: 'POST', form });
}

// ---- Posts ----
export const getPosts = ({ skip = 0, limit = 10, search, author } = {}) => {
  const params = new URLSearchParams({ skip, limit });
  if (search) params.set('search', search);
  if (author) params.set('author', author);
  return request(`/posts/?${params.toString()}`);
};

export const getPost = (id) => request(`/posts/${id}`);

export const createPost = (payload) =>
  request('/posts/', { method: 'POST', body: payload, auth: true });

export const updatePost = (id, payload) =>
  request(`/posts/${id}`, { method: 'PUT', body: payload, auth: true });

export const deletePost = (id) =>
  request(`/posts/${id}`, { method: 'DELETE', auth: true });

// ---- Comments ----
export const getComments = (postId) => request(`/posts/${postId}/comments/`);

export const addComment = (postId, content) =>
  request(`/posts/${postId}/comments/`, {
    method: 'POST',
    body: { content },
    auth: true,
  });
