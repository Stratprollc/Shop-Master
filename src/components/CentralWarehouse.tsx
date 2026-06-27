import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Warehouse, ArrowRightLeft, PackageCheck, AlertTriangle, Truck, History, Search } from 'lucide-react';
import { db, collection, query, where, doc, updateDoc, onSnapshot } from '../firebase';

// Mimic App.tsx interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;
  stock?: number;
  unit?: string;
  category?: string;
}

interface User {
  uid: string;
  email: string;
  shopId?: string;
}

interface TransferRequest {
  id: string;
  sourceType: 'warehouse' | 'branch';
  sourceId: string;
  destinationType: 'warehouse' | 'branch';
  destinationId: string;
  branchId?: string; // legacy support
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    approvedQuantity?: number;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  createdAt: string;
  notes?: string;
  shopId: string;
}

interface CentralWarehouseProps {
  products: Product[];
  user: User;
  setNotification: (n: any) => void;
}

export default function CentralWarehouse({ products, user, setNotification }: CentralWarehouseProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transfers' | 'logistics' | 'inventory' | 'damage' | 'audit'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const isBn = true;

  // Fetch live transfers
  useEffect(() => {
    if (!user?.shopId) return;
    const q = query(collection(db, 'transfers'), where('shopId', '==', user.shopId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: TransferRequest[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as TransferRequest);
      });
      setTransfers(data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (err) => {
      console.error("Central Warehouse - Transfers sync error:", err);
    });
    return () => unsubscribe();
  }, [user?.shopId]);

  const handleApproveTransfer = async (transfer: TransferRequest) => {
    try {
      // Complete transfer logic
      await updateDoc(doc(db, 'transfers', transfer.id), {
        status: 'completed',
        approvedAt: new Date().toISOString(),
        approvedBy: user.email
      });
      // Updating product stocks can be done via cloud functions or batched writes in a real scenario
      setNotification({ message: 'রিকুইজিশন অ্যাপ্রুভ করা হয়েছে।', type: 'success' });
    } catch(err) {
      setNotification({ message: 'অ্যাপ্রুভ করতে সমস্যা হয়েছে।', type: 'error' });
    }
  };

  const lowStockItems = products.filter(p => (p.stock || 0) <= 5);
  const totalStockValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.cost || p.price)), 0);

  const pendingRequisitions = transfers.filter(t => t.status === 'pending');


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Warehouse className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {isBn ? 'সেন্ট্রাল ওয়ারহাউস হাব' : 'Central Warehouse Hub'}
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
            {isBn ? 'প্রধান স্টক, ব্রাঞ্চ রিকুইজিশন ও ডিস্ট্রিবিউশন কন্ট্রোল' : 'Main stock, branch requisitions & distribution control'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isBn ? 'মোট স্টক ভ্যালু' : 'Total Stock Value'}</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">৳ {totalStockValue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isBn ? 'মোট প্রোডাক্ট প্রকার' : 'Total Products SKU'}</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{products.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isBn ? 'স্টক অ্যালার্ট' : 'Low Stock Alerts'}</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono mt-1">{lowStockItems.length}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isBn ? 'অপেক্ষমাণ চাহিদা' : 'Pending Requisitions'}</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">{pendingRequisitions.length}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
        {[
          { id: 'overview', icon: Warehouse, label: isBn ? 'ওয়ারহাউস ওভারভিউ' : 'Overview' },
          { id: 'inventory', icon: PackageCheck, label: isBn ? 'স্টক ডিরেক্টরি' : 'Stock Directory' },
          { id: 'transfers', icon: ArrowRightLeft, label: isBn ? 'ট্রান্সফার ও রিকুইজিশন' : 'Transfers & Reqs' },
          { id: 'damage', icon: AlertTriangle, label: isBn ? 'ড্যামেজ কন্ট্রোল' : 'Damage Control' },
          { id: 'audit', icon: Search, label: isBn ? 'স্টক অডিট' : 'Stock Audit' },
          { id: 'logistics', icon: Truck, label: isBn ? 'লজিস্টিক্স' : 'Logistics' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border-b-2 border-indigo-600' 
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              {isBn ? 'লো স্টক অ্যালার্ট' : 'Low Stock Alerts'}
            </h3>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{p.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold">SKU: {p.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2 py-1 rounded-lg">স্টক: {p.stock || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-bold">{isBn ? 'কোনো অ্যালার্ট নেই' : 'No alerts'}</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              {isBn ? 'সবশেষ ট্রানজ্যাকশন' : 'Recent Dispatches'}
            </h3>
            <p className="text-xs text-gray-400 font-bold p-8 text-center">{isBn ? 'ট্রানজ্যাকশন ডাটা পাওয়া যায়নি' : 'No dispatch history available'}</p>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
             <div className="relative flex-1 max-w-md w-full">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                 placeholder={isBn ? 'বারকোড স্ক্যান বা প্রোডাক্ট খুঁজুন...' : 'Scan barcode or search products...'}
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
             </div>
             <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
               {isBn ? '+ সাপ্লায়ার ইনওয়ার্ড (Goods Receipt)' : '+ Supplier Inward'}
             </button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[600px]">
               <thead>
                 <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                   <th className="pb-3 px-4">Product Name</th>
                   <th className="pb-3 px-4 text-center">Rack / Location</th>
                   <th className="pb-3 px-4 text-right">Unit Price</th>
                   <th className="pb-3 px-4 text-right">Main Stock</th>
                   <th className="pb-3 px-4 text-right">Stock Value</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                 {products.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                   <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                     <td className="py-3 px-4">
                       <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{p.name}</p>
                       <p className="text-[10px] text-gray-400 font-mono">{p.category || 'N/A'}</p>
                     </td>
                     <td className="py-3 px-4 text-center">
                       <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[10px] font-mono font-bold rounded-md border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                         Zone-A, Rack-01
                       </span>
                     </td>
                     <td className="py-3 px-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400">৳ {p.price.toLocaleString()}</td>
                     <td className="py-3 px-4 text-right">
                       <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                         (p.stock || 0) <= 5 ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                       }`}>
                         {p.stock || 0} {p.unit || 'unit'}
                       </span>
                     </td>
                     <td className="py-3 px-4 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400">
                       ৳ {((p.stock || 0) * (p.cost || p.price)).toLocaleString()}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5">
           <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-slate-800 pb-4">
             <h3 className="text-sm font-black text-gray-800 dark:text-slate-200">
               {isBn ? 'ইন-ট্রানজিট ও রিকুইজিশন কন্ট্রোল' : 'In-Transit & Requisitions'}
             </h3>
             <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition">
               + {isBn ? 'নতুন ট্রান্সফার' : 'New Transfer'}
             </button>
           </div>
           
           <div className="mb-4 flex gap-2">
             <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
               Pending Requisitions ({pendingRequisitions.length})
             </button>
             <button className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
               In-Transit (2)
             </button>
             <button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
               Received History
             </button>
           </div>

           {pendingRequisitions.length > 0 ? (
             <div className="space-y-4">
               {pendingRequisitions.map(req => (
                 <div key={req.id} className="border border-gray-100 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{req.branchId} থেকে</p>
                     <p className="text-sm font-bold mt-1 text-gray-800 dark:text-slate-200">{req.items.length} {isBn ? 'টি আইটেমের চাহিদা' : 'items requested'}</p>
                     <p className="text-[10px] text-gray-400 font-mono mt-1 pt-1 border-t border-gray-100 dark:border-slate-800">Requested at: {new Date(req.createdAt).toLocaleString()}</p>
                   </div>
                   <button 
                    onClick={() => handleApproveTransfer(req)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                   >
                     {isBn ? 'অ্যাপ্রুভ ও ডিসপ্যাচ করুন' : 'Approve & Dispatch'}
                   </button>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/20">
               <ArrowRightLeft className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
               <p className="text-sm font-bold text-gray-500">{isBn ? 'কোনো অপেক্ষমাণ রিকুইজিশন নেই' : 'No pending requisitions'}</p>
             </div>
           )}
        </div>
      )}

      {activeTab === 'damage' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 text-center py-16">
          <AlertTriangle className="w-12 h-12 text-red-200 mx-auto mb-4" />
          <h2 className="text-lg font-black text-gray-800 dark:text-slate-200 tracking-tight">{isBn ? 'ড্যামেজ প্রোডাক্ট অ্যাসেসমেন্ট' : 'Damage Product Assessment'}</h2>
          <p className="text-xs text-gray-500 font-bold max-w-md mx-auto mt-2 leading-relaxed">
            {isBn ? 'ব্রাঞ্চ থেকে আগত নষ্ট বা ড্যামেজ প্রোডাক্টগুলোর রিপেয়ারিং, রিটার্ন বা রাইট-অফ সিদ্ধান্ত এখানে নেওয়া যাবে।' : 'Review damaged goods and decide whether to repair, return to supplier, or write-off.'}
          </p>
          <button className="mt-6 px-6 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            {isBn ? 'নতুন ড্যামেজ লট এন্ট্রি' : 'Log New Damaged Lot'}
          </button>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 text-center py-16">
          <Search className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
          <h2 className="text-lg font-black text-gray-800 dark:text-slate-200 tracking-tight">{isBn ? 'ফিজিক্যাল স্টক অডিট' : 'Physical Stock Audit'}</h2>
          <p className="text-xs text-gray-500 font-bold max-w-md mx-auto mt-2 leading-relaxed">
            {isBn ? 'সিস্টেম স্টকের সাথে ওয়ারহাউসের বাস্তব ফিজিক্যাল স্টকের মিল আছে কিনা তা মেলাতে একটি নতুন অডিট শুরু করুন।' : 'Reconcile system stock with physical warehouse stock by initiating a new audit period.'}
          </p>
          <button className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            {isBn ? 'নতুন অডিট শুরু করুন' : 'Start New Audit'}
          </button>
        </div>
      )}

      {activeTab === 'logistics' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 text-center py-16">
          <Truck className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-lg font-black text-gray-800 dark:text-slate-200 tracking-tight">{isBn ? 'লজিস্টিক্স এবং ক্যারিয়ার ড্যাশবোর্ড' : 'Logistics & Carrier Dashboard'}</h2>
          <p className="text-xs text-gray-500 font-bold max-w-md mx-auto mt-2 leading-relaxed">
            {isBn 
              ? 'এখানে আপনার সমস্ত ডেলিভারি ভ্যান, ট্রান্সপোর্ট অপ্টিমাইজেশন এবং ডিস্ট্রিবিউশন রুট ম্যাপ দেখা যাবে।' 
              : 'Monitor your delivery vans, optimize transport routes and view distribution map here.'}
          </p>
          <button className="mt-6 px-6 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            {isBn ? 'নতুন ভ্যান এন্ট্রি করুন' : 'Add Carrier Vehicle'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
