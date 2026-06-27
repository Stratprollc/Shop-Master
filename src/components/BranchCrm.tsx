import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Search, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Phone, 
  BarChart, 
  MapPin, 
  Check, 
  X, 
  MessageSquare, 
  AlertCircle, 
  ShoppingCart, 
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface Branch {
  id: string;
  name: string;
  manager: string;
  phone: string;
  address: string;
  dailyTarget: number;
  revenue: number;
  staffCount: number;
  conversionRate: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  branchId: string;
  source: string;
  dealSize: number;
  stage: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
  assignedSalesman: string;
  notes: string;
  createdAt: string;
}

interface StockTransfer {
  id: string;
  itemName: string;
  fromBranchId: string;
  toBranchId: string;
  quantity: number;
  status: 'pending' | 'dispatched' | 'received';
  date: string;
  trackerCode: string;
}

interface BranchCrmProps {
  shopSettings: any;
  user: any;
  onSendMessage?: (phone: string, message: string) => Promise<{ success: boolean; error?: string }>;
  setNotification: (notif: { message: string; type: 'success' | 'error' | 'info' }) => void;
}

const DEFAULT_BRANCHES: Branch[] = [
  { id: 'b_wh', name: 'Central Warehouse & Storage', manager: 'Imtiaz Ahmed', phone: '01911998877', address: 'Plot 4, Sector 12, Uttara, Dhaka', dailyTarget: 300000, revenue: 2450000, staffCount: 4, conversionRate: 100 },
  { id: 'b1', name: 'Dhaka HQ Outlet', manager: 'Rahman Khan', phone: '01711223344', address: 'Plot 12, Road 4, Banani, Dhaka', dailyTarget: 150000, revenue: 1250000, staffCount: 12, conversionRate: 72 },
  { id: 'b2', name: 'Chittagong GEC Hub', manager: 'Sultan Ahmed', phone: '01811223344', address: 'GEC Circle, East Chittagong', dailyTarget: 100000, revenue: 840000, staffCount: 8, conversionRate: 65 },
  { id: 'b3', name: 'Sylhet Zindabazar Branch', manager: 'Farhan Kabir', phone: '01911223344', address: 'Zindabazar Central Point, Sylhet', dailyTarget: 75000, revenue: 590000, staffCount: 5, conversionRate: 58 },
  { id: 'b4', name: 'Uttara Model Town Store', manager: 'Nabila Islam', phone: '01511223344', address: 'Sector 3, Uttara, Dhaka', dailyTarget: 80000, revenue: 680000, staffCount: 6, conversionRate: 68 }
];

const DEFAULT_LEADS: Lead[] = [
  { id: 'l1', name: 'Tanvir Hossain', phone: '01755123456', branchId: 'b1', source: 'Facebook Ads', dealSize: 45000, stage: 'new', assignedSalesman: 'Anisur Rahman', notes: 'Interested in bulk purchasing office monitors.', createdAt: '2026-06-18' },
  { id: 'l2', name: 'Mehzabin Chowdhury', phone: '01855123456', branchId: 'b2', source: 'Website Inquiry', dealSize: 22000, stage: 'contacted', assignedSalesman: 'Rashedul Islam', notes: 'Inquired about warranty services and home delivery.', createdAt: '2026-06-19' },
  { id: 'l3', name: 'Sajid Al Hasan', phone: '01955123456', branchId: 'b1', source: 'Walk-in', dealSize: 95000, stage: 'proposal', assignedSalesman: 'Anisur Rahman', notes: 'Sent budget proposal for complete setup.', createdAt: '2026-06-20' },
  { id: 'l4', name: 'Ayesha Siddiqua', phone: '01555123456', branchId: 'b3', source: 'WhatsApp Referral', dealSize: 15000, stage: 'won', assignedSalesman: 'Sumon Dey', notes: 'Completed order placement with advance payment.', createdAt: '2026-06-15' }
];

const DEFAULT_TRANSFERS: StockTransfer[] = [
  { id: 't0', itemName: 'GigaByte H610M Motherboard', fromBranchId: 'b_wh', toBranchId: 'b1', quantity: 20, status: 'pending', date: '2026-06-21', trackerCode: 'TR-WH-DHK-101' },
  { id: 't1', itemName: 'Core i5 12th Gen Desktop PC', fromBranchId: 'b1', toBranchId: 'b2', quantity: 5, status: 'pending', date: '2026-06-20', trackerCode: 'TR-DHK-CTG-903' },
  { id: 't2', itemName: 'Logitech G102 Gaming Mouse', fromBranchId: 'b1', toBranchId: 'b3', quantity: 15, status: 'dispatched', date: '2026-06-19', trackerCode: 'TR-DHK-SYL-701' },
  { id: 't3', itemName: 'A4Tech USB Keyboard', fromBranchId: 'b2', toBranchId: 'b4', quantity: 10, status: 'received', date: '2026-06-17', trackerCode: 'TR-CTG-UTR-504' }
];

export default function BranchCrm({ shopSettings, user, onSendMessage, setNotification }: BranchCrmProps) {
  const isBn = shopSettings?.systemLanguage === 'bn';
  const currencySymbol = shopSettings?.currencySymbol || 'TK';

  const shopId = user?.shopId || 'master';

  // State initialization for branches, leads, transfers, and staff
  const [branches, setBranches] = useState<Branch[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; name: string; designation: string; branchId: string; status: 'online' | 'offline' | 'on-visit' }[]>([]);

  // Real-time Firestore Sync for Branches, Leads, Transfers, and Staff
  useEffect(() => {
    if (!shopId) return;

    // 1. Sync Branches
    const qBranches = query(collection(db, 'branches'), where('shopId', '==', shopId));
    const unsubBranches = onSnapshot(qBranches, async (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      if (list.length > 0) {
        setBranches(list);
      } else {
        // Create initial default branch in Firestore
        const defaultBranchId = `b1_${shopId}`;
        const defaultBranchData = {
          name: isBn ? 'প্রধান শাখা (Default)' : 'Main Branch (Default)',
          manager: user?.name || user?.email || 'Store Manager',
          phone: '',
          address: '',
          dailyTarget: 100000,
          revenue: 0,
          staffCount: 1,
          conversionRate: 100,
          shopId: shopId,
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'branches', defaultBranchId), defaultBranchData);
        } catch (err) {
          console.error("Error creating default branch", err);
        }
      }
    }, (err) => {
      console.error("Branch CRM - Branches sync error:", err);
    });

    return () => {
      unsubBranches();
    };
  }, [shopId, isBn, user]);

  useEffect(() => {
    if (!shopId || branches.length === 0) return;

    // 2. Sync Leads
    const qLeads = query(collection(db, 'leads'), where('shopId', '==', shopId));
    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      if (list.length > 0) {
        setLeads(list);
      } else {
        // Initialize default leads mapped to the active/available branch ID
        const targetBId = branches[0].id;
        const defaultLeadsList = [
          { name: 'Tanvir Hossain', phone: '01755123456', branchId: targetBId, source: 'Facebook Ads', dealSize: 45000, stage: 'new', assignedSalesman: 'Anisur Rahman', notes: 'Interested in bulk purchasing office monitors.', createdAt: '2026-06-18' },
          { name: 'Mehzabin Chowdhury', phone: '01855123456', branchId: branches[1]?.id || targetBId, source: 'Website Inquiry', dealSize: 22000, stage: 'contacted', assignedSalesman: 'Rashedul Islam', notes: 'Inquired about warranty services and home delivery.', createdAt: '2026-06-19' },
          { name: 'Sajid Al Hasan', phone: '01955123456', branchId: targetBId, source: 'Walk-in', dealSize: 95000, stage: 'proposal', assignedSalesman: 'Anisur Rahman', notes: 'Sent budget proposal for complete setup.', createdAt: '2026-06-20' },
          { name: 'Ayesha Siddiqua', phone: '01555123456', branchId: branches[2]?.id || targetBId, source: 'WhatsApp Referral', dealSize: 15000, stage: 'won', assignedSalesman: 'Sumon Dey', notes: 'Completed order placement with advance payment.', createdAt: '2026-06-15' }
        ].map(l => ({
          ...l,
          shopId: shopId
        }));
        defaultLeadsList.forEach(leadData => {
          addDoc(collection(db, 'leads'), leadData).catch(console.error);
        });
      }
    }, (err) => {
      console.error("Branch CRM - Leads sync error:", err);
    });

    // 3. Sync Transfers
    const qTransfers = query(collection(db, 'transfers'), where('shopId', '==', shopId));
    const unsubTransfers = onSnapshot(qTransfers, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      if (list.length > 0) {
        setTransfers(list);
      } else {
        const firstBId = branches[0].id;
        const secondBId = branches[1]?.id || firstBId;
        const defaultTransfersList = [
          { itemName: 'GigaByte H610M Motherboard', fromBranchId: firstBId, toBranchId: secondBId, quantity: 20, status: 'pending', date: '2026-06-21', trackerCode: 'TR-WH-DHK-101' },
          { itemName: 'Core i5 12th Gen Desktop PC', fromBranchId: firstBId, toBranchId: secondBId, quantity: 5, status: 'pending', date: '2026-06-20', trackerCode: 'TR-DHK-CTG-903' }
        ].map(t => ({
          ...t,
          shopId: shopId
        }));
        defaultTransfersList.forEach(transferData => {
          addDoc(collection(db, 'transfers'), transferData).catch(console.error);
        });
      }
    }, (err) => {
      console.error("Branch CRM - Transfers sync error:", err);
    });

    // 4. Sync Staff List
    const qStaff = query(collection(db, 'branch_staff'), where('shopId', '==', shopId));
    const unsubStaff = onSnapshot(qStaff, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      if (list.length > 0) {
        setStaffList(list);
      } else {
        const targetBId = branches[0].id;
        const defaultStaffList = [
          { name: 'Anisur Rahman', designation: 'Senior Sales Executive', branchId: targetBId, status: 'online' },
          { name: 'Rashedul Islam', designation: 'Sales Specialist', branchId: branches[1]?.id || targetBId, status: 'online' },
          { name: 'Sumon Dey', designation: 'Customer Support Lead', branchId: branches[2]?.id || targetBId, status: 'on-visit' }
        ].map(s => ({
          ...s,
          shopId: shopId
        }));
        defaultStaffList.forEach(staffData => {
          addDoc(collection(db, 'branch_staff'), staffData).catch(console.error);
        });
      }
    }, (err) => {
      console.error("Branch CRM - Staff sync error:", err);
    });

    return () => {
      unsubLeads();
      unsubTransfers();
      unsubStaff();
    };
  }, [shopId, branches]);

  useEffect(() => {
    if (branches && branches.length > 0) {
      const firstId = branches[0].id;
      setNewLead(prev => ({ ...prev, branchId: firstId }));
      setNewStaff(prev => ({ ...prev, branchId: firstId }));
      setNewTransfer(prev => ({ ...prev, fromBranchId: firstId, toBranchId: branches[1]?.id || firstId }));
      setActiveManagerBranchId(firstId);
    }
  }, [branches]);

  // View & UI Navigation States
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'crm' | 'transfers' | 'branches' | 'staff'>('analytics');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [crmSearchText, setCrmSearchText] = useState('');
  
  // Custom Analytics Filters
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'today' | 'week' | 'month'>('month');
  const [selectedAnalyticsBranchId, setSelectedAnalyticsBranchId] = useState<string>('all');

  // Interactive Manager vs HQ Admin simulated login roles
  const [portalRole, setPortalRole] = useState<'admin' | 'manager'>('admin');
  const [activeManagerBranchId, setActiveManagerBranchId] = useState<string>('b1');

  // Modals & form input states
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', manager: '', phone: '', address: '', dailyTarget: 50000, staffCount: 1 });
  
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', branchId: 'b1', source: 'Walk-in', dealSize: 10000, notes: '', assignedSalesman: '' });

  const [isAddTransferOpen, setIsAddTransferOpen] = useState(false);
  const [newTransfer, setNewTransfer] = useState({ itemName: '', fromBranchId: 'b_wh', toBranchId: 'b1', quantity: 1 });

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', designation: '', branchId: 'b1', status: 'online' as 'online' | 'offline' | 'on-visit' });

  // Create Staff
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.designation.trim()) {
      setNotification({ message: isBn ? 'তথ্যগুলো সঠিকভাবে পূরণ করুন!' : 'Please fill out all details!', type: 'error' });
      return;
    }
    const created = {
      name: newStaff.name,
      designation: newStaff.designation,
      branchId: newStaff.branchId,
      status: newStaff.status,
      shopId: shopId
    };
    addDoc(collection(db, 'branch_staff'), created).then(() => {
      // Update branch staffCount in Firestore
      const targetBranch = branches.find(b => b.id === newStaff.branchId);
      if (targetBranch) {
        const branchRef = doc(db, 'branches', newStaff.branchId);
        updateDoc(branchRef, {
          staffCount: (targetBranch.staffCount || 0) + 1
        }).catch(console.error);
      }
    }).catch(console.error);

    setNotification({ message: isBn ? 'নতুন স্টাফ মেম্বার ব্রাঞ্চে পোস্টিং করা হয়েছে!' : 'New staff member posted directly to branch!', type: 'success' });
    setIsAddStaffOpen(false);
    const firstBId = branches[0]?.id || 'b1';
    setNewStaff({ name: '', designation: '', branchId: firstBId, status: 'online' });
  };

  // Branch operations
  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim() || !newBranch.manager.trim() || !newBranch.phone.trim()) {
      setNotification({ message: isBn ? 'দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।' : 'Please fill out all required fields.', type: 'error' });
      return;
    }
    const created = {
      name: newBranch.name,
      manager: newBranch.manager,
      phone: newBranch.phone,
      address: newBranch.address || 'Dhaka',
      dailyTarget: Number(newBranch.dailyTarget) || 50000,
      revenue: 0,
      staffCount: Number(newBranch.staffCount) || 1,
      conversionRate: 0,
      shopId: shopId,
      createdAt: new Date().toISOString()
    };
    addDoc(collection(db, 'branches'), created).then((docRef) => {
      // Set newly created branch as active in localStorage
      localStorage.setItem('shopmaster_active_branch_id', docRef.id);
    }).catch(console.error);

    setNotification({ message: isBn ? 'নতুন ব্রাঞ্চ সফলভাবে যুক্ত হয়েছে!' : 'New branch registered successfully!', type: 'success' });
    setIsAddBranchOpen(false);
    setNewBranch({ name: '', manager: '', phone: '', address: '', dailyTarget: 50000, staffCount: 1 });
  };

  // Switch lead stage
  const handleUpdateLeadStage = (leadId: string, stage: 'new' | 'contacted' | 'proposal' | 'won' | 'lost') => {
    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.id) {
      const leadRef = doc(db, 'leads', lead.id);
      updateDoc(leadRef, { stage }).then(() => {
        // Update branch revenue in Firestore if lead is won
        const branchRef = doc(db, 'branches', lead.branchId);
        const targetBranch = branches.find(b => b.id === lead.branchId);
        if (targetBranch) {
          let newRev = targetBranch.revenue || 0;
          if (stage === 'won' && lead.stage !== 'won') {
            newRev += lead.dealSize;
          } else if (stage !== 'won' && lead.stage === 'won') {
            newRev = Math.max(0, newRev - lead.dealSize);
          }
          updateDoc(branchRef, { revenue: newRev }).catch(console.error);
        }
      }).catch(console.error);
    }
    setNotification({ message: isBn ? 'লিড স্টেজ সফলভাবে আপডেট করা হয়েছে' : 'Lead stage updated successfully', type: 'success' });
  };

  // Lead operations
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      setNotification({ message: isBn ? 'দয়া করে ক্লায়েন্টের নাম ও মোবাইল নাম্বার দিন।' : 'Please provide client name and phone number.', type: 'error' });
      return;
    }
    const created = {
      name: newLead.name,
      phone: newLead.phone,
      branchId: newLead.branchId,
      source: newLead.source,
      dealSize: Number(newLead.dealSize) || 0,
      stage: 'new',
      assignedSalesman: newLead.assignedSalesman || 'Unassigned',
      notes: newLead.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
      shopId: shopId
    };
    addDoc(collection(db, 'leads'), created).catch(console.error);

    setNotification({ message: isBn ? 'নতুন সিআরএম লিড যুক্ত হয়েছে!' : 'New CRM lead created successfully!', type: 'success' });
    setIsAddLeadOpen(false);
    const firstBId = branches[0]?.id || 'b1';
    setNewLead({ name: '', phone: '', branchId: firstBId, source: 'Walk-in', dealSize: 10000, notes: '', assignedSalesman: '' });
  };

  // WhatsApp Send helper via direct trigger
  const handleSendBranchWhatsApp = async (lead: Lead) => {
    const branchName = branches.find(b => b.id === lead.branchId)?.name || 'Merchant Outlet';
    const msg = isBn 
      ? `প্রিয় ${lead.name},\n${branchName} থেকে আমরা আপনাকে স্বাগত জানাচ্ছি। আমরা আপনার অনুসন্ধান সম্পর্কে আপনার সাথে আলোচনা করতে চাই। ধন্যবাদ!`
      : `Dear ${lead.name},\nGreetings from ${branchName}. We received your bulk query and want to coordinate pricing options with you. Thank you!`;

    if (onSendMessage) {
      setNotification({ message: isBn ? 'মেসেজ পাঠানো হচ্ছে...' : 'Sending WhatsApp message...', type: 'info' });
      const res = await onSendMessage(lead.phone, msg);
      if (res.success) {
        setNotification({ message: isBn ? 'মেসেজ সফলভাবে হোয়াটসঅ্যাপে পাঠানো হয়েছে!' : 'WhatsApp dispatch succeeded!', type: 'success' });
      } else {
        setNotification({ message: isBn ? `মেসেজ পাঠানো ব্যর্থ হয়েছে: ${res.error}` : `Failed to dispatch: ${res.error}`, type: 'error' });
      }
    } else {
      // Fallback
      setNotification({ message: isBn ? 'মেসেজ গেটওয়ে সংযোগ সরাসরি রেন্ডার করা নেই।' : 'Direct gateway is launching API dispatch request...', type: 'info' });
      const clean = lead.phone.replace(/\D/g, '');
      const formatted = clean.startsWith('880') ? clean : `880${clean.startsWith('0') ? clean.slice(1) : clean}`;
      window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  // Transer operations
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransfer.itemName.trim() || newTransfer.fromBranchId === newTransfer.toBranchId) {
      setNotification({ message: isBn ? 'একই ব্রাঞ্চে স্টক ট্রান্সফার সম্ভব নয়।' : 'Source and destination branches must change.', type: 'error' });
      return;
    }
    const created = {
      itemName: newTransfer.itemName,
      fromBranchId: newTransfer.fromBranchId,
      toBranchId: newTransfer.toBranchId,
      quantity: Number(newTransfer.quantity) || 1,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      trackerCode: 'TR-' + (Math.floor(Math.random() * 900) + 100),
      shopId: shopId
    };
    addDoc(collection(db, 'transfers'), created).catch(console.error);

    setNotification({ message: isBn ? 'স্টক স্থানান্তরের অনুরোধ জমা দেওয়া হয়েছে।' : 'Stock transfer request placed.', type: 'success' });
    setIsAddTransferOpen(false);
    const firstBId = branches[0]?.id || 'b1';
    setNewTransfer({ itemName: '', fromBranchId: firstBId, toBranchId: branches[1]?.id || firstBId, quantity: 1 });
  };

  // Handle transfer progression
  const handleUpdateTransferStatus = (transferId: string, nextStatus: 'dispatched' | 'received') => {
    const transfer = transfers.find(t => t.id === transferId);
    if (transfer && transfer.id) {
      const transferRef = doc(db, 'transfers', transfer.id);
      updateDoc(transferRef, { status: nextStatus }).catch(console.error);
    }
    const label = nextStatus === 'dispatched' ? (isBn ? 'স্টক ডিসপ্যাচ করা হয়েছে।' : 'Stock dispatched!') : (isBn ? 'স্টক সফলভাবে রিসিভ করা হয়েছে।' : 'Stock fully received!');
    setNotification({ message: label, type: 'success' });
  };

  // Team Member branch assignment
  const handleReassignStaff = (staffId: string, targetBranchId: string) => {
    const staffRef = doc(db, 'branch_staff', staffId);
    updateDoc(staffRef, { branchId: targetBranchId }).catch(console.error);
    setNotification({ message: isBn ? 'স্টাফ ব্রাঞ্চ অ্যাসাইনমেন্ট সফল হয়েছে।' : 'Staff branch reassigned successfully.', type: 'success' });
  };

  // Filter computations
  // Conditional checks based on logged-in role (Admin vs Branch Manager)
  const isManagerMode = portalRole === 'manager';
  
  // Set current context branch list for general tables
  const activeContextBranchId = isManagerMode ? activeManagerBranchId : selectedBranchId;

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    // If manager mode is enabled, only show leads assigned to their branch
    const bMatch = isManagerMode 
      ? l.branchId === activeManagerBranchId
      : (activeContextBranchId === 'all' || l.branchId === activeContextBranchId);
      
    const sMatch = l.name.toLowerCase().includes(crmSearchText.toLowerCase()) || 
                   l.phone.includes(crmSearchText) || 
                   (l.assignedSalesman && l.assignedSalesman.toLowerCase().includes(crmSearchText.toLowerCase()));
    return bMatch && sMatch;
  });

  // Calculate dynamic sales revenue according to physical timeframe and branch context
  const getBranchSalesByTimeframe = (b: Branch, timeframe: 'today' | 'week' | 'month') => {
    if (b.id === 'b_wh') return 0; // Central Warehouse has no retail sales revenue
    // Today's sale is simulated as ~5% of entire revenue, Week is ~32%, Month is 100%
    if (timeframe === 'today') {
      return Math.round(b.revenue * 0.055) + (b.id === 'b1' ? 4500 : 2500);
    } else if (timeframe === 'week') {
      return Math.round(b.revenue * 0.32) + (b.id === 'b1' ? 18000 : 9500);
    } else {
      return b.revenue;
    }
  };

  // Aggregated dynamic evaluations
  const totalAggregatedRevenue = branches
    .filter(b => isManagerMode ? b.id === activeManagerBranchId : (selectedAnalyticsBranchId === 'all' || b.id === selectedAnalyticsBranchId))
    .reduce((sum, b) => sum + getBranchSalesByTimeframe(b, analyticsTimeframe), 0);

  const aggregateDailyTarget = branches
    .filter(b => isManagerMode ? b.id === activeManagerBranchId : (selectedAnalyticsBranchId === 'all' || b.id === selectedAnalyticsBranchId))
    .reduce((sum, b) => {
      if (b.id === 'b_wh') return sum;
      if (analyticsTimeframe === 'today') return sum + b.dailyTarget;
      if (analyticsTimeframe === 'week') return sum + (b.dailyTarget * 7);
      return sum + (b.dailyTarget * 30);
    }, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-800" id="branch-crm-system-root">
      {/* Role Selection & Permission Channel Simulator Bar */}
      <div className="mb-6 p-4 bg-indigo-50/40 dark:bg-slate-850/30 rounded-2xl border border-indigo-100/50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping shrink-0" />
          <div>
            <h4 className="text-xs font-black text-indigo-950 dark:text-slate-100 uppercase tracking-wide">
              {isBn ? 'লগইন ও ওয়ার্কস্পেস অ্যাক্সেস সিমুলেটর' : 'Role-Based Authentication Access Simulator'}
            </h4>
            <p className="text-[10px] text-indigo-650/70 dark:text-indigo-400 font-bold uppercase tracking-widest mt-0.5">
              {isBn ? 'সিস্টেম ম্যানেজার বা মার্চেন্ট হিসেবে এন্টার করার চ্যানেল ট্র্যাকার' : 'Determine credentials to review individual manager dashboards.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-150 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => {
                setPortalRole('admin');
                setNotification({ message: isBn ? 'মার্চেন্ট হেডকোয়ার্টার (HQ Admin) ভিউ চালু হয়েছে।' : 'Switched to HQ Admin Command View.', type: 'info' });
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                portalRole === 'admin' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-100'
              }`}
            >
              👑 {isBn ? 'হেডকোয়ার্টার মার্চেন্ট' : 'HQ Merchant Admin'}
            </button>
            <button
              onClick={() => {
                setPortalRole('manager');
                setNotification({ message: isBn ? 'ব্রাঞ্চ ম্যানেজার প্যানেল ভিউ সক্রিয় হয়েছে।' : 'Activated Branch Manager terminal view.', type: 'info' });
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                portalRole === 'manager' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-100'
              }`}
            >
              💼 {isBn ? 'ব্রাঞ্চ ম্যানেজার পোর্টাল' : 'Branch Manager'}
            </button>
          </div>

          {portalRole === 'manager' && (
            <div className="animate-fadeIn flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-black uppercase">{isBn ? 'কনসোল ব্রাঞ্চ:' : 'Console Branch:'}</span>
              <select
                value={activeManagerBranchId}
                onChange={e => {
                  setActiveManagerBranchId(e.target.value);
                  const bName = branches.find(b => b.id === e.target.value)?.name || 'Branch';
                  setNotification({ message: isBn ? `${bName} এর ম্যানেজার ডেস্কে প্রবেশ করেছেন।` : `Logged into ${bName} Manager Console.`, type: 'success' });
                }}
                className="bg-white dark:bg-slate-800 text-[11px] font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700 p-1.5 rounded-lg outline-none"
              >
                {branches.filter(b => b.id !== 'b_wh').map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Title Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Network className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
                {isBn ? 'ব্রাঞ্চ সেলস ও সিআরএম পোর্টাল' : 'Branch Sales & CRM Control Center'}
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {isBn ? 'মাল্টি-ব্রাঞ্চ সেলস ট্র্যাকিং, লিড পাইপলাইন ও ক্যাশ সলিউশন' : 'Multi-branch logistics synchronizer, field sales and client engagement suite.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Branch Option Actions */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'branches' && (
            <button
              onClick={() => setIsAddBranchOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-205 flex items-center gap-1.5 cursor-pointer-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {isBn ? 'নতুন ব্রাঞ্চ' : 'Add New Branch'}
            </button>
          )}
          {activeSubTab === 'crm' && (
            <button
              onClick={() => setIsAddLeadOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-205 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {isBn ? 'নতুন ক্লায়েন্ট লিড' : 'Add Client Lead'}
            </button>
          )}
          {activeSubTab === 'transfers' && (
            <button
              onClick={() => setIsAddTransferOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-205 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {isBn ? 'স্টক ট্রান্সফার' : 'Transfer Stock'}
            </button>
          )}
          {activeSubTab === 'staff' && (
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-205 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {isBn ? 'নতুন স্টাফ নিয়োগ' : 'Post New Staff'}
            </button>
          )}
        </div>
      </div>

      {/* Primary Category Selector Header Tab */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
        {[
          { id: 'analytics', label: isBn ? '📊 ব্রাঞ্চ অ্যানালিটিক্স' : '📊 Branch Performance', icon: BarChart },
          { id: 'crm', label: isBn ? '🌟 সিআরএম লিড পাইপলাইন' : '🌟 Client Lead Matrix', icon: Users },
          { id: 'transfers', label: isBn ? '🔄 স্টক ট্রান্সফার হাব' : '🔄 Multi-Store Transfers', icon: ShoppingCart },
          { id: 'branches', label: isBn ? '🏢 ব্রাঞ্চ নির্দেশিকা' : '🏢 Network Directory', icon: Building2 },
          { id: 'staff', label: isBn ? '👥 লোকবল বিন্যাস' : '👥 Team Dispatch', icon: Network }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setActiveSubTab(tb.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === tb.id 
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border-b-2 border-indigo-600' 
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800/30'
            }`}
          >
            <span>{tb.label}</span>
          </button>
        ))}
      </div>

      {/* Segment Content Switcher */}
      <div>
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            {/* Real-time Dynamic Filter Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850/20 border border-gray-150 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-gray-400 mr-2">{isBn ? 'সময়সীমা ফিল্টার:' : 'Select Timeframe:'}</span>
                {[
                  { id: 'today', label: isBn ? '🕒 আজ (Daily)' : '🕒 Today' },
                  { id: 'week', label: isBn ? '📅 চলতি সপ্তাহ (Weekly)' : '📅 1 Week' },
                  { id: 'month', label: isBn ? '⏳ চলতি মাস (Monthly)' : '⏳ 1 Month' }
                ].map(tf => (
                  <button
                    key={tf.id}
                    onClick={() => {
                      setAnalyticsTimeframe(tf.id as any);
                      setNotification({ message: isBn ? `${tf.label} এর সেলস রিপোর্ট প্রস্তুত` : `${tf.label} report calculated.`, type: 'info' });
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                      analyticsTimeframe === tf.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-gray-400 hover:text-gray-700 border border-gray-100 dark:border-slate-750'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {!isManagerMode && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-gray-400">{isBn ? 'নির্দিষ্ট ব্রাঞ্চ:' : 'Filter Branch:'}</span>
                  <select
                    value={selectedAnalyticsBranchId}
                    onChange={e => {
                      setSelectedAnalyticsBranchId(e.target.value);
                      setNotification({ message: isBn ? 'অ্যানালিটিক্স ডাটা ফিল্টার করা হচ্ছে।' : 'Analytics filtered by chosen branch.', type: 'info' });
                    }}
                    className="bg-white dark:bg-slate-800 text-xs font-black uppercase text-slate-800 dark:text-slate-250 border border-gray-200 dark:border-slate-700 p-2 rounded-xl outline-none"
                  >
                    <option value="all">{isBn ? 'সকল ব্রাঞ্চ সমূহ' : 'All Branch Outlets'}</option>
                    {branches.filter(b => b.id !== 'b_wh').map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50/50 dark:bg-slate-850/20 border border-gray-100 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[9px] uppercase font-black text-gray-400 tracking-widest">
                    {isBn ? `${analyticsTimeframe === 'today' ? 'আজকের' : analyticsTimeframe === 'week' ? 'সাপ্তাহিক' : 'মাসিক'} মোট নেট লাভ` : 'Timeframe Net Revenue'}
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
                    {currencySymbol} {totalAggregatedRevenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    {isBn ? 'রিঅ্যাক্টিভ সময়সীমা অনুসারী বাজেট হিসাব' : 'Dynamic calculation based on timeline selection'}
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-850/20 border border-gray-100 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[9px] uppercase font-black text-gray-400 tracking-widest">{isBn ? 'মোট আউটলেট সংখ্যা' : 'Active Outlets'}</span>
                  <span className="text-2xl font-black text-gray-800 dark:text-white font-mono mt-1 block">
                    {isManagerMode ? 1 : (selectedAnalyticsBranchId === 'all' ? branches.filter(b => b.id !== 'b_wh').length : 1)}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">Managed distribution centers</span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-850/20 border border-gray-100 dark:border-slate-850 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[9px] uppercase font-black text-gray-400 tracking-widest">
                    {isBn ? 'ধার্যকৃত মোট লাভ লক্ষ্যমাত্রা' : 'Required Target Benchmark'}
                  </span>
                  <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
                    {currencySymbol} {aggregateDailyTarget.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-500 block mt-1">
                    {isBn ? `${analyticsTimeframe === 'today' ? 'দৈনিক' : analyticsTimeframe === 'week' ? '৭ দিনের' : '৩০ দিনের'} টার্গেট` : 'Milestone expectations'}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* In-depth Comparison Chart & Status list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Branch Progress Grid */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-2xl p-5">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">
                  {isBn ? `${analyticsTimeframe === 'today' ? 'আজকের' : analyticsTimeframe === 'week' ? 'সাপ্তাহিক' : 'মাসিক'} লক্ষ্যমাত্রা অর্জন অনুপাত` : 'Branch Goal Achievements Tracker'}
                </h3>
                
                <div className="space-y-5">
                  {branches.filter(b => b.id !== 'b_wh').map(b => {
                    const sales = getBranchSalesByTimeframe(b, analyticsTimeframe);
                    const target = analyticsTimeframe === 'today' ? b.dailyTarget : (analyticsTimeframe === 'week' ? b.dailyTarget * 7 : b.dailyTarget * 30);
                    const percentage = Math.min(100, Math.round((sales / target) * 100)) || 0;
                    return (
                      <div key={b.id} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800 dark:text-slate-200">{b.name}</span>
                          <span className="text-gray-400 font-mono">
                            {currencySymbol} {sales.toLocaleString()} / {percentage}% {isBn ? 'অর্জিত' : 'Achieved'}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Branch breakdown rankings */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">{isBn ? 'শাখা সেলস র‍্যাংকিং লিডারবোর্ড' : 'Sales Leaderboards'}</h3>
                
                <div className="divide-y divide-gray-50 dark:divide-slate-800 max-h-[290px] overflow-y-auto custom-scrollbar">
                  {branches
                    .filter(b => b.id !== 'b_wh')
                    .map(b => ({ ...b, simulatedSales: getBranchSalesByTimeframe(b, analyticsTimeframe) }))
                    .sort((a,b) => b.simulatedSales - a.simulatedSales)
                    .map((b, idx) => (
                      <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-black">{idx + 1}</span>
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-slate-250 truncate max-w-[130px]">{b.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{b.manager}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-indigo-650 dark:text-indigo-400">{currencySymbol} {b.simulatedSales.toLocaleString()}</span>
                          <p className="text-[9px] text-emerald-500 font-black uppercase tracking-wider">{b.conversionRate}% Conv.</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Lead Pipeline / CRM tab */}
        {activeSubTab === 'crm' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-gray-100 dark:border-slate-850">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isBn ? 'নাম, ফোন নম্বর বা দায়িত্বপ্রাপ্ত সদস্যের নাম খুঁজুন...' : 'Search customers, phones or executives...'}
                  value={crmSearchText}
                  onChange={e => setCrmSearchText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-850/50 text-xs font-semibold rounded-xl outline-none border border-gray-150 dark:border-slate-800 focus:border-indigo-600"
                />
              </div>

              <div className="w-full md:w-auto flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">{isBn ? 'ব্রাঞ্চ ফিল্টার:' : 'Branch:'}</span>
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                  className="bg-white dark:bg-slate-850/50 text-xs font-bold border border-gray-150 dark:border-slate-800 p-2 rounded-xl outline-none"
                >
                  <option value="all">{isBn ? 'সকল শাখা' : 'All Branches'}</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lead Lists */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-2xl p-4 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-850 text-[9px] uppercase font-black tracking-widest text-gray-400 pb-2">
                      <th className="py-3 px-4">{isBn ? 'ক্লায়েন্ট নাম' : 'Prospect Client'}</th>
                      <th className="py-3 px-2">{isBn ? 'ব্রাঞ্চ' : 'Assigned Branch'}</th>
                      <th className="py-3 px-2 text-center">{isBn ? 'উৎস' : 'Source'}</th>
                      <th className="py-3 px-2 text-right">{isBn ? 'ডিল সাইজ' : 'Estimated Value'}</th>
                      <th className="py-3 px-2 text-center">{isBn ? 'পাইপলাইন স্টেজ' : 'Status Stage'}</th>
                      <th className="py-3 px-2">{isBn ? 'দায়িত্বপ্রাপ্ত' : 'Assignee'}</th>
                      <th className="py-3 pr-4 text-center">{isBn ? 'হোয়াটসঅ্যাপ মেসেজ' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-850">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-450 dark:text-gray-500 font-bold">
                          {isBn ? 'কোনো সিআরএম ক্লায়েন্ট লিড পাওয়া যায়নি!' : 'No customer CRM pipeline records matched.'}
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map(l => {
                        const brName = branches.find(b => b.id === l.branchId)?.name || 'Central Store';
                        return (
                          <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 leading-snug">{l.name}</h4>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{l.phone}</p>
                            </td>
                            <td className="py-3.5 px-2 text-indigo-650 font-extrabold">{brName}</td>
                            <td className="py-3.5 px-2 text-center text-gray-500">{l.source}</td>
                            <td className="py-3.5 px-2 text-right font-black font-mono text-slate-700 dark:text-slate-150">
                              {currencySymbol} {l.dealSize.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-2 text-center">
                              <select
                                value={l.stage}
                                onChange={e => handleUpdateLeadStage(l.id, e.target.value as any)}
                                className={`text-[10px] uppercase font-black tracking-wider px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                                  l.stage === 'new' ? 'bg-blue-50 text-blue-650 border-blue-200' :
                                  l.stage === 'contacted' ? 'bg-amber-50 text-amber-650 border-amber-200' :
                                  l.stage === 'proposal' ? 'bg-indigo-50 text-indigo-650 border-indigo-200' :
                                  l.stage === 'won' ? 'bg-emerald-50 text-emerald-650 border-emerald-200' :
                                  'bg-rose-50 text-rose-650 border-rose-200'
                                }`}
                              >
                                <option value="new">🆕 New</option>
                                <option value="contacted">📞 Contacted</option>
                                <option value="proposal">📄 Proposal</option>
                                <option value="won">🎉 Won Deal</option>
                                <option value="lost">❌ Lost Deal</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-2 text-gray-600 dark:text-slate-300 font-bold">{l.assignedSalesman}</td>
                            <td className="py-3.5 pr-4 text-center">
                              <button
                                onClick={() => handleSendBranchWhatsApp(l)}
                                className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-650 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Send WhatsApp sync alert"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stock Transfer Hub */}
        {activeSubTab === 'transfers' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 rounded-2xl p-4 overflow-hidden shadow-sm">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">{isBn ? 'শাখা-শাখা ইন্টারনাল স্টক মুভমেন্ট লগ' : 'Inter-Branch Stock Movement Ledger'}</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-850 text-[9px] uppercase font-black tracking-widest text-gray-400 pb-2">
                      <th className="py-3 px-4">{isBn ? 'চালন কোড' : 'Transfer Code'}</th>
                      <th className="py-3 px-2">{isBn ? 'আইটেম নাম' : 'Product Name'}</th>
                      <th className="py-3 px-2">{isBn ? 'প্রেরক শাখা' : 'Sender Branch'}</th>
                      <th className="py-3 px-2">{isBn ? 'গ্রাহক শাখা' : 'Receiver Branch'}</th>
                      <th className="py-3 px-2 text-center">{isBn ? 'সংখ্যা' : 'Qty'}</th>
                      <th className="py-3 px-2 text-center">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                      <th className="py-3 pr-4 text-center">{isBn ? 'অ্যাকশন' : 'Update Log'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-855">
                    {transfers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-450 dark:text-gray-550 font-bold">
                          {isBn ? 'কোনো স্থানান্তরের রেকর্ড জমা নেই!' : 'No stock movement records requested yet.'}
                        </td>
                      </tr>
                    ) : (
                      transfers.map(t => {
                        const sender = branches.find(b => b.id === t.fromBranchId)?.name || 'HQ Warehouse';
                        const receiver = branches.find(b => b.id === t.toBranchId)?.name || 'Recipient Hub';
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-black text-gray-650">{t.trackerCode}</td>
                            <td className="py-3.5 px-2 font-black text-slate-850 dark:text-slate-100">{t.itemName}</td>
                            <td className="py-3.5 px-2 text-indigo-650">{sender}</td>
                            <td className="py-3.5 px-2 text-emerald-650">{receiver}</td>
                            <td className="py-3.5 px-2 text-center font-bold font-mono text-md">{t.quantity} pcs</td>
                            <td className="py-3.5 px-2 text-center">
                              <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full ${
                                t.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                t.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4 text-center">
                              {t.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateTransferStatus(t.id, 'dispatched')}
                                  className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-700 transition"
                                >
                                  {isBn ? 'ডিসপ্যাচ করুন' : 'Dispatch'}
                                </button>
                              )}
                              {t.status === 'dispatched' && (
                                <button
                                  onClick={() => handleUpdateTransferStatus(t.id, 'received')}
                                  className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition"
                                >
                                  {isBn ? 'রিসিভ করুন' : 'Receive'}
                                </button>
                              )}
                              {t.status === 'received' && (
                                <span className="text-[10px] text-gray-400 font-extrabold flex items-center justify-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  {isBn ? 'সমাপ্ত' : 'Completed'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Network Branches list section */}
        {activeSubTab === 'branches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map(b => (
              <div 
                key={b.id} 
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 rounded-xl">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm">{b.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-705 rounded-full font-mono text-[10px] font-black">
                    {b.id}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-gray-500 dark:text-gray-450">
                  <div className="flex items-center justify-between">
                    <span>{isBn ? 'শাখা ব্যবস্থাপক:' : 'Branch Manager:'}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold">{b.manager}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isBn ? 'মোবাইল নাম্বার:' : 'Phone Contact:'}</span>
                    <span className="text-slate-650 font-mono">{b.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isBn ? 'অফিস ঠিকানা:' : 'Location Address:'}</span>
                    <span className="text-slate-650 truncate max-w-[190px]">{b.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isBn ? 'দৈনিক সেলস টার্গেট:' : 'Daily Budget:'}</span>
                    <span className="text-slate-850 dark:text-slate-100 font-mono font-black">{currencySymbol} {b.dailyTarget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isBn ? 'মোট কর্মরত কর্মী:' : 'Active Staff Matrix:'}</span>
                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded font-bold font-mono text-slate-800 dark:text-white">{b.staffCount} crew</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Staff allocation dispatcher */}
        {activeSubTab === 'staff' && (
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-805 rounded-2xl p-5">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">{isBn ? 'শাখা অনুযায়ী কর্মচারীব্যবস্থাপনা ও পোস্টিং' : 'Staff Reassignment & Operational Deployment'}</h3>
            
            <div className="space-y-3.5">
              {staffList.map(st => {
                const bName = branches.find(b => b.id === st.branchId)?.name || 'Central Outlet';
                return (
                  <div key={st.id} className="p-3 bg-slate-50/50 dark:bg-slate-850/10 rounded-xl border border-gray-100 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{st.name}</h4>
                        <span className={`w-2 h-2 rounded-full ${st.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wide">{st.designation}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-black uppercase">{isBn ? 'বর্তমান ব্রাঞ্চ:' : 'Assigned Outlet:'}</span>
                      <select
                        value={st.branchId}
                        onChange={e => handleReassignStaff(st.id, e.target.value)}
                        className="bg-white dark:bg-slate-800 text-xs font-bold border border-gray-150 dark:border-slate-700 py-1.5 px-3 rounded-lg outline-none"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Modal for Add Branch */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsAddBranchOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-md font-black text-gray-800 dark:text-slate-100 uppercase tracking-tight mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-650" />
              {isBn ? 'নতুন ব্রাঞ্চ যুক্ত করুন' : 'Setup New Branch Network'}
            </h3>

            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'ব্রাঞ্চ নাম*' : 'Branch Name*'}</label>
                <input
                  type="text"
                  required
                  value={newBranch.name}
                  onChange={e => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Mirpur Sector 10 Outlet"
                  className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'ম্যানেজার নাম*' : 'Branch Manager*'}</label>
                  <input
                    type="text"
                    required
                    value={newBranch.manager}
                    onChange={e => setNewBranch(prev => ({ ...prev, manager: e.target.value }))}
                    placeholder="e.g. Mahfuz Rayhan"
                    className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'ব্যবস্থাপক মোবাইল*' : 'Manager Phone*'}</label>
                  <input
                    type="text"
                    required
                    value={newBranch.phone}
                    onChange={e => setNewBranch(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'ঠিকানা' : 'Street Line Address'}</label>
                <input
                  type="text"
                  value={newBranch.address}
                  onChange={e => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street and circle address..."
                  className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'টার্গেট বাজেট (টাকা)' : 'Daily Target (Tk)'}</label>
                  <input
                    type="number"
                    value={newBranch.dailyTarget}
                    onChange={e => setNewBranch(prev => ({ ...prev, dailyTarget: Number(e.target.value) }))}
                    className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'কর্মী সংখ্যা' : 'Staff Allocation'}</label>
                  <input
                    type="number"
                    value={newBranch.staffCount}
                    onChange={e => setNewBranch(prev => ({ ...prev, staffCount: Number(e.target.value) }))}
                    className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition"
              >
                {isBn ? 'শাখা অনুমোদন প্রদান করুন' : 'Confirm Branch Activation'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Modal for Add Lead */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsAddLeadOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-md font-black text-gray-800 dark:text-slate-100 uppercase tracking-tight mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-650" />
              {isBn ? 'নতুন সিআরএম কাস্টমার লিড যুক্ত নুত্যন' : 'Spawn Client Lead'}
            </h3>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'ক্লায়েন্ট নাম*' : 'Lead / Prospect Name*'}</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={e => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Shakil Ahmed"
                  className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'মোবাইল নাম্বার*' : 'Phone Number*'}</label>
                  <input
                    type="text"
                    required
                    value={newLead.phone}
                    onChange={e => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="01xxxxxxxxx"
                    className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'উৎস*' : 'Lead Source*'}</label>
                  <select
                    value={newLead.source}
                    onChange={e => setNewLead(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  >
                    <option value="Walk-in">Walk-in Depot</option>
                    <option value="Facebook Ads">Facebook Social Campaigns</option>
                    <option value="Website Inquiry">Website Forms</option>
                    <option value="WhatsApp Referral">WhatsApp Referral Sync</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'ধার্যকৃত শাখা*' : 'Target Branch Outlet*'}</label>
                  <select
                    value={newLead.branchId}
                    onChange={e => setNewLead(prev => ({ ...prev, branchId: e.target.value }))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'আনুমানিক ক্রয়ের আকার' : 'Deal Estimate Value'}</label>
                  <input
                    type="number"
                    value={newLead.dealSize}
                    onChange={e => setNewLead(prev => ({ ...prev, dealSize: Number(e.target.value) }))}
                    className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'দায়িত্ববান সেলসম্যান' : 'Representative Salesman'}</label>
                <input
                  type="text"
                  value={newLead.assignedSalesman}
                  onChange={e => setNewLead(prev => ({ ...prev, assignedSalesman: e.target.value }))}
                  placeholder="Staff member assigned..."
                  className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'মন্তব্য বা চাহিদা' : 'Notes/Description'}</label>
                <textarea
                  value={newLead.notes}
                  onChange={e => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter details..."
                  className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none min-h-[60px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition"
              >
                {isBn ? 'সিআরএম রিক্রুট সম্পূর্ণ করুন' : 'Finalize Lead Generation'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Modal for Add Transfer Request */}
      {isAddTransferOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsAddTransferOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-md font-black text-gray-800 dark:text-slate-100 uppercase tracking-tight mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-650" />
              {isBn ? 'নতুন স্টক স্থানান্তরের ফাইল' : 'Log Stock Transfer File'}
            </h3>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'পণ্যের নাম*' : 'Product Name*'}</label>
                <input
                  type="text"
                  required
                  value={newTransfer.itemName}
                  onChange={e => setNewTransfer(prev => ({ ...prev, itemName: e.target.value }))}
                  placeholder="e.g. Intel Core i5 Desktop PC"
                  className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'প্রেরক শাখা*' : 'Sender Branch (From)*'}</label>
                  <select
                    value={newTransfer.fromBranchId}
                    onChange={e => setNewTransfer(prev => ({ ...prev, fromBranchId: e.target.value }))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'গ্রাহক শাখা*' : 'Receiver Branch (To)*'}</label>
                  <select
                    value={newTransfer.toBranchId}
                    onChange={e => setNewTransfer(prev => ({ ...prev, toBranchId: e.target.value }))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 uppercase tracking-widest text-[9px] mb-1.5">{isBn ? 'পরিমাণ (পিস)*' : 'Quantity (pcs)*'}</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newTransfer.quantity}
                  onChange={e => setNewTransfer(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="w-full bg-slate-50 focus:bg-white p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg transition"
              >
                {isBn ? 'তথ্য স্থানান্তরের ট্যাগ তৈরি করুন' : 'Dispatch Shipment File'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
