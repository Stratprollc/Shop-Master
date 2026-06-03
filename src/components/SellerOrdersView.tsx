import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Check, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  Clock, 
  AlertCircle, 
  Receipt,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, updateDoc } from '../firebase';

interface SellerOrdersViewProps {
  orders: any[];
  lang: 'en' | 'bn' | 'ar';
  onLoadToPOS: (order: any) => void;
}

export function SellerOrdersView({ orders, lang, onLoadToPOS }: SellerOrdersViewProps) {
  const isBn = lang === 'bn';
  const [editingOrder, setEditingOrder] = useState<any | null>(null);

  const handleUpdateStatus = async (orderId: string, status: 'approved' | 'cancelled') => {
    try {
      const orderRef = doc(db, 'customer_orders', orderId);
      await updateDoc(orderRef, { status });
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const startEditing = (order: any) => {
    // Clone properties to edit locally
    setEditingOrder(JSON.parse(JSON.stringify(order)));
  };

  const handleModifyQuantity = (productId: string, diff: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items.map((item: any) => {
      if (item.productId === productId) {
        const newQty = item.quantity + diff;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    const total = updatedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      totalAmount: total
    });
  };

  const handleRemoveItem = (productId: string) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items.filter((item: any) => item.productId !== productId);
    const total = updatedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      totalAmount: total
    });
  };

  const handleSaveModifiedOrder = async () => {
    if (!editingOrder) return;
    try {
      const orderRef = doc(db, 'customer_orders', editingOrder.id);
      await updateDoc(orderRef, {
        items: editingOrder.items,
        totalAmount: editingOrder.totalAmount,
        status: 'pending' // remains pending till approved
      });
      setEditingOrder(null);
    } catch (err) {
      console.error("Error saving modified customer order:", err);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const pastOrders = orders.filter(o => o.status !== 'pending');

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-none">
            {isBn ? "গ্রাহক অর্ডার সমুহ" : "Customer Live Orders"}
          </h1>
          <p className="text-gray-500 font-semibold text-sm mt-2">
            {isBn 
              ? "ক্রেতাদের পক্ষ থেকে সরাসরি পাঠানো লিস্টিং ও অর্ডার রিকোয়েস্ট ম্যানেজ করুন।" 
              : "Manage real-time order baskets placed online by registered client devices."}
          </p>
        </div>

        {/* Counter metrics badge */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-black shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingOrders.length} {isBn ? "টি পেন্ডিং অর্ডার" : "Pending Order Requests"}</span>
          </div>
        </div>
      </div>

      {/* Primary orders screen layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Orders list col */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>{isBn ? "পেন্ডিং রিকোয়েস্ট সমূহ" : "Pending Incoming Orders"}</span>
            </h2>

            {pendingOrders.length === 0 ? (
              <div className="py-16 text-center text-gray-400 font-bold text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 flex flex-col items-center justify-center gap-3">
                <ShoppingBag className="w-10 h-10 text-gray-200" />
                <span>{isBn ? "কোনো পেন্ডিং অর্ডার রিকোয়েস্ট নেই।" : "No pending order requests found."}</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingOrders.map(order => (
                  <div key={order.id} className="py-5 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(order.timestamp).toLocaleString()}</span>
                        </span>
                      </div>

                      {/* Customer Info Card */}
                      <div className="flex items-center gap-4 pt-1">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 border border-gray-200">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-sm leading-tight">{order.customerName}</h4>
                          <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{order.customerPhone}</span>
                          </p>
                        </div>
                      </div>

                      {/* Items details display list */}
                      <div className="mt-3 pl-14">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{isBn ? "আইটেমস" : "Items list"}</p>
                        <div className="space-y-1">
                          {order.items?.map((item: any, i: number) => (
                            <p key={i} className="text-xs font-bold text-gray-700">
                              🛒 {item.productName} — <span className="font-mono">{item.price} TK × {item.quantity} {item.unit || 'unit'}</span>
                            </p>
                          ))}
                        </div>
                        {order.notes && (
                          <p className="text-xs text-indigo-500 font-semibold italic mt-2 bg-indigo-50/40 px-3 py-1.5 rounded-xl border border-indigo-100/30 inline-block">
                            * Note: {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Value & Operation Controls */}
                    <div className="flex flex-col items-start md:items-end justify-between gap-4 shrink-0 min-w-[200px]">
                      <div className="text-left md:text-right">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{isBn ? "ক্রয়মূল্য বা বিল" : "Net Bill Amount"}</p>
                        <h4 className="text-xl font-black text-indigo-600 mt-1">{order.totalAmount} TK</h4>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 w-full md:justify-end">
                        {/* Edit Quantities button ("দোকানদার চাইলে ইচ্ছামত কমাতে-বাড়াতে পারবে") */}
                        <button
                          onClick={() => startEditing(order)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
                        >
                          ✏️ {isBn ? "সংশোধন করুন" : "Modify Basket"}
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-100"
                          title={isBn ? "অর্ডার বাতিল করুন" : "Reject/Cancel Order"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {/* Load in POS dashboard for perfect final checkout invoice processing */}
                        <button
                          onClick={() => onLoadToPOS(order)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-100 flex items-center gap-1.5 transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{isBn ? "POS-এ লোড করুন" : "Proceed Checkout"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MODIFIER EDIT SIDEBAR SECTION ("ইচ্ছামত কমাতে কিংবা বেশি করতে পারবে") */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {editingOrder ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 bg-white border border-indigo-100 rounded-[2rem] shadow-lg flex flex-col gap-6 sticky top-24"
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                      {isBn ? "অর্ডার এডিট মোড" : "Basket Editor"}
                    </span>
                    <h3 className="font-black text-gray-900 text-base mt-1">#{editingOrder.orderNumber}</h3>
                  </div>
                  <button 
                    onClick={() => setEditingOrder(null)}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Edit itemization index by index */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {editingOrder.items?.length === 0 ? (
                    <p className="text-gray-400 text-xs py-4 text-center font-semibold">No items left in this order request.</p>
                  ) : (
                    editingOrder.items.map((item: any) => (
                      <div key={item.productId} className="flex items-center justify-between gap-3 text-xs bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 truncate">{item.productName}</h4>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">
                            {item.price} TK × {item.quantity} = {item.price * item.quantity} TK
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleModifyQuantity(item.productId, -1)}
                            className="p-1 bg-white hover:bg-gray-100 rounded text-gray-500 border border-gray-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-gray-800 text-xs w-5 text-center">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => handleModifyQuantity(item.productId, 1)}
                            className="p-1 bg-white hover:bg-gray-100 rounded text-gray-500 border border-gray-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded transition-colors ml-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="flex justify-between items-center text-sm font-black text-gray-900">
                    <span>{isBn ? "সংশোধিত মোট বিল" : "Adjusted Net Total"}</span>
                    <span className="text-indigo-600">{editingOrder.totalAmount} TK</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingOrder(null)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-all"
                    >
                      {isBn ? "বাতিল" : "Cancel"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveModifiedOrder}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-100"
                    >
                      {isBn ? "পরিবর্তন সংরক্ষণ" : "Save Basket"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest">{isBn ? "প্রসেসড বা সম্পন্ন অর্ডার" : "Completed / Past Orders"}</h3>
                {pastOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 font-semibold py-8 text-center">{isBn ? "পূর্বে সম্পন্ন কোনো অর্ডার রেকর্ড নেই।" : "No recorded history for past processed orders."}</p>
                ) : (
                  <div className="space-y-3.5 divide-y divide-gray-55 divide-opacity-40">
                    {pastOrders.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10).map((pastOrder, pi) => (
                      <div key={pastOrder.id} className="pt-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-black text-gray-800">#{pastOrder.orderNumber}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-semibold">{pastOrder.customerName}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${pastOrder.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {pastOrder.status === 'approved' ? (isBn ? 'সম্পন্ন' : 'Completed') : (isBn ? 'বাতিল' : 'Cancelled')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
