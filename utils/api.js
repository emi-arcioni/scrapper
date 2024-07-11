import axios from 'axios';

export const get = async (url, headers) => {
  const response = await axios.get(url, { headers });
  return response.data;
};

export const post = async (url, body, headers) => {
  const response = await axios.post(url, body, { headers });
  return response.data;
};