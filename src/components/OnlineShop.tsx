import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { IntegrationsAddons } from './IntegrationsAddons';
import { 
  Globe, 
  Settings, 
  RefreshCw, 
  Check, 
  X, 
  MessageSquare, 
  ArrowRight, 
  Terminal, 
  Send, 
  ShoppingBag, 
  Zap, 
  User, 
  Smartphone, 
  BadgeAlert, 
  Copy, 
  Sliders, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Plus,
  Truck,
  Activity,
  Mic,
  Bot,
  Tag,
  ShoppingCart,
  Edit,
  Trash2,
  CheckCircle,
  Printer,
  Instagram
} from 'lucide-react';

interface TrackingMilestone {
  time: string;
  status: string;
  notes: string;
}

interface WooOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  product_number: string;
  total: string;
  items: string;
  payment_status: 'paid' | 'unpaid' | 'cash_on_delivery';
  status: 'pending' | 'confirmed' | 'declined';
  delivery_status: 'pending_shipment' | 'confirmed_shipped' | 'delivered' | 'cancelled';
  tracking_history: TrackingMilestone[];
  created_at: string;
}

interface LaravelEvent {
  id: string;
  event_type: string;
  payload: any;
  status: 'unread' | 'resolved';
  created_at: string;
}

interface FbMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  created_at: string;
}

interface FbThread {
  id: string;
  customer_name: string;
  customer_id: string;
  unread: boolean;
  messages: FbMessage[];
}

interface WaMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  created_at: string;
  is_voice?: boolean;
  voice_text_translation?: string;
}

interface WaThread {
  id: string;
  customer_name: string;
  customer_phone: string;
  unread: boolean;
  ai_automated: boolean;
  messages: WaMessage[];
}

export default function OnlineShop() {
  const [activeTab, setActiveTab] = useState<'woocommerce' | 'laravel' | 'facebook' | 'whatsapp_ai' | 'integrations_addons' | 'shopify' | 'telegram' | 'instagram' | 'voice_ai' | 'logs'>('woocommerce');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ 
    wooOrders: WooOrder[]; 
    laravelEvents: LaravelEvent[]; 
    fbChats: FbThread[];
    waChats: WaThread[];
    aiProducts?: any[];
    aiSettings?: {
      agentName: string;
      autoConfirmOrders: boolean;
      systemPrompt: string;
      failureFallbackMessage: string;
    };
    aiOrders?: any[];
    woo_webhook_active?: boolean;
    woo_last_ping?: string;
  }>({
    wooOrders: [],
    laravelEvents: [],
    fbChats: [],
    waChats: [],
    aiProducts: [],
    aiSettings: {
      agentName: 'SellersCampus AI Copilot',
      autoConfirmOrders: false,
      systemPrompt: '',
      failureFallbackMessage: ''
    },
    aiOrders: []
  });

  // Settings
  const [wooSecret, setWooSecret] = useState('wp_sec_672df910cb45761e0bb4e');
  const [larSecret, setLarSecret] = useState('lar_sec_991823abcefd4768b');
  const [fbPageToken, setFbPageToken] = useState('EAAbz9xZBZBZA8BAODlQ0ZDZD');
  const [fbVerifyToken] = useState('my-verification-token');

  // Simulation inputs
  const [simWooName, setSimWooName] = useState('Sajjad Hossain');
  const [simWooPhone, setSimWooPhone] = useState('01855667788');
  const [simWooAddress, setSimWooAddress] = useState('মিরপুর ১০, ঢাকা, বাংলাদেশ');
  const [simWooProductNo, setSimWooProductNo] = useState('PRD-9981');
  const [simWooTotal, setSimWooTotal] = useState('৳ 3,250');
  const [simWooItems, setSimWooItems] = useState('2x Premium Cotton Panjabi, 1x Premium Attar');
  const [simWooPaymentStatus, setSimWooPaymentStatus] = useState<'paid' | 'unpaid' | 'cash_on_delivery'>('cash_on_delivery');
  const [simWooDeliveryStatus, setSimWooDeliveryStatus] = useState<'pending_shipment' | 'confirmed_shipped' | 'delivered' | 'cancelled'>('pending_shipment');

  const [simLarEvent, setSimLarEvent] = useState('New User SignUp');
  const [simLarPayload, setSimLarPayload] = useState('{"user_id": 87, "username": "tasnim_sabbir", "package": "Premium Merchant"}');

  const [simFbSender, setSimFbSender] = useState('Tarek Rahman');
  const [simFbSenderId, setSimFbSenderId] = useState('8837162534');
  const [simFbText, setSimFbText] = useState('ভাইয়া, আমার এই অর্ডারটি কনফার্ম হয়েছে কিনা জানাবেন?');

  // WhatsApp simulation inputs
  const [simWaSender, setSimWaSender] = useState('Mohammad Raju');
  const [simWaPhone, setSimWaPhone] = useState('01799887766');
  const [simWaText, setSimWaText] = useState('ভাইয়া, আমি একটা লেদার ওয়ালেট ও পাঞ্জাবি নিতে চাই। নাম রাজু, ফোন ০১৭৯৯৮৮৭৭৬৬, ঠিকানা ধানমন্ডি ৮, ঢাকা।');
  const [simWaIsVoice, setSimWaIsVoice] = useState(false);
  const [simWaVoiceDuration, setSimWaVoiceDuration] = useState('12');

  // Expanded order view states
  const [expandedWooOrderId, setExpandedWooOrderId] = useState<string | null>(null);
  const [newLogStatus, setNewLogStatus] = useState('প্যাকেজিং সফল');
  const [newLogNotes, setNewLogNotes] = useState('অর্ডারটি জেন্ডার পস মার্চেন্ট হাবে সুরক্ষিতভাবে প্যাকেজ করা হয়েছে।');

  // Active chat thread ID
  const [activeFbThreadId, setActiveFbThreadId] = useState<string | null>(null);
  const [fbReplyText, setFbReplyText] = useState('');

  // Active WhatsApp chat thread ID
  const [activeWaThreadId, setActiveWaThreadId] = useState<string | null>(null);
  const [waReplyText, setWaReplyText] = useState('');
  const [isWaReplyLoading, setIsWaReplyLoading] = useState(false);
  const [isWaProcessingVoice, setIsWaProcessingVoice] = useState(false);

  // WhatsApp Expert Bot Sub-Tabs
  const [waSubTab, setWaSubTab] = useState<'chats' | 'orders' | 'settings' | 'catalog'>('chats');
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<any | null>(null);

  // WhatsApp Dynamic Product Catalog State
  const [catalogId, setCatalogId] = useState('');
  const [catalogName, setCatalogName] = useState('');
  const [catalogSku, setCatalogSku] = useState('');
  const [catalogPrice, setCatalogPrice] = useState('');
  const [catalogStock, setCatalogStock] = useState('');
  const [catalogDescription, setCatalogDescription] = useState('');
  const [isCatalogSubmitting, setIsCatalogSubmitting] = useState(false);

  // WhatsApp AI Bot Settings Form State
  const [settingsAgentName, setSettingsAgentName] = useState('');
  const [settingsAutoConfirm, setSettingsAutoConfirm] = useState(false);
  const [settingsPrompt, setSettingsPrompt] = useState('');
  const [settingsFallback, setSettingsFallback] = useState('');
  const [isSettingsSubmitting, setIsSettingsSubmitting] = useState(false);

  const [copiedWooUrl, setCopiedWooUrl] = useState(false);
  const [copiedLarUrl, setCopiedLarUrl] = useState(false);
  const [copiedFbUrl, setCopiedFbUrl] = useState(false);

  // WooCommerce Webhook verification states
  const [verifyingWoo, setVerifyingWoo] = useState(false);
  const [wooVerifyMessage, setWooVerifyMessage] = useState<string | null>(null);

  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAllData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('/api/integrations/data');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const d = await res.json();
          setData(d);
          if (d.fbChats && d.fbChats.length > 0 && !activeFbThreadId) {
            setActiveFbThreadId(d.fbChats[0].id);
          }
          if (d.waChats && d.waChats.length > 0 && !activeWaThreadId) {
            setActiveWaThreadId(d.waChats[0].id);
          }
        } else {
          console.warn('Fetched integration data is not JSON. Server might be restarting.');
        }
      }
    } catch (e) {
      console.warn('Error fetching integration data (transient during server restart):', e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(true);
    
    // Poll updates every 6 seconds softly
    const interval = setInterval(() => {
      fetchAllData();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data.aiSettings) {
      setSettingsAgentName(data.aiSettings.agentName || 'SellersCampus AI Copilot');
      setSettingsAutoConfirm(!!data.aiSettings.autoConfirmOrders);
      setSettingsPrompt(data.aiSettings.systemPrompt || '');
      setSettingsFallback(data.aiSettings.failureFallbackMessage || '');
    }
  }, [data.aiSettings]);

  const triggerReset = async () => {
    if (!window.confirm('Are you sure you want to restore integration data back to pre-seeded simulation templates?')) return;
    setLoading(true);
    try {
      await fetch('/api/integrations/reset', { method: 'POST' });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const verifyWooConnection = async () => {
    setVerifyingWoo(true);
    setWooVerifyMessage(null);
    try {
      const res = await fetch('/api/integrations/woocommerce/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const result = await res.json();
        setWooVerifyMessage(result.message || 'WooCommerce Webhook connection successfully verified!');
        await fetchAllData();
      } else {
        setWooVerifyMessage('Verification failed. Please retry.');
      }
    } catch (e) {
      console.error(e);
      setWooVerifyMessage('Error connecting to verification server.');
    } finally {
      setVerifyingWoo(false);
      setTimeout(() => setWooVerifyMessage(null), 5000);
    }
  };

  // WooCommerce Actions
  const simulateWooWebhook = async () => {
    try {
      const res = await fetch('/api/integrations/woocommerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: simWooName,
          customer_phone: simWooPhone,
          customer_address: simWooAddress,
          product_number: simWooProductNo,
          total: simWooTotal,
          items: simWooItems,
          payment_status: simWooPaymentStatus,
          delivery_status: simWooDeliveryStatus,
          order_number: '#' + Math.floor(Math.random() * 1000 + 1000)
        })
      });
      if (res.ok) {
        await fetchAllData();
        setSimWooName('Sajjad Hossain');
        setSimWooPhone('01855667788');
        setSimWooAddress('মিরপুর ১০, ঢাকা, বাংলাদেশ');
        setSimWooProductNo('PRD-' + Math.floor(Math.random() * 9000 + 1000));
        setSimWooTotal('৳ 3,250');
        setSimWooItems('2x Premium Cotton Panjabi, 1x Premium Attar');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateWooStatus = async (
    id: string, 
    fieldsObj: { 
      status?: 'pending' | 'confirmed' | 'declined';
      payment_status?: 'paid' | 'unpaid' | 'cash_on_delivery';
      delivery_status?: 'pending_shipment' | 'confirmed_shipped' | 'delivered' | 'cancelled';
      new_tracking?: { status: string; notes: string };
    }
  ) => {
    try {
      const res = await fetch('/api/integrations/woocommerce/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fieldsObj })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Laravel Actions
  const simulateLaravelWebhook = async () => {
    try {
      let parsedPayload = { raw: simLarPayload };
      try {
        parsedPayload = JSON.parse(simLarPayload);
      } catch (err) {}

      const res = await fetch('/api/integrations/laravel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: simLarEvent,
          payload: parsedPayload
        })
      });
      if (res.ok) {
        await fetchAllData();
        setSimLarEvent('New User SignUp');
        setSimLarPayload('{"user_id": 87, "username": "tasnim_sabbir", "package": "Premium Merchant"}');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resolveLaravelEvent = async (id: string, status: 'resolved') => {
    try {
      const res = await fetch('/api/integrations/laravel/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Facebook Actions
  const simulateFbWebhook = async () => {
    try {
      const res = await fetch('/api/integrations/facebook/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: simFbSender,
          customer_id: simFbSenderId,
          text: simFbText
        })
      });
      if (res.ok) {
        const out = await res.json();
        await fetchAllData();
        if (out.thread && out.thread.id) {
          setActiveFbThreadId(out.thread.id);
        }
        setSimFbText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendFbReply = async () => {
    if (!activeFbThreadId || !fbReplyText.trim()) return;
    try {
      const res = await fetch('/api/integrations/facebook/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: activeFbThreadId,
          text: fbReplyText
        })
      });
      if (res.ok) {
        setFbReplyText('');
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // WhatsApp Actions
  const simulateWaWebhook = async (customText?: string, customIsVoice = false) => {
    try {
      setIsWaReplyLoading(true);
      const messageContent = customText || simWaText;
      const res = await fetch('/api/integrations/whatsapp/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: simWaSender,
          customer_phone: simWaPhone,
          text: messageContent,
          isVoice: customIsVoice || simWaIsVoice,
          voiceDuration: simWaVoiceDuration
        })
      });
      if (res.ok) {
        const out = await res.json();
        await fetchAllData();
        if (out.thread && out.thread.id) {
          setActiveWaThreadId(out.thread.id);
        }
        if (!customText) {
          setSimWaText('');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsWaReplyLoading(false);
    }
  };

  const simulateWaVoiceNote = async () => {
    setIsWaProcessingVoice(true);
    // Simulate speech recording wave visualizer delay of 2.5 seconds
    setTimeout(async () => {
      setIsWaProcessingVoice(false);
      await simulateWaWebhook(
        "আসসালামু আলাইকুম ভাইয়া, আমি একটি প্রিমিয়াম লেদার ওয়ালেট কিনতে চাই। আমার নাম মইনুল, মোবাইল ০১৭৯৯৮৮৭৭৬৬, ঠিকানা হাউজ ৪, রোড ১২, উত্তরা, ঢাকা।",
        true
      );
    }, 2500);
  };

  const sendWaReply = async () => {
    if (!activeWaThreadId || !waReplyText.trim()) return;
    try {
      setIsWaReplyLoading(true);
      const res = await fetch('/api/integrations/whatsapp/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: activeWaThreadId,
          text: waReplyText
        })
      });
      if (res.ok) {
        setWaReplyText('');
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsWaReplyLoading(false);
    }
  };

  const toggleWaAi = async (threadId: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/integrations/whatsapp/ai-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          ai_automated: !currentVal
        })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveWaSettings = async () => {
    try {
      setIsSettingsSubmitting(true);
      const res = await fetch('/api/integrations/whatsapp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: settingsAgentName,
          autoConfirmOrders: settingsAutoConfirm,
          systemPrompt: settingsPrompt,
          failureFallbackMessage: settingsFallback
        })
      });
      if (res.ok) {
        await fetchAllData();
        alert('এআই সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSettingsSubmitting(false);
    }
  };

  const addCatalogProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCatalogSubmitting(true);
      const res = await fetch('/api/integrations/whatsapp/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catalogName,
          sku: catalogSku,
          price: Number(catalogPrice),
          stock: Number(catalogStock),
          description: catalogDescription
        })
      });
      if (res.ok) {
        setCatalogName('');
        setCatalogSku('');
        setCatalogPrice('');
        setCatalogStock('');
        setCatalogDescription('');
        setCatalogId('');
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCatalogSubmitting(false);
    }
  };

  const editCatalogProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCatalogSubmitting(true);
      const res = await fetch('/api/integrations/whatsapp/products/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: catalogId,
          name: catalogName,
          sku: catalogSku,
          price: Number(catalogPrice),
          stock: Number(catalogStock),
          description: catalogDescription
        })
      });
      if (res.ok) {
        setCatalogName('');
        setCatalogSku('');
        setCatalogPrice('');
        setCatalogStock('');
        setCatalogDescription('');
        setCatalogId('');
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCatalogSubmitting(false);
    }
  };

  const deleteCatalogProduct = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি ক্যাটালগ থেকে মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch('/api/integrations/whatsapp/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateAiOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/integrations/whatsapp/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAiOrder = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই অর্ডারটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch('/api/integrations/whatsapp/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentOrigin = window.location.origin;
  const wooWebhookEndpoint = `${currentOrigin}/api/integrations/woocommerce`;
  const larWebhookEndpoint = `${currentOrigin}/api/integrations/laravel`;
  const fbWebhookEndpoint = `${currentOrigin}/api/integrations/facebook`;
  const waWebhookEndpoint = `${currentOrigin}/api/integrations/whatsapp/message`;

  const copyToClipboard = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeThread = data.fbChats.find(t => t.id === activeFbThreadId);
  const activeWaThread = (data.waChats || []).find(t => t.id === activeWaThreadId);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden" id="online-shop-root">
      
      {/* Upper Navigation bar & Status board */}
      <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 transition-colors">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Omnichannel & online shop integration</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              we working this page
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            ম্যানেজ করুন আপনার ওয়ার্ডপ্রেস (WooCommerce), লারাভেল ওয়েবসাইট, ফেসবুক মেসেঞ্জার এবং হোয়াটসঅ্যাপ এআই রোবট অ্যাসিস্ট্যান্ট (WhatsApp AI)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => fetchAllData(true)} 
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Update
          </button>
          
          <button 
            onClick={triggerReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-950/40 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-400 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" /> Reset Simulation Seeding
          </button>
        </div>
      </div>

      {/* Editor Content split with Webhook configuration / Playground panel */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Sidebar: Main Channel Navigation */}
        <div className="w-full lg:w-72 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors">
          <div className="p-4 border-b border-gray-150 dark:border-slate-850 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Integrations & Channels</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-2.5 space-y-1.5 shadow-inner">
              {[
                { id: 'woocommerce', label: 'WordPress / WooCommerce', count: data.wooOrders.filter(o => o.status === 'pending').length, desc: 'Live Webhooks & Order Sync', icon: ShoppingBag, badgeColor: 'bg-indigo-600', activeBg: 'bg-indigo-50/70 text-indigo-700 border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-950/40' },
                { id: 'laravel', label: 'Laravel PHP System', count: data.laravelEvents.filter(e => e.status === 'unread').length, desc: 'Real-time HTTP Events', icon: Globe, badgeColor: 'bg-amber-600', activeBg: 'bg-amber-50/70 text-amber-700 border-amber-150 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950/40' },
                { id: 'facebook', label: 'Facebook Messenger', count: data.fbChats.filter(t => t.unread).length, desc: 'Automated AI Chats', icon: MessageSquare, badgeColor: 'bg-sky-600', activeBg: 'bg-sky-50/70 text-sky-700 border-sky-150 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-950/40' },
                { id: 'whatsapp_ai', label: 'WhatsApp AI Agent', count: (data.waChats || []).filter(t => t.unread).length, desc: 'STT / TTS Live Handshake', icon: Bot, badgeColor: 'bg-emerald-600', activeBg: 'bg-emerald-50/70 text-emerald-700 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/40' },
                { id: 'shopify', label: 'Shopify Webhooks', count: 0, desc: 'অটো স্টক মাইনাস ও অর্ডার অ্যালার্ট', icon: ShoppingBag, badgeColor: 'bg-green-600', activeBg: 'bg-green-50/70 text-green-700 border-green-150 dark:bg-green-950/20 dark:text-green-400 dark:border-green-950/40' },
                { id: 'telegram', label: 'Telegram Bot API', count: 0, desc: 'setWebhook ও চ্যাট প্যানেল', icon: Send, badgeColor: 'bg-blue-500', activeBg: 'bg-blue-50/70 text-blue-700 border-blue-150 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-950/40' },
                { id: 'instagram', label: 'Instagram Graph API', count: 0, desc: 'Comment-to-DM অটো রিপ্লাই', icon: Instagram, badgeColor: 'bg-pink-600', activeBg: 'bg-pink-50/70 text-pink-700 border-pink-150 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-950/40' },
                { id: 'voice_ai', label: 'Voice Message AI', count: 0, desc: 'ভয়েস ও টেক্সট টু ভয়েস কনভার্টার', icon: Mic, badgeColor: 'bg-indigo-500', activeBg: 'bg-indigo-50/70 text-indigo-700 border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-950/40' },
                { id: 'logs', label: 'Terminal Logs', count: 0, desc: 'লাইভ অ্যাক্টিভিটি কনসোল', icon: Terminal, badgeColor: 'bg-slate-600', activeBg: 'bg-slate-100 text-indigo-700 border-slate-200 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700' }
              ].map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                      isActive 
                        ? tab.activeBg + ' shadow-sm font-bold' 
                        : 'bg-white dark:bg-slate-950 text-gray-500 hover:text-gray-900 hover:bg-slate-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-900 border-gray-100 dark:border-slate-800/60 shadow-sm'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' 
                        : 'bg-slate-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-slate-800'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-bold truncate">{tab.label}</h4>
                        {tab.count > 0 && (
                          <span className={`shrink-0 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] ${tab.badgeColor} text-white font-black rounded-full px-1 animate-pulse`}>
                            {tab.count}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'opacity-85' : 'text-gray-400 dark:text-gray-500'}`}>{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-slate-850 text-center bg-slate-50/50 dark:bg-slate-950">
            <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">System Node Active</p>
          </div>
        </div>

        {/* Playgound & Config sidebar */}
        {!['shopify', 'telegram', 'instagram', 'voice_ai', 'logs'].includes(activeTab) && (
          <div className="w-full lg:w-96 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 overflow-y-auto custom-scrollbar p-6 shrink-0 flex flex-col justify-between transition-colors">
          
          {/* Active Integration Documentation & Webhook Endpoint configuration */}
          <div className="space-y-6">
            
            {activeTab === 'woocommerce' && (
              <div className="space-y-5">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-950/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">WooCommerce Integration</h3>
                  </div>
                  <p className="text-xs text-indigo-700/80 dark:text-indigo-400 leading-relaxed">
                    আপনার ওয়ার্ডপ্রেস প্যানেলে WooCommerce Webhooks মেনু থেকে নিচের Endpoint URL-টি সেট করুন। কোনো কাস্টমার অর্ডার দিলে তা সরাসরি এই ড্যাশবোর্ডে তালিকাভুক্ত হবে।
                  </p>
                </div>

                {/* WooCommerce Webhook Step-by-Step Connection Guide */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-gray-150 dark:border-slate-805 space-y-3">
                  <h4 className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200/65 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                    ⚙️ Webhook Setup Guide (ধাপ-বাই-ধাপ নির্দেশিকা)
                  </h4>
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">১. Name (নাম):</p>
                      <p className="text-gray-600 dark:text-gray-400 pl-3 leading-relaxed text-[11px]">
                        যেকোনো একটি সনাক্তকরণ নাম লিখুন। যেমন: <code className="bg-gray-150 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-[10px]">Zender POS Sync</code>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">২. Status (অবস্থা):</p>
                      <p className="text-gray-600 dark:text-gray-400 pl-3 leading-relaxed text-[11px]">
                        অবশ্যই <span className="font-bold text-emerald-600 text-[11px]">"Active"</span> বোতামটি সিলেক্ট করুন। (অন্যথায় ডেটা পাঠানো বন্ধ থাকবে)।
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">৩. Topic (টপিক):</p>
                      <p className="text-gray-600 dark:text-gray-300 pl-3 leading-relaxed text-[11px]">
                        ড্রপডাউন লিস্ট থেকে <span className="font-bold text-gray-800 dark:text-white">"Order created"</span> (অথবা <code className="font-mono text-[10px] bg-gray-150 dark:bg-slate-800 px-1 rounded">order.created</code>) সিলেক্ট করুন। কাস্টমার নতুন অর্ডার সাবমিট করলে এটি অটো-ট্রিগার হবে।
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">৪. Action event (যদি থাকে):</p>
                      <p className="text-gray-600 dark:text-gray-400 pl-3 leading-relaxed text-[11px]">
                        টপিক "Order created" দিলে এই অংশটি অটোমেটিক্যালি হ্যান্ডেল হবে, তাই এটি পরিবর্তন না করে ডিফল্ট রাখুন।
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">৫. Delivery URL (ডেলিভারি ইউআরএল):</p>
                      <p className="text-gray-600 dark:text-gray-400 pl-3 leading-relaxed text-[11px]">
                        নিচে দেওয়া <span className="font-bold">"Webhook Link"</span>-টি হুবহু কপি করে এখানে পেস্ট করুন।
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">৬. Secret (গোপন কোড - ঐচ্ছিক):</p>
                      <p className="text-gray-600 dark:text-gray-400 pl-3 leading-relaxed text-[11px]">
                        এটি ফাঁকা (Empty) রাখতে পারেন, এর কোনো প্রয়োজন নেই।
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">৭. API Version (এপিআই সংস্করণ):</p>
                      <p className="text-gray-600 dark:text-gray-300 pl-3 leading-relaxed text-[11px]">
                        লিস্ট থেকে অবশ্যই <span className="font-bold text-gray-800 dark:text-white">"WP REST API Integration v3"</span> সিলেক্ট করুন। এটি সবচেয়ে আধুনিক সংস্করণ।
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Webhook Link (Endpoint)</span>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg p-2 overflow-hidden mb-3">
                      <input 
                        type="text" 
                        readOnly 
                        value={wooWebhookEndpoint} 
                        className="bg-transparent text-xs text-gray-600 dark:text-gray-300 flex-1 outline-none font-mono"
                      />
                      <button 
                        onClick={() => copyToClipboard(wooWebhookEndpoint, setCopiedWooUrl)}
                        className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold rounded text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                      >
                        {copiedWooUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedWooUrl ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Connection status indicator panel */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">কানেকশন স্ট্যাটাস (Connection Status)</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${data.woo_webhook_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-wider ${data.woo_webhook_active ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-450'}`}>
                            {data.woo_webhook_active ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>

                      {data.woo_last_ping ? (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal">
                          সর্বশেষ সচলতা: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{new Date(data.woo_last_ping).toLocaleTimeString()}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-400 leading-normal">
                          কোনো ওয়েবহুক কার্যক্রম রেকর্ড করা হয়নি।
                        </p>
                      )}

                      <button
                        onClick={verifyWooConnection}
                        disabled={verifyingWoo}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-900/40 rounded-lg text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 transition-all disabled:opacity-50"
                      >
                        {verifyingWoo ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                            যাচাই করা হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Activity className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            কানেকশন যাচাই করুন (Verify Webhook)
                          </>
                        )}
                      </button>

                      {wooVerifyMessage && (
                        <div className="text-[10px] bg-indigo-55/10 text-indigo-650 dark:text-indigo-350 p-2 rounded-md font-medium text-center border border-indigo-200/30 animate-fade-in break-words">
                          {wooVerifyMessage}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Simulated Order Sandbox */}
                <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Terminal className="w-3.5 h-3.5 text-gray-400" />
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">অর্ডার সিমুলেটর (টেস্টিং)</h4>
                  </div>
                  
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-gray-100 dark:border-slate-900/60 text-xs">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">কাস্টমারের নাম</label>
                      <input 
                        type="text"
                        value={simWooName}
                        onChange={e => setSimWooName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">মোবাইল নম্বর (Customer Mobile)</label>
                      <input 
                        type="text"
                        value={simWooPhone}
                        onChange={e => setSimWooPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none font-mono"
                        placeholder="e.g. 01712345678"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">ঠিকানা (Customer Address)</label>
                      <input 
                        type="text"
                        value={simWooAddress}
                        onChange={e => setSimWooAddress(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                        placeholder="e.g. Dhanmondi, Dhaka"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">প্রোডাক্ট নম্বর / SKU</label>
                      <input 
                        type="text"
                        value={simWooProductNo}
                        onChange={e => setSimWooProductNo(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none font-mono"
                        placeholder="e.g. PRD-1024"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">অর্ডারের মোট মূল্য</label>
                      <input 
                        type="text"
                        value={simWooTotal}
                        onChange={e => setSimWooTotal(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">ক্রয়কৃত পন্যসমূহ</label>
                      <textarea 
                        rows={2}
                        value={simWooItems}
                        onChange={e => setSimWooItems(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">পেমেন্ট স্ট্যাটাস (Payment Status)</label>
                      <select 
                        value={simWooPaymentStatus}
                        onChange={e => setSimWooPaymentStatus(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                      >
                        <option value="cash_on_delivery">Cash on Delivery (ক্যাশ অন ডেলিভারি)</option>
                        <option value="paid">Paid (পেইড)</option>
                        <option value="unpaid">Unpaid (আনপেইড)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">প্রাথমিক ডেলিভারি স্ট্যাটাস</label>
                      <select 
                        value={simWooDeliveryStatus}
                        onChange={e => setSimWooDeliveryStatus(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                      >
                        <option value="pending_shipment">Pending Shipment (চালান অপেক্ষারত)</option>
                        <option value="confirmed_shipped">Shipped (চালানকৃত/কুরিয়ারে)</option>
                        <option value="delivered">Delivered (ডেলিভারি সম্পন্ন)</option>
                        <option value="cancelled">Cancelled (বাতিলকৃত)</option>
                      </select>
                    </div>
                    
                    <button 
                      onClick={simulateWooWebhook}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs mt-1 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                    >
                      <Zap className="w-3.5 h-3.5" /> সিমুলেট করুন (পুশ ডেটা)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'laravel' && (
              <div className="space-y-5">
                <div className="bg-sky-50/50 dark:bg-sky-950/25 p-4 rounded-xl border border-sky-100/50 dark:border-sky-950/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <h3 className="text-sm font-bold text-sky-900 dark:text-sky-300">Laravel PHP Gateway</h3>
                  </div>
                  <p className="text-xs text-sky-700/80 dark:text-sky-400 leading-relaxed">
                    আপনার লারাভেল প্রোজেক্টের কন্ট্রোলারে `Http` ক্লায়েন্ট ব্যবহার করে সরাসরি ডেটা পাঠান আমাদের এই নিরাপদ গেটওয়েতে।
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Laravel API Host (Endpoint)</span>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg p-2 overflow-hidden">
                      <input 
                        type="text" 
                        readOnly 
                        value={larWebhookEndpoint} 
                        className="bg-transparent text-xs text-gray-600 dark:text-gray-300 flex-1 outline-none font-mono"
                      />
                      <button 
                        onClick={() => copyToClipboard(larWebhookEndpoint, setCopiedLarUrl)}
                        className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold rounded text-sky-600 dark:text-sky-400 flex items-center gap-1"
                      >
                        {copiedLarUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedLarUrl ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Secure Gateway Key</label>
                    <input 
                      type="password"
                      value={larSecret}
                      onChange={e => setLarSecret(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* Laravel Simulation Sandbox */}
                <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Terminal className="w-3.5 h-3.5 text-gray-400" />
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">লারাভেল ইভেন্ট সিমুলেটর</h4>
                  </div>
                  
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-gray-100 dark:border-slate-900/60 text-xs">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">ইভেন্ট ধরণ (Event Type)</label>
                      <input 
                        type="text"
                        value={simLarEvent}
                        onChange={e => setSimLarEvent(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">ইভেন্ট মেটাডেটা / ডেটা (JSON Payload)</label>
                      <textarea 
                        rows={3}
                        value={simLarPayload}
                        onChange={e => setSimLarPayload(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none resize-none font-mono"
                      />
                    </div>
                    
                    <button 
                      onClick={simulateLaravelWebhook}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs mt-1 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/10"
                    >
                      <Zap className="w-3.5 h-3.5" /> ডেটা পুশ করুন
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'facebook' && (
              <div className="space-y-5">
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100/50 dark:border-blue-950/50">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-450" />
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300">Facebook Messenger API</h3>
                  </div>
                  <p className="text-xs text-blue-700/80 dark:text-blue-400 leading-relaxed">
                    ফেসবুক পেজ মেসেঞ্জার প্ল্যাটফর্মের সাথে অফিশিয়াল সংযোগ লাইভ করতে মেটা গ্রাফ কনফিগারেশন সেট করুন।
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Meta Webhook Callback URL</span>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg p-2 overflow-hidden">
                      <input 
                        type="text" 
                        readOnly 
                        value={fbWebhookEndpoint} 
                        className="bg-transparent text-xs text-gray-600 dark:text-gray-300 flex-1 outline-none font-mono"
                      />
                      <button 
                        onClick={() => copyToClipboard(fbWebhookEndpoint, setCopiedFbUrl)}
                        className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold rounded text-blue-600 dark:text-blue-400 flex items-center gap-1"
                      >
                        {copiedFbUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedFbUrl ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Meta Verify Token</label>
                    <input 
                      type="text"
                      readOnly
                      value={fbVerifyToken}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 dark:text-gray-400 select-all cursor-text outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Page Access Token</label>
                    <input 
                      type="password"
                      value={fbPageToken}
                      onChange={e => setFbPageToken(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* Facebook Webhook Simulation Sandbox */}
                <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Terminal className="w-3.5 h-3.5 text-gray-400" />
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">মেসেজ রিসিভার টেস্ট</h4>
                  </div>
                  
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-gray-100 dark:border-slate-900/60 text-xs">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">গ্রাহকের নাম (Sender Name)</label>
                      <input 
                        type="text" 
                        value={simFbSender}
                        onChange={e => setSimFbSender(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">ফেসবুক মেসেজ টেক্সট</label>
                      <textarea 
                        rows={2}
                        value={simFbText}
                        onChange={e => setSimFbText(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none resize-none"
                      />
                    </div>
                    
                    <button 
                      onClick={simulateFbWebhook}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs mt-1 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10"
                    >
                      <Zap className="w-3.5 h-3.5" /> ফেক মেসেজ পাঠান
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'whatsapp_ai' && (
              <div className="space-y-5">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-950/50">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">WhatsApp Expert Bot</h3>
                  </div>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400 leading-relaxed">
                    SellersCampus AI চ্যাট ইঞ্জিনের সাথে আপনার কাস্টমারদের মেসেজগুলোর সরাসরি অটো-রিপ্লাই এবং অর্ডার প্রসেসিং সিস্টেম পরীক্ষা করুন।
                  </p>
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-gray-150 dark:border-slate-805 text-xs">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200/50 dark:border-slate-800 pb-2">
                    🧪 কাস্টমার মেসেজ সিমুলেটর
                  </h4>

                  <div className="space-y-2.5 mt-2">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">কাস্টমারের নাম</label>
                      <input 
                        type="text" 
                        value={simWaSender}
                        onChange={e => setSimWaSender(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">মোবাইল নম্বর</label>
                      <input 
                        type="text" 
                        value={simWaPhone}
                        onChange={e => setSimWaPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">হোয়াটসঅ্যাপ মেসেজ টেক্সট</label>
                      <textarea 
                        rows={3}
                        value={simWaText}
                        onChange={e => setSimWaText(e.target.value)}
                        placeholder="যেমন: পাঞ্জাবির দাম কত?"
                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-md px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none resize-none"
                      />
                    </div>

                    <button 
                      onClick={() => simulateWaWebhook()}
                      disabled={isWaReplyLoading}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs mt-1 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/15"
                    >
                      <Zap className="w-3.5 h-3.5" /> মেসেজ পুশ করুন
                    </button>
                  </div>
                </div>

                <div className="space-y-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900/60 dark:to-slate-950/60 p-3.5 rounded-xl border border-indigo-100 dark:border-slate-850 text-xs">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    🎙️ Voice Message AI Simulation
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    গ্রাহকদের পাঠানো ভয়েস নোট স্পীচ-টু-টেক্সট কনভার্শন এবং অটো-অর্ডার জেনারেশন পরীক্ষা করুন।
                  </p>

                  <button
                    onClick={simulateWaVoiceNote}
                    disabled={isWaProcessingVoice}
                    className={`w-full py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow ${
                      isWaProcessingVoice 
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/15'
                    }`}
                  >
                    {isWaProcessingVoice ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recording & translating...
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" /> ভয়েস অর্ডার সিমুলেশন
                      </>
                    )}
                  </button>
                  {isWaProcessingVoice && (
                    <div className="flex items-center gap-1.5 justify-center mt-2">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-800 hidden lg:block">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
              Secure Gateway Sync v1.4
            </p>
          </div>

        </div>
        )}

        {/* Dynamic Display Area based on tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {['shopify', 'telegram', 'instagram', 'voice_ai', 'logs'].includes(activeTab) && (
            <IntegrationsAddons activeSubTab={activeTab as 'shopify' | 'telegram' | 'instagram' | 'voice_ai' | 'logs'} hideSidebar={true} />
          )}

          {activeTab === 'woocommerce' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
              
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">WooCommerce অর্ডারসমূহ (Live Sync)</h2>
                    <p className="text-gray-450 text-xs mt-1">ওয়ার্ডপ্রেস ওয়েবসাইট থেকে ওয়েবহুকের মাধ্যমে রিসিভকৃত অর্ডার সমূহ</p>
                  </div>
                  <span className={`px-2.5 py-1 ${data.woo_webhook_active ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400'} rounded-full font-bold flex items-center gap-1.5 text-[10px] uppercase`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${data.woo_webhook_active ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></span> {data.woo_webhook_active ? 'Endpoint Live' : 'Endpoint Pending'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 dark:text-gray-500 font-semibold tracking-wider text-[10px] uppercase h-10">
                        <th className="pb-3 text-center w-16">অর্ডার নং</th>
                        <th className="pb-3">গ্রাহক</th>
                        <th className="pb-3">আইটেম সমুহ</th>
                        <th className="pb-3 w-28">মোট দাম</th>
                        <th className="pb-3 w-28 text-center">স্ট্যাটাস</th>
                        <th className="pb-3 w-36 text-right">কার্যক্রম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-900">
                      {data.wooOrders.map(order => (
                        <React.Fragment key={order.id}>
                          <tr 
                            onClick={() => setExpandedWooOrderId(expandedWooOrderId === order.id ? null : order.id)}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 cursor-pointer transition-colors h-16 border-b border-gray-50 dark:border-slate-900/60"
                          >
                            <td className="font-mono text-gray-800 dark:text-white font-bold text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {expandedWooOrderId === order.id ? <ChevronDown className="w-3.5 h-3.5 text-indigo-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                {order.order_number}
                              </div>
                            </td>
                            <td>
                              <div className="py-1">
                                <p className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                                  {order.customer_name}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                  <span>{order.customer_email}</span>
                                  {order.customer_phone && <span className="text-gray-500">• {order.customer_phone}</span>}
                                </p>
                              </div>
                            </td>
                            <td>
                              <div className="max-w-xs py-1">
                                <p className="text-gray-650 dark:text-gray-300 truncate font-medium">{order.items}</p>
                                <p className="text-[9px] text-gray-400 font-mono font-semibold">SKU: {order.product_number || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{order.total}</td>
                            <td>
                              <div className="flex flex-col items-center gap-1.5 py-1">
                                {/* Order confirmation */}
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold capitalize border ${
                                  order.status === 'pending' ? 'bg-amber-50/50 dark:bg-amber-955/20 text-amber-700 border-amber-200/50' :
                                  order.status === 'confirmed' ? 'bg-emerald-50/50 dark:bg-emerald-955/20 text-emerald-700 border-emerald-200/50' :
                                  'bg-rose-50/50 dark:bg-rose-955/20 text-rose-700 border-rose-200/50'
                                }`}>
                                  Confirmation: {order.status === 'pending' ? 'Pending' : order.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                                </span>

                                <div className="flex gap-1">
                                  {/* Payment status badge */}
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    order.payment_status === 'paid' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40' :
                                    order.payment_status === 'unpaid' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/40' :
                                    'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/40'
                                  }`}>
                                    {order.payment_status === 'paid' ? 'PAID' : order.payment_status === 'unpaid' ? 'UNPAID' : 'COD'}
                                  </span>

                                  {/* Delivery status badge */}
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    order.delivery_status === 'delivered' ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/40' :
                                    order.delivery_status === 'confirmed_shipped' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-450 border border-sky-200/40' :
                                    order.delivery_status === 'cancelled' ? 'bg-red-50 text-red-650' :
                                    'bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {order.delivery_status === 'delivered' ? 'Delivered' : 
                                     order.delivery_status === 'confirmed_shipped' ? 'Shipped' : 
                                     order.delivery_status === 'cancelled' ? 'Cancelled' : 'Pending Ship'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                {order.status === 'pending' ? (
                                  <div className="flex gap-1.5 justify-end">
                                    <button 
                                      onClick={() => updateWooStatus(order.id, { status: 'confirmed' })}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-0.5 transition-colors active:scale-95 text-[10px]"
                                    >
                                      <Check className="w-3 h-3" /> নিশ্চিত
                                    </button>
                                    <button 
                                      onClick={() => updateWooStatus(order.id, { status: 'declined' })}
                                      className="px-2 py-1 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-955/40 border border-rose-250 font-bold rounded-lg flex items-center gap-0.5 transition-colors active:scale-95 text-[10px]"
                                    >
                                      <X className="w-3 h-3" /> বাতিল
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-gray-400 font-semibold flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded px-1.5 py-0.5">
                                    <Clock className="w-3 h-3" /> Checked
                                  </span>
                                )}
                                <button 
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    setExpandedWooOrderId(expandedWooOrderId === order.id ? null : order.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedWooOrderId === order.id && (
                            <tr key={order.id + '-details'} className="bg-slate-50/40 dark:bg-slate-950/40">
                              <td colSpan={6} className="p-4 border-b border-gray-100 dark:border-slate-800">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                                  
                                  {/* Column 1: Customer Contact + Address */}
                                  <div className="lg:col-span-4 space-y-3.5 border-r border-gray-100 dark:border-slate-800/60 pr-4">
                                    <div>
                                      <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block mb-2">গ্রাহক ও শিপিং বিবরণ (Customer & Shipping Details)</span>
                                      <div className="space-y-1.5 bg-white dark:bg-slate-950 p-3 rounded-xl border border-gray-100 dark:border-slate-900">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                                            {order.customer_name[0] || 'U'}
                                          </div>
                                          <div>
                                            <p className="font-bold text-gray-800 dark:text-white text-xs">{order.customer_name}</p>
                                            <p className="text-[9px] text-gray-400 font-mono">{order.customer_email}</p>
                                          </div>
                                        </div>
                                        <p className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-mono font-bold pl-1 pt-1.5">
                                          <Smartphone className="w-3.5 h-3.5 text-gray-450" /> {order.customer_phone || 'ফ্রি/মোবাইল নং নেই'}
                                        </p>
                                        <div className="mt-2 pt-2 border-t border-gray-50 dark:border-slate-900/60">
                                          <p className="text-[10px] text-gray-400">ডেলিভারি ঠিকানা সমূহ:</p>
                                          <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-md mt-1 border border-slate-100/50 dark:border-slate-900/40">
                                            {order.customer_address || 'কোনো ঠিকানা প্রদান করা হয়নি'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block mb-1">অর্ডারকৃত পণ্যসমূহ (Products ordered)</span>
                                      <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-gray-100 dark:border-slate-900">
                                        <p className="font-bold text-gray-800 dark:text-white">{order.items}</p>
                                        <div className="mt-1 flex items-center justify-between text-[10px]">
                                          <span className="text-gray-400">প্রোডাক্ট কোড (Product Number):</span>
                                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/25 px-1.5 py-0.5 rounded">
                                            {order.product_number || 'PRD-' + Math.floor(Math.random() * 9000 + 1000)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Column 2: Confirmation / Payment / Delivery Status Controls */}
                                  <div className="lg:col-span-4 space-y-4 border-r border-gray-100 dark:border-slate-800/60 pr-4">
                                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block">অর্ডার স্যাকশন ও কনফার্মেশন (Confirmation & Payment status)</span>
                                    
                                    {/* Order confirmation controls */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] text-gray-400 font-bold block">১. অর্ডার কনফার্মেশন (Order Confirmation):</label>
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => updateWooStatus(order.id, { status: 'confirmed' })}
                                          className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10px] border transition-all ${
                                            order.status === 'confirmed' 
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                            : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                                          }`}
                                        >
                                          Confirmed
                                        </button>
                                        <button 
                                          onClick={() => updateWooStatus(order.id, { status: 'pending' })}
                                          className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10px] border transition-all ${
                                            order.status === 'pending' 
                                            ? 'bg-amber-500 text-white border-amber-500 shadow'
                                            : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                                          }`}
                                        >
                                          Pending
                                        </button>
                                        <button 
                                          onClick={() => updateWooStatus(order.id, { status: 'declined' })}
                                          className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10px] border transition-all ${
                                            order.status === 'declined' 
                                            ? 'bg-rose-600 text-white border-rose-600 shadow'
                                            : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                                          }`}
                                        >
                                          Declined
                                        </button>
                                      </div>
                                    </div>

                                    {/* Payment status control */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] text-gray-400 font-bold block">২. পেমেন্ট স্ট্যাটাস (Payment Status):</label>
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => updateWooStatus(order.id, { payment_status: 'paid' })}
                                          className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10px] border transition-all ${
                                            order.payment_status === 'paid' 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                                            : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50'
                                          }`}
                                        >
                                          Paid
                                        </button>
                                        <button 
                                          onClick={() => updateWooStatus(order.id, { payment_status: 'cash_on_delivery' })}
                                          className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10px] border transition-all ${
                                            order.payment_status === 'cash_on_delivery' 
                                            ? 'bg-amber-600 text-white border-amber-600 shadow'
                                            : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50'
                                          }`}
                                        >
                                          COD
                                        </button>
                                        <button 
                                          onClick={() => updateWooStatus(order.id, { payment_status: 'unpaid' })}
                                          className={`flex-1 py-1 px-2 rounded-lg font-bold text-[10px] border transition-all ${
                                            order.payment_status === 'unpaid' 
                                            ? 'bg-red-500 text-white border-red-500 shadow'
                                            : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-slate-50'
                                          }`}
                                        >
                                          Unpaid
                                        </button>
                                      </div>
                                    </div>

                                    {/* Delivery confirmation status */}
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] text-gray-400 font-bold block">৩. ডেলিভারি কনফার্মেশন (Delivery Confirmation):</label>
                                      <select 
                                        value={order.delivery_status || 'pending_shipment'}
                                        onChange={e => updateWooStatus(order.id, { delivery_status: e.target.value as any })}
                                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 font-bold"
                                      >
                                        <option value="pending_shipment">Pending Shipment (চালান অপেক্ষারত)</option>
                                        <option value="confirmed_shipped">Shipped (চালানকৃত/কুরিয়ারে)</option>
                                        <option value="delivered">Delivered (ডেলিভারি সম্পন্ন)</option>
                                        <option value="cancelled">Cancelled (বাতিলকৃত)</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Column 3: Custom Tracking Data Chronology */}
                                  <div className="lg:col-span-4 space-y-3.5">
                                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block">৪. লাইভ ট্র্যাকিং টাইমলাইন (Tracking History Logs)</span>
                                    
                                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-gray-100 dark:border-slate-900 space-y-3 max-h-36 overflow-y-auto custom-scrollbar">
                                      {order.tracking_history && order.tracking_history.map((t, idx) => (
                                        <div key={idx} className="relative pl-3 border-l-2 border-indigo-500/20 last:border-0 pb-1">
                                          <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                                          <div className="flex items-center justify-between text-[9px]">
                                            <span className="font-extrabold text-gray-800 dark:text-gray-200">{t.status}</span>
                                            <span className="text-gray-400 font-mono">{new Date(t.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                          </div>
                                          <p className="text-[9px] text-gray-400 leading-snug mt-0.5">{t.notes}</p>
                                        </div>
                                      ))}
                                      {(!order.tracking_history || order.tracking_history.length === 0) && (
                                        <p className="text-[9px] text-gray-400 italic">কোনো ট্র্যাকিং বিবরণী রিসিভ হয়নি।</p>
                                      )}
                                    </div>

                                    {/* Manual New Tracking Event Generator */}
                                    <div className="bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-2.5 rounded-xl space-y-2">
                                      <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase select-none">নতুন ট্র্যাকিং বিবরণ যোগ করুন:</p>
                                      <div className="grid grid-cols-1 gap-1.5">
                                        <input 
                                          type="text"
                                          placeholder="মাইলস্টোন যেমন: কুরিয়ারে পাঠানো হয়েছে"
                                          value={newLogStatus}
                                          onChange={e => setNewLogStatus(e.target.value)}
                                          className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded px-2 py-1 text-[9px] text-gray-800 dark:text-white"
                                        />
                                        <input 
                                          type="text"
                                          placeholder="মাইলস্টোন বিবরণী"
                                          value={newLogNotes}
                                          onChange={e => setNewLogNotes(e.target.value)}
                                          className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded px-2 py-1 text-[9px] text-gray-800 dark:text-white"
                                        />
                                        <button 
                                          onClick={async () => {
                                            if (!newLogStatus.trim()) return;
                                            await updateWooStatus(order.id, {
                                              new_tracking: { status: newLogStatus, notes: newLogNotes }
                                            });
                                            setNewLogStatus('প্যাকেজিং সফল');
                                            setNewLogNotes('অর্ডারটি জেন্ডার পস মার্চেন্ট হাবে সুরক্ষিতভাবে প্যাকেজ করা হয়েছে।');
                                          }}
                                          className="py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[9px] transition-colors flex items-center justify-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" /> আপডেট যোগ করুন
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}

                      {data.wooOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-gray-400">
                            <ShoppingBag className="w-12 h-12 text-gray-200 dark:text-slate-800 mx-auto mb-3" />
                            <p>কোনো অর্ডার পাওয়া যায়নি। সাইডবার সিমুলেটর দিয়ে প্রথম অর্ডারটি পুশ করুন।</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'laravel' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
              
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">Laravel PHP গেটওয়ে ইভেন্টস ও লোগস</h2>
                    <p className="text-gray-450 text-xs mt-1">লারাভেল কাস্টম সিস্টেম থেকে গেটওয়ের মাধ্যমে সংগৃহীত রিয়েল-টাইম লাইভ ইভেন্ট ডাটা</p>
                  </div>
                  <span className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 rounded-full font-bold flex items-center gap-1.5 text-[10px] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span> Sync Enabled
                  </span>
                </div>

                <div className="space-y-4">
                  {data.laravelEvents.map(event => (
                    <div 
                      key={event.id}
                      className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 hover:border-sky-300 dark:hover:border-sky-950 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-sky-500"></span>
                            <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">{event.event_type}</h4>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-1">
                            রিসিভড হয়েছে: {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            event.status === 'unread' ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-700' : 'bg-green-100 dark:bg-green-950/20 text-green-700'
                          }`}>
                            {event.status === 'unread' ? 'নতুন আপডেট' : 'সমাধান সম্পন্ন'}
                          </span>

                          {event.status === 'unread' && (
                            <button 
                              onClick={() => resolveLaravelEvent(event.id, 'resolved')}
                              className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-bold rounded hover:bg-slate-50 text-gray-700 dark:text-gray-300 transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 p-3 rounded-lg font-mono text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                        <pre className="text-[11px] leading-relaxed">{JSON.stringify(event.payload, null, 2)}</pre>
                      </div>
                    </div>
                  ))}

                  {data.laravelEvents.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <Terminal className="w-12 h-12 text-gray-200 dark:text-slate-800 mx-auto mb-3" />
                      <p>কোনো লারাভেল ইভেন্ট রেকর্ড নেই। ড্যাশবোর্ড সাইডবার এপিআই টেস্ট প্যানেল রান করুন।</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {activeTab === 'facebook' && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Inbox Left: Threads list */}
              <div className="w-72 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-950 shrink-0 transition-colors">
                <div className="p-4 border-b border-gray-150 dark:border-slate-800 shrink-0">
                  <h3 className="font-extrabold text-sm text-gray-800 dark:text-white uppercase tracking-wider">মেসেজার ইনবক্স (Omnichannel)</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {data.fbChats.map(thread => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveFbThreadId(thread.id)}
                      className={`w-full text-left p-4 flex items-start gap-3 border-b border-gray-100 dark:border-slate-800 transition-colors ${
                        activeFbThreadId === thread.id 
                          ? 'bg-slate-50 dark:bg-slate-900 border-l-4 border-l-indigo-600' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 text-xs text-center shadow-inner uppercase">
                        {thread.customer_name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="font-extrabold text-xs text-gray-800 dark:text-white truncate">{thread.customer_name}</p>
                          {thread.unread && (
                            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-450 truncate">
                          {thread.messages[thread.messages.length - 1]?.text || 'No messages'}
                        </p>
                      </div>
                    </button>
                  ))}

                  {data.fbChats.length === 0 && (
                    <div className="text-center py-10 text-gray-400 px-4">
                      <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs">কোনো অ্যাক্টিভ ফেসবুক চ্যাট পাওয়া যায়নি। সিমুলেট করুন প্রথম বার্তা।</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inbox Right: Thread conversation view */}
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 relative">
                {activeThread ? (
                  <>
                    {/* Active thread header */}
                    <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between shrink-0 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {activeThread.customer_name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-gray-800 dark:text-white">{activeThread.customer_name}</p>
                          <span className="text-[9px] text-gray-400 font-mono">ID: {activeThread.customer_id}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider">
                        Meta Platform API Connected
                      </span>
                    </div>

                    {/* Messages sequence stream */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar lg:max-h-[calc(100vh-21rem)] flex flex-col">
                      {activeThread.messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender === 'system' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm text-xs ${
                            message.sender === 'system' 
                              ? 'bg-indigo-600 text-white rounded-br-none' 
                              : 'bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-slate-850'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-line">{message.text}</p>
                            <span className={`block text-[9px] mt-1.5 text-right font-medium opacity-50 ${
                              message.sender === 'system' ? 'text-indigo-100' : 'text-gray-450'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Text Bar */}
                    <div className="p-4 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 shrink-0 transition-colors">
                      <div className="flex gap-2">
                        <textarea 
                          rows={2}
                          value={fbReplyText}
                          onChange={(e) => setFbReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendFbReply();
                            }
                          }}
                          placeholder="আপনার উত্তর লিখুন এবং এন্টার প্রেস করুন..."
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-150 resize-none focus:outline-none focus:border-indigo-600"
                        />
                        <button 
                          onClick={sendFbReply}
                          disabled={!fbReplyText.trim()}
                          className="px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-600/10 active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
                    <MessageSquare className="w-12 h-12 text-gray-200 dark:text-slate-810 mb-2" />
                    <p className="text-xs">বাম পাশের তালিকা থেকে চ্যাট থ্রেড নির্বাচন করুন</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'whatsapp_ai' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
              
              {/* WhatsApp Sub-Tabs Bar */}
              <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 shrink-0 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">WhatsApp AI Expert Bot</h2>
                    <p className="text-[10px] text-gray-400 font-medium">রিয়েল-টাইম এআই অটোমেশন, স্টক ক্যাটালগ ও অর্ডার সেটিংস হাব</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  <button
                    onClick={() => setWaSubTab('chats')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      waSubTab === 'chats'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">লাইভ ইনবক্স</span>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 text-[9px] font-black rounded-full">
                      {(data.waChats || []).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setWaSubTab('orders')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      waSubTab === 'orders'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">এআই অর্ডারস</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] font-black rounded-full">
                      {(data.aiOrders || []).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setWaSubTab('catalog')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      waSubTab === 'catalog'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">প্রোডাক্ট ক্যাটালগ</span>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 text-[9px] font-black rounded-full">
                      {(data.aiProducts || []).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setWaSubTab('settings')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      waSubTab === 'settings'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">কনফিগারেশন</span>
                  </button>
                </div>
              </div>

              {/* Sub-tab view body */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* 1. CHATS TAB */}
                {waSubTab === 'chats' && (
                  <div className="flex-1 flex overflow-hidden">
                    {/* WhatsApp Thread list */}
                    <div className="w-72 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-950 shrink-0 transition-colors">
                      <div className="p-4 border-b border-gray-150 dark:border-slate-800 shrink-0 flex items-center justify-between">
                        <h3 className="font-extrabold text-xs text-gray-800 dark:text-white uppercase tracking-wider">হোয়াটসঅ্যাপ ইনবক্স</h3>
                        <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-extrabold text-[8px] uppercase rounded">AI Live</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {(data.waChats || []).map(thread => (
                          <button
                            key={thread.id}
                            onClick={() => setActiveWaThreadId(thread.id)}
                            className={`w-full text-left p-4 flex items-start gap-3 border-b border-gray-100 dark:border-slate-800 transition-colors ${
                              activeWaThreadId === thread.id 
                                ? 'bg-slate-50 dark:bg-slate-900 border-l-4 border-l-emerald-600' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shrink-0 text-xs text-center shadow-inner uppercase">
                              {thread.customer_name.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <p className="font-extrabold text-xs text-gray-800 dark:text-white truncate">{thread.customer_name}</p>
                                {thread.unread && (
                                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full shrink-0"></span>
                                )}
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-[11px] text-gray-450 truncate flex-1">
                                  {thread.messages[thread.messages.length - 1]?.text || 'No messages'}
                                </p>
                                {thread.ai_automated && (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 font-black px-1 rounded uppercase tracking-wider shrink-0 scale-90">AI</span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}

                        {(data.waChats || []).length === 0 && (
                          <div className="text-center py-10 text-gray-400 px-4">
                            <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-xs">কোনো হোয়াটসঅ্যাপ চ্যাট পাওয়া যায়নি। সিমুলেটর দিয়ে প্রথম বার্তা পুশ করুন।</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conversation view */}
                    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 relative">
                      {activeWaThread ? (
                        <>
                          {/* Header */}
                          <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between shrink-0 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                {activeWaThread.customer_name.slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-extrabold text-xs text-gray-800 dark:text-white">{activeWaThread.customer_name}</p>
                                  <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black rounded uppercase">WhatsApp Client</span>
                                </div>
                                <span className="text-[9px] text-gray-400 font-mono">Phone: {activeWaThread.customer_phone}</span>
                              </div>
                            </div>

                            {/* AI bot switch controller */}
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-gray-150 dark:border-slate-800">
                              <span className="text-[10px] text-gray-500 font-bold">🤖 AI Auto-Reply Bot:</span>
                              <button
                                onClick={() => toggleWaAi(activeWaThread.id, activeWaThread.ai_automated)}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  activeWaThread.ai_automated ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    activeWaThread.ai_automated ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span className={`text-[9px] font-black uppercase ${
                                activeWaThread.ai_automated ? 'text-emerald-600' : 'text-gray-400'
                              }`}>
                                {activeWaThread.ai_automated ? 'On' : 'Off'}
                              </span>
                            </div>
                          </div>

                          {/* Messages stream */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar lg:max-h-[calc(100vh-21rem)] flex flex-col">
                            {activeWaThread.messages.map((message) => {
                              const isSystem = message.sender === 'system';
                              return (
                                <div 
                                  key={message.id}
                                  className={`flex ${isSystem ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs ${
                                    isSystem 
                                      ? 'bg-emerald-600 text-white rounded-br-none' 
                                      : 'bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-slate-850'
                                  }`}>
                                    {message.is_voice ? (
                                      <div className="space-y-2 min-w-[200px]">
                                        {/* Simulated voice wave and play button */}
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                            <Mic className="w-4 h-4 animate-pulse" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-1">
                                              <span className="w-1.5 h-3 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse"></span>
                                              <span className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse [animation-delay:0.1s]"></span>
                                              <span className="w-1.5 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                                              <span className="w-1.5 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse [animation-delay:0.3s]"></span>
                                              <span className="w-1.5 h-3 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-mono block mt-1">0:12</span>
                                          </div>
                                        </div>
                                        
                                        {/* AI Speech-to-Text Transcription box */}
                                        {message.voice_text_translation && (
                                          <div className="bg-emerald-50/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-emerald-100/50 dark:border-slate-800 mt-2">
                                            <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                                              <span>🗣️ AI Voice-to-Text Translation:</span>
                                            </p>
                                            <p className="text-[11px] text-gray-700 dark:text-gray-300 italic mt-1 leading-relaxed">
                                              "{message.voice_text_translation}"
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="leading-relaxed whitespace-pre-line">{message.text}</p>
                                    )}
                                    
                                    <span className={`block text-[9px] mt-1.5 text-right font-medium opacity-60 ${
                                      isSystem ? 'text-emerald-100' : 'text-gray-450'
                                    }`}>
                                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Chat Text Input Bar */}
                          <div className="p-4 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 shrink-0 transition-colors">
                            <div className="flex gap-2">
                              <textarea 
                                rows={2}
                                value={waReplyText}
                                onChange={(e) => setWaReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendWaReply();
                                  }
                                }}
                                placeholder="হোয়াটসঅ্যাপে গ্রাহককে উত্তর লিখুন এবং এন্টার প্রেস করুন..."
                                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-150 resize-none focus:outline-none focus:border-emerald-600"
                              />
                              <button 
                                onClick={sendWaReply}
                                disabled={!waReplyText.trim() || isWaReplyLoading}
                                className="px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-emerald-600/10 active:scale-95"
                              >
                                {isWaReplyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
                          <MessageSquare className="w-12 h-12 text-gray-200 dark:text-slate-800 mb-2" />
                          <p className="text-xs font-bold text-gray-500">বাম পাশের তালিকা থেকে চ্যাট থ্রেড নির্বাচন করুন</p>
                          <p className="text-[11px] text-gray-400 mt-1 max-w-sm text-center">সিমুলেশন প্যানেল থেকে কোনো মেসেজ পুশ করলে সরাসরি এখানে প্রদর্শিত হবে।</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. ORDERS TAB */}
                {waSubTab === 'orders' && (
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm">
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-800 dark:text-white">এআই জেনারেটেড অর্ডার ও লিড ট্র্যাকার</h3>
                        <p className="text-xs text-gray-400 mt-0.5">হোয়াটসঅ্যাপ চ্যাটে কাস্টমারের নাম, ফোন ও ঠিকানা পেয়ে জেমিনি এআই যে সমস্ত অর্ডার ড্রাফট বা সাবমিট করেছে।</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900">
                          মোট অর্ডার: {(data.aiOrders || []).length} টি
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {(data.aiOrders || []).map((order: any) => (
                        <div 
                          key={order.id}
                          className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-850 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-stretch"
                        >
                          {/* Left visual column */}
                          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-150 dark:border-slate-850 flex flex-col justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/10 md:w-48">
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-mono text-[10px] font-black rounded uppercase">
                                  {order.order_number}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium">অর্ডার টাইম:</span>
                              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-bold mt-0.5">
                                {new Date(order.created_at).toLocaleString('bn-BD', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                            
                            <div className="mt-4">
                              <span className="text-[10px] text-gray-400 font-medium block">অর্ডার স্ট্যাটাস:</span>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase mt-1 px-2 py-0.5 rounded-full ${
                                order.status === 'confirmed'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                                  : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'
                              }`}>
                                {order.status === 'confirmed' ? '● CONFIRMED (অনুমোদিত)' : '● PENDING REVIEW (অপেক্ষমাণ)'}
                              </span>
                            </div>
                          </div>

                          {/* Middle core customer & product details */}
                          <div className="flex-1 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-[11px] uppercase font-black tracking-wider text-gray-400">গ্রাহকের বিবরণ</h4>
                              <div>
                                <p className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{order.customer_name}</span>
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 font-bold font-mono mt-1 flex items-center gap-1">
                                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{order.customer_phone}</span>
                                </p>
                                <p className="text-[11px] text-gray-500 mt-1.5 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                                  📍 <span className="font-medium text-gray-600 dark:text-gray-300">ডেলিভারি ঠিকানা: </span>{order.customer_address}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2 sm:border-l sm:border-gray-100 sm:dark:border-slate-800 sm:pl-4">
                              <h4 className="text-[11px] uppercase font-black tracking-wider text-gray-400">অর্ডার প্রোডাক্ট ক্যাটালগ</h4>
                              <div>
                                <p className="text-xs font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg inline-block">
                                  {order.product_name}
                                </p>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                                  <div className="p-1.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-gray-100 dark:border-slate-850">
                                    <span className="text-[9px] text-gray-400 block font-bold">পরিমাণ</span>
                                    <span className="text-xs font-black text-gray-800 dark:text-white">{order.quantity} টি</span>
                                  </div>
                                  <div className="p-1.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-gray-100 dark:border-slate-850">
                                    <span className="text-[9px] text-gray-400 block font-bold">সর্বমোট বিল</span>
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{order.total}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right action column */}
                          <div className="p-5 border-t md:border-t-0 md:border-l border-gray-150 dark:border-slate-850 flex md:flex-col justify-center gap-2 shrink-0 bg-slate-50/20 dark:bg-slate-900/5">
                            {order.status !== 'confirmed' && (
                              <button
                                onClick={() => updateAiOrderStatus(order.id, 'confirmed')}
                                className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/10 active:scale-95"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>অর্ডার কনফার্ম করুন</span>
                              </button>
                            )}
                            
                            {order.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => updateAiOrderStatus(order.id, 'pending_review')}
                                  className="flex-1 md:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>হোল্ড করুন (Pending)</span>
                                </button>
                                <button
                                  onClick={() => setSelectedPrintOrder(order)}
                                  className="flex-1 md:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 active:scale-95"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>লেবেল প্রিন্ট করুন</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => deleteAiOrder(order.id)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="md:hidden">মুছে ফেলুন</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {(data.aiOrders || []).length === 0 && (
                        <div className="text-center py-16 bg-white dark:bg-slate-950 rounded-2xl border border-gray-150 dark:border-slate-800 text-gray-400">
                          <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                          <p className="text-sm font-black text-gray-500">কোনো এআই অর্ডার এখনও জেনারেট হয়নি</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">চ্যাটবট যখন সফলভাবে কাস্টমারের অর্ডার ডিটেইলস (নাম, মোবাইল, ঠিকানা) কালেক্ট করবে, তখন স্বয়ংক্রিয়ভাবে এখানে অর্ডার তৈরি হয়ে যাবে।</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. CATALOG TAB */}
                {waSubTab === 'catalog' && (
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                    
                    {/* Add/Edit Product Catalog Form Panel */}
                    <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                        <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">
                          {catalogId ? '🛍️ প্রোডাক্ট ক্যাটালগ এডিট করুন' : '🛍️ নতুন প্রোডাক্ট অ্যাড করুন (স্টক ও লাইভ ক্যাটালগ)'}
                        </h3>
                        {catalogId && (
                          <button 
                            onClick={() => {
                              setCatalogId('');
                              setCatalogName('');
                              setCatalogSku('');
                              setCatalogPrice('');
                              setCatalogStock('');
                              setCatalogDescription('');
                            }}
                            className="text-xs text-rose-600 hover:underline font-bold"
                          >
                            নতুন অ্যাড মোডে ফিরে যান
                          </button>
                        )}
                      </div>

                      <form onSubmit={catalogId ? editCatalogProduct : addCatalogProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">প্রোডাক্টের নাম (Name):</label>
                          <input 
                            type="text"
                            required
                            placeholder="যেমন: Cotton Panjabi"
                            value={catalogName}
                            onChange={(e) => setCatalogName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-150 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">এসকেইউ কোড (SKU ID):</label>
                          <input 
                            type="text"
                            required
                            placeholder="যেমন: PANJABI-101"
                            value={catalogSku}
                            onChange={(e) => setCatalogSku(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-150 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">প্রোডাক্ট মূল্য (Taka ৳):</label>
                          <input 
                            type="number"
                            required
                            placeholder="যেমন: 1250"
                            value={catalogPrice}
                            onChange={(e) => setCatalogPrice(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-150 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">স্টক ইউনিট (Stock Qty):</label>
                          <input 
                            type="number"
                            required
                            placeholder="যেমন: 45"
                            value={catalogStock}
                            onChange={(e) => setCatalogStock(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-150 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">সংক্ষিপ্ত বিবরণ ও বৈশিষ্ট্য (Description for AI Bot context):</label>
                          <input 
                            type="text"
                            placeholder="যেমন: ১০০% প্রিমিয়াম সুতি কাপড়ে তৈরি পাঞ্জাবি। কালার ব্লু, সাইজ ৪০, ৪২, ৪৪।"
                            value={catalogDescription}
                            onChange={(e) => setCatalogDescription(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-150 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={isCatalogSubmitting}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                          >
                            {isCatalogSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            <span>{catalogId ? 'ক্যাটালগ আপডেট করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Stock Table Bento Panel */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">লাইভ প্রোডাক্ট ও স্টক ডিরেক্টরি (Live Inventory)</h4>
                        <span className="text-[10px] text-gray-400">এআই এজেন্ট এই স্টক ডেটা দেখেই কাস্টমারকে সঠিক উত্তর দেবে</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 text-gray-500 font-bold border-b border-gray-150 dark:border-slate-850">
                              <th className="p-4">SKU / কোড</th>
                              <th className="p-4">প্রোডাক্টের নাম</th>
                              <th className="p-4">মূল্য (Price)</th>
                              <th className="p-4">স্টক পরিমাণ (Stock)</th>
                              <th className="p-4">সংক্ষিপ্ত বিবরণ</th>
                              <th className="p-4 text-center">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {(data.aiProducts || []).map((prod: any) => (
                              <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">{prod.sku}</td>
                                <td className="p-4 font-bold text-gray-800 dark:text-white">{prod.name}</td>
                                <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">৳ {prod.price}</td>
                                <td className="p-4">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    prod.stock > 0 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' 
                                      : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
                                  }`}>
                                    {prod.stock > 0 ? `${prod.stock} টি ইন-স্টক` : 'স্টক আউট'}
                                  </span>
                                </td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">{prod.description || 'বিবরণ দেওয়া হয়নি'}</td>
                                <td className="p-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setCatalogId(prod.id);
                                        setCatalogName(prod.name);
                                        setCatalogSku(prod.sku);
                                        setCatalogPrice(String(prod.price));
                                        setCatalogStock(String(prod.stock));
                                        setCatalogDescription(prod.description || '');
                                      }}
                                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
                                      title="এডিট করুন"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteCatalogProduct(prod.id)}
                                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                                      title="মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {(data.aiProducts || []).length === 0 && (
                              <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-400">
                                  কোনো প্রোডাক্ট এখনও ক্যাটালগে যুক্ত করা হয়নি।
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SETTINGS TAB */}
                {waSubTab === 'settings' && (
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                        <h3 className="text-sm font-extrabold text-gray-800 dark:text-white">এআই চ্যাটবট এজেন্ট কন্ট্রোল সেন্টার (Configuration Panel)</h3>
                        <p className="text-xs text-gray-400 mt-1">জেমিনি এআই মডেলের নির্দেশাবলী, এজেন্ট পরিচিতি ও স্বয়ংক্রিয় অর্ডার কনফার্মেশন কন্ট্রোল করুন।</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Agent Name */}
                        <div>
                          <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1.5">১. এআই সেলস এজেন্টের নাম (Agent Display Name):</label>
                          <input 
                            type="text"
                            required
                            placeholder="SellersCampus AI Copilot"
                            value={settingsAgentName}
                            onChange={(e) => setSettingsAgentName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-150 focus:outline-none focus:border-emerald-600"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">গ্রাহকের কাছে বটটি যে নামে নিজের পরিচয় দেবে।</p>
                        </div>

                        {/* Order Confirmation Logic */}
                        <div>
                          <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1.5">২. স্বয়ংক্রিয় অর্ডার অনুমোদন (Auto-Confirm Orders):</label>
                          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-gray-800 dark:text-white">অর্ডার সরাসরি কনফার্ম করুন</span>
                              <p className="text-[10px] text-gray-400 mt-0.5">এআই সফলভাবে ঠিকানা পেলে সাথে সাথে অর্ডারটি 'Approved/Confirmed' স্ট্যাটাসে নিয়ে যাবে।</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSettingsAutoConfirm(!settingsAutoConfirm)}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settingsAutoConfirm ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  settingsAutoConfirm ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Custom Bengali Prompt */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1.5">৩. কাস্টম এআই নির্দেশিকা ও প্রম্পট (System Prompt / Instructions):</label>
                          <textarea 
                            rows={6}
                            required
                            placeholder="যেমন: আপনি কাস্টমারের সাথে খুব নম্রভাবে বাংলায় কথা বলবেন। আপনার লক্ষ্য হলো গ্রাহককে আমাদের লেদার ওয়ালেটটি সেল করা এবং তার থেকে ডেলিভারির জন্য নাম, ঠিকানা ও সচল মোবাইল নাম্বার সংগ্রহ করা..."
                            value={settingsPrompt}
                            onChange={(e) => setSettingsPrompt(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-gray-800 dark:text-gray-150 resize-none focus:outline-none focus:border-emerald-600 font-mono"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">জেমিনি এআই মডেলকে কন্ট্রোল করার জন্য প্রফেশনাল সিস্টেম প্রম্পট। এখানে আপনার ব্যবসায়িক নিয়মাবলী যুক্ত করতে পারেন।</p>
                        </div>

                        {/* Fallback Message */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1.5">৪. সিস্টেম ফেইলর বা ফালব্যাক মেসেজ (Failure Fallback Message):</label>
                          <input 
                            type="text"
                            required
                            placeholder="জি ভাইয়া, আমি আপনার অর্ডার তথ্য বুঝতে পারছি না। দয়া করে সঠিক মোবাইল নাম্বার ও ঠিকানা দিন।"
                            value={settingsFallback}
                            onChange={(e) => setSettingsFallback(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-150 focus:outline-none focus:border-emerald-600"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">যদি কাস্টমার এমন প্রশ্ন করে যা এআই সমাধান করতে না পারে, তাহলে বট এই ব্যাকআপ মেসেজটি উত্তর দেবে।</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex justify-end">
                        <button
                          onClick={saveWaSettings}
                          disabled={isSettingsSubmitting}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/10 active:scale-95"
                        >
                          {isSettingsSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          <span>এআই কনফিগারেশন সংরক্ষণ করুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

        {selectedPrintOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-delivery-label, #printable-delivery-label * {
                  visibility: visible !important;
                }
                #printable-delivery-label {
                  position: fixed !important;
                  left: 50% !important;
                  top: 50% !important;
                  transform: translate(-50%, -50%) !important;
                  width: 450px !important;
                  margin: 0 !important;
                  padding: 20px !important;
                  border: 2px solid #000 !important;
                  box-shadow: none !important;
                  background: white !important;
                  color: black !important;
                  z-index: 9999999 !important;
                }
              }
            `}</style>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col border border-gray-200 dark:border-slate-800 animate-in fade-in-50 zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-white">ডেলিভারি লেবেল প্রিভিউ</h3>
                </div>
                <button 
                  onClick={() => setSelectedPrintOrder(null)}
                  className="p-1.5 hover:bg-gray-150 dark:hover:bg-slate-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Area Container */}
              <div className="p-6 overflow-y-auto max-h-[70vh] flex justify-center bg-slate-100 dark:bg-slate-950/50">
                <div 
                  id="printable-delivery-label"
                  className="bg-white text-black p-6 rounded-lg shadow-sm border border-gray-200 w-[380px] shrink-0 font-sans"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                >
                  {/* Label Logo */}
                  <div className="text-center border-b-2 border-black pb-3 mb-3">
                    <h1 className="text-lg font-black tracking-wider uppercase m-0 text-black">SellersCampus LOGISTICS</h1>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Automated AI Fulfillment Sticker</p>
                  </div>

                  {/* Meta dates */}
                  <div className="flex justify-between text-[10px] border-b border-black pb-2 mb-3 text-black font-mono">
                    <div><strong>ORDER NO:</strong> {selectedPrintOrder.order_number}</div>
                    <div><strong>DATE:</strong> {new Date(selectedPrintOrder.created_at).toLocaleDateString('bn-BD')}</div>
                  </div>

                  {/* Receiver Info */}
                  <div className="mb-4 text-black">
                    <span className="inline-block bg-black text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wide rounded-sm mb-2">
                      DELIVER TO (প্রাপক)
                    </span>
                    <div className="text-base font-black mb-1 text-black">{selectedPrintOrder.customer_name}</div>
                    <div className="text-xs font-black font-mono text-black">📞 {selectedPrintOrder.customer_phone}</div>
                    <div className="text-xs mt-1.5 leading-relaxed text-black">
                      <strong>ঠিকানা:</strong> {selectedPrintOrder.customer_address}
                    </div>
                  </div>

                  {/* Product list */}
                  <div className="border-t border-b border-dashed border-black py-2.5 mb-4 text-black text-xs">
                    <span className="block text-[9px] font-black text-gray-600 uppercase tracking-wider mb-1">Items Details</span>
                    <div className="flex justify-between font-bold">
                      <span className="truncate max-w-[250px]">{selectedPrintOrder.product_name}</span>
                      <span className="shrink-0 pl-2">Qty: {selectedPrintOrder.quantity}</span>
                    </div>
                  </div>

                  {/* Fake Barcode visualization */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-0.5 h-10 overflow-hidden opacity-90">
                      <span className="w-1 h-10 bg-black"></span>
                      <span className="w-0.5 h-10 bg-black"></span>
                      <span className="w-1.5 h-10 bg-black"></span>
                      <span className="w-0.5 h-10 bg-black"></span>
                      <span className="w-1 h-10 bg-black"></span>
                      <span className="w-0.5 h-10 bg-black"></span>
                      <span className="w-2 h-10 bg-black"></span>
                      <span className="w-0.5 h-10 bg-black"></span>
                      <span className="w-1 h-10 bg-black"></span>
                      <span className="w-1.5 h-10 bg-black"></span>
                      <span className="w-0.5 h-10 bg-black"></span>
                      <span className="w-2 h-10 bg-black"></span>
                      <span className="w-1 h-10 bg-black"></span>
                      <span className="w-0.5 h-10 bg-black"></span>
                    </div>
                    <div className="text-[9px] font-mono tracking-widest mt-1 text-black">*{selectedPrintOrder.order_number}*</div>
                  </div>

                  {/* COD Badge Footer */}
                  <div className="flex items-center justify-between border-t border-black pt-3">
                    <div className="border-2 border-black px-3 py-1 bg-black text-white rounded-md text-center">
                      <div className="text-[8px] font-black uppercase tracking-wider">COD AMOUNT</div>
                      <div className="text-base font-black font-mono">{selectedPrintOrder.total}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-black uppercase tracking-wide text-black">Payment Method</div>
                      <div className="text-[10px] font-bold text-gray-700">Cash On Delivery</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex gap-2 shrink-0">
                <button
                  onClick={() => setSelectedPrintOrder(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/10"
                >
                  <Printer className="w-4 h-4" />
                  <span>লেবেল প্রিন্ট করুন (Print)</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
