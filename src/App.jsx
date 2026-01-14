import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { supabase } from './supabaseClient'; 
import { Toaster, toast } from 'react-hot-toast';
import { 
  LayoutDashboard, ShoppingCart, CreditCard, LogOut, Menu, X,
  History, Key, CheckCircle2, Loader2, AlertCircle, 
  Instagram, Music, Youtube, Facebook, RefreshCw, RefreshCcw,
  MessageSquare, User, Search, Mail, ListOrdered, LifeBuoy, Send, Trash2, Info, MessageCircle, Twitter, Bell, Megaphone
} from 'lucide-react';

// ==========================================
// 1. KONFIGURASI (HYBRID MODE)
// ==========================================
const IS_LOCAL = import.meta.env.DEV; 

const LOCAL_CREDENTIALS = {
  api_id: '67423',  
  api_key: '58c3f8a6c9955837e36f99fc649c43784dd27f5b231f06ea741e898ac3425fd9', 
  secret_key: '22300223' 
};

const CONFIG = { PROFIT_PERCENTAGE: 150 }; 
const ADMIN_USERNAME = 'DaudHanafi'; 

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

// --- MODAL INFO POPUP ---
const InfoModal = ({ isOpen, onClose }) => {
    const [infos, setInfos] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchInfo = async () => {
                const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5);
                if (data) setInfos(data);
            };
            fetchInfo();
        }
    }, [isOpen]);

    const renderWithLinks = (text) => {
        const parts = text.split(/(https?:\/\/[^\s]+)/g);
        return parts.map((part, i) => {
            if (part.match(/https?:\/\/[^\s]+/)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold hover:underline break-all">{part}</a>;
            }
            return part;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scale-up">
                <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><Bell className="text-indigo-600" size={20}/> Informasi Terbaru</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                </div>
                <div className="p-0 max-h-[60vh] overflow-y-auto bg-slate-50">
                    {infos.length === 0 ? (<div className="p-8 text-center text-slate-400 text-sm">Belum ada informasi terbaru.</div>) : (
                        <div className="divide-y divide-slate-200">
                            {infos.map((info) => (
                                <div key={info.id} className="p-5 hover:bg-white transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        {info.type === 'Layanan' ? (<span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded flex items-center gap-1 border border-green-200"><RefreshCw size={10}/> Layanan</span>) : (<span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded flex items-center gap-1 border border-blue-200"><Info size={10}/> Informasi</span>)}
                                        <span className="text-[10px] text-slate-400">{new Date(info.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wide">{info.title}</h4>
                                    <div className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-slate-100 shadow-sm">{renderWithLinks(info.content)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-white">
                    <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"><CheckCircle2 size={18}/> Saya Sudah Membaca</button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 3. PAGE COMPONENTS
// ==========================================

// --- ADMIN PAGES ---
const AdminAnnouncementView = () => {
    const [list, setList] = useState([]);
    const [formData, setFormData] = useState({ title: '', content: '', type: 'Layanan' });
    const [loading, setLoading] = useState(false);
    useEffect(() => { fetchAnnouncements(); }, []);
    const fetchAnnouncements = async () => { const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }); if (data) setList(data); };
    const handleAdd = async (e) => { e.preventDefault(); setLoading(true); const { error } = await supabase.from('announcements').insert([formData]); if (!error) { toast.success("Info berhasil diposting!"); setFormData({ title: '', content: '', type: 'Layanan' }); fetchAnnouncements(); } else { toast.error("Gagal: " + error.message); } setLoading(false); };
    const handleDelete = async (id) => { if(!confirm("Hapus info ini?")) return; await supabase.from('announcements').delete().eq('id', id); fetchAnnouncements(); toast.success("Info dihapus"); };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in"><div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 shadow-xl h-fit"><h3 className="font-bold text-white mb-4 flex items-center gap-2"><Megaphone className="text-yellow-400"/> Tambah Info</h3><form onSubmit={handleAdd} className="space-y-4"><div><label className="text-slate-400 text-xs mb-2 block font-bold uppercase">Kategori</label><select className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="Layanan">🟢 Update Layanan</option><option value="Informasi">🔵 Informasi Umum</option></select></div><div><label className="text-slate-400 text-xs mb-2 block font-bold uppercase">Judul</label><input type="text" placeholder="Contoh: LAYANAN TIKTOK MURAH" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div><div><label className="text-slate-400 text-xs mb-2 block font-bold uppercase">Isi Pesan</label><textarea rows="5" placeholder="Detail informasi..." className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required></textarea></div><button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Posting Sekarang'}</button></form></div><div className="lg:col-span-2 bg-[#1e293b] border border-slate-700 rounded-2xl p-6 shadow-xl"><h3 className="font-bold text-white mb-4 flex items-center gap-2"><ListOrdered className="text-indigo-400"/> Riwayat Pengumuman</h3><div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">{list.map(item => (<div key={item.id} className="bg-[#0f172a] p-4 rounded-xl border border-slate-700 flex justify-between items-start gap-4 hover:border-slate-500 transition-all"><div><div className="flex gap-2 mb-2"><span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${item.type === 'Layanan' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{item.type}</span><span className="text-[10px] text-slate-500 flex items-center">{new Date(item.created_at).toLocaleDateString()}</span></div><h4 className="text-white font-bold text-sm mb-1">{item.title}</h4><p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line">{item.content}</p></div><button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white border border-red-500/20 transition-all flex-shrink-0"><Trash2 size={16}/></button></div>))}</div></div></div>
    );
};

const AdminTicketView = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState('');

    useEffect(() => { fetchTickets(); }, []);
    const fetchTickets = async () => { const { data } = await supabase.from('tickets').select('*, profiles(username)').order('created_at', { ascending: false }); if (data) setTickets(data); };
    const fetchReplies = async (ticketId) => { const { data } = await supabase.from('ticket_replies').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }); if (data) setReplies(data); };
    const handleSelectTicket = (ticket) => { setSelectedTicket(ticket); fetchReplies(ticket.id); };
    const handleSendReply = async (e) => { e.preventDefault(); if (!newReply.trim()) return; await supabase.from('ticket_replies').insert([{ ticket_id: selectedTicket.id, sender_role: 'admin', message: newReply }]); await supabase.from('tickets').update({ status: 'Replied' }).eq('id', selectedTicket.id); setNewReply(''); fetchReplies(selectedTicket.id); fetchTickets(); };
    const handleCloseTicket = async () => { if(!confirm("Tutup tiket ini?")) return; await supabase.from('tickets').update({ status: 'Closed' }).eq('id', selectedTicket.id); toast.success("Tiket Ditutup"); fetchTickets(); setSelectedTicket(null); };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in h-[600px]">
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 overflow-y-auto"><h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2"><ListOrdered size={16}/> Daftar Tiket</h3><div className="space-y-2">{tickets.map(t => (<div key={t.id} onClick={() => handleSelectTicket(t)} className={`p-3 rounded-xl cursor-pointer border ${selectedTicket?.id === t.id ? 'bg-slate-700 border-indigo-500' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700'}`}><div className="flex justify-between mb-1"><span className="text-[10px] text-purple-300 font-bold">@{t.profiles?.username || 'Unknown'}</span><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' : t.status === 'Replied' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{t.status}</span></div><p className="text-white text-sm font-bold truncate">{t.subject}</p><p className="text-slate-500 text-[10px] truncate">{t.message}</p></div>))}</div></div>
            <div className="lg:col-span-2 bg-[#1e293b] border border-slate-700 rounded-2xl flex flex-col overflow-hidden relative">
                {selectedTicket ? (<><div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center"><div><h4 className="font-bold text-white text-sm">@{selectedTicket.profiles?.username} - {selectedTicket.subject}</h4></div>{selectedTicket.status !== 'Closed' && (<button onClick={handleCloseTicket} className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/40">Tutup Tiket</button>)}</div><div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0f172a]"><div className="flex justify-start"><div className="bg-slate-700 text-slate-200 p-3 rounded-r-xl rounded-tl-xl max-w-[80%] text-sm"><p className="font-bold text-[10px] text-purple-300 mb-1">@{selectedTicket.profiles?.username}</p>{selectedTicket.message}</div></div>{replies.map(r => (<div key={r.id} className={`flex ${r.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-xl max-w-[80%] text-sm ${r.sender_role === 'admin' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}><p className={`font-bold text-[10px] mb-1 ${r.sender_role === 'admin' ? 'text-indigo-200' : 'text-purple-300'}`}>{r.sender_role === 'admin' ? 'Anda (Admin)' : 'User'}</p><div className="whitespace-pre-line">{r.message}</div><p className="text-[9px] opacity-50 text-right mt-1">{new Date(r.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div></div>))}</div>{selectedTicket.status !== 'Closed' ? (<form onSubmit={handleSendReply} className="p-3 border-t border-slate-700 bg-slate-800/30 flex gap-2"><input className="flex-1 bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none" placeholder="Balas user..." value={newReply} onChange={e => setNewReply(e.target.value)} /><button className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg"><Send size={18}/></button></form>) : (<div className="p-3 text-center text-xs text-slate-500 bg-slate-900">Tiket telah ditutup.</div>)}</>) : (<div className="flex-1 flex flex-col items-center justify-center text-slate-500"><MessageSquare size={40} className="mb-2 opacity-20"/><p className="text-sm">Pilih tiket untuk membalas</p></div>)}
            </div>
        </div>
    );
};

const AdminSaldoView = () => {
  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => { const { data } = await supabase.from('profiles').select('*').order('balance', { ascending: false }); if (data) setUsers(data); };
  const handleTopUp = async (e) => { e.preventDefault(); if (!confirm(`Kirim saldo ${formatRupiah(amount)} ke @${targetUsername}?`)) return; setLoading(true); const toastId = toast.loading("Mengirim saldo..."); try { const { data: targetUser, error: findError } = await supabase.from('profiles').select('*').eq('username', targetUsername).single(); if (findError || !targetUser) { throw new Error("Username tidak ditemukan!"); } const newBalance = Number(targetUser.balance) + Number(amount); const { error: updateError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', targetUser.id); if (updateError) throw updateError; toast.success("Saldo Berhasil Dikirim!", { id: toastId }); setTargetUsername(''); setAmount(''); fetchUsers(); } catch (err) { toast.error("Gagal: " + err.message, { id: toastId }); } setLoading(false); };
  const handleDeleteUser = async (userId, username) => { if(!confirm(`⚠️ BAHAYA: Hapus user @${username} secara PERMANEN?\n\nAkun Login, Email, Saldo, dan History akan dihapus total.`)) return; const toastId = toast.loading("Memusnahkan akun user..."); try { const { error } = await supabase.rpc('delete_user_completely', { target_user_id: userId }); if (error) throw error; toast.success(`User @${username} HILANG SELAMANYA!`, { id: toastId }); fetchUsers(); } catch (err) { console.error(err); toast.error("Gagal: " + err.message, { id: toastId }); } };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 md:p-6 shadow-xl h-fit"><h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg"><Key className="text-yellow-400"/> Admin: Isi Saldo</h3><form onSubmit={handleTopUp} className="space-y-4"><input type="text" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Username Member" value={targetUsername} onChange={e => setTargetUsername(e.target.value)} required /><input type="number" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Nominal" value={amount} onChange={e => setAmount(e.target.value)} required /><button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl mt-2 transition-all active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto"/> : 'Kirim Saldo'}</button></form></div>
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 md:p-6 overflow-hidden shadow-xl"><h3 className="font-bold text-white mb-4 text-lg">Kelola Member ({users.length})</h3><div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0"><table className="w-full text-sm text-left text-slate-300 min-w-[300px]"><thead className="bg-slate-800 text-slate-400 uppercase text-[10px] md:text-xs"><tr><th className="px-3 py-2">User</th><th className="px-3 py-2">Saldo</th><th className="px-3 py-2 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-700/50">{users.map(u => (<tr key={u.id} className="hover:bg-slate-800/30"><td className="px-3 py-3 font-bold text-white text-xs md:text-sm">{u.username}</td><td className="px-3 py-3 text-green-400 text-xs md:text-sm">{formatRupiah(u.balance)}</td><td className="px-3 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => setTargetUsername(u.username)} className="text-[10px] bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-500/40">Pilih</button>{u.username !== ADMIN_USERNAME && (<button onClick={() => handleDeleteUser(u.id, u.username)} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-500/40"><Trash2 size={14}/></button>)}</div></td></tr>))}</tbody></table></div></div>
    </div>
  );
};

const AdminOrderView = ({ onCheckStatus }) => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState('');
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => { fetchAllOrders(); }, []);
    const fetchAllOrders = async () => { const { data, error } = await supabase.from('user_orders').select('*, profiles(username)').order('created_at', { ascending: false }).limit(50); if (data) setOrders(data); };
    const handleAction = async (action, order) => { if (loadingId) return; setLoadingId(order.id); const toastId = toast.loading("Cek Status..."); try { await onCheckStatus(order, toastId); fetchAllOrders(); } catch (error) { toast.error("Gagal", { id: toastId }); } setLoadingId(null); };
    const filteredOrders = orders.filter(o => String(o.provider_id).includes(search) || String(o.target).toLowerCase().includes(search.toLowerCase()) || String(o.profiles?.username).toLowerCase().includes(search.toLowerCase()) );

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
            <div className="p-5 md:p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4"><h3 className="font-bold text-white text-lg flex items-center gap-2"><ListOrdered className="text-purple-400"/> Monitoring Order</h3><div className="relative w-full md:w-64"><input type="text" placeholder="Cari ID / User / Target..." className="w-full bg-[#0f172a] border border-slate-600 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} /><Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" /></div></div>
            <div className="overflow-x-auto"><table className="w-full text-sm text-left text-slate-300 min-w-[800px]"><thead className="bg-slate-800 text-slate-400 uppercase text-[10px]"><tr><th className="px-4 py-3">ID / User</th><th className="px-4 py-3">Layanan</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Harga/Modal</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Cek</th></tr></thead><tbody className="divide-y divide-slate-700/50">{filteredOrders.map(o => (<tr key={o.id} className="hover:bg-slate-800/30"><td className="px-4 py-3"><div className="font-bold text-white">#{o.provider_id}</div><div className="text-[10px] text-purple-400">@{o.profiles?.username || 'Unknown'}</div><div className="text-[10px] text-slate-500">{new Date(o.created_at).toLocaleDateString()}</div></td><td className="px-4 py-3 text-xs max-w-[200px] truncate">{o.service_name}</td><td className="px-4 py-3 font-mono text-xs max-w-[150px] truncate">{o.target}</td><td className="px-4 py-3"><div className="text-green-400 font-bold">{formatRupiah(o.price)}</div><div className="text-[10px] text-slate-500">Modal: {formatRupiah(o.modal)}</div></td><td className="px-4 py-3"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${String(o.status).toLowerCase().includes('success') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{o.status}</span></td><td className="px-4 py-3 text-center"><button onClick={() => handleAction('status', o)} disabled={loadingId === o.id} className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-purple-600 hover:text-white transition-all">{loadingId === o.id ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}</button></td></tr>))}</tbody></table></div>
        </div>
    );
};

// --- USER PAGES ---
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
          <ServiceCard onClick={() => onNavigate('order', 'Instagram')} icon={<Instagram />} label="Instagram" desc="Followers & Likes" color="from-pink-500 to-rose-500" iconColor="text-pink-100" />
          <ServiceCard onClick={() => onNavigate('order', 'TikTok')} icon={<Music />} label="TikTok" desc="Views & Followers" color="from-cyan-500 to-blue-500" iconColor="text-cyan-100" />
          <ServiceCard onClick={() => onNavigate('order', 'Youtube')} icon={<Youtube />} label="Youtube" desc="Subs & Watchtime" color="from-red-500 to-orange-500" iconColor="text-red-100" />
          <ServiceCard onClick={() => onNavigate('order', 'Facebook')} icon={<Facebook />} label="Facebook" desc="Likes & Followers" color="from-blue-600 to-indigo-600" iconColor="text-blue-100" />
          <ServiceCard onClick={() => onNavigate('order', 'WhatsApp')} icon={<MessageCircle />} label="WhatsApp" desc="Spam Chat & Services" color="from-green-500 to-emerald-600" iconColor="text-green-100" />
          <ServiceCard onClick={() => onNavigate('order', 'Twitter')} icon={<Twitter />} label="Twitter / X" desc="Followers & Retweet" color="from-slate-700 to-black" iconColor="text-slate-200" />
        </div>
      </div>
    </div>
  );
};

const OrderView = ({ services, balance, onOrder, refreshProfile, prefillSearch }) => {
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [target, setTarget] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(prefillSearch || '');

  useEffect(() => {
      if (prefillSearch) {
          setSearchTerm(prefillSearch);
          setSelectedCatId('');
          setSelectedServiceId('');
      }
  }, [prefillSearch]);

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
      if (cId && !seenCats.has(String(cId))) { seenCats.add(String(cId)); categories.push({ id: cId, name: cName }); }
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
    const toastId = toast.loading("Memproses pesanan...");
    const result = await onOrder({ 
        service: selectedServiceId, target, quantity, totalPrice, modalPricePer1k: modalPrice 
    }, currentService);
    if (result.success) {
       toast.success(`Sukses! Order ID: ${result.orderId}`, { id: toastId });
       refreshProfile(); setTarget(''); setQuantity('');
    } else {
       toast.error(result.msg || 'Gagal order.', { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 bg-[#1e293b] border border-slate-700 rounded-2xl p-5 md:p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ShoppingCart className="text-indigo-400"/> Order Layanan</h3>
        
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
           
           <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 animate-fade-in">
              <h5 className="font-bold text-blue-400 text-sm flex items-center gap-2 mb-2"><Info size={16}/> Harap Dibaca!</h5>
              <ul className="text-slate-300 text-xs space-y-2 list-disc pl-4">
                  <li>Pastikan akun target <b>TIDAK DI-PRIVATE</b>.</li>
                  <li>Jangan ganti username/link saat order diproses.</li>
                  <li>Satu link hanya boleh 1 order aktif (tunggu status Completed baru order lagi untuk link yang sama).</li>
                  <li>Kesalahan input target = <b>NO REFUND</b>.</li>
                  <li>Jika status Error/Partial, saldo otomatis refund.</li>
              </ul>
           </div>

        </div>
      </div>
    </div>
  );
};

const OrderHistoryView = ({ userId, onCheckStatus, onRefill }) => {
    const [orders, setOrders] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [isBulkChecking, setIsBulkChecking] = useState(false);

    const fetchOrders = async () => {
        const { data } = await supabase.from('user_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) setOrders(data);
    };

    useEffect(() => { fetchOrders(); }, [userId]);

    const handleBulkCheck = async () => {
        const pendingOrders = orders.filter(o => !['success', 'error', 'partial', 'completed', 'canceled'].includes(String(o.status).toLowerCase()));
        if (pendingOrders.length === 0) { toast.success("Semua order sudah update!", { icon: '👌' }); return; }

        setIsBulkChecking(true);
        const toastId = toast.loading(`Mengecek ${pendingOrders.length} transaksi...`);
        let updatedCount = 0;
        for (const order of pendingOrders) {
            const success = await onCheckStatus(order, null, true);
            if (success) updatedCount++;
        }
        setIsBulkChecking(false);
        toast.success(`${updatedCount} Data berhasil diperbarui!`, { id: toastId });
        fetchOrders();
    };

    const handleAction = async (action, order) => {
        if (loadingId) return; setLoadingId(order.id);
        const toastId = toast.loading("Memproses...");
        try {
            if (action === 'status') await onCheckStatus(order, toastId, false);
            if (action === 'refill') await onRefill(order, toastId);
        } catch (error) { toast.error("Error", { id: toastId }); }
        setLoadingId(null); fetchOrders();
    };

    const getStatusBadge = (status) => {
        const s = String(status).toLowerCase();
        if (s.includes('success') || s.includes('complet')) return 'bg-green-500/20 text-green-400 border-green-500/30';
        if (s.includes('pending') || s.includes('process')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        if (s.includes('error') || s.includes('cancel')) return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (s.includes('partial')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        return 'bg-slate-700 text-slate-300 border-slate-600';
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
            <div className="p-5 md:p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div><h3 className="font-bold text-white text-lg flex items-center gap-2"><History className="text-indigo-400"/> Riwayat Pesanan</h3><p className="text-slate-500 text-xs mt-1">Total: {orders.length} Transaksi</p></div>
                <button onClick={handleBulkCheck} disabled={isBulkChecking} className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2">{isBulkChecking ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}{isBulkChecking ? 'Sedang Sinkronisasi...' : 'Update Status Pending'}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300 min-w-[700px]">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] md:text-xs font-bold tracking-wider"><tr><th className="px-6 py-4">ID / Tanggal</th><th className="px-6 py-4">Layanan & Target</th><th className="px-6 py-4">Data Awal</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {orders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4"><div className="font-mono font-bold text-white bg-slate-700/50 px-2 py-1 rounded w-fit text-xs">#{o.provider_id || o.id}</div><div className="text-[10px] text-slate-500 mt-1">{new Date(o.created_at).toLocaleDateString()}</div>{o.refill_id && <div className="text-[10px] text-green-400 mt-1 flex items-center gap-1"><RefreshCcw size={10}/> Refill: #{o.refill_id}</div>}</td>
                                <td className="px-6 py-4"><div className="text-xs text-indigo-300 font-medium mb-1 max-w-[200px] truncate">{o.service_name || 'Layanan'}</div><div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700 w-fit max-w-[180px]"><div className="text-[10px] font-mono text-slate-300 truncate">{o.target}</div></div><div className="mt-1 text-[10px] text-slate-500">Jumlah: <b className="text-white">{o.quantity}</b></div></td>
                                <td className="px-6 py-4"><div className="space-y-1"><div className="text-[10px] bg-slate-800 px-2 py-0.5 rounded w-fit border border-slate-700">Start: <span className="text-white">{o.start_count !== null ? o.start_count : '-'}</span></div><div className="text-[10px] bg-slate-800 px-2 py-0.5 rounded w-fit border border-slate-700">Remains: <span className="text-white">{o.remains !== null ? o.remains : '-'}</span></div></div></td>
                                <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusBadge(o.status)}`}>{o.status}</span></td>
                                <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-2"><button onClick={() => handleAction('status', o)} disabled={loadingId === o.id} className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">{loadingId === o.id ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}</button>{(String(o.status).toLowerCase().includes('success') || String(o.status).toLowerCase().includes('complet')) && (<button onClick={() => handleAction('refill', o)} disabled={loadingId === o.id} className="p-2 bg-slate-700 text-green-400 rounded-lg hover:bg-green-600 hover:text-white transition-all"><RefreshCcw size={16}/></button>)}</div></td>
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
                <div className="flex gap-3"><div className="bg-indigo-500/20 text-indigo-400 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]">3</div><p className="text-slate-300 text-xs">Scan & Bayar. Min deposit <b>Rp 1.000</b>.</p></div>
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
    const [verificationSent, setVerificationSent] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        const toastId = toast.loading(isRegister ? "Mendaftarkan..." : "Sedang Masuk...");
        
        try {
            if (isRegister) {
                const { data: authData, error: authError } = await supabase.auth.signUp({ 
                    email: formData.email, password: formData.password,
                    options: { emailRedirectTo: window.location.origin }
                });
                if (authError) throw authError;
                if (authData.user) {
                    await supabase.from('profiles').insert([{ id: authData.user.id, username: formData.username, full_name: formData.fullname, balance: 0 }]);
                    toast.success("Sukses! Cek Email Anda.", { id: toastId });
                    setVerificationSent(formData.email);
                    setIsRegister(false);
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
                if (error) {
                    if (error.message.includes("Email not confirmed")) {
                        toast.error("Email belum diverifikasi! Cek inbox/spam.", { id: toastId });
                        setVerificationSent(formData.email);
                    } else { throw error; }
                } else {
                    toast.success("Berhasil Login!", { id: toastId });
                }
            }
        } catch (error) { 
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
                
                {verificationSent && !isRegister && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex gap-3 items-start animate-fade-in">
                        <div className="p-1 bg-green-500 rounded-full text-white mt-0.5 shadow-lg shadow-green-500/30 flex-shrink-0"><Mail size={14} /></div>
                        <div>
                            <h4 className="text-green-400 font-bold text-sm mb-1">Cek Email Kamu!</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Link verifikasi telah dikirim ke <b className="text-white">{verificationSent}</b>. 
                                <br/><br/>Silakan cek <b>Inbox</b> atau <b>Spam</b> folder, lalu klik tombol verifikasi untuk Login.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {isRegister && <><input type="text" placeholder="Nama Lengkap" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" onChange={e => setFormData({...formData, fullname: e.target.value})} required /><input type="text" placeholder="Username (Tanpa Spasi)" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" onChange={e => setFormData({...formData, username: e.target.value})} required /></>}
                    <input type="email" placeholder="Email" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password Minimal 8 Huruf/Angka" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all" onChange={e => setFormData({...formData, password: e.target.value})} required />
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
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // STATE BARU: Untuk menyimpan kata kunci pencarian otomatis
  const [orderSearchPrefill, setOrderSearchPrefill] = useState('');

  // 1. Cek Session Login
  useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => { 
          setSession(session); 
          if (session) {
              fetchUserProfile(session.user.id);
              setIsInfoOpen(true);
          }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { 
          setSession(session); 
          if (session) {
              fetchUserProfile(session.user.id);
              setIsInfoOpen(true);
          } else {
              setProfile(null); 
          }
      });

      return () => subscription.unsubscribe();
  }, []);

  // 2. Ambil Data Profil
  const fetchUserProfile = async (userId) => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (error || !data) {
          console.warn("User tidak ditemukan, melakukan auto logout...");
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          toast.error("Sesi berakhir atau akun dihapus.");
          return;
      }
      
      if (data) setProfile(data);
  };

  // 3. CCTV PENGHAPUSAN AKUN (POLLING)
  useEffect(() => {
      if (!session?.user?.id) return;
      const checkAccountStatus = async () => {
          const { data, error } = await supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle(); 
          if (!data) {
              console.warn("Akun tidak ditemukan di database. Melakukan logout paksa...");
              toast.error("Sesi berakhir: Akun Anda telah dihapus.", { duration: 5000 });
              await supabase.auth.signOut();
              setSession(null);
              setProfile(null);
          }
      };
      const intervalId = setInterval(checkAccountStatus, 5000);
      return () => clearInterval(intervalId);
  }, [session]);

  // 4. Ambil Layanan
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

  // FUNGSI NAVIGASI PINTAR (MENERIMA KEYWORD)
  const handleNavigate = (page, keyword = '') => {
      setActivePage(page);
      setSidebarOpen(false); // Tutup sidebar mobile
      
      if (page === 'order') {
          // Jika ke halaman order, set kata kunci pencarian
          setOrderSearchPrefill(keyword);
      } else {
          // Jika pindah halaman lain, reset pencarian
          setOrderSearchPrefill('');
      }
  };

  // --- Logic Transaksi dll (Tidak Berubah) ---
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

  const handleCheckStatus = async (order, toastId = null, silent = false) => {
      try {
          // --- PENGAMAN 1: Validasi Provider ID ---
          const pId = order.provider_id;
          if (!pId || pId === 'undefined' || pId === 'null') return false;

          // --- PENGAMAN 2 (FIX BUG REFUND): Cek Status Terbaru dari Database Dulu! ---
          // Jangan percaya data dari browser, ambil langsung dari "Brankas" (Database)
          const { data: latestOrder, error: fetchError } = await supabase
              .from('user_orders')
              .select('status')
              .eq('id', order.id)
              .single();

          if (fetchError || !latestOrder) {
              if (!silent) toast.error("Gagal verifikasi data order.", { id: toastId });
              return false;
          }

          // KUNCI UTAMA: Jika di database sudah ada kata "Refund", BERHENTI!
          if (String(latestOrder.status).toLowerCase().includes('refund')) {
              if (!silent) toast.success("Order ini sudah di-refund sebelumnya.", { id: toastId });
              return true; // Anggap sukses update (karena memang sudah update)
          }

          // --- PANGGIL API PUSAT ---
          const res = await callApi('status', { id: pId, action: 'status' });
          
          if (res.data.status === true || res.data.response === true) {
              const newData = res.data.data;
              if (!newData) throw new Error("Data kosong");

              const statusLower = String(newData.status).toLowerCase();
              let newStatus = newData.status;
              let refundAmount = 0;

              // --- LOGIKA AUTO REFUND ---
              // Kita cek lagi: Pastikan status di DB BUKAN Refunded sebelum memproses uang
              if (['error', 'canceled', 'partial'].includes(statusLower) && !String(latestOrder.status).toLowerCase().includes('refund')) {
                  
                  const pricePerItem = order.price / order.quantity;
                  let itemsFailed = statusLower === 'partial' ? (parseInt(newData.remains) || 0) : order.quantity;
                  refundAmount = Math.floor(itemsFailed * pricePerItem);

                  if (refundAmount > 0) {
                      // 1. Ambil Saldo User Terbaru (Penting agar tidak race condition)
                      const { data: userData } = await supabase.from('profiles').select('balance').eq('id', order.user_id).single();
                      const currentBalance = userData?.balance || 0;
                      
                      // 2. Kembalikan Saldo
                      await supabase.from('profiles').update({ balance: currentBalance + refundAmount }).eq('id', order.user_id);
                      
                      // 3. Ubah status jadi Refunded
                      newStatus = `Refunded (${formatRupiah(refundAmount)})`;
                      
                      if (!silent) toast.success(`Auto Refund: ${formatRupiah(refundAmount)}`, { id: toastId });
                  }
              }

              // Update Database
              await supabase.from('user_orders').update({ 
                  status: newStatus, 
                  start_count: newData.start_count, 
                  remains: newData.remains 
              }).eq('id', order.id);

              if (!silent && !refundAmount) toast.success(`Status: ${newData.status}`, { id: toastId });
              return true; 
          } else {
              // Handle Error "Not Found" dari Pusat (Order Hilang)
              const errorMsg = res.data.data?.msg || "";
              
              // Cek lagi status DB sebelum refund "Not Found"
              if (String(errorMsg).toLowerCase().includes('not found') && !String(latestOrder.status).toLowerCase().includes('refund')) {
                  
                  const { data: userData } = await supabase.from('profiles').select('balance').eq('id', order.user_id).single();
                  const refund = order.price;
                  
                  await supabase.from('profiles').update({ balance: (userData?.balance || 0) + refund }).eq('id', order.user_id);
                  await supabase.from('user_orders').update({ status: `Refunded (Not Found)` }).eq('id', order.id);
                  
                  if (!silent) toast.error(`Order Hilang -> Auto Refund ${formatRupiah(refund)}`, { id: toastId });
                  return true;
              }
              return false;
          }
      } catch (err) { 
          console.error(err);
          if(!silent && toastId) toast.error("Koneksi Error", { id: toastId }); 
          return false; 
      }
  };

  const handleRefill = async (order, toastId) => {
      if(!confirm("Ajukan Refill?")) { toast.dismiss(toastId); return; }
      try {
          const res = await callApi('reffil', { id: order.provider_id || order.id, action: 'reffil' });
          if (res.data.status === true || res.data.response === true) {
              await supabase.from('user_orders').update({ refill_id: String(res.data.data.id) }).eq('id', order.id);
              toast.success("Refill Berhasil!", { id: toastId });
          } else { toast.error("Gagal Refill", { id: toastId }); }
      } catch (err) { toast.error("Koneksi Error", { id: toastId }); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setProfile(null); };

  if (!session) return <LoginPage />;
  const isAdmin = profile?.username === ADMIN_USERNAME;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex overflow-hidden">
       <Toaster position="top-center" reverseOrder={false} toastOptions={{
         style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
         success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
         error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
       }}/>

       <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

       <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] border-r border-slate-700/50 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-20 flex items-center justify-between px-6 font-bold text-2xl text-white">
             
             {/* --- LOGO GAMBAR --- */}
             <img 
                src="https://nmgtscdialmxgktwaocn.supabase.co/storage/v1/object/public/QR%20code/WhatsApp%20Image%202026-01-04%20at%2018.59.39%20(1).jpeg" // Ganti dengan Link Logo Kamu
                alt="Logo SosmedKu" 
                className="h-10 w-auto object-contain" 
             />
             {/* ------------------- */}

             <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X size={24}/></button>
          </div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
             <MenuItem icon={<LayoutDashboard/>} label="Dashboard" isActive={activePage === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
             <MenuItem icon={<ShoppingCart/>} label="Order Baru" isActive={activePage === 'order'} onClick={() => handleNavigate('order')} />
             <MenuItem icon={<History/>} label="Riwayat" isActive={activePage === 'history'} onClick={() => handleNavigate('history')} />
             <MenuItem icon={<CreditCard/>} label="Deposit" isActive={activePage === 'deposit'} onClick={() => handleNavigate('deposit')} />
             <MenuItem icon={<LifeBuoy/>} label="Tiket Bantuan" isActive={activePage === 'ticket'} onClick={() => handleNavigate('ticket')} />

             {isAdmin && (
                <div className="pt-4 mt-4 border-t border-slate-700/50">
                    <p className="px-4 text-[10px] uppercase text-slate-500 font-bold mb-2">Area Owner</p>
                    <MenuItem icon={<Key/>} label="Kelola Saldo" isActive={activePage === 'admin-saldo'} onClick={() => handleNavigate('admin-saldo')} />
                    <MenuItem icon={<ListOrdered/>} label="Kelola Order" isActive={activePage === 'admin-order'} onClick={() => handleNavigate('admin-order')} />
                    <MenuItem icon={<MessageSquare/>} label="Kelola Tiket" isActive={activePage === 'admin-ticket'} onClick={() => handleNavigate('admin-ticket')} />
                    <MenuItem icon={<Bell/>} label="Kelola Iklan" isActive={activePage === 'admin-ads'} onClick={() => handleNavigate('admin-ads')} />
                </div>
             )}
             <MenuItem icon={<LogOut/>} label="Keluar" variant="danger" onClick={handleLogout} />
          </nav>
       </aside>

       {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

       <main className="flex-1 flex flex-col h-screen overflow-hidden">
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
             {/* UPDATE: Passing onNavigate ke Dashboard dan prefillSearch ke OrderView */}
             {activePage === 'dashboard' && <DashboardView profile={profile || {}} onNavigate={handleNavigate} />}
             {activePage === 'order' && <OrderView services={services} balance={profile?.balance || 0} onOrder={handlePlaceOrder} refreshProfile={() => fetchUserProfile(session.user.id)} prefillSearch={orderSearchPrefill} />}
             
             {activePage === 'history' && <OrderHistoryView userId={session.user.id} onCheckStatus={handleCheckStatus} onRefill={handleRefill} />}
             {activePage === 'deposit' && <DepositView />}
             {activePage === 'ticket' && <TicketView userId={session.user.id} />}
             
             {activePage === 'admin-saldo' && isAdmin && <AdminSaldoView />}
             {activePage === 'admin-order' && isAdmin && <AdminOrderView onCheckStatus={handleCheckStatus} />}
             {activePage === 'admin-ticket' && isAdmin && <AdminTicketView />}
             {activePage === 'admin-ads' && isAdmin && <AdminAnnouncementView />}
          </div>
       </main>
    </div>
  );
};

export default App;