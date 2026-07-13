import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Search, 
  Sliders, 
  Lock, 
  Unlock,
  Key,
  Layers,
  HelpCircle,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Building,
  ShieldCheck,
  Briefcase,
  CheckCircle,
  SquarePen
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';

interface RoleUserCustomPageProps {
  user: any;
  shopSettings: any;
  setNotification: any;
}

export default function RoleUserCustomPage({ user, shopSettings, setNotification }: RoleUserCustomPageProps) {
  const isBn = shopSettings?.systemLanguage === 'bn';
  const currentShopId = user?.shopId || shopSettings?.shopId || shopSettings?.id || 'master';

  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState<'access' | 'roles' | 'business'>('access');

  // Load registered roles dynamically from shopSettings
  const ALL_ROLES = shopSettings?.rolesList || ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team', 'warehouse'];

  // Role Editor state
  const [newRoleInput, setNewRoleInput] = useState('');
  const [editingRoleName, setEditingRoleName] = useState<string | null>(null);
  const [newRoleEditValue, setNewRoleEditValue] = useState('');

  // Selected Business Type
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('Retail');

  // Permissions Matrix Loading State
  const [isUpdatingMatrix, setIsUpdatingMatrix] = useState(false);

  useEffect(() => {
    if (shopSettings?.businessType) {
      setSelectedBusinessType(shopSettings.businessType);
    }
  }, [shopSettings?.businessType]);

  useEffect(() => {
    if (!currentShopId) return;

    // Fetch Staff/Users
    const qStaff = query(collection(db, 'staff'), where('shopId', '==', currentShopId));
    const unsubStaff = onSnapshot(qStaff, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(list);
      setLoading(false);
    });

    // Fetch Branches
    const qBranches = query(collection(db, 'branches'), where('shopId', '==', currentShopId));
    const unsubBranches = onSnapshot(qBranches, (snapshot) => {
      setBranches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubStaff();
      unsubBranches();
    };
  }, [currentShopId]);

  // Load and generate a visual matrix for pages based on sidebarConfig
  const sections = shopSettings?.sidebarConfig?.sections || [];
  const allCustomPages = sections.flatMap((sec: any) => 
    (sec.items || []).flatMap((item: any) => {
      const itemsList = [item];
      if (item.subItems) {
        itemsList.push(...item.subItems);
      }
      return itemsList;
    })
  );

  // Manage matrix toggles
  const handleTogglePageRole = async (pageId: string, role: string, isAllowed: boolean) => {
    setIsUpdatingMatrix(true);
    try {
      const updatedSections = sections.map((sec: any) => {
        const updatedItems = (sec.items || []).map((item: any) => {
          let updatedSubItems = item.subItems;
          if (item.subItems) {
            updatedSubItems = item.subItems.map((sub: any) => {
              if (sub.id === pageId) {
                const roles = sub.allowedRoles || sub.roles || [];
                const nextRoles = isAllowed 
                  ? [...roles.filter((r: string) => r !== role), role]
                  : roles.filter((r: string) => r !== role);
                return { ...sub, allowedRoles: nextRoles, roles: nextRoles };
              }
              return sub;
            });
          }

          if (item.id === pageId) {
            const roles = item.allowedRoles || item.roles || [];
            const nextRoles = isAllowed 
              ? [...roles.filter((r: string) => r !== role), role]
              : roles.filter((r: string) => r !== role);
            return { ...item, allowedRoles: nextRoles, roles: nextRoles, subItems: updatedSubItems };
          }

          return { ...item, subItems: updatedSubItems };
        });

        return { ...sec, items: updatedItems };
      });

      const shopRef = doc(db, 'settings', currentShopId);
      await updateDoc(shopRef, {
        'sidebarConfig.sections': updatedSections
      });

      // Also sync to master settings if master admin
      const isMasterAdmin = user?.email?.toLowerCase().trim() === 'stratproamz@gmail.com' || user?.role === 'master_admin';
      if (isMasterAdmin) {
        try {
          await updateDoc(doc(db, 'settings', 'master'), {
            'sidebarConfig.sections': updatedSections
          });
        } catch (e) {
          console.error('Master sync failed', e);
        }
      }

      setNotification({
        type: 'success',
        message: isBn 
          ? `পেইজটির অ্যাক্সেস পারমিশন পরিবর্তন করা হয়েছে!` 
          : `Page access permission modified successfully!`
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update matrix.' });
    } finally {
      setIsUpdatingMatrix(false);
    }
  };

  // Manage Custom Roles (Tab 2 Handlers)
  const handleAddRole = async () => {
    const rawVal = newRoleInput.trim();
    if (!rawVal) {
      setNotification({
        type: 'error',
        message: isBn ? 'দয়া করে রোলের নাম লিখুন!' : 'Please enter a role name!'
      });
      return;
    }

    const cleanRole = rawVal.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanRole) {
      setNotification({
        type: 'error',
        message: isBn 
          ? 'রোলের নাম শুধুমাত্র ইংরেজি ছোট হাতের অক্ষর (a-z), সংখ্যা (0-9) এবং (_) আন্ডারস্কোর হতে হবে!' 
          : 'Role name must only contain lowercase English letters (a-z), numbers (0-9), and underscores (_)'
      });
      return;
    }

    if (ALL_ROLES.includes(cleanRole)) {
      setNotification({
        type: 'error',
        message: isBn ? 'এই রোলটি ইতিমধ্যে বিদ্যমান!' : 'This role already exists!'
      });
      return;
    }

    try {
      const nextRoles = [...ALL_ROLES, cleanRole];
      const shopRef = doc(db, 'settings', currentShopId);
      await setDoc(shopRef, {
        rolesList: nextRoles
      }, { merge: true });

      // Also set to master settings if master admin
      const isMasterAdmin = user?.email?.toLowerCase().trim() === 'stratproamz@gmail.com' || user?.role === 'master_admin';
      if (isMasterAdmin) {
        try {
          await setDoc(doc(db, 'settings', 'master'), {
            rolesList: nextRoles
          }, { merge: true });
        } catch (e) {
          console.error('Master write error:', e);
        }
      }

      setNewRoleInput('');
      setNotification({
        type: 'success',
        message: isBn ? 'কাস্টম রোলটি সফলভাবে যুক্ত হয়েছে!' : 'Custom role added successfully!'
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to add role.' });
    }
  };

  const handleSaveRoleEdit = async (oldRole: string) => {
    if (!newRoleEditValue.trim()) return;
    const nextRole = newRoleEditValue.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (nextRole === oldRole) {
      setEditingRoleName(null);
      return;
    }
    if (ALL_ROLES.includes(nextRole)) {
      setNotification({
        type: 'error',
        message: isBn ? 'এই নামের আরেকটি রোল ইতিমধ্যে বিদ্যমান!' : 'Another role with this name already exists!'
      });
      return;
    }

    try {
      const nextRoles = ALL_ROLES.map((r: string) => r === oldRole ? nextRole : r);
      
      // Update sidebar config matrix permissions so users don't lose access
      const updatedSections = sections.map((sec: any) => {
        const updatedItems = (sec.items || []).map((item: any) => {
          let updatedSubItems = item.subItems;
          if (item.subItems) {
            updatedSubItems = item.subItems.map((sub: any) => {
              const roles = sub.allowedRoles || sub.roles || [];
              if (roles.includes(oldRole)) {
                const nextAllowed = roles.map((r: string) => r === oldRole ? nextRole : r);
                return { ...sub, allowedRoles: nextAllowed, roles: nextAllowed };
              }
              return sub;
            });
          }

          const roles = item.allowedRoles || item.roles || [];
          if (roles.includes(oldRole)) {
            const nextAllowed = roles.map((r: string) => r === oldRole ? nextRole : r);
            return { ...item, allowedRoles: nextAllowed, roles: nextAllowed, subItems: updatedSubItems };
          }

          return { ...item, subItems: updatedSubItems };
        });
        return { ...sec, items: updatedItems };
      });

      const shopRef = doc(db, 'settings', currentShopId);
      await updateDoc(shopRef, {
        rolesList: nextRoles,
        'sidebarConfig.sections': updatedSections
      });

      // Also set to master settings if master admin
      const isMasterAdmin = user?.email?.toLowerCase().trim() === 'stratproamz@gmail.com' || user?.role === 'master_admin';
      if (isMasterAdmin) {
        try {
          await updateDoc(doc(db, 'settings', 'master'), {
            rolesList: nextRoles,
            'sidebarConfig.sections': updatedSections
          });
        } catch (e) {
          console.error('Master write error:', e);
        }
      }

      setEditingRoleName(null);
      setNotification({
        type: 'success',
        message: isBn ? 'রোলটি সফলভাবে রিনেম করা হয়েছে!' : 'Role renamed successfully!'
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to rename role.' });
    }
  };

  const handleDeleteRole = async (roleToDelete: string) => {
    if (window.confirm(isBn ? `আপনি কি নিশ্চিতভাবে "${roleToDelete}" রোলটি ডিলিট করতে চান?` : `Are you sure you want to delete "${roleToDelete}" role?`)) {
      try {
        const nextRoles = ALL_ROLES.filter((r: string) => r !== roleToDelete);

        // Clean up from sidebar configuration matrix
        const updatedSections = sections.map((sec: any) => {
          const updatedItems = (sec.items || []).map((item: any) => {
            let updatedSubItems = item.subItems;
            if (item.subItems) {
              updatedSubItems = item.subItems.map((sub: any) => {
                const roles = sub.allowedRoles || sub.roles || [];
                const nextAllowed = roles.filter((r: string) => r !== roleToDelete);
                return { ...sub, allowedRoles: nextAllowed, roles: nextAllowed };
              });
            }

            const roles = item.allowedRoles || item.roles || [];
            const nextAllowed = roles.filter((r: string) => r !== roleToDelete);
            return { ...item, allowedRoles: nextAllowed, roles: nextAllowed, subItems: updatedSubItems };
          });
          return { ...sec, items: updatedItems };
        });

        const shopRef = doc(db, 'settings', currentShopId);
        await updateDoc(shopRef, {
          rolesList: nextRoles,
          'sidebarConfig.sections': updatedSections
        });

        // Also set to master settings if master admin
        const isMasterAdmin = user?.email?.toLowerCase().trim() === 'stratproamz@gmail.com' || user?.role === 'master_admin';
        if (isMasterAdmin) {
          try {
            await updateDoc(doc(db, 'settings', 'master'), {
              rolesList: nextRoles,
              'sidebarConfig.sections': updatedSections
            });
          } catch (e) {
            console.error('Master write error:', e);
          }
        }

        setNotification({
          type: 'success',
          message: isBn ? 'রোলটি সফলভাবে ডিলিট করা হয়েছে!' : 'Role deleted successfully!'
        });
      } catch (err: any) {
        setNotification({ type: 'error', message: err.message || 'Failed to delete role.' });
      }
    }
  };

  // Manage Business Category (Tab 3 Handler)
  const handleSaveBusinessType = async (bType: string) => {
    setSelectedBusinessType(bType);
    try {
      const shopRef = doc(db, 'settings', currentShopId);
      await updateDoc(shopRef, {
        businessType: bType
      });

      // Also set to master settings if master admin
      const isMasterAdmin = user?.email?.toLowerCase().trim() === 'stratproamz@gmail.com' || user?.role === 'master_admin';
      if (isMasterAdmin) {
        try {
          await updateDoc(doc(db, 'settings', 'master'), {
            businessType: bType
          });
        } catch (e) {
          console.error('Master write error:', e);
        }
      }

      setNotification({
        type: 'success',
        message: isBn ? 'ব্যবসায়িক ক্ষেত্র সফলভাবে আপডেট করা হয়েছে!' : 'Operational business field updated successfully!'
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to update business field.' });
    }
  };

  // Filtered staff based on role & search
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchText.toLowerCase()) || 
                          (s.phone || '').includes(searchText) ||
                          (s.email || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || s.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Overview Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{isBn ? 'সক্রিয় কাস্টম রোল' : 'Active Custom Roles'}</span>
            <span className="text-xl font-black text-slate-800 dark:text-white">{ALL_ROLES.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{isBn ? 'মোট স্টাফ / কর্মী' : 'Total Registered Staff'}</span>
            <span className="text-xl font-black text-slate-800 dark:text-white">{staffList.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{isBn ? 'মোট পেজ ও রুট' : 'Managed Pages & Routes'}</span>
            <span className="text-xl font-black text-slate-800 dark:text-white">{allCustomPages.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{isBn ? 'সুপার এডমিন বাইপাস' : 'Super Admin Bypass'}</span>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-lg inline-block mt-0.5 uppercase tracking-wider">ACTIVE (সক্রিয়)</span>
          </div>
        </div>
      </div>

      {/* Main Container of three tabs */}
      <div className="space-y-4">
        {/* Navigation Tabs Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl gap-1 select-none border border-slate-200/50 dark:border-slate-800/80 max-w-2xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('access')}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'access'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            {isBn ? 'অ্যাক্সেস পারমিশন ও স্টাফ' : 'Access & Staff'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('roles')}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'roles'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {isBn ? 'কাস্টম রোলস ও রুলস' : 'Custom Roles & Security'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('business')}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'business'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Building className="w-4 h-4" />
            {isBn ? 'ব্যবসায়িক ক্ষেত্র মডিউল' : 'Business Category'}
          </button>
        </div>

        {/* Tab Contents with animations */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'access' && (
            <motion.div
              key="tab-access"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Role Permissions Matrix Grid (Left 2 Columns) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-slate-850">
                  <div>
                    <h2 className="text-sm font-black text-gray-850 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      {isBn ? 'রোলভিত্তিক পেজ অ্যাক্সেস ম্যাট্রিক্স' : 'Role-based Page Access Matrix'}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      {isBn ? 'কোন রোল কোন পেজ দেখতে পাবে তা এখান থেকে টিক দিয়ে নির্ধারণ করুন' : 'Check the boxes to grant or restrict page visibility dynamically'}
                    </p>
                  </div>
                  {isUpdatingMatrix && (
                    <span className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-black uppercase">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Updating...
                    </span>
                  )}
                </div>

                {/* Matrix Table */}
                <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        <th className="p-3.5 pl-4 min-w-[180px]">{isBn ? 'পেইজের নাম ও রুট আইডি' : 'Page Name & Route'}</th>
                        {ALL_ROLES.map((role: string) => (
                          <th key={role} className="p-3.5 text-center min-w-[90px] lowercase font-mono">
                            {role}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-850">
                      {allCustomPages.map((page: any) => {
                        const allowedRoles = page.allowedRoles || page.roles || [];
                        return (
                          <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                            <td className="p-3 pl-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-850 dark:text-slate-200">
                                  {isBn && page.label_bn ? page.label_bn : page.label}
                                </span>
                              </div>
                              <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider mt-0.5">ID: {page.id}</span>
                            </td>
                            {ALL_ROLES.map((role: string) => {
                              const isAllowed = allowedRoles.includes(role);
                              return (
                                <td key={role} className="p-3 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isAllowed}
                                    onChange={(e) => handleTogglePageRole(page.id, role, e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer dark:bg-slate-900"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Registered Staff / Users list with Roles */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-black text-gray-850 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    {isBn ? 'স্টাফ ও রোল ডিরেক্টরি' : 'Staff Role Directory'}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                    {isBn ? 'আপনার দোকানের কর্মীদের তালিকা ও তাদের সক্রিয় রোল' : 'List of registered shop employees and their active permissions role'}
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={isBn ? 'নাম বা মোবাইল দিয়ে খুঁজুন...' : 'Search staff...'}
                    className="w-full pl-9 pr-3 py-2 border border-gray-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl text-xs outline-none focus:border-indigo-500 transition-colors dark:text-gray-200"
                  />
                </div>

                {/* Role Filter tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
                  <button 
                    onClick={() => setSelectedRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition shrink-0 ${
                      selectedRoleFilter === 'all'
                        ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'bg-slate-50 dark:bg-slate-950 text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  {ALL_ROLES.map((role: string) => (
                    <button 
                      key={role}
                      onClick={() => setSelectedRoleFilter(role)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition font-mono shrink-0 ${
                        selectedRoleFilter === role
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {/* Staff directory cards */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {filteredStaff.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-xs uppercase font-bold">
                      {isBn ? 'কোনো কর্মী পাওয়া যায়নি।' : 'No employees match filters.'}
                    </div>
                  ) : (
                    filteredStaff.map((staff: any) => {
                      const branchName = branches.find(b => b.id === staff.branchId)?.name || (staff.branchId === 'b_wh' ? 'Warehouse' : 'Global');
                      return (
                        <div key={staff.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xs font-black text-gray-800 dark:text-slate-200 uppercase tracking-tight">{staff.name}</h3>
                              <p className="text-[9px] font-mono text-gray-400 mt-0.5">{staff.phone}</p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 px-2 py-0.5 rounded-lg font-mono">
                              {staff.role || 'No Role'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-gray-400 pt-1.5 border-t border-dashed border-gray-100 dark:border-slate-800/80 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-gray-400" />
                              {branchName}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md ${
                              staff.status === 'online' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-500'
                            }`}>
                              ● {staff.status || 'offline'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'roles' && (
            <motion.div
              key="tab-roles"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
              {/* Custom Roles & Security Rules Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Custom Roles &amp; Security Rules
                </h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                  {isBn 
                    ? 'আপনার ব্যবসার কাস্টম রোলসমূহ যুক্ত, পরিবর্তন অথবা ডিলিট করুন। এই রোলসমূহ ব্যবহার করে আলাদা পেজের অ্যাক্সেস কন্ট্রোল করতে পারবেন:'
                    : 'Create, edit, or delete custom roles for your business. These custom roles will regulate page visibility permissions:'}
                </p>

                {/* List of custom roles with animation */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {ALL_ROLES.map((role: string) => (
                    <div key={role} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 rounded-xl">
                      {editingRoleName === role ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input 
                            type="text"
                            value={newRoleEditValue}
                            onChange={(e) => setNewRoleEditValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            className="flex-1 px-2.5 py-1.5 border border-indigo-200 rounded-lg text-xs outline-none dark:bg-slate-900 dark:text-white font-bold"
                            placeholder="e.g. accounts"
                            autoFocus
                          />
                          <button 
                            type="button"
                            onClick={() => handleSaveRoleEdit(role)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer"
                            title="Save Rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingRoleName(null)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                            title="Cancel"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">{role}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              type="button" 
                              onClick={() => {
                                setEditingRoleName(role);
                                setNewRoleEditValue(role);
                              }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition" 
                              title="Rename Role"
                            >
                              <SquarePen className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteRole(role)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition" 
                              title="Delete Role"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Role Form */}
                <div className="flex gap-2 pt-1">
                  <input 
                    placeholder={isBn ? 'নতুন রোলের নাম (যেমন: accounts)' : 'New role name (e.g. accounts)'}
                    className="flex-1 px-3 py-2 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl text-xs outline-none focus:border-indigo-500 transition-colors dark:text-gray-200 font-bold" 
                    type="text" 
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddRole}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm shadow-emerald-600/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isBn ? 'যোগ করুন' : 'Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'business' && (
            <motion.div
              key="tab-business"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-500" />
                  {isBn ? 'ব্যবসায়িক ক্ষেত্র ও কাস্টম মডিউল' : 'Operational Business Field & Modules'}
                </h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                  {isBn
                    ? 'আপনার ব্যবসার ক্ষেত্র পরিবর্তন করলে সেই অনুযায়ী POS স্কিম ও প্রয়োজনীয় ডাটা মডেলগুলো সাজানো হবে:'
                    : 'Select your operational business category to tailor customized POS interfaces and data models:'}
                </p>

                {/* Business Type Selector Dropdown */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none font-sans">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      Operational Business Field / ব্যবসায়িক ক্ষেত্র <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="businessType" 
                      value={selectedBusinessType}
                      onChange={(e) => handleSaveBusinessType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-indigo-50/10 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 font-bold transition-all cursor-pointer shadow-xs text-sm"
                    >
                      <option value="Retail">Retail Store / সাধারণ রিটেল ও মুদি দোকান</option>
                      <option value="Restaurant">Restaurant / রেস্টুরেন্ট ও কফি শপ</option>
                      <option value="Electronics">Electronics / মোবাইল ও ইলেকট্রনিক্স শপ</option>
                      <option value="Pharmacy">Pharmacy / মেডিসিন ও ফার্মেসি</option>
                      <option value="Dealer">Dealer / ডিলারশিপ ও পাইকারি ব্যবসা</option>
                    </select>
                    <p className="text-[10px] text-indigo-400 font-bold mt-1 select-none">
                      Choosing a category configures dynamic POS schemes and customized data models.
                    </p>
                  </div>

                  {/* Dynamic Modules Display Grid depending on selected type */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      {isBn ? 'এই শিল্পের জন্য প্রস্তাবিত মডিউলসমূহ' : 'Recommended Industry Modules'}
                    </div>

                    {selectedBusinessType === 'Retail' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'রিটেল কুইক বিলিং ও বারকোড সেল' : 'Retail Quick Billing & Barcode Sales'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Fast, optimized barcode-scanning workflow for general retail items.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'বারকোড লেবেল জেনারেটর' : 'Barcode Label Generator'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Design and print custom prices and barcode stickers for unbranded inventory items.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'সাপ্লায়ার ইনভেন্টরি ট্র্যাকার' : 'Supplier Inventory Tracker'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Track supplier orders, purchase logs, and accounts payable histories seamlessly.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBusinessType === 'Restaurant' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'KOT কিচেন ডিসপ্লে সিস্টেম (KDS)' : 'KOT Kitchen Display System (KDS)'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Send active order tickets directly to the chef’s display with dynamic progress statuses.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'টেবিল ম্যানেজমেন্ট ও ফ্লোর লেআউট' : 'Table Management & Floor Layout'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Visualize active tables, book guest seating, and track food service billing by table.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'রেসিপি উপাদান ও খাদ্য তালিকা (BOM)' : 'Recipe Ingredients & Menu Card (BOM)'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Auto-deduct raw material ingredients from warehouse stocks upon dish order completions.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBusinessType === 'Electronics' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'IMEI ও ডিভাইস সিরিয়াল রেজিস্টার' : 'IMEI & Device Serial Register'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Track unique device identifier serial numbers and unique IMEIs for mobile phones.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'ওয়ারেন্টি ট্র্যাকিং ও ক্লেম ম্যানেজমেন্ট' : 'Warranty Tracking & Claims'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Track product-wise warranties, expired policies, and customer return claim workflows.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'সার্ভিসিং ও রিপেয়ারিং ডেক্স' : 'Servicing & Repair Desk'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Assign technician tasks, estimate repairing costs, and trigger SMS updates on delivery readiness.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBusinessType === 'Pharmacy' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'মেডিসিন জেনেরিক ও ব্র্যান্ড ম্যাপিং' : 'Medicine Generic & Brand Mapping'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Suggest generic alternatives for prescription brand-name medicine items easily.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'মেয়াদোত্তীর্ণ এলার্ট ও শেলফ লোকেটার' : 'Expiry Alert & Drug Shelf Locator'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Get early alerts for batch expiry and track specific shelf coordinates of medication boxes.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'প্রেসক্রিপশন রেজিস্টার ও ড্রাগ লগ' : 'Prescription Register & Drug Logs'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Log high-control drugs with doctor references and store uploaded customer prescription files.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBusinessType === 'Dealer' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'পাইকারি কাস্টমার ও ডিলারশিপ লেজার' : 'Wholesale Customer & Dealer Ledger'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Manage credit lines, special distributor pricing grids, and long-term buyer ledgers.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'ডিলার এজেন্ট কমিশন ম্যাট্রিক্স' : 'Dealer Agent Commission Matrix'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Calculate sales agent commissions, dynamic target points, and reward distributions.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{isBn ? 'ডেলিভারি চালান ও ট্রাক ট্র্যাকিং' : 'Delivery Challan & Fleet Tracking'}</span>
                            <p className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">Track route delivery invoices, cargo loadings, vehicle fleet dispatches, and delivery status logs.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
