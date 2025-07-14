import axios from "axios";

export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
  try {
    return await axios({ url, ...options });
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};