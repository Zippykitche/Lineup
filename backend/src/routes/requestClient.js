import "dotenv/config";

const BASE_URL = process.env.BASE_URL || 'https://lineup-backend-1nyx.onrender.com';

export const request = async (method, url, token = null, body = null) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();

  return {
    status: res.status,
    data,
  };
};