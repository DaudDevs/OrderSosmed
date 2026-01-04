import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';
// 1. IMPORT LIBRARY TOAST
import { Toaster, toast } from 'react-hot-toast';
import {
  LayoutDashboard, ShoppingCart, CreditCard, LogOut, Menu, X,
  History, Key, CheckCircle2, Loader2, AlertCircle,
  Instagram, Music, Youtube, Facebook, RefreshCw, RefreshCcw,
  MessageSquare, User, Search
} from 'lucide-react';

// ==========================================
// 1. KONFIGURASI (HYBRID MODE)
// ==========================================
const IS_LOCAL = import.meta.env.DEV;

const LOCAL_CREDENTIALS = {
  api_id: '57788',
  api_key: '89c5bc9b8a72a8dc84dba19ed4d128f5346e4bef5a19ee3c52e100e0e814983b',
  secret_key: 'daudhanafi'
};

const CONFIG = { PROFIT_PERCENTAGE: 150 }; // Persentase profit
const ADMIN_USERNAME = 'DaudHanafi';

// --- HELPER FORMAT RUPIAH ---
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
};

const callApi = async (endpoint, payload = {}) => {
    if (IS_LOCAL) {
        const params = new URLSearchParams();
        params.append('api_id', LOCAL_CREDENTIALS.api_id);
        params.append('api_key', LOCAL_CREDENTIALS.api_key);
        params.append('secret_key', LOCAL_CREDENTIALS.secret_key);
        Object.keys(payload).forEach(key => params.append(key, payload[key]));
        return await axios.post(`/api-proxy/api-1/${endpoint}`, params);
    } else {
        return await axios.post('/api/proxy', { endpoint, ...payload });
    }
};

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================
const ServiceCard = ({ icon, label, desc, color, iconColor, onClick }) => (
  <div onClick={onClick} className="group relative p-4 md:p-6 bg-[#1e293b] border border-slate-700 rounded-2xl cursor-pointer overflow-hidden hover:border-slate-500 hover:-translate-y-1 transition-all">
    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`}></div>
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 md:mb-4 shadow-lg`}>{React.cloneElement(icon, { className: `${iconColor} w-5 h-5 md:w-6 md:h-6` })}</div>
    <h4 className="text-white font-bold text-base md:text-lg mb-0.5">{label}</h4>
    <p className="text-slate-500 text-[10px] md:text-xs">{desc}</p>
  </div>
);

const MenuItem = ({ icon, label, isActive, onClick, variant = 'default' }) => {
  const activeClass = isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white";
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${variant === 'danger' ? 'text-red-400 hover:bg-red-500/10' : activeClass}`}>
      <div>{React.cloneElement(icon, { size: 20 })}</div>
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
};

// ==========================================
// 3. PAGE COMPONENTS (RESPONSIVE)
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
    if (!confirm(`Kirim saldo ${formatRupiah(amount)} ke @${targetUsername}?`)) return;
    setLoading(true);
    // GANTI ALERT JADI TOAST LOADING
    const toastId = toast.loading("Mengirim saldo...");
    try {
      const { data: targetUser, error: findError } = await supabase.from('profiles').select('*').eq('username', targetUsername).single();
      if (findError || !targetUser) { throw new Error("Username tidak ditemukan!"); }

      const newBalance = Number(targetUser.balance) + Number(amount);
      const { error: updateError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', targetUser.id);
      if (updateError) throw updateError;

      // GANTI ALERT JADI TOAST SUKSES
      toast.success("Saldo Berhasil Dikirim!", { id: toastId });
      setTargetUsername(''); setAmount(''); fetchUsers();
    } catch (err) {
      // GANTI ALERT JADI TOAST ERROR
      toast.error("Gagal: " + err.message, { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 md:p-6 shadow-xl">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg"><Key className="text-yellow-400"/> Admin: Isi Saldo</h3>
        <form onSubmit={handleTopUp} className="space-y-4">
          <input type="text" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Username Member" value={targetUsername} onChange={e => setTargetUsername(e.target.value)} required />
          <input type="number" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Nominal" value={amount} onChange={e => setAmount(e.target.value)} required />
          <button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl mt-2 transition-all active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Kirim Saldo'}</button>
        </form>
      </div>
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 md:p-6 overflow-hidden shadow-xl">
        <h3 className="font-bold text-white mb-4 text-lg">Top Member</h3>
        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
          <table className="w-full text-sm text-left text-slate-300 min-w-[300px]">
            <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] md:text-xs"><tr><th className="px-3 py-2">User</th><th className="px-3 py-2">Saldo</th><th className="px-3 py-2 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-700/50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="px-3 py-3 font-bold text-white text-xs md:text-sm">{u.username}</td>
                  <td className="px-3 py-3 text-green-400 text-xs md:text-sm">{formatRupiah(u.balance)}</td>
                  <td className="px-3 py-3 text-right"><button onClick={() => setTargetUsername(u.username)} className="text-[10px] bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-500/40">Pilih</button></td>
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
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl p-6 md:p-8 border border-indigo-500/30 shadow-lg bg-gradient-to-br from-indigo-900/40 to-slate-900/40">
            <div className="absolute top-0 right-0 p-3 opacity-10"><CreditCard size={120}/></div>
            <p className="text-indigo-200 font-medium mb-1 text-sm md:text-base">Saldo Tersedia</p>
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">{formatRupiah(profile.balance || 0)}</h3>
            <button onClick={() => onNavigate('deposit')} className="px-5 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20"><CreditCard size={16}/> Isi Saldo</button>
        </div>
        <div className="rounded-2xl bg-[#1e293b] border border-slate-700 p-6 flex flex-col justify-center shadow-lg">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Status Akun</p>
          <h4 className="text-xl font-bold text-green-400 mt-2 flex items-center gap-2"><CheckCircle2 size={20}/> Member Aktif</h4>
          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300"><User size={16}/></div>
             <p className="text-sm text-slate-300 font-medium">@{profile.username}</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2"><div className="w-1 h-6 bg-indigo-500 rounded-full"></div> Pintasan Layanan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <ServiceCard onClick={() => onNavigate('order')} icon={<Instagram />} label="Instagram" desc="Followers & Likes" color="from-pink-500 to-rose-500" iconColor="text-pink-100" />
          <ServiceCard onClick={() => onNavigate('order')} icon={<Music />} label="TikTok" desc="Views & Followers" color="from-cyan-500 to-blue-500" iconColor="text-cyan-100" />
          <ServiceCard onClick={() => onNavigate('order')} icon={<Youtube />} label="Youtube" desc="Subs & Watchtime" color="from-red-500 to-orange-500" iconColor="text-red-100" />
          <ServiceCard onClick={() => onNavigate('order')} icon={<Facebook />} label="Facebook" desc="Likes & Followers" color="from-blue-600 to-indigo-600" iconColor="text-blue-100" />
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
  // const [message, setMessage] = useState(null); // TIDAK DIPERLUKAN LAGI KARENA PAKAI TOAST
  const [searchTerm, setSearchTerm] = useState('');

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

  const searchedServices = validServices.filter(s => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const sName = (getVal(s, srvNameKeys) || '').toLowerCase();
      const cName = (getVal(s, catNameKeys) || '').toLowerCase();
      const sId = String(getVal(s, srvIdKeys) || '');
      return sName.includes(term) || cName.includes(term) || sId.includes(term);
  });

  const categories = [];
  const seenCats = new Set();
  searchedServices.forEach(item => {
      let cId = getVal(item, catIdKeys) || getVal(item, catNameKeys);
      let cName = getVal(item, catNameKeys) || `Kategori ${cId}`;
      if (cId && !seenCats.has(String(cId))) {
          seenCats.add(String(cId));
          categories.push({ id: cId, name: cName });
      }
  });

  const filteredServices = searchedServices.filter(s => {
      let sCatId = getVal(s, catIdKeys) || getVal(s, catNameKeys);
      return selectedCatId ? String(sCatId) === String(selectedCatId) : false;
  });

  const currentService = validServices.find(s => String(getVal(s, srvIdKeys)) === String(selectedServiceId));
  const modalPrice = currentService ? parseFloat(getVal(currentService, priceKeys) || 0) : 0;
  const sellingPricePer1k = modalPrice + ((modalPrice * CONFIG.PROFIT_PERCENTAGE) / 100);
  const totalPrice = quantity ? (sellingPricePer1k / 1000) * quantity : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // GANTI PESAN MANUAL JADI TOAST LOADING
    const toastId = toast.loading("Memproses pesanan...");

    const result = await onOrder({
        service: selectedServiceId, target, quantity, totalPrice, modalPricePer1k: modalPrice
    }, currentService);

    if (result.success) {
       // GANTI PESAN JADI TOAST SUKSES
       toast.success(`Sukses! Order ID: ${result.orderId}`, { id: toastId });
       refreshProfile(); setTarget(''); setQuantity('');
    } else {
       // GANTI PESAN JADI TOAST ERROR
       toast.error(result.msg || 'Gagal order.', { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 bg-[#1e293b] border border-slate-700 rounded-2xl p-5 md:p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ShoppingCart className="text-indigo-400"/> Order Layanan</h3>
        {/* BAGIAN PESAN LAMA DIHAPUS KARENA SUDAH PAKAI TOAST */}

        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="relative">
              <label className="text-slate-400 text-xs font-semibold uppercase mb-2 block ml-1">Cari Layanan Cepat</label>
              <div className="relative">
                  <input type="text" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl pl-10 pr-4 py-3.5 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Ketik nama layanan (misal: Instagram Like)..." value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setSelectedCatId(''); setSelectedServiceId(''); }}
                  />
                  <Search className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-2">
                  <label className="text-slate-400 text-xs font-semibold uppercase mb-2 block ml-1">Kategori {searchTerm && '(Difilter)'}</label>
                  <select className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3.5 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={selectedCatId} onChange={e => {setSelectedCatId(e.target.value); setSelectedServiceId('')}}>
                      <option value="">-- {categories.length > 0 ? 'Pilih Kategori' : 'Tidak ada hasil'} --</option>
                      {categories.map((c, i) => <option key={i} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="md:col-span-2">
                  <label className="text-slate-400 text-xs font-semibold uppercase mb-2 block ml-1">Layanan</label>
                  <select className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3.5 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" disabled={!selectedCatId} value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)}>
                      <option value="">-- Pilih Layanan --</option>
                      {filteredServices.map((s, i) => {
                          const id = getVal(s, srvIdKeys);
                          const name = getVal(s, srvNameKeys);
                          const price = parseFloat(getVal(s, priceKeys) || 0);
                          const sellPrice = price + ((price * CONFIG.PROFIT_PERCENTAGE) / 100);
                          return <option key={i} value={id}>ID:{id} - {name} - {formatRupiah(sellPrice)}</option>
                      })}
                  </select>
               </div>
           </div>

           {currentService && (
             <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200 animate-fade-in">
                <p className="opacity-80 text-xs md:text-sm leading-relaxed">{getVal(currentService, ['note', 'desc', 'keterangan']) || 'Tidak ada deskripsi'}</p>
                <div className="mt-3 pt-3 border-t border-indigo-500/20 flex flex-wrap gap-2 justify-between items-center text-xs">
                    <span className="text-slate-400">Min: {getVal(currentService, ['min']) || 1} / Max: {getVal(currentService, ['max']) || 'Unlimited'}</span>
                    <span className="font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">Harga: {formatRupiah(sellingPricePer1k)} / 1k</span>
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="text-slate-400 text-xs font-semibold uppercase mb-2 block ml-1">Target</label>
                 <input type="text" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3.5 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Link / Username" value={target} onChange={e => setTarget(e.target.value)} required />
              </div>
              <div>
                 <label className="text-slate-400 text-xs font-semibold uppercase mb-2 block ml-1">Jumlah</label>
                 <input type="number" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3.5 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contoh: 1000" value={quantity} onChange={e => setQuantity(e.target.value)} required />
              </div>
           </div>
           
           <div className="pt-6 mt-2 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="text-center md:text-left">
                <p className="text-slate-400 text-xs uppercase font-bold">Total Bayar</p>
                <p className="text-3xl font-bold text-white tracking-tight">{formatRupiah(totalPrice)}</p>
             </div>
             <button disabled={loading || totalPrice > balance || totalPrice <= 0} className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${totalPrice > balance ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95'}`}>
               {loading ? <Loader2 className="animate-spin mx-auto"/> : 'BELI SEKARANG'}
             </button>
           </div>
        </form>
      </div>
      <div className="space-y-6">
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 shadow-xl">
           <h4 className="font-bold text-white mb-2 text-yellow-500 flex items-center gap-2"><AlertCircle size={18}/> Info Saldo</h4>
           <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-600/50 mb-4">
              <p className="text-slate-400 text-xs mb-1">Saldo Tersedia</p>
              <b className="text-white text-xl">{formatRupiah(balance)}</b>
           </div>
           {totalPrice > balance && <p className="text-red-400 text-xs font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20 text-center">Saldo tidak mencukupi!</p>}
        </div>
      </div>
    </div>
  );
};

const OrderHistoryView = ({ userId, onCheckStatus, onRefill }) => {
    const [orders, setOrders] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data } = await supabase.from('user_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
            if (data) setOrders(data);
        };
        fetchOrders();
    }, [userId]);

    const handleAction = async (action, order) => {
        if (loadingId) return; setLoadingId(order.id);
        // GANTI ALERT JADI TOAST LOADING
        const toastId = toast.loading("Memproses...");
        try {
            if (action === 'status') await onCheckStatus(order, toastId);
            if (action === 'refill') await onRefill(order, toastId);
        } catch (error) {
            toast.error("Terjadi kesalahan", { id: toastId });
        }
        setLoadingId(null);
        const { data } = await supabase.from('user_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) setOrders(data);
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 md:p-6 border-b border-slate-700/50 flex justify-between items-center">
                <h3 className="font-bold text-white text-lg">Riwayat Pesanan</h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">{orders.length} Transaksi</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300 min-w-[600px]">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] md:text-xs"><tr><th className="px-4 py-3">ID / Tgl</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Info</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {orders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-800/30">
                                <td className="px-4 py-3">
                                    <div className="font-bold text-white">#{o.provider_id || o.id}</div>
                                    <div className="text-[10px] text-slate-500">{new Date(o.created_at).toLocaleDateString()}</div>
                                    {o.refill_id && <div className="text-[10px] text-green-400 mt-1 bg-green-500/10 px-1 rounded w-fit">Refill: #{o.refill_id}</div>}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs max-w-[150px] truncate">{o.target}</td>
                                <td className="px-4 py-3">
                                    <div className="text-xs">Qty: <span className="text-white font-bold">{o.quantity}</span></div>
                                    <div className="text-[10px] text-slate-500">Start: {o.start_count || '-'}</div>
                                    <div className="text-[10px] text-slate-500">Sisa: {o.remains || '-'}</div>
                                </td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${String(o.status).toLowerCase().includes('success') ? 'bg-green-500/10 text-green-400 border-green-500/20' : String(o.status).toLowerCase().includes('pending') ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{o.status}</span></td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleAction('status', o)} disabled={loadingId === o.id} className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                            {loadingId === o.id ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                                        </button>
                                        {(String(o.status).toLowerCase().includes('success') || String(o.status).toLowerCase().includes('complet')) && (
                                            <button onClick={() => handleAction('refill', o)} disabled={loadingId === o.id} className="p-2 bg-slate-700 text-green-400 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                                                <RefreshCcw size={14}/>
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
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 md:p-8 text-center shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <CreditCard className="text-indigo-400"/> Deposit QRIS
            </h3>
            <p className="text-slate-400 text-sm mb-6">Otomatis dicek Admin. Bebas biaya admin.</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg shadow-indigo-500/20 mb-6 relative group transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-2xl m-2 pointer-events-none"></div>
                <img src="https://nmgtscdialmxgktwaocn.supabase.co/storage/v1/object/public/QR%20code/WhatsApp%20Image%202026-01-04%20at%2018.59.39%20(1).jpeg" alt="QRIS Code" className="w-48 h-48 md:w-56 md:h-56 object-contain mx-auto"/>
                <p className="text-slate-900 font-bold mt-2 text-xs tracking-[0.2em]">SCAN ME</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-left text-sm space-y-3 mb-6">
                <p className="text-slate-400 text-center text-xs mb-2 uppercase font-bold tracking-wider">Cara Deposit</p>
                <div className="flex gap-3"><div className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">1</div><p className="text-slate-300 text-xs">Screenshot kode QR di atas.</p></div>
                <div className="flex gap-3"><div className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">2</div><p className="text-slate-300 text-xs">Buka E-Wallet (DANA/Gopay) atau M-Banking.</p></div>
                <div className="flex gap-3"><div className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">3</div><p className="text-slate-300 text-xs">Scan & Bayar. Min deposit <b>Rp 10.000</b>.</p></div>
            </div>

            <button onClick={() => window.open('https://wa.me/6285814866038?text=Halo%20Admin,%20saya%20sudah%20deposit%20via%20QRIS.%20Mohon%20dicek.', '_blank')} className="w-full bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-500/20 active:scale-95">
                <MessageSquare size={18}/> Konfirmasi WhatsApp
            </button>
        </div>
    </div>
);

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', username: '', fullname: '' });
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        // GANTI ALERT JADI TOAST LOADING
        const toastId = toast.loading(isRegister ? "Mendaftarkan..." : "Masuk...");
        try {
            if (isRegister) {
                const { data: authData, error: authError } = await supabase.auth.signUp({ 
                    email: formData.email, password: formData.password,
                    options: { emailRedirectTo: window.location.origin }
                });
                if (authError) throw authError;
                if (authData.user) {
                    await supabase.from('profiles').insert([{ id: authData.user.id, username: formData.username, full_name: formData.fullname, balance: 0 }]);
                    // GANTI ALERT JADI TOAST SUKSES
                    toast.success("Registrasi Berhasil! Cek Email untuk verifikasi.", { id: toastId, duration: 5000 });
                    setIsRegister(false);
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
                if (error) throw error;
                // TOAST SUKSES LOGIN (Akan hilang otomatis saat pindah halaman)
                toast.success("Berhasil Login!", { id: toastId });
            }
        } catch (error) { 
            // GANTI ALERT JADI TOAST ERROR
            toast.error(error.message, { id: toastId });
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#1e293b] border border-slate-700 p-6 md:p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">SosmedKu</h1>
                    <p className="text-slate-400 text-sm">Masuk untuk mengelola pesanan</p>
                </div>
                <h2 className="text-lg font-bold text-white mb-4">{isRegister ? 'Buat Akun Baru' : 'Login Member'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    {isRegister && <><input type="text" placeholder="Nama Lengkap" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" onChange={e => setFormData({...formData, fullname: e.target.value})} required /><input type="text" placeholder="Username (Tanpa Spasi)" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" onChange={e => setFormData({...formData, username: e.target.value})} required /></>}
                    <input type="email" placeholder="Email" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto"/> : (isRegister ? 'Daftar Sekarang' : 'Masuk Dashboard')}</button>
                </form>
                <button onClick={() => setIsRegister(!isRegister)} className="block w-full text-center text-slate-400 mt-6 text-sm hover:text-white transition-colors">{isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}</button>
            </div>
        </div>
    );
};

// ==========================================
// 5. MAIN APP LAYOUT (RESPONSIVE)
// ==========================================
const App = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                const res = await callApi('service', { action: 'services' });
                if (res.data && Array.isArray(res.data.data)) setServices(res.data.data);
            } catch (e) { console.error("Gagal load services", e); }
          };
          getServices();
      }
  }, [session]);

  const handlePlaceOrder = async (data, details) => {
     if (!profile) return { success: false, msg: 'Error' };
     try {
        const res = await callApi('order', { service: data.service, target: data.target, quantity: data.quantity });
        if (res.data.status === true || res.data.response === true) {
            const newBal = profile.balance - data.totalPrice;
            await supabase.from('profiles').update({ balance: newBal }).eq('id', session.user.id);
            setProfile({ ...profile, balance: newBal });
            await supabase.from('user_orders').insert([{
                 user_id: session.user.id, service_name: details?.name, target: data.target, 
                 quantity: data.quantity, price: data.totalPrice, modal: (data.modalPricePer1k/1000)*data.quantity,
                 status: 'Pending', provider_id: String(res.data.data.id)
            }]);
            return { success: true, orderId: res.data.data.id };
        }
        return { success: false, msg: 'Gagal dari pusat' };
     } catch (e) { return { success: false, msg: 'Koneksi error' }; }
  };

  // UPDATE FUNGSI CEK STATUS AGAR PAKAI TOAST
  const handleCheckStatus = async (order, toastId) => {
      try {
          const res = await callApi('status', { id: order.provider_id || order.id, action: 'status' });
          if (res.data.status === true || res.data.response === true) {
              await supabase.from('user_orders').update({ status: res.data.data.status, start_count: res.data.data.start_count, remains: res.data.data.remains }).eq('id', order.id);
              toast.success(`Status Diupdate: ${res.data.data.status}`, { id: toastId });
          } else { toast.error("Gagal cek status", { id: toastId }); }
      } catch (err) { toast.error("Koneksi Error", { id: toastId }); }
  };

  // UPDATE FUNGSI REFILL AGAR PAKAI TOAST
  const handleRefill = async (order, toastId) => {
      if(!confirm("Ajukan Refill?")) { toast.dismiss(toastId); return; }
      try {
          const res = await callApi('reffil', { id: order.provider_id || order.id, action: 'reffil' });
          if (res.data.status === true || res.data.response === true) {
              await supabase.from('user_orders').update({ refill_id: String(res.data.data.id) }).eq('id', order.id);
              toast.success("Refill Berhasil Diajukan!", { id: toastId });
          } else { toast.error("Gagal mengajukan refill", { id: toastId }); }
      } catch (err) { toast.error("Koneksi Error", { id: toastId }); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setProfile(null); };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden">
       {/* 2. TAMBAHKAN KONTAINER TOAST DI SINI */}
       <Toaster position="top-center" reverseOrder={false} toastOptions={{
         style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
         success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
         error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
       }}/>

       {/* MOBILE SIDEBAR OVERLAY */}
       <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] border-r border-slate-700/50 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-20 flex items-center justify-between px-6 font-bold text-2xl text-white">
             <span>Sosmedku</span>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X size={24}/></button>
          </div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
             <MenuItem icon={<LayoutDashboard/>} label="Dashboard" isActive={activePage === 'dashboard'} onClick={() => { setActivePage('dashboard'); setSidebarOpen(false); }} />
             <MenuItem icon={<ShoppingCart/>} label="Order Baru" isActive={activePage === 'order'} onClick={() => { setActivePage('order'); setSidebarOpen(false); }} />
             <MenuItem icon={<History/>} label="Riwayat" isActive={activePage === 'history'} onClick={() => { setActivePage('history'); setSidebarOpen(false); }} />
             <MenuItem icon={<CreditCard/>} label="Deposit" isActive={activePage === 'deposit'} onClick={() => { setActivePage('deposit'); setSidebarOpen(false); }} />
             {isAdmin && (
                <div className="pt-4 mt-4 border-t border-slate-700/50">
                    <p className="px-4 text-[10px] uppercase text-slate-500 font-bold mb-2">Area Owner</p>
                    <MenuItem icon={<Key/>} label="Kelola Saldo" isActive={activePage === 'admin'} onClick={() => { setActivePage('admin'); setSidebarOpen(false); }} />
                </div>
             )}
             <MenuItem icon={<LogOut/>} label="Keluar" variant="danger" onClick={handleLogout} />
          </nav>
       </aside>

       {/* BACKDROP UNTUK MOBILE */}
       {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

       <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {!session ? <LoginPage /> : (
            <>
              <header className="h-16 md:h-20 bg-[#0f172a] border-b border-slate-700 flex items-center justify-between px-4 md:px-8">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-300 p-2 hover:bg-slate-800 rounded-lg"><Menu size={24}/></button>
                <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                        <p className="font-bold text-white text-sm md:text-base">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-green-400">{formatRupiah(profile?.balance || 0)}</p>
                    </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {activePage === 'dashboard' && <DashboardView profile={profile || {}} onNavigate={setActivePage} />}
                {activePage === 'order' && <OrderView services={services} balance={profile?.balance || 0} onOrder={handlePlaceOrder} refreshProfile={() => fetchUserProfile(session.user.id)} />}
                {activePage === 'history' && <OrderHistoryView userId={session.user.id} onCheckStatus={handleCheckStatus} onRefill={handleRefill} />}
                {activePage === 'deposit' && <DepositView />}
                {activePage === 'admin' && isAdmin && <AdminView />}
              </div>
            </>
          )}
       </main>
    </div>
  );
};

export default App;