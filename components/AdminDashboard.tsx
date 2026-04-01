import React, { useState, useEffect, useCallback } from 'react';
import PocketBase from 'pocketbase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Upload, 
  List, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Music, 
  Calendar, 
  Hash, 
  Type, 
  Grid3X3, 
  X 
} from 'lucide-react';

const pb = new PocketBase('https://api.mindset-it.online');

interface MeditationRecord {
  id: string;
  day_number: number;
  title: string;
  date_string: string;
  audio_file: string;
  created: string;
  updated: string;
}

const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => pb.authStore.isValid && pb.authStore.isAdmin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [dayNumber, setDayNumber] = useState('');
  const [title, setTitle] = useState('');
  const [dateString, setDateString] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // List states
  const [records, setRecords] = useState<MeditationRecord[]>([]);
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchRecords = useCallback(async () => {
    setFetchingRecords(true);
    try {
      const resultList = await pb.collection('meditations').getFullList<MeditationRecord>({
        sort: '+day_number',
      });
      setRecords(resultList);
    } catch (err: any) {
      console.error('Error fetching records:', err);
    } finally {
      setFetchingRecords(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchRecords();
    }
  }, [isLoggedIn, fetchRecords]);

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid && pb.authStore.isAdmin);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await pb.admins.authWithPassword(email, password);
      // setIsLoggedIn will be updated by the listener
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    // setIsLoggedIn will be updated by the listener
  };

  const handleDayClick = (day: number, exists: boolean) => {
    if (!exists) {
      setDayNumber(day.toString());
      // Scroll to form on mobile
      const formElement = document.getElementById('upload-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select an audio file.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('day_number', dayNumber);
    formData.append('title', title);
    formData.append('date_string', dateString);
    formData.append('audio_file', audioFile);

    try {
      await pb.collection('meditations').create(formData);
      setSuccess(`Successfully uploaded Day ${dayNumber}!`);
      // Reset form
      setDayNumber('');
      setTitle('');
      setDateString('');
      setAudioFile(null);
      // Refresh list
      fetchRecords();
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md p-8 rounded-[2rem] border-2 border-[#D4AF37]/30"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="text-[#D4AF37] w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold gold-text">Admin Login</h2>
            <p className="text-white/60 text-sm">PocketBase Authentication</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-center gap-2 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#B8860B] hover:bg-[#9a700a] text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login to Dashboard'}
            </button>
            
            <button 
              type="button"
              onClick={onClose}
              className="w-full text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white/60 transition-colors pt-2"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] bg-[#041a13] overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold gold-text">Admin Dashboard</h1>
            <p className="text-white/60">Manage Meditation Audio Library</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-[#B8860B] text-white rounded-xl text-sm font-bold transition-all hover:bg-[#9a700a]"
            >
              Back to App
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-5" id="upload-form">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 md:p-8 rounded-[2rem] border-2 border-[#D4AF37]/30 sticky top-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Upload className="text-[#D4AF37] w-6 h-6" />
                <h2 className="text-xl font-bold text-white">Upload New Day</h2>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase mb-2 ml-1">
                    <Hash className="w-3 h-3" /> Day Number
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max="365"
                    value={dayNumber}
                    onChange={(e) => setDayNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
                    placeholder="e.g. 1"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase mb-2 ml-1">
                    <Type className="w-3 h-3" /> Title (Myanmar)
                  </label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
                    placeholder="တရားတော် အမည်"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase mb-2 ml-1">
                    <Calendar className="w-3 h-3" /> Date String (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={dateString}
                    onChange={(e) => setDateString(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
                    placeholder="e.g. 2024-01-01"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase mb-2 ml-1">
                    <Music className="w-3 h-3" /> Audio File
                  </label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="audio-upload"
                      required
                    />
                    <label 
                      htmlFor="audio-upload"
                      className="w-full bg-white/5 border-2 border-dashed border-white/10 rounded-xl px-4 py-8 text-white/60 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 hover:border-[#D4AF37]/30 transition-all"
                    >
                      {audioFile ? (
                        <>
                          <CheckCircle2 className="text-green-400 w-8 h-8" />
                          <span className="text-sm font-medium text-white">{audioFile.name}</span>
                          <span className="text-[10px] uppercase">Click to change</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 opacity-40" />
                          <span className="text-sm font-medium">Select Audio File</span>
                          <span className="text-[10px] uppercase">MP3, WAV, M4A</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-center gap-2 text-red-200 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 flex items-center gap-2 text-green-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {success}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#B8860B] hover:bg-[#9a700a] text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Record'}
                </button>
              </form>
            </motion.div>
          </div>

          {/* List/Grid View */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 md:p-8 rounded-[2rem] border-2 border-[#D4AF37]/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Grid3X3 className="text-[#D4AF37] w-6 h-6" />
                  <h2 className="text-xl font-bold text-white">365-Day Tracker</h2>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-[#B8860B] text-white' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Grid
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-[#B8860B] text-white' : 'text-white/40 hover:text-white/60'}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {fetchingRecords ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  <p className="text-white/40 text-sm italic">Loading library...</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-12 gap-2">
                  {Array.from({ length: 365 }, (_, i) => i + 1).map((day) => {
                    const record = records.find(r => r.day_number === day);
                    const exists = !!record;
                    return (
                      <button
                        key={day}
                        onClick={() => handleDayClick(day, exists)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                          exists 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default' 
                            : 'bg-red-500/10 text-red-400/50 border border-red-500/20 hover:bg-red-500/20 hover:text-red-400 cursor-pointer active:scale-90'
                        }`}
                        title={exists ? `Day ${day}: ${record.title}` : `Day ${day}: Missing`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-20">
                  <Music className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 italic">No records found. Start by uploading Day 1.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div 
                      key={record.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                          {record.day_number}
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm line-clamp-1">{record.title}</h3>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider">{record.date_string || 'No date set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={pb.files.getUrl(record, record.audio_file)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                          aria-label={`Listen to Day ${record.day_number}`}
                        >
                          <Music className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
