import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Send, 
  Instagram, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Database, 
  Terminal, 
  Check, 
  X, 
  Copy, 
  Zap, 
  Activity, 
  ChevronRight, 
  Clock, 
  Bot, 
  Info, 
  RefreshCw, 
  AlertCircle, 
  Play, 
  Pause, 
  MessageSquare, 
  Trash2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Search,
  Bell
} from 'lucide-react';

interface ShopifyOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: string;
  total: string;
  paymentStatus: 'paid' | 'pending' | 'unpaid';
  syncStatus: 'synced' | 'pending';
  createdAt: string;
}

interface IntegrationLogs {
  id: string;
  source: 'Shopify' | 'Telegram' | 'Instagram' | 'Voice AI';
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export function IntegrationsAddons({ activeSubTab, hideSidebar }: { activeSubTab?: 'shopify' | 'telegram' | 'instagram' | 'voice_ai' | 'logs', hideSidebar?: boolean }) {
  // Tabs within Integrations & Add-ons
  const [subTab, setSubTab] = useState<'shopify' | 'telegram' | 'instagram' | 'voice_ai' | 'logs'>(activeSubTab || 'shopify');

  useEffect(() => {
    if (activeSubTab) {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);
  
  // Shopify state
  const [shopifyDomain, setShopifyDomain] = useState('mystore.myshopify.com');
  const [shopifyToken, setShopifyToken] = useState('shpat_3a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p');
  const [shopifyWebhookSecret, setShopifyWebhookSecret] = useState('whsec_8a7b6c5d4e3f2g1');
  const [isShopifyActive, setIsShopifyActive] = useState(true);
  const [isShopifySyncEnabled, setIsShopifySyncEnabled] = useState(true);
  const [copiedShopifyUrl, setCopiedShopifyUrl] = useState(false);
  const [shopifyOrders, setShopifyOrders] = useState<ShopifyOrder[]>([
    {
      id: 'shp_1',
      orderNumber: '#SHP-4402',
      customerName: 'Ashiqur Rahman',
      customerEmail: 'ashiq@gmail.com',
      customerPhone: '01711223344',
      customerAddress: 'গুলশান ২, ঢাকা',
      items: '1x Premium Panjabi, 1x Cotton Kabli',
      total: '৳ 4,500',
      paymentStatus: 'paid',
      syncStatus: 'synced',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      id: 'shp_2',
      orderNumber: '#SHP-4401',
      customerName: 'Sujon Mahmud',
      customerEmail: 'sujon@gmail.com',
      customerPhone: '01911998877',
      customerAddress: 'ধানমন্ডি, ঢাকা',
      items: '2x Slim Fit Formal Shirt',
      total: '৳ 3,200',
      paymentStatus: 'pending',
      syncStatus: 'synced',
      createdAt: new Date(Date.now() - 120 * 60000).toISOString()
    }
  ]);

  // Shopify Simulator Fields
  const [simShopifyName, setSimShopifyName] = useState('Tasnim Ahmed');
  const [simShopifyPhone, setSimShopifyPhone] = useState('01844556677');
  const [simShopifyAddress, setSimShopifyAddress] = useState('বনানী ব্লক ই, ঢাকা, বাংলাদেশ');
  const [simShopifyItems, setSimShopifyItems] = useState('1x Silk Saree Blue, 1x Designer Kurti');
  const [simShopifyTotal, setSimShopifyTotal] = useState('৳ 6,800');
  const [shopifySimulating, setShopifySimulating] = useState(false);

  // Telegram state
  const [telegramToken, setTelegramToken] = useState('738491823:AAH_g7Klx9L2mdPqZ9XcvB41z9');
  const [isTelegramActive, setIsTelegramActive] = useState(false);
  const [telegramAiAutoReply, setTelegramAiAutoReply] = useState(true);
  const [telegramBotUsername, setTelegramBotUsername] = useState('@ZenderPOS_Bot');
  const [telegramWebhookUrl, setTelegramWebhookUrl] = useState('');
  const [telegramPingStatus, setTelegramPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [telegramMessages, setTelegramMessages] = useState<any[]>([
    { id: 'tg_1', sender: 'user', text: 'আসসালামু আলাইকুম, আপনাদের শপটি কোথায়?', time: '10:15 AM' },
    { id: 'tg_2', sender: 'ai', text: 'ওয়ালাইকুম আসসালাম! আমাদের প্রধান শোরুম ঢাকা মিরপুর ১০-এ অবস্থিত। আপনি চাইলে অনলাইনেও অর্ডার করতে পারেন।', time: '10:15 AM' }
  ]);
  const [simTelegramText, setSimTelegramText] = useState('ভাইয়া, আপনাদের ক্যাটালগটা পাঠানো যাবে?');
  const [telegramSimulating, setTelegramSimulating] = useState(false);

  // Instagram state
  const [instagramAccountId, setInstagramAccountId] = useState('17841405342910485');
  const [instagramPageToken, setInstagramPageToken] = useState('IGQVJYSjdkaEpZAOWRza...SecureToken');
  const [instagramCommentAutoReply, setInstagramCommentAutoReply] = useState(true);
  const [instagramDMAutoReply, setInstagramDMAutoReply] = useState(true);
  const [instagramReplyPrompt, setInstagramReplyPrompt] = useState('জি প্রিয় কাস্টমার, বিস্তারিত জানতে আপনার ইনবক্স (DM) চেক করুন। আমরা প্রাইস ও সাইজ পাঠিয়ে দিয়েছি! 🌸');
  const [instagramComments, setInstagramComments] = useState<any[]>([
    { id: 'ig_1', author: 'nusrat_jahan', comment: 'Price of the blue saree please?', replied: true, time: '10 mins ago' },
    { id: 'ig_2', author: 'kamrul_hasan', comment: 'অর্ডার করতে চাই', replied: true, time: '25 mins ago' }
  ]);
  const [simInstagramAuthor, setSimInstagramAuthor] = useState('sadia_mimi');
  const [simInstagramComment, setSimInstagramComment] = useState('পাঞ্জাবিটার প্রাইস কত? সাইজ ৪০ হবে?');
  const [instagramSimulating, setInstagramSimulating] = useState(false);

  // Voice AI states
  const [voiceLanguage, setVoiceLanguage] = useState<'bn' | 'en' | 'hn'>('bn');
  const [voiceProvider, setVoiceProvider] = useState<'gemini' | 'whisper'>('gemini');
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [isVoiceAiActive, setIsVoiceAiActive] = useState(true);
  const [voiceRecordingState, setVoiceRecordingState] = useState<'idle' | 'recording' | 'translating' | 'done'>('idle');
  const [voiceTranslationText, setVoiceTranslationText] = useState('');
  const [voiceAiThoughts, setVoiceAiThoughts] = useState<string[]>([]);
  const [voiceAiReplyText, setVoiceAiReplyText] = useState('');
  const [isPlayingSynthReply, setIsPlayingSynthReply] = useState(false);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState(0);

  // Dynamic logs state
  const [logs, setLogs] = useState<IntegrationLogs[]>([
    { id: 'log_1', source: 'Shopify', type: 'info', message: 'Shopify webhooks initialized for order.created endpoint.', timestamp: '10:00:02 AM' },
    { id: 'log_2', source: 'Telegram', type: 'success', message: 'Telegram Bot setWebhook registered successfully with current origin.', timestamp: '10:01:15 AM' },
    { id: 'log_3', source: 'Instagram', type: 'info', message: 'Comment-to-DM auto-replies activated on Meta Graph API node.', timestamp: '10:02:45 AM' },
  ]);

  // General state to show live dashboard banners/notifications
  const [toasts, setToasts] = useState<any[]>([]);

  // Calculate dynamic Webhook URL
  useEffect(() => {
    setTelegramWebhookUrl(`${window.location.origin}/api/integrations/telegram`);
  }, []);

  const triggerToast = (title: string, msg: string, type: 'shopify' | 'telegram' | 'instagram' | 'voice') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const addLog = (source: 'Shopify' | 'Telegram' | 'Instagram' | 'Voice AI', type: 'success' | 'info' | 'warning' | 'error', message: string) => {
    const newLog: IntegrationLogs = {
      id: Math.random().toString(),
      source,
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Shopify Simulated Order Push
  const handleSimulateShopifyOrder = () => {
    setShopifySimulating(true);
    addLog('Shopify', 'info', 'Receiving Shopify Webhook payload (order/created)...');
    
    setTimeout(() => {
      const orderNum = `#SHP-${Math.floor(Math.random() * 9000 + 1000)}`;
      const newOrder: ShopifyOrder = {
        id: Math.random().toString(),
        orderNumber: orderNum,
        customerName: simShopifyName,
        customerEmail: `${simShopifyName.toLowerCase().replace(/\s/g, '')}@gmail.com`,
        customerPhone: simShopifyPhone,
        customerAddress: simShopifyAddress,
        items: simShopifyItems,
        total: simShopifyTotal,
        paymentStatus: 'paid',
        syncStatus: 'synced',
        createdAt: new Date().toISOString()
      };

      setShopifyOrders(prev => [newOrder, ...prev]);
      setShopifySimulating(false);
      addLog('Shopify', 'success', `Successfully processed order ${orderNum}. Inventory auto-deducted for items.`);
      
      // Trigger live alert on admin deck
      triggerToast('Shopify Order Recieved!', `${simShopifyName} has placed order ${orderNum} for ${simShopifyTotal}. Stock synced.`, 'shopify');

      // Reset mock inputs
      setSimShopifyName('Ashraful Islam');
      setSimShopifyPhone('01712345678');
      setSimShopifyAddress('মিরপুর ১, ঢাকা, বাংলাদেশ');
      setSimShopifyItems('1x Designer Panjabi XL, 1x Attar');
      setSimShopifyTotal('৳ 2,900');
    }, 1500);
  };

  // Telegram setWebhook Registration Simulation
  const handleTelegramSetWebhook = () => {
    setTelegramPingStatus('testing');
    addLog('Telegram', 'info', `Contacting Telegram API Node... Calling setWebhook with endpoint: ${telegramWebhookUrl}`);
    
    setTimeout(() => {
      setIsTelegramActive(true);
      setTelegramPingStatus('success');
      addLog('Telegram', 'success', `Telegram setWebhook successful! Webhook active for bot ${telegramBotUsername}`);
      triggerToast('Telegram Bot Connected', `Webhook set successfully on ${telegramBotUsername}`, 'telegram');
    }, 1200);
  };

  // Telegram message push simulation
  const handleSimulateTelegramMessage = () => {
    if (!simTelegramText.trim()) return;
    setTelegramSimulating(true);
    
    const userMsg = { id: Math.random().toString(), sender: 'user', text: simTelegramText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setTelegramMessages(prev => [...prev, userMsg]);
    addLog('Telegram', 'info', `Incoming message from Telegram user: "${simTelegramText}"`);
    
    const originalText = simTelegramText;
    setSimTelegramText('');

    setTimeout(() => {
      let aiResponse = 'প্রিয় গ্রাহক, আমরা আপনার রিকোয়েস্টটি পেয়েছি। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।';
      if (originalText.includes('ক্যাটালগ') || originalText.includes('catalog') || originalText.includes('প্রোডাক্ট')) {
        aiResponse = 'অবশ্যই! এই যে আমাদের নতুন ঈদ কালেকশন ক্যাটালগ লিংক: zender.store/catalog । যেকোনো পণ্য পছন্দ হলে আমাদের এখানে কোড ও সাইজ পাঠান।';
      } else if (originalText.includes('দাম') || originalText.includes('প্রাইস') || originalText.includes('price')) {
        aiResponse = 'আমাদের প্রতিটি প্রোডাক্টের দাম ক্যাটালগে উল্লেখ করা আছে। পাঞ্জাবি কালেকশন শুরু ১,২০০ টাকা থেকে। আপনার কোনো নির্দিষ্ট কোড পছন্দ আছে কি?';
      }

      const aiMsg = { id: Math.random().toString(), sender: 'ai', text: aiResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setTelegramMessages(prev => [...prev, aiMsg]);
      setTelegramSimulating(false);
      addLog('Telegram', 'success', `AI Automated Reply dispatched via Telegram Bot: "${aiResponse}"`);
      triggerToast('Telegram Auto-Reply Sent', `AI Replied to Telegram message.`, 'telegram');
    }, 2000);
  };

  // Instagram simulated comment push
  const handleSimulateInstagramComment = () => {
    if (!simInstagramComment.trim()) return;
    setInstagramSimulating(true);
    addLog('Instagram', 'info', `Meta Webhook: New Instagram Comment on post from @${simInstagramAuthor}`);

    const newComment = {
      id: Math.random().toString(),
      author: simInstagramAuthor,
      comment: simInstagramComment,
      replied: false,
      time: 'Just now'
    };

    setInstagramComments(prev => [newComment, ...prev]);

    setTimeout(() => {
      setInstagramComments(prev => 
        prev.map(c => c.id === newComment.id ? { ...c, replied: true } : c)
      );
      setInstagramSimulating(false);
      addLog('Instagram', 'success', `Comment-to-DM automated response sent. DM sent to @${simInstagramAuthor} with details.`);
      triggerToast('Instagram Comment Replied', `Auto Comment-to-DM triggered for @${simInstagramAuthor}`, 'instagram');
      setSimInstagramComment('');
    }, 1800);
  };

  // Voice AI - Voice Order Simulation Workflow
  const handleSimulateVoiceNote = () => {
    setVoiceRecordingState('recording');
    setVoiceTranslationText('');
    setVoiceAiThoughts([]);
    setVoiceAiReplyText('');
    setVoicePlaybackProgress(0);
    setIsPlayingSynthReply(false);
    addLog('Voice AI', 'info', 'Recording simulated customer voice note over WhatsApp gateway...');

    // 1. Record voice note simulation
    setTimeout(() => {
      setVoiceRecordingState('translating');
      addLog('Voice AI', 'info', 'Whisper / Gemini AI Speech-to-Text active. Analyzing voice spectrum...');
      
      // 2. STT Translation Complete
      setTimeout(() => {
        setVoiceRecordingState('done');
        const simulatedTranslation = voiceLanguage === 'bn' 
          ? "আসসালামু আলাইকুম ভাইয়া। আমি আপনাদের মিরপুর ১০ ব্রাঞ্চ থেকে একটা কালা কাবলি নিতে চাচ্ছিলাম, সাইজ কি ৪০ এভেইলএবল আছে? আর হোম ডেলিভারি হবে?"
          : "Hello, I wanted to buy the Blue Cotton Panjabi, size 42. Is it in stock and can you deliver to Dhanmondi?";
        
        setVoiceTranslationText(simulatedTranslation);
        addLog('Voice AI', 'success', `Voice converted to Text: "${simulatedTranslation}"`);
        triggerToast('Speech-to-Text Complete', `Converted customer audio note successfully.`, 'voice');

        // 3. AI Formulating Response (Thoughts pipeline)
        setTimeout(() => {
          setVoiceAiThoughts([
            'Analyzing customer query: "মিরপুর ১০ ব্রাঞ্চে কালা কাবলি সাইজ ৪০ এভেইলএবল কি না এবং হোম ডেলিভারি হবে কি না"',
            'Checking real-time Firestore Product Inventory for "কালা কাবলি" -> Size 40 (Available: 8 items left)',
            'Formulating natural, polite response in Bengali...',
            'Triggering Text-to-Speech synthesizer with Female Voice engine'
          ]);

          // 4. Set final reply text
          setTimeout(() => {
            const simulatedReply = voiceLanguage === 'bn'
              ? "ওয়ালাইকুম আসসালাম ভাইয়া! জি, মিরপুর ১০ শোরুমে আমাদের ব্লাক কাবলি সাইজ ৪০ পর্যাপ্ত স্টক আছে। ঢাকার যেকোনো স্থানে আমরা হোম ডেলিভারি করে থাকি। আপনার নাম ও সম্পূর্ণ ঠিকানা দিলে আমরা এখনই অর্ডার কনফার্ম করে দেবো।"
              : "Hi there! Yes, the Blue Cotton Panjabi size 42 is in stock. We can easily deliver to Dhanmondi within 24 hours. Please send us your full name and address to book the order.";
            
            setVoiceAiReplyText(simulatedReply);
            addLog('Voice AI', 'success', `AI drafted reply: "${simulatedReply}"`);
          }, 1500);

        }, 1000);

      }, 1500);

    }, 2000);
  };

  // Play synthetic voice note helper
  const handlePlaySynthesizer = () => {
    if (isPlayingSynthReply) {
      setIsPlayingSynthReply(false);
      return;
    }
    setIsPlayingSynthReply(true);
    setVoicePlaybackProgress(0);
    addLog('Voice AI', 'info', `Playing synthesized ${voiceGender === 'female' ? 'Female' : 'Male'} voice note reply...`);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingSynthReply) {
      interval = setInterval(() => {
        setVoicePlaybackProgress(p => {
          if (p >= 100) {
            setIsPlayingSynthReply(false);
            addLog('Voice AI', 'success', 'Voice note reply audio playback completed.');
            return 100;
          }
          return p + 5;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlayingSynthReply]);

  const copyToClipboard = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden" id="integrations-deck">
      {/* LEFT COLUMN: Configuration Rail */}
      {!hideSidebar && (
        <div className="w-full lg:w-80 bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-slate-800/80 overflow-y-auto custom-scrollbar p-5 shrink-0 flex flex-col justify-between">
          
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-gray-100 dark:border-slate-800/60">
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2 uppercase tracking-wide">
                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Integrations Hub (ধাপ ১)
              </h2>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                আপনার অনলাইন স্টোর, চ্যাট অ্যাসিস্ট্যান্ট এবং এআই ভয়েস গেটওয়ের মূল সেটিংস এখান থেকেই সেট করুন। এই কনফিগারেশনগুলো আপনার সমস্ত ডিভাইসের সাথে ক্লাউডে অটো-সিঙ্ক হয়ে যাবে।
              </p>
            </div>
   
            {/* Sub-navigation inside configuration rail */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-gray-150 dark:border-slate-800/85 rounded-2xl p-2.5 space-y-1.5 shadow-inner">
              {[
                { id: 'shopify', label: 'Shopify Webhooks', desc: 'অটো স্টক মাইনাস ও অর্ডার অ্যালার্ট', icon: ShoppingBag, color: 'hover:bg-green-50/50 hover:text-green-600 dark:hover:bg-green-950/20 text-green-600' },
                { id: 'telegram', label: 'Telegram Bot API', desc: 'setWebhook ও চ্যাট প্যানেল', icon: Send, color: 'hover:bg-sky-50/50 hover:text-sky-600 dark:hover:bg-sky-950/20 text-sky-600' },
                { id: 'instagram', label: 'Instagram Graph API', desc: 'Comment-to-DM অটো রিপ্লাই', icon: Instagram, color: 'hover:bg-pink-50/50 hover:text-pink-600 dark:hover:bg-pink-950/20 text-pink-600' },
                { id: 'voice_ai', label: 'Voice Message AI', desc: 'ভয়েস ও টেক্সট টু ভয়েস কনভার্টার', icon: Mic, color: 'hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:bg-indigo-950/20 text-indigo-600' },
                { id: 'logs', label: 'Integration Terminal Logs', desc: 'লাইভ অ্যাক্টিভিটি কনসোল', icon: Terminal, color: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as any)}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all border text-left cursor-pointer ${
                    subTab === tab.id 
                      ? 'bg-indigo-600 text-white dark:bg-indigo-650 dark:text-white border-transparent shadow-lg shadow-indigo-900/10 font-bold' 
                      : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-gray-100 dark:border-slate-800/80 hover:border-gray-250 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    subTab === tab.id ? 'bg-white/20 text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-indigo-400'
                  }`}>
                    <tab.icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold truncate">{tab.label}</h4>
                    <p className={`text-[10px] truncate ${subTab === tab.id ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>{tab.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
   
          <div className="pt-4 border-t border-gray-100 dark:border-slate-850 mt-6 text-center shrink-0">
            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> SECURE NODE v2.1
            </p>
          </div>
        </div>
      )}

      {/* RIGHT COLUMN: Interactive Workstage */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/60 overflow-y-auto custom-scrollbar p-6">
        {/* Dynamic Toasts / Live Notification Alert Console */}
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-slate-900 text-white border border-slate-800 dark:bg-slate-950 p-4 rounded-2xl shadow-2xl flex items-start gap-3.5 mb-4 max-w-xl mx-auto w-full z-50 shrink-0"
            >
              <div className={`p-2 rounded-xl text-white ${
                toast.type === 'shopify' ? 'bg-green-600' :
                toast.type === 'telegram' ? 'bg-sky-600' :
                toast.type === 'instagram' ? 'bg-pink-600' : 'bg-indigo-600'
              }`}>
                {toast.type === 'shopify' && <ShoppingBag className="w-5 h-5 animate-bounce" />}
                {toast.type === 'telegram' && <Send className="w-5 h-5" />}
                {toast.type === 'instagram' && <Instagram className="w-5 h-5" />}
                {toast.type === 'voice' && <Mic className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Bell className="w-3 h-3 text-amber-400 animate-pulse" /> {toast.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">Just Now</span>
                </div>
                <p className="text-xs text-slate-200 mt-1.5 font-medium leading-relaxed">{toast.msg}</p>
              </div>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-slate-400 hover:text-white shrink-0 self-start">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* WORKSTAGE VIEWPORT */}
        <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full space-y-6">
          
          <AnimatePresence mode="wait">
            
            {/* 1. SHOPIFY INTEGRATION PANEL */}
            {subTab === 'shopify' && (
              <motion.div
                key="shopify-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Intro details */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-emerald-700/30">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.35),transparent_60%)] pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-400/20">
                        Shopify REST API & Webhooks
                      </span>
                      <h2 className="text-2xl font-black tracking-tight">Shopify Integration (রিয়েল-টাইম স্টক ও অর্ডার এলার্ট)</h2>
                      <p className="text-emerald-100 text-xs max-w-2xl leading-relaxed">
                        আপনার শপিফাই স্টোরে নতুন অর্ডার আসা মাত্রই রিয়েল-টাইমে এখানে ড্যাশবোর্ড নোটিফিকেশন চলে আসবে। এছাড়াও আপনার পস (POS) থেকে কোনো পণ্য বিক্রি হলে তা স্বয়ংক্রিয়ভাবে শপিফাই স্টোরের স্টক থেকে মাইনাস হবে।
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-black/10 p-1.5 px-3.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto">
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-emerald-300 uppercase tracking-wider font-extrabold">Shopify Connection</span>
                        <span className="text-xs font-bold">{isShopifyActive ? 'Active & Synced' : 'Offline'}</span>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${isShopifyActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                    </div>
                  </div>
                </div>

                {/* Sub row with settings & simulator */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Shopify credentials settings */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-600" /> Shopify Credentials
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Shopify Domain Name</label>
                        <input 
                          type="text" 
                          value={shopifyDomain} 
                          onChange={e => setShopifyDomain(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-700 dark:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Admin API Access Token</label>
                        <input 
                          type="password" 
                          value={shopifyToken} 
                          onChange={e => setShopifyToken(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Webhook Endpoint (Shopify Dashboard-এ সেট করতে হবে)</label>
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-2.5 overflow-hidden">
                        <input 
                          type="text" 
                          readOnly 
                          value={`${window.location.origin}/api/integrations/shopify`} 
                          className="bg-transparent text-xs text-gray-500 dark:text-gray-400 flex-1 outline-none font-mono"
                        />
                        <button 
                          onClick={() => copyToClipboard(`${window.location.origin}/api/integrations/shopify`, setCopiedShopifyUrl)}
                          className="p-1.5 px-3 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-bold rounded-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-1 transition-all"
                        >
                          {copiedShopifyUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedShopifyUrl ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Toggle Switch fields */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/65 rounded-xl border border-gray-100/50 dark:border-slate-850">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">POS Stock Auto Sync</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">POS থেকে কোনো প্রোডাক্ট বিক্রি হলে Shopify স্টোর থেকে স্টক মাইনাস করুন</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsShopifySyncEnabled(!isShopifySyncEnabled);
                          addLog('Shopify', 'info', `POS Stock Auto-Sync has been turned ${!isShopifySyncEnabled ? 'ON' : 'OFF'}.`);
                        }}
                        className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${isShopifySyncEnabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-slate-800'}`}
                      >
                        <span className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${isShopifySyncEnabled ? 'right-1' : 'left-1'}`}></span>
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        addLog('Shopify', 'success', 'Shopify credentials updated. Configuration secured.');
                        triggerToast('Shopify Config Saved', 'Your Shopify integration tokens have been updated in Firestore.', 'shopify');
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow shadow-emerald-600/10"
                    >
                      <Check className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন (Save Credentials)
                    </button>
                  </div>

                  {/* Shopify Webhook Simulator */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-600" /> Shopify Webhook Simulator
                      </h3>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-semibold mt-1">
                        শপিফাইয়ে কোনো কাস্টমার অর্ডার করার পর আমাদের এই গেটওয়েতে ডেটা পুশ হওয়ার কার্যক্রম নিচে সিমুলেট করতে পারেন:
                      </p>
                    </div>

                    <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-gray-100/60 dark:border-slate-850 font-medium">
                      <div>
                        <label className="block text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wide">Customer Name</label>
                        <input 
                          type="text" 
                          value={simShopifyName} 
                          onChange={e => setSimShopifyName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wide">Customer Phone</label>
                          <input 
                            type="text" 
                            value={simShopifyPhone} 
                            onChange={e => setSimShopifyPhone(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wide">Total Bill</label>
                          <input 
                            type="text" 
                            value={simShopifyTotal} 
                            onChange={e => setSimShopifyTotal(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-lg px-2.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wide">Delivery Address</label>
                        <input 
                          type="text" 
                          value={simShopifyAddress} 
                          onChange={e => setSimShopifyAddress(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-400 mb-0.5 font-bold uppercase tracking-wide">Purchased Items</label>
                        <textarea 
                          rows={1}
                          value={simShopifyItems} 
                          onChange={e => setSimShopifyItems(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleSimulateShopifyOrder}
                      disabled={shopifySimulating}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/15"
                    >
                      {shopifySimulating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          অর্ডার রিসিভ হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" /> সিমুলেট শপিফাই অর্ডার (Trigger Webhook)
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Shopify Orders list received via webhook */}
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-emerald-600" /> Webhook Received Orders (শপিফাই অর্ডার ট্র্যাকিং)</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-full text-[9px] font-black uppercase tracking-wider">
                      {shopifyOrders.length} Orders
                    </span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse mt-2 text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-slate-850 text-gray-400 dark:text-gray-500 font-semibold text-[10px] uppercase h-10">
                          <th className="pb-2 text-center w-24">Shopify Order ID</th>
                          <th className="pb-2">Customer & Contact</th>
                          <th className="pb-2">Items Bought</th>
                          <th className="pb-2 w-28 text-center">Total Bill</th>
                          <th className="pb-2 w-28 text-center">POS Sync Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-slate-900">
                        {shopifyOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 h-14 border-b border-gray-50 dark:border-slate-900/40">
                            <td className="font-mono text-slate-800 dark:text-white font-black text-center">{order.orderNumber}</td>
                            <td>
                              <div>
                                <p className="font-black text-slate-700 dark:text-slate-300">{order.customerName}</p>
                                <p className="text-[10px] text-gray-400 font-mono font-medium leading-none mt-0.5">{order.customerPhone} • {order.customerAddress}</p>
                              </div>
                            </td>
                            <td className="text-gray-500 dark:text-gray-400 font-medium">{order.items}</td>
                            <td className="font-black text-emerald-600 dark:text-emerald-400 text-center text-sm">{order.total}</td>
                            <td className="text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200/40 rounded-full text-[9px] font-bold uppercase">
                                <Check className="w-3 h-3 text-green-500" /> Synced & Deducted
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. TELEGRAM BOT API PANEL */}
            {subTab === 'telegram' && (
              <motion.div
                key="telegram-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Intro details */}
                <div className="bg-gradient-to-r from-sky-800 to-blue-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-sky-700/30">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_75%_75%,rgba(56,189,248,0.35),transparent_60%)] pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-400/20">
                        Telegram Bot SDK Integration
                      </span>
                      <h2 className="text-2xl font-black tracking-tight">Telegram Bot & Auto AI Reply</h2>
                      <p className="text-sky-100 text-xs max-w-2xl leading-relaxed">
                        টেলিগ্রামের setWebhook ব্যবহার করে গ্রাহকদের সব মেসেজ সরাসরি আপনার এই সেন্ট্রাল প্যানেলে নিয়ে আসব। পাশাপাশি কাস্টমারের মেসেজে এআই (AI) দিয়ে স্বয়ংক্রিয়ভাবে বুদ্ধিদীপ্ত উত্তর দেওয়ার ব্যবস্থা রয়েছে।
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-black/10 p-1.5 px-3.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto">
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-sky-300 uppercase tracking-wider font-extrabold">Bot Hook Status</span>
                        <span className="text-xs font-bold">{isTelegramActive ? 'Connected' : 'Disconnected'}</span>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${isTelegramActive ? 'bg-sky-400 animate-pulse' : 'bg-red-400'}`}></span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Telegram credentials */}
                  <div className="lg:col-span-6 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-sky-600" /> Telegram Connection Settings
                    </h3>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Telegram Bot Token (From @BotFather)</label>
                      <input 
                        type="password" 
                        value={telegramToken} 
                        onChange={e => setTelegramToken(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sky-500 font-mono text-slate-700 dark:text-slate-300"
                        placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Bot Username</label>
                        <input 
                          type="text" 
                          value={telegramBotUsername} 
                          onChange={e => setTelegramBotUsername(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sky-500 font-mono text-slate-700 dark:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Webhook Registration Endpoint</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={telegramWebhookUrl} 
                          className="w-full bg-slate-100 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl px-3 py-2.5 text-[10px] text-gray-500 font-mono select-all cursor-text outline-none"
                        />
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/65 rounded-xl border border-gray-100/50 dark:border-slate-850">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">AI Auto-Reply for Bot</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">কাস্টমার চ্যাটে কৃত্রিম বুদ্ধিমত্তা দিয়ে অটোমেটিক ইনস্ট্যান্ট রিপ্লাই দিন</p>
                      </div>
                      <button 
                        onClick={() => {
                          setTelegramAiAutoReply(!telegramAiAutoReply);
                          addLog('Telegram', 'info', `Telegram AI Auto-Reply turned ${!telegramAiAutoReply ? 'ON' : 'OFF'}.`);
                        }}
                        className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${telegramAiAutoReply ? 'bg-sky-600' : 'bg-gray-300 dark:bg-slate-800'}`}
                      >
                        <span className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${telegramAiAutoReply ? 'right-1' : 'left-1'}`}></span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={handleTelegramSetWebhook}
                        disabled={telegramPingStatus === 'testing'}
                        className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow shadow-sky-600/10"
                      >
                        {telegramPingStatus === 'testing' ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Registered hooks...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" /> setWebhook (কানেক্ট বট)
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => {
                          addLog('Telegram', 'info', 'Pinging Telegram bot network...');
                          triggerToast('Bot Responding', 'Bot successfully returned 200 OK.', 'telegram');
                        }}
                        className="py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300"
                      >
                        Test Ping
                      </button>
                    </div>
                  </div>

                  {/* Telegram Chat Simulation Interface */}
                  <div className="lg:col-span-6 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col justify-between h-[390px]">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-850 pb-2.5">
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-sky-600" /> Telegram Live Simulation Box
                      </h3>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-mono font-bold text-gray-500">
                        Chat log
                      </span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-100/50 dark:border-slate-850 my-3.5 space-y-3.5 text-xs custom-scrollbar">
                      {telegramMessages.map(msg => (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                          <span className="text-[8px] text-gray-400 font-bold mb-1">
                            {msg.sender === 'user' ? 'Customer (Telegram)' : 'Zender AI Engine (Bot)'}
                          </span>
                          <div className={`p-3 rounded-2xl shadow-sm ${
                            msg.sender === 'user' 
                              ? 'bg-sky-600 text-white rounded-tr-none' 
                              : 'bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-tl-none'
                          }`}>
                            <p className="leading-relaxed text-xs font-medium">{msg.text}</p>
                          </div>
                          <span className="text-[8px] text-gray-400 font-mono mt-1">{msg.time}</span>
                        </div>
                      ))}
                      
                      {telegramSimulating && (
                        <div className="flex items-center gap-1.5 justify-start mr-auto bg-white dark:bg-slate-950 p-2.5 px-4 rounded-full border border-gray-100 dark:border-slate-850">
                          <span className="text-[10px] text-gray-400 font-bold">AI Bot is typing</span>
                          <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce"></span>
                          <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                          <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                        </div>
                      )}
                    </div>

                    {/* Inputs panel */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={simTelegramText} 
                        onChange={e => setSimTelegramText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSimulateTelegramMessage(); }}
                        placeholder="টেলিগ্রাম মেসেজ সিমুলেট করুন (যেমন: পাঞ্জাবির দাম কত?)"
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-500 text-slate-700 dark:text-slate-300"
                      />
                      <button 
                        onClick={handleSimulateTelegramMessage}
                        disabled={telegramSimulating}
                        className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors shrink-0 flex items-center justify-center shadow shadow-sky-600/25"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. INSTAGRAM GRAPH API PANEL */}
            {subTab === 'instagram' && (
              <motion.div
                key="instagram-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Intro details */}
                <div className="bg-gradient-to-r from-pink-800 to-rose-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-pink-700/30">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_75%_75%,rgba(244,63,94,0.35),transparent_60%)] pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 bg-pink-500/20 text-pink-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-pink-400/20">
                        Instagram Comment-to-DM Graph Node
                      </span>
                      <h2 className="text-2xl font-black tracking-tight">Instagram Direct (Comment-to-DM Auto-Reply)</h2>
                      <p className="text-pink-100 text-xs max-w-2xl leading-relaxed">
                        মেটার অফিসিয়াল এপিআই (Meta Graph API) কানেক্ট করে কাস্টমারের পাবলিক কমেন্টে ইনস্ট্যান্ট অটো-রিপ্লাই দিন। একই সাথে কাস্টমারের ইনবক্সে (DM) আকর্ষণীয় প্রডাক্ট ডিটেইলস ও প্রাইস শিট স্বয়ংক্রিয়ভাবে পাঠিয়ে দিন।
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-black/10 p-1.5 px-3.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto">
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-pink-300 uppercase tracking-wider font-extrabold">Meta Graph API Connection</span>
                        <span className="text-xs font-bold">Secure Node Active</span>
                      </div>
                      <span className="w-3 h-3 rounded-full bg-pink-400 animate-pulse"></span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Instagram credentials settings */}
                  <div className="lg:col-span-6 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-pink-600" /> Instagram Business API Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Instagram Business Account ID</label>
                        <input 
                          type="text" 
                          value={instagramAccountId} 
                          onChange={e => setInstagramAccountId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-pink-500 font-mono text-slate-700 dark:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Meta Page Access Token</label>
                        <input 
                          type="password" 
                          value={instagramPageToken} 
                          onChange={e => setInstagramPageToken(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-pink-500 font-mono text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Auto Comment-Reply Template</label>
                      <textarea 
                        rows={3}
                        value={instagramReplyPrompt} 
                        onChange={e => setInstagramReplyPrompt(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-pink-500 text-slate-700 dark:text-slate-300"
                      />
                    </div>

                    {/* Toggle Switch elements */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/65 rounded-xl border border-gray-100/50 dark:border-slate-850">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Comment-to-DM Loop</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">কাস্টমার কমেন্ট করলেই অটো রিপ্লাই ও ডিএম (DM) ট্রিগার হবে</p>
                        </div>
                        <button 
                          onClick={() => setInstagramCommentAutoReply(!instagramCommentAutoReply)}
                          className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${instagramCommentAutoReply ? 'bg-pink-600' : 'bg-gray-300 dark:bg-slate-800'}`}
                        >
                          <span className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${instagramCommentAutoReply ? 'right-1' : 'left-1'}`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/65 rounded-xl border border-gray-100/50 dark:border-slate-850">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Instagram DM Auto AI Agent</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">ইনবক্সে কাস্টমার মেসেজ পাঠালে AI জেনারেটেড রিপ্লাই সক্রিয় করুন</p>
                        </div>
                        <button 
                          onClick={() => setInstagramDMAutoReply(!instagramDMAutoReply)}
                          className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${instagramDMAutoReply ? 'bg-pink-600' : 'bg-gray-300 dark:bg-slate-800'}`}
                        >
                          <span className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${instagramDMAutoReply ? 'right-1' : 'left-1'}`}></span>
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        addLog('Instagram', 'success', 'Instagram Comment-to-DM template updated successfully.');
                        triggerToast('Instagram Config Saved', 'Instagram automated parameters updated.', 'instagram');
                      }}
                      className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow shadow-pink-600/10"
                    >
                      <Check className="w-4 h-4" /> সেটিংস সংরক্ষণ করুন (Save Configuration)
                    </button>
                  </div>

                  {/* Comment-to-DM Testing Simulator */}
                  <div className="lg:col-span-6 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col justify-between h-[450px]">
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-850 pb-2.5 mb-3.5">
                        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-600" /> Instagram Comment-to-DM Playground
                        </h3>
                        <span className="text-[9px] bg-pink-50 dark:bg-pink-950/40 text-pink-600 font-bold px-2 py-0.5 rounded">
                          Live Sandbox
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-gray-100/50 dark:border-slate-850 mb-4 text-xs">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated Instagram Feed Post</p>
                        <div className="flex gap-2.5 items-center mt-2 bg-white dark:bg-slate-950 p-2 rounded-lg border border-gray-150/40 dark:border-slate-900">
                          <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                            IG
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">Premium Cotton Eid Panjabi Collection 🌸</h4>
                            <p className="text-[9px] text-gray-400 font-mono">Post ID: 180299482937812</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Comments Feed list */}
                    <div className="flex-1 overflow-y-auto p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-100/50 dark:border-slate-850 my-1 space-y-3.5 text-xs custom-scrollbar">
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest border-b border-gray-200/50 dark:border-slate-800 pb-1.5 mb-2">Comments feed (কমেন্ট লিস্ট)</p>
                      {instagramComments.map(c => (
                        <div key={c.id} className="space-y-1.5 p-3 bg-white dark:bg-slate-950 rounded-xl border border-gray-150/50 dark:border-slate-900 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] font-mono">@{c.author}</span>
                            <span className="text-[9px] text-gray-400 font-medium">{c.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-medium pl-1">"{c.comment}"</p>
                          {c.replied && (
                            <div className="bg-pink-50/50 dark:bg-pink-950/25 p-2 rounded-lg border border-pink-100/50 dark:border-pink-950/40 text-[10px] space-y-1 mt-2 font-medium">
                              <p className="text-pink-700 dark:text-pink-400 font-black flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Auto-Replied on Comment:
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 leading-relaxed italic pl-1">"{instagramReplyPrompt}"</p>
                              <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1 text-[9px] uppercase tracking-wide">
                                <Zap className="w-3 h-3 animate-pulse" /> Messenger DM Sent (Private Pricing Dispatched)
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {instagramSimulating && (
                        <div className="flex items-center gap-1.5 justify-center bg-white dark:bg-slate-950 p-2 rounded-lg border border-gray-100">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-600" />
                          <span className="text-[10px] text-gray-400 font-bold">Meta webhook dispatching comment reply...</span>
                        </div>
                      )}
                    </div>

                    {/* Simulation console inputs */}
                    <div className="space-y-2 mt-4 pt-3.5 border-t border-gray-100 dark:border-slate-850">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        <div className="md:col-span-1">
                          <input 
                            type="text" 
                            value={simInstagramAuthor} 
                            onChange={e => setSimInstagramAuthor(e.target.value)}
                            placeholder="username"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-700 dark:text-slate-300"
                          />
                        </div>
                        <div className="md:col-span-2 flex gap-1.5">
                          <input 
                            type="text" 
                            value={simInstagramComment} 
                            onChange={e => setSimInstagramComment(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSimulateInstagramComment(); }}
                            placeholder="কমেন্ট টেক্সট (যেমন: দাম কত?)"
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300"
                          />
                          <button 
                            onClick={handleSimulateInstagramComment}
                            disabled={instagramSimulating}
                            className="p-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors shrink-0 flex items-center justify-center shadow shadow-pink-600/15 animate-pulse"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. VOICE MESSAGE AI PANEL */}
            {subTab === 'voice_ai' && (
              <motion.div
                key="voice-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Intro banner */}
                <div className="bg-gradient-to-r from-indigo-800 to-purple-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-indigo-700/30">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_75%_75%,rgba(129,140,248,0.35),transparent_60%)] pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-400/20">
                        Voice Message AI (Speech-to-Text & TTS)
                      </span>
                      <h2 className="text-2xl font-black tracking-tight">AI Voice Note Assistant (ভয়েস টু টেক্সট ও রিপ্লাই ইঞ্জিন)</h2>
                      <p className="text-indigo-100 text-xs max-w-2xl leading-relaxed">
                        কাস্টমার হোয়াটসঅ্যাপ বা মেসেঞ্জারে ভয়েস নোট পাঠালে তা স্বয়ংক্রিয়ভাবে টেক্সটে কনভার্ট হবে (Speech-to-Text)। অতঃপর এআই (AI) রিয়েল-টাইম প্রোডাক্ট স্টক চেক করে একটি চমৎকার উত্তর ড্রাফট করবে, যা ভয়েস নোটে কনভার্ট হয়ে (Text-to-Speech) কাস্টমারকে ভয়েস আকারে রিপ্লাই চলে যাবে!
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-black/10 p-1.5 px-3.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto">
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-indigo-300 uppercase tracking-wider font-extrabold">Speech Node Engine</span>
                        <span className="text-xs font-bold">{isVoiceAiActive ? 'Active (Gemini 3.5)' : 'Offline'}</span>
                      </div>
                      <span className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse"></span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Voice AI configuration settings */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-600" /> Voice Processing Settings
                    </h3>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">Voice Language Preference</label>
                      <select 
                        value={voiceLanguage} 
                        onChange={e => {
                          setVoiceLanguage(e.target.value as any);
                          addLog('Voice AI', 'info', `Changed primary processing voice language to: ${e.target.value === 'bn' ? 'Bengali (বাংলা)' : 'English'}`);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="bn">Bangla (বাংলা) - Recommended</option>
                        <option value="en">English (ইউএস ইংলিশ)</option>
                        <option value="hn">Banglish / Hinglish (বাংলিশ)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">STT Provider Model</label>
                        <select 
                          value={voiceProvider} 
                          onChange={e => setVoiceProvider(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none font-mono"
                        >
                          <option value="gemini">Gemini Flash 3.5</option>
                          <option value="whisper">OpenAI Whisper v3</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider">AI Voice Reply Gender</label>
                        <select 
                          value={voiceGender} 
                          onChange={e => setVoiceGender(e.target.value as any)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="female">Bengali Female Voice (মিষ্টি কন্ঠ)</option>
                          <option value="male">Bengali Male Voice (ভরাট কন্ঠ)</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/65 rounded-xl border border-gray-100/50 dark:border-slate-850">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Voice-to-Voice Loop</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">ভয়েস মেসেজের উত্তর ভয়েস আকারেই স্বয়ংক্রিয়ভাবে চলে যাবে</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsVoiceAiActive(!isVoiceAiActive);
                          addLog('Voice AI', 'info', `Voice-to-Voice automation Loop turned ${!isVoiceAiActive ? 'ON' : 'OFF'}`);
                        }}
                        className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${isVoiceAiActive ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-800'}`}
                      >
                        <span className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${isVoiceAiActive ? 'right-1' : 'left-1'}`}></span>
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        addLog('Voice AI', 'success', 'Voice AI voice profiling & STT nodes saved.');
                        triggerToast('Voice AI Saved', 'Speech synthesis settings updated successfully.', 'voice');
                      }}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow shadow-indigo-600/10"
                    >
                      <Check className="w-4 h-4" /> ভয়েস প্রোফাইল সেভ করুন (Save Engine Settings)
                    </button>
                  </div>

                  {/* Voice Simulator Workspace */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                        <Mic className="w-4 h-4 text-indigo-600" /> WhatsApp Customer Voice-Note Playground
                      </h3>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-semibold mt-1">
                        আপনার হোয়াটসঅ্যাপ বা ফেসবুক পেইজে কোনো গ্রাহক ভয়েস নোট বা অডিও ফাইল পাঠালে সিস্টেম কীভাবে তা প্রসেস করে স্বয়ংক্রিয় ভয়েস উত্তর জেনারেট করে তা নিচে রিয়েল-টাইমে পরীক্ষা করুন:
                      </p>
                    </div>

                    {/* Interactive workflow blocks */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-gray-150/40 dark:border-slate-850 space-y-4">
                      {/* Visual Soundwave Animation */}
                      <div className="flex flex-col items-center justify-center py-4 bg-white dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-900 relative overflow-hidden">
                        {voiceRecordingState === 'recording' ? (
                          <div className="flex items-center gap-1 h-14 justify-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(bar => (
                              <span 
                                key={bar} 
                                className="w-1 bg-red-500 rounded-full animate-pulse"
                                style={{ 
                                  height: `${Math.floor(Math.random() * 45 + 10)}px`,
                                  animationDuration: `${0.3 + (Math.random() * 0.5)}s`
                                }}
                              />
                            ))}
                          </div>
                        ) : isPlayingSynthReply ? (
                          <div className="flex items-center gap-1 h-14 justify-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(bar => (
                              <span 
                                key={bar} 
                                className="w-1 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"
                                style={{ 
                                  height: `${Math.floor(Math.random() * 40 + 8)}px`,
                                  animationDuration: `${0.2 + (Math.random() * 0.4)}s`
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 h-14 justify-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(bar => (
                              <span key={bar} className="w-1 h-2 bg-gray-300 dark:bg-slate-850 rounded-full" />
                            ))}
                          </div>
                        )}
                        <span className="text-[9px] font-mono font-bold text-gray-400 mt-2 uppercase tracking-widest">
                          {voiceRecordingState === 'recording' ? '🔴 Recording Input Spectrum' : 
                           isPlayingSynthReply ? '🔊 Playing Synthetic Reply Waveform' : 'Spectrometer Idle'}
                        </span>
                      </div>

                      {/* Customer Speech Translation Display */}
                      <div className="space-y-1.5 text-xs">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-indigo-500" /> Customer Voice-to-Text Conversion (STT)
                        </h4>
                        <div className="bg-white dark:bg-slate-950 border border-gray-150 dark:border-slate-900 p-3 rounded-xl min-h-[50px] flex items-center">
                          {voiceRecordingState === 'idle' && (
                            <p className="text-gray-400 italic">ভয়েস সিমুলেশন বাটন ক্লিক করুন। অডিও টেক্সটে ট্রান্সলেট হয়ে এখানে আসবে।</p>
                          )}
                          {voiceRecordingState === 'recording' && (
                            <p className="text-red-500 font-bold animate-pulse flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> গ্রাহকের হোয়াটসঅ্যাপ ভয়েস নোট রেকর্ড হচ্ছে...
                            </p>
                          )}
                          {voiceRecordingState === 'translating' && (
                            <p className="text-amber-600 dark:text-amber-400 font-black flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Gemini AI অডিও ফাইলকে বাংলায় রুপান্তর করছে (Speech-to-Text)...
                            </p>
                          )}
                          {voiceRecordingState === 'done' && (
                            <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                              🎙️ <span className="text-indigo-600 dark:text-indigo-400">"{voiceTranslationText}"</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* AI Thinking and Formulation Loop */}
                      {voiceAiThoughts.length > 0 && (
                        <div className="space-y-1.5 text-xs animate-fade-in">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5 text-indigo-500" /> AI Agent Multi-Step Reasoning (এআই সিদ্ধান্ত কদম)
                          </h4>
                          <div className="bg-slate-900 text-slate-300 p-3 rounded-xl border border-slate-800 font-mono text-[10px] leading-relaxed space-y-1">
                            {voiceAiThoughts.map((thought, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="text-indigo-400 shrink-0">&gt;&gt;</span>
                                <span className="text-slate-300 font-medium">{thought}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Auto response text generation completed */}
                      {voiceAiReplyText && (
                        <div className="space-y-1.5 text-xs animate-fade-in">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> AI Dispatched Reply (Text-to-Speech Engine)
                          </h4>
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150/40 dark:border-indigo-950/50 p-4.5 rounded-xl space-y-3">
                            <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                              🤖 <span className="text-slate-700 dark:text-slate-300">"{voiceAiReplyText}"</span>
                            </p>
                            
                            {/* Speech synthesis player trigger */}
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-indigo-100 dark:border-slate-900 shadow-sm">
                              <button 
                                onClick={handlePlaySynthesizer}
                                className={`p-2.5 rounded-lg text-white shrink-0 shadow-sm transition-all ${
                                  isPlayingSynthReply ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'
                                }`}
                              >
                                {isPlayingSynthReply ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                              </button>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold font-mono">
                                  <span>{voiceGender === 'female' ? 'Female_Voice_Synthesized.wav' : 'Male_Voice_Synthesized.wav'}</span>
                                  <span>{isPlayingSynthReply ? `${voicePlaybackProgress}%` : 'Ready'}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-indigo-600 h-full transition-all duration-200"
                                    style={{ width: `${voicePlaybackProgress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleSimulateVoiceNote}
                      disabled={voiceRecordingState === 'recording' || voiceRecordingState === 'translating'}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 uppercase tracking-wide"
                    >
                      <Mic className="w-4 h-4 animate-pulse" /> কাস্টমার ভয়েস অর্ডার সিমুলেশন ট্রিগার (Trigger Voice Sync)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. LIVE INTEGRATION LOGS / TERMINAL */}
            {subTab === 'logs' && (
              <motion.div
                key="logs-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-sm font-black tracking-wider uppercase font-mono text-indigo-400">Integration Gateway Terminal Logs</h2>
                    </div>
                    <button 
                      onClick={() => {
                        setLogs([]);
                        addLog('Voice AI', 'info', 'Terminal logs buffer cleared manually.');
                      }}
                      className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 font-bold font-mono"
                    >
                      Clear Log
                    </button>
                  </div>

                  {/* Logs Container */}
                  <div className="space-y-2 h-[420px] overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed p-4 bg-black/60 rounded-2xl border border-slate-950/60">
                    {logs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 italic">
                        No operations logged yet. Trigger some simulations to watch webhook transactions in real-time.
                      </div>
                    ) : (
                      logs.map(log => (
                        <div 
                          key={log.id} 
                          className={`flex items-start gap-3 p-2 rounded-lg ${
                            log.type === 'success' ? 'text-emerald-400 bg-emerald-950/15' :
                            log.type === 'error' ? 'text-rose-400 bg-rose-950/15' :
                            log.type === 'warning' ? 'text-amber-400 bg-amber-950/15' : 'text-sky-400 bg-sky-950/10'
                          }`}
                        >
                          <span className="text-slate-500 font-bold shrink-0">[{log.timestamp}]</span>
                          <span className="font-black shrink-0 uppercase tracking-wide px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300">
                            {log.source}
                          </span>
                          <p className="flex-1 font-medium">{log.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
