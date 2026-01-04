// api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
  // 1. Ambil data rahasia dari Environment Server
  const CREDENTIALS = {
    api_id: process.env.SMM_API_ID,
    api_key: process.env.SMM_API_KEY,
    secret_key: process.env.SMM_SECRET_KEY,
  };

  const TARGET_URL = process.env.SMM_BASE_URL; // URL Pusat (tanpa /api-proxy)

  // 2. Cek Method
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: 'Method not allowed' });
  }

  try {
    // 3. Gabungkan data dari Frontend dengan Kunci Rahasia
    const { endpoint, ...frontendData } = req.body;
    
    // Tentukan URL tujuan berdasarkan request frontend
    // Misal: frontend minta 'profile', kita tembak ke 'https://pusat.com/profile'
    const finalUrl = `${TARGET_URL}/${endpoint}`; 

    const formData = new URLSearchParams();
    // Masukkan Credentials
    formData.append('api_id', CREDENTIALS.api_id);
    formData.append('api_key', CREDENTIALS.api_key);
    formData.append('secret_key', CREDENTIALS.secret_key);
    
    // Masukkan data dari frontend (service id, target, quantity, action, dll)
    Object.keys(frontendData).forEach(key => {
        formData.append(key, frontendData[key]);
    });

    // 4. Tembak ke Pusat (Server to Server)
    const response = await axios.post(finalUrl, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // 5. Kembalikan hasil ke Frontend
    return res.status(200).json(response.data);

  } catch (error) {
    console.error("Proxy Error:", error.message);
    return res.status(500).json({ status: false, data: { msg: "Server Error" } });
  }
}