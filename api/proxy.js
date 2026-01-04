// api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
  // Tambahkan Header CORS agar tidak diblokir browser
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tangani Request OPTIONS (Pre-flight check dari browser)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Cek apakah Method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ msg: 'Method Not Allowed' });
  }

  try {
    // 1. Ambil data Environment Variables
    const API_ID = process.env.SMM_API_ID;
    const API_KEY = process.env.SMM_API_KEY;
    const SECRET_KEY = process.env.SMM_SECRET_KEY;
    const BASE_URL = process.env.SMM_BASE_URL;

    // Debugging (Cek apakah Env terbaca di Server Logs)
    console.log("Debug Env:", { API_ID_Exists: !!API_ID, URL: BASE_URL });

    if (!API_ID || !API_KEY || !BASE_URL) {
      throw new Error("Environment Variables Belum Lengkap!");
    }

    // 2. Siapkan Data
    const { endpoint, ...frontendData } = req.body;
    const targetUrl = `${BASE_URL}/${endpoint}`;
    
    const formData = new URLSearchParams();
    formData.append('api_id', API_ID);
    formData.append('api_key', API_KEY);
    formData.append('secret_key', SECRET_KEY);
    
    Object.keys(frontendData).forEach(key => {
        formData.append(key, frontendData[key]);
    });

    // 3. Tembak ke Pusat
    const response = await axios.post(targetUrl, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // 4. Balas ke Frontend
    return res.status(200).json(response.data);

  } catch (error) {
    console.error("Proxy Error Full:", error);
    return res.status(500).json({ 
        status: false, 
        msg: "Server Error", 
        error_detail: error.message 
    });
  }
}