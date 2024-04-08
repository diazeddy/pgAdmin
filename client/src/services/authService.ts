import axios from 'axios';

export const login = async (): Promise<string | null> => {
  try {
    const response = await axios.post('/api/test-auth');
    const token = response.data.token;
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const logout = (): void => {
  localStorage.removeItem('token');
};