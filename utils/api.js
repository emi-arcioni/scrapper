import axios from 'axios';

export const get = async (url, headers) => {
  const response = await axios.get(url, { headers });
  return response.data;
};

export const post = async (url, body, headers) => {
  const response = await axios.post(url, body, { headers });
  return response.data;
};

export const put = async (url, body, headers) => {
  const response = await axios.put(url, body, { headers });
  return response.data;
};