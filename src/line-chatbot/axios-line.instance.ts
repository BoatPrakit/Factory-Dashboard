import axios from 'axios';

const headers = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer ' + process.env.LINE_CHATBOT_TOKEN,
};
const axiosLineInstance = axios.create({
  baseURL: 'https://api.line.me/v2/bot',
  headers,
});

export default axiosLineInstance;
