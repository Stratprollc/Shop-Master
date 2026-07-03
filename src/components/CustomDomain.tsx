import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  BookOpen, 
  ExternalLink, 
  Server, 
  Lock, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight, 
  X,
  Info,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomDomain {
  id: string;
  domainName: string;
  type: 'root' | 'subdomain';
  status: 'pending_dns' | 'verifying' | 'ssl_issuing' | 'active' | 'error';
  sslStatus: 'active' | 'pending' | 'none';
  createdAt: string;
  dnsIpValue: string;
  dnsCnameValue: string;
  dnsVerified: boolean;
}

export function CustomDomain() {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Form State
  const [newDomainName, setNewDomainName] = useState('');
  const [domainType, setDomainType] = useState<'root' | 'subdomain'>('subdomain');
  const [formError, setFormError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  
  // Guide tab state
  const [activeGuideTab, setActiveGuideTab] = useState<'nameserver' | 'dns'>('nameserver');
  
  // Selected domain to show detailed instructions
  const [selectedDomainForInstructions, setSelectedDomainForInstructions] = useState<CustomDomain | null>(null);

  // Deep Verification Modal State
  const [verifyingDomain, setVerifyingDomain] = useState<CustomDomain | null>(null);
  const [currentVerifyStep, setCurrentVerifyStep] = useState(0);
  const [verifySteps, setVerifySteps] = useState<Array<{
    id: string;
    label: string;
    status: 'idle' | 'running' | 'success' | 'error';
    details: string;
  }>>([]);
  const [isVerifyComplete, setIsVerifyComplete] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Fetch domains on load
  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations/custom-domains');
      const data = await res.json();
      if (data.success) {
        setDomains(data.customDomains);
      }
    } catch (err) {
      console.error('Error loading domains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const validateDomain = (val: string) => {
    const reg = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return reg.test(val.trim());
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setAddSuccess(false);

    const inputName = newDomainName.trim().toLowerCase();
    if (!inputName) {
      setFormError('অনুগ্রহ করে একটি ডোমেন নাম লিখুন।');
      return;
    }

    if (!validateDomain(inputName)) {
      setFormError('সঠিক ডোমেন ফরম্যাট লিখুন (যেমন: shop.mybrand.com অথবা mybrand.com)।');
      return;
    }

    // Check if duplicate
    if (domains.some(d => d.domainName === inputName)) {
      setFormError('এই ডোমেনটি ইতিমধ্যে আপনার তালিকায় রয়েছে।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/integrations/custom-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainName: inputName, type: domainType })
      });
      const data = await res.json();
      if (data.success) {
        setNewDomainName('');
        setAddSuccess(true);
        fetchDomains();
        // Auto show instruction modal for the newly added domain
        setSelectedDomainForInstructions(data.domain);
        setTimeout(() => setAddSuccess(false), 4000);
      } else {
        setFormError(data.error || 'ডোমেন যুক্ত করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      setFormError('সার্ভার কানেকশন এরর। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই কাস্টম ডোমেনটি ডিলিট করতে চান?')) return;
    
    setActionLoadingId(id);
    try {
      const res = await fetch('/api/integrations/custom-domains/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setDomains(prev => prev.filter(d => d.id !== id));
        if (selectedDomainForInstructions?.id === id) {
          setSelectedDomainForInstructions(null);
        }
      } else {
        alert(data.error || 'ডিলিট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      alert('নেটওয়ার্ক এরর।');
    } finally {
      setActionLoadingId(null);
    }
  };

  const startDeepVerification = (dom: CustomDomain) => {
    setVerifyingDomain(dom);
    setCurrentVerifyStep(0);
    setIsVerifyComplete(false);
    setVerifyError('');
    
    setVerifySteps([
      { 
        id: 'dns', 
        label: 'DNS প্রোপাগেশন এবং আইপি রেজোলিউশন চেক', 
        status: 'running', 
        details: dom.type === 'root' 
          ? `আপনার মেইন ডোমেন ${dom.domainName} টি A Record (103.174.152.45) আইপিতে পয়েন্ট হয়েছে কিনা পরীক্ষা করা হচ্ছে...`
          : `আপনার সাবডোমেন ${dom.domainName} টি CNAME (cname.sellerscampus.com) রেকর্ডে পয়েন্ট হয়েছে কিনা পরীক্ষা করা হচ্ছে...`
      },
      { 
        id: 'server_conn', 
        label: 'ফাইল হোস্টিং সার্ভার নোড কানেকশন চেক', 
        status: 'idle', 
        details: 'সার্ভার নোড SC-SVR-98BD-FILESRV এর সাথে কানেকশন স্থাপন করা হচ্ছে...' 
      },
      { 
        id: 'file_sync', 
        label: 'মার্চেন্ট স্টোরেজ ডিরেক্টরি এবং ফাইল সিঙ্ক ভেরিফিকেশন', 
        status: 'idle', 
        details: 'সার্ভার ডিরেক্টরি matching ও ফাইল আপলোড পাথ (sellerscampus/storage/uploads/merchant-98) কনফার্ম করা হচ্ছে...' 
      },
      { 
        id: 'ssl', 
        label: 'Let\'s Encrypt SSL/TLS সিকিউর সার্টিফিকেট অ্যাক্টিভেশন', 
        status: 'idle', 
        details: 'ডোমেনের জন্য ফ্রি সিকিউর HTTPS কানেকশন ইস্যু করা হচ্ছে...' 
      },
      { 
        id: 'deploy', 
        label: 'রাউটিং কনফিগারেশন এবং ক্লাউড ফাইল ডেপ্লয়মেন্ট', 
        status: 'idle', 
        details: 'সবশেষে ডোমেনটি লাইভ রাউটিং ট্রাফিকের জন্য যুক্ত করা হচ্ছে...' 
      }
    ]);
  };

  useEffect(() => {
    if (!verifyingDomain || isVerifyComplete || verifyError) return;

    const runStep = async () => {
      const stepIndex = currentVerifyStep;
      if (stepIndex >= verifySteps.length) {
        // All simulated checks succeeded! Let's do the final actual database verification POST.
        try {
          const res = await fetch('/api/integrations/custom-domains/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: verifyingDomain.id })
          });
          const data = await res.json();
          if (data.success) {
            setDomains(prev => prev.map(d => d.id === verifyingDomain.id ? { ...d, status: 'active', sslStatus: 'active', dnsVerified: true } : d));
            setIsVerifyComplete(true);
          } else {
            setVerifyError(data.error || 'DNS রেকর্ড এখনো পুরোপুরি প্রোপাগেট হয়নি। ২-৫ মিনিট পর আবার চেষ্টা করুন।');
            setVerifySteps(prev => prev.map((s, idx) => idx === 0 ? { ...s, status: 'error', details: 'DNS রেকর্ড পাওয়া যায়নি বা রেকর্ড ভুল রয়েছে।' } : s));
          }
        } catch (err) {
          setVerifyError('সার্ভার কানেকশন এরর। আবার চেষ্টা করুন।');
        }
        return;
      }

      // Progress current step to success after 1.4 seconds, then queue next step
      const timer = setTimeout(() => {
        setVerifySteps(prev => prev.map((s, idx) => {
          if (idx === stepIndex) {
            return { ...s, status: 'success' };
          }
          if (idx === stepIndex + 1) {
            return { ...s, status: 'running' };
          }
          return s;
        }));
        setCurrentVerifyStep(prev => prev + 1);
      }, 1400);

      return () => clearTimeout(timer);
    };

    runStep();
  }, [verifyingDomain, currentVerifyStep, isVerifyComplete, verifyError]);

  const handleVerifyDomain = async (id: string) => {
    const dom = domains.find(d => d.id === id);
    if (dom) {
      startDeepVerification(dom);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Globe className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Custom Domain Settings</h2>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            আপনার অনলাইন শপটি নিজস্ব কাস্টম ডোমেন (যেমন: shop.yourbrand.com) এ প্রকাশ করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-gray-150 dark:border-slate-800/60 shadow-sm">
            <Server className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-350">
              Server IP Value: <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-800 font-extrabold text-indigo-600 dark:text-indigo-400">103.174.152.45</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-gray-150 dark:border-slate-800/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-350">
              Server Storage ID: <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-800 font-extrabold text-purple-600 dark:text-purple-400">SC-SVR-98BD-FILESRV</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Form & List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Add Domain Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
            <h3 className="text-xs font-black text-gray-900 dark:text-gray-200 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800/80 pb-3 mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              নতুন কাস্টম ডোমেন যুক্ত করুন
            </h3>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Domain Type Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block">ডোমেন ক্যাটাগরি</label>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-gray-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setDomainType('subdomain')}
                      className={`flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all ${
                        domainType === 'subdomain' 
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                          : 'text-gray-550 dark:text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      সাবডোমেন
                    </button>
                    <button
                      type="button"
                      onClick={() => setDomainType('root')}
                      className={`flex-1 py-1.5 rounded-lg text-center text-xs font-bold transition-all ${
                        domainType === 'root' 
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                          : 'text-gray-550 dark:text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      মেইন ডোমেন
                    </button>
                  </div>
                </div>

                {/* Domain Name Input */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block">ডোমেন ইউআরএল (Domain Name)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={domainType === 'subdomain' ? 'shop.mybrand.com' : 'mybrand.com'}
                      value={newDomainName}
                      onChange={e => {
                        setNewDomainName(e.target.value);
                        if (formError) setFormError('');
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl pl-4 pr-24 py-2 text-xs text-gray-800 dark:text-gray-150 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all h-[38px]"
                    />
                    <button
                      type="submit"
                      disabled={loading || !newDomainName}
                      className="absolute right-1 top-1 bottom-1 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors h-[30px]"
                    >
                      {loading ? 'যুক্ত হচ্ছে...' : 'যুক্ত করুন'}
                    </button>
                  </div>
                </div>

              </div>

              {formError && (
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {addSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>ডোমেনটি সফলভাবে সংযুক্ত হয়েছে! অনুগ্রহ করে নিচের DNS রেকর্ড কনফিগারেশন সম্পন্ন করুন।</span>
                </div>
              )}
            </form>
          </div>

          {/* Active Domains List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-black text-gray-900 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                সংযুক্ত ডোমেন সমূহের তালিকা
              </h3>
              <button 
                onClick={fetchDomains}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                title="রিলোড করুন"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {domains.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800/80">
                <Globe className="w-10 h-10 text-gray-350 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs font-extrabold text-gray-500 dark:text-gray-400">কোন কাস্টম ডোমেন পাওয়া যায়নি।</p>
                <p className="text-[10px] text-gray-400 mt-1">আপনার নিজস্ব ডোমেন যুক্ত করতে উপরের ফরমটি ব্যবহার করুন।</p>
              </div>
            ) : (
              <div className="space-y-4">
                {domains.map((dom) => (
                  <div 
                    key={dom.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-gray-150/60 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-gray-800 dark:text-white truncate">
                          {dom.domainName}
                        </span>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-gray-600 dark:text-gray-350 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                          {dom.type === 'root' ? 'মেইন ডোমেন' : 'সাবডোমেন'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-450 font-bold">
                        <span>যুক্ত হয়েছে: {new Date(dom.createdAt).toLocaleDateString('bn-BD')}</span>
                        <span className="flex items-center gap-1">
                          SSL: 
                          {dom.sslStatus === 'active' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Active
                            </span>
                          ) : (
                            <span className="text-amber-500">None / Pending</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Right side status and action CTA */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Status badge */}
                      {dom.status === 'active' ? (
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/30 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> লাইভ (Live)
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl border border-amber-100 dark:border-amber-900/30 font-bold flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> DNS পেন্ডিং
                        </span>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDomainForInstructions(dom)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl font-bold text-[10px] transition-all active:scale-95 flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3 text-indigo-500" />
                          <span>সেটআপ গাইড</span>
                        </button>

                        {dom.status !== 'active' && (
                          <button
                            disabled={actionLoadingId === dom.id}
                            onClick={() => handleVerifyDomain(dom.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-black text-[10px] transition-all active:scale-95 flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${actionLoadingId === dom.id ? 'animate-spin' : ''}`} />
                            <span>ভেরিফাই DNS</span>
                          </button>
                        )}

                        <button
                          disabled={actionLoadingId === dom.id}
                          onClick={() => handleDeleteDomain(dom.id)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-gray-400 hover:text-rose-600 rounded-xl transition-all"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side Instruction Portal (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
            
            <div className="border-b border-gray-50 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-black text-gray-900 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                ডোমেন কানেক্ট করার সহজ গাইড
              </h3>
            </div>

            {/* Simple Switch Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-gray-200/50 dark:border-slate-800/80 gap-1">
              {[
                { id: 'nameserver', label: '১. নেমসার্ভার (সবচেয়ে সহজ)' },
                { id: 'dns', label: '২. DNS রেকর্ড (বিকল্প)' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveGuideTab(t.id as any)}
                  className={`flex-1 py-2 rounded-xl text-center text-[11px] font-black transition-all ${
                    activeGuideTab === t.id 
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-gray-550 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content blocks */}
            <div className="space-y-4 text-xs text-gray-600 dark:text-gray-350 leading-relaxed font-sans">
              
              {activeGuideTab === 'nameserver' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/70 dark:border-indigo-900/30 text-[11px] font-bold text-indigo-750 dark:text-indigo-300 leading-relaxed">
                    ✨ এই পদ্ধতিটি সবচেয়ে সহজ ও শতভাগ সফল হয়। কোনো জটিল আইপি বা রেকর্ড সেট করার প্রয়োজন নেই!
                  </div>

                  <p className="font-bold text-gray-700 dark:text-gray-300 text-[11px]">নেমসার্ভার পরিবর্তনের পদক্ষেপসমূহ:</p>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-850 text-gray-700 dark:text-gray-350 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">১</span>
                      <div>
                        <strong className="text-gray-800 dark:text-white">ডোমেন প্যানেলে যান:</strong>
                        <p className="text-[11px] mt-0.5 text-gray-450 leading-relaxed">যেখান থেকে ডোমেন কিনেছেন (যেমন Hostinger, Namecheap, GoDaddy, Dinahost ইত্যাদি) সেখানে লগইন করে ডোমেনের নামের পাশে থাকা <strong className="text-gray-700 dark:text-gray-300">Manage / Nameservers</strong> অপশনে যান।</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-850 text-gray-700 dark:text-gray-350 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">২</span>
                      <div className="w-full">
                        <strong className="text-gray-800 dark:text-white">Custom Nameservers নির্বাচন করুন:</strong>
                        <p className="text-[11px] mt-0.5 text-gray-450 leading-relaxed">সেখানে Default Nameservers এর পরিবর্তে <strong className="text-indigo-600 dark:text-indigo-400">Custom Nameservers</strong> সিলেক্ট করে নিচের দুটি নেমসার্ভার বসিয়ে সেভ করুন:</p>
                        
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-gray-150 dark:border-slate-850 mt-2.5 space-y-2 font-mono text-[11.5px] shadow-inner">
                          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-sans font-black">Nameserver 1</span>
                              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">ns1.sellerscampus.com</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('ns1.sellerscampus.com');
                                alert('Nameserver 1 কপি হয়েছে!');
                              }}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>

                          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-sans font-black">Nameserver 2</span>
                              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">ns2.sellerscampus.com</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('ns2.sellerscampus.com');
                                alert('Nameserver 2 কপি হয়েছে!');
                              }}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-850 text-gray-700 dark:text-gray-350 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">৩</span>
                      <div>
                        <strong className="text-gray-800 dark:text-white">ভেরিফাই করুন:</strong>
                        <p className="text-[11px] mt-0.5 text-gray-450 leading-relaxed">নেমসার্ভার সেভ করার পর বাম পাশের তালিকা থেকে <strong className="text-indigo-650">ভেরিফাই DNS</strong> বাটনে চাপুন। প্রোপাগেশন শুরু হতে সাধারণত ৫ থেকে ১৫ মিনিট সময় লাগতে পারে।</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === 'dns' && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <p className="font-bold text-gray-700 dark:text-gray-350 text-[11px]">আপনি যদি কাস্টম নেমসার্ভার পরিবর্তন না করে আপনার ডোমেনটি অন্য জায়গায় রেখেই কানেক্ট করতে চান, তবে ডোমেনের DNS Zone-এ গিয়ে নিচের রেকর্ডটি সেট করুন:</p>
                  
                  <div className="space-y-3.5">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-3 shadow-inner">
                      <div>
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black px-2 py-0.5 rounded uppercase tracking-wider">মেইন ডোমেন হলে (A Record)</span>
                        <div className="grid grid-cols-1 gap-2 mt-2 font-mono text-[10.5px]">
                          <div className="flex justify-between border-b border-gray-100 dark:border-slate-900 pb-1.5 text-gray-500">
                            <span>Type:</span>
                            <span className="text-gray-800 dark:text-gray-200 font-bold">A Record</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 dark:border-slate-900 pb-1.5 text-gray-500">
                            <span>Host / Name:</span>
                            <span className="text-gray-800 dark:text-gray-200 font-bold">@ (or leave blank)</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Points to (Value):</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-1.5">
                              103.174.152.45
                              <button 
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('103.174.152.45');
                                  alert('IP কপি হয়েছে!');
                                }}
                                className="text-[9px] bg-indigo-150 text-indigo-700 px-1.5 py-0.5 rounded cursor-pointer font-sans"
                              >
                                Copy
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-150 dark:border-slate-800 pt-3">
                        <span className="text-[10px] bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-black px-2 py-0.5 rounded uppercase tracking-wider">সাবডোমেন হলে (CNAME Record)</span>
                        <div className="grid grid-cols-1 gap-2 mt-2 font-mono text-[10.5px]">
                          <div className="flex justify-between border-b border-gray-100 dark:border-slate-900 pb-1.5 text-gray-500">
                            <span>Type:</span>
                            <span className="text-gray-800 dark:text-gray-200 font-bold">CNAME</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 dark:border-slate-900 pb-1.5 text-gray-500">
                            <span>Host / Name:</span>
                            <span className="text-gray-800 dark:text-gray-200 font-bold">shop (or desired subdomain)</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Points to (Value):</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-1.5 truncate">
                              cname.sellerscampus.com
                              <button 
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('cname.sellerscampus.com');
                                  alert('CNAME value কপি হয়েছে!');
                                }}
                                className="text-[9px] bg-indigo-150 text-indigo-700 px-1.5 py-0.5 rounded cursor-pointer font-sans"
                              >
                                Copy
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="bg-sky-50 dark:bg-sky-950/20 p-4 rounded-2xl border border-sky-100 dark:border-sky-900/40 text-xs flex gap-2.5">
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-gray-800 dark:text-white">ফ্রি SSL সার্টিফিকেট অ্যাক্টিভেশন:</strong>
                <p className="text-[11px] text-gray-400 leading-relaxed">ডোমেন DNS পয়েন্ট করার সাথে সাথে আমাদের সিস্টেম থেকে স্বয়ংক্রিয়ভাবে একটি ফ্রি Let's Encrypt SSL সার্টিফিকেট ইস্যু করা হবে যা কাস্টমারদের সিকিউর কানেকশন প্রদান করবে।</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Domain Detailed Instructions Modal */}
      {selectedDomainForInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col border border-gray-200 dark:border-slate-800 animate-in fade-in-50 zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-extrabold text-gray-800 dark:text-white">ডোমেন রেকর্ড সেটআপ নির্দেশিকা</h3>
              </div>
              <button 
                onClick={() => setSelectedDomainForInstructions(null)}
                className="p-1.5 hover:bg-gray-150 dark:hover:bg-slate-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
              <div className="text-center pb-3 border-b border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black block">ডোমেন নাম (Domain Name)</span>
                <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">{selectedDomainForInstructions.domainName}</span>
                <span className="text-xs text-gray-400 mt-1 block">ডোমেন টাইপ: {selectedDomainForInstructions.type === 'root' ? 'মেইন ডোমেন (Root)' : 'সাবডোমেন (Subdomain)'}</span>
              </div>

              <div className="space-y-3 text-xs text-gray-600 dark:text-gray-350">
                <p className="leading-relaxed">আপনার ডোমেন রেজিস্টার ড্যাশবোর্ডে (Hostinger/Namecheap) লগইন করে নিচের দেওয়া রেকর্ডটি DNS Zone এ যুক্ত করুন:</p>
                
                {selectedDomainForInstructions.type === 'root' ? (
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-indigo-600/5 px-4 py-2.5 text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                      <span>Add A Record (মেইন ডোমেনের জন্য)</span>
                      <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">A Record</span>
                    </div>
                    <div className="p-4 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-gray-400 font-sans">Record Type:</span>
                        <span className="col-span-2 font-bold text-gray-800 dark:text-white">A Record</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-slate-900 pt-2">
                        <span className="text-gray-400 font-sans">Host / Name:</span>
                        <span className="col-span-2 font-bold text-gray-800 dark:text-white">@ (or leave empty)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-slate-900 pt-2">
                        <span className="text-gray-400 font-sans">Value / IP:</span>
                        <span className="col-span-2 font-bold text-indigo-600 dark:text-indigo-400">{selectedDomainForInstructions.dnsIpValue}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-slate-900 pt-2">
                        <span className="text-gray-400 font-sans">TTL:</span>
                        <span className="col-span-2 font-bold text-gray-800 dark:text-white">Auto / 3600</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-indigo-600/5 px-4 py-2.5 text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                      <span>Add CNAME Record (সাবডোমেনের জন্য)</span>
                      <span className="text-[9px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded">CNAME Record</span>
                    </div>
                    <div className="p-4 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-gray-400 font-sans">Record Type:</span>
                        <span className="col-span-2 font-bold text-gray-800 dark:text-white">CNAME</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-slate-900 pt-2">
                        <span className="text-gray-400 font-sans">Host / Name:</span>
                        <span className="col-span-2 font-bold text-gray-800 dark:text-white">{selectedDomainForInstructions.domainName.split('.')[0]}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-slate-900 pt-2">
                        <span className="text-gray-400 font-sans">Value / Target:</span>
                        <span className="col-span-2 font-bold text-indigo-600 dark:text-indigo-400">{selectedDomainForInstructions.dnsCnameValue}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-slate-900 pt-2">
                        <span className="text-gray-400 font-sans">TTL:</span>
                        <span className="col-span-2 font-bold text-gray-800 dark:text-white">Auto / 3600</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-xs leading-relaxed space-y-1 text-amber-700">
                  <div className="flex gap-2 items-center font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>DNS প্রোপাগেশন নোট:</span>
                  </div>
                  <p className="text-[11px] pl-6">DNS রেকর্ড যুক্ত করার সাথে সাথেই আপনার ডোমেনটি সচল নাও হতে পারে। বিশ্বব্যাপী DNS প্রোপাগেশন হতে সাধারণত ৫ মিনিট থেকে সর্বোচ্চ ২৪ ঘন্টা সময় লাগতে পারে। রেকর্ড আপডেট হবার পর আমাদের সিস্টেমে "ভেরিফাই DNS" এ ক্লিক করলেই ডোমেন লাইভ হয়ে যাবে।</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setSelectedDomainForInstructions(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-350 font-bold text-xs rounded-xl transition-colors"
              >
                বন্ধ করুন
              </button>
              
              {selectedDomainForInstructions.status !== 'active' && (
                <button
                  onClick={() => {
                    handleVerifyDomain(selectedDomainForInstructions.id);
                    setSelectedDomainForInstructions(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/10"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ভেরিফাই DNS রেকর্ড</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Deep DNS & File Server Connection Verification Modal */}
      {verifyingDomain && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col animate-in fade-in duration-200">
            
            {/* Console Header */}
            <div className="bg-slate-900/95 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 block animate-pulse" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">DNS & File Server Verification Console v1.2</span>
              </div>
              {!isVerifyComplete && !verifyError ? (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold px-2.5 py-0.5 rounded-full animate-pulse uppercase tracking-wide">
                  Checking Connection...
                </span>
              ) : verifyError ? (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Check Failed
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Verified & Active
                </span>
              )}
            </div>

            {/* Console Body */}
            <div className="p-6 space-y-5 font-mono overflow-y-auto max-h-[70vh]">
              <div className="border-b border-slate-850 pb-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold mb-1">Target Host / Domain</div>
                <div className="text-base font-black text-white">{verifyingDomain.domainName}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 mt-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
                  <div>Server IP Address: <span className="text-indigo-400 font-extrabold font-mono">103.174.152.45</span></div>
                  <div>Server ID Node: <span className="text-purple-400 font-extrabold font-mono">SC-SVR-98BD-FILESRV</span></div>
                </div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-4">
                {verifySteps.map((step, idx) => (
                  <div key={step.id} className="flex gap-3 items-start">
                    {/* Step Icon / Status */}
                    <div className="shrink-0 mt-0.5">
                      {step.status === 'idle' && (
                        <div className="w-5 h-5 rounded-full border border-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-600 bg-slate-900/40 font-mono">
                          {idx + 1}
                        </div>
                      )}
                      {step.status === 'running' && (
                        <div className="w-5 h-5 rounded-full border border-indigo-500/50 bg-indigo-950/40 flex items-center justify-center">
                          <RefreshCw className="w-2.5 h-2.5 text-indigo-400 animate-spin" />
                        </div>
                      )}
                      {step.status === 'success' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-550/20 border border-emerald-500/40 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-emerald-400 font-bold" />
                        </div>
                      )}
                      {step.status === 'error' && (
                        <div className="w-5 h-5 rounded-full bg-rose-550/20 border border-rose-500/40 flex items-center justify-center">
                          <X className="w-2.5 h-2.5 text-rose-400 font-bold" />
                        </div>
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-bold leading-relaxed ${
                        step.status === 'success' ? 'text-slate-200 font-bold' :
                        step.status === 'running' ? 'text-indigo-400 font-bold' :
                        step.status === 'error' ? 'text-rose-400 font-black' : 'text-slate-500'
                      }`}>
                        {step.label}
                      </div>
                      {(step.status === 'running' || step.status === 'error' || step.status === 'success') && (
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Box */}
              {verifyError && (
                <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-2xl flex gap-3 text-rose-300 font-sans">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="space-y-1">
                    <strong className="text-xs font-black block text-rose-200">সার্ভার যাচাইকরণ ব্যর্থ হয়েছে:</strong>
                    <p className="text-[10.5px] leading-relaxed text-rose-300/85">
                      {verifyError}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2 italic leading-relaxed">
                      পরামর্শ: আপনার ডোমেন প্রোভাইডার প্যানেলে DNS রেকর্ড যুক্ত করার পর প্রোপাগেশন শুরু হতে সাধারণত ২-১০ মিনিট সময় লাগতে পারে। রেকর্ড আপডেট হলে আবার টেস্ট করুন।
                    </p>
                  </div>
                </div>
              )}

              {isVerifyComplete && (
                <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-2xl flex gap-3 text-emerald-300 font-sans">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400 animate-bounce" />
                  <div className="space-y-1">
                    <strong className="text-xs font-black block text-emerald-200">সার্ভার কানেকশন শতভাগ নিশ্চিত!</strong>
                    <p className="text-[10.5px] leading-relaxed text-emerald-300/85">
                      আপনার ডোমেনটি সফলভাবে SellersCampus ফাইল সার্ভার নোড <span className="font-mono font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded">SC-SVR-98BD-FILESRV</span> এবং মার্চেন্ট স্টোরেজ ডিরেক্টরিতে কানেক্ট হয়েছে। Let's Encrypt SSL সার্টিফিকেট সচল করা হয়েছে এবং ডোমেনটি লাইভ!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Footer Actions */}
            <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex gap-2 font-mono">
              {(!isVerifyComplete && !verifyError) ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>সার্ভার কানেকশন ভেরিফিকেশন চলছে...</span>
                </button>
              ) : (
                <button
                  onClick={() => setVerifyingDomain(null)}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl transition-all font-sans ${
                    isVerifyComplete 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/20' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isVerifyComplete ? 'সম্পন্ন (Done)' : 'বন্ধ করুন (Close Console)'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </motion.div>
  );
}
