import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Search,
  Check,
  X,
  CreditCard,
  User,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  HelpCircle,
  PiggyBank,
  Landmark,
  PieChart as PieIcon,
  Percent,
  AlertTriangle,
  Download,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { db, collection, query, where, onSnapshot, doc, addDoc, deleteDoc, setDoc, updateDoc } from '../firebase';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PersonalHisabProps {
  user: any;
  shopSettings: any;
  setNotification: (notif: { type: 'success' | 'error'; message: string }) => void;
}

interface PersonalTransaction {
  id: string;
  type: 'income' | 'expense' | 'lent' | 'borrowed' | 'repayment_collection' | 'debt_payment';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Rocket';
  notes?: string;
  personName?: string;
  createdAt: number;
  shopId: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const DateInput = ({ value, onChange, className, isBn, required }: { value: string, onChange: (v: string) => void, className: string, isBn: boolean, required?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(() => {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  });

  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    const [y, m, d] = value.split('-');
    if (y && m && d) {
       const curr = displayValue.split('/');
       if (curr.length === 3 && curr[0] === d && curr[1] === m && curr[2] === y) return;
       setDisplayValue(`${d}/${m}/${y}`);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d/]/g, '');
    
    if (val.length === 2 && !val.includes('/') && e.target.value.length > displayValue.length) {
      val += '/';
    } else if (val.length === 5 && val.split('/').length === 2 && e.target.value.length > displayValue.length) {
      val += '/';
    }

    if (val.length > 10) val = val.substring(0, 10);
    setDisplayValue(val);

    if (val.length === 10) {
      const [d, m, y] = val.split('/');
      if (d && m && y && y.length === 4) {
        onChange(`${y}-${m}-${d}`);
      }
    } else if (val === '') {
      onChange('');
    }
  };

  return (
    <input
      type="text"
      placeholder="DD/MM/YYYY"
      value={displayValue}
      onChange={handleChange}
      className={className}
      maxLength={10}
      required={required}
    />
  );
};

export default function PersonalHisab({ user, shopSettings, setNotification }: PersonalHisabProps) {
  const isBn = shopSettings?.systemLanguage === 'bn';
  const currentShopId = user?.shopId || shopSettings?.shopId || shopSettings?.id || 'master';

  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [selectedWallet, setSelectedWallet] = useState<'all' | 'Cash' | 'Bank' | 'MFS'>('all');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [txType, setTxType] = useState<'income' | 'expense' | 'lent' | 'borrowed' | 'repayment_collection' | 'debt_payment'>('income');
  
  // New transaction input fields
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [personName, setPersonName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loan Detail view & Quick Repayment modal states
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [repayType, setRepayType] = useState<'collect' | 'pay' | 'lent' | 'borrowed'>('collect');
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMethod, setRepayMethod] = useState<'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [repayDate, setRepayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [repayNotes, setRepayNotes] = useState('');
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<string | null>(null);

  // Categories lists
  const incomeCategories = [
    { value: 'Business Profit', label: 'ব্যবসার লভ্যাংশ', labelEn: 'Business Profit' },
    { value: 'Salary', label: 'বেতন/সম্মানি', labelEn: 'Salary' },
    { value: 'Freelancing', label: 'ফ্রিল্যান্সিং', labelEn: 'Freelancing' },
    { value: 'Service Charge', label: 'সার্ভিস চার্জ', labelEn: 'Service Charge' },
    { value: 'House Rent Received', label: 'বাড়ি ভাড়া প্রাপ্তি', labelEn: 'House Rent Received' },
    { value: 'Gift', label: 'উপহার', labelEn: 'Gift' },
    { value: 'Others', label: 'অন্যান্য', labelEn: 'Others' }
  ];

  const expenseCategories = [
    { value: 'Family', label: 'পারিবারিক খরচ', labelEn: 'Family & Household' },
    { value: 'Utility', label: 'ইউটিলিটি বিল', labelEn: 'Utility Bill' },
    { value: 'Shopping', label: 'কেনাকাটা', labelEn: 'Shopping' },
    { value: 'Medical', label: 'চিকিৎসা খরচ', labelEn: 'Medical / Health' },
    { value: 'Food & Dining', label: 'খাবার-দাবার', labelEn: 'Food & Dining' },
    { value: 'Education', label: 'শিক্ষা খরচ', labelEn: 'Education' },
    { value: 'Entertainment', label: 'বিনোদন', labelEn: 'Entertainment' },
    { value: 'Rent', label: 'ভাড়া (দোকান/বাসা)', labelEn: 'Rent' },
    { value: 'Others', label: 'অন্যান্য', labelEn: 'Others' }
  ];

  // Visual Tab State (📂 ৩টি অত্যন্ত কার্যকরী ভিজ্যুয়াল ট্যাব)
  const [activeVisualTab, setActiveVisualTab] = useState<'income_expense' | 'loans_repayments' | 'budget_analytics'>('income_expense');
  const [budgetLimit, setBudgetLimit] = useState<number>(15000);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Sync personal budget limit from Firestore
  useEffect(() => {
    if (!currentShopId) return;
    const budgetDocRef = doc(db, 'personal_budgets', currentShopId);
    const unsub = onSnapshot(budgetDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (typeof data.limit === 'number') {
          setBudgetLimit(data.limit);
        }
      }
    }, (error) => {
      console.error("Error syncing budget limit:", error);
    });
    return () => unsub();
  }, [currentShopId]);

  const handleSaveBudget = async (newLimit: number) => {
    if (isNaN(newLimit) || newLimit < 0) return;
    setIsSavingBudget(true);
    try {
      const budgetDocRef = doc(db, 'personal_budgets', currentShopId);
      await setDoc(budgetDocRef, { limit: newLimit }, { merge: true });
      setNotification({
        type: 'success',
        message: isBn ? 'বাজেট সীমা সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Budget limit saved successfully!'
      });
    } catch (err) {
      console.error("Error saving budget limit:", err);
      setNotification({
        type: 'error',
        message: isBn ? 'বাজেট সীমা সংরক্ষণ করা যায়নি!' : 'Failed to save budget limit!'
      });
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Sync personal transactions from Firebase Firestore
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'personal_transactions'),
      where('shopId', '==', currentShopId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PersonalTransaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data
        } as PersonalTransaction);
      });
      // Sort by date descending, then createdAt descending
      items.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      setTransactions(items);
      setLoading(false);
    }, (error) => {
      console.error("Personal transactions sync error:", error);
      setLoading(false);
      setNotification({
        type: 'error',
        message: isBn ? 'সার্ভার থেকে ডেটা লোড করা যায়নি!' : 'Failed to sync data from cloud!'
      });
    });

    return () => unsubscribe();
  }, [currentShopId]);

  // Set initial category value based on type
  useEffect(() => {
    if (editingTxId) return;
    if (txType === 'income') {
      setCategory(incomeCategories[0].value);
    } else if (txType === 'expense') {
      setCategory(expenseCategories[0].value);
    } else {
      setCategory('Loan');
    }
  }, [txType, editingTxId]);

  // Helper to parse dates safely
  const isInRange = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (dateRange === 'today') {
      return targetDate.toDateString() === today.toDateString();
    }
    
    if (dateRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      oneWeekAgo.setHours(0,0,0,0);
      return targetDate >= oneWeekAgo && targetDate <= today;
    }
    
    if (dateRange === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return targetDate >= startOfMonth && targetDate <= today;
    }

    if (dateRange === 'year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return targetDate >= startOfYear && targetDate <= today;
    }

    if (dateRange === 'custom') {
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
      return targetDate >= start && targetDate <= end;
    }

    return true;
  };

  // Filtered transactions for calculation & view
  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      const rangeMatch = isInRange(t.date);
      const typeMatch = filterType === 'all' || t.type === filterType;
      
      let walletMatch = true;
      if (selectedWallet === 'Cash') {
        walletMatch = t.paymentMethod === 'Cash';
      } else if (selectedWallet === 'Bank') {
        walletMatch = t.paymentMethod === 'Bank';
      } else if (selectedWallet === 'MFS') {
        walletMatch = ['bKash', 'Nagad', 'Rocket'].includes(t.paymentMethod);
      }

      const text = `${t.category || ''} ${t.personName || ''} ${t.notes || ''}`.toLowerCase();
      const searchMatch = !searchTerm || text.includes(searchTerm.toLowerCase());

      return rangeMatch && typeMatch && walletMatch && searchMatch;
    });
  }, [transactions, dateRange, startDate, endDate, filterType, selectedWallet, searchTerm]);

  // Calculation Metrics
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    let lentGiven = 0;
    let lentCollected = 0;
    let borrowReceived = 0;
    let borrowPaid = 0;

    // We compute metrics over filtered transactions to match the date range selector perfectly!
    filteredTx.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount || 0;
      } else if (t.type === 'expense') {
        expense += t.amount || 0;
      } else if (t.type === 'lent') {
        lentGiven += t.amount || 0;
      } else if (t.type === 'borrowed') {
        borrowReceived += t.amount || 0;
      } else if (t.type === 'repayment_collection') {
        lentCollected += t.amount || 0;
      } else if (t.type === 'debt_payment') {
        borrowPaid += t.amount || 0;
      }
    });

    // Outstanding Loan Ledger totals
    // (Notice: We compute cumulative outstanding loans across ALL transactions, because loans carry over across dates!)
    let totalLentEver = 0;
    let totalLentCollectedEver = 0;
    let totalBorrowEver = 0;
    let totalBorrowPaidEver = 0;

    transactions.forEach((t) => {
      if (t.type === 'lent') totalLentEver += t.amount || 0;
      if (t.type === 'repayment_collection') totalLentCollectedEver += t.amount || 0;
      if (t.type === 'borrowed') totalBorrowEver += t.amount || 0;
      if (t.type === 'debt_payment') totalBorrowPaidEver += t.amount || 0;
    });

    const outstandingLent = totalLentEver - totalLentCollectedEver; // money people owe us (পাওনা)
    const outstandingBorrowed = totalBorrowEver - totalBorrowPaidEver; // money we owe others (দেনা)

    // Savings = (Total personal income + Borrow received + Lent collected) - (Total expense + Lent given + Borrow repaid)
    // Note: We use cumulative for Net Savings to show the real current bank balance/wallet cash on hand.
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;
    let cumulativeLent = 0;
    let cumulativeLentCollected = 0;
    let cumulativeBorrow = 0;
    let cumulativeBorrowPaid = 0;

    transactions.forEach((t) => {
      if (t.type === 'income') cumulativeIncome += t.amount || 0;
      if (t.type === 'expense') cumulativeExpense += t.amount || 0;
      if (t.type === 'lent') cumulativeLent += t.amount || 0;
      if (t.type === 'borrowed') cumulativeBorrow += t.amount || 0;
      if (t.type === 'repayment_collection') cumulativeLentCollected += t.amount || 0;
      if (t.type === 'debt_payment') cumulativeBorrowPaid += t.amount || 0;
    });

    const currentSavings = (cumulativeIncome + cumulativeBorrow + cumulativeLentCollected) - 
                           (cumulativeExpense + cumulativeLent + cumulativeBorrowPaid);

    // Wallet balances (all-time/cumulative to show real balance on hand)
    let cashBalance = 0;
    let bankBalance = 0;
    let mfsBalance = 0;
    let bkashBalance = 0;
    let nagadBalance = 0;
    let rocketBalance = 0;

    transactions.forEach((t) => {
      const amt = t.amount || 0;
      const isInflow = t.type === 'income' || t.type === 'borrowed' || t.type === 'repayment_collection';
      
      if (t.paymentMethod === 'Cash') {
        if (isInflow) cashBalance += amt;
        else cashBalance -= amt;
      } else if (t.paymentMethod === 'Bank') {
        if (isInflow) bankBalance += amt;
        else bankBalance -= amt;
      } else if (t.paymentMethod === 'bKash') {
        if (isInflow) {
          mfsBalance += amt;
          bkashBalance += amt;
        } else {
          mfsBalance -= amt;
          bkashBalance -= amt;
        }
      } else if (t.paymentMethod === 'Nagad') {
        if (isInflow) {
          mfsBalance += amt;
          nagadBalance += amt;
        } else {
          mfsBalance -= amt;
          nagadBalance -= amt;
        }
      } else if (t.paymentMethod === 'Rocket') {
        if (isInflow) {
          mfsBalance += amt;
          rocketBalance += amt;
        } else {
          mfsBalance -= amt;
          rocketBalance -= amt;
        }
      }
    });

    return {
      income,
      expense,
      outstandingLent,
      outstandingBorrowed,
      currentSavings,
      lentGiven,
      lentCollected,
      borrowReceived,
      borrowPaid,
      cashBalance,
      bankBalance,
      mfsBalance,
      bkashBalance,
      nagadBalance,
      rocketBalance
    };
  }, [filteredTx, transactions]);

  // Loan Contacts Breakdown (Grouping by person)
  const peopleLoans = useMemo(() => {
    const map: Record<string, {
      lent: number;
      collected: number;
      borrowed: number;
      paid: number;
      history: PersonalTransaction[];
    }> = {};

    transactions.forEach((t) => {
      if (!t.personName) return;
      const name = t.personName.trim();
      if (!map[name]) {
        map[name] = { lent: 0, collected: 0, borrowed: 0, paid: 0, history: [] };
      }
      
      map[name].history.push(t);

      if (t.type === 'lent') {
        map[name].lent += t.amount || 0;
      } else if (t.type === 'repayment_collection') {
        map[name].collected += t.amount || 0;
      } else if (t.type === 'borrowed') {
        map[name].borrowed += t.amount || 0;
      } else if (t.type === 'debt_payment') {
        map[name].paid += t.amount || 0;
      }
    });

    return Object.entries(map).map(([name, data]) => {
      const netReceivable = data.lent - data.collected; // We lent them this net outstanding
      const netPayable = data.borrowed - data.paid;    // We borrowed this net outstanding
      return {
        name,
        ...data,
        netReceivable,
        netPayable,
        status: netReceivable > 0 ? 'receivable' : netPayable > 0 ? 'payable' : 'cleared'
      };
    }).sort((a, b) => b.lent + b.borrowed - (a.lent + a.borrowed));
  }, [transactions]);

  // Chart Data preparation (grouping filtered tx by date)
  const chartData = useMemo(() => {
    const daily: Record<string, { income: number; expense: number; savings: number }> = {};
    
    // Sort transactions chronologically for charting
    const sortedChronological = [...filteredTx].reverse();

    sortedChronological.forEach((t) => {
      const day = t.date; // YYYY-MM-DD
      if (!daily[day]) {
        daily[day] = { income: 0, expense: 0, savings: 0 };
      }

      if (t.type === 'income') {
        daily[day].income += t.amount || 0;
      } else if (t.type === 'expense') {
        daily[day].expense += t.amount || 0;
      } else if (t.type === 'lent') {
        // Lent given is an outflow
        daily[day].expense += t.amount || 0;
      } else if (t.type === 'borrowed') {
        // Borrowed is cash inflow
        daily[day].income += t.amount || 0;
      } else if (t.type === 'repayment_collection') {
        daily[day].income += t.amount || 0;
      } else if (t.type === 'debt_payment') {
        daily[day].expense += t.amount || 0;
      }
    });

    return Object.entries(daily).map(([dateStr, values]) => {
      // format date beautifully
      let formattedDate = dateStr;
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          formattedDate = isBn 
            ? `${parts[2]}/${parts[1]}` 
            : `${parts[2]} ${new Date(dateStr).toLocaleString('default', { month: 'short' })}`;
        }
      } catch (e) {}

      return {
        date: formattedDate,
        fullDate: dateStr,
        ...values,
        net: values.income - values.expense
      };
    }).slice(-15); // Show last 15 active transaction days
  }, [filteredTx, isBn]);

  // Form submission for adding transactions
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amtVal = parseFloat(amount);
    if (isNaN(amtVal) || amtVal <= 0) {
      setNotification({
        type: 'error',
        message: isBn ? 'দয়া করে সঠিক টাকার পরিমাণ লিখুন!' : 'Please enter a valid amount!'
      });
      return;
    }

    if ((txType === 'lent' || txType === 'borrowed' || txType === 'repayment_collection' || txType === 'debt_payment') && !personName.trim()) {
      setNotification({
        type: 'error',
        message: isBn ? 'দয়া করে ব্যক্তির নাম লিখুন!' : 'Please enter the name of the person!'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTxId) {
        const payload = {
          type: txType,
          amount: amtVal,
          category: (txType === 'income' || txType === 'expense') ? category : 'Loan/Debt',
          date,
          paymentMethod,
          personName: (txType === 'lent' || txType === 'borrowed' || txType === 'repayment_collection' || txType === 'debt_payment') ? personName.trim() : '',
          notes: notes.trim(),
        };

        await updateDoc(doc(db, 'personal_transactions', editingTxId), payload);

        setNotification({
          type: 'success',
          message: isBn ? 'লেনদেনটি সফলভাবে আপডেট করা হয়েছে!' : 'Transaction updated successfully!'
        });
      } else {
        const payload = {
          type: txType,
          amount: amtVal,
          category: (txType === 'income' || txType === 'expense') ? category : 'Loan/Debt',
          date,
          paymentMethod,
          personName: (txType === 'lent' || txType === 'borrowed' || txType === 'repayment_collection' || txType === 'debt_payment') ? personName.trim() : '',
          notes: notes.trim(),
          createdAt: Date.now(),
          shopId: currentShopId
        };

        await addDoc(collection(db, 'personal_transactions'), payload);

        setNotification({
          type: 'success',
          message: isBn ? 'লেনদেনটি সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Transaction saved successfully!'
        });
      }

      // Clear Form
      setAmount('');
      setPersonName('');
      setNotes('');
      setEditingTxId(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving personal transaction:', err);
      setNotification({
        type: 'error',
        message: isBn ? 'সংরক্ষণ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন!' : 'Failed to save transaction. Try again!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddForm = (type: 'income' | 'expense' | 'lent' | 'borrowed' = 'income') => {
    setEditingTxId(null);
    setTxType(type);
    setAmount('');
    setPersonName('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const handleStartEdit = (tx: PersonalTransaction) => {
    setEditingTxId(tx.id);
    setTxType(tx.type as any);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setDate(tx.date);
    setPaymentMethod(tx.paymentMethod);
    setPersonName(tx.personName || '');
    setNotes(tx.notes || '');
    setIsFormOpen(true);
  };

  // Download PDF
  const handleDownloadPDF = (contact: any) => {
    try {
      const doc = new jsPDF();
      
      // Header Section
      doc.setFillColor(79, 70, 229); // Indigo-600
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("PERSONAL LEDGER", 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 20);

      // Contact Details
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.text(`Account Name: ${contact.name}`, 14, 45);
      
      // Summary Metrics
      const totalLent = contact.lent || 0;
      const totalCollected = contact.collected || 0;
      const totalBorrowed = contact.borrowed || 0;
      const totalPaid = contact.paid || 0;
      
      const collectCount = contact.history.filter((tx: any) => tx.type === 'repayment_collection').length;
      const lentCount = contact.history.filter((tx: any) => tx.type === 'lent').length;
      const totalTransactions = contact.history.length;
      
      const remainingDue = Math.abs(contact.netReceivable || contact.netPayable || 0);
      const isReceivable = contact.netReceivable > 0;
      const isOwed = contact.netPayable > 0;
      let statusText = 'Settled';
      if (isReceivable) statusText = `Receivable: +${remainingDue.toLocaleString()}`;
      if (isOwed) statusText = `Payable: -${remainingDue.toLocaleString()}`;

      doc.setFontSize(10);
      doc.text(`Total Lent (Given): ${totalLent.toLocaleString()} (${lentCount} times)`, 14, 55);
      doc.text(`Total Collected: ${totalCollected.toLocaleString()} (${collectCount} times)`, 14, 62);
      
      // We will only show borrowed if > 0
      if (totalBorrowed > 0 || totalPaid > 0) {
        doc.text(`Total Borrowed: ${totalBorrowed.toLocaleString()}`, 110, 55);
        doc.text(`Total Paid Back: ${totalPaid.toLocaleString()}`, 110, 62);
      }
      
      doc.setFontSize(12);
      doc.setTextColor(isReceivable ? 16 : 220, isReceivable ? 185 : 38, isReceivable ? 129 : 38);
      if (!isReceivable && !isOwed) doc.setTextColor(100, 100, 100);
      doc.text(`Current Status: ${statusText}`, 14, 72);

      const tableData = contact.history.map((item: any) => {
        let typeStr = item.type;
        let sign = '';
        let amountColor = [50, 50, 50]; 
        
        if (item.type === 'lent') {
           typeStr = 'Lent Principal';
           sign = '-';
           amountColor = [225, 29, 72]; // rose-600
        } else if (item.type === 'borrowed') {
           typeStr = 'Borrowed Principal';
           sign = '+';
           amountColor = [16, 185, 129]; // emerald-600
        } else if (item.type === 'repayment_collection') {
           typeStr = 'Installment Collected';
           sign = '+';
           amountColor = [16, 185, 129]; // emerald-600
        } else if (item.type === 'debt_payment') {
           typeStr = 'Installment Paid';
           sign = '-';
           amountColor = [225, 29, 72]; // rose-600
        }
        
        return [
          item.date,
          typeStr,
          item.paymentMethod,
          item.notes || '-',
          { content: `${sign}${item.amount.toLocaleString()}`, styles: { textColor: amountColor, fontStyle: 'bold' } }
        ];
      });

      (doc as any).autoTable({
        startY: 85,
        head: [['Date', 'Transaction Type', 'Method', 'Notes', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', lineColor: [226, 232, 240] }, 
        bodyStyles: { lineColor: [226, 232, 240] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          4: { halign: 'right' }
        },
        didDrawPage: function (data: any) {
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${data.pageNumber} - Generated securely from Personal Hisab`, data.settings.margin.left, 290);
        }
      });

      doc.save(`ledger_${contact.name.replace(/\s+/g, '_')}.pdf`);
      
      setNotification({
        type: 'success',
        message: isBn ? 'PDF সফলভাবে ডাউনলোড হয়েছে!' : 'PDF Downloaded Successfully!'
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      setNotification({
        type: 'error',
        message: isBn ? 'PDF ডাউনলোড করতে সমস্যা হয়েছে!' : 'Failed to generate PDF!'
      });
    }
  };

  // Handle rapid loan repayments
  const handleQuickRepaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || isSubmitting) return;

    const amtVal = parseFloat(repayAmount);
    if (isNaN(amtVal) || amtVal <= 0) {
      setNotification({
        type: 'error',
        message: isBn ? 'দয়া করে সঠিক পরিশোধিত টাকা লিখুন!' : 'Please enter a valid repayment amount!'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let type = '';
      let cat = '';
      let fallbackNote = '';
      
      if (repayType === 'collect') {
         type = 'repayment_collection';
         cat = 'Loan Repayment Received';
         fallbackNote = 'Collected partial payment';
      } else if (repayType === 'pay') {
         type = 'debt_payment';
         cat = 'Debt Paid Off';
         fallbackNote = 'Paid back partial debt';
      } else if (repayType === 'lent') {
         type = 'lent';
         cat = 'Lent to Person';
         fallbackNote = 'Lent more amount';
      } else if (repayType === 'borrowed') {
         type = 'borrowed';
         cat = 'Borrowed from Person';
         fallbackNote = 'Borrowed more amount';
      }

      const payload = {
        type,
        amount: amtVal,
        category: cat,
        date: repayDate,
        paymentMethod: repayMethod,
        personName: selectedPerson,
        notes: repayNotes.trim() || fallbackNote,
        createdAt: Date.now(),
        shopId: currentShopId
      };

      await addDoc(collection(db, 'personal_transactions'), payload);

      setNotification({
        type: 'success',
        message: isBn ? 'হিসাবটি সফলভাবে যুক্ত হয়েছে!' : 'Repayment registered successfully!'
      });

      setRepayAmount('');
      setRepayNotes('');
      setIsRepayModalOpen(false);
    } catch (err) {
      console.error('Error recording repayment:', err);
      setNotification({
        type: 'error',
        message: isBn ? 'যুক্ত করতে সমস্যা হয়েছে!' : 'Failed to save repayment!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete transaction
  const confirmDeleteTx = async () => {
    if (!deleteConfirmTx) return;
    try {
      await deleteDoc(doc(db, 'personal_transactions', deleteConfirmTx));
      setNotification({
        type: 'success',
        message: isBn ? 'লেনদেনটি ডিলিট করা হয়েছে!' : 'Transaction deleted!'
      });
      setDeleteConfirmTx(null);
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({
        type: 'error',
        message: isBn ? 'ডিলিট করা যায়নি!' : 'Failed to delete transaction!'
      });
      setDeleteConfirmTx(null);
    }
  };

  const handleDeleteTx = (id: string) => {
    setDeleteConfirmTx(id);
  };

  // Budget and category breakdown calculations
  const { currentMonthExpense, pieData } = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    let monthExpense = 0;
    const catGroup: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const isCurrentMonth = t.date.startsWith(currentMonthPrefix);
        if (isCurrentMonth) {
          monthExpense += t.amount;
        }
        
        // Group expenses for the pie chart (uses filtered transactions to honor user date selections)
        const isFiltered = filteredTx.some(f => f.id === t.id);
        if (isFiltered) {
          const cat = t.category || 'Others';
          catGroup[cat] = (catGroup[cat] || 0) + t.amount;
        }
      }
    });

    const parsedPieData = Object.entries(catGroup).map(([name, value]) => {
      let displayName = name;
      if (isBn) {
        const catObj = expenseCategories.find(c => c.value === name);
        if (catObj) displayName = catObj.label;
      }
      return { name: displayName, value };
    }).sort((a, b) => b.value - a.value);

    return {
      currentMonthExpense: monthExpense,
      pieData: parsedPieData
    };
  }, [transactions, filteredTx, isBn]);

  const [budgetLimitInput, setBudgetLimitInput] = useState<string>('');
  
  // Set initial text field value when budgetLimit state updates
  useEffect(() => {
    setBudgetLimitInput(budgetLimit.toString());
  }, [budgetLimit]);

  const [contactSearchTerm, setContactSearchTerm] = useState('');

  const currencySymbol = '৳';

  return (
    <div id="personal-hisab-section" className="space-y-6 max-w-7xl mx-auto p-1 md:p-2">
      
      {/* Title Header Block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-indigo-500/30">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {isBn ? 'সম্পূর্ণ ব্যক্তিগত হিসাব' : '100% Personal & Confidential'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            {isBn ? 'পার্সোনাল হিসাব-নিকাশ ড্যাশবোর্ড' : 'Personal Hisab Ledger'}
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">
            {isBn 
              ? 'আপনার নিজের চাকরি, ব্যবসা বা ফ্রিল্যান্সিংয়ের ব্যক্তিগত আয়-ব্যয় ট্র্যাক করুন। একই সাথে বন্ধু-বান্ধব ও পরিচিতদের দেওয়া ধার বা দেনার নিখুঁত হিসাব রাখুন ক্যাশ, ব্যাংক বা মোবাইল ব্যাংকিংয়ের মাধ্যমে।' 
              : 'Securely manage your personal salary, business income, expenses, and loans with multi-method payment options (bKash/Bank/Cash) and partial collection tracking.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddForm('income')}
          className="lg:self-center bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95 z-10"
        >
          <Plus className="w-4 h-4 text-white" />
          {isBn ? 'নতুন এন্ট্রি যোগ করুন' : 'Add New Transaction'}
        </button>
      </div>

      {/* Interactive Date Filter & General Config Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-850 w-full md:w-auto">
          {[
            { key: 'today', bn: 'আজ', en: 'Today' },
            { key: 'week', bn: 'এই সপ্তাহ', en: 'This Week' },
            { key: 'month', bn: 'এই মাস', en: 'This Month' },
            { key: 'year', bn: 'এই বছর', en: 'This Year' },
            { key: 'custom', bn: 'কাস্টম ডেট', en: 'Custom Range' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setDateRange(item.key as any)}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                dateRange === item.key 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isBn ? item.bn : item.en}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-100 dark:border-slate-850 w-full md:w-auto justify-center"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <DateInput 
              isBn={isBn}
              value={startDate} 
              onChange={setStartDate} 
              className="bg-transparent text-xs font-bold outline-none border-none text-slate-700 dark:text-slate-200"
            />
            <span className="text-slate-300 text-xs font-bold font-mono">To</span>
            <DateInput 
              isBn={isBn}
              value={endDate} 
              onChange={setEndDate} 
              className="bg-transparent text-xs font-bold outline-none border-none text-slate-700 dark:text-slate-200"
            />
          </motion.div>
        )}
      </div>

      {/* FOUR ELEGANT VISUAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              {isBn ? 'মোট পার্সোনাল আয়' : 'Total Personal Income'}
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-gray-100 font-mono">
              {currencySymbol}{metrics.income.toLocaleString()}
            </h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              {isBn ? `${dateRange === 'custom' ? 'কাস্টম সময়কাল' : 'নির্বাচিত সময়ের'} আয়` : `Income for selected period`}
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              {isBn ? 'মোট পার্সোনাল খরচ' : 'Total Expense'}
            </span>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-800 dark:text-gray-100 font-mono">
              {currencySymbol}{metrics.expense.toLocaleString()}
            </h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full" />
              {isBn ? 'পারিবারিক ও অন্যান্য ব্যয়' : 'Household & personal spending'}
            </p>
          </div>
        </div>

        {/* Active Debts & Lent Tracker */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              {isBn ? 'সক্রিয় ধার-দেনা' : 'Active Loans & Debts'}
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{isBn ? 'পাওনা (Receivable):' : 'Receivable:'}</span>
              <span className="text-base font-black text-slate-800 dark:text-gray-100 font-mono">
                {currencySymbol}{metrics.outstandingLent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-baseline border-t border-slate-100 dark:border-slate-800/60 pt-1">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{isBn ? 'দেনা (Payable):' : 'Payable:'}</span>
              <span className="text-sm font-black text-slate-700 dark:text-gray-300 font-mono">
                {currencySymbol}{metrics.outstandingBorrowed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Net Savings */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10 p-5 rounded-3xl border border-indigo-100/60 dark:border-indigo-900/40 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 dark:text-indigo-400">
              {isBn ? 'সর্বমোট সঞ্চয় / ক্যাশ ব্যালেন্স' : 'Current Net Savings'}
            </span>
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/25">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`text-2xl font-black font-mono ${metrics.currentSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {metrics.currentSavings < 0 ? '-' : ''}{currencySymbol}{Math.abs(metrics.currentSavings).toLocaleString()}
            </h3>
            <p className="text-[9px] text-indigo-400 dark:text-indigo-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              {isBn ? 'মোট ক্যাশ / ব্যাংকে অবশিষ্ট ব্যালেন্স' : 'Real-time remaining cash on hand'}
            </p>
          </div>
        </div>

      </div>

      {/* 📌 ২য় ধাপ: অ্যাকাউন্ট-ভিত্তিক লেনদেন (Multi-Channel Accounts) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4.5 h-4.5 text-indigo-500" />
              {isBn ? '৩টি অ্যাকাউন্ট ওয়ালেট লেজার সিস্টেম' : 'Multi-Channel Account Wallets'}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
              {isBn ? 'টাকা কোন মাধ্যমে এসেছে বা গেছে তা ট্র্যাক করতে ওয়ালেটগুলোতে ক্লিক করে ফিল্টার করুন' : 'Click on any wallet to filter and view its specific transaction list'}
            </p>
          </div>
          {selectedWallet !== 'all' && (
            <button
              onClick={() => setSelectedWallet('all')}
              className="text-[10px] bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-xl font-black uppercase tracking-wider transition-all text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              {isBn ? 'ফিল্টার রিসেট করুন' : 'Clear Wallet Filter'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* CASH WALLET CARD */}
          <div 
            onClick={() => setSelectedWallet(selectedWallet === 'Cash' ? 'all' : 'Cash')}
            className={`cursor-pointer p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between min-h-[145px] group ${
              selectedWallet === 'Cash'
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-500 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-850 hover:border-emerald-200 dark:hover:border-emerald-900/60 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">
                  {isBn ? 'ক্যাশ ওয়ালেট' : 'Cash Wallet'}
                </span>
                <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider">
                  {isBn ? 'সরাসরি ক্যাশ লিকুইড টাকা' : 'Direct liquid cash on-hand'}
                </p>
              </div>
              <div className={`p-2.5 rounded-2xl transition-all ${
                selectedWallet === 'Cash'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450'
              }`}>
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className={`text-2xl font-black font-mono tracking-tight ${metrics.cashBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {metrics.cashBalance < 0 ? '-' : ''}{currencySymbol}{Math.abs(metrics.cashBalance).toLocaleString()}
              </h3>
              {selectedWallet === 'Cash' ? (
                <span className="text-[8px] px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-wider rounded-full">
                  {isBn ? 'ফিল্টার সক্রিয়' : 'Active'}
                </span>
              ) : (
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                  {isBn ? 'হিসাব দেখতে ক্লিক করুন' : 'Click to filter'}
                </span>
              )}
            </div>
          </div>

          {/* BANK ACCOUNT CARD */}
          <div 
            onClick={() => setSelectedWallet(selectedWallet === 'Bank' ? 'all' : 'Bank')}
            className={`cursor-pointer p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between min-h-[145px] group ${
              selectedWallet === 'Bank'
                ? 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/10 border-indigo-550 dark:border-indigo-650 shadow-md ring-2 ring-indigo-550/20'
                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-850 hover:border-indigo-200 dark:hover:border-indigo-900/60 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-550/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-550/10 transition-all" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors">
                  {isBn ? 'ব্যাংক অ্যাকাউন্ট' : 'Bank Account'}
                </span>
                <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider">
                  {isBn ? 'ব্র্যাক, ডাচ-বাংলা বা ব্যাংক লেজার' : 'BRAC, Dutch-Bangla or any Bank'}
                </p>
              </div>
              <div className={`p-2.5 rounded-2xl transition-all ${
                selectedWallet === 'Bank'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-650/20'
                  : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
              }`}>
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className={`text-2xl font-black font-mono tracking-tight ${metrics.bankBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {metrics.bankBalance < 0 ? '-' : ''}{currencySymbol}{Math.abs(metrics.bankBalance).toLocaleString()}
              </h3>
              {selectedWallet === 'Bank' ? (
                <span className="text-[8px] px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black uppercase tracking-wider rounded-full">
                  {isBn ? 'ফিল্টার সক্রিয়' : 'Active'}
                </span>
              ) : (
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                  {isBn ? 'হিসাব দেখতে ক্লিক করুন' : 'Click to filter'}
                </span>
              )}
            </div>
          </div>

          {/* MOBILE FINANCIAL SERVICES (MFS) CARD */}
          <div 
            onClick={() => setSelectedWallet(selectedWallet === 'MFS' ? 'all' : 'MFS')}
            className={`cursor-pointer p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between min-h-[145px] group ${
              selectedWallet === 'MFS'
                ? 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/10 border-pink-500 dark:border-pink-600 shadow-md ring-2 ring-pink-500/20'
                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-850 hover:border-pink-200 dark:hover:border-pink-900/60 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/10 transition-all" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 group-hover:text-pink-500 transition-colors">
                  {isBn ? 'মোবাইল ফিনান্সিয়াল সার্ভিস (MFS)' : 'MFS Wallet'}
                </span>
                <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider">
                  {isBn ? 'বিকাশ, রকেট, নগদ ট্রানজেকশন' : 'bKash, Nagad, Rocket wallets'}
                </p>
              </div>
              <div className={`p-2.5 rounded-2xl transition-all ${
                selectedWallet === 'MFS'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
              }`}>
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex items-baseline justify-between mb-1.5">
                <h3 className={`text-2xl font-black font-mono tracking-tight ${metrics.mfsBalance >= 0 ? 'text-pink-600 dark:text-pink-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {metrics.mfsBalance < 0 ? '-' : ''}{currencySymbol}{Math.abs(metrics.mfsBalance).toLocaleString()}
                </h3>
                {selectedWallet === 'MFS' ? (
                  <span className="text-[8px] px-2.5 py-0.5 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-black uppercase tracking-wider rounded-full">
                    {isBn ? 'ফিল্টার সক্রিয়' : 'Active'}
                  </span>
                ) : (
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                    {isBn ? 'ফিল্টার করতে ক্লিক করুন' : 'Click to filter'}
                  </span>
                )}
              </div>
              
              {/* Specialized inline MFS sub-wallet breakdown */}
              <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-dashed border-slate-100 dark:border-slate-800/80 text-[8.5px] font-mono text-gray-500 font-semibold">
                <div className="flex flex-col">
                  <span className="text-pink-600/80 font-bold">bKash</span>
                  <span className={`font-black ${metrics.bkashBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {currencySymbol}{metrics.bkashBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col border-l border-slate-100 dark:border-slate-800/80 pl-1.5">
                  <span className="text-amber-600/80 font-bold">Nagad</span>
                  <span className={`font-black ${metrics.nagadBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {currencySymbol}{metrics.nagadBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col border-l border-slate-100 dark:border-slate-800/80 pl-1.5">
                  <span className="text-indigo-600/80 font-bold">Rocket</span>
                  <span className={`font-black ${metrics.rocketBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {currencySymbol}{metrics.rocketBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 📊 ৩টি অত্যন্ত কার্যকরী ভিজ্যুয়াল ট্যাব (Visual Tabs) */}
      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-2 items-center justify-between z-10 relative">
        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={() => {
              setActiveVisualTab('income_expense');
              if (txType !== 'income' && txType !== 'expense') {
                setTxType('income');
              }
            }}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeVisualTab === 'income_expense'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-500/50'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">{isBn ? 'আয় ও ব্যয় লেজার খাতা' : 'Income & Expense Ledger'}</span>
            <span className="sm:hidden">{isBn ? 'আয়-ব্যয় খাতা' : 'Ledger'}</span>
          </button>
          
          <button
            onClick={() => {
              setActiveVisualTab('loans_repayments');
            }}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeVisualTab === 'loans_repayments'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-500/50'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{isBn ? 'ধার-দেনা ও কিস্তি ম্যানেজার' : 'Loans & Installments'}</span>
            <span className="sm:hidden">{isBn ? 'ধার-দেনা' : 'Loans'}</span>
          </button>

          <button
            onClick={() => {
              setActiveVisualTab('budget_analytics');
            }}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeVisualTab === 'budget_analytics'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500/50'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/50'
            }`}
          >
            <PieIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{isBn ? 'পারিবারিক বাজেট ও এনালাইসিস' : 'Family Budget & Analytics'}</span>
            <span className="sm:hidden">{isBn ? 'বাজেট' : 'Budget'}</span>
          </button>
        </div>
      </div>

      {/* CONDITIONAL TABS RENDERING PANEL */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: INCOME & EXPENSE LEDGER */}
        {activeVisualTab === 'income_expense' && (
          <motion.div
            key="tab_income_expense"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* SAVINGS TREND CHART */}
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
                      {isBn ? 'ব্যক্তিগত আয় বনাম ব্যয় এবং সঞ্চয় ট্রেন্ড' : 'Personal Income vs Expense Trend'}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      {isBn ? 'দৈনিক মোট ইনপুটকৃত ক্যাশফ্লো ও ব্যালেন্স ট্রেন্ড' : 'Daily net personal cashflow timeline tracking'}
                    </p>
                  </div>
                </div>

                <div className="h-64 md:h-72 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#f8fafc',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Area 
                        type="monotone" 
                        name={isBn ? 'ইনফ্লো / আয়' : 'Inflow / Income'} 
                        dataKey="income" 
                        stroke="#10b981" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                      />
                      <Area 
                        type="monotone" 
                        name={isBn ? 'আউটফ্লো / খরচ' : 'Outflow / Expense'} 
                        dataKey="expense" 
                        stroke="#ef4444" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorExpense)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* QUICK ENTRY INLINE FORM & GENERAL LEDGER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (1/3 Width): INLINE QUICK ENTRY FORM */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-gray-150 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                      {isBn ? 'কুইক এন্ট্রি ফর্ম (স্পীড এন্ট্রি)' : 'Quick Entry Form'}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      {isBn ? 'দ্রুত আয় ও ব্যয়ের হিসাব যুক্ত করুন' : 'Record transactions instantly without modal'}
                    </p>
                  </div>

                  <form onSubmit={handleAddTransaction} className="space-y-4">
                    {/* Toggle Switcher */}
                    <div className="grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <button
                        type="button"
                        onClick={() => setTxType('income')}
                        className={`py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          txType === 'income'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {isBn ? 'আয় (Income)' : 'Income'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTxType('expense')}
                        className={`py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          txType === 'expense'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {isBn ? 'ব্যয় (Expense)' : 'Expense'}
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                        {isBn ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'}
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full font-mono text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    {/* Quick Amount Chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[100, 500, 1000, 5000, 10000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val.toString())}
                          className="px-2.5 py-1 text-[10px] bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg font-mono font-bold border border-slate-100 dark:border-slate-850 cursor-pointer"
                        >
                          +{val.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                        {isBn ? 'ক্যাটাগরি' : 'Category'}
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full cursor-pointer text-slate-700 dark:text-slate-200"
                      >
                        <option value="">{isBn ? '-- ক্যাটাগরি সিলেক্ট করুন --' : '-- Select Category --'}</option>
                        {txType === 'income' 
                          ? incomeCategories.map(c => <option key={c.value} value={c.value}>{isBn ? c.label : c.labelEn}</option>)
                          : expenseCategories.map(c => <option key={c.value} value={c.value}>{isBn ? c.label : c.labelEn}</option>)
                        }
                      </select>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                        {isBn ? 'মাধ্যম (Account)' : 'Account'}
                      </label>
                      <div className="grid grid-cols-5 gap-1">
                        {(['Cash', 'Bank', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all border cursor-pointer ${
                              paymentMethod === method
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800'
                                : 'bg-slate-50/50 hover:bg-slate-100 border-slate-100 dark:bg-slate-950 dark:border-slate-850 text-slate-500'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                        {isBn ? 'তারিখ' : 'Date'}
                      </label>
                      <DateInput
                        isBn={isBn}
                        required
                        value={date}
                        onChange={setDate}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full"
                      />
                    </div>

                    {/* Notes Input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                        {isBn ? 'নোট/মন্তব্য' : 'Notes'}
                      </label>
                      <textarea
                        placeholder={isBn ? 'যেমন: বাজারের খরচ, সেলারি বোনাস...' : 'Reason...'}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full resize-none text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          {isBn ? 'যোগ হচ্ছে...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          {isBn ? 'হিসাব সংরক্ষণ করুন' : 'Save Entry'}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column (2/3 Width): DETAILED GENERAL LEDGER */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between min-h-[500px]">
                  
                  {/* Ledger controls */}
                  <div>
                    <div className="p-5 border-b border-gray-50 dark:border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-4.5 h-4.5 text-indigo-500" />
                          {isBn ? 'ব্যক্তিগত হিসাব খাতা' : 'Personal General Ledger'}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                          {isBn ? 'আপনার আয়, ব্যয় এবং লেনদেনের বিশদ বিবরণ' : 'Detailed transactional entry records'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* Type Filter */}
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-[10.5px] font-bold text-slate-600 dark:text-slate-200 outline-none cursor-pointer"
                        >
                          <option value="all">{isBn ? 'সকল টাইপ' : 'All Types'}</option>
                          <option value="income">{isBn ? 'আয় (Income)' : 'Income'}</option>
                          <option value="expense">{isBn ? 'ব্যয়/খরচ (Expense)' : 'Expense'}</option>
                          <option value="lent">{isBn ? 'ধার প্রদান (Lent)' : 'Lent Given'}</option>
                          <option value="borrowed">{isBn ? 'ধার গ্রহণ (Borrowed)' : 'Borrowed'}</option>
                          <option value="repayment_collection">{isBn ? 'ধার ফেরত প্রাপ্তি' : 'Repayment Received'}</option>
                          <option value="debt_payment">{isBn ? 'ঋণ পরিশোধ' : 'Debt Repaid'}</option>
                        </select>

                        {/* Search input */}
                        <div className="flex-1 sm:flex-none relative">
                          <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder={isBn ? 'খুঁজুন...' : 'Search records...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-3 py-1.5 w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-[10.5px] font-bold text-slate-800 dark:text-gray-100 outline-none font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ledger list view (Responsive) */}
                    <div className="flex flex-col divide-y divide-gray-100 dark:divide-slate-850">
                      {loading ? (
                        <div className="text-center py-16">
                          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{isBn ? 'ডেটা লোড হচ্ছে...' : 'Loading Cloud Ledger...'}</span>
                        </div>
                      ) : filteredTx.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 uppercase tracking-widest text-[10.5px] font-black space-y-1">
                          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                          <p>{isBn ? 'কোনো হিসাব পাওয়া যায়নি!' : 'No entries found in this period.'}</p>
                        </div>
                      ) : (
                        filteredTx.map((tx) => {
                          let badgeBg = '';
                          let typeLabel = '';

                          switch(tx.type) {
                            case 'income':
                              badgeBg = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40';
                              typeLabel = isBn ? 'আয়' : 'Income';
                              break;
                            case 'expense':
                              badgeBg = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40';
                              typeLabel = isBn ? 'খরচ' : 'Expense';
                              break;
                            case 'lent':
                              badgeBg = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
                              typeLabel = isBn ? 'ধার প্রদান' : 'Lent Given';
                              break;
                            case 'borrowed':
                              badgeBg = 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/40';
                              typeLabel = isBn ? 'ধার গ্রহণ' : 'Borrowed';
                              break;
                            case 'repayment_collection':
                              badgeBg = 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/40';
                              typeLabel = isBn ? 'ফেরত আদায়' : 'Repay Rec';
                              break;
                            case 'debt_payment':
                              badgeBg = 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/40';
                              typeLabel = isBn ? 'ঋণ শোধ' : 'Debt Repaid';
                              break;
                          }

                          let catDisplay = tx.category;
                          if (isBn) {
                            const customCat = [...incomeCategories, ...expenseCategories].find(c => c.value === tx.category);
                            if (customCat) catDisplay = customCat.label;
                          }

                          return (
                            <div key={tx.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-950/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex flex-col gap-2 w-full sm:w-auto">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${badgeBg}`}>
                                    {typeLabel}
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-gray-150 text-[11.5px]">{catDisplay}</span>
                                </div>
                                
                                {tx.personName && (
                                  <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {isBn ? `ব্যক্তি: ${tx.personName}` : `Person: ${tx.personName}`}
                                  </div>
                                )}
                                {tx.notes && (
                                  <p className="text-[10px] text-gray-400 max-w-sm truncate font-medium">{tx.notes}</p>
                                )}
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-gray-400 text-[10px]">{formatDate(tx.date)}</span>
                                  <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded border border-slate-100 dark:border-slate-850/60 font-black uppercase tracking-wider">
                                    <CreditCard className="w-2.5 h-2.5 text-slate-400" />
                                    {tx.paymentMethod}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pl-0 sm:pl-4 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto">
                                <span className={`font-mono font-black text-sm md:text-base ${(tx.type === 'income' || tx.type === 'borrowed' || tx.type === 'repayment_collection') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {(tx.type === 'income' || tx.type === 'borrowed' || tx.type === 'repayment_collection') ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                                </span>
                                
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(tx)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
                                    title={isBn ? "এডিট করুন" : "Edit Record"}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTx(tx.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                                    title={isBn ? "ডিলিট করুন" : "Delete Record"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Count summary */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850/80 text-[10px] text-gray-400 uppercase font-black tracking-widest flex justify-between items-center whitespace-nowrap">
                    <span>{isBn ? `মোট পাওয়া গেছে: ${filteredTx.length} টি রেকর্ড` : `Showing ${filteredTx.length} items`}</span>
                    <span className="text-xs font-black text-slate-700 dark:text-gray-200 font-mono">
                      {isBn ? 'সক্রিয় ফিল্টার' : 'Active Filters Loaded'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: ADVANCED LOAN & INSTALLMENTS LEDGER */}
        {activeVisualTab === 'loans_repayments' && (
          <motion.div
            key="tab_loans_repayments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column (1/3 Width): CONTACTS LIST */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="p-5 border-b border-gray-50 dark:border-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-800 dark:text-gray-150 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4.5 h-4.5 text-indigo-500" />
                        {isBn ? 'ধার-দেনা গ্রাহক তালিকা' : 'Loan & Debt Contacts'}
                      </h3>
                    </div>
                    {/* Search inside contacts */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder={isBn ? 'গ্রাহকের নাম খুঁজুন...' : 'Search contact name...'}
                        value={contactSearchTerm}
                        onChange={(e) => setContactSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-[10.5px] font-bold text-slate-800 dark:text-gray-100 outline-none"
                      />
                    </div>
                  </div>

                  {/* Add New Loan Button */}
                  <div className="p-4 border-b border-slate-50 dark:border-slate-850/80 bg-indigo-50/20 dark:bg-indigo-950/10 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                      {isBn ? 'নতুন লোন যুক্ত করতে চান?' : 'Need to add a new loan?'}
                    </span>
                    <button
                      onClick={() => handleOpenAddForm('lent')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isBn ? 'লোন তৈরি করুন' : 'New Loan'}
                    </button>
                  </div>

                  {/* List Container */}
                  <div className="divide-y divide-gray-100 dark:divide-slate-850 max-h-[350px] overflow-y-auto">
                    {(() => {
                      const list = contactSearchTerm 
                        ? peopleLoans.filter(p => p.name.toLowerCase().includes(contactSearchTerm.toLowerCase()))
                        : peopleLoans;
                        
                      if (list.length === 0) {
                        return (
                          <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase space-y-2">
                            <HelpCircle className="w-8 h-8 text-gray-300 mx-auto" />
                            <p>{isBn ? 'কোনো ধারের রেকর্ড পাওয়া যায়নি' : 'No loan records found'}</p>
                          </div>
                        );
                      }

                      return list.map((person) => {
                        const isReceivable = person.netReceivable > 0;
                        const isPayable = person.netPayable > 0;
                        const isCleared = !isReceivable && !isPayable;
                        const isSelected = selectedPerson === person.name;

                        return (
                          <div
                            key={person.name}
                            onClick={() => setSelectedPerson(isSelected ? null : person.name)}
                            className={`p-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors cursor-pointer ${
                              isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/10 border-l-4 border-indigo-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs">
                                  {person.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-800 dark:text-gray-200">{person.name}</h4>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                    {isBn ? `${person.history.length} টি কিস্তি লেনদেন` : `${person.history.length} installments`}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                {isReceivable && (
                                  <span className="text-xs font-black text-emerald-600 font-mono">
                                    {isBn ? 'পাব' : 'Receivable'}: {currencySymbol}{person.netReceivable.toLocaleString()}
                                  </span>
                                )}
                                {isPayable && (
                                  <span className="text-xs font-black text-rose-600 font-mono">
                                    {isBn ? 'দেনা' : 'Owes'}: {currencySymbol}{person.netPayable.toLocaleString()}
                                  </span>
                                )}
                                {isCleared && (
                                  <span className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-500 rounded-full font-black uppercase tracking-wider">
                                    {isBn ? 'পরিশোধিত' : 'Cleared'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850/85 text-[10px] text-gray-400 uppercase font-black tracking-widest flex justify-between items-center">
                  <span>{isBn ? 'মোট ঋণগ্রহীতা/দাতা সংখ্যা' : 'Total Active Loan Contacts'}</span>
                  <span className="text-xs font-black text-slate-700 dark:text-gray-200 font-mono">
                    {peopleLoans.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (2/3 Width): DETAILED REPAYMENT INSTALLMENTS WORKSPACE */}
            <div className="lg:col-span-2">
              {(() => {
                const currentContact = peopleLoans.find(p => p.name === selectedPerson);
                
                if (!currentContact) {
                  return (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-12 text-center min-h-[500px] flex flex-col justify-center items-center space-y-4">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full">
                        <Users className="w-10 h-10" />
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h4 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100 tracking-wider">
                          {isBn ? 'গ্রাহক সিলেক্ট করুন' : 'Select a Loan Contact'}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                          {isBn 
                            ? 'বাম দিকের কন্ট্যাক্ট তালিকা থেকে যেকোনো একটি নাম সিলেক্ট করে তার মোট ধার, উসুলকৃত কিস্তি, অবশিষ্ট বাকি এবং কিস্তির লাইভ ইতিহাস ট্র্যাক করুন।' 
                            : 'Select any contact from the left list to review total lent/borrowed balances, register individual partial payments (installments), and audit payment history.'}
                        </p>
                      </div>
                    </div>
                  );
                }

                const remainingDue = Math.abs(currentContact.netReceivable || currentContact.netPayable || 0);
                const isReceivable = currentContact.netReceivable > 0;
                const isOwed = currentContact.netPayable > 0;

                return (
                  <div className="space-y-6">
                    
                    {/* CUSTOM LOAN CONTACT HEADER & SUMMARY CARDS */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-50 dark:border-slate-850/80">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center uppercase text-lg shadow-md shadow-indigo-600/10">
                            {currentContact.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{currentContact.name}</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                              {isBn ? 'ধার ও কিস্তি খাতা' : 'Personal Credit Portfolio'}
                            </p>
                          </div>
                        </div>

                        {/* Status Label */}
                        <div className="flex items-center gap-2">
                          {isReceivable && (
                            <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                              {isBn ? 'উসুলযোগ্য (Receivable)' : 'Receivable'}
                            </span>
                          )}
                          {isOwed && (
                            <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-black text-[10px] uppercase tracking-wider rounded-xl border border-rose-100 dark:border-rose-900/30">
                              {isBn ? 'পরিশোধযোগ্য (Payable)' : 'Payable'}
                            </span>
                          )}
                          {!isReceivable && !isOwed && (
                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-xl">
                              {isBn ? 'পরিশোধিত (Settled)' : 'Settled'}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(currentContact)}
                            title={isBn ? 'PDF হিসেবে সেভ করুন' : 'Save as PDF'}
                            className="p-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-black rounded-xl border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 3 Metrics Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider">
                            {isBn ? 'মোট ধার লেনদেন' : 'Principal Loan'}
                          </span>
                          <span className="block text-lg font-black font-mono mt-1 text-slate-700 dark:text-slate-200">
                            {currencySymbol}{(currentContact.lent || currentContact.borrowed).toLocaleString()}
                          </span>
                          <span className="block text-[8.5px] font-bold text-gray-400 mt-0.5">
                            {currentContact.lent > 0 ? (isBn ? 'প্রদত্ত মোট লোন' : 'Lent Principal') : (isBn ? 'গৃহীত মোট ঋণ' : 'Borrowed Principal')}
                          </span>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                          <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider">
                            {isBn ? 'মোট পরিশোধিত/উসুল' : 'Total Repaid'}
                          </span>
                          <span className="block text-lg font-black font-mono mt-1 text-slate-700 dark:text-slate-200">
                            {currencySymbol}{(currentContact.collected || currentContact.paid).toLocaleString()}
                          </span>
                          <span className="block text-[8.5px] font-bold text-gray-400 mt-0.5">
                            {currentContact.collected > 0 ? (isBn ? 'আজ অব্দি ফেরত আদায়' : 'Recovered partials') : (isBn ? 'আজ অব্দি শোধকৃত' : 'Paid back partials')}
                          </span>
                        </div>

                        <div className={`p-4 rounded-2xl border ${
                          remainingDue > 0
                            ? 'bg-rose-50/30 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/40'
                            : 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40'
                        }`}>
                          <span className={`block text-[9px] uppercase font-black tracking-wider ${remainingDue > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                            {remainingDue > 0 
                              ? (isReceivable ? (isBn ? 'বাকি পাওনা (Remaining Due)' : 'Outstanding Due') : (isBn ? 'বাকি দেনা (We Owe)' : 'Outstanding Debt')) 
                              : (isBn ? 'অবশিষ্ট ব্যালেন্স' : 'Settled Balance')
                            }
                          </span>
                          <span className={`block text-lg font-black font-mono mt-1 ${remainingDue > 0 ? 'text-rose-600 dark:text-rose-450' : 'text-emerald-600 dark:text-emerald-450'}`}>
                            {currencySymbol}{remainingDue.toLocaleString()}
                          </span>
                          <span className="block text-[8.5px] font-bold text-gray-400 mt-0.5">
                            {remainingDue > 0 ? (isBn ? 'লাল রঙে হাইলাইট করা' : 'Active remaining balance') : (isBn ? 'হিসাব পরিশোধ করা হয়েছে' : 'No balance outstanding')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* INLINE PARTIAL REPAYMENT / INSTALLMENT SUBMITTER */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-150 uppercase tracking-widest flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-emerald-600" />
                          {isBn ? 'নতুন এন্ট্রি / কিস্তি যুক্ত করুন' : 'Register New Entry / Installment'}
                        </h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                          {isBn ? 'গ্রাহকের লেজারে নতুন করে টাকা ধার দেওয়া, গ্রহণ, উসুল বা শোধের এন্ট্রি দিন' : 'Instantly log new loans or partial payments directly to ledger'}
                        </p>
                      </div>

                      <form onSubmit={handleQuickRepaymentSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                        <input type="hidden" value={selectedPerson} />
                        {/* Set repayment type */}
                        <div className="space-y-1 sm:col-span-1">
                          <label className="block text-[9px] uppercase font-black tracking-wider text-slate-400">{isBn ? 'ধরণ' : 'Action'}</label>
                          <select
                            value={repayType}
                            onChange={(e) => setRepayType(e.target.value as any)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full"
                          >
                            <option value="lent">{isBn ? 'নতুন করে ধার প্রদান' : 'Lent More'}</option>
                            <option value="borrowed">{isBn ? 'নতুন করে ধার গ্রহণ' : 'Borrowed More'}</option>
                            {isReceivable && <option value="collect">{isBn ? 'উসুল / কালেকশন' : 'Collect'}</option>}
                            {isOwed && <option value="pay">{isBn ? 'শোধ / পেইড' : 'Pay Back'}</option>}
                          </select>
                        </div>

                          {/* Date Field */}
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[9px] uppercase font-black tracking-wider text-slate-400">{isBn ? 'তারিখ' : 'Date'}</label>
                            <DateInput
                              isBn={isBn}
                              required
                              value={repayDate}
                              onChange={(v) => setRepayDate(v)}
                              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full font-mono text-slate-800 dark:text-slate-150"
                            />
                          </div>

                          {/* Amount */}
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[9px] uppercase font-black tracking-wider text-slate-400">{isBn ? 'পরিমাণ (৳)' : 'Amount (৳)'}</label>
                            <input
                              type="number"
                              required
                              placeholder="0.00"
                              value={repayAmount}
                              onChange={(e) => setRepayAmount(e.target.value)}
                              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full font-mono text-slate-800 dark:text-slate-150"
                            />
                          </div>

                          {/* Payment Method */}
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[9px] uppercase font-black tracking-wider text-slate-400">{isBn ? 'মাধ্যম' : 'Method'}</label>
                            <select
                              value={repayMethod}
                              onChange={(e) => setRepayMethod(e.target.value as any)}
                              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full cursor-pointer text-slate-700 dark:text-slate-200"
                            >
                              <option value="Cash">Cash</option>
                              <option value="Bank">Bank</option>
                              <option value="bKash">bKash</option>
                              <option value="Nagad">Nagad</option>
                              <option value="Rocket">Rocket</option>
                            </select>
                          </div>

                          {/* Submit Button */}
                          <div className="sm:col-span-1">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10"
                            >
                              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              {isBn ? 'সংরক্ষণ' : 'Save'}
                            </button>
                          </div>
                        </form>
                      </div>

                    {/* INSTALLMENT TRANSACTION TIMELINE HISTORY */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-50 dark:border-slate-850">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-150 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          {isBn ? 'এই কন্ট্যাক্টের লেনদেন ও কিস্তি বিবরণ খতিয়ান' : 'Detailed Installment History Ledger'}
                        </h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                          {isBn ? 'প্রতিটি আংশিক পেমেন্ট ও মাধ্যমের বিশদ বিবরণ' : 'Full tracking log of payments with payment channels'}
                        </p>
                      </div>

                      <div className="divide-y divide-gray-50 dark:divide-slate-850">
                        {currentContact.history.map((item, index) => {
                          const isRepay = item.type === 'repayment_collection' || item.type === 'debt_payment';
                          
                          return (
                            <div key={item.id || index} className="p-4 hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-all flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${
                                    isRepay 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-450 border-emerald-100/60' 
                                      : 'bg-amber-50 dark:bg-amber-950/10 text-amber-600 dark:text-amber-450 border-amber-100/60'
                                  }`}>
                                    {item.type === 'lent' && (isBn ? 'ধার প্রদান' : 'Lent Principal')}
                                    {item.type === 'borrowed' && (isBn ? 'ধার গ্রহণ' : 'Borrowed Principal')}
                                    {item.type === 'repayment_collection' && (isBn ? 'কিস্তি আদায়' : 'Installment Collected')}
                                    {item.type === 'debt_payment' && (isBn ? 'কিস্তি শোধ' : 'Installment Paid')}
                                  </span>

                                  {/* Payment method icon pill */}
                                  <span className="inline-flex items-center gap-1 text-[8.5px] px-2 py-0.5 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-100 dark:border-slate-850 font-bold">
                                    <CreditCard className="w-2.5 h-2.5 text-slate-400" />
                                    {item.paymentMethod}
                                  </span>
                                </div>
                                
                                {item.notes && (
                                  <p className="text-[10.5px] text-slate-500 font-medium">{item.notes}</p>
                                )}
                                <span className="block text-[9px] text-gray-400 font-mono">{formatDate(item.date)}</span>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <span className={`text-sm font-black font-mono ${isRepay ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {isRepay ? '+' : '-'}{currencySymbol}{item.amount.toLocaleString()}
                                </span>
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
                                    title={isBn ? "এডিট করুন" : "Edit Record"}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTx(item.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                                    title={isBn ? "ডিলিট করুন" : "Delete Record"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* TAB 3: FAMILY BUDGET & ANALYTICS */}
        {activeVisualTab === 'budget_analytics' && (
          <motion.div
            key="tab_budget_analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left Column (1/2 Width): BUDGET AND PROGRESS BAR */}
            <div className="space-y-6">
              
              {/* Budget limit form card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-gray-150 uppercase tracking-wider flex items-center gap-1.5">
                    <PiggyBank className="w-5 h-5 text-indigo-500" />
                    {isBn ? 'পারিবারিক ও লক্ষ্যভিত্তিক বাজেট কন্ট্রোলার' : 'Family Budget Controller'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                    {isBn ? 'মাসের খরচ নিয়ন্ত্রণে বাজেট সীমা সেট করুন' : 'Configure custom spending targets & alert profiles'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/80">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                      {isBn ? 'মাসিক বাজেট লক্ষ্য সীমা (৳)' : 'Monthly Spend Limit (৳)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-black text-slate-400">{currencySymbol}</span>
                      <input
                        type="number"
                        placeholder="15000"
                        value={budgetLimitInput}
                        onChange={(e) => setBudgetLimitInput(e.target.value)}
                        className="pl-7 pr-4 py-2 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => handleSaveBudget(parseFloat(budgetLimitInput) || 0)}
                      disabled={isSavingBudget}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm flex items-center justify-center gap-1"
                    >
                      {isSavingBudget ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {isBn ? 'সেট' : 'Set'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar Display Card */}
              {(() => {
                const progressPercent = budgetLimit > 0 
                  ? Math.min(100, Math.round((currentMonthExpense / budgetLimit) * 100))
                  : 0;

                const isExceeded = currentMonthExpense > budgetLimit;
                
                // Color configuration based on progress
                let barColor = 'bg-emerald-500';
                let textColor = 'text-emerald-600';
                let alertBg = 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30';
                
                if (progressPercent >= 75 && progressPercent < 100) {
                  barColor = 'bg-amber-500';
                  textColor = 'text-amber-600';
                  alertBg = 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30';
                } else if (isExceeded) {
                  barColor = 'bg-rose-500';
                  textColor = 'text-rose-600';
                  alertBg = 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30';
                }

                return (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                          {isBn ? 'এই মাসের খরচ বনাম বাজেট ট্র্যাক' : 'Monthly Spending Efficiency'}
                        </span>
                        <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
                          {isBn ? 'চলতি মাসে সর্বমোট খরচ:' : 'This month spent:'} <span className="font-mono text-rose-500">{currencySymbol}{currentMonthExpense.toLocaleString()}</span>
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-black font-mono ${textColor}`}>
                          {progressPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar track */}
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${barColor}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Target and Limit Summary Details */}
                    <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                      <span>{isBn ? 'খরচ শুরু: ৳০' : 'Spent: ৳0'}</span>
                      <span>{isBn ? `বাজেট সীমা: ৳${budgetLimit.toLocaleString()}` : `Limit: ৳${budgetLimit.toLocaleString()}`}</span>
                    </div>

                    {/* ALERT PANELS */}
                    {isExceeded ? (
                      <div className="p-4 rounded-2xl border bg-rose-50/30 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/40 flex items-start gap-3 text-rose-800 dark:text-rose-400">
                        <span className="text-lg">⚠️</span>
                        <div className="space-y-1">
                          <h5 className="text-[11.5px] font-black uppercase tracking-wider">{isBn ? 'বাজেট সীমা অতিক্রমের চরম সতর্কতা!' : 'CRITICAL BUDGET OVERRUN ALERT'}</h5>
                          <p className="text-[10.5px] leading-relaxed text-rose-600/90 dark:text-rose-400/90">
                            {isBn 
                              ? `সতর্ক হোন! আপনার এই মাসের খরচ (${currencySymbol}${currentMonthExpense.toLocaleString()}) আপনার সেট করা বাজেট সীমা (${currencySymbol}${budgetLimit.toLocaleString()}) অতিক্রম করেছে। অনাবশ্যক ব্যয় কমানোর চেষ্টা করুন!` 
                              : `Warning: You have exceeded your family budget target limit! Spending is ${currencySymbol}${(currentMonthExpense - budgetLimit).toLocaleString()} above your ceiling limit.`}
                          </p>
                        </div>
                      </div>
                    ) : progressPercent >= 75 ? (
                      <div className="p-4 rounded-2xl border bg-amber-50/30 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/40 flex items-start gap-3 text-amber-800 dark:text-amber-400">
                        <span className="text-lg">💡</span>
                        <div className="space-y-1">
                          <h5 className="text-[11.5px] font-black uppercase tracking-wider">{isBn ? 'বাজেট সীমা স্পর্শ করার সতর্কতা' : 'NEAR CAPACITY WARNING'}</h5>
                          <p className="text-[10.5px] leading-relaxed text-amber-600/90 dark:text-amber-400/90">
                            {isBn 
                              ? `আপনি আপনার মাসিক বাজেটের ৭৫% পেরিয়ে গেছেন। পরবর্তী ব্যয় করার সময় বাজেট সীমারেখা মনে রাখুন!` 
                              : `Heads up! You have utilized over 75% of your family budget limit. Plan next spendings carefully.`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40 flex items-start gap-3 text-emerald-800 dark:text-emerald-400">
                        <span className="text-lg">✅</span>
                        <div className="space-y-1">
                          <h5 className="text-[11.5px] font-black uppercase tracking-wider">{isBn ? 'বাজেট সীমা নিরাপদ জোনে আছে' : 'BUDGET UNDER CONTROL'}</h5>
                          <p className="text-[10.5px] leading-relaxed text-emerald-600/90 dark:text-emerald-400/90">
                            {isBn 
                              ? `চমৎকার! আপনার পারিবারিক খরচ এখনো সেট করা মাসিক বাজেটের নিরাপদ সীমারেখার মধ্যে রয়েছে।` 
                              : `Great job! Your household spending remains in the safe zone within the preset budget limit.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Right Column (1/2 Width): EXPENSE CATEGORY PIE CHART */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[480px]">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                  <PieIcon className="w-5 h-5 text-indigo-500" />
                  {isBn ? 'ব্যয় খাতের ক্যাটাগরি পাই-চার্ট' : 'Expense Category Pie Chart'}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                  {isBn ? 'কোন খাতে সবচেয়ে বেশি টাকা খরচ হয়েছে তার গ্রাফিক্যাল বিশ্লেষণ' : 'Visual categorization & percentage breakdown of spending'}
                </p>
              </div>

              {pieData.length === 0 ? (
                <div className="p-16 text-center text-gray-400 text-xs font-bold uppercase space-y-2 my-auto">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>{isBn ? 'বিশ্লেষণ করার মতো কোনো খরচের ডেটা নেই!' : 'No personal expense data recorded for this period'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-auto pt-6">
                  {/* Recharts Pie Chart Canvas */}
                  <div className="h-48 md:h-56 relative flex items-center justify-center font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => {
                            const colorsList = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#3b82f6', '#f43f5e', '#64748b'];
                            return <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} />;
                          })}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#f8fafc',
                            fontFamily: 'monospace',
                            fontSize: '11px'
                          }}
                          formatter={(value: any) => [`${currencySymbol}${value.toLocaleString()}`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Total Spent Indicator */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">{isBn ? 'মোট ব্যয়' : 'Total'}</span>
                      <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100">
                        {currencySymbol}{pieData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Sidebar Legends with percentage metrics */}
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {(() => {
                      const colorsList = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#3b82f6', '#f43f5e', '#64748b'];
                      const totalExpensesSum = pieData.reduce((acc, curr) => acc + curr.value, 0);

                      return pieData.map((item, idx) => {
                        const percent = totalExpensesSum > 0 ? ((item.value / totalExpensesSum) * 100).toFixed(1) : '0.0';
                        return (
                          <div key={item.name} className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 dark:hover:bg-slate-950/40 rounded-xl transition-all">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: colorsList[idx % colorsList.length] }} 
                              />
                              <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[90px]">{item.name}</span>
                            </div>
                            <div className="text-right font-mono text-[11px] font-black">
                              <span className="text-slate-800 dark:text-slate-100 mr-2">{percent}%</span>
                              <span className="text-slate-400 font-medium">({currencySymbol}{item.value.toLocaleString()})</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Pie helper info row */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850/85 text-[10px] text-gray-400 uppercase font-black tracking-widest flex justify-between items-center mt-auto">
                <span>{isBn ? 'শ্রেণীবিন্যাস কৃত খাতের পরিমাণ' : 'Total Expense Categories'}</span>
                <span className="text-xs font-black text-slate-700 dark:text-gray-200 font-mono">
                  {pieData.length}
                </span>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* DIALOG 1: ADD TRANSACTION DRAWER / MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    {isBn ? 'নতুন হিসাব এন্ট্রি করুন' : 'Add Ledger Entry'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                    {isBn ? 'পার্সোনাল নগদ আয়, খরচ বা ধারের হিসাব' : 'Securely persist transaction fields to cloud'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
                
                {/* Switcher tabs for Type */}
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5">
                    {isBn ? 'লেনদেনের ধরণ সিলেক্ট করুন' : 'Select Transaction Type'}
                  </span>
                  <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
                    {[
                      { key: 'income', bn: 'আয়', en: 'Income' },
                      { key: 'expense', bn: 'ব্যয়/খরচ', en: 'Expense' },
                      { key: 'lent', bn: 'ধার দেবো', en: 'Lent Given' },
                      { key: 'borrowed', bn: 'ধার নেবো', en: 'Borrowed' },
                      ...(txType === 'repayment_collection' ? [{ key: 'repayment_collection', bn: 'কিস্তি আদায়', en: 'Collect' }] : []),
                      ...(txType === 'debt_payment' ? [{ key: 'debt_payment', bn: 'কিস্তি শোধ', en: 'Pay' }] : [])
                    ].map((type) => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setTxType(type.key as any)}
                        className={`px-3 flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                          txType === type.key
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isBn ? type.bn : type.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                      {isBn ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full"
                    />
                  </div>

                  {/* Date Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                      {isBn ? 'তারিখ' : 'Date'}
                    </label>
                    <DateInput
                      isBn={isBn}
                      required
                      value={date}
                      onChange={setDate}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                </div>

                {/* Category Selection (Conditional based on income vs expense) */}
                {(txType === 'income' || txType === 'expense') && (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                      {isBn ? 'ক্যাটাগরি' : 'Category'}
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full cursor-pointer"
                    >
                      {txType === 'income' 
                        ? incomeCategories.map(c => <option key={c.value} value={c.value}>{isBn ? c.label : c.labelEn}</option>)
                        : expenseCategories.map(c => <option key={c.value} value={c.value}>{isBn ? c.label : c.labelEn}</option>)
                      }
                    </select>
                  </div>
                )}

                {/* Person Name Input (For Lent & Borrowed) */}
                {(txType === 'lent' || txType === 'borrowed' || txType === 'repayment_collection' || txType === 'debt_payment') && (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                      {isBn ? 'ব্যক্তির নাম' : 'Person Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder={isBn ? 'যেমন: মফিজুর রহমান' : 'e.g., Mofizur Rahman'}
                        value={personName}
                        onChange={e => setPersonName(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Method Selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {isBn ? 'লেনদেনের মাধ্যম / পেমেন্ট মেথড' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['Cash', 'Bank', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800'
                            : 'bg-slate-50/50 hover:bg-slate-100 border-slate-100 dark:bg-slate-950 dark:border-slate-850 text-slate-500'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {isBn ? 'মন্তব্য / নোট (ঐচ্ছিক)' : 'Notes (Optional)'}
                  </label>
                  <textarea
                    placeholder={isBn ? 'পারিবারিক খরচের বিবরণ বা লেনদেনের উদ্দেশ্য...' : 'Details or reason for this transaction...'}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        {isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {isBn ? 'সংরক্ষণ করুন' : 'Save Entry'}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 2: QUICK REPAYMENT MODAL */}
      <AnimatePresence>
        {isRepayModalOpen && selectedPerson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-4.5 h-4.5 text-indigo-500" />
                    {repayType === 'collect' 
                      ? (isBn ? 'টাকা আদায় / কালেকশন' : 'Collect Loan Payment')
                      : (isBn ? 'টাকা পরিশোধ / শোধ করুন' : 'Pay Back Loan Debt')
                    }
                  </h3>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase mt-0.5 tracking-wider">
                    {isBn ? `ব্যক্তি: ${selectedPerson}` : `Person: ${selectedPerson}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRepayModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleQuickRepaymentSubmit} className="p-6 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Amount Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                      {isBn ? 'পরিশোধের পরিমাণ (৳)' : 'Payment Amount (৳)'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={repayAmount}
                      onChange={e => setRepayAmount(e.target.value)}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full"
                    />
                  </div>

                  {/* Date Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                      {isBn ? 'তারিখ' : 'Date'}
                    </label>
                    <DateInput
                      isBn={isBn}
                      required
                      value={repayDate}
                      onChange={setRepayDate}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {isBn ? 'লেনদেনের মাধ্যম / মেথড' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['Cash', 'Bank', 'bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setRepayMethod(method)}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border cursor-pointer ${
                          repayMethod === method
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800'
                            : 'bg-slate-50/50 hover:bg-slate-100 border-slate-100 dark:bg-slate-950 dark:border-slate-850 text-slate-500'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                    {isBn ? 'মন্তব্য / নোট (ঐচ্ছিক)' : 'Notes (Optional)'}
                  </label>
                  <textarea
                    placeholder={isBn ? 'যেমন: কিস্তি বা আংশিক সমন্বয়...' : 'e.g., installment or cash repayment...'}
                    value={repayNotes}
                    onChange={e => setRepayNotes(e.target.value)}
                    rows={2}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-full resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRepayModalOpen(false)}
                    className="px-5 py-2.5 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        {isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {isBn ? 'নিশ্চিত করুন' : 'Confirm Repayment'}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

        {deleteConfirmTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-gray-100 mb-1">
                    {isBn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBn ? 'এই লেনদেনটি ডিলিট করলে তা আর ফেরত পাওয়া যাবে না।' : 'This action cannot be undone. This transaction will be permanently deleted.'}
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmTx(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteTx}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/20 cursor-pointer"
                  >
                    {isBn ? 'ডিলিট করুন' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
