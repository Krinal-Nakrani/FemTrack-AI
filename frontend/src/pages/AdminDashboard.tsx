import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Stethoscope, 
  Heart, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Activity,
  BarChart3,
  Calendar,
  ShieldAlert,
  Download,
  Plus
} from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { db } from '@/config/firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'partner';
  onboarded: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface DoctorRecord {
  id: string;
  name: string;
  email: string;
  specialization: string;
  verified: boolean;
  queriesAnswered: number;
}

interface InviteRecord {
  id: string;
  senderName: string;
  recipientEmail: string;
  status: 'pending' | 'accepted';
  createdAt?: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'doctors' | 'partners'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    activePartners: 0,
    avgScans: 0
  });

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to Profiles
    const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRecord));
      setUsers(list);
    });

    // Subscribe to Doctors
    const unsubDoctors = onSnapshot(collection(db, 'doctors'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DoctorRecord));
      setDoctors(list);
    });

    // Subscribe to Invitations
    const unsubInvites = onSnapshot(collection(db, 'invitations'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as InviteRecord));
      setInvites(list);
    });

    return () => {
      unsubProfiles();
      unsubDoctors();
      unsubInvites();
    };
  }, []);

  useEffect(() => {
    setStats({
      totalUsers: users.filter(u => u.role === 'user').length,
      totalDoctors: doctors.length,
      activePartners: users.filter(u => u.role === 'partner').length,
      avgScans: 42
    });
    setLoading(false);
  }, [users, doctors]);

  const handleDelete = async (id: string, collectionName: string) => {
    if (window.confirm('🚨 PERMANENT DELETION: Are you sure you want to remove this record?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (err) {
        alert('Failed to delete record');
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      const collectionName = activeTab === 'doctors' ? 'doctors' : 'profiles';
      await updateDoc(doc(db, collectionName, editingItem.id), editForm);
      setEditingItem(null);
    } catch (err) {
      alert('Update failed');
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({ ...item });
  };

  return (
    <div className="min-h-screen bg-plum p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <ShieldAlert className="text-rose-400" /> Administrative Console
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <p className="text-lavender/50 font-body text-sm">System Live: Central Command Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-body text-xs hover:bg-white/10 transition-all">
            <Download size={14} /> Export Logs
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-rose text-white font-body text-xs shadow-glow-rose hover:scale-105 transition-all">
            <Plus size={14} /> Add Manual Entry
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#C94B8A' },
          { label: 'Active Doctors', value: stats.totalDoctors, icon: Stethoscope, color: '#4ADE80' },
          { label: 'Partners Linked', value: stats.activePartners, icon: Heart, color: '#FF6B9D' },
          { label: 'Avg Health Score', value: '78%', icon: BarChart3, color: '#60A5FA' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard padding="md" className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon size={48} style={{ color: stat.color }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-lavender/40 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-display font-bold text-white">{stat.value}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-body text-green-400">
                <Activity size={10} /> +12% this month
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Management Interface */}
      <GlassCard padding="none" className="overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-white/2">
          {[
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'doctors', label: 'Medical Providers', icon: Stethoscope },
            { id: 'partners', label: 'Link Registry', icon: Heart },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'text-white' : 'text-lavender/40 hover:text-lavender/60 hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="admin-tab-active"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose shadow-[0_0_10px_#C94B8A]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/2 border-b border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/40" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-plum-700/50 border border-white/10 text-white placeholder-lavender/30 text-xs font-body focus:outline-none focus:border-rose/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-lavender/60 hover:text-white transition-all">
              <Filter size={16} />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-lavender/60 hover:text-white transition-all">
              <Calendar size={16} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-lavender/40 bg-white/1">
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Status</th>
                {activeTab === 'doctors' ? (
                  <th className="px-6 py-4">Specialization</th>
                ) : activeTab === 'partners' ? (
                  <th className="px-6 py-4">Partner Connection</th>
                ) : (
                  <th className="px-6 py-4">System Access</th>
                )}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-body">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8">
                      <div className="h-4 bg-white/5 rounded-full w-full" />
                    </td>
                  </tr>
                ))
              ) : (
                (activeTab === 'users' ? users : activeTab === 'doctors' ? doctors : invites)
                  .filter(item => {
                    const search = searchQuery.toLowerCase();
                    if (activeTab === 'partners') return (item as InviteRecord).recipientEmail.toLowerCase().includes(search) || (item as InviteRecord).senderName.toLowerCase().includes(search);
                    return (item as UserRecord).name.toLowerCase().includes(search) || (item as UserRecord).email.toLowerCase().includes(search);
                  })
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-lavender flex items-center justify-center text-white text-[10px] font-bold">
                            {((item as any).name?.[0] || (item as any).recipientEmail?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{(item as any).name || (item as any).recipientEmail}</p>
                            <p className="text-[10px] text-lavender/40">{(item as any).email || (item as any).senderName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {activeTab === 'doctors' ? (
                            (item as DoctorRecord).verified ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-bold uppercase tracking-wider">
                                <CheckCircle size={8} /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[9px] font-bold uppercase tracking-wider">
                                <Activity size={8} /> Pending
                              </span>
                            )
                          ) : activeTab === 'partners' ? (
                            (item as InviteRecord).status === 'accepted' ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-wider">
                                <Heart size={8} /> Linked
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-lavender/10 text-lavender/40 text-[9px] font-bold uppercase tracking-wider">
                                <Clock size={8} /> Pending
                              </span>
                            )
                          ) : (
                            (item as UserRecord).onboarded ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-wider">
                                <CheckCircle size={8} /> Onboarded
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-lavender/10 text-lavender/40 text-[9px] font-bold uppercase tracking-wider">
                                <XCircle size={8} /> New Account
                              </span>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-lavender/60">
                          {activeTab === 'doctors' 
                            ? (item as DoctorRecord).specialization || 'N/A' 
                            : activeTab === 'partners' ? `Invited by ${(item as InviteRecord).senderName}` : (item as UserRecord).role === 'partner' ? 'Partner Portal' : 'Standard User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab !== 'partners' && (
                            <button 
                              onClick={() => openEdit(item)}
                              className="p-2 rounded-lg bg-white/5 text-lavender/60 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(item.id, activeTab === 'doctors' ? 'doctors' : activeTab === 'partners' ? 'invitations' : 'profiles')}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between border-t border-white/5 bg-white/1">
          <p className="text-[10px] text-lavender/30 font-body uppercase tracking-widest">
            Live Central Command Stream
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-lg bg-white/5 text-lavender/40 text-[10px] font-bold uppercase tracking-wider">Previous</button>
            <button className="px-3 py-1 rounded-lg gradient-rose text-white text-[10px] font-bold uppercase tracking-wider">Next</button>
          </div>
        </div>
      </GlassCard>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card p-8 border border-white/10"
            >
              <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3">
                <Edit2 size={20} className="text-rose-400" /> Administrative Overwrite
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-lavender/40 font-bold uppercase tracking-widest mb-1.5 ml-1">Account Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-plum-700/50 border border-white/10 text-white font-body text-sm focus:outline-none focus:border-rose/50 transition-all"
                  />
                </div>

                {activeTab === 'doctors' ? (
                  <div>
                    <label className="block text-[10px] text-lavender/40 font-bold uppercase tracking-widest mb-1.5 ml-1">Specialization</label>
                    <input
                      type="text"
                      value={editForm.specialization || ''}
                      onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-plum-700/50 border border-white/10 text-white font-body text-sm focus:outline-none focus:border-rose/50 transition-all"
                    />
                    <div className="mt-4 flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={editForm.verified || false} 
                        onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                        className="w-4 h-4 rounded border-white/10 bg-plum-700/50 text-rose-400 focus:ring-rose/20"
                      />
                      <span className="text-sm text-lavender/60">Verified Professional</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-lavender/40 font-bold uppercase tracking-widest mb-1.5 ml-1">Access Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-plum-700/50 border border-white/10 text-white font-body text-sm focus:outline-none focus:border-rose/50 transition-all appearance-none"
                    >
                      <option value="user">Standard User</option>
                      <option value="partner">Partner Access</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-lavender/60 font-body text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-3.5 rounded-xl gradient-rose text-white font-body text-sm font-bold uppercase tracking-widest shadow-glow-rose hover:scale-[1.02] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
