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
  const [activeGuideTab, setActiveGuideTab] = useState<'general' | 'namecheap' | 'hostinger' | 'cloudflare'>('general');
  
  // Selected domain to show detailed instructions
  const [selectedDomainForInstructions, setSelectedDomainForInstructions] = useState<CustomDomain | null>(null);

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

  const handleVerifyDomain = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch('/api/integrations/custom-domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        // Update domains list locally
        setDomains(prev => prev.map(d => d.id === id ? { ...d, status: 'active', sslStatus: 'active', dnsVerified: true } : d));
        alert('অভিনন্দন! আপনার ডোমেনের DNS রেকর্ড সফলভাবে ভেরিফাই করা হয়েছে এবং SSL সচল করা হয়েছে। 🎉');
      } else {
        alert(data.error || 'DNS রেকর্ড এখনো আপডেট হয়নি। অনুগ্রহ করে ২-৫ মিনিট পর আবার চেষ্টা করুন।');
      }
    } catch (err) {
      console.error(err);
      alert('ভেরিফিকেশন প্রসেস করতে ব্যর্থ হয়েছে।');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Globe className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Custom Domain Settings</h2>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            আপনার অনলাইন শপটি নিজস্ব কাস্টম ডোমেন (যেমন: shop.yourbrand.com) এ প্রকাশ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-gray-150 dark:border-slate-800/60">
          <Server className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-350">
            Fulfillment Server IP: <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-800 font-extrabold text-indigo-600 dark:text-indigo-400">103.174.152.45</span>
          </span>
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
                DNS রেকর্ড কনফিগারেশন গাইড
              </h3>
            </div>

            {/* Provider Switch Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-gray-200/50 dark:border-slate-800/80 flex-wrap gap-1">
              {[
                { id: 'general', label: 'সাধারন নিয়ম' },
                { id: 'hostinger', label: 'Hostinger' },
                { id: 'namecheap', label: 'Namecheap' },
                { id: 'cloudflare', label: 'Cloudflare' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveGuideTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-center text-[10.5px] font-black transition-all ${
                    activeGuideTab === t.id 
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content blocks */}
            <div className="space-y-4 text-xs text-gray-600 dark:text-gray-350 leading-relaxed font-sans">
              
              {activeGuideTab === 'general' && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                  <p className="font-bold">কাস্টম ডোমেন সংযুক্ত করার সাধারণ পদক্ষেপ সমূহ:</p>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-[11px] shrink-0 mt-0.5">১</span>
                      <div>
                        <strong className="text-gray-800 dark:text-white">আপনার ডোমেন ড্যাশবোর্ডে লগইন করুন:</strong>
                        <p className="text-[11px] mt-0.5 text-gray-400">যেখান থেকে ডোমেন কিনেছেন (যেমন Hostinger, Namecheap) সেখানে লগইন করে DNS Zone Editor অথবা DNS Management এ যান।</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-[11px] shrink-0 mt-0.5">২</span>
                      <div>
                        <strong className="text-gray-800 dark:text-white">সঠিক DNS রেকর্ড যুক্ত করুন:</strong>
                        <p className="text-[11px] mt-0.5 text-gray-400">আপনার ডোমেনের ধরন অনুযায়ী নিচের একটি রেকর্ড যুক্ত করুন:</p>
                        
                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-gray-150 dark:border-slate-850 mt-2 space-y-1.5 font-mono text-[10px]">
                          <div>
                            <span className="font-bold text-indigo-600">মেইন ডোমেন (A Record):</span>
                            <div className="grid grid-cols-3 mt-1 text-gray-500">
                              <span>Type: <strong>A</strong></span>
                              <span>Host: <strong>@</strong></span>
                              <span className="truncate">Value: <strong>103.174.152.45</strong></span>
                            </div>
                          </div>
                          <div className="border-t border-gray-150 dark:border-slate-850 pt-1.5">
                            <span className="font-bold text-sky-500">সাবডোমেন (CNAME):</span>
                            <div className="grid grid-cols-3 mt-1 text-gray-500">
                              <span>Type: <strong>CNAME</strong></span>
                              <span>Host: <strong>shop</strong></span>
                              <span className="truncate">Value: <strong>cname.sellerscampus.com</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-[11px] shrink-0 mt-0.5">৩</span>
                      <div>
                        <strong className="text-gray-800 dark:text-white">ভেরিফাই করুন:</strong>
                        <p className="text-[11px] mt-0.5 text-gray-400"> রেকর্ড অ্যাড করার পর "ভেরিফাই DNS" বাটনে ক্লিক করুন। DNS আপডেট হতে সাধারণত ২ মিনিট থেকে সর্বোচ্চ ২৪ ঘন্টা সময় লাগতে পারে।</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeGuideTab === 'hostinger' && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                    <span>Hostinger DNS Setup Step-by-Step</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-2.5 text-gray-500 dark:text-gray-400 text-[11px]">
                    <li>Hostinger hPanel ড্যাশবোর্ডে লগইন করুন।</li>
                    <li>মেনু থেকে <strong>Domains</strong> অপশনে ক্লিক করে আপনার ডোমেনটি সিলেক্ট করুন।</li>
                    <li>বাম পাশের মেনু থেকে <strong>DNS / Nameservers</strong> এ ক্লিক করুন।</li>
                    <li><strong>Manage DNS records</strong> সেকশনে গিয়ে নতুন রেকর্ড যুক্ত করুন:
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-gray-700 dark:text-gray-300 font-mono text-[10px]">
                        <li>সাবডোমেন হলে: Type CNAME, Name: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">shop</span>, Target: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">cname.sellerscampus.com</span></li>
                        <li>মেইন ডোমেন হলে: Type A, Name: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">@</span>, Points to: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">103.174.152.45</span></li>
                      </ul>
                    </li>
                    <li>রেকর্ডটি যুক্ত করতে <strong>Add Record</strong> বাটনে ক্লিক করুন।</li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'namecheap' && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-1.5 text-orange-600 font-black">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                    <span>Namecheap DNS Setup Step-by-Step</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-2.5 text-gray-500 dark:text-gray-400 text-[11px]">
                    <li>Namecheap ড্যাশবোর্ডে লগইন করুন।</li>
                    <li>ডোমেন তালিকার পাশে থাকা <strong>MANAGE</strong> বাটনে ক্লিক করুন।</li>
                    <li>উপরের ট্যাব থেকে <strong>Advanced DNS</strong> ট্যাবে যান।</li>
                    <li><strong>DNS-Manager</strong> সেকশনে <strong>ADD NEW RECORD</strong> এ ক্লিক করুন:
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-gray-700 dark:text-gray-300 font-mono text-[10px]">
                        <li>সাবডোমেন হলে: CNAME Record, Host: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">shop</span>, Value: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">cname.sellerscampus.com</span></li>
                        <li>মেইন ডোমেন হলে: A Record, Host: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">@</span>, Value: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">103.174.152.45</span></li>
                      </ul>
                    </li>
                    <li>সবশেষে টিক চিহ্নে ক্লিক করে রেকর্ডটি সেভ করুন।</li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'cloudflare' && (
                <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-1.5 text-sky-500 font-black">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                    <span>Cloudflare DNS Setup Step-by-Step</span>
                  </div>
                  <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-150 dark:border-amber-900/30 font-bold leading-relaxed">
                    ⚠️ গুরুত্বপূর্ণ: Cloudflare এ রেকর্ড যুক্ত করার সময় অবশ্যই <strong>Proxy Status "DNS Only" (Grey Cloud)</strong> সিলেক্ট করবেন। Proxy "Proxied" (Orange Cloud) থাকলে SSL ইস্যু হতে সমস্যা হতে পারে।
                  </p>
                  <ol className="list-decimal pl-4 space-y-2.5 text-gray-500 dark:text-gray-400 text-[11px]">
                    <li>Cloudflare এ লগইন করে আপনার ডোমেন সিলেক্ট করুন।</li>
                    <li>বাম পাশের সাইডবার থেকে <strong>DNS</strong> সেকশনে ক্লিক করুন।</li>
                    <li><strong>Add Record</strong> এ ক্লিক করুন:
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-gray-700 dark:text-gray-300 font-mono text-[10px]">
                        <li>Type CNAME, Name: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">shop</span>, Target: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">cname.sellerscampus.com</span></li>
                        <li>Type A, Name: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">@</span>, IPv4 address: <span className="bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border">103.174.152.45</span></li>
                      </ul>
                    </li>
                    <li>Proxy Status সুইচটি বন্ধ করে <strong>DNS Only</strong> করুন।</li>
                    <li><strong>Save</strong> বাটনে ক্লিক করে রেকর্ডটি সংরক্ষণ করুন।</li>
                  </ol>
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

    </motion.div>
  );
}
