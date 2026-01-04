import axios from 'axios';

// Ganti dengan data aslimu dari website provider
const API_CONFIG = {
  endpoint: 'https://ordersosmed.id/api-1/profile',
  api_id: '57788', 
  api_key: '89c5bc9b8a72a8dc84dba19ed4d128f5346e4bef5a19ee3c52e100e0e814983b',
  secret_key: 'DaudHanafi'
};

export const getProfile = async () => {
  const formData = new FormData();
  formData.append('api_id', API_CONFIG.api_id);
  formData.append('api_key', API_CONFIG.api_key);
  formData.append('secret_key', API_CONFIG.secret_key);

  try {
    const response = await axios.post(API_CONFIG.endpoint, formData);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data profile:", error);
    return null;
  }
};