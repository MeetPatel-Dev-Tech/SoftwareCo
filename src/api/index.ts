import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://dev.softwareco.com/interview',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
