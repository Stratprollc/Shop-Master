import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Users, 
  Settings, 
  Download,
  Shield,
  Building2,
  Warehouse as WarehouseIcon,
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Save, 
  Send,
  X, 
  Menu,
  LogOut, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  Box, 
  User as UserIcon,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Printer,
  Minus,
  ScanLine,
  Scan,
  MessageCircle,
  Calendar,
  Clock,
  ArrowRight,
  Info,
  History as HistoryIcon,
  AlertTriangle,
  Calculator as CalculatorIcon,
  Image as ImageIcon,
  Camera,
  Banknote
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
// import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  OperationType,
  handleFirestoreError
} from './firebase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

// --- Types ---
type UserRole = 'admin' | 'manager' | 'assistant_manager' | 'sales_manager' | 'sales_team';

interface AppUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
}

interface ShopSettings {
  name: string;
  address: string;
  logoUrl?: string;
  logoBase64?: string;
  phone?: string;
  whatsappSender?: string;
  receiptWidth?: '58mm' | '80mm';
  waGatewayType: 'manual' | 'metacloud' | 'generic';
  waApiUrl?: string;
  waToken?: string;
  waInstanceId?: string;
  waPhoneNumberId?: string;
  autoSendWhatsApp?: boolean;
}

interface Product {
  id: string;
  serialNumber: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: 'kg' | 'unit';
  barcode: string;
  expiryDate?: string;
  location?: string;
  department?: string;
  warehouse?: string;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
}

interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: { productId: string; productName: string; quantity: number; price: number; originalPrice: number; cost: number }[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  previousBalance?: number;
  paymentMethod: 'cash' | 'due';
  timestamp: any;
  sellerId: string;
}

interface Customer {
  id: string;
  serialNumber: number;
  name: string;
  phone: string;
  address?: string;
  fatherName?: string;
  houseName?: string;
  points: number;
  totalSpent: number;
  currentDue: number;
  dueDate?: string;
}

interface DailyClosing {
  id: string;
  date: string;
  totalSales: number;
  cashSales: number;
  dueSales: number;
  collections: number;
  totalExpenses: number;
  cashInHand: number;
  bkashBalance: number;
  denominations: {
    [key: string]: number;
  };
  notes?: string;
  timestamp: any;
}

interface Expense {
  id: string;
  category: 'salary' | 'rent' | 'electricity' | 'internet' | 'food' | 'others';
  amount: number;
  description: string;
  timestamp: any;
  staffId?: string;
}

interface Investment {
  id: string;
  amount: number;
  description: string;
  timestamp: any;
}

interface StaffSalary {
  id: string;
  staffName: string;
  amount: number;
  month: string;
  timestamp: any;
}

interface Category {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  salary: number;
  joiningDate?: string;
  schedule?: string;
  status: 'active' | 'inactive';
}

import { FIXED_CATEGORIES } from './Categories'; //�. পশু স�. বিড়াল পরিচর্যা", " সরঞ্জাম", "৬৬. শিক্ষা সামগ্রী",
//   "৬৭. পোশাক", "৬৮. পুরুষদের পোশাক", "৬৯. নারীদের পোশাক", "৭০. শিশুদের পোশাক", "৭১. ফ্যাশন আনুষঙ্গিক",
//   "৭২. খেলনা ও বিনোদন", "৭৩. ক্রীড়া সামগ্রী", "৭৪. আউটডোর সামগ্রী",
//   "৭৫. পোষা প্রাণী", "৭৬. কুকুর পরিচর্যা", "৭৭. বিড়াল পরিচর্যা", "৭৮. পাখি পরিচর্যা", "৭৯. মাছ পরিচর্যা",
//   "৮০. গবাদি পশু", "৮১. গরু পরিচর্যা", "৮২. ছাগল পরিচর্যা", "৮৩. ভেড়া পরিচর্যা", "৮৪. হাঁস-মুরগি পরিচর্যা", "৮৫. পশু স্বাস্থ্য",
//   "৮৬. কৃষি", "৮৭. বীজ ও চারা", "৮৮. সার ও মাটি উন্নয়ন", "৮৯. কৃষি সরঞ্জাম", "৯০. বাগান পরিচর্যা",
//   "৯১. ভ্রমণ ও আউটডোর", "৯২. উপহার সামগ্রী", "৯৩. ধর্মীয় সামগ্রী", "৯৪. মৌসুমি পণ্য", "৯৫. উৎসব সামগ্রী", "৯৬. বিশেষ অফার বিভাগ", "৯৭. নতুন আগমন", "৯৮. জনপ্রিয় বিভাগ", "৯৯. স্থানীয় পণ্য", "১০০. আমদানিকৃত পন্য"
// ];

// --- Utilities ---
const toBengaliNumber = (num: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
};

const formatCurrency = (amount: number | undefined | null): string => {
  const safeAmount = amount || 0;
  return `TK ${toBengaliNumber(safeAmount.toFixed(2))}`;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
const printDailyClosing = (closing: DailyClosing, settings: ShopSettings) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const denominationsHtml = Object.entries(closing.denominations)
    .filter(([_, count]) => count > 0)
    .map(([val, count]) => `
      <div style="display: flex; justify-content: space-between; font-size: 10px;">
        <span>${val} x ${count}</span>
        <span>= ${(parseInt(val) * count).toFixed(2)}</span>
      </div>
    `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Daily Closing - ${closing.date}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { margin: 0; size: 80mm auto; }
          html, body { width: 80mm; margin: 0; padding: 0; background: #fff; height: auto !important; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 72mm; 
            margin: 0 auto; 
            padding: 2mm 0; 
            font-size: 11px; 
            line-height: 1.1;
          }
          .header { text-align: center; margin-bottom: 5px; border-bottom: 1px dashed #000; padding-bottom: 3px; }
          .title { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .section-title { font-weight: bold; border-bottom: 1px solid #000; margin: 6px 0 3px; font-size: 10px; }
          .footer { text-align: center; margin-top: 10px; font-size: 8px; border-top: 1px dashed #000; padding-top: 3px; }
          @media print {
            body { width: 72mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${settings.name}</div>
          <div style="font-size: 10px; font-weight: bold;">DAILY CLOSING REPORT</div>
          <div style="font-size: 9px;">Date: ${closing.date}</div>
        </div>
        
        <div class="section-title">SALES SUMMARY</div>
        <div class="row"><span>Total Sales:</span> <span>TK ${closing.totalSales.toFixed(2)}</span></div>
        <div class="row"><span>Cash Sales:</span> <span>TK ${closing.cashSales.toFixed(2)}</span></div>
        <div class="row"><span>Due Sales:</span> <span>TK ${closing.dueSales.toFixed(2)}</span></div>
        <div class="row"><span>Collections:</span> <span>TK ${closing.collections.toFixed(2)}</span></div>
        
        <div class="section-title">EXPENSES</div>
        <div class="row"><span>Total Expenses:</span> <span>TK ${closing.totalExpenses.toFixed(2)}</span></div>
        
        <div class="section-title">CASH IN HAND</div>
        <div class="row" style="font-weight: bold;"><span>Total Cash:</span> <span>TK ${closing.cashInHand.toFixed(2)}</span></div>
        <div style="margin-top: 3px; padding-left: 5px; border-left: 1px solid #eee;">
          ${denominationsHtml}
        </div>
        
        <div class="section-title">DIGITAL BALANCES</div>
        <div class="row"><span>bKash:</span> <span>TK ${closing.bkashBalance.toFixed(2)}</span></div>
        
        ${closing.notes ? `
          <div class="section-title">NOTES</div>
          <div style="font-size: 9px;">${closing.notes}</div>
        ` : ''}
        
        <div class="footer">
          Report Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}<br>
          ShopMaster POS
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 100);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const printInvoice = (sale: Sale, settings: ShopSettings) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = sale.items.map(item => `
    <tr>
      <td style="padding: 2px 0;">${item.productName}</td>
      <td style="padding: 2px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 2px 0; text-align: right;">${(item.price || 0).toFixed(2)}</td>
      <td style="padding: 2px 0; text-align: right;">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
    </tr>
  `).join('');

  const width = settings.receiptWidth || '58mm';
  const printableWidth = width === '80mm' ? '72mm' : '48mm';

  const changeAmount = Math.max(0, (sale.paidAmount || 0) - (sale.finalAmount || 0));
  const previousBalance = sale.previousBalance || 0;
  const newBalance = previousBalance + (sale.dueAmount || 0);

  const html = `<!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${sale.id.slice(-6).toUpperCase()}</title>
        <style>
          @page {
            margin: 0;
            size: ${width} auto;
          }
          
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          html, body {
            width: ${width};
            margin: 0;
            padding: 0;
            background: #fff;
            height: auto !important;
          }

          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: ${printableWidth}; 
            margin: 0;
            padding: 1mm; 
            color: #000; 
            font-size: 10px;
            line-height: 1.1;
            -webkit-print-color-adjust: exact;
          }

          .header { text-align: center; margin-bottom: 2px; border-bottom: 1px dashed #000; padding-bottom: 2px; }
          .logo { max-width: 25mm; margin-bottom: 2px; filter: grayscale(100%); }
          .shop-name { font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .shop-info { font-size: 8px; }
          .invoice-meta { margin-bottom: 2px; font-size: 8px; border-bottom: 1px dashed #000; padding-bottom: 1px; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 2px; table-layout: fixed; }
          th { border-bottom: 1px solid #000; font-size: 8px; text-align: left; }
          td { padding: 1px 0; font-size: 8px; vertical-align: top; word-wrap: break-word; }
          
          .totals { text-align: right; border-top: 1px dashed #000; padding-top: 2px; font-size: 9px; }
          .total-row { font-weight: bold; font-size: 11px; margin-top: 1px; border-top: 1px double #000; padding-top: 1px; }
          .balance-section { border-top: 1px solid #eee; margin-top: 2px; padding-top: 2px; font-size: 8px; text-align: right; }
          .footer { text-align: center; margin-top: 4px; font-size: 7px; border-top: 1px dashed #000; padding-top: 2px; }
          
          @media print {
            body { width: ${printableWidth}; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${settings.logoBase64 ? `<img src="${settings.logoBase64}" class="logo" />` : ''}
          <div class="shop-name">${settings.name}</div>
          <div class="shop-info">${settings.address}</div>
          ${settings.phone ? `<div class="shop-info">Phone: ${settings.phone}</div>` : ''}
        </div>
        <div class="invoice-meta">
          <div style="display: flex; justify-content: space-between;">
            <span>Inv: #${sale.id.slice(-6).toUpperCase()}</span>
            <span>${format(sale.timestamp.toDate(), 'dd/MM/yy HH:mm')}</span>
          </div>
          <div>Cust: ${sale.customerName || 'Walk-in'}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45%;">Item</th>
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 20%; text-align: right;">Price</th>
              <th style="width: 25%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="totals">
          <div>Subtotal: TK ${(sale.totalAmount || 0).toFixed(2)}</div>
          <div>Discount: TK ${(sale.discount || 0).toFixed(2)}</div>
          <div class="total-row">Grand Total: TK ${(sale.finalAmount || 0).toFixed(2)}</div>
          <div style="margin-top: 2px;">Paid: TK ${(sale.paidAmount || 0).toFixed(2)}</div>
          ${changeAmount > 0 ? `<div>Change: TK ${changeAmount.toFixed(2)}</div>` : ''}
          <div style="font-weight: bold;">Due: TK ${(sale.dueAmount || 0).toFixed(2)}</div>
        </div>

        ${sale.customerId ? `
        <div class="balance-section">
          <div>Previous Balance: TK ${previousBalance.toFixed(2)}</div>
          <div>Current Transaction: TK ${(sale.dueAmount || 0).toFixed(2)}</div>
          <div style="font-weight: bold; border-top: 1px solid #ccc; display: inline-block; padding-left: 10px;">
            Total Balance: TK ${newBalance.toFixed(2)}
          </div>
        </div>
        ` : ''}

        <div class="footer">
          Thank you for shopping with us!<br>
          Powered by ShopMaster
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 100);
          };
        </script>
      </body>
    </html>`;

  printWindow.document.open();
  printWindow.document.write(html.trim());
  printWindow.document.close();
};

const sendWhatsAppInvoice = async (sale: Sale, settings: ShopSettings) => {
  if (!sale.customerPhone) return;
  
  const cleanPhone = sale.customerPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('880') ? cleanPhone : `880${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
  
  const itemsText = sale.items.map(item => `• ${item.productName}: ${item.quantity} x ${item.price} = ${item.price * item.quantity}`).join('\n');
  
  const previousBalance = sale.previousBalance || 0;
  const currentDue = sale.dueAmount || 0;
  const totalBalance = previousBalance + currentDue;

  const message = `*Invoice from ${settings.name}*\n` +
    `Invoice: #${sale.id.slice(-6).toUpperCase()}\n` +
    `Date: ${format(sale.timestamp.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp), 'dd/MM/yyyy')}\n\n` +
    `*Items:*\n${itemsText}\n\n` +
    `--------------------------\n` +
    `*Subtotal:* TK ${sale.totalAmount}\n` +
    `*Discount:* TK ${sale.discount}\n` +
    `*Grand Total:* TK ${sale.finalAmount}\n` +
    `*Paid Amount:* TK ${sale.paidAmount}\n` +
    `--------------------------\n` +
    `*Previous Balance:* TK ${previousBalance}\n` +
    `*Current Due:* TK ${currentDue}\n` +
    `*Total Balance:* TK ${totalBalance}\n\n` +
    `Thank you for your purchase!`;

  const isAuto = settings.autoSendWhatsApp;
  const method = settings.waGatewayType || 'manual';

  // If Gateway settings are provided AND auto-send is enabled, send in the background
  if (isAuto && settings.waToken && (settings.waPhoneNumberId || settings.waApiUrl)) {
    try {
      console.log('Initiating automatic background WhatsApp delivery...');
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: method,
          apiUrl: settings.waApiUrl,
          token: settings.waToken,
          instanceId: settings.waInstanceId,
          phoneNumberId: settings.waPhoneNumberId,
          phone: formattedPhone,
          message: message
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ WhatsApp message sent automatically through server gateway.');
      } else {
        console.error('❌ Automatic delivery failed:', result.data || result.error);
      }
    } catch (error) {
      console.error('❌ Network error during automatic WhatsApp delivery:', error);
    }
  } else if (!isAuto) {
    // Manual or fallback: ONLY open window if auto-send is strictly disabled
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  } else {
    console.warn('Auto-send is enabled but settings are incomplete. Skipping automatic message to avoid popups.');
  }
};

const testWhatsAppConnection = async (settings: ShopSettings) => {
  if (!settings.waToken) {
    alert('Please enter an API Token first!');
    return;
  }
  
  const testPhone = prompt('Enter a WhatsApp number to test (with country code, e.g., 88017...):');
  if (!testPhone) return;

  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: settings.waGatewayType || 'metacloud',
        apiUrl: settings.waApiUrl,
        token: settings.waToken,
        instanceId: settings.waInstanceId,
        phoneNumberId: settings.waPhoneNumberId,
        phone: testPhone.replace(/\D/g, ''),
        message: 'MasterShop WhatsApp Automation Test Message. Connection successful! ✅'
      }),
    });
    const result = await response.json();
    if (result.success) {
      alert('Test Message Sent Successfully!');
    } else {
      alert('Failed to send test message: ' + JSON.stringify(result.data || result.error));
    }
  } catch (error) {
    alert('Error connecting to automation gateway.');
  }
};

const downloadInvoicePDF = (sale: Sale, settings: ShopSettings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.text(settings.name, pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(settings.address, pageWidth / 2, 28, { align: 'center' });
  if (settings.phone) doc.text(`Phone: ${settings.phone}`, pageWidth / 2, 34, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(20, 40, pageWidth - 20, 40);

  // Invoice Info
  doc.setFontSize(12);
  doc.text(`Invoice: #${sale.id.slice(-6).toUpperCase()}`, 20, 50);
  doc.text(`Date: ${format(sale.timestamp.toDate(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 20, 50, { align: 'right' });
  doc.text(`Customer: ${sale.customerName || 'Walk-in'}`, 20, 58);
  if (sale.customerPhone) doc.text(`Phone: ${sale.customerPhone}`, 20, 64);

  // Table
  const tableData = sale.items.map(item => [
    item.productName,
    item.quantity.toString(),
    (item.price || 0).toFixed(2),
    ((item.price || 0) * (item.quantity || 0)).toFixed(2)
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const changeAmount = Math.max(0, (sale.paidAmount || 0) - (sale.finalAmount || 0));
  const previousBalance = sale.previousBalance || 0;
  const newBalance = previousBalance + (sale.dueAmount || 0);

  // Totals
  doc.text(`Subtotal: TK ${(sale.totalAmount || 0).toFixed(2)}`, pageWidth - 20, finalY, { align: 'right' });
  doc.text(`Discount: TK ${(sale.discount || 0).toFixed(2)}`, pageWidth - 20, finalY + 6, { align: 'right' });
  doc.setFontSize(14);
  doc.text(`Grand Total: TK ${(sale.finalAmount || 0).toFixed(2)}`, pageWidth - 20, finalY + 14, { align: 'right' });
  doc.setFontSize(10);
  doc.text(`Paid: TK ${(sale.paidAmount || 0).toFixed(2)}`, pageWidth - 20, finalY + 20, { align: 'right' });
  if (changeAmount > 0) {
    doc.text(`Change Given: TK ${changeAmount.toFixed(2)}`, pageWidth - 20, finalY + 26, { align: 'right' });
  }
  doc.text(`Due: TK ${(sale.dueAmount || 0).toFixed(2)}`, pageWidth - 20, finalY + (changeAmount > 0 ? 32 : 26), { align: 'right' });

  if (sale.customerId) {
    const balanceY = finalY + (changeAmount > 0 ? 42 : 36);
    doc.setFontSize(11);
    doc.text('Customer Balance Summary', pageWidth - 20, balanceY, { align: 'right' });
    doc.setFontSize(9);
    doc.text(`Previous Balance: TK ${previousBalance.toFixed(2)}`, pageWidth - 20, balanceY + 6, { align: 'right' });
    doc.text(`Current Transaction: TK ${(sale.dueAmount || 0).toFixed(2)}`, pageWidth - 20, balanceY + 12, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`New Total Balance: TK ${newBalance.toFixed(2)}`, pageWidth - 20, balanceY + 20, { align: 'right' });
  }

  doc.text('Thank you for shopping with us!', pageWidth / 2, finalY + 70, { align: 'center' });

  doc.save(`Invoice_${sale.id.slice(-6)}.pdf`);
};

// --- Components ---

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      try {
        const parsed = JSON.parse(event.error.message);
        if (parsed.error) {
          setHasError(true);
          setErrorInfo(parsed.error);
        }
      } catch {
        // Not a firestore error
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{errorInfo || "An unexpected error occurred."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function SettingsPanel({ settings, onSaveSettings, users, onAddUser, onDeleteUser }: { settings: ShopSettings, onSaveSettings: (s: ShopSettings) => void, users: AppUser[], onAddUser: (u: Omit<AppUser, 'id'>) => void, onDeleteUser: (id: string) => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'users'>('shop');

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const logoFile = (form.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
    
    let logoBase64 = settings.logoBase64;
    if (logoFile) {
      logoBase64 = await fileToBase64(logoFile);
    }

    onSaveSettings({
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      logoUrl: formData.get('logoUrl') as string,
      logoBase64: logoBase64,
      whatsappSender: formData.get('whatsappSender') as string,
      waGatewayType: formData.get('waGatewayType') as any,
      waApiUrl: formData.get('waApiUrl') as string,
      waInstanceId: formData.get('waInstanceId') as string,
      waPhoneNumberId: formData.get('waPhoneNumberId') as string,
      waToken: formData.get('waToken') as string,
      autoSendWhatsApp: formData.get('autoSendWhatsApp') === 'on',
      receiptWidth: formData.get('receiptWidth') as '58mm' | '80mm',
    });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onAddUser({
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      displayName: formData.get('displayName') as string,
      role: formData.get('role') as UserRole,
    });
    form.reset();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-bold text-gray-900">Settings & Admin</h2>
        <p className="text-gray-500">Manage your shop profile and team access.</p>
      </header>

      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveSubTab('shop')}
          className={`px-6 py-3 font-bold transition-all border-b-2 ${activeSubTab === 'shop' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
        >
          Shop Profile
        </button>
        <button 
          onClick={() => setActiveSubTab('users')}
          className={`px-6 py-3 font-bold transition-all border-b-2 ${activeSubTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
        >
          User Management
        </button>
      </div>

      {activeSubTab === 'shop' ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Shop Information
          </h3>
          <form onSubmit={handleShopSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-24 h-24 bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                  {settings.logoBase64 ? (
                    <img src={settings.logoBase64} alt="Shop Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Shop Logo</label>
                  <p className="text-xs text-gray-500 mb-3">Upload your shop logo (PNG/JPG)</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                <input name="name" defaultValue={settings.name} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input name="phone" defaultValue={settings.phone} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea name="address" defaultValue={settings.address} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (Optional)</label>
                <input name="logoUrl" defaultValue={settings.logoUrl} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Sender Number (Optional)</label>
                <input name="whatsappSender" defaultValue={settings.whatsappSender} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="88017..." />
              </div>
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Free Automation Guide (বিনা খরচে অটোমেশন)
                </h4>
                <div className="space-y-4 text-sm text-indigo-800">
                  <div className="bg-white/50 p-3 rounded-lg border border-indigo-100">
                    <p className="font-bold mb-1">১. মেটা ক্লাউড এপিআই (Official Free):</p>
                    <p className="text-xs">মেটার নিজস্ব সার্ভিস। মাসে ১,০০০ মেসেজ ফ্রি। সেটআপ করতে <a href="https://developers.facebook.com/" target="_blank" className="underline text-indigo-600 font-bold">Meta Developers</a> এ যান।</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg border border-indigo-100">
                    <p className="font-bold mb-1">২. নিজের ফোন ব্যবহার (Self-Hosted):</p>
                    <p className="text-xs">আপনার অ্যান্ড্রয়েড ফোনে "WhatsApp Gateway" অ্যাপ ব্যবহার করে আপনার নাম্বার থেকেই অটোমেটিক মেসেজ পাঠাতে পারবেন।</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Sending Method</label>
                <select name="waGatewayType" defaultValue={settings.waGatewayType || 'manual'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="manual">Manual (Free, requires 1-Click)</option>
                  <option value="metacloud">Meta Cloud API (Official, 1000 Free/Month, Automatic)</option>
                  <option value="generic">Third-Party Gateway (Paid, Automatic)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp API Token / Key</label>
                <p className="text-[10px] text-gray-400 mb-2">Access Token for Meta or Token for Gateway</p>
                <input name="waToken" defaultValue={settings.waToken} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID (Meta Cloud Only)</label>
                <input name="waPhoneNumberId" defaultValue={settings.waPhoneNumberId} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API URL (Generic Only)</label>
                <input name="waApiUrl" defaultValue={settings.waApiUrl} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  name="autoSendWhatsApp" 
                  id="autoSendWhatsApp"
                  defaultChecked={settings.autoSendWhatsApp} 
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <label htmlFor="autoSendWhatsApp" className="text-sm font-bold text-gray-700">Enable Fully Automatic WhatsApp Invoicing</label>
              </div>
              <div className="md:col-span-2 flex items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900">Test Your Setup</h4>
                  <p className="text-xs text-gray-500">Send a test message to verify your settings.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => testWhatsAppConnection(settings)}
                  className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Test Message
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Width</label>
                <select name="receiptWidth" defaultValue={settings.receiptWidth || '58mm'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="58mm">58mm (Small Thermal)</option>
                  <option value="80mm">80mm (Large Thermal)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
              <Save className="w-5 h-5" />
              Update Settings
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6">Add New User</h3>
            <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input name="displayName" required className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input name="username" required className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input name="password" type="password" required className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select name="role" required className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                  <option value="manager">Manager</option>
                  <option value="assistant_manager">Assistant Manager</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="sales_team">Sales Team</option>
                </select>
              </div>
              <div className="lg:col-span-4 flex justify-end">
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{u.displayName}</td>
                    <td className="px-6 py-4 text-gray-600">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDeleteUser(u.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function App() {
  console.log("ShopMaster App Initializing...");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Auth State Sync
  useEffect(() => {
    // Try to sign in anonymously to satisfy security rules if enabled
    import('firebase/auth').then(({ signInAnonymously }) => {
      signInAnonymously(auth).catch(err => {
        console.warn("Anonymous auth failed, falling back to public mode", err.message);
      });
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const savedUser = localStorage.getItem('shopmaster_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing saved user", e);
        }
      } else if (!firebaseUser) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [staffSalaries, setStaffSalaries] = useState<StaffSalary[]>([]);
  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    name: 'Bismillah Store',
    address: 'Your Shop Address',
    phone: '01XXXXXXXXX',
    receiptWidth: '58mm'
  });
  
  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Real-time Data Sync (Public/Auth-related)
  useEffect(() => {
    // We sync these even without auth to allow the login screen to function
    // Security is handled by allowing public read in firestore.rules
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAppUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser)));
    }, (err) => console.error("Users sync error", err));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'shop'), (snapshot) => {
      if (snapshot.exists()) {
        setShopSettings(snapshot.data() as ShopSettings);
      }
    }, (err) => console.error("Settings sync error", err));

    return () => {
      unsubUsers();
      unsubSettings();
    };
  }, []);

  // Real-time Data Sync (Private/App-related)
  useEffect(() => {
    // We need the app user state to be ready
    if (!user) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (err) => console.error("Products sync error", err));

    const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
    }, (err) => console.error("Sales sync error", err));

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    }, (err) => console.error("Customers sync error", err));

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (err) => console.error("Categories sync error", err));

    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    }, (err) => console.error("Expenses sync error", err));

    const unsubInvestments = onSnapshot(collection(db, 'investments'), (snapshot) => {
      setInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment)));
    }, (err) => console.error("Investments sync error", err));

    const unsubStaffSalaries = onSnapshot(collection(db, 'staff_salaries'), (snapshot) => {
      setStaffSalaries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffSalary)));
    }, (err) => console.error("Staff salaries sync error", err));

    const unsubDailyClosings = onSnapshot(collection(db, 'daily_closings'), (snapshot) => {
      setDailyClosings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyClosing)));
    }, (err) => console.error("Daily closing sync error", err));

    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    }, (err) => console.error("Employees sync error", err));

    return () => {
      unsubProducts();
      unsubSales();
      unsubCustomers();
      unsubCategories();
      unsubExpenses();
      unsubInvestments();
      unsubStaffSalaries();
      unsubDailyClosings();
      unsubEmployees();
    };
  }, [user, auth.currentUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    // Check against appUsers collection
    const foundUser = appUsers.find(u => u.username === username && u.password === password);

    if (foundUser) {
      const userData = { uid: foundUser.id, email: `${foundUser.username}@shop.com`, displayName: foundUser.displayName, role: foundUser.role };
      setUser(userData);
      localStorage.setItem('shopmaster_user', JSON.stringify(userData));
    } else if (username === 'Admin' && password === 'Admin') {
      const mockUser = { uid: 'admin-id', email: 'admin@shop.com', displayName: 'Admin', role: 'admin' };
      setUser(mockUser);
      localStorage.setItem('shopmaster_user', JSON.stringify(mockUser));
    } else {
      setAuthError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shopmaster_user');
  };

  // --- POS Logic ---
  const calculateItemPrice = (product: Product, quantity: number) => {
    let price = product.price;
    
    // Custom logic for 1kg = 20 TK base
    // If base price is 20:
    // 0.5kg = 11
    // 0.25kg = 7
    // 2kg+ = 19 per kg (1 TK discount)
    
    const basePrice = product.price;

    if (product.unit === 'kg') {
      if (quantity >= 2) {
        // Bulk discount: 1 TK less per kg if 2kg or more
        price = basePrice - 1;
      } else if (quantity === 0.5) {
        // Half kg logic: if 1kg is 20, 0.5kg is 11
        // This is roughly (base/2) + 1
        price = (basePrice / 2) + 1;
      } else if (quantity === 0.25) {
        // 250g logic: if 1kg is 20, 0.25kg is 7
        // This is roughly (base/4) + 2
        price = (basePrice / 4) + 2;
      }
    } else if (product.unit === 'unit') {
      if (quantity >= 5) {
        price = basePrice - 1;
      }
    }
    
    return price;
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        const newPrice = calculateItemPrice(product, newQty);
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: newQty, discountedPrice: newPrice } 
            : item
        );
      }
      const initialPrice = calculateItemPrice(product, 1);
      return [...prev, { ...product, quantity: 1, originalPrice: product.price, discountedPrice: initialPrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0.1, item.quantity + delta);
        // Only auto-calculate price if it hasn't been manually overridden
        // For simplicity, we'll re-calculate if delta is used, but allow manual override
        const newPrice = calculateItemPrice(item, newQty);
        return { ...item, quantity: newQty, discountedPrice: newPrice };
      }
      return item;
    }));
  };

  const updateCartQuantityManual = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, quantity);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateCartPriceManual = (productId: string, price: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, discountedPrice: Math.max(0, price) };
      }
      return item;
    }));
  };

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0), [cart]);
  const finalTotal = Math.max(0, cartTotal - discount);

  const [checkoutData, setCheckoutData] = useState({
    customerId: '',
    walkInName: '',
    walkInPhone: '',
    paidAmount: 0,
    paymentMethod: 'cash' as 'cash' | 'due'
  });

  // Auto-set paid amount for cash sales
  useEffect(() => {
    if (checkoutData.paymentMethod === 'cash' && finalTotal > 0) {
      setCheckoutData(prev => ({ ...prev, paidAmount: finalTotal }));
    }
  }, [finalTotal, checkoutData.paymentMethod]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const selectedCustomer = customers.find(c => c.id === checkoutData.customerId);
      const dueAmount = checkoutData.paymentMethod === 'due' ? finalTotal : Math.max(0, finalTotal - checkoutData.paidAmount);

      // Revert old sale effects if editing
      if (editingSale) {
        for (const item of editingSale.items) {
          const productRef = doc(db, 'products', item.productId);
          const product = products.find(p => p.id === item.productId);
          if (product) {
            await updateDoc(productRef, { stock: product.stock + item.quantity });
          }
        }
        if (editingSale.customerId) {
          const customerRef = doc(db, 'customers', editingSale.customerId);
          const customer = customers.find(c => c.id === editingSale.customerId);
          if (customer) {
            await updateDoc(customerRef, {
              currentDue: Math.max(0, (customer.currentDue || 0) - editingSale.dueAmount),
              totalSpent: Math.max(0, (customer.totalSpent || 0) - editingSale.finalAmount)
            });
          }
        }
      }

      const saleData: any = {
        customerName: selectedCustomer?.name || checkoutData.walkInName || 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone || checkoutData.walkInPhone,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.discountedPrice,
          originalPrice: item.originalPrice,
          cost: item.cost || 0
        })),
        totalAmount: cartTotal,
        discount: discount,
        finalAmount: finalTotal,
        paidAmount: checkoutData.paymentMethod === 'cash' ? checkoutData.paidAmount : 0,
        dueAmount: dueAmount,
        previousBalance: selectedCustomer?.currentDue || 0,
        paymentMethod: checkoutData.paymentMethod,
        timestamp: editingSale ? editingSale.timestamp : new Date(),
        sellerId: user.uid
      };

      if (checkoutData.customerId) {
        saleData.customerId = checkoutData.customerId;
      } else {
        saleData.customerId = null;
      }

      let finalSale: Sale;
      if (editingSale) {
        await updateDoc(doc(db, 'sales', editingSale.id), saleData);
        finalSale = { ...saleData, id: editingSale.id } as Sale;
      } else {
        const docRef = await addDoc(collection(db, 'sales'), saleData);
        finalSale = { ...saleData, id: docRef.id } as Sale;
      }
      
      // Apply new sale effects
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        const product = products.find(p => p.id === item.id);
        if (product) {
          // Note: Stock might be slightly off if multiple updates happen fast, 
          // but for this app it's acceptable.
          await updateDoc(productRef, { stock: Math.max(0, product.stock - item.quantity) });
        }
      }

      if (checkoutData.customerId) {
        const customerRef = doc(db, 'customers', checkoutData.customerId);
        const customer = customers.find(c => c.id === checkoutData.customerId);
        if (customer) {
          await updateDoc(customerRef, {
            currentDue: (customer.currentDue || 0) + dueAmount,
            totalSpent: (customer.totalSpent || 0) + finalTotal
          });
        }
      }

      setLastSale(finalSale);
      setLastCompletedSale(finalSale);
      setNotification({ message: editingSale ? "Order updated successfully!" : "Order completed successfully!", type: 'success' });
      setCart([]);
      setDiscount(0);
      setCheckoutData({ customerId: '', walkInName: '', walkInPhone: '', paidAmount: 0, paymentMethod: 'cash' });
      setEditingSale(null);
      setShowReceiptModal(true);

      // Auto Send WhatsApp if customer has phone
      if (finalSale.customerPhone) {
        sendWhatsAppInvoice(finalSale, shopSettings);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'sales');
    }
  };

  const handleDeleteSale = async (sale: Sale) => {
    if (!confirm("Are you sure you want to delete this invoice? This will revert stock and customer balance.")) return;
    
    try {
      for (const item of sale.items) {
        const productRef = doc(db, 'products', item.productId);
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await updateDoc(productRef, { stock: product.stock + item.quantity });
        }
      }

      if (sale.customerId) {
        const customerRef = doc(db, 'customers', sale.customerId);
        const customer = customers.find(c => c.id === sale.customerId);
        if (customer) {
          await updateDoc(customerRef, {
            currentDue: Math.max(0, (customer.currentDue || 0) - sale.dueAmount),
            totalSpent: Math.max(0, (customer.totalSpent || 0) - sale.finalAmount)
          });
        }
      }

      await deleteDoc(doc(db, 'sales', sale.id));
      setNotification({ message: "Invoice deleted successfully", type: 'success' });
    } catch (error) {
      console.error("Delete sale error", error);
      setNotification({ message: "Failed to delete invoice", type: 'error' });
    }
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setActiveTab('pos');
    const loadedCart = sale.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...product,
        id: item.productId,
        name: item.productName,
        quantity: item.quantity,
        discountedPrice: item.price,
        originalPrice: item.originalPrice,
        unit: product?.unit || 'unit'
      } as CartItem;
    });
    setCart(loadedCart);
    setDiscount(sale.discount);
    setCheckoutData({
      customerId: sale.customerId || '',
      paidAmount: sale.paidAmount,
      paymentMethod: sale.paymentMethod
    });
    setNotification({ message: `Editing Invoice #${sale.id.slice(-6).toUpperCase()}`, type: 'info' });
  };

  useEffect(() => {
    if (showReceiptModal && lastCompletedSale) {
      printInvoice(lastCompletedSale, shopSettings);
    }
  }, [showReceiptModal, lastCompletedSale]);

  const handleSaveSettings = async (newSettings: ShopSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'shop'), newSettings);
      setNotification({ message: 'Settings updated successfully', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings');
    }
  };

  const handleAddUser = async (newUser: Omit<AppUser, 'id'>) => {
    // Check if username already exists
    const exists = appUsers.some(u => u.username.toLowerCase() === newUser.username.toLowerCase());
    if (exists) {
      setNotification({ message: 'Username already exists. Please choose another.', type: 'error' });
      return;
    }

    try {
      await addDoc(collection(db, 'users'), newUser);
      setNotification({ message: 'User added successfully', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setNotification({ message: 'User deleted successfully', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'users');
    }
  };

  const handleAddEmployee = async (newEmployee: Omit<Employee, 'id'>) => {
    try {
      await addDoc(collection(db, 'employees'), newEmployee);
      setNotification({ message: 'Employee added successfully', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'employees');
    }
  };

  const handleUpdateEmployee = async (id: string, updatedData: Partial<Employee>) => {
    try {
      await updateDoc(doc(db, 'employees', id), updatedData);
      setNotification({ message: 'Employee updated successfully', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'employees');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    try {
      await deleteDoc(doc(db, 'employees', id));
      setNotification({ message: 'Employee deleted successfully', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'employees');
    }
  };

  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    try {
      await addDoc(collection(db, 'expenses'), newExpense);
      setNotification({ message: 'Expense added successfully', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'expenses');
    }
  };

  const handleAddInvestment = async (newInvestment: Omit<Investment, 'id'>) => {
    try {
      await addDoc(collection(db, 'investments'), newInvestment);
      setNotification({ message: 'Investment added successfully', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'investments');
    }
  };

  const handleAddStaffSalary = async (newSalary: Omit<StaffSalary, 'id'>) => {
    try {
      await addDoc(collection(db, 'staff_salaries'), newSalary);
      setNotification({ message: 'Salary payment recorded', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'staff_salaries');
    }
  };

  const handleScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setIsScannerOpen(false);
      setNotification({ message: `Added ${product.name} to cart`, type: 'success' });
    } else {
      setNotification({ message: `Product with barcode ${barcode} not found. Redirecting to Inventory...`, type: 'info' });
      setIsScannerOpen(false);
      setTimeout(() => setActiveTab('inventory'), 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{shopSettings.name}</h1>
          <p className="text-gray-500 mb-8">Admin Login</p>
          
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {authError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {authError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 truncate">{shopSettings.name}</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-gray-50 border border-gray-200"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X className="w-6 h-6 text-indigo-600" /> : <Menu className="w-6 h-6 text-indigo-600" />}
          </button>
        </header>

        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-screen
        `}>
          <div className="p-6 hidden lg:flex items-center gap-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 truncate">{shopSettings.name}</span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager'] },
              { id: 'pos', icon: ShoppingCart, label: 'POS Terminal', roles: ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team'] },
              { id: 'inventory', icon: Package, label: 'Inventory', roles: ['admin', 'manager', 'assistant_manager'] },
              { id: 'sales', icon: History, label: 'Sales History', roles: ['admin', 'manager', 'assistant_manager', 'sales_manager'] },
              { id: 'customers', icon: Users, label: 'Customers', roles: ['admin', 'manager', 'assistant_manager', 'sales_manager'] },
              { id: 'employees', icon: Briefcase, label: 'Employees', roles: ['admin', 'manager'] },
              { id: 'daily_closing', icon: Clock, label: 'Daily Closing', roles: ['admin', 'manager'] },
              { id: 'accounting', icon: CalculatorIcon, label: 'Hishab Nikash', roles: ['admin', 'manager'] },
              { id: 'settings', icon: Settings, label: 'Settings', roles: ['admin'] },
            ].filter(item => item.roles.includes(user.role)).map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">System Administrator</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <Dashboard 
                products={products} 
                sales={sales} 
                customers={customers} 
                expenses={expenses}
                onViewProductHistory={(p) => {
                  setSelectedProductForHistory(p);
                }}
              />
            )}
            {activeTab === 'pos' && (
              <POS 
                products={products} 
                cart={cart} 
                addToCart={addToCart} 
                removeFromCart={removeFromCart} 
                updateCartQuantity={updateCartQuantity}
                updateCartQuantityManual={updateCartQuantityManual}
                updateCartPriceManual={updateCartPriceManual}
                handleCheckout={handleCheckout}
                discount={discount}
                setDiscount={setDiscount}
                cartTotal={cartTotal}
                finalTotal={finalTotal}
                customers={customers}
                checkoutData={checkoutData}
                setCheckoutData={setCheckoutData}
                onScanClick={() => setIsScannerOpen(true)}
                editingSale={editingSale}
                onCancelEdit={() => {
                  setEditingSale(null);
                  setCart([]);
                  setDiscount(0);
                  setCheckoutData({ customerId: '', paidAmount: 0, paymentMethod: 'cash' });
                }}
                settings={shopSettings}
              />
            )}
            {activeTab === 'inventory' && (
              <Inventory 
                products={products} 
                categories={categories} 
                onViewHistory={(p) => {
                  setSelectedProductForHistory(p);
                }}
              />
            )}
            {activeTab === 'sales' && (
              <SalesHistory 
                sales={sales} 
                onEdit={handleEditSale}
                onDelete={handleDeleteSale}
                settings={shopSettings}
              />
            )}
            {activeTab === 'customers' && <Customers customers={customers} sales={sales} />}
            {activeTab === 'employees' && (
              <EmployeeManagement 
                employees={employees} 
                onAdd={handleAddEmployee} 
                onUpdate={handleUpdateEmployee} 
                onDelete={handleDeleteEmployee} 
              />
            )}
            {activeTab === 'daily_closing' && (
              <DailyClosingView 
                sales={sales} 
                expenses={expenses} 
                dailyClosings={dailyClosings}
                settings={shopSettings}
              />
            )}
            {activeTab === 'accounting' && (
              <Accounting 
                sales={sales} 
                products={products} 
                expenses={expenses} 
                investments={investments} 
                staffSalaries={staffSalaries}
                customers={customers}
                onAddExpense={handleAddExpense}
                onAddInvestment={handleAddInvestment}
                onAddSalary={handleAddStaffSalary}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel 
                settings={shopSettings} 
                onSaveSettings={handleSaveSettings} 
                users={appUsers}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </AnimatePresence>
        </main>

        <Calculator />

        {isScannerOpen && (
          <BarcodeScanner 
            onScan={handleScan} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}

        {showReceiptModal && lastCompletedSale && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Successful!</h2>
              <p className="text-gray-500 mb-8">Invoice #{lastCompletedSale.id.slice(-6).toUpperCase()} has been generated.</p>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => {
                    printInvoice(lastCompletedSale, shopSettings);
                    setShowReceiptModal(false);
                  }}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print Receipt
                </button>
                {lastCompletedSale.customerPhone && (
                  <button 
                    onClick={() => {
                      sendWhatsAppInvoice(lastCompletedSale, shopSettings);
                      setShowReceiptModal(false);
                    }}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send via WhatsApp
                  </button>
                )}
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[90vw]"
            >
              <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
                notification.type === 'error' ? 'bg-red-600 border-red-500 text-white' :
                'bg-indigo-600 border-indigo-500 text-white'
              }`}>
                {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-semibold">{notification.message}</span>
                <button onClick={() => setNotification(null)} className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Receipt Modal */}
        <AnimatePresence>
          {lastSale && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="text-xl font-bold text-gray-900">Sale Receipt</h3>
                  <button onClick={() => setLastSale(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="text-center space-y-1">
                    {shopSettings.logoUrl && (
                      <img src={shopSettings.logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-2 object-contain" referrerPolicy="no-referrer" />
                    )}
                    <h4 className="text-2xl font-black text-indigo-600">{shopSettings.name}</h4>
                    <p className="text-[10px] text-gray-500 max-w-[200px] mx-auto leading-relaxed">{shopSettings.address}</p>
                    <p className="text-sm text-gray-500 pt-2">Invoice: #{lastSale.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{format(new Date(), 'MMM dd, yyyy hh:mm a')}</p>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-semibold text-gray-900">{lastSale.customerName}</span>
                    </div>
                    {lastSale.customerPhone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phone:</span>
                        <span className="text-gray-900">{lastSale.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items</p>
                    {lastSale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">{toBengaliNumber(item.quantity)} x {formatCurrency(item.price)}</p>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(item.quantity * item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(lastSale.totalAmount)}</span>
                    </div>
                    {lastSale.discount > 0 && (
                      <div className="flex justify-between text-sm text-red-500">
                        <span>Discount</span>
                        <span>- {formatCurrency(lastSale.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                      <span>Total</span>
                      <span className="text-indigo-600">{formatCurrency(lastSale.finalAmount)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-bold uppercase text-indigo-600">{lastSale.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Paid Amount:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(lastSale.paidAmount)}</span>
                    </div>
                    {lastSale.dueAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Due Amount:</span>
                        <span className="font-bold text-red-600">{formatCurrency(lastSale.dueAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button 
                    onClick={() => downloadInvoicePDF(lastSale, shopSettings)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button 
                    onClick={() => setLastSale(null)}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-sm"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {selectedProductForHistory && (
          <ProductHistory 
            product={selectedProductForHistory} 
            sales={sales} 
            onClose={() => setSelectedProductForHistory(null)} 
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

// --- Sub-components ---

function BarcodeScanner({ onScan, onClose }: { onScan: (data: string) => void, onClose: () => void }) {
  useEffect(() => {
    // const scanner = new Html5QrcodeScanner(
    //   "reader",
    //   { 
    //     fps: 10, 
    //     qrbox: { width: 250, height: 250 },
    //     videoConstraints: {
    //       facingMode: "environment"
    //     }
    //   },
    //   /* verbose= */ false
    // );
    // scanner.render(onScan, (err) => {
    //   // console.warn(err);
    // });
    //
    // return () => {
    //   scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    // };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-indigo-600" />
            Scan Barcode/QR
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div id="reader" className="w-full"></div>
        <div className="p-6 bg-gray-50 text-center">
          <p className="text-sm text-gray-500">Position the barcode within the frame to scan</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ products, sales, customers, expenses, onViewProductHistory }: { products: Product[], sales: Sale[], customers: Customer[], expenses: Expense[], onViewProductHistory: (p: Product) => void }) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [viewMetric, setViewMetric] = useState<'revenue' | 'profit'>('revenue');
  const now = new Date();

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = s.timestamp.toDate();
      if (period === 'day') return format(saleDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
      if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return saleDate >= weekAgo;
      }
      if (period === 'month') return format(saleDate, 'yyyy-MM') === format(now, 'yyyy-MM');
      if (period === 'year') return format(saleDate, 'yyyy') === format(now, 'yyyy');
      return true;
    });
  }, [sales, period]);

  const totalSales = filteredSales.reduce((sum, s) => sum + s.finalAmount, 0);
  const totalOrders = filteredSales.length;
  const totalMarketDue = customers.reduce((sum, c) => sum + (c.currentDue || 0), 0);
  
  const totalCost = filteredSales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => itemSum + ((item.cost || 0) * item.quantity), 0);
  }, 0);

  const totalExpensesInPeriod = expenses.filter(e => {
    const expDate = e.timestamp.toDate();
    if (period === 'day') return format(expDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return expDate >= weekAgo;
    }
    if (period === 'month') return format(expDate, 'yyyy-MM') === format(now, 'yyyy-MM');
    if (period === 'year') return format(expDate, 'yyyy') === format(now, 'yyyy');
    return true;
  }).reduce((sum, e) => sum + e.amount, 0);

  const grossProfit = totalSales - totalCost;
  const netProfit = grossProfit - totalExpensesInPeriod;
  
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10);
  const outOfStockProducts = products.filter(p => p.stock <= 0);
  
  const expiredProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    return exp < now;
  });

  const nearExpiryProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  });

  const stats = useMemo(() => {
    const today = format(now, 'yyyy-MM-dd');
    const todaySales = sales.filter(s => format(s.timestamp.toDate(), 'yyyy-MM-dd') === today);
    const todayCash = todaySales.reduce((sum, s) => sum + s.paidAmount, 0);
    const todayDue = todaySales.reduce((sum, s) => sum + s.dueAmount, 0);
    
    const periodCash = filteredSales.reduce((sum, s) => sum + s.paidAmount, 0);
    const periodDue = filteredSales.reduce((sum, s) => sum + s.dueAmount, 0);

    return { todayCash, todayDue, periodCash, periodDue };
  }, [sales, filteredSales]);

  const chartData = useMemo(() => {
    let labels: string[] = [];
    if (period === 'day' || period === 'week') {
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return format(d, 'MMM dd');
      }).reverse();
    } else if (period === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return format(d, 'MMM dd');
      }).reverse();
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    return labels.map(label => {
      const periodSales = sales.filter(s => {
        const saleDate = s.timestamp.toDate();
        if (period === 'year') return format(saleDate, 'MMM') === label;
        return format(saleDate, 'MMM dd') === label;
      });

      const totalRevenue = periodSales.reduce((sum, s) => sum + s.finalAmount, 0);
      const totalCost = periodSales.reduce((sum, s) => {
        return sum + s.items.reduce((itemSum, item) => itemSum + ((item.cost || 0) * item.quantity), 0);
      }, 0);

      return {
        name: label,
        sales: totalRevenue,
        cash: periodSales.reduce((sum, s) => sum + s.paidAmount, 0),
        due: periodSales.reduce((sum, s) => sum + s.dueAmount, 0),
        profit: totalRevenue - totalCost
      };
    });
  }, [sales, period]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === p ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label={`${period.charAt(0).toUpperCase() + period.slice(1)} Revenue`} value={formatCurrency(totalSales)} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={TrendingUp} label={`${period.charAt(0).toUpperCase() + period.slice(1)} Net Profit`} value={formatCurrency(netProfit)} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={AlertCircle} label="Total Market Due" value={formatCurrency(totalMarketDue)} color="bg-red-50 text-red-600" />
        <StatCard icon={CheckCircle2} label={`${period.charAt(0).toUpperCase() + period.slice(1)} Cash`} value={formatCurrency(stats.periodCash)} color="bg-blue-50 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Gross Sales</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Cost of Goods</span>
              <span className="font-bold text-red-600">-{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-gray-900 font-bold">Gross Profit</span>
              <span className="font-bold text-emerald-600">{formatCurrency(grossProfit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Expenses</span>
              <span className="font-bold text-red-600">-{formatCurrency(totalExpensesInPeriod)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-gray-900 font-bold">Net Profit</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Payment Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Cash Received</span>
              <span className="font-bold text-blue-600">{formatCurrency(stats.periodCash)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">New Due</span>
              <span className="font-bold text-amber-600">{formatCurrency(stats.periodDue)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-gray-900 font-bold">Total Orders</span>
              <span className="font-bold text-gray-900">{totalOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Inventory Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Low Stock Items</span>
              <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">{lowStockProducts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Out of Stock</span>
              <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">{outOfStockProducts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Expired Items</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{expiredProducts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AlertBox 
          icon={AlertTriangle} 
          label="Low Stock" 
          count={lowStockProducts.length} 
          color="text-amber-600" 
          bgColor="bg-amber-50"
          items={lowStockProducts}
          onItemClick={onViewProductHistory}
        />
        <AlertBox 
          icon={Box} 
          label="Out of Stock" 
          count={outOfStockProducts.length} 
          color="text-red-600" 
          bgColor="bg-red-50"
          items={outOfStockProducts}
          onItemClick={onViewProductHistory}
        />
        <AlertBox 
          icon={Calendar} 
          label="Expired" 
          count={expiredProducts.length} 
          color="text-rose-600" 
          bgColor="bg-rose-50"
          items={expiredProducts}
          onItemClick={onViewProductHistory}
        />
        <AlertBox 
          icon={Clock} 
          label="Near Expiry" 
          count={nearExpiryProducts.length} 
          color="text-orange-600" 
          bgColor="bg-orange-50"
          items={nearExpiryProducts}
          onItemClick={onViewProductHistory}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold">Sales Overview ({period === 'year' ? 'By Month' : 'Last 7 Days'})</h3>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                onClick={() => setViewMetric('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMetric === 'revenue' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setViewMetric('profit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMetric === 'profit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Profit Margin
              </button>
            </div>
          </div>

          <div className="h-80 min-h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `TK ${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-50">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">{label}</p>
                          <div className="space-y-1">
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center justify-between gap-8">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                  {entry.name}
                                </span>
                                <span className="text-sm font-bold text-gray-900">TK {entry.value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {viewMetric === 'revenue' ? (
                  <>
                    <Bar dataKey="cash" name="Cash Collected" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="due" name="New Due" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </>
                ) : (
                  <Bar dataKey="profit" name="Net Profit" fill="#6366f1" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Recent Sales</h3>
          <div className="space-y-4">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{sale.customerName || 'Walk-in'}</p>
                    <p className="text-xs text-gray-500">{format(sale.timestamp.toDate(), 'hh:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">TK {sale.finalAmount}</p>
                  <p className={`text-[10px] ${sale.dueAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {sale.dueAmount > 0 ? `Due: TK ${sale.dueAmount}` : 'Paid'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AlertBox({ icon: Icon, label, count, color, bgColor, items, onItemClick }: any) {
  return (
    <div className={`${bgColor} p-5 rounded-2xl border border-gray-100 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-2xl font-black ${color}`}>{count}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-700">{label}</p>
        <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
          {items.slice(0, 3).map((p: any) => (
            <button 
              key={p.id} 
              onClick={() => onItemClick(p)}
              className="text-[10px] text-gray-500 hover:text-indigo-600 block truncate w-full text-left"
            >
              • {p.name} ({p.stock} {p.unit})
            </button>
          ))}
          {items.length > 3 && <p className="text-[10px] text-gray-400 italic">+{items.length - 3} more...</p>}
        </div>
      </div>
    </div>
  );
}

function ProductHistory({ product, sales, onClose }: { product: Product, sales: Sale[], onClose: () => void }) {
  const productSales = sales.filter(s => s.items.some(item => item.productId === product.id));
  
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <HistoryIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{product.name} History</h3>
              <p className="text-xs text-gray-500">Stock: {product.stock} {product.unit} | Price: TK {product.price}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Sales History
              </h4>
              {productSales.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No sales recorded for this product yet.</p>
              ) : (
                <div className="space-y-3">
                  {productSales.map(sale => {
                    const item = sale.items.find(i => i.productId === product.id);
                    return (
                      <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <p className="text-xs font-bold text-gray-400">{format(sale.timestamp.toDate(), 'MMM dd')}</p>
                            <p className="text-[10px] text-gray-400">{format(sale.timestamp.toDate(), 'yyyy')}</p>
                          </div>
                          <div className="w-px h-8 bg-gray-200" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{sale.customerName || 'Walk-in'}</p>
                            <p className="text-xs text-gray-500">Quantity: {item?.quantity} {product.unit}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">TK {(item?.quantity || 0) * (item?.price || 0)}</p>
                          <p className="text-[10px] text-gray-400">Invoice: #{sale.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
    } else if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        setDisplay(eval(display).toString());
      } catch {
        setDisplay('Error');
      }
    } else {
      setDisplay(prev => prev === '0' ? val : prev + val);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50"
      >
        <CalculatorIcon className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-40 right-8 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Calculator</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl mb-4 text-right">
              <p className="text-2xl font-mono font-bold text-gray-900 truncate">{display}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'].map(btn => (
                <button
                  key={btn}
                  onClick={() => handleAction(btn)}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    btn === 'C' ? 'col-span-4 bg-red-50 text-red-600 hover:bg-red-100' :
                    btn === '=' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                    ['/', '*', '-', '+'].includes(btn) ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' :
                    'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function EmployeeManagement({ employees, onAdd, onUpdate, onDelete }: { employees: Employee[], onAdd: (e: Omit<Employee, 'id'>) => void, onUpdate: (id: string, e: Partial<Employee>) => void, onDelete: (id: string) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const employeeData = {
      name: formData.get('name') as string,
      designation: formData.get('designation') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      salary: Number(formData.get('salary')),
      joiningDate: formData.get('joiningDate') as string,
      schedule: formData.get('schedule') as string,
      status: formData.get('status') as 'active' | 'inactive'
    };

    if (editingEmployee) {
      onUpdate(editingEmployee.id, employeeData);
    } else {
      onAdd(employeeData);
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-500">Manage your shop staff and their schedules.</p>
        </div>
        <button 
          onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search employees by name, designation or phone..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Employee</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Salary & Schedule</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{emp.phone}</p>
                    <p className="text-xs text-gray-500">{emp.email || 'No email'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">TK {emp.salary}</p>
                    <p className="text-xs text-gray-500">{emp.schedule || 'Not set'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      emp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(emp.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input name="name" defaultValue={editingEmployee?.name} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Designation *</label>
                    <input name="designation" defaultValue={editingEmployee?.designation} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                    <input name="phone" defaultValue={editingEmployee?.phone} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input name="email" type="email" defaultValue={editingEmployee?.email} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Salary *</label>
                    <input name="salary" type="number" defaultValue={editingEmployee?.salary} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Joining Date</label>
                    <input name="joiningDate" type="date" defaultValue={editingEmployee?.joiningDate} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Work Schedule</label>
                    <input name="schedule" defaultValue={editingEmployee?.schedule} placeholder="e.g. 9 AM - 6 PM" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select name="status" defaultValue={editingEmployee?.status || 'active'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    {editingEmployee ? 'Update Employee' : 'Save Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function POS({ 
  products, 
  cart, 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  updateCartQuantityManual,
  updateCartPriceManual,
  handleCheckout,
  discount,
  setDiscount,
  cartTotal,
  finalTotal,
  customers,
  checkoutData,
  setCheckoutData,
  onScanClick,
  editingSale,
  onCancelEdit,
  settings
}: any) {

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filteredProducts = products.filter((p: Product) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.includes(searchTerm)
  );

  const selectedCustomer = customers.find((c: Customer) => c.id === checkoutData.customerId);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:h-[calc(100vh-8rem)]"
    >
      <div className="lg:col-span-2 flex flex-col space-y-6 min-h-[500px] lg:min-h-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
              title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
            >
              {viewMode === 'grid' ? <Menu className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
            </button>
            <button 
              onClick={onScanClick}
              className="px-4 py-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors flex items-center gap-2 border border-indigo-100"
            >
              <Scan className="w-5 h-5" />
              <span className="hidden sm:inline">Scan</span>
            </button>
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <select 
                className="w-full sm:w-64 px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={checkoutData.customerId}
                onChange={(e) => setCheckoutData({ ...checkoutData, customerId: e.target.value })}
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c: Customer) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
              {!checkoutData.customerId && (
                <div className="flex gap-2 flex-1">
                  <input 
                    type="text"
                    placeholder="Walk-in Name (Optional)"
                    className="flex-1 px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm"
                    value={checkoutData.walkInName}
                    onChange={(e) => setCheckoutData({ ...checkoutData, walkInName: e.target.value })}
                  />
                  <input 
                    type="text"
                    placeholder="Phone (Optional)"
                    className="w-32 px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm"
                    value={checkoutData.walkInPhone}
                    onChange={(e) => setCheckoutData({ ...checkoutData, walkInPhone: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 lg:overflow-y-auto pb-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((product: Product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="w-full aspect-square bg-gray-50 rounded-xl mb-4 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <Package className="w-10 h-10 text-gray-300 group-hover:text-indigo-300" />
                  </div>
                  <p className="font-bold text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-indigo-600 font-bold">{formatCurrency(product.price)}</span>
                    <span className="text-[10px] text-gray-400">/{product.unit}</span>
                  </div>
                  {product.expiryDate && (
                    <p className="text-[10px] text-amber-600 mt-1">Exp: {product.expiryDate}</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">SL</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Product</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Price</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product: Product, index: number) => (
                    <tr key={product.id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-gray-400">#{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-[10px] text-gray-400">Stock: {product.stock} {product.unit}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-indigo-600">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => addToCart(product)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
              Order Details
            </h3>
            {editingSale && (
              <button 
                onClick={onCancelEdit}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                Cancel Edit
              </button>
            )}
          </div>
          {editingSale && (
            <div className="mt-2 p-2 bg-indigo-50 rounded-lg text-[10px] text-indigo-700 font-bold">
              Editing Invoice: #{editingSale.id.slice(-6).toUpperCase()}
            </div>
          )}
          {selectedCustomer && (
            <div className="mt-2 p-3 bg-amber-50 rounded-2xl text-xs text-amber-700 relative">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const cleanPhone = selectedCustomer.phone.replace(/\D/g, '');
                    const formattedPhone = cleanPhone.startsWith('880') ? cleanPhone : `880${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
                    window.open(`https://wa.me/${formattedPhone}`, '_blank');
                  }}
                  className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                  title="WhatsApp Message"
                >
                  <MessageCircle className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => {
                    const message = `Hello ${selectedCustomer.name}, this is from ${settings.name}. Your current outstanding due is TK ${selectedCustomer.currentDue}. Please clear it at your earliest convenience. Thank you!`;
                    const cleanPhone = selectedCustomer.phone.replace(/\D/g, '');
                    const formattedPhone = cleanPhone.startsWith('880') ? cleanPhone : `880${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
                    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                  title="Send Due Reminder"
                >
                  <Clock className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1 pr-8">
                <p className="font-bold flex items-center gap-2">
                  <UserIcon className="w-3 h-3" /> {selectedCustomer.name}
                </p>
                {(selectedCustomer.fatherName || selectedCustomer.houseName) && (
                  <p className="text-[10px] opacity-75">
                    {selectedCustomer.fatherName && `F: ${selectedCustomer.fatherName}`}
                    {selectedCustomer.fatherName && selectedCustomer.houseName && ' | '}
                    {selectedCustomer.houseName && `H: ${selectedCustomer.houseName}`}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span className="font-bold">Previous Due:</span> {formatCurrency(selectedCustomer.currentDue)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item: CartItem) => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-sm">{item.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {item.discountedPrice < item.originalPrice ? (
                        <span className="line-through mr-1 text-gray-300">{formatCurrency(item.originalPrice)}</span>
                      ) : null}
                      {formatCurrency(item.discountedPrice)} / {item.unit}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-0.5">
                      <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1.5 hover:bg-white rounded-lg shadow-sm transition-all"><Minus className="w-3 h-3" /></button>
                      <input 
                        type="number" 
                        step="0.01"
                        value={item.quantity} 
                        onChange={(e) => updateCartQuantityManual(item.id, Number(e.target.value))}
                        className="w-12 text-center font-bold text-gray-900 bg-transparent outline-none text-xs"
                      />
                      <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1.5 hover:bg-white rounded-lg shadow-sm transition-all"><Plus className="w-3 h-3" /></button>
                    </div>
                    {item.unit === 'kg' && (
                      <div className="flex gap-1">
                        {[0.25, 0.5, 1, 2, 5].map(q => (
                          <button 
                            key={q}
                            onClick={() => updateCartQuantityManual(item.id, q)}
                            className="px-1.5 py-0.5 bg-gray-50 text-[9px] font-bold text-gray-500 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                          >
                            {q}kg
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        step="0.01"
                        value={item.discountedPrice}
                        onChange={(e) => updateCartPriceManual(item.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-200 rounded-lg bg-white text-right font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">{formatCurrency(item.discountedPrice * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600 text-sm">
              <span>Discount</span>
              <input 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-right text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1.5 border-t border-gray-200">
              <span>Total</span>
              <span className="text-indigo-600">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <button 
                onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'cash' })}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${checkoutData.paymentMethod === 'cash' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >Cash</button>
              <button 
                onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: 'due' })}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${checkoutData.paymentMethod === 'due' ? 'bg-amber-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >Due</button>
            </div>
            
            {checkoutData.paymentMethod === 'cash' && (
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase">Paid Amount</label>
                  <button 
                    onClick={() => setCheckoutData({ ...checkoutData, paidAmount: finalTotal })}
                    className="text-[9px] text-indigo-600 font-bold hover:underline"
                  >
                    Full Paid
                  </button>
                </div>
                <input 
                  type="number" 
                  value={checkoutData.paidAmount}
                  onChange={(e) => setCheckoutData({ ...checkoutData, paidAmount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                {checkoutData.paidAmount < finalTotal && (
                  <p className="text-[9px] text-amber-600 mt-0.5">Remaining TK {finalTotal - checkoutData.paidAmount} will be added to Due</p>
                )}
                {checkoutData.paidAmount > finalTotal && (
                  <p className="text-[9px] text-emerald-600 mt-0.5">Change: TK {checkoutData.paidAmount - finalTotal}</p>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 text-white rounded-2xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-sm ${editingSale ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {editingSale ? 'Update Order' : 'Complete Order'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Inventory({ products, categories, onViewHistory }: { products: Product[], categories: Category[], onViewHistory: (p: Product) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const filteredCategories = FIXED_CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serialNumber.toString().includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (editingProduct?.imageUrl) {
      setProductImage(editingProduct.imageUrl);
    } else {
      setProductImage(null);
    }
  }, [editingProduct]);

  const handleDownloadCSV = () => {
    const csvData = products.map(p => ({
      'Serial Number': p.serialNumber,
      'Name': p.name,
      'Category': p.category,
      'Price': p.price,
      'Cost': p.cost,
      'Stock': p.stock,
      'Unit': p.unit,
      'Barcode': p.barcode,
      'Expiry Date': p.expiryDate || '',
      'Location': p.location || '',
      'Department': p.department || '',
      'Warehouse': p.warehouse || ''
    }));
    
    // // @ts-ignore
    // import('papaparse').then(Papa => {
    //   const csv = Papa.unparse(csvData);
    //   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    //   const link = document.createElement('a');
    //   link.href = URL.createObjectURL(blob);
    //   link.setAttribute('download', `inventory_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    // });
  };

  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: any) => {
          const data = results.data;
          let newProductsCount = 0;
          const maxSerial = products.reduce((max, p) => Math.max(max, p.serialNumber || 0), 0);

          for (const row of data) {
            const name = row.Name || row.name || row['Product Name'];
            const price = Number(row.Price || row.price || row['Selling Price']);
            const serialFromCSV = Number(row['Serial Number'] || row.serialNumber);
            
            if (!name || isNaN(price)) continue;
            
            const productData = {
              name: name,
              category: row.Category || row.category || 'General',
              price: price,
              cost: Number(row.Cost || row.cost || row['Buying Price'] || 0),
              stock: Number(row.Stock || row.stock || row['Initial Stock'] || 0),
              unit: (row.Unit || row.unit || 'unit').toLowerCase() === 'kg' ? 'kg' : 'unit',
              barcode: row.Barcode || row.barcode || '',
              expiryDate: row['Expiry Date'] || row.expiryDate || '',
              location: row.Location || row.location || '',
              department: row.Department || row.department || '',
              warehouse: row.Warehouse || row.warehouse || ''
            };

            // Try to find existing product by Serial Number first, then Barcode, then Name
            const existing = products.find(p => 
              (serialFromCSV && p.serialNumber === serialFromCSV) ||
              (productData.barcode && p.barcode === productData.barcode) ||
              (p.name.toLowerCase() === name.toLowerCase())
            );

            if (existing) {
              await updateDoc(doc(db, 'products', existing.id), productData);
            } else {
              await addDoc(collection(db, 'products'), {
                ...productData,
                serialNumber: maxSerial + 1 + newProductsCount
              });
              newProductsCount++;
            }
          }
          setIsUploading(false);
          alert(`Inventory updated: ${data.length} rows processed.`);
        }
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const imageFile = (form.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
    
    let imageUrl = productImage;
    if (imageFile) {
      imageUrl = await fileToBase64(imageFile);
    }
    
    const productData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      cost: Number(formData.get('cost') || 0),
      stock: Number(formData.get('stock') || 0),
      unit: formData.get('unit') as 'kg' | 'unit',
      barcode: formData.get('barcode') as string || '',
      department: formData.get('department') as string || '',
      warehouse: formData.get('warehouse') as string || '',
      expiryDate: formData.get('expiryDate') as string || '',
      location: formData.get('location') as string || '',
      imageUrl: imageUrl
    };

    if (!productData.name || isNaN(productData.price) || productData.price < 0) {
      alert("Please enter a valid product name and price.");
      return;
    }

    try {
      if (editingProduct?.id) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        // Generate serial number
        const maxSerial = products.reduce((max, p) => Math.max(max, p.serialNumber || 0), 0);
        const newProduct = {
          ...productData,
          serialNumber: maxSerial + 1
        };
        await addDoc(collection(db, 'products'), newProduct);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setProductImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'products');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search products by name, barcode, SN or category..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-100 transition-all border border-emerald-100">
              <Download className="w-4 h-4 rotate-180" />
              Upload CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleUploadCSV} disabled={isUploading} />
            </label>
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-all border border-blue-100"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setProductImage(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Dept/Wh</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Margin</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">SN: {product.serialNumber}</span>
                          <span>Barcode: {product.barcode || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>{product.department || '-'}</span>
                      <span className="text-[10px] opacity-60">{product.warehouse || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-600">
                        {formatCurrency(product.price - (product.cost || 0))}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {product.price > 0 ? Math.round(((product.price - (product.cost || 0)) / product.price) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {product.stock} {product.unit || 'pcs'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onViewHistory(product)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="View History"
                      >
                        <HistoryIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); setProductImage(null); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-24 h-24 bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                    {productImage ? (
                      <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Product Image</label>
                    <p className="text-xs text-gray-500 mb-3">Upload a clear picture of the product</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const base64 = await fileToBase64(file);
                          setProductImage(base64);
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                    <input name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Enter product name" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          type="text" 
                          placeholder="Search category..." 
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <select name="category" defaultValue={editingProduct?.category} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Select Category</option>
                        {filteredCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Unit *</label>
                    <select name="unit" defaultValue={editingProduct?.unit || 'unit'} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="unit">Unit (pcs)</option>
                      <option value="kg">KG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Selling Price *</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Buying Price (Cost)</label>
                    <input name="cost" type="number" step="0.01" defaultValue={editingProduct?.cost} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Initial Stock</label>
                    <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Barcode</label>
                    <input name="barcode" defaultValue={editingProduct?.barcode} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Scan or enter barcode" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                    <input name="expiryDate" type="date" defaultValue={editingProduct?.expiryDate} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Location (Shelf/Aisle)</label>
                    <input name="location" defaultValue={editingProduct?.location} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Shelf A1" />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SalesHistory({ sales, onEdit, onDelete, settings }: { sales: Sale[], onEdit: (s: Sale) => void, onDelete: (s: Sale) => void, settings: ShopSettings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerPhone?.includes(searchTerm)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Sales History</h2>
          <p className="text-gray-500">Review past transactions and performance.</p>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search by invoice ID, customer name or phone..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date & Time</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Paid/Due</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.map(sale => (
                <tr 
                  key={sale.id} 
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedSale(sale)}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{format(sale.timestamp.toDate(), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-gray-500">{format(sale.timestamp.toDate(), 'hh:mm a')}</p>
                    <p className="text-[10px] font-mono text-indigo-400">#{sale.id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{sale.customerName || 'Walk-in'}</p>
                    <p className="text-xs text-gray-500">{sale.customerPhone || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(sale.finalAmount)}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                        Paid: {formatCurrency(sale.paidAmount)}
                      </span>
                      {sale.dueAmount > 0 && (
                        <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">
                          Due: {formatCurrency(sale.dueAmount)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => printInvoice(sale, settings)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => downloadInvoicePDF(sale, settings)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {sale.customerPhone && (
                        <button 
                          onClick={() => sendWhatsAppInvoice(sale, settings)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Send via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => onEdit(sale)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Order"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(sale)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Details Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">Invoice Details</h3>
                <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Invoice ID</p>
                    <p className="text-lg font-bold text-gray-900">#{selectedSale.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="text-lg font-bold text-gray-900">{format(selectedSale.timestamp.toDate(), 'MMM dd, yyyy hh:mm a')}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm font-bold text-gray-900 mb-2">Customer Info</p>
                  <p className="text-gray-700">{selectedSale.customerName || 'Walk-in'}</p>
                  {selectedSale.customerPhone && <p className="text-sm text-gray-500">{selectedSale.customerPhone}</p>}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-900">Items</p>
                  <div className="divide-y divide-gray-100">
                    {selectedSale.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                        <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(selectedSale.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-red-500">-{formatCurrency(selectedSale.discount)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span className="text-gray-900">Grand Total</span>
                    <span className="text-indigo-600">{formatCurrency(selectedSale.finalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-4">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="text-emerald-600 font-bold">{formatCurrency(selectedSale.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Due Amount</span>
                    <span className="text-red-600 font-bold">{formatCurrency(selectedSale.dueAmount)}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => printInvoice(selectedSale, settings)}
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    Print
                  </button>
                  <button 
                    onClick={() => downloadInvoicePDF(selectedSale, settings)}
                    className="flex-1 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Accounting({ 
  sales, 
  products, 
  expenses, 
  investments, 
  staffSalaries, 
  customers,
  onAddExpense,
  onAddInvestment,
  onAddSalary
}: { 
  sales: Sale[], 
  products: Product[], 
  expenses: Expense[], 
  investments: Investment[], 
  staffSalaries: StaffSalary[],
  customers: Customer[],
  onAddExpense: (e: Omit<Expense, 'id'>) => void,
  onAddInvestment: (i: Omit<Investment, 'id'>) => void,
  onAddSalary: (s: Omit<StaffSalary, 'id'>) => void
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'investments' | 'salaries' | 'dues'>('overview');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  const totalSales = useMemo(() => sales.reduce((sum, s) => sum + (s.finalAmount || 0), 0), [sales]);
  const totalCost = useMemo(() => {
    return sales.reduce((sum, s) => {
      return sum + s.items.reduce((itemSum, item) => {
        return itemSum + ((item.cost || 0) * item.quantity);
      }, 0);
    }, 0);
  }, [sales]);

  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + (e.amount || 0), 0), [expenses]);
  const totalInvestments = useMemo(() => investments.reduce((sum, i) => sum + (i.amount || 0), 0), [investments]);
  const totalSalaries = useMemo(() => staffSalaries.reduce((sum, s) => sum + (s.amount || 0), 0), [staffSalaries]);
  const totalMarketDue = useMemo(() => customers.reduce((sum, c) => sum + (c.currentDue || 0), 0), [customers]);
  const netProfit = totalSales - totalCost - totalExpenses;

  const highDueCustomers = useMemo(() => {
    return customers.filter(c => (c.currentDue || 0) >= 5000)
      .sort((a, b) => (b.currentDue || 0) - (a.currentDue || 0));
  }, [customers]);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onAddExpense({
      category: formData.get('category') as any,
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      timestamp: new Date()
    });
    setIsExpenseModalOpen(false);
  };

  const handleInvestmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onAddInvestment({
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      timestamp: new Date()
    });
    setIsInvestmentModalOpen(false);
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onAddSalary({
      staffName: formData.get('staffName') as string,
      amount: Number(formData.get('amount')),
      month: formData.get('month') as string,
      timestamp: new Date()
    });
    setIsSalaryModalOpen(false);
  };

  const sendWhatsAppReminder = (customer: Customer) => {
    const message = `Assalamu Alaikum ${customer.name}, this is a reminder regarding your outstanding due of TK ${customer.currentDue?.toFixed(2)}. ${customer.dueDate ? `Your promised date was ${customer.dueDate}.` : ''} Please settle the amount as soon as possible. Thank you!`;
    const cleanPhone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Hishab Nikash</h2>
          <p className="text-gray-500">Accounting and Financial Management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsExpenseModalOpen(true)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
          <button onClick={() => setIsInvestmentModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Investment
          </button>
          <button onClick={() => setIsSalaryModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Pay Salary
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Net Profit/Loss</p>
          <h3 className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            TK {netProfit.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-400 mt-2">After expenses & cost</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
          <h3 className="text-2xl font-black text-red-500">TK {totalExpenses.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-2">Includes salaries & bills</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Market Due</p>
          <h3 className="text-2xl font-black text-orange-500">TK {totalMarketDue.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-2">Outstanding from customers</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Investments</p>
          <h3 className="text-2xl font-black text-indigo-600">TK {totalInvestments.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-2">Capital injected</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-100">
        {(['overview', 'expenses', 'investments', 'salaries', 'dues'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-bold capitalize transition-all ${
              activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'overview' && (
          <div className="p-8">
            <h3 className="text-lg font-bold mb-6">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-600">Total Sales Revenue</span>
                <span className="font-bold text-gray-900">TK {totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-600">Total Product Cost</span>
                <span className="font-bold text-gray-900">TK {totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-600">Total Operating Expenses</span>
                <span className="font-bold text-red-600">TK {totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <span className="text-indigo-900 font-bold">Net Profit</span>
                <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  TK {netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">{format(exp.timestamp.toDate(), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{exp.description}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">TK {exp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'investments' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.map(inv => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">{format(inv.timestamp.toDate(), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{inv.description}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">TK {inv.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'salaries' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Staff Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Month</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffSalaries.map(sal => (
                <tr key={sal.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">{format(sal.timestamp.toDate(), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{sal.staffName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sal.month}</td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-right">TK {sal.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'dues' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <p className="font-bold">High Due Alert</p>
                <p className="text-sm">Customers with dues over TK 5,000 require immediate attention.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highDueCustomers.map(customer => (
                <div 
                  key={customer.id} 
                  className={`p-6 rounded-3xl border-2 transition-all ${
                    customer.currentDue >= 10000 
                      ? 'bg-yellow-50 border-yellow-400' 
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{customer.name}</h4>
                      <p className="text-xs text-gray-500">{customer.phone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                      customer.currentDue >= 10000 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {customer.currentDue >= 10000 ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Due</p>
                    <p className="text-2xl font-black text-gray-900">TK {customer.currentDue.toLocaleString()}</p>
                  </div>
                  {customer.dueDate && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>Promised: {format(new Date(customer.dueDate), 'dd MMM yyyy')}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => sendWhatsAppReminder(customer)}
                    className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Add New Expense</h3>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500">
                  <option value="salary">Staff Salary</option>
                  <option value="rent">Shop Rent</option>
                  <option value="electricity">Electricity Bill</option>
                  <option value="internet">Internet Bill</option>
                  <option value="food">Food Expense</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input name="amount" type="number" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 h-24" />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl">Save Expense</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isInvestmentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Add New Investment</h3>
            <form onSubmit={handleInvestmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input name="amount" type="number" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 h-24" />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsInvestmentModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl">Save Investment</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isSalaryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h3 className="text-xl font-bold mb-6">Staff Salary Payment</h3>
            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                <input name="staffName" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input name="month" placeholder="e.g. March 2024" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input name="amount" type="number" required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsSalaryModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl">Pay Salary</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function Customers({ customers, sales }: { customers: Customer[], sales: Sale[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  const sendWhatsAppReminder = (customer: Customer) => {
    const message = `Assalamu Alaikum ${customer.name}, this is a reminder regarding your outstanding due of TK ${customer.currentDue?.toFixed(2)}. ${customer.dueDate ? `Your promised date was ${customer.dueDate}.` : ''} Please settle the amount as soon as possible. Thank you!`;
    const cleanPhone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const customerData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      fatherName: formData.get('fatherName') as string,
      houseName: formData.get('houseName') as string,
      currentDue: Number(formData.get('currentDue')),
      dueDate: formData.get('dueDate') as string,
      points: Number(formData.get('points') || 0),
      totalSpent: Number(formData.get('totalSpent') || 0),
    };

    try {
      if (editingCustomer?.id) {
        await updateDoc(doc(db, 'customers', editingCustomer.id), customerData);
      } else {
        const maxSerial = customers.reduce((max, c) => Math.max(max, c.serialNumber || 0), 0);
        await addDoc(collection(db, 'customers'), {
          ...customerData,
          serialNumber: maxSerial + 1
        });
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Customer save error", error);
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-500">Manage customer relationships and dues.</p>
        </div>
        <button 
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Current Due</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Due Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total Spent</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-[10px] font-mono text-indigo-400">SN: {customer.serialNumber || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{customer.phone || 'No phone'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      {customer.fatherName && <p><span className="font-bold">Father:</span> {customer.fatherName}</p>}
                      {customer.address && <p><span className="font-bold">Addr:</span> {customer.address}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedCustomerForHistory(customer)}
                      className={`font-bold px-3 py-1 rounded-full text-xs ${
                        (customer.currentDue || 0) >= 10000 ? 'bg-red-100 text-red-700' :
                        (customer.currentDue || 0) >= 5000 ? 'bg-orange-100 text-orange-700' :
                        (customer.currentDue || 0) > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-emerald-100 text-emerald-700'
                      } flex items-center gap-1 hover:opacity-80`}
                    >
                      TK {customer.currentDue || 0}
                      {(customer.currentDue || 0) > 0 && <ArrowRight className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600">
                      {customer.dueDate || 'No date set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">TK {customer.totalSpent || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => sendWhatsAppReminder(customer)}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Send Reminder"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input name="name" defaultValue={editingCustomer?.name} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input name="phone" defaultValue={editingCustomer?.phone} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                  <input name="fatherName" defaultValue={editingCustomer?.fatherName} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">House Name/No</label>
                  <input name="houseName" defaultValue={editingCustomer?.houseName} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input name="address" defaultValue={editingCustomer?.address} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Due (TK)</label>
                  <input name="currentDue" type="number" defaultValue={editingCustomer?.currentDue || 0} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promised Due Date</label>
                  <input name="dueDate" type="date" defaultValue={editingCustomer?.dueDate} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Save Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCustomerForHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCustomerForHistory.name} Due History</h3>
                    <p className="text-xs text-gray-500">Total Outstanding: TK {selectedCustomerForHistory.currentDue}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomerForHistory(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {sales.filter(s => s.customerId === selectedCustomerForHistory.id && s.dueAmount > 0).length === 0 ? (
                    <p className="text-center text-gray-400 py-8 italic">No active dues found for this customer.</p>
                  ) : (
                    sales.filter(s => s.customerId === selectedCustomerForHistory.id && s.dueAmount > 0).map(sale => (
                      <div key={sale.id} className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <p className="text-xs font-bold text-gray-400">{format(sale.timestamp.toDate(), 'MMM dd')}</p>
                            <p className="text-[10px] text-gray-400">{format(sale.timestamp.toDate(), 'hh:mm a')}</p>
                          </div>
                          <div className="w-px h-8 bg-red-100" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">Invoice #{sale.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-500">Total: TK {sale.finalAmount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-red-600">TK {sale.dueAmount}</p>
                          <p className="text-[10px] text-red-400">Remaining Due</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedCustomerForHistory(null)}
                  className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DailyClosingView({ sales, expenses, dailyClosings, settings }: { sales: Sale[], expenses: Expense[], dailyClosings: DailyClosing[], settings: ShopSettings }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Calculate today's stats
  const todaySales = sales.filter(s => format(s.timestamp.toDate(), 'yyyy-MM-dd') === today);
  const totalSales = todaySales.reduce((sum, s) => sum + s.finalAmount, 0);
  const cashSales = todaySales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.paidAmount, 0);
  const dueSales = todaySales.reduce((sum, s) => sum + s.dueAmount, 0);
  const cashReceived = todaySales.reduce((sum, s) => sum + s.paidAmount, 0);
  
  const todayExpenses = expenses.filter(e => format(e.timestamp.toDate(), 'yyyy-MM-dd') === today).reduce((sum, e) => sum + e.amount, 0);

  const [denominations, setDenominations] = useState<{ [key: string]: number }>({
    '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0
  });
  const [bkashBalance, setBkashBalance] = useState(0);
  const [notes, setNotes] = useState('');

  const totalCashInDrawer = Object.entries(denominations).reduce((sum, [val, count]) => sum + (parseInt(val) * (count as number)), 0);

  const handleSaveClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    const closingData = {
      date: today,
      totalSales,
      cashSales,
      dueSales,
      collections: cashReceived - cashSales,
      totalExpenses: todayExpenses,
      cashInHand: totalCashInDrawer,
      bkashBalance,
      denominations,
      notes,
      timestamp: new Date()
    };

    try {
      await addDoc(collection(db, 'daily_closings'), closingData);
      setIsModalOpen(false);
      alert('Daily Closing Saved Successfully');
    } catch (error) {
      console.error("Error saving daily closing", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Daily Closing</h2>
          <p className="text-gray-500">Summarize and close today's accounts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          New Closing
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Sales (Today)</p>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Cash Received (Today)</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(cashReceived)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Due Sales (Today)</p>
          <p className="text-2xl font-black text-red-600">{formatCurrency(dueSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Expenses (Today)</p>
          <p className="text-2xl font-black text-orange-600">{formatCurrency(todayExpenses)}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold">Recent Closings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total Sales</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Cash in Hand</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">bKash</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyClosings.sort((a, b) => b.date.localeCompare(a.date)).map(closing => (
                <tr key={closing.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{format(new Date(closing.date), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4">{formatCurrency(closing.totalSales)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(closing.cashInHand)}</td>
                  <td className="px-6 py-4 text-pink-600 font-bold">{formatCurrency(closing.bkashBalance)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">CLOSED</span>
                      <button 
                        onClick={() => printDailyClosing(closing, settings)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Print Report"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold">Daily Cash Closing - {format(new Date(), 'dd MMM yyyy')}</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSaveClosing} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Denominations (Notes)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(denominations).sort((a, b) => Number(b) - Number(a)).map(val => (
                      <div key={val} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <div className="w-12 text-right font-bold text-gray-600">{val}</div>
                        <div className="text-gray-400">×</div>
                        <input 
                          type="number" 
                          min="0"
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                          value={denominations[val]}
                          onChange={(e) => setDenominations({...denominations, [val]: Number(e.target.value)})}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-indigo-600 rounded-2xl text-white">
                    <p className="text-xs opacity-80 uppercase font-bold">Total Cash in Drawer</p>
                    <p className="text-3xl font-black">{formatCurrency(totalCashInDrawer)}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Other Accounts</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">bKash Balance</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-pink-500"
                          value={bkashBalance}
                          onChange={(e) => setBkashBalance(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                        placeholder="Any discrepancies or notes for today..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Sales:</span>
                      <span className="font-bold">{formatCurrency(totalSales)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cash Received:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Expenses:</span>
                      <span className="font-bold text-red-600">-{formatCurrency(todayExpenses)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between">
                      <span className="font-bold">Expected Cash:</span>
                      <span className="font-black text-indigo-600">{formatCurrency(cashReceived - todayExpenses)}</span>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Confirm & Save Closing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
