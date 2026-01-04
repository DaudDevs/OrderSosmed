import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { supabase } from './supabaseClient'; 
import { 
  LayoutDashboard, ShoppingCart, CreditCard, LogOut, Menu, 
  History, Key, CheckCircle2, Loader2, AlertCircle, 
  Instagram, Music, Youtube, Facebook, RefreshCw, RefreshCcw,
  MessageSquare
} from 'lucide-react';

// ==========================================
// 1. KONFIGURASI (HYBRID MODE - FIX)
// ==========================================

// Cek apakah sedang di Localhost (Laptop) atau Online (Vercel)
const IS_LOCAL = import.meta.env.DEV; 

// Konfigurasi ini HANYA dipakai saat di Localhost.
// Saat Online, data ini diambil dari Server Vercel (file .env) jadi aman.
const LOCAL_CREDENTIALS = {
  api_id: '57788',  
  api_key: '89c5bc9b8a72a8dc84dba19ed4d128f5346e4bef5a19ee3c52e100e0e814983b', 
  secret_key: 'daudhanafi' 
};

const CONFIG = { PROFIT_PERCENTAGE: 20 };
// Pastikan username ini sama persis dengan di database Supabase (Case Sensitive)
const ADMIN_USERNAME = 'DaudHanafi'; 

// --- FUNGSI PENGHUBUNG API PINTAR (SMART FETCH) ---
const callApi = async (endpoint, payload = {}) => {
    // MODE 1: LOCALHOST (Pakai Proxy Vite seperti biasa)
    if (IS_LOCAL) {
        const params = new URLSearchParams();
        params.append('api_id', LOCAL_CREDENTIALS.api_id);
        params.append('api_key', LOCAL_CREDENTIALS.api_key);
        params.append('secret_key', LOCAL_CREDENTIALS.secret_key);
        
        // Masukkan data tambahan (service, target, dll)
        Object.keys(payload).forEach(key => params.append(key, payload[key]));
        
        // Tembak lewat Vite Proxy (/api-proxy/...)
        return await axios.post(`/api-proxy/api-1/${endpoint}`, params);
    } 
    
    // MODE 2: ONLINE / PRODUCTION (Pakai Backend Vercel - AMAN)
    else {
        // Kita cuma kirim data pesanan. API Key disuntikkan di server backend.
        // Tembak lewat Vercel Function (/api/proxy)
        return await axios.post('/api/proxy', { 
            endpoint: endpoint, // Kasih tau server mau nembak ke mana (profile/order/dll)
            ...payload 
        });
    }
};

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================
const ServiceCard = ({ icon, label, desc, color, iconColor, onClick }) => (
  <div onClick={onClick} className="group relative p-6 bg-[#1e293b] border border-slate-700 rounded-2xl cursor-pointer overflow-hidden hover:border-slate-500 hover:-translate-y-1">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`}></div>
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>{React.cloneElement(icon, { className: iconColor })}</div>
    <h4 className="text-white font-bold text-lg mb-1">{label}</h4>
    <p className="text-slate-500 text-xs">{desc}</p>
  </div>
);

const MenuItem = ({ icon, label, isActive, isOpen, onClick, variant = 'default' }) => {
  const activeClass = isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white";
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${variant === 'danger' ? 'text-red-400 hover:bg-red-500/10' : activeClass}`}>
      <div>{React.cloneElement(icon, { size: 20 })}</div>
      <span className={`font-medium ${isOpen ? 'opacity-100' : 'hidden'}`}>{label}</span>
    </div>
  );
};

// ==========================================
// 3. PAGE COMPONENTS
// ==========================================

const AdminView = () => {
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('balance', { ascending: false }).limit(10);
    if (data) setUsers(data);
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!confirm(`Kirim saldo Rp ${Number(amount).toLocaleString()} ke @${targetUsername}?`)) return;
    setLoading(true);
    try {
      const { data: targetUser, error: findError } = await supabase.from('profiles').select('*').eq('username', targetUsername).single();
      if (findError || !targetUser) { alert("Username tidak ditemukan!"); setLoading(false); return; }

      const newBalance = Number(targetUser.balance) + Number(amount);
      const { error: updateError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', targetUser.id);
      if (updateError) throw updateError;

      alert("Saldo Berhasil Dikirim!");
      setTargetUsername(''); setAmount(''); fetchUsers();
    } catch (err) { alert("Gagal: " + err.message); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Key className="text-yellow-400"/> Admin: Isi Saldo</h3>
        <form onSubmit={handleTopUp} className="space-y-4">
          <input type="text" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="Username Member" value={targetUsername} onChange={e => setTargetUsername(e.target.value)} required />
          <input type="number" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white" placeholder="Nominal" value={amount} onChange={e => setAmount(e.target.value)} required />
          <button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl mt-2">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Kirim Saldo'}</button>
        </form>
      </div>
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 overflow-hidden">
        <h3 className="font-bold text-white mb-4">Top Member</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs"><tr><th className="px-4 py-2">Username</th><th className="px-4 py-2">Saldo</th><th className="px-4 py-2">Aksi</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-2 font-bold text-white">{u.username}</td>
                  <td className="px-4 py-2 text-green-400">Rp {Number(u.balance).toLocaleString()}</td>
                  <td className="px-4 py-2"><button onClick={() => setTargetUsername(u.username)} className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">Pilih</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ profile, onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl p-6 border border-indigo-500/30 shadow-lg bg-indigo-900/20">
            <p className="text-indigo-100 font-medium mb-1">Saldo Anda</p>
            <h3 className="text-4xl font-bold text-white tracking-tight">Rp {Number(profile.balance || 0).toLocaleString('id-ID')}</h3>
            <div className="mt-6 flex gap-3"><button onClick={() => onNavigate('deposit')} className="px-5 py-2.5 bg-white text-indigo-600 rounded-lg font-bold text-sm flex items-center gap-2"><CreditCard size={16}/> Isi Saldo</button></div>
        </div>
        <div className="rounded-2xl bg-[#1e293b] border border-slate-700 p-6 flex flex-col justify-center">
          <p className="text-slate-400 text-sm">Status Akun</p>
          <h4 className="text-xl font-bold text-green-400 mt-1 flex items-center gap-2"><CheckCircle2 size={18}/> Aktif</h4>
          <p className="text-xs text-slate-500 mt-2 text-right">@{profile.username}</p>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-3">Pintasan Layanan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ServiceCard onClick={() => onNavigate('order')} icon={<Instagram />} label="Instagram" desc="Followers" color="from-pink-500 to-rose-500" iconColor="text-pink-100" />
          <ServiceCard onClick={() => onNavigate('order')} icon={<Music />} label="TikTok" desc="Views" color="from-cyan-500 to-blue-500" iconColor="text-cyan-100" />
          <ServiceCard onClick={() => onNavigate('order')} icon={<Youtube />} label="Youtube" desc="Subs" color="from-red-500 to-orange-500" iconColor="text-red-100" />
          <ServiceCard onClick={() => onNavigate('order')} icon={<Facebook />} label="Facebook" desc="Likes" color="from-blue-600 to-indigo-600" iconColor="text-blue-100" />
        </div>
      </div>
    </div>
  );
};

const OrderView = ({ services, balance, onOrder, refreshProfile }) => {
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [target, setTarget] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const getVal = (item, keys) => {
    if (!item) return null;
    for (let key of keys) { if (item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key]; }
    return null;
  };

  const validServices = Array.isArray(services) ? services : [];
  const catIdKeys = ['category_id', 'cat_id', 'group_id'];
  const catNameKeys = ['category', 'kategori', 'category_name'];
  const srvIdKeys = ['id', 'service', 'num'];
  const srvNameKeys = ['name', 'service_name', 'layanan'];
  const priceKeys = ['price', 'rate', 'harga'];

  const categories = [];
  const seenCats = new Set();
  validServices.forEach(item => {
      let cId = getVal(item, catIdKeys) || getVal(item, catNameKeys);
      let cName = getVal(item, catNameKeys) || `Kategori ${cId}`;
      if (cId && !seenCats.has(String(cId))) { seenCats.add(String(cId)); categories.push({ id: cId, name: cName }); }
  });

  const filteredServices = validServices.filter(s => {
      let sCatId = getVal(s, catIdKeys) || getVal(s, catNameKeys);
      return String(sCatId) === String(selectedCatId);
  });

  const currentService = validServices.find(s => String(getVal(s, srvIdKeys)) === String(selectedServiceId));
  const modalPrice = currentService ? parseFloat(getVal(currentService, priceKeys) || 0) : 0;
  const sellingPricePer1k = modalPrice + ((modalPrice * CONFIG.PROFIT_PERCENTAGE) / 100);
  const totalPrice = quantity ? (sellingPricePer1k / 1000) * quantity : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    
    // PANGGIL FUNGSI SMART API
    const result = await onOrder({ 
        service: selectedServiceId, 
        target, 
        quantity, 
        totalPrice,     
        modalPricePer1k: modalPrice 
    }, currentService);
    
    if (result.success) {
       setMessage({ type: 'success', text: `Sukses! Order ID: ${result.orderId}` });
       refreshProfile();
       setTarget(''); setQuantity('');
    } else {
       setMessage({ type: 'error', text: result.msg || 'Gagal order.' });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 bg-[#1e293b] border border-slate-700 rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ShoppingCart className="text-indigo-400"/> Form Order</h3>
        {message && <div className={`p-4 mb-6 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{message.text}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
              <label className="text-slate-300 text-sm mb-2 block">Kategori</label>
              <select className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-slate-200" value={selectedCatId} onChange={e => {setSelectedCatId(e.target.value); setSelectedServiceId('')}}>
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c, i) => <option key={i} value={c.id}>{c.name}</option>)}
              </select>
           </div>
           <div>
              <label className="text-slate-300 text-sm mb-2 block">Layanan</label>
              <select className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-slate-200" disabled={!selectedCatId} value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)}>
                  <option value="">-- Pilih Layanan --</option>
                  {filteredServices.map((s, i) => {
                      const id = getVal(s, srvIdKeys);
                      const name = getVal(s, srvNameKeys);
                      return <option key={i} value={id}>{name}</option>
                  })}
              </select>
           </div>
           {currentService && (
             <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200">
                <p>{getVal(currentService, ['note', 'desc', 'keterangan']) || 'Tidak ada deskripsi'}</p>
                <div className="mt-2 pt-2 border-t border-indigo-500/20 flex justify-between items-center">
                    <span>Harga Pusat: <span className="line-through text-slate-500 text-xs">Rp {modalPrice.toLocaleString()}</span></span>
                    <span className="font-bold text-green-400">Harga Anda: Rp {sellingPricePer1k.toLocaleString('id-ID')} / 1000</span>
                </div>
             </div>
           )}
           <input type="text" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-slate-200" placeholder="Link / Username Target" value={target} onChange={e => setTarget(e.target.value)} required />
           <input type="number" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-slate-200" placeholder="Jumlah" value={quantity} onChange={e => setQuantity(e.target.value)} required />
           <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
             <div><p className="text-slate-400 text-sm">Total Bayar</p><p className="text-2xl font-bold text-white">Rp {totalPrice.toLocaleString('id-ID')}</p></div>
             <button disabled={loading || totalPrice > balance || totalPrice <= 0} className={`px-8 py-3 rounded-xl font-bold ${totalPrice > balance ? 'bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
               {loading ? <Loader2 className="animate-spin"/> : 'Beli Sekarang'}
             </button>
           </div>
        </form>
      </div>
      <div className="space-y-6">
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
           <h4 className="font-bold text-white mb-2 text-yellow-500 flex items-center gap-2"><AlertCircle size={18}/> Saldo Anda</h4>
           <p className="text-slate-400 text-sm mb-4">Saldo saat ini: <b className="text-white">Rp {balance.toLocaleString()}</b></p>
           {totalPrice > balance && <p className="text-red-400 text-xs font-bold">Saldo tidak mencukupi untuk transaksi ini.</p>}
        </div>
      </div>
    </div>
  );
};

const OrderHistoryView = ({ userId, onCheckStatus, onRefill }) => {
    const [orders, setOrders] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

    const fetchOrders = async () => {
        const { data } = await supabase.from('user_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) setOrders(data);
    };

    useEffect(() => { fetchOrders(); }, [userId]);

    const handleAction = async (action, order) => {
        if (loadingId) return; setLoadingId(order.id);
        if (action === 'status') await onCheckStatus(order);
        if (action === 'refill') await onRefill(order);
        setLoadingId(null); fetchOrders(); 
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50"><h3 className="font-bold text-white">Riwayat Pesanan</h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-xs"><tr><th className="px-6 py-3">ID / Tanggal</th><th className="px-6 py-3">Target</th><th className="px-6 py-3">Info</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-center">Aksi</th></tr></thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                <td className="px-6 py-4">
                                    <div className="font-bold">#{o.provider_id || o.id}</div>
                                    <div className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString()}</div>
                                    {o.refill_id && <div className="text-[10px] text-green-400 mt-1">Refill: #{o.refill_id}</div>}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs max-w-[150px] truncate">{o.target}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs">Qty: {o.quantity}</div>
                                    <div className="text-xs text-slate-500">Start: {o.start_count || '-'}</div>
                                    <div className="text-xs text-slate-500">Sisa: {o.remains || '-'}</div>
                                </td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20">{o.status}</span></td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleAction('status', o)} disabled={loadingId === o.id} className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">
                                            {loadingId === o.id ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
                                        </button>
                                        {(String(o.status).toLowerCase().includes('success') || String(o.status).toLowerCase().includes('complet')) && (
                                            <button onClick={() => handleAction('refill', o)} disabled={loadingId === o.id} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                                                <RefreshCcw size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DepositView = () => (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <CreditCard className="text-indigo-400"/> Deposit via QRIS
            </h3>
            <p className="text-slate-400 text-sm mb-6">Scan QR di bawah ini menggunakan E-Wallet atau M-Banking apa saja.</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg shadow-indigo-500/10 mb-6 relative group">
                <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-2xl m-2 pointer-events-none"></div>
                {/* GANTI LINK QRIS DENGAN GAMBAR KAMU */}
                <img src="https://nmgtscdialmxgktwaocn.supabase.co/storage/v1/object/public/QR%20code/WhatsApp%20Image%202026-01-04%20at%2018.59.39%20(1).jpeg" alt="QRIS Code" className="w-48 h-48 object-contain mx-auto"/>
                <p className="text-slate-900 font-bold mt-2 text-sm tracking-widest">SCAN ME</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-left text-sm space-y-3 mb-6">
                <div className="flex gap-3"><div className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">1</div><p className="text-slate-300">Screenshot atau simpan gambar QRIS di atas.</p></div>
                <div className="flex gap-3"><div className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">2</div><p className="text-slate-300">Buka DANA / OVO / GoPay / ShopeePay / M-Banking.</p></div>
                <div className="flex gap-3"><div className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">3</div><p className="text-slate-300">Pilih menu <b>Bayar / Scan</b>, lalu upload gambar dari galeri.</p></div>
            </div>

            <button onClick={() => window.open('https://wa.me/6285814866038?text=Halo%20Admin,%20saya%20sudah%20deposit%20via%20QRIS.%20Mohon%20dicek.', '_blank')} className="w-full bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/20">
                <MessageSquare size={18}/> Kirim Bukti via WhatsApp
            </button>
        </div>
    </div>
);

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', username: '', fullname: '' });
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isRegister) {
                const { data: authData, error: authError } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
                if (authError) throw authError;
                if (authData.user) {
                    const { error: profileError } = await supabase.from('profiles').insert([{ id: authData.user.id, username: formData.username, full_name: formData.fullname, balance: 0 }]);
                    if (profileError) throw profileError;
                    alert("Registrasi Berhasil! Silakan Login."); setIsRegister(false);
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
                if (error) throw error;
            }
        } catch (error) { alert(error.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
                <h2 className="text-2xl font-bold text-white text-center mb-6">{isRegister ? 'Daftar Akun' : 'Login Member'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    {isRegister && <><input type="text" placeholder="Nama Lengkap" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white" onChange={e => setFormData({...formData, fullname: e.target.value})} required /><input type="text" placeholder="Username" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white" onChange={e => setFormData({...formData, username: e.target.value})} required /></>}
                    <input type="email" placeholder="Email" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl">{loading ? <Loader2 className="animate-spin mx-auto"/> : (isRegister ? 'Daftar' : 'Masuk')}</button>
                </form>
                <button onClick={() => setIsRegister(!isRegister)} className="block w-full text-center text-indigo-400 mt-4 text-sm hover:underline">{isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}</button>
            </div>
        </div>
    );
};

// ==========================================
// 5. MAIN APP
// ==========================================
const App = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); if (session) fetchUserProfile(session.user.id); });
      supabase.auth.onAuthStateChange((_event, session) => { setSession(session); if (session) fetchUserProfile(session.user.id); });
  }, []);

  const fetchUserProfile = async (userId) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
  };

  useEffect(() => {
      if (session) {
          const getServices = async () => {
            try {
                // MENGGUNAKAN SMART CALL API (Hybrid)
                const res = await callApi('service', { action: 'services' });
                if (res.data && Array.isArray(res.data.data)) setServices(res.data.data);
            } catch (e) { console.error("Gagal load services", e); }
          };
          getServices();
      }
  }, [session]);

  const handlePlaceOrder = async (orderData, serviceDetails) => {
      if (!profile) return { success: false, msg: 'Profil error' };
      if (profile.balance < orderData.totalPrice) return { success: false, msg: 'Saldo Anda tidak mencukupi!' };

      try {
          // MENGGUNAKAN SMART CALL API (Hybrid)
          const res = await callApi('order', {
              service: orderData.service,
              target: orderData.target,
              quantity: orderData.quantity
          });

          const isSuccess = res.data.status === true || res.data.response === true;

          if (isSuccess) {
              const providerOrderId = res.data.data.id;
              const newBalance = profile.balance - orderData.totalPrice;
              
              const { error: balErr } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', session.user.id);
              if (!balErr) setProfile({ ...profile, balance: newBalance });

              await supabase.from('user_orders').insert([{
                  user_id: session.user.id,
                  service_name: serviceDetails?.name || 'Layanan',
                  target: orderData.target,
                  quantity: orderData.quantity,
                  price: orderData.totalPrice,
                  modal: (orderData.modalPricePer1k / 1000) * orderData.quantity,
                  status: 'Pending',
                  provider_id: String(providerOrderId)
              }]);
              return { success: true, orderId: providerOrderId };
          } else {
              return { success: false, msg: `Pusat Error: ${res.data.data?.msg || 'Unknown'}` };
          }
      } catch (err) { return { success: false, msg: 'Koneksi ke Pusat Gagal.' }; }
  };

  const handleCheckStatus = async (order) => {
      try {
          const targetId = order.provider_id || order.id; 
          // MENGGUNAKAN SMART CALL API (Hybrid)
          const res = await callApi('status', { id: targetId, action: 'status' });
          
          if (res.data.status === true || res.data.response === true) {
              const newData = res.data.data; 
              await supabase.from('user_orders').update({
                  status: newData.status,
                  start_count: newData.start_count,
                  remains: newData.remains
              }).eq('id', order.id);
              alert(`Status Updated: ${newData.status}`);
          } else {
              alert("Gagal cek status (Pusat Error)");
          }
      } catch (err) { alert("Koneksi Error"); }
  };

  const handleRefill = async (order) => {
      if(!confirm("Ajukan Refill?")) return;
      try {
          const targetId = order.provider_id || order.id; 
          // MENGGUNAKAN SMART CALL API (Hybrid)
          const res = await callApi('reffil', { id: targetId, action: 'reffil' });

          if (res.data.status === true || res.data.response === true) {
              const refillId = res.data.data.id || res.data.data.refill_id;
              await supabase.from('user_orders').update({ refill_id: String(refillId) }).eq('id', order.id);
              alert(`Refill Sukses! ID: ${refillId}`);
          } else {
              alert(`Gagal Refill: ${res.data.data?.msg || 'Error'}`);
          }
      } catch (err) { alert("Koneksi Refill Error"); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setProfile(null); };

  if (!session) return <LoginPage />;
  
  const isAdmin = profile?.username === ADMIN_USERNAME;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden">
       <aside className={`w-64 bg-[#1e293b] border-r border-slate-700/50 flex flex-col ${sidebarOpen ? '' : 'hidden lg:flex'}`}>
          <div className="h-20 flex items-center justify-center font-bold text-2xl text-white">PANEL.</div>
          <nav className="p-4 space-y-2">
             <MenuItem icon={<LayoutDashboard/>} label="Dashboard" isActive={activePage === 'dashboard'} isOpen={true} onClick={() => setActivePage('dashboard')} />
             <MenuItem icon={<ShoppingCart/>} label="Order Baru" isActive={activePage === 'order'} isOpen={true} onClick={() => setActivePage('order')} />
             <MenuItem icon={<History/>} label="Riwayat" isActive={activePage === 'history'} isOpen={true} onClick={() => setActivePage('history')} />
             <MenuItem icon={<CreditCard/>} label="Deposit" isActive={activePage === 'deposit'} isOpen={true} onClick={() => setActivePage('deposit')} />
             {isAdmin && (
                <div className="pt-4 mt-4 border-t border-slate-700/50">
                    <p className="px-4 text-[10px] uppercase text-slate-500 font-bold mb-2">Area Owner</p>
                    <MenuItem icon={<Key/>} label="Kelola Saldo" isActive={activePage === 'admin'} isOpen={true} onClick={() => setActivePage('admin')} />
                </div>
             )}
             <MenuItem icon={<LogOut/>} label="Keluar" isOpen={true} variant="danger" onClick={handleLogout} />
          </nav>
       </aside>

       <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-20 bg-[#0f172a] border-b border-slate-700 flex items-center justify-between px-8">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden"><Menu/></button>
             <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-bold text-white">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-green-400">Rp {Number(profile?.balance || 0).toLocaleString()}</p>
                </div>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
             {activePage === 'dashboard' && <DashboardView profile={profile || {}} onNavigate={setActivePage} />}
             {activePage === 'order' && <OrderView services={services} balance={profile?.balance || 0} onOrder={handlePlaceOrder} refreshProfile={() => fetchUserProfile(session.user.id)} />}
             {activePage === 'history' && <OrderHistoryView userId={session.user.id} onCheckStatus={handleCheckStatus} onRefill={handleRefill} />}
             {activePage === 'deposit' && <DepositView />}
             {activePage === 'admin' && isAdmin && <AdminView />}
          </div>
       </main>
    </div>
  );
};

export default App;