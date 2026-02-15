
import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { 
  Shield, Lock, Unlock, Plus, Search, Camera, QrCode, 
  CreditCard, FileText, Key, User, Download, LogOut, 
  Cpu, Activity, Fingerprint, Eye, Trash2, Copy, RefreshCw, Smartphone,
  Settings, UserPlus, CheckCircle, FileBadge, Share2, Scan, Save, Moon, Sun, Clock, 
  LayoutDashboard, Server, FileJson, CheckSquare, Cloud, CloudOff, Wifi, WifiOff,
  Image as ImageIcon, Upload, HardDrive, Star, Info, Zap, Globe, Database,
  Filter, AlertTriangle, Bell, X, Check, HelpCircle, Tag, Laptop, Timer, Power, Mail, RefreshCcw, Calendar, Palette, Terminal, Box, Hexagon,
  Users, DollarSign, Megaphone, Type, ClipboardX, Edit, Terminal as TermIcon,
  BarChart3, PieChart, TrendingUp, Usb, FileSpreadsheet, FileType, File,
  ArrowUp, ArrowDown, ToggleLeft, ToggleRight, QrCode as QRCodeIcon,
  Radar, Radio, ShieldCheck, Import, ArrowRight, KeyRound, Timer as TimerIcon,
  Menu as MenuIcon, UserCheck, AlertOctagon, Layers, Hash, Video, Paperclip, XCircle, Aperture,
  LockKeyhole, Siren, UserCog, Network, Bot, LogIn, Repeat, HelpCircle as HelpIcon, SwitchCamera,
  BrainCircuit, ShieldAlert, Cpu as CpuIcon, Sparkles, Wand2, ShieldEllipsis, CreditCard as CardIcon
} from 'lucide-react';
import jsQR from 'jsqr';
import { NeonButton, NeonInput, NeonCard, Modal, PageTransition } from './components/UI';
import { QRCodeDisplay } from './components/QRCodeGenerator';
import { encryptData, decryptData, hashPin, generateSelfSignedCertificate } from './services/cryptoService';
import { analyzeImageForVault, generateSecurePassword } from './services/geminiService';
import { registerBiometrics, authenticateBiometrics } from './services/webauthnService';
import { db } from './services/db';
import { exportToPDF, exportToXLSX, exportToDOCX, convertToCSV, downloadFile } from './services/exportUtils';
import { VaultItem, VaultItemType, UserConfig, UserProfile, AppCustomization } from './types';

const APP_CUSTOMIZATION_KEY = 'QAV_APP_CUSTOMIZATION';

const APP_ICONS: Record<string, any> = {
    'Shield': Shield, 'Lock': Lock, 'Hexagon': Hexagon, 'Terminal': Terminal, 'Box': Box
};

const DEFAULT_APP_CONFIG: AppCustomization = {
  appTitle: "QUANTUM AUTHENTICATION VAULT",
  appFooter: "QAV SYSTEM v8.0 | NEON HORIZON",
  appIcon: 'Shield',
  subscriptionTiers: [],
  activeAnnouncement: null,
  customThemes: [],
  globalSecurityLevel: 'high',
  enableAIAnalysis: true,
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex flex-col items-end pointer-events-none pr-2">
      <span className="text-xl font-orbitron text-purple-400 tracking-widest drop-shadow-[0_0_12px_rgba(217,70,239,0.8)]">
        {time.toLocaleTimeString([], { hour12: false })}
      </span>
      <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
        {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
};

const PasswordStrengthMeter = ({ password }: { password?: string }) => {
  const score = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s += 1;
    if (password.length >= 14) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    return s;
  }, [password]);

  const levels = [
    { label: "VULNERABLE", color: "bg-red-500", glow: "shadow-[0_0_10px_#ef4444]" },
    { label: "WEAK", color: "bg-orange-500", glow: "shadow-[0_0_10px_#f97316]" },
    { label: "FAIR", color: "bg-yellow-500", glow: "shadow-[0_0_10px_#eab308]" },
    { label: "GOOD", color: "bg-blue-500", glow: "shadow-[0_0_10px_#3b82f6]" },
    { label: "STRONG", color: "bg-green-500", glow: "shadow-[0_0_10px_#22c55e]" },
    { label: "QUANTUM", color: "bg-purple-500", glow: "shadow-[0_0_15px_#d946ef]" },
  ];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between items-center text-[9px] font-orbitron tracking-widest uppercase">
        <span className="text-slate-500">Security Entropy</span>
        <span className={levels[score].color.replace('bg-', 'text-')}>{levels[score].label}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-full transition-all duration-500 ${i <= score ? levels[score].color + ' ' + levels[score].glow : 'bg-slate-800'}`}
          />
        ))}
      </div>
    </div>
  );
};

const PasswordGenerator = () => {
    const [length, setLength] = useState(32);
    const [password, setPassword] = useState('');
    const [options, setOptions] = useState({
        upper: true,
        lower: true,
        numbers: true,
        symbols: true
    });

    const generate = () => {
        const charSets = {
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lower: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        let pool = '';
        if (options.upper) pool += charSets.upper;
        if (options.lower) pool += charSets.lower;
        if (options.numbers) pool += charSets.numbers;
        if (options.symbols) pool += charSets.symbols;
        
        if (!pool) return setPassword('ERR:POOL_EMPTY');

        let result = '';
        for (let i = 0; i < length; i++) {
            result += pool.charAt(Math.floor(Math.random() * pool.length));
        }
        setPassword(result);
    };

    useEffect(() => { generate(); }, [length, options]);

    return (
        <div className="max-w-4xl mx-auto">
            <NeonCard variant="purple" className="animate-in-zoom">
                <div className="flex items-center gap-4 mb-8 border-b border-purple-900/10 pb-6">
                    <Wand2 className="w-8 h-8 text-purple-400" />
                    <h3 className="text-3xl font-orbitron text-white uppercase tracking-[0.2em] glow-text leading-none">KEY ENGINE</h3>
                </div>

                <div className="space-y-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-slate-950 p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-2xl font-mono text-purple-200 break-all text-center md:text-left tracking-widest font-bold">
                                {password || 'GENERATING...'}
                            </div>
                            <div className="flex gap-4 shrink-0">
                                <button onClick={generate} className="p-4 bg-purple-900/20 text-purple-400 rounded-xl hover:bg-purple-900/40 border border-purple-500/20 active:scale-90 transition-all"><RefreshCw className="w-6 h-6" /></button>
                                <button onClick={() => { navigator.clipboard.writeText(password); alert("Copied to Enclave Clipboard"); }} className="p-4 bg-cyan-900/20 text-cyan-400 rounded-xl hover:bg-cyan-900/40 border border-cyan-500/20 active:scale-90 transition-all"><Copy className="w-6 h-6" /></button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-orbitron tracking-widest text-slate-500 uppercase">Entropy Length</label>
                                <span className="text-purple-400 font-mono text-lg">{length} BITS</span>
                            </div>
                            <input type="range" min="8" max="128" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-2 bg-slate-900 rounded-full accent-purple-500 appearance-none cursor-pointer" />
                            <div className="flex justify-between text-[10px] text-slate-700 font-mono"><span>8</span><span>64</span><span>128</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(options).map((key) => (
                                <button 
                                    key={key}
                                    onClick={() => setOptions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                                    className={`p-4 rounded-xl border font-orbitron text-[10px] tracking-widest transition-all ${options[key as keyof typeof options] ? 'bg-purple-900/40 border-purple-500/50 text-purple-300 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                                >
                                    {key.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </NeonCard>
        </div>
    );
};

const App: React.FC = () => {
  // --- Core State ---
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [appConfig, setAppConfig] = useState<AppCustomization>(DEFAULT_APP_CONFIG);
  const [view, setView] = useState<'SPLASH' | 'AUTH' | 'DASHBOARD'>('SPLASH');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY'>('LOGIN');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [authError, setAuthError] = useState('');
  
  // --- Dashboard State ---
  const [items, setItems] = useState<VaultItem[]>([]);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [sessionKey, setSessionKey] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vault' | 'generator' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'FAVORITES' | VaultItemType>('ALL');

  // --- Modal & Scanner State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStage, setScanStage] = useState<'SELECT' | 'CAMERA' | 'PIN' | 'RESULT'>('SELECT');
  const [scanInputPin, setScanInputPin] = useState('');
  const [scannedEncryptedData, setScannedEncryptedData] = useState('');
  const [scannedItem, setScannedItem] = useState<any>(null);

  // Item details modal
  const [showDetailModal, setShowDetailModal] = useState<VaultItem | null>(null);
  const [qrExpiry, setQrExpiry] = useState<number | undefined>(undefined);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemType, setNewItemType] = useState<VaultItemType>(VaultItemType.PASSWORD);
  const [newItemData, setNewItemData] = useState<Partial<VaultItem>>({ fields: {}, favorite: false, attachments: [] });
  const [newUserName, setNewUserName] = useState('');
  const [recoveryHint, setRecoveryHint] = useState('');

  // --- Hardware/Camera State ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Auto-Lock Logic ---
  const lastActivityRef = useRef<number>(Date.now());
  
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (view !== 'DASHBOARD' || !userConfig?.autoLockTimer) return;

    const interval = setInterval(() => {
      const inactiveMinutes = (Date.now() - lastActivityRef.current) / 1000 / 60;
      if (inactiveMinutes >= userConfig.autoLockTimer) {
        setView('AUTH');
        setPin('');
        setSessionKey('');
        setAuthError('SESSION TIMED OUT');
        clearInterval(interval);
      }
    }, 10000);

    window.addEventListener('mousedown', resetActivity);
    window.addEventListener('keypress', resetActivity);
    window.addEventListener('touchstart', resetActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousedown', resetActivity);
      window.removeEventListener('keypress', resetActivity);
      window.removeEventListener('touchstart', resetActivity);
    };
  }, [view, userConfig, resetActivity]);

  // --- Auth & Session Logic ---
  const handleAuthSuccess = async (user: UserProfile, config: UserConfig, userPin: string) => {
    setSessionKey(userPin);
    setUserConfig(config);
    setActiveUser(user);
    resetActivity();
    const encryptedVault = await db.getVaultData(user.id);
    if (encryptedVault) {
      try {
        const data = await decryptData(encryptedVault, userPin);
        setItems(data);
      } catch (e) { console.error("Vault decryption failed", e); }
    }
    setView('DASHBOARD');
    setAuthError('');
  };

  const loginWithPin = async () => {
    if (!activeUser) return;
    const config = await db.getUserConfig(activeUser.id);
    if (config) {
      const hashed = await hashPin(pin);
      if (hashed === config.masterHash) {
        handleAuthSuccess(activeUser, config, pin);
      } else {
        setAuthError("PROTOCOL ERROR: INVALID PIN");
      }
    }
  };

  const handleBiometricLogin = async () => {
    if (!activeUser) return;
    const config = await db.getUserConfig(activeUser.id);
    if (config?.biometricCredential) {
      setProcessMessage("VERIFYING BIOMETRICS...");
      setIsProcessing(true);
      const success = await authenticateBiometrics(config.biometricCredential.id);
      setIsProcessing(false);
      if (success) {
        const storedPin = localStorage.getItem(`QAV_BIO_PIN_${activeUser.id}`);
        if (storedPin) handleAuthSuccess(activeUser, config, storedPin);
        else setAuthError("BIO-MAP LOST. PIN REQUIRED ONCE.");
      } else {
        setAuthError("BIOMETRIC CHALLENGE FAILED");
      }
    }
  };

  const registerIdentity = async () => {
    if (!newUserName || pin.length < 4) return setAuthError("NAME & 4-DIGIT PIN MINIMUM REQUIRED");
    if (pin !== confirmPin) return setAuthError("PIN MISMATCH DETECTED");
    
    setProcessMessage("INITIALIZING IDENTITY...");
    setIsProcessing(true);
    const newId = crypto.randomUUID();
    const newUser: UserProfile = { id: newId, name: newUserName, createdAt: Date.now() };
    const hashed = await hashPin(pin);
    const config: UserConfig = {
      userId: newId, setupComplete: true, masterHash: hashed, biometricsEnabled: false,
      recoveryEmail: '', autoLockTimer: 5, theme: 'cyan', recoveryHint,
      backupFrequency: 'none', backupProviders: []
    };
    await db.saveUser(newUser);
    await db.saveUserConfig(config);
    setUsers([...users, newUser]);
    setActiveUser(newUser);
    setAuthMode('LOGIN');
    setIsProcessing(false);
  };

  const updateAppConfig = (updates: Partial<AppCustomization>) => {
    const newConfig = { ...appConfig, ...updates };
    setAppConfig(newConfig);
    localStorage.setItem(APP_CUSTOMIZATION_KEY, JSON.stringify(newConfig));
  };

  const toggleFavorite = async (item: VaultItem) => {
    const updated = items.map(i => i.id === item.id ? { ...i, favorite: !i.favorite } : i);
    await syncVault(updated);
  };

  const syncVault = async (newItems: VaultItem[]) => {
    if (!activeUser || !sessionKey) return;
    try {
      const enc = await encryptData(newItems, sessionKey);
      await db.saveVaultData(activeUser.id, enc);
      setItems(newItems);
    } catch (e) { console.error(e); }
  };

  const handleManualSync = async () => {
    if (!activeUser || !sessionKey) return;
    setProcessMessage("ORCHESTRATING CLOUD SYNC...");
    setIsProcessing(true);
    
    // Simulation of cloud provider sync
    await new Promise(r => setTimeout(r, 2000));
    
    const config = { ...userConfig!, lastSyncTimestamp: Date.now() };
    setUserConfig(config);
    await db.saveUserConfig(config);
    
    setIsProcessing(false);
    alert("CLOUD ENCLAVE SYNCHRONIZATION SUCCESSFUL");
  };

  const toggleBackupProvider = async (provider: 'gdrive' | 'onedrive' | 'dropbox') => {
    if (!userConfig) return;
    const current = userConfig.backupProviders || [];
    const updated = current.includes(provider) 
      ? current.filter(p => p !== provider) 
      : [...current, provider];
    
    const nc = { ...userConfig, backupProviders: updated };
    setUserConfig(nc);
    await db.saveUserConfig(nc);
  };

  // --- Optical Intelligence Logic ---
  const refreshDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vids = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(vids);
      if (vids.length > 0 && !selectedCameraId) setSelectedCameraId(vids[0].deviceId);
    } catch (e) { console.error(e); }
  };

  const toggleCamera = async (on: boolean, deviceId?: string) => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }
    if (!on) { 
      setCameraStream(null); 
      setIsCameraOpen(false); 
      return; 
    }

    try {
      const constraints = { 
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' } 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setIsCameraOpen(on);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) { 
      alert("CAMERA PERMISSION DENIED OR HARDWARE OCCUPIED"); 
      setIsCameraOpen(false);
    }
  };

  const runAIOcr = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setProcessMessage("QUANTUM OCR ENGINE ANALYZING...");
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg');
    
    try {
      const result = await analyzeImageForVault(base64);
      if (result) {
        if (scanStage === 'CAMERA') {
          setScannedItem(result);
          setScanStage('RESULT');
        } else {
          setNewItemData(prev => ({
            ...prev,
            title: result.title || prev.title,
            username: result.fields?.Username || result.fields?.FullName || prev.username,
            password: result.fields?.Password || prev.password,
            fields: {
                ...prev.fields,
                ...result.fields
            }
          }));
        }
      } else {
        alert("OCR SIGNAL WEAK. PLEASE ADJUST LIGHTING.");
      }
    } catch(e) { console.error("OCR Failure", e); }
    setIsProcessing(false);
  };

  useEffect(() => {
    const startup = async () => {
      await db.init();
      setUsers(await db.getUsers());
      const saved = localStorage.getItem(APP_CUSTOMIZATION_KEY);
      if (saved) setAppConfig(JSON.parse(saved));
      refreshDevices();
      setTimeout(() => setView('AUTH'), 2000);
    };
    startup();
  }, []);

  const AppIcon = APP_ICONS[appConfig.appIcon] || Shield;

  const displayItems = useMemo(() => {
    let base = items;
    if (searchQuery) {
        base = base.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterMode === 'FAVORITES') return base.filter(i => i.favorite);
    if (filterMode !== 'ALL') return base.filter(i => i.type === filterMode);
    return base;
  }, [items, searchQuery, filterMode]);

  const generateCert = async () => {
    if (!newItemData.title) return alert("SPECIFY CERTIFICATE TITLE FIRST");
    setIsProcessing(true);
    setProcessMessage("FORGING RSA-2048 CERTIFICATE...");
    try {
      const res = await generateSelfSignedCertificate(newItemData.title);
      setNewItemData(prev => ({
        ...prev,
        certData: { publicKey: res.publicKey, privateKey: res.privateKey, format: 'PEM' },
        fields: { ...prev.fields, issuer: 'QAV LOCAL CA' }
      }));
    } catch (e) { alert("CERTIFICATE FORGERY FAILED"); }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-rajdhani overflow-hidden selection:bg-purple-500/40 gpu">
      
      {/* SPLASH VIEW */}
      {view === 'SPLASH' && (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950 gpu">
          <div className="relative mb-12 animate-float">
             <div className="absolute inset-0 scale-150 blur-3xl bg-purple-600/30 animate-pulse"></div>
             <AppIcon className="w-40 h-40 text-purple-400 relative z-10" />
          </div>
          <h1 className="text-5xl font-orbitron tracking-[0.5em] text-white glow-text uppercase mb-2 text-center px-4">{appConfig.appTitle}</h1>
          <p className="mt-6 font-mono text-purple-500/80 tracking-[0.3em] text-xs animate-pulse uppercase">BOOTING SECURE CORE ENCLAVE...</p>
        </div>
      )}

      {/* AUTH VIEW */}
      {view === 'AUTH' && (
        <div className="flex items-center justify-center min-h-screen p-4 auth-bg relative gpu">
           <div className="z-10 w-full max-w-md animate-in-zoom">
             <NeonCard variant="purple" className="shadow-2xl ring-1 ring-purple-500/20">
                <div className="flex border-b border-purple-900/30 mb-10 rounded-t-2xl overflow-hidden bg-black/20">
                  {['LOGIN', 'REGISTER'].map((mode: any) => (
                    <button 
                      key={mode} 
                      onClick={() => { setAuthMode(mode); setAuthError(''); }}
                      className={`flex-1 py-5 font-orbitron text-[10px] tracking-[0.3em] transition-all duration-300 ${authMode === mode ? 'text-purple-400 bg-purple-950/40 border-b-2 border-purple-500' : 'text-slate-600 hover:text-purple-300 hover:bg-purple-950/10'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="space-y-8">
                  {authMode === 'LOGIN' && (
                    <div className="space-y-6">
                      <div className="max-h-52 overflow-y-auto space-y-3 mb-6 custom-scrollbar pr-2 -mr-2">
                        {users.map(u => (
                          <button key={u.id} onClick={() => { setActiveUser(u); setPin(''); setAuthError(''); }}
                                  className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${activeUser?.id === u.id ? 'bg-purple-900/50 border-purple-500 text-white' : 'bg-slate-900/60 border-slate-800/50 text-slate-500 hover:bg-slate-800'}`}>
                            <User className="w-5 h-5" />
                            <span className="font-bold tracking-[0.1em] text-sm">{u.name.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>
                      <NeonInput type="password" placeholder="VAULT ACCESS PIN" value={pin} onChange={e => setPin(e.target.value)} className="text-center tracking-[1.5em] text-3xl font-bold h-16" />
                      <div className="flex gap-4 pt-2">
                        <NeonButton onClick={loginWithPin} className="flex-1 bg-purple-600 h-14">ACCESS ENCLAVE</NeonButton>
                        {(activeUser) && <button onClick={handleBiometricLogin} className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl text-purple-400"><Fingerprint className="w-7 h-7" /></button>}
                      </div>
                    </div>
                  )}
                  {authMode === 'REGISTER' && (
                    <div className="space-y-5 animate-in-fade">
                      <NeonInput placeholder="IDENTITY NAME" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                      <NeonInput type="password" placeholder="MASTER PIN (4+ DIGITS)" value={pin} onChange={e => setPin(e.target.value)} />
                      <NeonInput type="password" placeholder="CONFIRM PIN" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} />
                      <NeonButton onClick={registerIdentity} className="w-full bg-purple-600 h-14 mt-4">INITIALIZE IDENTITY</NeonButton>
                    </div>
                  )}
                  {authError && <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-[10px] text-red-400 text-center animate-pulse uppercase">{authError}</div>}
                </div>
             </NeonCard>
           </div>
        </div>
      )}

      {/* DASHBOARD VIEW */}
      {view === 'DASHBOARD' && activeUser && (
        <div className="flex h-screen bg-slate-950 gpu" onMouseMove={resetActivity}>
           {/* Sidebar */}
           <div className={`fixed lg:relative z-40 h-full w-80 bg-slate-900/95 border-r border-purple-900/20 flex flex-col transition-all duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} backdrop-blur-2xl`}>
              <div className="p-10 border-b border-purple-900/10 flex items-center gap-5">
                  <AppIcon className="w-9 h-9 text-purple-400 animate-float" />
                  <h1 className="text-2xl font-orbitron font-bold text-white tracking-[0.2em] uppercase">QAV<span className="text-purple-500/60 text-xs tracking-[0.5em] ml-2">CORE</span></h1>
              </div>
              <div className="flex-1 py-10 px-6 space-y-3 overflow-y-auto custom-scrollbar">
                  {[
                      { id: 'dashboard', icon: LayoutDashboard, label: 'OVERVIEW' },
                      { id: 'vault', icon: Lock, label: 'SECURE VAULT' },
                      { id: 'scan', icon: Scan, label: 'SCANNER', action: () => { setShowScanModal(true); setScanStage('SELECT'); } },
                      { id: 'generator', icon: Key, label: 'KEY ENGINE' },
                      { id: 'settings', icon: Settings, label: 'SYSTEM' },
                  ].map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => { if (item.action) item.action(); else setActiveTab(item.id as any); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-2xl transition-all ${activeTab === item.id && !item.action ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'text-slate-500 hover:text-purple-300'}`}
                      >
                          <item.icon className="w-6 h-6" />
                          <span className="font-orbitron text-[10px] tracking-[0.3em] uppercase">{item.label}</span>
                      </button>
                  ))}
              </div>
              <div className="p-8 border-t border-purple-900/10">
                  <button onClick={() => setView('AUTH')} className="w-full flex items-center justify-center gap-3 py-4.5 bg-red-950/20 text-red-400 rounded-2xl border border-red-500/30 font-bold uppercase text-[10px]">
                    <Power className="w-5 h-5" /> TERMINATE SESSION
                  </button>
              </div>
           </div>

           {/* Main Interface */}
           <div className="flex-1 flex flex-col h-full overflow-hidden">
              <header className="h-24 border-b border-purple-900/5 flex items-center justify-between px-10 bg-slate-900/60 backdrop-blur-3xl shrink-0 z-20">
                  <div className="flex items-center gap-8">
                      <button className="lg:hidden text-purple-400 p-2" onClick={() => setSidebarOpen(true)}><MenuIcon /></button>
                      <h2 className="text-3xl font-orbitron text-white tracking-[0.2em] uppercase">{activeTab}</h2>
                  </div>
                  <div className="flex items-center gap-10">
                      <div className="relative hidden md:block">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500/60" />
                          <input type="text" placeholder="QUERY ENCLAVE..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
                                 className="bg-slate-950 border border-purple-900/20 rounded-2xl pl-14 pr-8 py-3.5 text-sm text-purple-100 focus:border-purple-500/50 outline-none w-72 transition-all focus:w-96" />
                      </div>
                      <LiveClock />
                  </div>
              </header>

              <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                  {activeTab === 'dashboard' && (
                    <PageTransition className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                       <NeonCard variant="purple" className="h-52 flex flex-col items-center justify-center">
                          <ShieldCheck className="w-14 h-14 text-purple-400 mb-4" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ENCRYPTION ENGINE</span>
                          <span className="text-xl font-bold text-white uppercase tracking-widest">AES-256-GCM</span>
                       </NeonCard>
                       <NeonCard variant="purple" className="h-52 flex flex-col items-center justify-center">
                          <Database className="w-14 h-14 text-purple-400 mb-4" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">STORED ENGRAMS</span>
                          <span className="text-xl font-bold text-white uppercase tracking-widest">{items.length} KEYSETS</span>
                       </NeonCard>
                       <NeonCard variant="purple" className="h-52 flex flex-col items-center justify-center">
                          <Bot className="w-14 h-14 text-purple-400 mb-4" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">AI CO-PROCESSOR</span>
                          <span className="text-xl font-bold text-white uppercase tracking-widest">GEMINI READY</span>
                       </NeonCard>
                    </PageTransition>
                  )}

                  {activeTab === 'vault' && (
                    <PageTransition className="space-y-10">
                       <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/40 p-8 rounded-3xl border border-purple-900/10 backdrop-blur-2xl gap-6">
                          <NeonButton onClick={() => setShowAddModal(true)} className="bg-purple-600 w-full sm:w-auto">
                            <Plus className="w-6 h-6" /> INITIALIZE KEYSET
                          </NeonButton>
                          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                             <button onClick={() => setFilterMode('ALL')} className={`px-4 py-2 rounded-xl text-[10px] font-orbitron tracking-widest ${filterMode === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-500'}`}>ALL</button>
                             <button onClick={() => setFilterMode('FAVORITES')} className={`px-4 py-2 rounded-xl text-[10px] font-orbitron tracking-widest flex items-center gap-2 ${filterMode === 'FAVORITES' ? 'bg-yellow-600 text-white' : 'bg-slate-950 text-slate-500'}`}><Star className="w-3 h-3 fill-current"/> FAVORITES</button>
                             {Object.values(VaultItemType).map(t => (
                               <button key={t} onClick={() => setFilterMode(t)} className={`px-4 py-2 rounded-xl text-[10px] font-orbitron tracking-widest ${filterMode === t ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-500'}`}>{t.replace('_', ' ')}</button>
                             ))}
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                          {displayItems.map((item) => (
                            <NeonCard key={item.id} variant="purple" className="cursor-pointer" onClick={() => setShowDetailModal(item)}>
                               <div className="flex justify-between items-start mb-6">
                                  <div className="p-4 bg-purple-950/40 rounded-2xl text-purple-400">
                                    {item.type === VaultItemType.PASSWORD ? <Key className="w-6 h-6" /> : item.type === VaultItemType.ID_CARD ? <User className="w-6 h-6" /> : item.type === VaultItemType.CERTIFICATE ? <FileBadge className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }} className={`p-2 transition-all ${item.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-slate-800'}`}>
                                    <Star className="w-6 h-6" />
                                  </button>
                               </div>
                               <h3 className="text-xl font-bold text-white mb-2 truncate uppercase tracking-widest">{item.title}</h3>
                               <p className="text-xs font-mono text-slate-500 truncate uppercase tracking-widest">{item.username || 'ANONYMOUS'}</p>
                            </NeonCard>
                          ))}
                       </div>
                    </PageTransition>
                  )}

                  {activeTab === 'generator' && <PageTransition><PasswordGenerator /></PageTransition>}

                  {activeTab === 'settings' && (
                    <PageTransition className="max-w-4xl mx-auto space-y-10 pb-12">
                       <NeonCard variant="purple">
                          <h3 className="text-3xl font-orbitron text-white uppercase tracking-[0.2em] mb-10 border-b border-purple-900/10 pb-6">SECURITY HARDENING</h3>
                          <div className="space-y-8">
                             <div className="flex items-center justify-between p-7 bg-slate-950/40 rounded-3xl border border-purple-900/10">
                                <div>
                                  <span className="block font-bold text-white text-lg uppercase mb-1">SESSION AUTO-LOCK</span>
                                  <span className="text-[10px] text-slate-500 uppercase font-mono">IDLE TIMEOUT IN MINUTES</span>
                                </div>
                                <div className="flex items-center gap-6">
                                   <span className="text-purple-400 font-mono text-xl font-bold">{userConfig?.autoLockTimer} MIN</span>
                                   <input type="range" min="1" max="60" value={userConfig?.autoLockTimer} onChange={e => {
                                      const val = parseInt(e.target.value);
                                      const nc = { ...userConfig!, autoLockTimer: val };
                                      setUserConfig(nc); db.saveUserConfig(nc);
                                   }} className="accent-purple-500" />
                                </div>
                             </div>

                             <div className="p-7 bg-slate-950/40 rounded-3xl border border-purple-900/10 space-y-8">
                                <div className="flex justify-between items-center border-b border-purple-900/10 pb-4">
                                   <h4 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-3"><Cloud className="w-5 h-5 text-purple-400"/> CLOUD SYNCHRONIZATION</h4>
                                   <NeonButton onClick={handleManualSync} variant="neon" className="py-2 px-4 text-[9px]"><RefreshCcw className="w-3 h-3"/> SYNC NOW</NeonButton>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                   <div className="space-y-4">
                                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Backup Frequency</label>
                                      <div className="flex gap-2">
                                         {['none', 'daily', 'weekly'].map((freq) => (
                                           <button 
                                             key={freq}
                                             onClick={async () => {
                                               const nc = { ...userConfig!, backupFrequency: freq as any };
                                               setUserConfig(nc); await db.saveUserConfig(nc);
                                             }}
                                             className={`flex-1 py-3 rounded-xl border font-orbitron text-[9px] tracking-widest transition-all ${userConfig?.backupFrequency === freq ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                           >
                                              {freq.toUpperCase()}
                                           </button>
                                         ))}
                                      </div>
                                   </div>

                                   <div className="space-y-4">
                                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enclave Providers</label>
                                      <div className="flex gap-3">
                                         {[
                                           { id: 'gdrive', icon: Database, label: 'DRIVE' },
                                           { id: 'onedrive', icon: Cloud, label: 'AZURE' },
                                           { id: 'dropbox', icon: Box, label: 'DROPBOX' }
                                         ].map((provider) => (
                                           <button 
                                             key={provider.id}
                                             onClick={() => toggleBackupProvider(provider.id as any)}
                                             className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${userConfig?.backupProviders?.includes(provider.id as any) ? 'bg-purple-900/30 border-purple-500/50 text-purple-300' : 'bg-slate-950 border-slate-800 text-slate-700'}`}
                                           >
                                              <provider.icon className="w-5 h-5" />
                                              <span className="text-[8px] font-bold tracking-widest">{provider.label}</span>
                                           </button>
                                         ))}
                                      </div>
                                   </div>
                                </div>

                                {userConfig?.lastSyncTimestamp && (
                                  <div className="pt-4 text-center">
                                     <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">LAST SUCCESSFUL ENCLAVE HANDSHAKE: {new Date(userConfig.lastSyncTimestamp).toLocaleString()}</span>
                                  </div>
                                )}
                             </div>

                             <div className="p-7 bg-slate-950/40 rounded-3xl border border-purple-900/10">
                                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">VAULT EXPORT SUITE</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                   <NeonButton variant="neon" onClick={() => exportToPDF(items, 'QAV_VAULT_EXPORT')} className="text-[9px]"><FileText className="w-4 h-4" /> PDF</NeonButton>
                                   <NeonButton variant="neon" onClick={() => exportToXLSX(items, 'QAV_VAULT_EXPORT')} className="text-[9px]"><FileSpreadsheet className="w-4 h-4" /> EXCEL</NeonButton>
                                   <NeonButton variant="neon" onClick={() => downloadFile(convertToCSV(items), 'QAV_VAULT.csv', 'text/csv')} className="text-[9px]"><FileJson className="w-4 h-4" /> CSV</NeonButton>
                                   <NeonButton variant="neon" onClick={() => exportToDOCX(items, 'QAV_VAULT_EXPORT')} className="text-[9px]"><FileType className="w-4 h-4" /> DOCX</NeonButton>
                                </div>
                             </div>
                          </div>
                       </NeonCard>
                    </PageTransition>
                  )}
              </main>
           </div>
        </div>
      )}

      {/* ITEM DETAIL MODAL */}
      <Modal isOpen={!!showDetailModal} onClose={() => { setShowDetailModal(null); setQrExpiry(undefined); }} title="DATA TELEMETRY" variant="purple">
        {showDetailModal && (
          <div className="space-y-8 pb-6 animate-in-fade">
            <div className="p-6 bg-slate-950/50 rounded-2xl border border-purple-900/10">
              <label className="text-[9px] text-slate-500 font-bold uppercase block mb-2 opacity-60">Entry Designation</label>
              <div className="text-white font-bold text-xl uppercase tracking-widest">{showDetailModal.title}</div>
            </div>
            
            {showDetailModal.type === VaultItemType.BANK_CARD ? (
               <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-purple-950 to-slate-900 rounded-2xl border border-purple-500/30 relative overflow-hidden h-44 shadow-2xl">
                     <div className="absolute top-6 right-8 text-purple-400 opacity-20"><CreditCard className="w-20 h-20" /></div>
                     <div className="text-xs font-mono text-purple-400 mb-8 tracking-[0.3em]">ENCRYPTED BANK CARD EMULATION</div>
                     <div className="text-2xl font-mono text-white tracking-[0.2em] mb-4">
                        {showDetailModal.fields?.cardNumber || '•••• •••• •••• ••••'}
                     </div>
                     <div className="flex justify-between items-end">
                        <div>
                           <div className="text-[8px] text-slate-500 uppercase font-bold">Holder</div>
                           <div className="text-sm font-mono text-white uppercase">{showDetailModal.username || 'VALUED IDENTITY'}</div>
                        </div>
                        <div>
                           <div className="text-[8px] text-slate-500 uppercase font-bold">Expiry</div>
                           <div className="text-sm font-mono text-white">{showDetailModal.fields?.expiryDate || '••/••'}</div>
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <>
                {showDetailModal.username && (
                    <div className="p-6 bg-slate-950/50 rounded-2xl border border-purple-900/10 flex justify-between items-center">
                    <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Ident / Username</label>
                        <div className="text-purple-300 font-mono uppercase tracking-widest">{showDetailModal.username}</div>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(showDetailModal.username!)} className="p-2.5 hover:bg-purple-500/20 rounded-xl text-purple-400 transition-all"><Copy className="w-5 h-5" /></button>
                    </div>
                )}
                {showDetailModal.password && (
                    <div className="p-6 bg-slate-950/50 rounded-2xl border border-purple-900/10 flex justify-between items-center">
                    <div>
                        <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Secret Payload</label>
                        <div className="text-purple-300 font-mono tracking-[0.4em]">••••••••••••••••</div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => alert(`PAYLOAD: ${showDetailModal.password}`)} className="p-2.5 hover:bg-purple-500/20 rounded-xl text-purple-400"><Eye className="w-5 h-5" /></button>
                        <button onClick={() => navigator.clipboard.writeText(showDetailModal.password!)} className="p-2.5 hover:bg-purple-500/20 rounded-xl text-purple-400"><Copy className="w-5 h-5" /></button>
                    </div>
                    </div>
                )}
               </>
            )}

            <div className="pt-8 border-t border-purple-900/10 flex flex-col items-center gap-6">
                <div className="flex flex-wrap justify-center gap-3">
                    {[5, 15, 30].map(s => (
                    <button key={s} onClick={() => setQrExpiry(s)} className={`px-4 py-2 rounded-xl text-[9px] font-orbitron tracking-widest ${qrExpiry === s ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-500'}`}>{s}S SIGNAL</button>
                    ))}
                    <button onClick={() => setQrExpiry(undefined)} className={`px-4 py-2 rounded-xl text-[9px] font-orbitron tracking-widest ${qrExpiry === undefined ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-500'}`}>PERMANENT</button>
                </div>
                <QRCodeDisplay key={`${showDetailModal.id}-${qrExpiry}`} expiresIn={qrExpiry} data={JSON.stringify({ ephemeralId: crypto.randomUUID(), ...showDetailModal })} label="HOLOGRAPHIC SIGNAL" />
            </div>

            <div className="flex gap-4">
              <NeonButton variant="danger" className="flex-1" onClick={async () => {
                const newItems = items.filter(i => i.id !== showDetailModal.id);
                await syncVault(newItems);
                setShowDetailModal(null);
              }}>TERMINATE</NeonButton>
              <NeonButton variant="neon" className="flex-1" onClick={() => setShowDetailModal(null)}>CLOSE</NeonButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD ITEM MODAL */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); toggleCamera(false); }} title="VAULT INITIALIZATION" variant="purple">
         <div className="space-y-8 pb-6 animate-in-fade">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
               {[VaultItemType.PASSWORD, VaultItemType.BANK_CARD, VaultItemType.ID_CARD, VaultItemType.CERTIFICATE].map(t => (
                 <button key={t} onClick={() => setNewItemType(t)} className={`py-3.5 text-[9px] font-orbitron tracking-widest border rounded-2xl transition-all ${newItemType === t ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-950 text-slate-600'}`}>{t.replace('_', ' ')}</button>
               ))}
            </div>
            
            <NeonInput placeholder="ENTRY DESIGNATION" value={newItemData.title || ''} onChange={e => setNewItemData({...newItemData, title: e.target.value})} />
            
            {newItemType === VaultItemType.BANK_CARD ? (
               <div className="space-y-4 animate-in-fade">
                  <NeonInput placeholder="HOLDER NAME" value={newItemData.username || ''} onChange={e => setNewItemData({...newItemData, username: e.target.value})} />
                  <NeonInput placeholder="CARD NUMBER (16 DIGITS)" maxLength={16} value={newItemData.fields?.cardNumber || ''} onChange={e => setNewItemData({...newItemData, fields: {...newItemData.fields, cardNumber: e.target.value}})} />
                  <div className="flex gap-4">
                    <NeonInput placeholder="EXPIRY (MM/YY)" maxLength={5} value={newItemData.fields?.expiryDate || ''} onChange={e => setNewItemData({...newItemData, fields: {...newItemData.fields, expiryDate: e.target.value}})} />
                    <NeonInput placeholder="CVV" maxLength={4} type="password" value={newItemData.password || ''} onChange={e => setNewItemData({...newItemData, password: e.target.value})} />
                  </div>
               </div>
            ) : newItemType === VaultItemType.CERTIFICATE ? (
                <div className="space-y-6 animate-in-fade">
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">CERTIFICATE PAYLOAD</label>
                       <button onClick={generateCert} className="text-purple-400 text-[10px] font-bold flex items-center gap-2 hover:text-white transition-colors"><ShieldEllipsis className="w-4 h-4"/> AUTO-GENERATE RSA</button>
                    </div>
                    <textarea 
                        value={newItemData.certData?.privateKey || ''} 
                        onChange={e => setNewItemData({...newItemData, certData: {...(newItemData.certData || {format: 'PEM', publicKey: ''}), privateKey: e.target.value}})}
                        placeholder="PASTE PRIVATE KEY OR USE AUTO-GENERATE..." 
                        className="w-full h-28 bg-black/40 border border-slate-800 rounded-2xl p-4 text-[10px] font-mono text-purple-200 outline-none"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                  <NeonInput placeholder="IDENT / USERNAME" value={newItemData.username || ''} onChange={e => setNewItemData({...newItemData, username: e.target.value})} />
                  <div className="flex gap-4">
                     <NeonInput type="password" placeholder="SECRET PAYLOAD" value={newItemData.password || ''} onChange={e => setNewItemData({...newItemData, password: e.target.value})} className="flex-1" />
                     <button onClick={async () => { const pw = await generateSecurePassword(); setNewItemData({...newItemData, password: pw}); }} className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 text-purple-400"><RefreshCw className="w-6 h-6" /></button>
                  </div>
                  {newItemType === VaultItemType.PASSWORD && <PasswordStrengthMeter password={newItemData.password} />}
                </div>
            )}
            
            <div className="pt-8 border-t border-purple-900/10">
               {isCameraOpen ? (
                 <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
                    <div className="absolute bottom-6 inset-x-0 flex justify-center gap-6">
                       <button onClick={() => toggleCamera(false)} className="bg-red-950/80 p-4 rounded-full text-white"><X className="w-5 h-5" /></button>
                       <button onClick={runAIOcr} className="bg-purple-600 px-8 py-3 rounded-full text-xs font-bold flex items-center gap-3 border border-white/10 uppercase"><Bot className="w-5 h-5"/> AI SCAN</button>
                    </div>
                 </div>
               ) : (
                 <button onClick={() => toggleCamera(true)} className="w-full py-10 border-2 border-dashed border-purple-900/20 rounded-[2rem] text-slate-500 hover:text-purple-400 flex flex-col items-center gap-3 group bg-slate-950/20 transition-all">
                    <Camera className="w-8 h-8 opacity-40 group-hover:opacity-100" />
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase">BOOT OPTICAL SCANNER</span>
                 </button>
               )}
            </div>

            <NeonButton onClick={async () => {
              if (!newItemData.title) return alert("DESIGNATION REQUIRED");
              const item: VaultItem = {
                id: crypto.randomUUID(), 
                type: newItemType, 
                title: newItemData.title!, 
                username: newItemData.username,
                password: newItemData.password, 
                fields: newItemData.fields || {}, 
                tags: [], 
                createdAt: Date.now(), 
                updatedAt: Date.now(), 
                favorite: false,
                certData: newItemData.certData
              };
              await syncVault([...items, item]);
              setShowAddModal(false);
              setNewItemData({});
              toggleCamera(false);
            }} className="w-full bg-purple-600 h-16 uppercase tracking-[0.2em] text-sm">ENCRYPT & COMMIT</NeonButton>
         </div>
      </Modal>

      {/* SYSTEM OVERLAY LOADER */}
      {isProcessing && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in-fade gpu">
              <div className="relative mb-12">
                 <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
                 <Aperture className="w-20 h-20 text-purple-400 animate-spin" />
              </div>
              <span className="font-orbitron tracking-[0.5em] text-purple-400 uppercase text-sm">{processMessage}</span>
          </div>
      )}

    </div>
  );
};

export default App;
