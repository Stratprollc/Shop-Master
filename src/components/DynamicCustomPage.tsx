import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import RoleUserCustomPage from './RoleUserCustomPage';
import PersonalHisab from './PersonalHisab';

interface DynamicCustomPageProps {
  activeTab: string;
  user: any;
  shopSettings: any;
  setNotification: any;
  onRefreshSettings: () => void;
}

export default function DynamicCustomPage({
  activeTab,
  user,
  shopSettings,
  setNotification,
  onRefreshSettings
}: DynamicCustomPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [contentHtml, setContentHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load custom content for this page from shopSettings
  useEffect(() => {
    const savedContent = shopSettings?.customPageContents?.[activeTab] || '';
    setContentHtml(savedContent);
    setIsEditing(false);
  }, [activeTab, shopSettings]);

  // Find page config from sections
  const pageConfig = (() => {
    const sections = shopSettings?.sidebarConfig?.sections || [];
    for (const s of sections) {
      for (const item of (s.items || [])) {
        if (item.id === activeTab) return item;
        if (item.subItems) {
          for (const sub of item.subItems) {
            if (sub.id === activeTab) return sub;
          }
        }
      }
    }
    return null;
  })();

  const label = pageConfig?.label || activeTab;
  const labelBn = pageConfig?.label_bn || '';
  const iconName = pageConfig?.iconName || 'FileText';
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.FileText;

  const handleSaveContent = async () => {
    if (!user?.shopId) return;
    setIsSaving(true);
    try {
      const contents = shopSettings?.customPageContents || {};
      const updatedContents = {
        ...contents,
        [activeTab]: contentHtml
      };

      const shopRef = doc(db, 'settings', user.shopId);
      await updateDoc(shopRef, {
        customPageContents: updatedContents
      });

      setNotification({
        type: 'success',
        message: shopSettings?.systemLanguage === 'bn' 
          ? 'পেইজের কনটেন্ট সফলভাবে ডাটাবেজে সেভ হয়েছে!' 
          : 'Page content successfully saved to database!'
      });
      setIsEditing(false);
      if (onRefreshSettings) onRefreshSettings();
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to save page content.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().trim() === 'stratproamz@gmail.com';

  const isHisabPage = 
    activeTab.toLowerCase().includes('hisab') || 
    activeTab.toLowerCase().includes('hishab') || 
    activeTab.toLowerCase().includes('ledger') || 
    activeTab.toLowerCase().includes('accounting') || 
    activeTab.toLowerCase().includes('personal') || 
    label.toLowerCase().includes('hisab') || 
    label.toLowerCase().includes('hishab') || 
    label.toLowerCase().includes('ledger') || 
    label.toLowerCase().includes('accounting') || 
    label.toLowerCase().includes('personal') || 
    labelBn.includes('হিসাব') || 
    labelBn.includes('ব্যক্তিগত') || 
    contentHtml.includes('[PERSONAL_HISAB_DASHBOARD_ACTIVE]') ||
    !contentHtml || 
    contentHtml.trim() === '';

  if (!isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-[500px] bg-white dark:bg-slate-950 p-4 md:p-6 relative rounded-3xl"
      >
        {activeTab === 'role_user' ? (
          <RoleUserCustomPage 
            user={user} 
            shopSettings={shopSettings} 
            setNotification={setNotification} 
          />
        ) : isHisabPage ? (
          <PersonalHisab 
            user={user} 
            shopSettings={shopSettings} 
            setNotification={setNotification} 
          />
        ) : !contentHtml ? (
          <div className="flex flex-col items-center justify-center min-h-[450px] p-6 md:p-12 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <LucideIcons.Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-gray-150 tracking-tight">
              {shopSettings?.systemLanguage === 'bn' ? 'কাস্টম পেইজ সেটআপ করুন' : 'Setup Your Custom Page'}
            </h2>
            <p className="text-xs text-gray-500 max-w-md mt-2 mb-8 leading-relaxed font-semibold">
              {shopSettings?.systemLanguage === 'bn' 
                ? 'এই কাস্টম পেইজটি এখন সম্পূর্ণ খালি আছে। আপনি চাইলে এক ক্লিকে রিয়েল-টাইম "পার্সোনাল হিসাব-নিকাশ ড্যাশবোর্ড" চালু করতে পারেন অথবা নিজের মতো করে পেইজটি ডিজাইন করতে পারেন।' 
                : 'This custom page is currently blank. You can activate the real-time "Personal Hisab Dashboard" instantly, or design custom HTML content.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full">
              <button
                type="button"
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const contents = shopSettings?.customPageContents || {};
                    const updatedContents = {
                      ...contents,
                      [activeTab]: '[PERSONAL_HISAB_DASHBOARD_ACTIVE]'
                    };
                    const shopRef = doc(db, 'settings', user.shopId);
                    await updateDoc(shopRef, {
                      customPageContents: updatedContents
                    });
                    setContentHtml('[PERSONAL_HISAB_DASHBOARD_ACTIVE]');
                    setNotification({
                      type: 'success',
                      message: shopSettings?.systemLanguage === 'bn' 
                        ? 'পার্সোনাল হিসাব-নিকাশ ড্যাশবোর্ড সফলভাবে চালু হয়েছে!' 
                        : 'Personal Hisab Dashboard activated successfully!'
                    });
                    if (onRefreshSettings) onRefreshSettings();
                  } catch (err: any) {
                    console.error(err);
                    setNotification({ type: 'error', message: err.message });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="flex flex-col items-center p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-center hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <LucideIcons.Calculator className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  {shopSettings?.systemLanguage === 'bn' ? 'পার্সোনাল হিসাব-নিকাশ' : 'Personal Hisab Ledger'}
                </span>
                <span className="text-[10px] text-gray-400 font-medium mt-1">
                  {shopSettings?.systemLanguage === 'bn' ? 'মাল্টি-ওয়ালেট ও ধার-দেনা ট্র্যাকার' : 'Multi-wallet & debt tracker'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex flex-col items-center p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-center hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <LucideIcons.Code className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  {shopSettings?.systemLanguage === 'bn' ? 'কাস্টম ডিজাইন (HTML)' : 'Custom HTML Design'}
                </span>
                <span className="text-[10px] text-gray-400 font-medium mt-1">
                  {shopSettings?.systemLanguage === 'bn' ? 'নিজের মতো টেক্সট বা নোটিশ সাজান' : 'Write custom text or HTML'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}

        {/* Subtle, beautiful floating edit button for admins */}
        {isAdmin && activeTab !== 'role_user' && !isHisabPage && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            title={shopSettings?.systemLanguage === 'bn' ? 'পেইজ সাজান' : 'Customize Page'}
          >
            <LucideIcons.Edit3 className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">
              {shopSettings?.systemLanguage === 'bn' ? 'পেইজ সাজান' : 'Customize Page'}
            </span>
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      {/* Header card with beautiful gradient matching dashboard standard */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100/40">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                  {shopSettings?.systemLanguage === 'bn' && labelBn ? labelBn : label}
                </h1>
                {labelBn && labelBn !== label && (
                  <span className="text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                    {label}
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1.5 flex items-center gap-1.5 font-mono">
                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold">ROUTE ID: {activeTab}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(false)}
            className="px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400"
          >
            <LucideIcons.X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>

      {/* Editor Block */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
              {shopSettings?.systemLanguage === 'bn' ? 'কনটেন্ট বা নোটিশ লিখুন' : 'Rich HTML / Content Editor'}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
              Support HTML tags for advanced layouts (cards, lists, embed videos, images, text)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveContent}
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              {isSaving ? (
                <>
                  <LucideIcons.RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <LucideIcons.Check className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            placeholder="<div className='p-6 bg-indigo-50 rounded-2xl'><h3>Welcome to our custom portal</h3><p>Enter text or HTML here...</p></div>"
            className="w-full min-h-[350px] p-4 font-mono text-xs border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/80 text-[11px] text-gray-500 space-y-1.5">
          <span className="font-bold uppercase tracking-wider text-gray-400 block text-[9px]">💡 Expert Quick Templates</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => setContentHtml(`<!-- Beautiful Banner and Info -->
<div class="space-y-6">
  <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-sm text-center">
    <h2 class="text-xl font-black uppercase tracking-wide">Notice Board / নোটিশ বোর্ড</h2>
    <p class="text-xs text-indigo-100 mt-2">Check the latest news and guides from store management.</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
      <h3 class="font-bold text-gray-800 dark:text-gray-200 text-sm">Update 1</h3>
      <p class="text-xs text-gray-500 mt-2">Management has enabled automatic data persistence. All shop inventories are synchronized to the cloud.</p>
    </div>
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
      <h3 class="font-bold text-gray-800 dark:text-gray-200 text-sm">Update 2</h3>
      <p class="text-xs text-gray-500 mt-2">Ensure to daily close checkout tallies by clicking on "Daily Closing" menu item before leaving.</p>
    </div>
  </div>
</div>`)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-left hover:border-indigo-400 transition-all font-mono text-[10px] text-gray-500 cursor-pointer"
            >
              📋 Notice Board (বাংলা ও ইংরেজি) Template
            </button>

            <button
              type="button"
              onClick={() => setContentHtml(`<!-- Standard Embed / Form Template -->
<div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm max-w-xl mx-auto space-y-4">
  <div class="text-center">
    <h3 class="font-black text-gray-900 dark:text-white uppercase text-base">Store Contact / Support Form</h3>
    <p class="text-xs text-gray-500">Need help? Get in touch with our operations center immediately.</p>
  </div>
  <div class="space-y-3">
    <div>
      <label class="block text-[10px] font-bold text-gray-400 uppercase">Emergency Support Mobile</label>
      <div class="text-lg font-black text-indigo-600 mt-1">+880 1700-000000</div>
    </div>
    <div>
      <label class="block text-[10px] font-bold text-gray-400 uppercase">Operating Email</label>
      <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">support@yourshop.com</div>
    </div>
  </div>
</div>`)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-left hover:border-indigo-400 transition-all font-mono text-[10px] text-gray-500 cursor-pointer"
            >
              📞 Contact & Emergency Support Template
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Render area (Preview) */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm min-h-[300px]">
        {contentHtml ? (
          <div 
            className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <div className="text-center py-8 text-gray-400 text-xs font-semibold">
            {shopSettings?.systemLanguage === 'bn' ? 'কোনো কন্টেন্ট সাজানো নেই (ফাঁকা সাদা পেইজ)' : 'No content saved yet (Blank white page)'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
