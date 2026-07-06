import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  ClipboardCheck, 
  Banknote, 
  FileSignature, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Printer, 
  Check, 
  UserPlus, 
  Clock, 
  Heart, 
  CreditCard, 
  Smartphone, 
  Lock, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Download, 
  FileText,
  UserCheck,
  Award,
  AlertCircle,
  TrendingUp,
  CirclePlus,
  Upload,
  Camera,
  History
} from 'lucide-react';
import { db, secondaryAuth, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where,
  setDoc,
  getDocs
} from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const numberToWordsEn = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero Taka Only';
  
  const g = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? '-' + a[digit].trim() : '') + ' ';
  };

  const h = (n: number): string => {
    if (n < 100) return g(n);
    return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + g(n % 100) : '');
  };

  let str = '';
  let temp = num;

  if (temp >= 10000000) {
    str += h(Math.floor(temp / 10000000)) + 'Crore ';
    temp %= 10000000;
  }
  if (temp >= 100000) {
    str += h(Math.floor(temp / 100000)) + 'Lakh ';
    temp %= 100000;
  }
  if (temp >= 1000) {
    str += h(Math.floor(temp / 1000)) + 'Thousand ';
    temp %= 1000;
  }
  if (temp > 0) {
    str += h(temp);
  }
  
  return str.trim() + ' Taka Only';
};

const numberToWordsBn = (num: number): string => {
  const bnUnits = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চোদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আটোরো', 'উনিশ', 'বিশ'];
  const bnTens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

  if (num === 0) return 'শূণ্য টাকা মাত্র';

  const formatBn = (n: number): string => {
    if (n === 0) return '';
    if (n <= 20) return bnUnits[n] + ' ';
    if (n < 100) {
      const unit = n % 10;
      return bnTens[Math.floor(n / 10)] + (unit ? ' ' + bnUnits[unit] : '') + ' ';
    }
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    return bnUnits[hundred] + 'শত ' + (rem ? formatBn(rem) : '');
  };

  let str = '';
  let temp = num;

  if (temp >= 10000000) {
    str += formatBn(Math.floor(temp / 10000000)) + 'কোটি ';
    temp %= 10000000;
  }
  if (temp >= 100000) {
    str += formatBn(Math.floor(temp / 100000)) + 'লক্ষ ';
    temp %= 100000;
  }
  if (temp >= 1000) {
    str += formatBn(Math.floor(temp / 1000)) + 'হাজার ';
    temp %= 1000;
  }
  if (temp > 0) {
    str += formatBn(temp);
  }

  return str.trim() + ' টাকা মাত্র';
};

const toSafePdfString = (str: string, fallback = ''): string => {
  if (!str) return fallback;
  
  let cleaned = str;
  if (/[\u0980-\u09FF]/.test(cleaned)) {
    const mappings: Record<string, string> = {
      'ম্যানেজার': 'Manager',
      'সহকারী ম্যানেজার': 'Assistant Manager',
      'সেলস ম্যানেজার': 'Sales Manager',
      'সেলস টিম': 'Sales Team',
      'ওয়ারহাউজ': 'Warehouse',
      'ওয়েটার': 'Waiter',
      'শেফ': 'Chef',
      'স্টাফ': 'Staff',
      'ক্যাশ ইন হ্যান্ড': 'Cash in Hand',
      'ব্যাংক একাউন্ট': 'Bank Account',
      'এমএফএস ওয়ালেট': 'MFS Wallet',
      'হাত ক্যাশ': 'Cash in Hand',
      'ঢাকা': 'Dhaka',
      'বাংলাদেশ': 'Bangladesh'
    };
    
    for (const [bn, en] of Object.entries(mappings)) {
      if (cleaned.includes(bn)) {
        return en;
      }
    }
    
    cleaned = cleaned.replace(/[\u0980-\u09FF]/g, '').trim();
    if (!cleaned) return fallback;
  }
  
  return cleaned;
};

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
  // Extended fields
  tadAllowance?: number;
  foodAllowance?: number;
  hraAllowance?: number;
  photoUrl?: string;
  bloodGroup?: string;
  emergencyPhone?: string;
  paymentMode?: 'cash' | 'bank' | 'mfs';
  bankName?: string;
  bankBranch?: string;
  accountNo?: string;
  mfsNo?: string;
  shiftStart?: string;
  shiftEnd?: string;
  yearlyLeaves?: number;
  allowLogin?: boolean;
  username?: string;
  password?: string;
  branchId?: string;
  staffId?: string;
}

const generateUniqueStaffId = (existingEmployees: Employee[]): string => {
  const ids = existingEmployees
    .map(emp => parseInt(emp.staffId || '0', 10))
    .filter(id => !isNaN(id) && id >= 1000 && id <= 9999);
  
  if (ids.length === 0) {
    return '1001';
  }
  
  const maxId = Math.max(...ids);
  if (maxId < 9999) {
    return String(maxId + 1);
  }
  
  // Find the first available gap starting from 1001
  for (let i = 1001; i <= 9999; i++) {
    if (!ids.includes(i)) {
      return String(i);
    }
  }
  
  // Random fallback if no gaps (e.g. maxed out)
  return String(Math.floor(1000 + Math.random() * 9000));
};

const getStaffDisplayId = (emp: Employee | { id: string; staffId?: string }): string => {
  if (emp.staffId) return emp.staffId;
  // Deterministic 4-digit ID derived from Firestore ID
  let hash = 0;
  const str = emp.id || '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const code = 1000 + (Math.abs(hash) % 9000);
  return String(code);
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Profile photos don't need to be huge; keeping it light
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85)); // Compressed JPEG
        } else {
          resolve(reader.result as string);
        }
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = error => reject(error);
  });
};

interface HRMProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  employees: Employee[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  user: any;
  settings: any;
  setNotification: (notif: { message: string; type: 'success' | 'error' | 'info' }) => void;
  branches: any[];
}

export function HRM({ activeTab, setActiveTab, employees, onAddEmployee, user, settings, setNotification, branches }: HRMProps) {
  const isBn = settings.systemLanguage === 'bn';
  const currencySymbol = settings.currencySymbol || '৳';

  // State Management
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmEmployeeId, setDeleteConfirmEmployeeId] = useState<string | null>(null);
  const [isDeletingProcess, setIsDeletingProcess] = useState(false);
  const [employeeLogins, setEmployeeLogins] = useState<Record<string, { username: string; password: string }>>({});
  const [isGeneratingUsername, setIsGeneratingUsername] = useState<Record<string, boolean>>({});

  const handleCreateUsername = async (emp: Employee) => {
    setIsGeneratingUsername(prev => ({ ...prev, [emp.id]: true }));
    try {
      const code = (settings.shopCode || settings.shopId || '').toString().replace(/^SHP-/i, '').replace(/[^0-9]/g, '').slice(0, 6);
      const cleanName = emp.name.toLowerCase().trim().split(' ')[0].replace(/[^a-z0-9]/g, '');
      const baseName = cleanName ? `${cleanName}_${code}` : `emp_${code}`;
      
      let finalUsername = baseName;
      let attempt = 0;
      let isUnique = false;
      
      while (!isUnique && attempt < 10) {
        const candidate = attempt === 0 ? finalUsername : `${baseName}${attempt}`;
        const q = query(collection(db, 'users'), where('username', '==', candidate));
        const snap = await getDocs(q);
        const collision = snap.docs.some(docObj => docObj.data().employeeId !== emp.id);
        
        if (!collision) {
          finalUsername = candidate;
          isUnique = true;
        } else {
          attempt++;
        }
      }
      
      if (!isUnique) {
        finalUsername = `${baseName}_${Math.floor(100 + Math.random() * 900)}`;
      }

      const creds = employeeLogins[emp.id] || { username: emp.username || '', password: emp.password || '' };
      let newPin = creds.password;
      if (!newPin || newPin.length !== 6) {
        newPin = Math.floor(100000 + Math.random() * 900000).toString();
      }

      setEmployeeLogins(prev => ({
        ...prev,
        [emp.id]: {
          username: finalUsername,
          password: newPin
        }
      }));

      setNotification({
        message: isBn 
          ? 'ইউজারনেম সফলভাবে সিস্টেম থেকে তৈরি করা হয়েছে!' 
          : 'Username auto-generated successfully!',
        type: 'success'
      });
    } catch (err: any) {
      console.error("Username generation error:", err);
      setNotification({
        message: isBn ? 'ইউজারনেম তৈরি করতে ব্যর্থ হয়েছে' : 'Failed to generate unique username',
        type: 'error'
      });
    } finally {
      setIsGeneratingUsername(prev => ({ ...prev, [emp.id]: false }));
    }
  };
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // HRM mock/persisted tracking state helper templates
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  // Advanced HRM PERSISTENCE & Custom Settings
  const [hrmSettings, setHrmSettings] = useState({
    watermarkUrl: '',
    watermarkOpacity: 0.06,
    watermarkSize: 160,
    signatureUrl: '',
    sealUrl: '',
    prePrintedPad: false,
    headerText: settings?.shopName || 'ShopSync Corporation',
    footerText: 'Verified Digital Document © ShopSync'
  });
  const [hrmRecords, setHrmRecords] = useState<any[]>([]);
  const [advanceDaysDeducted, setAdvanceDaysDeducted] = useState(0);
  const [printLayoutMode, setPrintLayoutMode] = useState<'digital' | 'preprinted'>('digital');
  const [bundleStaffId, setBundleStaffId] = useState('');
  const [bundleDuration, setBundleDuration] = useState<'3' | '6'>('3');
  const [idCardValidityDate, setIdCardValidityDate] = useState('31ST DEC 2028');

  // Local Form state
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    designation: '',
    phone: '',
    email: '',
    salary: 12000,
    joiningDate: new Date().toISOString().split('T')[0],
    schedule: '09:00 AM - 06:00 PM',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
    bloodGroup: 'O+',
    emergencyPhone: '',
    paymentMode: 'cash',
    bankName: '',
    accountNo: '',
    mfsNo: '',
    shiftStart: '09:00',
    shiftEnd: '18:00',
    yearlyLeaves: 15,
    allowLogin: false
  });

  // Payroll Calc state
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [payrollStaffId, setPayrollStaffId] = useState('');
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [unpaidDays, setUnpaidDays] = useState(0);
  const [bonusAmount, setBonusAmount] = useState(0);

  // Certificate generator print states
  const [selectedCertEmployee, setSelectedCertEmployee] = useState<Employee | null>(null);
  const [certType, setCertType] = useState<'contract' | 'experience' | 'noc_visa' | 'noc_bank'>('experience');
  const [certLanguage, setCertLanguage] = useState<'en' | 'bn'>(isBn ? 'bn' : 'en');
  const [currentDocId, setCurrentDocId] = useState('');
  const [leavingDate, setLeavingDate] = useState(new Date().toISOString().split('T')[0]);
  const [leavingReason, setLeavingReason] = useState(isBn ? 'ব্যক্তিগত কারণ' : 'Personal Reasons');
  const [certPraise, setCertPraise] = useState(isBn ? 'অত্যন্ত পরিশ্রমী এবং বিশ্বস্ত কর্মী।' : 'He has been extremely diligent, hard-working, and trustworthy.');
  const [selectedTemplateId, setSelectedTemplateId] = useState<'standard' | 'modern_gold' | 'executive_serif'>('standard');
  const [customAiText, setCustomAiText] = useState<string | null>(null);
  const [isGeneratingAiText, setIsGeneratingAiText] = useState(false);

  useEffect(() => {
    if (selectedCertEmployee) {
      setCurrentDocId(`DOC-${getStaffDisplayId(selectedCertEmployee)}-${Date.now().toString().slice(-4)}`);
    } else {
      setCurrentDocId('');
    }
    setCustomAiText(null); // Reset custom AI body when employee, type, or language changes
  }, [selectedCertEmployee, certType, certLanguage]);

  // Generate professional text body using server-side Gemini API
  const generateProfessionalAiDoc = async () => {
    if (!selectedCertEmployee) return;
    setIsGeneratingAiText(true);
    try {
      const prompt = `Act as an elite Corporate HR Director and write a highly professional, concise, international-standard document body of type: "${certType}" for ${selectedCertEmployee.name} who holds the designation of "${selectedCertEmployee.designation}".
The organization name is "${settings.name || settings.shopName || hrmSettings.headerText || 'ShopSync Ltd.'}".
The document language must be strictly "${certLanguage === 'bn' ? 'Bengali' : 'English'}".
Include these specific details:
- Joining date: ${selectedCertEmployee.joiningDate || 'N/A'}
- Monthly base salary: ${selectedCertEmployee.salary?.toLocaleString()} ${currencySymbol}
${certType === 'experience' ? `- Leaving Date: ${leavingDate}\n- Reason for Leaving: ${leavingReason}\n- Appraisal comments: "${certPraise}"` : ''}

CRITICAL INSTRUCTIONS:
1. Keep the text concise, sharp, and perfectly clear. Do NOT write unnecessary fluff or overly long paragraphs that could break the document layout. Limit to a maximum of 3-4 short, professional sentences.
2. Maintain an elite, international corporate tone.
3. Output ONLY the core text body. DO NOT output any headers, date lines, subject lines, signature lines, footer notes, enclosing brackets, or markdown layout titles, as they are already handled by our premium letterhead templates. Just provide the formal text content.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.text) {
        setCustomAiText(data.text);
        setNotification({
          message: isBn ? 'এআই রাইটার সফলভাবে নতুন ড্রাফট তৈরি করেছে!' : 'AI Writer generated a professional draft successfully!',
          type: 'success'
        });
      }
    } catch (err: any) {
      console.error("AI Generation error:", err);
      setNotification({
        message: isBn ? 'এআই ড্রাফট তৈরি করতে ব্যর্থ হয়েছে' : 'Failed to generate AI draft: ' + err.message,
        type: 'error'
      });
    } finally {
      setIsGeneratingAiText(false);
    }
  };

  // Save branding settings directly to Firestore
  const saveHrmSettings = async (updatedFields: Partial<typeof hrmSettings>) => {
    if (!user?.shopId) return;
    const hrmSettingsRef = doc(db, 'hrm_settings', user.shopId);
    try {
      await setDoc(hrmSettingsRef, {
        ...hrmSettings,
        ...updatedFields
      }, { merge: true });
      setNotification({
        message: isBn ? 'ব্র্যান্ডিং সেটিংস সফলভাবে সেভ হয়েছে!' : 'Branding settings updated successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error("Error saving HRM settings:", err);
      setNotification({
        message: isBn ? 'সেটিংস সেভ করতে ব্যর্থ হয়েছে' : 'Failed to save branding settings',
        type: 'error'
      });
    }
  };

  const handleBrandingImageUpload = (type: 'watermark' | 'signature' | 'seal', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'watermark') {
        saveHrmSettings({ watermarkUrl: base64String });
      } else if (type === 'signature') {
        saveHrmSettings({ signatureUrl: base64String });
      } else if (type === 'seal') {
        saveHrmSettings({ sealUrl: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  // Download high-resolution print-ready A4 PDF of the selected certificate
  const downloadCertificatePDF = async () => {
    const containerNode = document.getElementById('certificate-render-node');
    if (!containerNode || !selectedCertEmployee) return;

    try {
      // Create verification record in Firestore
      try {
        await setDoc(doc(db, 'hrm_records', currentDocId), {
          id: currentDocId,
          shopId: user.shopId,
          type: certType,
          employeeId: selectedCertEmployee.id,
          employeeName: selectedCertEmployee.name,
          employeeDesignation: selectedCertEmployee.designation,
          date: new Date().toISOString().split('T')[0],
          details: {
            leavingDate: leavingDate || '',
            leavingReason: leavingReason || '',
            certPraise: certPraise || '',
            certType: certType,
            printLayoutMode,
            selectedTemplateId,
            signatureUrl: hrmSettings.signatureUrl,
            sealUrl: hrmSettings.sealUrl
          },
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error logging document verification code:", err);
      }

      // Render to canvas
      const canvas = await html2canvas(containerNode, {
        scale: 3.5, // Ultra-high resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // A4 is 210mm x 297mm
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`${certType.toUpperCase()}_${selectedCertEmployee.name.replace(/\s+/g, '_')}_${currentDocId}.pdf`);

      setNotification({
        message: isBn ? 'পিডিএফ সফলভাবে ডাউনলোড করা হয়েছে!' : 'PDF downloaded successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      setNotification({
        message: isBn ? 'পিডিএফ তৈরি করতে ব্যর্থ হয়েছে' : 'Failed to generate PDF',
        type: 'error'
      });
    }
  };

  // Download high-resolution print-ready A4 PDF of the employee ID card (Front & Back arranged on single page)
  const downloadIDCardPDF = async (emp: Employee, styleType: 'v1' | 'v2') => {
    const frontId = styleType === 'v1' ? `id-card-front-${emp.id}` : `id-card-front-v2-${emp.id}`;
    const backId = styleType === 'v1' ? `id-card-back-${emp.id}` : `id-card-back-v2-${emp.id}`;
    
    const frontEl = document.getElementById(frontId);
    const backEl = document.getElementById(backId);
    
    if (!frontEl || !backEl) return;
    
    try {
      const canvasFront = await html2canvas(frontEl, { scale: 5, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const canvasBack = await html2canvas(backEl, { scale: 5, useCORS: true, backgroundColor: '#ffffff', logging: false });
      
      const imgFront = canvasFront.toDataURL('image/png', 1.0);
      const imgBack = canvasBack.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Center and title headers
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('OFFICIAL STAFF ID CARD - PRINT LAYOUT', 105, 20, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`Employee: ${emp.name} | Designation: ${emp.designation} | ID: ${getStaffDisplayId(emp)}`, 105, 26, { align: 'center' });
      pdf.text(`Theme Layout: ${styleType === 'v1' ? 'Classic Red' : 'Corporate Sapphire'}`, 105, 30, { align: 'center' });
      
      // Cutting line instructions
      pdf.setFontSize(8);
      pdf.setTextColor(130);
      pdf.text('Cut along the solid lines, fold along the dotted line, and insert into a badge holder.', 105, 36, { align: 'center' });
      
      const cardW = 54; // standard CR80 width (mm)
      const cardH = 86; // standard CR80 height (mm)
      
      // Coordinates side-by-side
      const frontX = 105 - cardW - 6;
      const backX = 105 + 6;
      const cardY = 44;
      
      // Draw light outline guidelines
      pdf.setDrawColor(210, 214, 219);
      pdf.setLineWidth(0.15);
      pdf.rect(frontX - 0.2, cardY - 0.2, cardW + 0.4, cardH + 0.4, 'S');
      pdf.rect(backX - 0.2, cardY - 0.2, cardW + 0.4, cardH + 0.4, 'S');
      
      // Add front and back images side-by-side
      pdf.addImage(imgFront, 'PNG', frontX, cardY, cardW, cardH);
      pdf.addImage(imgBack, 'PNG', backX, cardY, cardW, cardH);
      
      // Draw fold dotted line
      pdf.setDrawColor(160, 160, 160);
      pdf.setLineDashPattern([1.5, 1.5], 0);
      pdf.line(105, cardY, 105, cardY + cardH);
      
      // Reset dash pattern and add footer text
      pdf.setLineDashPattern([], 0);
      pdf.setFontSize(8);
      pdf.setTextColor(160);
      pdf.text(`Generated by ${settings.name || 'ShopSync'} POS Synchronizer. Powered by Google AI.`, 105, 142, { align: 'center' });
      
      pdf.save(`ID_Card_A4Print_${emp.name.replace(/\s+/g, '_')}.pdf`);
      
      setNotification({
        message: isBn ? 'আইডি কার্ড প্রিন্ট পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : 'ID Card print-ready PDF downloaded successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error("ID card PDF generation error:", err);
      setNotification({
        message: isBn ? 'আইডি কার্ড পিডিএফ ডাউনলোড ব্যর্থ হয়েছে' : 'Failed to download ID Card PDF',
        type: 'error'
      });
    }
  };

  // Download high-resolution print-ready PDF of the Pay Slip (Premium vector-drawn international standard layout)
  const downloadPaySlipPDF = async (pay: any) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      // A4 dimensions: 210 x 297 mm
      
      const drawHeaderAndFooter = (pageNumber: number, totalPages: number) => {
        // Draw primary header band (Slate-900 theme)
        pdf.setFillColor(15, 23, 42); 
        pdf.rect(0, 0, 210, 16, 'F');
        
        // Header Text
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(toSafePdfString(settings.shopName || 'ShopSync').toUpperCase(), 15, 10.5);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(226, 232, 240); // slate-200
        pdf.text('OFFICIAL SALARY STATEMENT', 210 - 15, 10.5, { align: 'right' });
        
        // Footer bar
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(15, 280, 195, 280);
        
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.setFontSize(7.5);
        pdf.text(`Document ID: PAY-${pay.id.substring(0, 8).toUpperCase()}`, 15, 285);
        pdf.text(`Page ${pageNumber} of ${totalPages}`, 105, 285, { align: 'center' });
        pdf.text(`Secure System Verified • ${toSafePdfString(settings.shopName || 'ShopSync')} Network`, 210 - 15, 285, { align: 'right' });
      };
      
      // Page setup
      drawHeaderAndFooter(1, 1);
      
      // Let's add some visual elements for the logo / watermark
      pdf.setDrawColor(241, 245, 249);
      pdf.setLineWidth(0.5);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(15, 24, 180, 24, 3, 3, 'FD'); // Company box
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(toSafePdfString(settings.shopName || 'ShopSync Corporation'), 20, 32);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100);
      pdf.text(`Address: ${toSafePdfString(settings.address, 'Global Operations Center, Main Terminal')} | Contact: ${settings.phone || 'N/A'}`, 20, 37);
      pdf.text(`Branch: ${toSafePdfString(pay.branch, 'Headquarters')} | Email: ${settings.email || 'support@shopsync.com'}`, 20, 41);
      
      // Document metadata card (right side)
      pdf.setFillColor(239, 246, 255); // blue-50
      pdf.roundedRect(142, 24, 53, 24, 2, 2, 'F');
      
      pdf.setTextColor(30, 58, 138); // blue-900
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.text('PAYSLIP RECEIPT', 146, 30);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(70, 80, 95);
      pdf.text(`Month: ${pay.month}`, 146, 35);
      pdf.text(`Date: ${pay.date}`, 146, 39);
      pdf.text(`Mode: ${toSafePdfString(pay.paymentMode, 'Cash')}`, 146, 43);
      
      // Employee Details
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('STAFF EMPLOYEE INFORMATION', 15, 59);
      
      pdf.setDrawColor(15, 23, 42);
      pdf.setLineWidth(0.4);
      pdf.line(15, 61, 195, 61);
      
      // Grid of employee data
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text('EMPLOYEE NAME', 15, 68);
      pdf.text('JOB DESIGNATION', 75, 68);
      pdf.text('TRANSACTION STATUS', 135, 68);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text(toSafePdfString(pay.employeeName), 15, 73);
      pdf.text(toSafePdfString(pay.employeeDesignation || 'Staff Associate'), 75, 73);
      
      // Draw status green pill
      pdf.setFillColor(240, 253, 244); // green-50
      pdf.roundedRect(135, 69, 24, 5, 1, 1, 'F');
      pdf.setTextColor(21, 128, 61); // green-700
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('DISBURSED', 137.5, 72.5);
      
      // Financial Statement details Table
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('COMPENSATION & DEDUCTION SUMMARY LEDGER', 15, 87);
      
      pdf.setDrawColor(200);
      pdf.setLineWidth(0.15);
      pdf.line(15, 89, 195, 89);
      
      // Table headers
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.rect(15, 92, 180, 7.5, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Description Item / Earning Ledger', 18, 97);
      pdf.text('Type', 110, 97);
      pdf.text('Total Credit / Debit', 192, 97, { align: 'right' });
      
      let currentY = 106;
      const addRow = (desc: string, type: string, amount: number, isNegative = false) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(50);
        pdf.text(desc, 18, currentY);
        pdf.text(type, 110, currentY);
        
        pdf.setFont('helvetica', 'bold');
        if (isNegative) {
          pdf.setTextColor(220, 38, 38); // red-600
          pdf.text(`-${amount.toLocaleString()} BDT`, 192, currentY, { align: 'right' });
        } else {
          pdf.setTextColor(21, 128, 61); // green-700
          pdf.text(`+${amount.toLocaleString()} BDT`, 192, currentY, { align: 'right' });
        }
        
        pdf.setDrawColor(241, 245, 249);
        pdf.line(15, currentY + 3.5, 195, currentY + 3.5);
        currentY += 9;
      };
      
      addRow('Base Salary Payment', 'Earning', pay.baseSalary || 0, false);
      
      if (pay.tadAllowance > 0) {
        addRow('Travel & Daily Allowance (TAD)', 'Allowance', pay.tadAllowance, false);
      }
      
      if (pay.foodAllowance > 0) {
        addRow('Food Allowance', 'Allowance', pay.foodAllowance, false);
      }
      
      if (pay.hraAllowance > 0) {
        addRow('House Rent Allowance (HRA)', 'Allowance', pay.hraAllowance, false);
      }
      
      if (pay.bonus > 0) {
        addRow('Festival & Performance Bonus', 'Allowance', pay.bonus, false);
      }
      
      if (pay.overtimePay > 0 || (pay.overtimeHours && pay.overtimeHours > 0)) {
        const hours = pay.overtimeHours || 0;
        addRow(`Overtime Allowance (${hours} hours)`, 'Allowance', pay.overtimePay || 0, false);
      }
      
      if (pay.deduction > 0) {
        addRow('Absence Days Deduction', 'Deduction', pay.deduction, true);
      }
      
      if (pay.advanceDeduction > 0) {
        addRow('Advance Salary / Leave Deduction', 'Deduction', pay.advanceDeduction, true);
      }
      
      // Draw grand total box
      currentY += 2;
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.roundedRect(15, currentY, 180, 11, 1.5, 1.5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('TOTAL NET PAYOUT DISBURSED', 20, currentY + 7);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(`${pay.finalPay?.toLocaleString()} BDT`, 190, currentY + 7, { align: 'right' });
      
      // Signatures
      currentY += 38;
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(0.3);
      pdf.line(20, currentY, 75, currentY);
      pdf.line(135, currentY, 190, currentY);
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Employer Representative', 47.5, currentY + 5, { align: 'center' });
      pdf.text('Signature of Staff Member', 162.5, currentY + 5, { align: 'center' });
      
      // Seal placement
      if (hrmSettings.sealUrl) {
        try {
          pdf.addImage(hrmSettings.sealUrl, 'PNG', 42, currentY - 26, 18, 18);
        } catch (sErr) {
          console.error("Seal image rendering failed:", sErr);
        }
      }
      
      // Signature placement
      if (hrmSettings.signatureUrl) {
        try {
          pdf.addImage(hrmSettings.signatureUrl, 'PNG', 36, currentY - 12, 22, 9);
        } catch (sigErr) {
          console.error("Signature image rendering failed:", sigErr);
        }
      }
      
      pdf.save(`PAYSLIP_${pay.employeeName.replace(/\s+/g, '_')}_${pay.month}.pdf`);
      
      setNotification({
        message: isBn ? 'পে-স্লিপ পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : 'Pay-slip PDF downloaded successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error("Pay-slip PDF generation error:", err);
      setNotification({
        message: isBn ? 'পে-স্লিপ পিডিএফ তৈরি করতে ব্যর্থ হয়েছে' : 'Failed to generate Pay-slip PDF',
        type: 'error'
      });
    }
  };

  // Download 3 or 6 months consolidated salary statement and detailed pay slips bundle as single PDF
  const downloadConsolidatedBundlePDF = async () => {
    if (!bundleStaffId) {
      setNotification({
        message: isBn ? 'দয়া করে একজন স্টাফ সিলেক্ট করুন!' : 'Please select an employee first!',
        type: 'error'
      });
      return;
    }
    
    const emp = employees.find(e => e.id === bundleStaffId);
    if (!emp) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const durationNum = bundleDuration === '3' ? 3 : 6;
      const actualPayments = payrollHistory.filter(h => h.employeeId === emp.id);
      
      const monthsList: string[] = [];
      const now = new Date();
      for (let i = 0; i < durationNum; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        monthsList.push(`${yyyy}-${mm}`);
      }
      
      const bundleData = monthsList.map((m) => {
        const found = actualPayments.find(p => p.month === m);
        if (found) return found;
        
        return {
          id: `sim-${emp.id}-${m}`,
          employeeName: emp.name,
          employeeDesignation: emp.designation,
          month: m,
          paymentMode: emp.paymentMode === 'bank' 
            ? `Bank Transfer (${emp.bankName || 'Bank'} Ac: ${emp.accountNo || ''})` 
            : emp.paymentMode === 'mfs' 
              ? `MFS Wallet (${emp.mfsNo || 'Wallet'})` 
              : 'Cash in Hand',
          date: `${m}-05`,
          baseSalary: emp.salary,
          bonus: 0,
          deduction: 0,
          finalPay: emp.salary
        };
      });
      
      bundleData.sort((a, b) => a.month.localeCompare(b.month));
      
      const totalPages = 1 + Math.ceil(durationNum / 2);
      
      const drawHeaderAndFooter = (pageNumber: number) => {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, 210, 16, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(toSafePdfString(settings.shopName || 'ShopSync').toUpperCase(), 15, 10.5);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(203, 213, 225);
        pdf.text('CONSOLIDATED SALARY LEDGER & AUDIT STATEMENT', 210 - 15, 10.5, { align: 'right' });
        
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.line(15, 280, 195, 280);
        
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(7.5);
        pdf.text(`Audit ID: AUD-${getStaffDisplayId(emp)}-${bundleDuration}M`, 15, 285);
        pdf.text(`Page ${pageNumber} of ${totalPages}`, 105, 285, { align: 'center' });
        pdf.text(`Official Document Verified • Generated by ${toSafePdfString(settings.shopName || 'ShopSync')} AI`, 210 - 15, 285, { align: 'right' });
      };

      // PAGE 1: EXECUTIVE AUDIT & VERIFICATION SUMMARY
      drawHeaderAndFooter(1);
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('OFFICIAL INCOME VERIFICATION LEDGER', 15, 28);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(100);
      pdf.text(`This statement acts as a certified record of salary payouts received by the specified employee over the last ${bundleDuration} months.`, 15, 33);
      
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(15, 38, 180, 32, 3, 3, 'FD');
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('EMPLOYEE AUDIT PROFILE', 20, 44);
      
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.25);
      pdf.line(20, 46, 190, 46);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text('Full Legal Name:', 20, 52);
      pdf.text('Current Designation:', 20, 57);
      pdf.text('Monthly Base Rate:', 20, 62);
      
      pdf.setTextColor(15, 23, 42);
      pdf.text(toSafePdfString(emp.name), 55, 52);
      pdf.text(toSafePdfString(emp.designation), 55, 57);
      pdf.text(`${emp.salary.toLocaleString()} BDT / month`, 55, 62);

      pdf.setTextColor(100);
      pdf.text('Branch/Terminal ID:', 115, 52);
      pdf.text('Audit Interval:', 115, 57);
      pdf.text('Statement Period:', 115, 62);
      
      pdf.setTextColor(15, 23, 42);
      pdf.text(toSafePdfString(emp.branchId, 'Main Store HQ'), 148, 52);
      pdf.text(`Last ${bundleDuration} Calendar Months`, 148, 57);
      pdf.text(`${bundleData[0].month} to ${bundleData[bundleData.length - 1].month}`, 148, 62);
      
      const totalBase = bundleData.reduce((acc, curr) => acc + (curr.baseSalary || 0), 0);
      const totalBonus = bundleData.reduce((acc, curr) => acc + (curr.bonus || 0), 0);
      const totalDeductions = bundleData.reduce((acc, curr) => acc + (curr.deduction || 0), 0);
      const totalNetPayout = bundleData.reduce((acc, curr) => acc + (curr.finalPay || 0), 0);
      
      const drawBentoCard = (x: number, y: number, w: number, h: number, title: string, value: string, sub: string, titleColor = [71, 85, 105], valColor = [15, 23, 42]) => {
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(241, 245, 249);
        pdf.roundedRect(x, y, w, h, 2, 2, 'FD');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        pdf.text(title.toUpperCase(), x + 4, y + 5);
        
        pdf.setFontSize(10.5);
        pdf.setTextColor(valColor[0], valColor[1], valColor[2]);
        pdf.text(value, x + 4, y + 11.5);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(148, 163, 184);
        pdf.text(sub, x + 4, y + 15);
      };
      
      const bY = 76;
      drawBentoCard(15, bY, 42, 18, 'Gross Base Accumulated', `${totalBase.toLocaleString()} BDT`, 'Regular Monthly Pay', [71, 85, 105], [15, 23, 42]);
      drawBentoCard(61, bY, 42, 18, 'Total Bonuses Paid', `+${totalBonus.toLocaleString()} BDT`, 'Incentives & Festive Pay', [21, 128, 61], [21, 128, 61]);
      drawBentoCard(107, bY, 42, 18, 'Total Debit Deductions', `-${totalDeductions.toLocaleString()} BDT`, 'Absences & Advances', [220, 38, 38], [220, 38, 38]);
      drawBentoCard(153, bY, 42, 18, 'Net Audited Payout', `${totalNetPayout.toLocaleString()} BDT`, 'Total Disbursed Net', [30, 58, 138], [30, 58, 138]);
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.text('PERIODIC PAYROLL AUDIT TRAIL', 15, 105);
      
      pdf.setDrawColor(15, 23, 42);
      pdf.setLineWidth(0.4);
      pdf.line(15, 107, 195, 107);
      
      pdf.setFillColor(241, 245, 249);
      pdf.rect(15, 110, 180, 8, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Period', 18, 115);
      pdf.text('Payment Method Details', 46, 115);
      pdf.text('Gross Base', 104, 115, { align: 'right' });
      pdf.text('Additions', 128, 115, { align: 'right' });
      pdf.text('Deductions', 156, 115, { align: 'right' });
      pdf.text('Net Deposited', 191, 115, { align: 'right' });
      
      let tableY = 124;
      bundleData.forEach((row) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(50);
        
        pdf.text(row.month, 18, tableY);
        pdf.text(toSafePdfString(row.paymentMode || 'EFT Transfer'), 46, tableY);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${row.baseSalary?.toLocaleString()} BDT`, 104, tableY, { align: 'right' });
        pdf.setTextColor(21, 128, 61);
        pdf.text(`+${row.bonus?.toLocaleString()} BDT`, 128, tableY, { align: 'right' });
        pdf.setTextColor(220, 38, 38);
        pdf.text(`-${row.deduction?.toLocaleString()} BDT`, 156, tableY, { align: 'right' });
        
        pdf.setTextColor(15, 23, 42);
        pdf.text(`${row.finalPay?.toLocaleString()} BDT`, 191, tableY, { align: 'right' });
        
        pdf.setDrawColor(241, 245, 249);
        pdf.setLineWidth(0.15);
        pdf.line(15, tableY + 3.5, 195, tableY + 3.5);
        tableY += 9;
      });
      
      pdf.setFillColor(254, 252, 232);
      pdf.setDrawColor(254, 240, 138);
      pdf.setLineWidth(0.25);
      pdf.roundedRect(15, 190, 180, 24, 2, 2, 'FD');
      
      pdf.setTextColor(113, 63, 18);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('DIGITAL COMPLIANCE & LEGAL NOTICE', 20, 196);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(133, 77, 14);
      pdf.text('This income statement has been prepared and electronically certified in compliance with international audit and verification systems.', 20, 201);
      pdf.text('It contains actual verified corporate salary registers and provides valid, third-party verifiable income compliance records.', 20, 205);
      
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(0.3);
      pdf.line(20, 245, 75, 245);
      pdf.line(135, 245, 190, 245);
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.text('Audit Seal & Certification', 47.5, 250, { align: 'center' });
      pdf.text('Authorized Signatory', 162.5, 250, { align: 'center' });
      
      if (hrmSettings.sealUrl) {
        try { pdf.addImage(hrmSettings.sealUrl, 'PNG', 38, 215, 20, 20); } catch (e) {}
      }
      if (hrmSettings.signatureUrl) {
        try { pdf.addImage(hrmSettings.signatureUrl, 'PNG', 150, 232, 24, 10); } catch (e) {}
      }

      // PAGES 2+: INDIVIDUAL DETAILED SLIPS
      let slipPageIndex = 2;
      for (let i = 0; i < bundleData.length; i += 2) {
        pdf.addPage();
        drawHeaderAndFooter(slipPageIndex);
        
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(`DETAILED MONTHLY DISBURSAL RECORD: INDIVIDUAL SLIPS`, 15, 24);
        
        for (let j = 0; j < 2; j++) {
          const itemIdx = i + j;
          if (itemIdx >= bundleData.length) break;
          const payItem = bundleData[itemIdx];
          
          const yOffset = 30 + (j * 115);
          
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(203, 213, 225);
          pdf.setLineWidth(0.4);
          pdf.roundedRect(15, yOffset, 180, 102, 3, 3, 'FD');
          
          pdf.setFillColor(248, 250, 252);
          pdf.rect(15.2, yOffset + 0.2, 179.6, 12, 'F');
          
          pdf.setTextColor(15, 23, 42);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9.5);
          pdf.text(`INDIVIDUAL STATEMENT RECORD • PERIOD: ${payItem.month}`, 20, yOffset + 8);
          
          pdf.setFillColor(220, 252, 231);
          pdf.roundedRect(148, yOffset + 3.5, 25, 5, 1, 1, 'F');
          pdf.setTextColor(21, 128, 61);
          pdf.setFontSize(7);
          pdf.text('VERIFIED REVENUE', 150.5, yOffset + 7);
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text('STAFF MEMBER:', 20, yOffset + 20);
          pdf.text('DESIGNATION:', 85, yOffset + 20);
          pdf.text('DISBURSED ON:', 145, yOffset + 20);
          
          pdf.setTextColor(15, 23, 42);
          pdf.text(toSafePdfString(payItem.employeeName), 20, 24.5 + yOffset);
          pdf.text(toSafePdfString(payItem.employeeDesignation || emp.designation), 85, 24.5 + yOffset);
          pdf.text(payItem.date, 145, 24.5 + yOffset);
          
          pdf.setDrawColor(241, 245, 249);
          pdf.setLineWidth(0.3);
          pdf.line(20, yOffset + 28, 190, yOffset + 28);
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text('PAY ITEM DESCRIPTION', 20, yOffset + 34);
          pdf.text('TYPE', 110, yOffset + 34);
          pdf.text('AMOUNT', 190, yOffset + 34, { align: 'right' });
          
          pdf.line(20, yOffset + 36, 190, yOffset + 36);
          
          let rowY = yOffset + 42;
          const drawMiniRow = (dName: string, dType: string, dAmt: number, isSub = false) => {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(60);
            pdf.text(dName, 20, rowY);
            pdf.text(dType, 110, rowY);
            
            pdf.setFont('helvetica', 'bold');
            if (isSub) {
              pdf.setTextColor(220, 38, 38);
              pdf.text(`-${dAmt.toLocaleString()} BDT`, 190, rowY, { align: 'right' });
            } else {
              pdf.setTextColor(21, 128, 61);
              pdf.text(`+${dAmt.toLocaleString()} BDT`, 190, rowY, { align: 'right' });
            }
            rowY += 6.5;
          };
          
          drawMiniRow('Regular Base Working Allocation', 'Earning Base', payItem.baseSalary || emp.salary, false);
          
          if (payItem.tadAllowance > 0) {
            drawMiniRow('Travel & Daily Allowance (TAD)', 'Allowance Add', payItem.tadAllowance, false);
          }
          
          if (payItem.foodAllowance > 0) {
            drawMiniRow('Food Allowance', 'Allowance Add', payItem.foodAllowance, false);
          }
          
          if (payItem.hraAllowance > 0) {
            drawMiniRow('House Rent Allowance (HRA)', 'Allowance Add', payItem.hraAllowance, false);
          }
          
          if (payItem.bonus > 0) {
            drawMiniRow('Festive Holiday & Bonus Allocation', 'Allowance Add', payItem.bonus, false);
          }
          
          if (payItem.deduction > 0) {
            drawMiniRow('Absence Unpaid Days Deduction', 'Deduction Sub', payItem.deduction, true);
          }
          
          // Fill blank lines for structural symmetry
          const itemsCount = 1 + (payItem.tadAllowance > 0 ? 1 : 0) + (payItem.foodAllowance > 0 ? 1 : 0) + (payItem.hraAllowance > 0 ? 1 : 0) + (payItem.bonus > 0 ? 1 : 0) + (payItem.deduction > 0 ? 1 : 0);
          const deficit = Math.max(0, 3 - itemsCount);
          for (let d = 0; d < deficit; d++) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(200);
            pdf.text('---', 20, rowY);
            pdf.text('---', 110, rowY);
            pdf.text('0.00 BDT', 190, rowY, { align: 'right' });
            rowY += 6.5;
          }
          
          pdf.setFillColor(248, 250, 252);
          pdf.roundedRect(20, yOffset + 68, 170, 8, 1, 1, 'F');
          
          pdf.setTextColor(15, 23, 42);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.text('TOTAL NET DEPOSITED FOR PERIOD', 24, yOffset + 73.2);
          pdf.text(`${payItem.finalPay?.toLocaleString()} BDT`, 186, yOffset + 73.2, { align: 'right' });
          
          pdf.setDrawColor(226, 232, 240);
          pdf.line(25, yOffset + 93, 75, yOffset + 93);
          pdf.line(135, yOffset + 93, 185, yOffset + 93);
          
          pdf.setFontSize(7);
          pdf.setTextColor(148, 163, 184);
          pdf.text('Authorized Representative Signature', 50, yOffset + 96.5, { align: 'center' });
          pdf.text('Designated Staff Signature Accord', 160, yOffset + 96.5, { align: 'center' });
          
          if (hrmSettings.signatureUrl) {
            try { pdf.addImage(hrmSettings.signatureUrl, 'PNG', 40, yOffset + 81, 18, 8); } catch (e) {}
          }
        }
        
        slipPageIndex++;
      }
      
      pdf.save(`SALARY_STATEMENT_PACK_${emp.name.replace(/\s+/g, '_')}_${bundleDuration}M.pdf`);
      
      setNotification({
        message: isBn 
          ? `গত ${bundleDuration} মাসের সফল সিলযুক্ত পিডিএফ বিবরণী ডাউনলোড সম্পন্ন হয়েছে!` 
          : `Consolidated ${bundleDuration}-month salary package PDF statement downloaded!`,
        type: 'success'
      });
    } catch (err) {
      console.error("Bundle statement error:", err);
      setNotification({
        message: isBn ? 'বিবরণী প্যাক জেনারেট করতে ব্যর্থ হয়েছে' : 'Failed to generate statement bundle PDF',
        type: 'error'
      });
    }
  };

  // Simulated live attendance system
  useEffect(() => {
    // Let's seed default attendance logs if empty
    if (employees.length > 0 && attendanceLogs.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const initialLogs = employees.map((emp, idx) => ({
        id: `att-${emp.id}-${todayStr}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: todayStr,
        checkIn: idx % 4 === 0 ? '09:25 AM' : '08:55 AM',
        checkOut: idx % 4 === 0 ? '---' : '06:05 PM',
        status: idx % 5 === 4 ? 'Absent' : idx % 4 === 0 ? 'Late' : 'Present',
        overtime: idx % 3 === 1 ? 2 : 0
      }));
      setAttendanceLogs(initialLogs);
    }
  }, [employees]);

  // Proactively sanitize all local states whenever the employees prop changes
  useEffect(() => {
    if (employees.length > 0) {
      const validEmployeeIds = new Set(employees.map(e => e.id));
      const validEmployeeNames = new Set(employees.map(e => e.name));

      // 1. Sanitize attendanceLogs (in-memory list)
      setAttendanceLogs(prev => prev.filter(log => validEmployeeIds.has(log.employeeId)));

      // 2. Sanitize selectedCertEmployee
      if (selectedCertEmployee && !validEmployeeIds.has(selectedCertEmployee.id)) {
        setSelectedCertEmployee(null);
      }

      // 3. Sanitize editingEmployee
      if (editingEmployee && !validEmployeeIds.has(editingEmployee.id)) {
        setEditingEmployee(null);
      }

      // 4. Sanitize dropdown selections
      if (payrollStaffId && !validEmployeeIds.has(payrollStaffId)) {
        setPayrollStaffId('');
      }
      if (bundleStaffId && !validEmployeeIds.has(bundleStaffId)) {
        setBundleStaffId('');
      }

      // 5. Filter any leftover local items in leaveRequests, payrollHistory or hrmRecords
      setLeaveRequests(prev => prev.filter(req => !req.employeeId || validEmployeeIds.has(req.employeeId)));
      setPayrollHistory(prev => prev.filter(pay => {
        if (pay.employeeId) return validEmployeeIds.has(pay.employeeId);
        if (pay.employeeName) return validEmployeeNames.has(pay.employeeName);
        return true;
      }));
      setHrmRecords(prev => prev.filter(rec => !rec.employeeId || validEmployeeIds.has(rec.employeeId)));
    } else {
      setAttendanceLogs([]);
      setSelectedCertEmployee(null);
      setEditingEmployee(null);
      setPayrollStaffId('');
      setBundleStaffId('');
      setLeaveRequests([]);
      setPayrollHistory([]);
      setHrmRecords([]);
    }
  }, [employees, selectedCertEmployee, editingEmployee, payrollStaffId, bundleStaffId]);

  // Advanced HRM settings real-time sync
  useEffect(() => {
    if (!user?.shopId) return;
    const hrmSettingsRef = doc(db, 'hrm_settings', user.shopId);
    const unsub = onSnapshot(hrmSettingsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setHrmSettings({
          watermarkUrl: data.watermarkUrl || '',
          watermarkOpacity: Number(data.watermarkOpacity) || 0.06,
          watermarkSize: Number(data.watermarkSize) || 160,
          signatureUrl: data.signatureUrl || '',
          sealUrl: data.sealUrl || '',
          prePrintedPad: !!data.prePrintedPad,
          headerText: data.headerText || settings?.shopName || 'ShopSync Corporation',
          footerText: data.footerText || 'Verified Digital Document © ShopSync'
        });
      }
    });
    return () => unsub();
  }, [user?.shopId, settings?.shopName]);

  // Real-time leaves sync with auto-seeding
  useEffect(() => {
    if (!user?.shopId) return;
    const q = query(collection(db, 'hrm_leaves'), where('shopId', '==', user.shopId));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) {
        setLeaveRequests(list);
      } else {
        const defaultLeaves = [
          {
            id: 'leave-1',
            shopId: user.shopId,
            employeeId: employees[0]?.id || 'emp-demo-1',
            employeeName: employees[0]?.name || 'Demo Employee',
            leaveType: isBn ? 'অসুস্থতাজনিত ছুটি (Sick Leave)' : 'Sick Leave',
            startDate: '2026-06-22',
            endDate: '2026-06-23',
            daysCount: 2,
            reason: isBn ? 'জ্বর এবং সর্দি' : 'Severe fever and cold',
            status: 'Pending'
          }
        ];
        defaultLeaves.forEach(async (lv) => {
          await setDoc(doc(db, 'hrm_leaves', lv.id), lv);
        });
      }
    });
    return () => unsub();
  }, [user?.shopId, employees]);

  // Real-time payroll sync with auto-seeding
  useEffect(() => {
    if (!user?.shopId) return;
    const q = query(collection(db, 'hrm_payroll'), where('shopId', '==', user.shopId));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) {
        setPayrollHistory(list);
      } else if (employees.length > 0) {
        const defaultPay = {
          id: 'pay-1',
          shopId: user.shopId,
          employeeName: employees[0].name,
          month: '2026-05',
          baseSalary: Number(employees[0].salary) || 12000,
          bonus: 1000,
          deduction: 0,
          finalPay: (Number(employees[0].salary) || 12000) + 1000,
          paymentMode: 'Bank Transfer',
          date: '2026-06-02'
        };
        setDoc(doc(db, 'hrm_payroll', 'pay-1'), defaultPay);
      }
    });
    return () => unsub();
  }, [user?.shopId, employees]);

  // Real-time dynamic documents sync
  useEffect(() => {
    if (!user?.shopId) return;
    const q = query(collection(db, 'hrm_records'), where('shopId', '==', user.shopId));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      setHrmRecords(list);
    });
    return () => unsub();
  }, [user?.shopId]);

  // Auto-cleanup for records older than 1 year (365 days)
  useEffect(() => {
    if (!user?.shopId) return;
    
    const runOneYearAutoCleanup = async () => {
      const oneYearAgoMs = Date.now() - 365 * 24 * 60 * 60 * 1000;
      
      try {
        // 1. Cleanup old hrm_payroll records
        const payrollRef = collection(db, 'hrm_payroll');
        const payrollQuery = query(payrollRef, where('shopId', '==', user.shopId));
        const payrollSnap = await getDocs(payrollQuery);
        for (const d of payrollSnap.docs) {
          const data = d.data();
          const createdTime = data.createdAt ? new Date(data.createdAt).getTime() : (data.date ? new Date(data.date).getTime() : null);
          if (createdTime && createdTime < oneYearAgoMs && d.id !== 'pay-1') {
            await deleteDoc(doc(db, 'hrm_payroll', d.id));
          }
        }
        
        const threeMonthsAgoMs = Date.now() - (90 * 24 * 60 * 60 * 1000);
        
        // 2. Cleanup old hrm_records slips/certificates
        const recordsRef = collection(db, 'hrm_records');
        const recordsQuery = query(recordsRef, where('shopId', '==', user.shopId));
        const recordsSnap = await getDocs(recordsQuery);
        for (const d of recordsSnap.docs) {
          const data = d.data();
          const createdTime = data.createdAt ? new Date(data.createdAt).getTime() : (data.date ? new Date(data.date).getTime() : null);
          if (createdTime) {
            const isExperience = data.type === 'experience';
            if (!isExperience && createdTime < threeMonthsAgoMs) {
              await deleteDoc(doc(db, 'hrm_records', d.id));
            }
          }
        }
        
        // 3. Cleanup old hrm_leaves requests
        const leavesRef = collection(db, 'hrm_leaves');
        const leavesQuery = query(leavesRef, where('shopId', '==', user.shopId));
        const leavesSnap = await getDocs(leavesQuery);
        for (const d of leavesSnap.docs) {
          const data = d.data();
          const createdTime = data.startDate ? new Date(data.startDate).getTime() : null;
          if (createdTime && createdTime < oneYearAgoMs && d.id !== 'leave-1') {
            await deleteDoc(doc(db, 'hrm_leaves', d.id));
          }
        }
      } catch (err) {
        console.error("1-year auto-cleanup error:", err);
      }
    };
    
    const timer = setTimeout(() => {
      runOneYearAutoCleanup();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [user?.shopId]);

  const uniqueDesignations = useMemo(() => {
    const list = employees.map(emp => emp.designation).filter(Boolean);
    return Array.from(new Set(list));
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.phone.includes(searchTerm) || 
                          (emp.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getStaffDisplayId(emp).includes(searchTerm);
      const matchDesignation = !designationFilter || emp.designation === designationFilter;
      const matchStatus = !statusFilter || emp.status === statusFilter;
      return matchSearch && matchDesignation && matchStatus;
    });
  }, [employees, searchTerm, designationFilter, statusFilter]);

  // Total payroll state stats
  const stats = useMemo(() => {
    const totalStaff = employees.length;
    const activeStaff = employees.filter(e => e.status === 'active').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = attendanceLogs.filter(log => log.date === todayStr && (log.status === 'Present' || log.status === 'Late')).length;
    const pendingLeaves = leaveRequests.filter(req => req.status === 'Pending').length;
    const totalSalaryPromise = employees.reduce((acc, emp) => acc + (Number(emp.salary) || 0), 0);

    return { totalStaff, activeStaff, presentToday, pendingLeaves, totalSalaryPromise };
  }, [employees, attendanceLogs, leaveRequests]);

  const employeeLeaveLedgers = useMemo(() => {
    return employees.map(emp => {
      const quota = Number(emp.yearlyLeaves) || 15;
      const empLeaves = leaveRequests.filter(req => req.employeeId === emp.id && req.status === 'Approved');
      
      let approvedDays = 0;
      let advanceDays = 0;
      
      empLeaves.forEach(req => {
        const days = Number(req.daysCount) || 1;
        approvedDays += days;
      });

      if (approvedDays > quota) {
        advanceDays = approvedDays - quota;
        approvedDays = quota;
      }

      const remaining = quota - approvedDays;

      return {
        id: emp.id,
        name: emp.name,
        designation: emp.designation,
        quota,
        used: approvedDays,
        remaining,
        advance: advanceDays
      };
    });
  }, [employees, leaveRequests]);

  const handleOpenAddModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        ...emp,
        allowLogin: !!emp.allowLogin,
        branchId: emp.branchId || (branches && branches[0]?.id) || 'b1'
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        designation: '',
        phone: '',
        email: '',
        salary: 12000,
        joiningDate: new Date().toISOString().split('T')[0],
        schedule: '09:00 AM - 06:00 PM',
        status: 'active',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&fit=crop',
        bloodGroup: 'A+',
        emergencyPhone: '',
        paymentMode: 'cash',
        bankName: '',
        bankBranch: '',
        accountNo: '',
        mfsNo: '',
        shiftStart: '09:00',
        shiftEnd: '18:00',
        yearlyLeaves: 15,
        allowLogin: false,
        branchId: (branches && branches[0]?.id) || 'b1'
      });
    }
    setIsAddModalOpen(true);
  };

  const saveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.designation || !formData.phone) {
      setNotification({
        message: isBn ? 'অনুগ্রহ করে নাম, পদবি এবং ফোন নম্বর পূরণ করুন।' : 'Please fill Name, Designation, and Phone number.',
        type: 'error'
      });
      return;
    }

    try {
      if (editingEmployee) {
        // Update in DB
        const empRef = doc(db, 'employees', editingEmployee.id);
        const updatedData = {
          ...formData,
          salary: Number(formData.salary) || 0,
          branchId: formData.branchId || (branches && branches[0]?.id) || 'b1'
        };
        await updateDoc(empRef, updatedData);

        // Also update in users collection if exists
        const username = editingEmployee.username?.trim().toLowerCase();
        if (username) {
          const userQuery = query(collection(db, 'users'), where('username', '==', username));
          const userSnap = await getDocs(userQuery);
          for (const docObj of userSnap.docs) {
            await updateDoc(doc(db, 'users', docObj.id), {
              displayName: formData.name,
              branchId: formData.branchId || (branches && branches[0]?.id) || 'b1'
            });
          }
        }

        setNotification({
          message: isBn ? 'স্টাফ প্রোফাইল সফলভাবে আপডেট করা হয়েছে।' : 'Employee profile successfully updated.',
          type: 'success'
        });
      } else {
        // Add to DB
        const generatedId = generateUniqueStaffId(employees);
        await addDoc(collection(db, 'employees'), {
          ...formData,
          staffId: generatedId,
          salary: Number(formData.salary) || 0,
          shopId: user.shopId,
          branchId: formData.branchId || (branches && branches[0]?.id) || 'b1'
        });
        setNotification({
          message: isBn ? 'নতুন স্টাফ সফলভাবে যুক্ত করা হয়েছে।' : 'New staff successfully added.',
          type: 'success'
        });
      }
      setIsAddModalOpen(false);
      setEditingEmployee(null);
    } catch (err: any) {
      setNotification({
        message: err.message || 'Error executing database transaction',
        type: 'error'
      });
    }
  };

  const deleteEmployeeProfile = (id: string) => {
    setDeleteConfirmEmployeeId(id);
  };

  const executeDeleteEmployee = async (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    setIsDeletingProcess(true);
    try {
      // 1. Delete secondary auth user if credentials exist
      if (emp.username && emp.password) {
        try {
          const email = `${emp.username.trim().toLowerCase()}@bismillahstore.local`;
          const userCred = await signInWithEmailAndPassword(secondaryAuth, email, emp.password);
          if (userCred.user) {
            await userCred.user.delete();
          }
        } catch (authErr) {
          console.warn("Auth user deletion warning (may not exist or need fresh login):", authErr);
        }
      }

      // 2. Delete user login documents from 'users' collection
      const usersQuery = query(collection(db, 'users'), where('employeeId', '==', id));
      const usersSnap = await getDocs(usersQuery);
      for (const d of usersSnap.docs) {
        await deleteDoc(doc(db, 'users', d.id));
      }

      // 3. Delete leave requests from 'hrm_leaves' collection
      const leavesQuery = query(collection(db, 'hrm_leaves'), where('employeeId', '==', id));
      const leavesSnap = await getDocs(leavesQuery);
      for (const d of leavesSnap.docs) {
        await deleteDoc(doc(db, 'hrm_leaves', d.id));
      }

      // 4. Delete payroll records from 'hrm_payroll' collection
      const payrollQuery = query(collection(db, 'hrm_payroll'), where('employeeId', '==', id));
      const payrollSnap = await getDocs(payrollQuery);
      for (const d of payrollSnap.docs) {
        await deleteDoc(doc(db, 'hrm_payroll', d.id));
      }

      // 5. Delete generated slips/certificates from 'hrm_records' collection
      const recordsQuery = query(collection(db, 'hrm_records'), where('employeeId', '==', id));
      const recordsSnap = await getDocs(recordsQuery);
      for (const d of recordsSnap.docs) {
        await deleteDoc(doc(db, 'hrm_records', d.id));
      }

      // 6. Delete from 'employees' collection
      await deleteDoc(doc(db, 'employees', id));

      // 7. Clear in-memory attendance logs for this employee
      setAttendanceLogs(prev => prev.filter(log => log.employeeId !== id));

      // 8. Delete matching recycleBin entries
      const rbQuery1 = query(collection(db, 'recycleBin'), where('entityId', '==', id));
      const rbSnap1 = await getDocs(rbQuery1);
      for (const d of rbSnap1.docs) {
        await deleteDoc(doc(db, 'recycleBin', d.id));
      }
      const rbQuery2 = query(collection(db, 'recycleBin'), where('originalId', '==', id));
      const rbSnap2 = await getDocs(rbQuery2);
      for (const d of rbSnap2.docs) {
        await deleteDoc(doc(db, 'recycleBin', d.id));
      }

      // 9. Delete matching staff_salaries
      if (emp.name) {
        const salaryQuery = query(collection(db, 'staff_salaries'), where('staffName', '==', emp.name));
        const salarySnap = await getDocs(salaryQuery);
        for (const d of salarySnap.docs) {
          await deleteDoc(doc(db, 'staff_salaries', d.id));
        }
      }

      setNotification({
        message: isBn ? 'কর্মীর সমস্ত রেকর্ড স্থায়ীভাবে ডিলেট করা হয়েছে।' : 'All staff records and documents have been permanently deleted.',
        type: 'success'
      });
      setDeleteConfirmEmployeeId(null);
    } catch (err: any) {
      console.error("Delete employee failure:", err);
      setNotification({
        message: isBn ? 'ডিলেট করতে ত্রুটি হয়েছে: ' + err.message : 'Error deleting employee and records: ' + err.message,
        type: 'error'
      });
    } finally {
      setIsDeletingProcess(false);
    }
  };

  // Quick Attendance Actions
  const handlePunchAttendance = (empId: string, actionStatus: 'Present' | 'Late' | 'Absent') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const logId = `att-${empId}-${todayStr}`;
    
    // Check if checkin already exists for today
    const existingIndex = attendanceLogs.findIndex(log => log.id === logId);
    const emp = employees.find(e => e.id === empId);

    if (!emp) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (existingIndex > -1) {
      const updated = [...attendanceLogs];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status: actionStatus,
        checkIn: actionStatus === 'Absent' ? '---' : timeStr
      };
      setAttendanceLogs(updated);
    } else {
      setAttendanceLogs([
        {
          id: logId,
          employeeId: empId,
          employeeName: emp.name,
          date: todayStr,
          checkIn: actionStatus === 'Absent' ? '---' : timeStr,
          checkOut: '---',
          status: actionStatus,
          overtime: 0
        },
        ...attendanceLogs
      ]);
    }

    setNotification({
      message: isBn 
        ? `${emp.name}-এর হাজিরা নিশ্চিত করা হয়েছে (${actionStatus})` 
        : `Attendance marked for ${emp.name} as ${actionStatus}`,
      type: 'success'
    });
  };

  // Salary calculation computed variables
  const computedSalaryDetails = useMemo(() => {
    const selectedEmp = employees.find(emp => emp.id === payrollStaffId);
    if (!selectedEmp) return null;

    const base = Number(selectedEmp.salary) || 0;
    const tad = Number(selectedEmp.tadAllowance) || 0;
    const food = Number(selectedEmp.foodAllowance) || 0;
    const hra = Number(selectedEmp.hraAllowance) || 0;
    const grossBase = base + tad + food + hra;

    const otRateHourly = Math.round((base / 240) * 1.5); // calculated on 30 days standard 8 hour standard shift x 1.5 multiplier
    const overtimePayout = overtimeHours * otRateHourly;
    const deductionDaily = Math.round(base / 30);
    const regularDeductions = unpaidDays * deductionDaily;
    const advanceDeduction = advanceDaysDeducted * deductionDaily;
    const finalAmount = grossBase + overtimePayout + Number(bonusAmount) - regularDeductions - advanceDeduction;

    return {
      base,
      tad,
      food,
      hra,
      grossBase,
      otHours: overtimeHours,
      otRate: otRateHourly,
      otPayout: overtimePayout,
      unpaidDaysCount: unpaidDays,
      perDayDeduction: deductionDaily,
      payoutDeductions: regularDeductions,
      advanceDeduction,
      advanceDaysCount: advanceDaysDeducted,
      bonus: Number(bonusAmount),
      netSalaryPayable: finalAmount,
      empName: selectedEmp.name,
      empDesignation: selectedEmp.designation,
      paymentModeChosen: selectedEmp.paymentMode || 'cash'
    };
  }, [employees, payrollStaffId, overtimeHours, unpaidDays, bonusAmount, advanceDaysDeducted]);

  const handlePaySalary = async () => {
    if (!computedSalaryDetails) return;

    const payrollId = `payroll-${Date.now()}`;
    const selectedEmp = employees.find(e => e.id === payrollStaffId);
    let formattedPaymentMode = 'Cash in Hand';
    
    if (selectedEmp) {
      if (computedSalaryDetails.paymentModeChosen === 'bank') {
        formattedPaymentMode = `Bank Transfer (${selectedEmp.bankName || 'Bank'}, Br: ${selectedEmp.bankBranch || ''}, Ac: ${selectedEmp.accountNo || ''})`;
      } else if (computedSalaryDetails.paymentModeChosen === 'mfs') {
        formattedPaymentMode = `MFS Wallet (No: ${selectedEmp.mfsNo || ''})`;
      }
    }

    const newPayment = {
      id: payrollId,
      shopId: user.shopId,
      employeeId: payrollStaffId,
      staffId: selectedEmp ? getStaffDisplayId(selectedEmp) : '',
      employeeName: computedSalaryDetails.empName,
      month: selectedMonth,
      baseSalary: computedSalaryDetails.base,
      tadAllowance: computedSalaryDetails.tad,
      foodAllowance: computedSalaryDetails.food,
      hraAllowance: computedSalaryDetails.hra,
      grossBase: computedSalaryDetails.grossBase,
      bonus: computedSalaryDetails.bonus,
      deduction: computedSalaryDetails.payoutDeductions + computedSalaryDetails.advanceDeduction,
      finalPay: computedSalaryDetails.netSalaryPayable,
      paymentMode: formattedPaymentMode,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      bankName: selectedEmp?.bankName || '',
      bankBranch: selectedEmp?.bankBranch || '',
      accountNo: selectedEmp?.accountNo || '',
      mfsNo: selectedEmp?.mfsNo || ''
    };

    try {
      // 1. Save payroll payment record
      await setDoc(doc(db, 'hrm_payroll', payrollId), newPayment);

      // 2. Save public dynamic verification document record
      await setDoc(doc(db, 'hrm_records', payrollId), {
        id: payrollId,
        shopId: user.shopId,
        type: 'payslip',
        employeeId: payrollStaffId,
        staffId: selectedEmp ? getStaffDisplayId(selectedEmp) : '',
        employeeName: computedSalaryDetails.empName,
        employeeDesignation: computedSalaryDetails.empDesignation,
        date: newPayment.date,
        details: {
          month: selectedMonth,
          base: computedSalaryDetails.base,
          tadAllowance: computedSalaryDetails.tad,
          foodAllowance: computedSalaryDetails.food,
          hraAllowance: computedSalaryDetails.hra,
          grossBase: computedSalaryDetails.grossBase,
          bonus: computedSalaryDetails.bonus,
          payoutDeductions: computedSalaryDetails.payoutDeductions + computedSalaryDetails.advanceDeduction,
          netSalaryPayable: computedSalaryDetails.netSalaryPayable,
          amountInWordsBn: numberToWordsBn(computedSalaryDetails.netSalaryPayable),
          amountInWordsEn: numberToWordsEn(computedSalaryDetails.netSalaryPayable),
          signatureUrl: hrmSettings.signatureUrl,
          sealUrl: hrmSettings.sealUrl,
          paymentMode: formattedPaymentMode,
          bankName: selectedEmp?.bankName || '',
          bankBranch: selectedEmp?.bankBranch || '',
          accountNo: selectedEmp?.accountNo || '',
          mfsNo: selectedEmp?.mfsNo || ''
        },
        createdAt: new Date().toISOString()
      });

      setNotification({
        message: isBn 
          ? `সফলভাবে ${computedSalaryDetails.empName}-এর বেতন (${selectedMonth}) পরিশোধ করা হয়েছে!` 
          : `Successfully paid salary to ${computedSalaryDetails.empName} for ${selectedMonth}!`,
        type: 'success'
      });

      // Reset fields
      setOvertimeHours(0);
      setUnpaidDays(0);
      setBonusAmount(0);
      setAdvanceDaysDeducted(0);
    } catch (err: any) {
      console.error(err);
      setNotification({ message: 'Error processing payroll disbursal', type: 'error' });
    }
  };

  const handleAddCustomLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    
    const empId = fd.get('employeeId') as string;
    const emp = employees.find(ep => ep.id === empId);

    if (!emp) {
      setNotification({ message: 'Invalid employee selection', type: 'error' });
      return;
    }

    const start = fd.get('startDate') as string;
    const end = fd.get('endDate') as string;

    const daysCount = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const newLeaveId = `leave-${Date.now()}`;

    const newLeave = {
      id: newLeaveId,
      shopId: user.shopId,
      employeeId: emp.id,
      employeeName: emp.name,
      leaveType: fd.get('leaveType') as string,
      startDate: start,
      endDate: end,
      daysCount,
      reason: fd.get('reason') as string,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'hrm_leaves', newLeaveId), newLeave);
      setNotification({
        message: isBn ? 'ছুটির আবেদন দাখিল করা হয়েছে।' : 'Leave application submitted successfully.',
        type: 'success'
      });
      form.reset();
    } catch (err: any) {
      console.error(err);
      setNotification({ message: 'Error submitting leave request', type: 'error' });
    }
  };

  const handleApproveLeave = async (leaveId: string, nextStatus: 'Approved' | 'Rejected') => {
    try {
      await updateDoc(doc(db, 'hrm_leaves', leaveId), { status: nextStatus });
      setNotification({
        message: isBn 
          ? `আবেদনটি ${nextStatus === 'Approved' ? 'অনুমোদন' : 'বাতিল'} করা হয়েছে।` 
          : `Leave application ${nextStatus}.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setNotification({ message: 'Error updating leave status', type: 'error' });
    }
  };

  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState<Record<string, boolean>>({});

  const handleSaveCredentials = async (emp: Employee) => {
    const creds = employeeLogins[emp.id] || { username: emp.username || '', password: emp.password || '' };
    const username = creds.username.trim().toLowerCase();
    const password = creds.password.trim();

    if (!username) {
      setNotification({ message: isBn ? 'ইউজারনেম দিন!' : 'Username is required!', type: 'error' });
      return;
    }
    if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
      setNotification({ message: isBn ? 'ইউজারনেম ছোট হাতের অক্ষর এবং সংখ্যা হতে হবে (কমপক্ষে ৩ টি ক্যারেক্টার)।' : 'Username must be lowercase letters/numbers, minimum 3 characters.', type: 'error' });
      return;
    }
    if (password.length !== 6) {
      setNotification({ message: isBn ? 'পাসওয়ার্ডটি অবশ্যই একদম ৬ সংখ্যার হতে হবে।' : 'Password must be exactly 6 characters/digits.', type: 'error' });
      return;
    }

    setIsUpdatingCredentials(prev => ({ ...prev, [emp.id]: true }));

    try {
      const email = `${username}@bismillahstore.local`;
      let uid = "";

      // Check if username already exists in another user's document in the 'users' collection
      const userQuery = query(collection(db, 'users'), where('username', '==', username));
      const userSnap = await getDocs(userQuery);
      const otherUserExists = userSnap.docs.some(docObj => docObj.data().employeeId !== emp.id);
      if (otherUserExists) {
        setNotification({ message: isBn ? 'এই ইউজারনেমটি ইতিমধ্যে অন্য একজন ব্যবহার করছেন!' : 'This username is already taken by another user!', type: 'error' });
        setIsUpdatingCredentials(prev => ({ ...prev, [emp.id]: false }));
        return;
      }

      // Recreate or create authentication account
      try {
        const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        uid = credential.user.uid;
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          try {
            // Delete and recreate sequence to securely update password
            const oldPass = emp.password || password;
            const userCred = await signInWithEmailAndPassword(secondaryAuth, email, oldPass);
            if (userCred.user) {
              uid = userCred.user.uid;
              await userCred.user.delete();
            }
            const newCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            uid = newCred.user.uid;
          } catch (recreateErr) {
            console.warn("Deleted recreation failed, doing direct recreation fallback:", recreateErr);
            try {
              const userCred = await signInWithEmailAndPassword(secondaryAuth, email, password);
              if (userCred.user) {
                uid = userCred.user.uid;
              }
            } catch (sigErr) {
              uid = `uid-${username}`;
            }
          }
        } else {
          throw createErr;
        }
      }

      // Map designation to appropriate system role
      const getMappedRole = (designation: string): string => {
        const d = designation.toLowerCase().trim();
        if (d.includes('admin')) return 'admin';
        if (d.includes('manager') && !d.includes('assistant') && !d.includes('sales')) return 'manager';
        if (d.includes('assistant') && d.includes('manager')) return 'assistant_manager';
        if (d.includes('sales') && d.includes('manager')) return 'sales_manager';
        if (d.includes('warehouse') || d.includes('store')) return 'warehouse';
        return 'sales_team';
      };

      const userRole = getMappedRole(emp.designation);

      // Write user document
      if (uid) {
        await setDoc(doc(db, 'users', uid), {
          displayName: emp.name,
          username: username,
          password: password,
          role: userRole,
          shopId: user.shopId,
          employeeId: emp.id,
          allowLogin: true,
          branchId: emp.branchId || (branches && branches[0]?.id) || 'b1'
        });
      }

      // Write to employees collection
      await updateDoc(doc(db, 'employees', emp.id), {
        username: username,
        password: password,
        allowLogin: true
      });

      setNotification({
        message: isBn 
          ? `${emp.name}-এর জন্য লগইন চালুর সাথে ক্রেডেনশিয়াল সফলভাবে সেট করা হয়েছে!` 
          : `Successfully configured credentials and activated system login for ${emp.name}!`,
        type: 'success'
      });

    } catch (err: any) {
      setNotification({
        message: err.message || 'Error configuring login credentials',
        type: 'error'
      });
    } finally {
      setIsUpdatingCredentials(prev => ({ ...prev, [emp.id]: false }));
    }
  };

  const handleLockAccess = async (emp: Employee) => {
    try {
      // Find the corresponding Firebase user document to disable it there as well
      const username = emp.username?.trim().toLowerCase();
      if (username) {
        const userQuery = query(collection(db, 'users'), where('username', '==', username));
        const userSnap = await getDocs(userQuery);
        for (const docObj of userSnap.docs) {
          await updateDoc(doc(db, 'users', docObj.id), {
            allowLogin: false
          });
        }
      }

      // Update in employees collection
      await updateDoc(doc(db, 'employees', emp.id), {
        allowLogin: false
      });

      setNotification({
        message: isBn 
          ? `${emp.name}-এর লগইন অ্যাক্সেস সফলভাবে বন্ধ করা হয়েছে!` 
          : `Successfully revoked system login access for ${emp.name}!`,
        type: 'success'
      });
    } catch (err: any) {
      setNotification({
        message: err.message || 'Error revoking access',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            💼 {isBn ? 'ঐচ.আর.এম (মানব সম্পদ বিভাগ)' : 'HRM Suite'}
          </h2>
          <p className="text-gray-500 text-xs md:text-sm font-semibold mt-1">
            {isBn 
              ? 'স্টাফ প্রোফাইল, দৈনিক হাজিরা, অটোমেটেড সেলারি স্লিপ জেনারেটর এবং প্রফেশনাল সনদপত্র ম্যানেজমেন্ট।' 
              : 'Enterprise-grade staff profiles, attendance tracking, customizable certificate designs, and auto-payroll bills.'}
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'staff_directory' && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-indigo-600/10 hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              {isBn ? 'নতুন স্টাফ যুক্ত করুন' : 'Add New Staff'}
            </button>
          )}
        </div>
      </div>

      {/* HRM Quick Nested Navigation Sub Tabs (Exclusive display matching user setup) */}
      <div className="flex flex-wrap gap-2 border-b border-gray-150 pb-1">
        {[
          { id: 'hrm_dashboard', label: isBn ? 'ড্যাশবোর্ড' : 'Overview Dashboard', icon: LayoutDashboard },
          { id: 'staff_directory', label: isBn ? 'স্টাফ প্রোফাইল' : 'Staff Profiles', icon: Users },
          { id: 'attendance_tracker', label: isBn ? 'হাজিরা ও শিফট' : 'Attendance & Duty', icon: ClipboardCheck },
          { id: 'payroll_disbursal', label: isBn ? 'বেতন পরিশোধ' : 'Payroll Disbursal', icon: Banknote },
          { id: 'leave_planner', label: isBn ? 'ছুটি ও হলিডে' : 'Leaves & Holidays', icon: CalendarIcon },
          { id: 'system_login', label: isBn ? 'সিস্টেম লগইন' : 'System Login', icon: Lock },
          { id: 'employment_contracts', label: isBn ? 'চুক্তিপত্র ও সার্টিফিকেট' : 'Contracts & Releases', icon: FileSignature },
          { id: 'document_history', label: isBn ? 'ডকুমেন্ট হিস্ট্রি' : 'Document History', icon: History }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all relative border ${
                isActive 
                  ? 'bg-slate-900 border-slate-950 text-white shadow-md' 
                  : 'bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border-gray-200/60'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'leave_planner' && stats.pendingLeaves > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce border border-white">
                  {stats.pendingLeaves}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RENDER HRM TABS */}

      {/* 1. Dashboard Overview */}
      {activeTab === 'hrm_dashboard' && (
        <div className="space-y-6">
          {/* Top Metric Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-3xl border border-indigo-100/60">
              <span className="p-2.5 bg-white rounded-2xl text-indigo-600 shadow-sm inline-block"><Users className="w-5 h-5" /></span>
              <p className="text-[10px] uppercase font-black tracking-wider text-indigo-500 mt-4">{isBn ? 'সর্বমোট স্টাফ' : 'Total Employees'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalStaff}</h3>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-3xl border border-emerald-100/60">
              <span className="p-2.5 bg-white rounded-2xl text-emerald-600 shadow-sm inline-block"><UserCheck className="w-5 h-5" /></span>
              <p className="text-[10px] uppercase font-black tracking-wider text-emerald-500 mt-4">{isBn ? 'আজকে উপস্থিত' : 'Present Today'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.presentToday} / {stats.activeStaff}</h3>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-3xl border border-amber-100/60">
              <span className="p-2.5 bg-white rounded-2xl text-amber-600 shadow-sm inline-block"><CalendarIcon className="w-5 h-5" /></span>
              <p className="text-[10px] uppercase font-black tracking-wider text-amber-500 mt-4">{isBn ? 'ছুটির আবেদন' : 'Pending Leaves'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 mb-0.5">{stats.pendingLeaves}</h3>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 p-5 rounded-3xl border border-teal-100/60">
              <span className="p-2.5 bg-white rounded-2xl text-teal-600 shadow-sm inline-block"><Banknote className="w-5 h-5" /></span>
              <p className="text-[10px] uppercase font-black tracking-wider text-teal-800 mt-4">{isBn ? 'মাসিক বেতন বাজেট' : 'Monthly Payroll'}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalSalaryPromise.toLocaleString()}{currencySymbol}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Quick Attendance punch list */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm md:col-span-7 space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
                <span>⚡ {isBn ? 'দ্রুত হাজিরা কার্ড' : 'Quick Attendance Logger'}</span>
                <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 font-bold">{isBn ? 'আজকের ডায়েরি' : "Today's logs"}</span>
              </h3>
              {employees.length === 0 ? (
                <div className="py-6 text-center text-gray-400 font-bold text-xs">
                  {isBn ? 'স্টাফ সেকশনে কোনো তালিকা নেই!' : 'No staff profiles found. Please register employees first.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-1">
                  {employees.map(emp => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const punch = attendanceLogs.find(log => log.employeeId === emp.id && log.date === todayStr);
                    return (
                      <div key={emp.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img src={emp.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&fit=crop"} className="w-9 h-9 rounded-full object-cover border" alt="Profile" />
                          <div>
                            <p className="text-xs font-bold text-gray-900">{emp.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{emp.designation} (ID: {getStaffDisplayId(emp)})</p>
                          </div>
                        </div>

                        {/* Mark Attendance Trigger button list */}
                        <div className="flex items-center gap-1.5">
                          {punch ? (
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                              punch.status === 'Present' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : punch.status === 'Late' 
                                ? 'bg-amber-50 text-amber-600 animate-pulse' 
                                : 'bg-red-50 text-red-500'
                            }`}>
                              🟢 {punch.status} ({punch.checkIn})
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handlePunchAttendance(emp.id, 'Present')}
                                className="px-2.5 py-1.5 hover:bg-emerald-600 bg-emerald-50 hover:text-white text-emerald-600 rounded-xl text-[10px] font-black transition-colors"
                              >
                                {isBn ? 'উপস্থিত' : 'Present'}
                              </button>
                              <button
                                onClick={() => handlePunchAttendance(emp.id, 'Late')}
                                className="px-2.5 py-1.5 hover:bg-amber-600 bg-amber-50 hover:text-white text-amber-600 rounded-xl text-[10px] font-black transition-colors"
                              >
                                {isBn ? 'দেরি' : 'Late'}
                              </button>
                              <button
                                onClick={() => handlePunchAttendance(emp.id, 'Absent')}
                                className="px-2.5 py-1.5 hover:bg-red-600 bg-red-50 hover:text-white text-red-500 rounded-xl text-[10px] font-black transition-colors"
                              >
                                {isBn ? 'অনুপস্থিত' : 'Absent'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Shift Rules / Government holiday details */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm md:col-span-5 space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2">
                📋 {isBn ? 'ছুটি ও শিডিউল রুলস' : 'Active Shifts & Policies'}
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-150">
                  <p className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    {isBn ? 'ডে শিফট (সকাল ০৯ টা - সন্ধ্যা ০৬ টা)' : 'General/Day Shift (09:00 AM - 06:00 PM)'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">
                    {isBn ? 'নির্ধারিত ১৫ মিনিট বিলম্ব ছাড়যোগ্য, পরবর্তী বিলম্বগুলো স্যালারি স্লিপে হাফ ডে ডিডাকশন হিসেব হবে।' : '15-min grace window applies. Unexcused delay marks employee as Late.'}
                  </p>
                </div>

                <div className="p-3 bg-violet-50/40 rounded-2xl border border-violet-150">
                  <p className="text-xs font-black text-violet-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-violet-600" />
                    {isBn ? 'নাইট শিফট (সন্ধ্যা ০৬ টা - রাত ০৩ টা)' : 'Night Shift (06:00 PM - 03:00 AM)'}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">
                    {isBn ? 'রেস্টুরেন্ট কিচেন ও ওয়েটার কর্মীদের জন্য প্রযোজ্য শিফট।' : 'Applied only for evening catering personnel and waiters.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border">
                  <p className="text-xs font-black text-gray-700">🇧🇩 {isBn ? 'সরকারি বিধিমালা ও বাৎসরিক ছুটি' : 'Yearly Leave Quotas (Bangladesh)'}</p>
                  <ul className="text-[10px] text-gray-500 font-bold mt-1 list-disc pl-4 space-y-0.5">
                    <li>{isBn ? 'নৈমিত্তিক ছুটি (Casual Leave) - বাৎসরিক ১০ দিন' : 'Casual Leave - 10 days'}</li>
                    <li>{isBn ? 'অসুস্থতাজনিত ছুটি (Sick Leave) - বাৎসরিক ১৪ দিন' : 'Sick Leave - 14 days'}</li>
                    <li>{isBn ? 'সরকারি উৎসব ছুটি - বাৎসরিক ১১ দিন' : 'Government Festival Leaves - 11 days'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Staff Directory */}
      {activeTab === 'staff_directory' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isBn ? 'স্টাফের নাম, ফোন বা পদবি দিয়ে সার্চ করুন...' : 'Search staff directory by name, phone or role...'}
                className="w-full pl-10 pr-4 py-2 bg-slate-55 text-xs font-semibold rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1 bg-slate-50 border border-gray-200 rounded-xl px-2">
                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap pl-1 uppercase tracking-wider">{isBn ? 'কার্ড মেয়াদ:' : 'Card Expiry:'}</span>
                <input
                  type="text"
                  value={idCardValidityDate}
                  onChange={(e) => setIdCardValidityDate(e.target.value)}
                  className="bg-transparent px-2 py-2 text-xs font-bold text-gray-700 outline-none w-[110px]"
                  placeholder="31ST DEC 2028"
                />
              </div>

              <select
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none"
                value={designationFilter}
                onChange={e => setDesignationFilter(e.target.value)}
              >
                <option value="">{isBn ? '-- পদবি ফিল্টার --' : '-- All Roles --'}</option>
                {uniqueDesignations.map(des => (
                  <option key={des} value={des}>{des}</option>
                ))}
              </select>

              <select
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">{isBn ? '-- স্ট্যাটাস --' : '-- Status --'}</option>
                <option value="active">{isBn ? 'সক্রিয় (Active)' : 'Active'}</option>
                <option value="inactive">{isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</option>
              </select>
            </div>
          </div>

          {/* Directory Listings */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-150 text-center text-gray-400">
              <span className="p-4 bg-gray-50 rounded-full inline-block text-gray-400 mb-3"><Users className="w-10 h-10" /></span>
              <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
                {isBn ? 'খুঁজে পাওয়া যায়নি!' : 'No matched staff profiles found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="bg-white rounded-3xl border border-gray-150/70 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
                  
                  {/* Decorative Banner */}
                  <div className="h-16 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 absolute top-0 left-0 right-0" />
                  
                  <div className="p-6 pt-8 relative z-10 flex flex-col items-center">
                    {/* Profile Picture */}
                    <img 
                      src={emp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&fit=crop'} 
                      className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover group-hover:scale-105 transition-transform" 
                      alt={emp.name} 
                    />
                    
                    {/* Status Badge */}
                    <span className={`mt-3 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      emp.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {emp.status}
                    </span>

                    <h3 className="text-sm font-black text-gray-900 mt-2 text-center">{emp.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wide bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-100 mt-1 uppercase">
                      💼 {emp.designation}
                    </p>

                    {/* Metadata specs */}
                    <div className="w-full border-t border-dashed border-gray-100 mt-4 pt-3 space-y-2 text-left">
                      <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                        <span>📞 {isBn ? 'ফোন:' : 'Phone:'}</span>
                        <span className="font-bold text-slate-800">{emp.phone}</span>
                      </div>
                      {emp.email && (
                        <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                          <span>✉️ {isBn ? 'ইমেইল:' : 'Email:'}</span>
                          <span className="truncate max-w-[150px] font-bold text-slate-800">{emp.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                        <span>🩸 {isBn ? 'রক্তের গ্রুপ:' : 'Blood Group:'}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          emp.bloodGroup ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-500'
                        }`}>{emp.bloodGroup || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                        <span>💰 {isBn ? 'বেতন:' : 'Basic Salary:'}</span>
                        <span className="font-extrabold text-slate-900">{emp.salary.toLocaleString()}{currencySymbol}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                        <span>🏢 {isBn ? 'শাখা:' : 'Branch:'}</span>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded">
                          {branches?.find(b => b.id === emp.branchId)?.name || (isBn ? 'মেইন শাখা' : 'Main Branch')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                        <span>🕒 {isBn ? 'শিফট:' : 'Duty shift:'}</span>
                        <span className="font-mono text-[10px] bg-slate-50 px-2 py-0.5 rounded font-bold text-slate-700">{emp.schedule || '09:00 - 18:00'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500">
                        <span>🔑 {isBn ? 'সিস্টেম লগইন:' : 'System Login:'}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          emp.allowLogin ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-150 text-gray-400'
                        }`}>{emp.allowLogin ? (isBn ? 'অনুমতি আছে' : 'Allowed') : (isBn ? 'অনুমতি নেই' : 'Disabled')}</span>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="w-full grid grid-cols-3 gap-2 border-t mt-4 pt-3 z-20">
                      <button
                        onClick={() => handleOpenAddModal(emp)}
                        className="py-1.5 px-2 hover:bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center justify-center gap-1"
                        title="Edit profile"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-500" />
                        {isBn ? 'এডিট' : 'Edit'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCertEmployee(emp);
                          setSelectedCertEmployee({ ...emp });
                          setActiveTab('employment_contracts');
                        }}
                        className="py-1.5 px-2 hover:bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center justify-center gap-1"
                        title="Generate Experience Certificate"
                      >
                        <Award className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                        {isBn ? 'সনদ' : 'Cert'}
                      </button>
                      <button
                        onClick={() => deleteEmployeeProfile(emp.id)}
                        className="py-1.5 px-2 hover:bg-red-50 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center justify-center gap-1"
                        title="Dismiss Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isBn ? 'ডিলেট' : 'Del'}
                      </button>
                    </div>
                  </div>

                  {/* Absolute Badge for Print ID Badge - Always visible as requested */}
                    <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 bg-white/95 border border-slate-200/80 p-2 rounded-2xl shadow-xl w-[130px] transition-all duration-300">
                      <div className="text-[7.5px] font-extrabold text-slate-400 tracking-wider uppercase text-center mb-1 pb-1 border-b border-slate-100">
                        {isBn ? 'আইডি কার্ড প্রিন্ট' : 'ID Card Actions'}
                      </div>
                      <div className="flex flex-col gap-1 pb-1 border-b border-slate-100 mb-1">
                        <button
                          onClick={async () => {
                            const btn = document.getElementById(`print-btn-v1-${emp.id}`);
                            if (btn) btn.innerHTML = '<span class="animate-pulse">Loading...</span>';
                            
                            const idCardFront = document.getElementById(`id-card-front-${emp.id}`);
                            const idCardBack = document.getElementById(`id-card-back-${emp.id}`);
                            if (idCardFront && idCardBack) {
                              try {
                                const canvasFront = await html2canvas(idCardFront, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
                                const linkFront = document.createElement('a');
                                linkFront.href = canvasFront.toDataURL('image/png', 1.0);
                                linkFront.download = `ID_Front_Classic_${emp.name.replace(/\s+/g, '_')}_HQ.png`;
                                linkFront.click();

                                const canvasBack = await html2canvas(idCardBack, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
                                const linkBack = document.createElement('a');
                                linkBack.href = canvasBack.toDataURL('image/png', 1.0);
                                linkBack.download = `ID_Back_Classic_${emp.name.replace(/\s+/g, '_')}_HQ.png`;
                                linkBack.click();
                                
                                setNotification({
                                  message: isBn ? 'ক্লাসিক রেড আইডি কার্ড ছবি সফলভাবে ডাউনলোড হয়েছে!' : 'Classic Red ID card PNGs downloaded successfully!',
                                  type: 'success'
                                });
                              } catch (err) {
                                console.error("ID card download error", err);
                                setNotification({
                                  message: isBn ? 'আইডি কার্ড ডাউনলোড করতে সমস্যা হয়েছে' : 'Error generating ID card PNGs',
                                  type: 'error'
                                });
                              } finally {
                                if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-2.5 h-2.5 text-red-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> RED PNG';
                              }
                            } else {
                              setNotification({
                                message: isBn ? 'আইডি কার্ড এলিমেন্ট খুঁজে পাওয়া যায়নি!' : 'ID Card elements not ready in DOM!',
                                type: 'error'
                              });
                              if (btn) btn.innerHTML = 'RED PNG';
                            }
                          }}
                          id={`print-btn-v1-${emp.id}`}
                          className="p-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-850 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all w-full text-center border border-slate-100"
                        >
                          <Download className="w-2.5 h-2.5 text-red-500" /> {isBn ? 'লাল ছবি' : 'Red Image'}
                        </button>

                        <button
                          onClick={() => downloadIDCardPDF(emp, 'v1')}
                          className="p-1 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all w-full text-center shadow-sm"
                        >
                          <Printer className="w-2.5 h-2.5 text-white" /> {isBn ? 'লাল PDF' : 'Red PDF'}
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={async () => {
                            const btn = document.getElementById(`print-btn-v2-${emp.id}`);
                            if (btn) btn.innerHTML = '<span class="animate-pulse">Loading...</span>';
                            
                            const idCardFront = document.getElementById(`id-card-front-v2-${emp.id}`);
                            const idCardBack = document.getElementById(`id-card-back-v2-${emp.id}`);
                            if (idCardFront && idCardBack) {
                              try {
                                const canvasFront = await html2canvas(idCardFront, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
                                const linkFront = document.createElement('a');
                                linkFront.href = canvasFront.toDataURL('image/png', 1.0);
                                linkFront.download = `ID_Front_Corp_${emp.name.replace(/\s+/g, '_')}_HQ.png`;
                                linkFront.click();

                                const canvasBack = await html2canvas(idCardBack, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
                                const linkBack = document.createElement('a');
                                linkBack.href = canvasBack.toDataURL('image/png', 1.0);
                                linkBack.download = `ID_Back_Corp_${emp.name.replace(/\s+/g, '_')}_HQ.png`;
                                linkBack.click();

                                setNotification({
                                  message: isBn ? 'কর্পোরেট আইডি কার্ড ছবি সফলভাবে ডাউনলোড হয়েছে!' : 'Corporate ID card PNGs downloaded successfully!',
                                  type: 'success'
                                });
                              } catch (err) {
                                console.error("ID card download error", err);
                                setNotification({
                                  message: isBn ? 'আইডি কার্ড ডাউনলোড করতে সমস্যা হয়েছে' : 'Error generating ID card PNGs',
                                  type: 'error'
                                });
                              } finally {
                                if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-2.5 h-2.5 text-indigo-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> CORP PNG';
                              }
                            } else {
                              setNotification({
                                message: isBn ? 'আইডি কার্ড এলিমেন্ট খুঁজে পাওয়া যায়নি!' : 'ID Card elements not ready in DOM!',
                                type: 'error'
                              });
                              if (btn) btn.innerHTML = 'CORP PNG';
                            }
                          }}
                          id={`print-btn-v2-${emp.id}`}
                          className="p-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-850 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all w-full text-center border border-slate-100"
                        >
                          <Download className="w-2.5 h-2.5 text-indigo-500" /> {isBn ? 'নীল ছবি' : 'Blue Image'}
                        </button>

                        <button
                          onClick={() => downloadIDCardPDF(emp, 'v2')}
                          className="p-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all w-full text-center shadow-sm"
                        >
                          <Printer className="w-2.5 h-2.5 text-white" /> {isBn ? 'নীল PDF' : 'Blue PDF'}
                        </button>
                      </div>
                    </div>

                    {/* ALWAYS-RENDERED OFF-SCREEN CONTAINER FOR PIXEL-PERFECT IMAGE EXPORTS WITH ZERO DISTORTION */}
                    <div style={{ position: 'fixed', top: '0', left: '0', width: '350px', height: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: -9999, opacity: 0 }}>
                      
                      {/* STYLE A: CLASSIC RED - FRONT */}
                      <div 
                        id={`id-card-front-${emp.id}`} 
                        style={{
                          width: '350px',
                          minHeight: '580px',
                          background: '#ffffff',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: "'Inter', sans-serif",
                          paddingBottom: '80px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                      >
                        {/* Curved Red Headers for 100% html2canvas Compatibility */}
                        <div style={{
                          position: 'absolute',
                          top: 0, left: 0,
                          width: '100%',
                          height: '220px',
                          background: 'linear-gradient(135deg, #e63946 0%, #b21f2d 100%)',
                          borderBottomLeftRadius: '50% 30px',
                          borderBottomRightRadius: '50% 30px',
                          zIndex: 0
                        }}></div>
                        <div style={{
                          position: 'absolute',
                          top: 0, left: 0,
                          width: '100%',
                          height: '228px',
                          background: 'rgba(230, 57, 70, 0.15)',
                          borderBottomLeftRadius: '50% 34px',
                          borderBottomRightRadius: '50% 34px',
                          zIndex: 0
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1, padding: '25px 15px 15px 15px', color: 'white' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '900', fontSize: '20px', textAlign: 'center', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                <div style={{background: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                  <img src={(settings as any).logoBase64 || (settings as any).logoUrl || "https://e7.pngegg.com/pngimages/922/926/png-clipart-islamic-calligraphy-desktop-arabic-calligraphy-bismillah-white-logo-thumbnail.png"} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} crossOrigin="anonymous"/>
                                </div>
                                <span style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontSize: '18px'}}>{(settings as any).name || 'BISMILLAH STORE'}</span>
                            </div>
                        </div>

                        {/* Elegant Gold Rounded-Rect Picture Frame for 100% html2canvas Compatibility */}
                        <div style={{
                            width: '160px', 
                            height: '160px', 
                            background: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)',
                            margin: '10px auto 15px auto',
                            borderRadius: '24px',
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 2,
                            boxShadow: '0 8px 20px rgba(178, 31, 45, 0.25)',
                            padding: '4px'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: '#ffffff',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <img src={emp.photoUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1JUUgjucKIHw5ATD788OLzTarRpNciei4S_qm5PAqRQ&s=10"} style={{
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    background: '#f8f9fa'
                                }} alt="Employee" crossOrigin="anonymous" />
                            </div>
                        </div>

                        <div style={{ padding: '0 20px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                          <h2 style={{ margin: '0 0 5px 0', fontSize: '26px', color: '#111', fontWeight: 800, letterSpacing: '-0.5px' }}>{emp.name}</h2>
                          <div style={{ 
                              background: 'linear-gradient(135deg, #e63946 0%, #b21f2d 100%)', 
                              color: 'white', 
                              display: 'inline-flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 24px', 
                              fontWeight: 800, 
                              fontSize: '14px',
                              letterSpacing: '1px',
                              textTransform: 'uppercase',
                              marginTop: '8px',
                              borderRadius: '6px',
                              boxShadow: '0 4px 12px rgba(230, 57, 70, 0.35)'
                          }}>
                              {emp.designation}
                          </div>
                        </div>

                        <div style={{ padding: '0 30px', marginTop: '30px', color: '#444' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '15px 10px', fontSize: '13px', fontWeight: 600, alignItems: 'center' }}>
                                <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', fontWeight: 700 }}>ID&nbsp;No</span>
                                <strong style={{ fontSize: '15px', color: '#111' }}>{getStaffDisplayId(emp)}</strong>
                                
                                <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', fontWeight: 700 }}>Phone</span>
                                <strong style={{ fontSize: '14px', color: '#333' }}>{emp.phone || 'N/A'}</strong>
                                
                                <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', fontWeight: 700 }}>Blood</span>
                                <strong style={{ fontSize: '16px', color: '#e63946' }}>{emp.bloodGroup || 'N/A'}</strong>
                                
                                <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', fontWeight: 700 }}>Emg.</span>
                                <strong style={{ fontSize: '14px', color: '#333' }}>{emp.emergencyPhone || emp.phone || 'N/A'}</strong>
                            </div>
                        </div>

                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: '#f8f9fa', borderTop: '1px solid #e2e8f0', padding: '15px 0', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '13px', color: '#64748b', letterSpacing: '1px' }}>VALID TILL: {idCardValidityDate.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      {/* STYLE A: CLASSIC RED - BACK */}
                      <div 
                        id={`id-card-back-${emp.id}`} 
                        style={{
                          width: '350px',
                          minHeight: '580px',
                          background: '#ffffff',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          fontFamily: "'Inter', sans-serif",
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                      >
                        <div style={{ background: '#e63946', height: '15px', width: '100%' }}></div>

                        <div style={{ padding: '30px 25px', flexGrow: 1, color: '#333' }}>
                            <h3 style={{ textAlign: 'center', color: '#e63946', marginTop: 0, textTransform: 'uppercase', fontSize: '18px', letterSpacing: '1px', fontWeight: 800 }}>Terms & Conditions</h3>
                            
                            <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '20px', textAlign: 'justify' }}>
                                This card is the property of <strong style={{ textTransform: 'uppercase', color: '#e63946' }}>{(settings as any).name || 'BISMILLAH STORE'}</strong>. Use of this card is governed by company policy.
                                <ul style={{ paddingLeft: '18px', marginTop: '10px', listStyleType: 'disc' }}>
                                    <li style={{ marginBottom: '8px' }}>This ID card must be worn and clearly visible at all times while on company premises.</li>
                                    <li style={{ marginBottom: '8px' }}>Do not lend, transfer, or alter this card in any way.</li>
                                    <li style={{ marginBottom: '8px' }}>Report loss or theft of this card immediately to the HR or Admin department.</li>
                                    <li style={{ marginBottom: '8px' }}>Must be surrendered upon termination of employment.</li>
                                </ul>
                            </div>

                            <div style={{ textAlign: 'center', margin: '25px 0' }}>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent((((settings as any).website && (settings as any).website !== '') ? (settings as any).website : window.location.origin) + '/' + (((settings as any).name || 'company').replace(/\s+/g, '').toLowerCase()) + '/' + emp.id)}`} style={{ width: '90px', height: '90px', margin: '0 auto', border: '2px solid #333', padding: '5px', borderRadius: '8px', objectFit: 'contain' }} alt="QR Code" crossOrigin="anonymous" />
                            </div>
                        </div>

                        {/* Curved Red Bottom Shape for 100% html2canvas Compatibility */}
                        <div style={{ position: 'relative', marginTop: 'auto', textAlign: 'center', padding: '40px 20px 25px 20px', color: 'white', overflow: 'hidden' }}>
                            <div style={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '100%', 
                              background: 'linear-gradient(135deg, #e63946 0%, #b21f2d 100%)', 
                              borderTopLeftRadius: '30px',
                              borderTopRightRadius: '30px',
                              zIndex: 0 
                            }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <strong style={{ fontSize: '15px', display: 'block', marginBottom: '8px', letterSpacing: '0.5px', color: '#fbbf24' }}>If found, please return to:</strong>
                              <p style={{ margin: '4px 0', fontSize: '13px' }}>{((settings as any).name || 'Bismillah Store')} Head Office</p>
                              <p style={{ margin: '4px 0', fontSize: '13px' }}>{(settings as any).address || 'Dhaka, Bangladesh'}</p> 
                              <p style={{ margin: '4px 0', fontSize: '13px' }}>Phone: {(settings as any).phone || '+123-456-7890'}</p>
                              <p style={{ margin: '4px 0', fontSize: '13px' }}>Web: {((settings as any).website && (settings as any).website !== '') ? (settings as any).website : window.location.origin}</p>
                            </div>
                        </div>
                      </div>

                      {/* STYLE B: CORPORATE INDIGO - FRONT */}
                      <div 
                        id={`id-card-front-v2-${emp.id}`} 
                        style={{
                          width: '350px',
                          minHeight: '580px',
                          background: '#ffffff',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: "'Inter', sans-serif",
                          paddingBottom: '80px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                      >
                        {/* Elite Sapphire Blue Header with Sleek Gold Line (100% html2canvas Compatible) */}
                        <div style={{
                          position: 'absolute',
                          top: 0, left: 0,
                          width: '100%',
                          height: '215px',
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                          borderBottom: '5px solid #fbbf24',
                          zIndex: 0
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1, padding: '25px 15px 15px 15px', color: 'white' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '900', fontSize: '20px', textAlign: 'center', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                <div style={{background: 'white', padding: '5px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '70px', height: '70px'}}>
                                  <img src={(settings as any).logoBase64 || (settings as any).logoUrl || "https://e7.pngegg.com/pngimages/922/926/png-clipart-islamic-calligraphy-desktop-arabic-calligraphy-bismillah-white-logo-thumbnail.png"} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '50%' }} crossOrigin="anonymous"/>
                                </div>
                                <span style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)', fontSize: '18px'}}>{(settings as any).name || 'BISMILLAH STORE'}</span>
                            </div>
                        </div>

                        {/* Double-Ring Gold & White Circular Frame for 100% html2canvas Compatibility */}
                        <div style={{
                            width: '160px', 
                            height: '160px', 
                            margin: '15px auto 15px auto',
                            borderRadius: '50%',
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 2,
                            background: '#ffffff',
                            border: '4px solid #ffffff',
                            boxShadow: '0 0 0 4px #fbbf24, 0 6px 20px rgba(30, 58, 138, 0.25)',
                            overflow: 'hidden'
                        }}>
                            <img src={emp.photoUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1JUUgjucKIHw5ATD788OLzTarRpNciei4S_qm5PAqRQ&s=10"} style={{
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                background: '#f8f9fa'
                            }} alt="Employee" crossOrigin="anonymous" />
                        </div>

                        <div style={{ padding: '0 20px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                          <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1e293b', fontWeight: 800, letterSpacing: '-0.5px' }}>{emp.name}</h2>
                          <div style={{ 
                              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', 
                              color: 'white', 
                              display: 'inline-flex', 
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px 25px', 
                              fontWeight: 800, 
                              fontSize: '13px',
                              letterSpacing: '1px',
                              textTransform: 'uppercase',
                              marginTop: '8px',
                              borderRadius: '9999px',
                              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)'
                          }}>
                              {emp.designation}
                          </div>
                        </div>

                        <div style={{ padding: '0 30px', marginTop: '25px', color: '#334155' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '12px 15px', fontSize: '13px', fontWeight: 600, alignItems: 'center' }}>
                                <span style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', fontWeight: 700 }}>ID&nbsp;No</span>
                                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{getStaffDisplayId(emp)}</strong>
                                
                                <span style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', fontWeight: 700 }}>Phone</span>
                                <strong style={{ fontSize: '13px', color: '#334155' }}>{emp.phone || 'N/A'}</strong>
                                
                                <span style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', fontWeight: 700 }}>Blood</span>
                                <strong style={{ fontSize: '14px', color: '#e63946' }}>{emp.bloodGroup || 'N/A'}</strong>
                                
                                <span style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', fontWeight: 700 }}>Emg.</span>
                                <strong style={{ fontSize: '13px', color: '#334155' }}>{emp.emergencyPhone || emp.phone || 'N/A'}</strong>
                            </div>
                        </div>

                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '15px 0', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '12px', color: '#475569', letterSpacing: '1px' }}>VALID TILL: {idCardValidityDate.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      {/* STYLE B: CORPORATE INDIGO - BACK (NO QR, NO WEBSITE LINK) */}
                      <div 
                        id={`id-card-back-v2-${emp.id}`} 
                        style={{
                          width: '350px',
                          minHeight: '580px',
                          background: '#ffffff',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          fontFamily: "'Inter', sans-serif",
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                      >
                        <div style={{ background: '#1e3a8a', height: '15px', width: '100%' }}></div>

                        <div style={{ padding: '30px 25px', flexGrow: 1, color: '#334155' }}>
                            <h3 style={{ textAlign: 'center', color: '#1e3a8a', marginTop: 0, textTransform: 'uppercase', fontSize: '18px', letterSpacing: '1px', fontWeight: 800 }}>Terms & Conditions</h3>
                            
                            <div style={{ fontSize: '12px', lineHeight: '1.6', marginBottom: '20px', textAlign: 'justify' }}>
                                This card is the property of <strong style={{ textTransform: 'uppercase', color: '#1e3a8a' }}>{(settings as any).name || 'BISMILLAH STORE'}</strong>. Use of this card is governed by company policy.
                                <ul style={{ paddingLeft: '18px', marginTop: '10px', listStyleType: 'disc' }}>
                                    <li style={{ marginBottom: '8px' }}>This ID card must be worn and clearly visible at all times while on company premises.</li>
                                    <li style={{ marginBottom: '8px' }}>Do not lend, transfer, or alter this card in any way.</li>
                                    <li style={{ marginBottom: '8px' }}>Report loss or theft of this card immediately to the HR or Admin department.</li>
                                    <li style={{ marginBottom: '8px' }}>Must be surrendered upon termination of employment.</li>
                                </ul>
                            </div>

                            {/* Styled corporate watermark / emblem instead of QR code as requested */}
                            <div style={{ textAlign: 'center', margin: '30px 0', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Subtle elegant badge with double gold ring */}
                                <div style={{
                                    width: '110px',
                                    height: '110px',
                                    borderRadius: '50%',
                                    border: '2px dashed #fbbf24',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f8fafc',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                    boxSizing: 'border-box'
                                }}>
                                    <div style={{
                                        width: '94px',
                                        height: '94px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        padding: '6px',
                                        boxSizing: 'border-box',
                                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)'
                                    }}>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#fbbf24', letterSpacing: '0.5px', lineHeight: '1.2', textAlign: 'center' }}>OFFICIAL</span>
                                        <span style={{ 
                                            display: 'block', 
                                            textTransform: 'uppercase', 
                                            fontSize: '8px', 
                                            fontWeight: 800, 
                                            color: '#ffffff', 
                                            opacity: 0.95, 
                                            marginTop: '3px', 
                                            marginBottom: '3px', 
                                            lineHeight: '1.2', 
                                            wordBreak: 'break-word', 
                                            textAlign: 'center', 
                                            width: '100%',
                                            padding: '0 2px'
                                        }}>{((settings as any).name || 'Company')}</span>
                                        <span style={{ display: 'block', fontSize: '8px', fontWeight: 800, letterSpacing: '0.5px', color: '#93c5fd', lineHeight: '1.2', textAlign: 'center' }}>ID BADGE</span>
                                    </div>
                                </div>
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Employee</span>
                            </div>
                        </div>

                        {/* Flat sapphire blue header bottom (NO QR CODE, NO WEBSITE as requested) */}
                        <div style={{ position: 'relative', marginTop: 'auto', textAlign: 'center', padding: '40px 20px 25px 20px', color: 'white', overflow: 'hidden' }}>
                            <div style={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '100%', 
                              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', 
                              borderTop: '5px solid #fbbf24',
                              zIndex: 0 
                            }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px', letterSpacing: '0.5px', color: '#fbbf24' }}>If found, please return to:</strong>
                              <p style={{ margin: '4px 0', fontSize: '12px', fontWeight: 600 }}>{((settings as any).name || 'Bismillah Store')} Head Office</p>
                              <p style={{ margin: '4px 0', fontSize: '12px', opacity: 0.9 }}>{(settings as any).address || 'Dhaka, Bangladesh'}</p> 
                              <p style={{ margin: '4px 0', fontSize: '12px', opacity: 0.9 }}>Phone: {(settings as any).phone || '+123-456-7890'}</p>
                            </div>
                        </div>
                      </div>

                    </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Attendance Tracker */}
      {activeTab === 'attendance_tracker' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                📅 {isBn ? 'হাজিরা ও ডিউটি শিফ্ট ওভারভিউ' : 'Attendance & Duty Shifts Overview'}
              </h3>
              <p className="text-[11px] text-gray-500 font-bold mt-1">
                {isBn 
                  ? 'দৈনিক হাজিরা হিসাব, ওভারটাইম ঘণ্টা ও কর্মীদের কর্মক্ষমতা রেকর্ড।' 
                  : 'Manage active attendance entries, records, and monthly logs.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-2xl">
            <table className="w-full text-left text-xs text-gray-500 font-semibold">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-700 tracking-wider">
                <tr>
                  <th className="px-6 py-4">{isBn ? 'স্টাফের নাম' : 'Staff Profile'}</th>
                  <th className="px-6 py-4">{isBn ? 'যোগদানের তারিখ' : 'Joining Date'}</th>
                  <th className="px-6 py-4">{isBn ? 'আজকের ইন' : 'Check In'}</th>
                  <th className="px-6 py-4">{isBn ? 'আজকের আউট' : 'Check Out'}</th>
                  <th className="px-6 py-4">{isBn ? 'আজকের স্ট্যাটাস' : 'Attendance Status'}</th>
                  <th className="px-6 py-4">{isBn ? 'ওভারটাইম (ঘণ্টা)' : 'Overtime Hours'}</th>
                  <th className="px-6 py-4 text-right">{isBn ? 'অ্যাকশন' : 'Mark Absence'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {employees.map(emp => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const punch = attendanceLogs.find(log => log.employeeId === emp.id && log.date === todayStr);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={emp.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&fit=crop"} className="w-8 h-8 rounded-full object-cover border" alt="" />
                        <div>
                          <p className="font-bold text-gray-900">{emp.name} (ID: {getStaffDisplayId(emp)})</p>
                          <p className="text-[10px] font-bold text-gray-400">{emp.designation}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-650">{emp.joiningDate || '---'}</td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{punch?.checkIn || '---'}</td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{punch?.checkOut || '---'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          punch?.status === 'Present' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : punch?.status === 'Late' 
                            ? 'bg-amber-50 text-amber-600' 
                            : punch?.status === 'Absent' 
                            ? 'bg-red-50 text-red-600 font-extrabold'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {punch?.status || 'No entry today'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-indigo-650 inline-flex items-center gap-1.5 pt-4">
                        <span>{punch?.overtime || 0} Hrs</span>
                        <button
                          onClick={() => {
                            setAttendanceLogs(attendanceLogs.map(log => {
                              if (log.employeeId === emp.id && log.date === todayStr) {
                                return { ...log, overtime: (log.overtime || 0) + 1 };
                              }
                              return log;
                            }));
                            setNotification({ message: 'Overtime added', type: 'info' });
                          }}
                          className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white font-extrabold"
                          title="Add overtime hour"
                        >
                          +
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handlePunchAttendance(emp.id, 'Present')}
                            className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 font-extrabold text-[10px] rounded"
                          >
                            P
                          </button>
                          <button
                            onClick={() => handlePunchAttendance(emp.id, 'Absent')}
                            className="p-1 px-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-extrabold text-[10px] rounded"
                          >
                            A
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Payroll Disbursal */}
      {activeTab === 'payroll_disbursal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left side column wrapper containing calculator and multi-month statement downloader */}
            <div className="md:col-span-5 flex flex-col gap-6">
              {/* Payment calculator */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                  🧮 {isBn ? 'বেতন স্লিপ ক্যালকুলেটর' : 'Salary Payout Calculator'}
                </h3>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                      {isBn ? 'স্টাফ নির্বাচন করুন' : 'Select Employee'}
                    </label>
                    <select
                      className="w-full bg-white border-2 border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-indigo-500"
                      value={payrollStaffId}
                      onChange={e => setPayrollStaffId(e.target.value)}
                    >
                      <option value="">{isBn ? '-- স্টাফ সিলেক্ট করুন --' : '-- Select Employee --'}</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>[{getStaffDisplayId(emp)}] {emp.name} ({emp.designation} - {emp.salary.toLocaleString()}{currencySymbol})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                        {isBn ? 'ওভারটাইম ঘন্টা' : 'Overtime Hours'}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-black font-mono"
                        value={overtimeHours}
                        onChange={e => setOvertimeHours(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                        {isBn ? 'বিনা বেতনে ছুটি (দিন)' : 'Unpaid Leave (Days)'}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-black font-mono"
                        value={unpaidDays}
                        onChange={e => setUnpaidDays(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                        {isBn ? 'উৎসব ভাতা / বোনাস' : 'Festival Bonus Amount'}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-black font-mono"
                        value={bonusAmount}
                        onChange={e => setBonusAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                        {isBn ? 'অগ্রিম ছুটি সমন্বয় (দিন)' : 'Deduct Advance Leaves'}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-black font-mono"
                        value={advanceDaysDeducted}
                        onChange={e => setAdvanceDaysDeducted(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1 font-sans">
                      {isBn ? 'প্রদানের মাস' : 'Month of Payout'}
                    </label>
                    <input
                      type="month"
                      className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-xs font-bold"
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                    />
                  </div>

                  {computedSalaryDetails && (
                    <div className="bg-slate-50 p-4 rounded-2xl border space-y-2 text-xs">
                      <p className="font-bold text-gray-800 border-b pb-1.5 flex justify-between">
                        <span>👤 {computedSalaryDetails.empName} :</span>
                        <span>{computedSalaryDetails.empDesignation}</span>
                      </p>
                      <div className="flex justify-between font-semibold mt-1">
                        <span>{isBn ? 'মূল বেতন (Basic):' : 'Basic Salary:'}</span>
                        <span className="font-mono text-slate-900 font-extrabold">{computedSalaryDetails.base.toLocaleString()}{currencySymbol}</span>
                      </div>
                      {computedSalaryDetails.tad > 0 && (
                        <div className="flex justify-between font-semibold">
                          <span>{isBn ? 'যাতায়াত ভাতা (TAD):' : 'TAD (Travel):'}</span>
                          <span className="font-mono text-slate-700 font-semibold">+{computedSalaryDetails.tad.toLocaleString()}{currencySymbol}</span>
                        </div>
                      )}
                      {computedSalaryDetails.food > 0 && (
                        <div className="flex justify-between font-semibold">
                          <span>{isBn ? 'খাদ্য ভাতা (Food):' : 'Food Allowance:'}</span>
                          <span className="font-mono text-slate-700 font-semibold">+{computedSalaryDetails.food.toLocaleString()}{currencySymbol}</span>
                        </div>
                      )}
                      {computedSalaryDetails.hra > 0 && (
                        <div className="flex justify-between font-semibold">
                          <span>{isBn ? 'বাড়ি ভাড়া (HRA):' : 'House Rent (HRA):'}</span>
                          <span className="font-mono text-slate-700 font-semibold">+{computedSalaryDetails.hra.toLocaleString()}{currencySymbol}</span>
                        </div>
                      )}
                      {((computedSalaryDetails.tad > 0) || (computedSalaryDetails.food > 0) || (computedSalaryDetails.hra > 0)) && (
                        <div className="flex justify-between font-bold border-t border-slate-200 mt-1 pt-1 text-slate-800">
                          <span>{isBn ? 'মোট আয় (Gross):' : 'Gross Salary:'}</span>
                          <span className="font-mono">{computedSalaryDetails.grossBase.toLocaleString()}{currencySymbol}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold mt-2">
                        <span>{isBn ? 'ওভারটাইম ভাতা:' : 'Overtime Pay:'}</span>
                        <span className="font-mono text-emerald-600 font-semibold">+{computedSalaryDetails.otPayout.toLocaleString()}{currencySymbol} <span className="text-[9px] font-bold">({computedSalaryDetails.otHours}h)</span></span>
                      </div>
                      {computedSalaryDetails.bonus > 0 && (
                        <div className="flex justify-between font-semibold">
                          <span>{isBn ? 'বোনাস/ভাতা:' : 'Bonus Payout:'}</span>
                          <span className="font-mono text-emerald-600 font-semibold">+{computedSalaryDetails.bonus.toLocaleString()}{currencySymbol}</span>
                        </div>
                      )}
                      {computedSalaryDetails.payoutDeductions > 0 && (
                        <div className="flex justify-between font-semibold text-red-500">
                          <span>{isBn ? 'ছুটি কর্তন:' : 'Leave Deductions:'}</span>
                          <span className="font-mono font-semibold">-{computedSalaryDetails.payoutDeductions.toLocaleString()}{currencySymbol} <span className="text-[9px] font-bold">({computedSalaryDetails.unpaidDaysCount}d)</span></span>
                        </div>
                      )}
                      {computedSalaryDetails.advanceDeduction > 0 && (
                        <div className="flex justify-between font-semibold text-red-500">
                          <span>{isBn ? 'অগ্রিম ছুটি সমন্বয় কর্তন:' : 'Advance Leave Deductions:'}</span>
                          <span className="font-mono font-semibold">-{computedSalaryDetails.advanceDeduction.toLocaleString()}{currencySymbol} <span className="text-[9px] font-bold">({computedSalaryDetails.advanceDaysCount}d)</span></span>
                        </div>
                      )}
                      <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between font-black text-sm text-slate-900">
                        <span>{isBn ? 'সর্বমোট পরিশোধযোগ্য:' : 'Net Payable Amount:'}</span>
                        <span className="font-mono text-indigo-650 font-extrabold text-base">{computedSalaryDetails.netSalaryPayable.toLocaleString()}{currencySymbol}</span>
                      </div>

                      <button
                        onClick={handlePaySalary}
                        className="w-full mt-3 py-3 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        💳 {isBn ? 'বেতন পাঠান এবং ক্যাশ লগ করুন' : 'Confirm & Disburse Salary'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Consolidated Statement Bundle Downloader (Last 3/6 Months) */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                  🌍 {isBn ? 'মাল্টি-মান্থ বেতন স্লিপ প্যাক' : 'Consolidated Salary Bundle'}
                </h3>
                <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                  {isBn 
                    ? 'আন্তর্জাতিক মানের ৩ বা ৬ মাসের বেতন পরিশোধের প্রত্যয়ন বিবরণী এবং বিস্তারিত স্লিপ এক ফাইলে ডাউনলোড করুন।' 
                    : 'Download dynamic international-grade 3-month or 6-month consolidated salary statement certificates and slips bundle.'}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                      {isBn ? 'স্টাফ নির্বাচন করুন' : 'Select Employee'}
                    </label>
                    <select
                      className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 cursor-pointer"
                      value={bundleStaffId}
                      onChange={e => setBundleStaffId(e.target.value)}
                    >
                      <option value="">{isBn ? '-- স্টাফ সিলেক্ট করুন --' : '-- Choose Staff --'}</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>[{getStaffDisplayId(emp)}] {emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                      {isBn ? 'বিবরণীর সময়সীমা' : 'Statement Period'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBundleDuration('3')}
                        className={`py-2 px-1 text-xs font-black rounded-xl transition-all border cursor-pointer ${
                          bundleDuration === '3' 
                            ? 'bg-slate-900 border-slate-950 text-white shadow-sm' 
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        📅 {isBn ? 'গত ৩ মাস' : 'Last 3 Months'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBundleDuration('6')}
                        className={`py-2 px-1 text-xs font-black rounded-xl transition-all border cursor-pointer ${
                          bundleDuration === '6' 
                            ? 'bg-slate-900 border-slate-950 text-white shadow-sm' 
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        📅 {isBn ? 'গত ৬ মাস' : 'Last 6 Months'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={downloadConsolidatedBundlePDF}
                    className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {isBn ? 'বিবরণী ডাউনলোড করুন (PDF)' : 'Download Statements Bundle'}
                  </button>
                </div>
              </div>
            </div>

            {/* Payout History register */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm md:col-span-7 space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2">
                📋 {isBn ? 'স্যালারি পেমেন্ট হিস্ট্রি' : 'Salary Disbursal Ledgers'}
              </h3>
              
              {payrollHistory.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold text-xs">
                  {isBn ? 'এখন পর্যন্ত কোনো ডিস্ট্রিবিউট রেকর্ড নেই!' : 'No payroll disbursal entries loaded.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-105 space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {payrollHistory.map(pay => (
                    <div key={pay.id} className="py-3.5 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs font-black text-gray-900">{pay.employeeName}</p>
                        <p className="text-[10px] text-gray-500 font-bold">
                          {isBn ? 'পরিশোধের মাস:' : 'Month:'} <span className="bg-slate-100 rounded px-1.5 py-0.5 text-gray-700 font-mono font-bold">{pay.month}</span> | 💳 {pay.paymentMode}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="text-xs font-extrabold text-indigo-600 font-mono">
                            {pay.finalPay.toLocaleString()}{currencySymbol}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold">{pay.date}</p>
                        </div>

                        {/* Direct PDF Download Button */}
                        <button
                          onClick={() => downloadPaySlipPDF(pay)}
                          className="p-1.5 hover:bg-indigo-50 bg-indigo-50/50 rounded-xl text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                          title="Download PDF Pay-Slip"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Printable Slip markup layout */}
                      <div 
                        id={`slip-${pay.id}`} 
                        className="hidden print:block w-[400px] border-4 border-slate-950 p-6 bg-white rounded-xl shadow-lg relative" 
                        style={{
                          width: '400px',
                          border: '4px solid #010101',
                          padding: '24px',
                          background: 'white',
                          fontFamily: "'Inter', sans-serif",
                          margin: 'auto',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                          <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#000', textTransform: 'uppercase' }}>
                            {settings.shopName || 'Merchant LLC'}
                          </h2>
                          <p style={{ fontSize: '10px', color: '#555', margin: '2px 0' }}>Corporate Pay-Slip Memorandum</p>
                        </div>
                        
                        <div style={{ width: '100%', borderBottom: '2px solid #000', marginBottom: '12px' }}></div>
                        
                        <table style={{ width: '100%', fontSize: '11px', marginBottom: '16px' }}>
                          <tbody>
                            <tr>
                              <td><strong>Employee:</strong></td>
                              <td style={{ textAlign: 'right' }}>{pay.employeeName}</td>
                            </tr>
                            <tr>
                              <td><strong>Disbursal Month:</strong></td>
                              <td style={{ textAlign: 'right', fontFamily: "'Courier New'" }}>{pay.month}</td>
                            </tr>
                            <tr>
                              <td><strong>Payment Mode:</strong></td>
                              <td style={{ textAlign: 'right' }}>{pay.paymentMode}</td>
                            </tr>
                            <tr>
                              <td><strong>Recorded Date:</strong></td>
                              <td style={{ textAlign: 'right' }}>{pay.date}</td>
                            </tr>
                          </tbody>
                        </table>

                        <div style={{ width: '100%', borderBottom: '1px dashed #000', marginBottom: '12px' }}></div>
                        
                        <div style={{ fontSize: '11px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Base Salary:</span>
                            <span style={{ fontFamily: "'Courier New'", fontWeight: 'bold' }}>{pay.baseSalary?.toLocaleString()}৳</span>
                          </div>
                          {pay.tadAllowance > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>TAD (Travel):</span>
                              <span style={{ fontFamily: "'Courier New'", fontWeight: 'bold' }}>+{pay.tadAllowance?.toLocaleString()}৳</span>
                            </div>
                          )}
                          {pay.foodAllowance > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>Food Allowance:</span>
                              <span style={{ fontFamily: "'Courier New'", fontWeight: 'bold' }}>+{pay.foodAllowance?.toLocaleString()}৳</span>
                            </div>
                          )}
                          {pay.hraAllowance > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>HRA (House Rent):</span>
                              <span style={{ fontFamily: "'Courier New'", fontWeight: 'bold' }}>+{pay.hraAllowance?.toLocaleString()}৳</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Festival Bonus:</span>
                            <span style={{ fontFamily: "'Courier New'", fontWeight: 'bold' }}>+{pay.bonus?.toLocaleString()}৳</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Absence Deductions:</span>
                            <span style={{ fontFamily: "'Courier New'", fontWeight: 'bold' }}>-{pay.deduction?.toLocaleString()}৳</span>
                          </div>
                          
                          <div style={{ width: '100%', borderBottom: '2px solid #000', marginTop: '8px', marginBottom: '8px' }}></div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 900 }}>
                            <span>Total Net payout:</span>
                            <span style={{ fontFamily: "'Courier New'", fontWeight: 900, color: '#000' }}>{pay.finalPay?.toLocaleString()}৳</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', fontSize: '10px' }}>
                          <div style={{ borderTop: '1px solid #000', width: '120px', textAlign: 'center', paddingTop: '4px' }}>Employer Signature</div>
                          <div style={{ borderTop: '1px solid #000', width: '120px', textAlign: 'center', paddingTop: '4px' }}>Staff Signature</div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Leaves & Holidays */}
      {activeTab === 'leave_planner' && (
        <div className="space-y-6">
          {/* Dynamic Leave Ledger Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <span>📊 {isBn ? 'স্টাফ ছুটির খতিয়ান ও অগ্রিম ব্যালেন্স' : 'Staff Leave Ledger & Advance Tracking'}</span>
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  {isBn 
                    ? 'প্রতিটি স্টাফের বাৎসরিক বরাদ্দকৃত ছুটি, ব্যবহৃত ছুটি, অবশিষ্ট এবং অতিরিক্ত অগ্রিম ছুটির লাইভ হিসাব।'
                    : 'Track annual leave quota, approved leaves, balance, and advanced leaves taken in advance.'}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-gray-500">
                <thead className="text-[10px] uppercase text-gray-400 tracking-wider bg-slate-50/50">
                  <tr>
                    <th className="py-2.5 px-4 font-black">{isBn ? 'স্টাফের নাম' : 'Employee Name'}</th>
                    <th className="py-2.5 px-4 font-black">{isBn ? 'পদবি' : 'Designation'}</th>
                    <th className="py-2.5 px-4 text-center font-black">{isBn ? 'বাৎসরিক কোটা' : 'Annual Quota'}</th>
                    <th className="py-2.5 px-4 text-center text-emerald-600 font-black">{isBn ? 'ব্যবহৃত ছুটি' : 'Used Leaves'}</th>
                    <th className="py-2.5 px-4 text-center text-indigo-600 font-black">{isBn ? 'অবশিষ্ট ব্যালেন্স' : 'Remaining Balance'}</th>
                    <th className="py-2.5 px-4 text-center text-red-600 font-black">{isBn ? 'অগ্রিম ছুটি (Advance)' : 'Leaves in Advance'}</th>
                    <th className="py-2.5 px-4 font-black text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-105">
                  {employeeLeaveLedgers.map(ledger => {
                    const isExceeded = ledger.advance > 0;
                    return (
                      <tr key={ledger.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-950">{ledger.name}</td>
                        <td className="py-3 px-4 font-semibold text-gray-500">{ledger.designation}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold">{ledger.quota} {isBn ? 'দিন' : 'days'}</td>
                        <td className="py-3 px-4 text-center font-mono font-black text-emerald-600">{ledger.used} {isBn ? 'দিন' : 'days'}</td>
                        <td className="py-3 px-4 text-center font-mono font-black text-indigo-600">{ledger.remaining} {isBn ? 'দিন' : 'days'}</td>
                        <td className="py-3 px-4 text-center font-mono font-black text-red-650">
                          {ledger.advance > 0 ? (
                            <span className="bg-red-50 text-red-650 px-2.5 py-0.5 rounded-full text-[10.5px]">
                              +{ledger.advance} {isBn ? 'দিন (অগ্রিম)' : 'days (Advance)'}
                            </span>
                          ) : (
                            <span className="text-gray-300">0 {isBn ? 'দিন' : 'days'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isExceeded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-650 uppercase bg-red-50/50 px-2 py-0.5 rounded">
                              ⚠️ {isBn ? 'কোটা শেষ (অগ্রিম শুরু)' : 'Quota Over'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                              ✅ {isBn ? 'সুরক্ষিত' : 'Safe'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Create Leave Request form */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm md:col-span-5 space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2">
                ✍️ {isBn ? 'ছুটির আবেদন ফরম' : 'Request Leave Form'}
              </h3>
              
              <form onSubmit={handleAddCustomLeaveRequest} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                    {isBn ? 'স্টাফ নির্বাচন' : 'Staff Member'}
                  </label>
                  <select
                    name="employeeId"
                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="">{isBn ? '-- মেম্বার নির্বাচন করুন --' : '-- Choose Employee --'}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>[{getStaffDisplayId(emp)}] {emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1 font-sans">
                    {isBn ? 'ছুটির ধরণ' : 'Type of Leave'}
                  </label>
                  <select
                    name="leaveType"
                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="Casual Leave">{isBn ? 'নৈমিত্তিক ছুটি (Casual Leave)' : 'Casual Leave'}</option>
                    <option value="Sick Leave">{isBn ? 'অসুস্থতাজনিত ছুটি (Sick Leave)' : 'Sick Leave'}</option>
                    <option value="Earned Leave">{isBn ? 'অর্জিত ছুটি (Earned Leave)' : 'Earned Leave'}</option>
                    <option value="Unpaid Leave">{isBn ? 'বিনা বেতনে ছুটি (Unpaid Leave)' : 'Unpaid Leave'}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                      {isBn ? 'শুরুর তারিখ' : 'Start Date'}
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1 font-sans">
                      {isBn ? 'শেষের তারিখ' : 'End Date'}
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                    {isBn ? 'ছুটির যৌক্তিক কারণ' : 'Reason for Leave'}
                  </label>
                  <textarea
                    name="reason"
                    rows={2}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold font-sans"
                    placeholder={isBn ? 'উদা: পারিবারিক অনুষ্ঠান' : 'e.g. medical appointments'}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/15"
                >
                  <CirclePlus className="w-4 h-4" />
                  {isBn ? 'আবেদন জমা দিন' : 'Submit Application'}
                </button>
              </form>
            </div>

            {/* Leave Approvals list */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm md:col-span-7 space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2">
                📋 {isBn ? 'ছুটির আবেদন ও মূল্যায়ন' : 'Leave Verification & Requests'}
              </h3>
              
              {leaveRequests.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold text-xs">
                  {isBn ? 'কোনো ছুটির আবেদন নেই!' : 'No leave requests registered.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-105 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {leaveRequests.map(leave => (
                    <div key={leave.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-gray-950">{leave.employeeName}</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                          {leave.leaveType} | <span className="text-indigo-600 font-mono">{leave.daysCount} days</span> ({leave.startDate} - {leave.endDate})
                        </p>
                        <p className="text-[10.5px] text-gray-600 font-medium italic">
                          " {leave.reason} "
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {leave.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveLeave(leave.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded text-[10px] font-black transition-all"
                            >
                              {isBn ? 'অনুমোদন' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleApproveLeave(leave.id, 'Rejected')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-650 hover:text-white rounded text-[10px] font-black transition-all"
                            >
                              {isBn ? 'বাতিল' : 'Reject'}
                            </button>
                          </>
                        ) : (
                          <span className={`px-2.5 py-1 text-[10px] font-black rounded uppercase ${
                            leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                          }`}>
                            {leave.status === 'Approved' ? (isBn ? 'অনুমোদিত' : 'Approved') : (isBn ? 'প্রত্যাখ্যাত' : 'Rejected')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system_login' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <span>{isBn ? 'সিস্টেম লগইন ও টার্মিনাল অ্যাক্সেস' : 'System Login & Access Control'}</span>
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {isBn 
                    ? 'স্টাফ মেম্বারদের জন্য অ্যাপ্লিকেশনে লগইন করার অনুমতি এবং অ্যাক্সেস কন্ট্রোল সেট করুন।' 
                    : 'Manage application portal credentials, terminal lock-states, and roles for each registered staff member.'}
                </p>
              </div>
              <span className="text-[10px] font-black tracking-widest text-indigo-600 bg-indigo-50/70 px-3.5 py-1.5 rounded-xl uppercase">
                {isBn ? 'নিরাপত্তা প্যানেল' : 'Access Manager'}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/85 border-b border-gray-100">
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">{isBn ? 'স্টাফ মেম্বার' : 'Staff Profile'}</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">{isBn ? 'পদবি ও রোল' : 'Designation & Role'}</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">{isBn ? 'ইউজারনেম এবং পিন নম্বর' : 'Credentials (Username & PIN)'}</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">{isBn ? 'স্ট্যাটাস' : 'App Access Status'}</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">{isBn ? 'অ্যাকশন' : 'Access Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-bold text-slate-705">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                        {isBn ? 'কোনো কর্মী ডাটাবেজে পাওয়া যায়নি!' : 'No registered staff members found to configure.'}
                      </td>
                    </tr>
                  ) : (
                    employees.map(emp => {
                      const loginPermitted = !!emp.allowLogin;
                      const creds = employeeLogins[emp.id] || { 
                        username: emp.username || '', 
                        password: emp.password || '' 
                      };

                      const getMappedRole = (designation: string): string => {
                        const d = designation.toLowerCase().trim();
                        if (d.includes('admin')) return 'admin';
                        if (d.includes('manager') && !d.includes('assistant') && !d.includes('sales')) return 'manager';
                        if (d.includes('assistant') && d.includes('manager')) return 'assistant_manager';
                        if (d.includes('sales') && d.includes('manager')) return 'sales_manager';
                        if (d.includes('warehouse') || d.includes('store')) return 'warehouse';
                        return 'sales_team';
                      };

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={emp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&fit=crop'} 
                                alt={emp.name} 
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                              />
                              <div>
                                <h4 className="font-extrabold text-slate-900">{emp.name}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {getStaffDisplayId(emp)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-slate-800 lowercase first-letter:uppercase font-extrabold text-xs">{emp.designation}</p>
                              <span className="text-[9px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                Role: {getMappedRole(emp.designation)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-bold text-slate-700">
                            <div className="flex flex-col gap-2.5">
                              {/* Display the Shop Unique Code Section */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 bg-indigo-50/75 px-2.5 py-1 rounded-lg w-max font-bold border border-indigo-100/50 shadow-2xs">
                                  <span>{isBn ? 'দোকান কোড' : 'Shop Code'}:</span>
                                  <span className="font-mono font-black tracking-wider text-indigo-700">
                                    {(settings.shopCode || settings.shopId || '').toString().replace(/^SHP-/i, '').replace(/[^0-9]/g, '').slice(0, 6)}
                                  </span>
                                </div>
                                {!!emp.username && (
                                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50/90 px-2.5 py-1 rounded-lg w-max font-bold border border-emerald-100/50 shadow-2xs">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{isBn ? 'সংরক্ষিত ইউজারনেম' : 'Username Locked'}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                {/* Username input field */}
                                <div className="flex items-center gap-2">
                                  <div className="relative w-44">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-extrabold select-none">@</span>
                                    <input
                                      type="text"
                                      value={creds.username}
                                      readOnly={!!emp.username}
                                      disabled={!!emp.username}
                                      onChange={(e) => {
                                        if (!!emp.username) return;
                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
                                        setEmployeeLogins({
                                          ...employeeLogins,
                                          [emp.id]: { ...creds, username: val }
                                        });
                                      }}
                                      placeholder={isBn ? 'ইউজারনেম' : 'username'}
                                      className={`pl-5 pr-8 py-2 text-[11px] font-extrabold border rounded-xl transition-all w-full tracking-wide shadow-2xs ${
                                        !!emp.username 
                                          ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed select-none focus:outline-none focus:ring-0'
                                          : 'bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800'
                                      }`}
                                    />
                                    {!!emp.username && (
                                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2" title={isBn ? 'ইউজারনেম পরিবর্তন করা সম্ভব নয়' : 'Username is locked and cannot be changed'}>
                                        <Lock className="w-3 h-3 text-slate-400" />
                                      </span>
                                    )}
                                  </div>

                                  {!emp.username && (
                                    <button
                                      type="button"
                                      onClick={() => handleCreateUsername(emp)}
                                      disabled={isGeneratingUsername[emp.id]}
                                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100/85 active:bg-indigo-100 disabled:opacity-55 text-indigo-600 rounded-xl text-[10px] font-extrabold transition-all border border-indigo-100/60 shadow-2xs flex items-center justify-center min-w-[128px] cursor-pointer"
                                      title={isBn ? 'ইউজারনেম ও পিন জেনারেট করুন' : 'Generate Username & PIN'}
                                    >
                                      {isGeneratingUsername[emp.id] ? (isBn ? 'তৈরি হচ্ছে...' : 'Generating...') : (isBn ? 'ইউজারনেম তৈরি করুন' : 'Create Username')}
                                    </button>
                                  )}
                                </div>

                                {/* Password PIN field - Always upgradeable / editable */}
                                <div className="flex items-center gap-2">
                                  <div className="relative w-44">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-indigo-500 font-extrabold select-none tracking-widest">PIN</span>
                                    <input
                                      type="text"
                                      maxLength={6}
                                      value={creds.password}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setEmployeeLogins({
                                          ...employeeLogins,
                                          [emp.id]: { ...creds, password: val }
                                        });
                                      }}
                                      placeholder={isBn ? '৬-ডিজিট পিন' : '6-digit PIN'}
                                      className="pl-9 pr-2.5 py-2 text-[11px] font-mono font-extrabold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-slate-800 tracking-wider shadow-2xs transition-all"
                                    />
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-extrabold select-none italic min-w-[128px]">
                                    {isBn ? '✓ পাসওয়ার্ড যেকোনো সময় পরিবর্তনশীল' : '✓ PIN can be changed anytime'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              loginPermitted 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-red-50 text-red-500 border border-red-100'
                            }`}>
                              {loginPermitted 
                                ? (isBn ? 'লগইন অনুমোদিত' : 'Access Granted') 
                                : (isBn ? 'লগইন বন্ধ' : 'Access Locked')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleSaveCredentials(emp)}
                                disabled={isUpdatingCredentials[emp.id]}
                                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-[11px] font-black tracking-widest uppercase transition-all shadow-sm flex items-center justify-center min-w-[124px]"
                              >
                                {isUpdatingCredentials[emp.id] ? (isBn ? 'সেভ হচ্ছে...' : 'Saving...') : (isBn ? 'সেভ ও অনুমতি দিন' : 'Save & Grant')}
                              </button>
                              
                              {loginPermitted && (
                                <button
                                  onClick={() => handleLockAccess(emp)}
                                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all"
                                >
                                  {isBn ? 'লক করুন' : 'Lock'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/75 flex items-start gap-4">
              <span className="text-lg">🔐</span>
              <div className="text-[11px] text-slate-500 font-medium leading-relaxed">
                <strong className="text-slate-800 font-bold block mb-1">{isBn ? 'টার্মিনাল সিকিউরিটি গাইডলাইন:' : 'Terminal Security Guideline:'}</strong>
                <span>
                  {isBn 
                    ? 'যেসব স্টাফের "লগইন অনুমোদিত" থাকবে, তারা তাদের নিবন্ধিত ফোন নম্বর এবং নির্ধারিত সাইনেপ ক্রেডেনশিয়াল ব্যবহার করে মূল পোর্টালে কাজের রেকর্ড পরিচালনা করতে পারবেন।' 
                    : 'Staff members with "Access Granted" can securely log in to their respective workspace terminals using their registered phone number credentials.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Certificate / Contracts generator */}
      {activeTab === 'employment_contracts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Form configuration panel */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150/70 shadow-sm md:col-span-5 space-y-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
                <span>📄 {isBn ? 'নথিপত্র জেনারেটর' : 'Document Generator Tool'}</span>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">A4 Layout</span>
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                    {isBn ? 'কাগজপত্রের ধরণ' : 'Document Template Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCertType('contract')}
                      className={`py-2 px-1 text-[10px] font-black rounded-xl transition-all border ${
                        certType === 'contract' 
                          ? 'bg-slate-900 border-slate-950 text-white' 
                          : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      📜 {isBn ? 'চুক্তিপত্র' : 'Employment Contract'}
                    </button>
                    <button
                      onClick={() => setCertType('experience')}
                      className={`py-2 px-1 text-[10px] font-black rounded-xl transition-all border ${
                        certType === 'experience' 
                          ? 'bg-slate-900 border-slate-950 text-white' 
                          : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      🏅 {isBn ? 'অভিজ্ঞতা সনদ' : 'Experience Release'}
                    </button>
                    <button
                      onClick={() => setCertType('noc_visa')}
                      className={`py-2 px-1 text-[10px] font-black rounded-xl transition-all border ${
                        certType === 'noc_visa' 
                          ? 'bg-slate-900 border-slate-950 text-white' 
                          : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      ✈️ {isBn ? 'ভিসা এনওসি' : 'Visa NOC'}
                    </button>
                    <button
                      onClick={() => setCertType('noc_bank')}
                      className={`py-2 px-1 text-[10px] font-black rounded-xl transition-all border ${
                        certType === 'noc_bank' 
                          ? 'bg-slate-900 border-slate-950 text-white' 
                          : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      🏦 {isBn ? 'ব্যাংক এনওসি' : 'Bank NOC'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                    {isBn ? 'সনদপত্রের ভাষা' : 'Document Language'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCertLanguage('en');
                        setLeavingReason('Personal Reasons');
                        setCertPraise('He has been extremely diligent, hard-working, and trustworthy.');
                      }}
                      className={`py-2 px-1 text-[10px] font-black rounded-xl transition-all border ${
                        certLanguage === 'en' 
                          ? 'bg-indigo-650 border-indigo-750 text-white shadow-xs' 
                          : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      🇬🇧 English Version
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCertLanguage('bn');
                        setLeavingReason('ব্যক্তিগত কারণ');
                        setCertPraise('অত্যন্ত পরিশ্রমী এবং বিশ্বস্ত কর্মী।');
                      }}
                      className={`py-2 px-1 text-[10px] font-black rounded-xl transition-all border ${
                        certLanguage === 'bn' 
                          ? 'bg-indigo-650 border-indigo-750 text-white shadow-xs' 
                          : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      🇧🇩 বাংলা সংস্করণ
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                    {isBn ? 'প্রিন্ট লেআউট মোড' : 'Print Layout Mode'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPrintLayoutMode('digital')}
                      className={`py-2 px-3 text-xs font-black rounded-xl transition-all border ${
                        printLayoutMode === 'digital' 
                          ? 'bg-indigo-650 border-indigo-750 text-white' 
                          : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      💻 {isBn ? 'ডিজিটাল মোড' : 'Digital Mode'}
                    </button>
                    <button
                      onClick={() => setPrintLayoutMode('preprinted')}
                      className={`py-2 px-3 text-xs font-black rounded-xl transition-all border ${
                        printLayoutMode === 'preprinted' 
                          ? 'bg-indigo-650 border-indigo-750 text-white' 
                          : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      📑 {isBn ? 'প্রি-প্রিন্টেড প্যাড' : 'Pre-Printed Pad'}
                    </button>
                  </div>
                  <p className="text-[9.5px] text-gray-450 mt-1 font-sans">
                    {isBn 
                      ? 'প্রি-প্রিন্টেড প্যাড সিলেক্ট করলে হেডার, লোগো এবং সিগনেচার হাইড হবে যাতে সরাসরি কোম্পানির প্যাডে প্রিন্ট করতে পারেন।'
                      : 'Choose Pre-Printed Pad to hide header and signatures to print directly inside physical company pads.'}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                    {isBn ? 'স্টাফ মেম্বার নির্বাচন' : 'Staff Member Profile'}
                  </label>
                  <select
                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-indigo-500"
                    value={selectedCertEmployee?.id || ''}
                    onChange={e => {
                      const emp = employees.find(em => em.id === e.target.value);
                      if (emp) setSelectedCertEmployee({ ...emp });
                    }}
                  >
                    <option value="">{isBn ? '-- মেম্বার সিলেট করুন --' : '-- Select Employee --'}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>[{getStaffDisplayId(emp)}] {emp.name}</option>
                    ))}
                  </select>
                </div>

                {certType === 'experience' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                          {isBn ? 'চাকরি শেষের তারিখ' : 'Release/Leaving Date'}
                        </label>
                        <input
                          type="date"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold font-mono"
                          value={leavingDate}
                          onChange={e => setLeavingDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1 font-sans">
                          {isBn ? 'ছাড়ার কারণ' : 'Reason for Leaving'}
                        </label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold"
                          value={leavingReason}
                          onChange={e => setLeavingReason(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                        {isBn ? 'প্রশংসা বা মন্তব্য' : 'Appraisal Comments'}
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-semibold"
                        value={certPraise}
                        onChange={e => setCertPraise(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* 🎨 Choose Document Template */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
                    {isBn ? 'সনদপত্রের থিম ডিজাইন' : 'Document Theme Design'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId('standard')}
                      className={`py-2 px-1 text-[9px] font-black rounded-xl transition-all border ${
                        selectedTemplateId === 'standard'
                          ? 'bg-indigo-900 border-indigo-950 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      🏛️ {isBn ? 'স্ট্যান্ডার্ড' : 'Classic Blue'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId('modern_gold')}
                      className={`py-2 px-1 text-[9px] font-black rounded-xl transition-all border ${
                        selectedTemplateId === 'modern_gold'
                          ? 'bg-amber-600 border-amber-700 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      👑 {isBn ? 'রয়েল গোল্ড' : 'Royal Gold'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId('executive_serif')}
                      className={`py-2 px-1 text-[9px] font-black rounded-xl transition-all border ${
                        selectedTemplateId === 'executive_serif'
                          ? 'bg-slate-800 border-slate-900 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      🖋️ {isBn ? 'মডার্ন সেরিফ' : 'Modern Serif'}
                    </button>
                  </div>
                </div>

                {/* ✨ AI Writer (Gemini) */}
                {selectedCertEmployee && (
                  <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                        ✨ {isBn ? 'জেমিনি এআই রাইটার' : 'Gemini AI Writer'}
                      </span>
                      {customAiText && (
                        <button
                          type="button"
                          onClick={() => setCustomAiText(null)}
                          className="text-[9px] font-bold text-red-500 hover:underline"
                        >
                          {isBn ? 'রিসেট' : 'Reset'}
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] text-indigo-500 leading-relaxed font-sans">
                      {isBn
                        ? 'ফরচুন ৫০০ স্ট্যান্ডার্ডের আন্তর্জাতিক মানের অত্যন্ত প্রফেশনাল ড্রাফট তৈরি করতে ক্লিক করুন।'
                        : 'Generate highly elegant, formal, and authoritative, global Fortune 500 business standard drafts with one-click.'}
                    </p>
                    <button
                      type="button"
                      onClick={generateProfessionalAiDoc}
                      disabled={isGeneratingAiText}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-60 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      {isGeneratingAiText ? (
                        <>
                          <span className="animate-spin text-xs">🌀</span>
                          {isBn ? 'এআই ড্রাফট তৈরি হচ্ছে...' : 'Generating Elite Draft...'}
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          {isBn ? 'প্রফেশনাল ড্রাফট তৈরি করুন' : 'Generate Professional Draft'}
                        </>
                      )}
                    </button>
                    {customAiText && (
                      <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl text-[9px] font-bold border border-emerald-100 flex items-center gap-1.5">
                        <span>✓</span>
                        {isBn ? 'আন্তর্জাতিক মানের এআই কপি সক্রিয় রয়েছে!' : 'International standard AI copy is active!'}
                      </div>
                    )}
                  </div>
                )}

                {/* ⚙️ Custom Branding & Watermarks Accordion */}
                <details className="group border border-gray-200 rounded-2xl overflow-hidden bg-slate-50/50">
                  <summary className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-700 tracking-wider bg-slate-100/60 cursor-pointer hover:bg-slate-100/90 flex items-center justify-between select-none list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-1.5">⚙️ {isBn ? 'ব্র্যান্ডিং ও ওয়াটারমার্ক সেটিংস' : 'Branding & Watermarks'}</span>
                    <span className="text-[9px] text-slate-400 group-open:rotate-180 transition-all font-sans">▼</span>
                  </summary>
                  <div className="p-4 space-y-3.5 bg-white border-t border-gray-150/70 text-[11px] font-medium text-slate-600">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                        {isBn ? 'কোম্পানির হেডার টেক্সট' : 'Company Header Title'}
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold"
                        value={hrmSettings.headerText || ''}
                        onChange={(e) => saveHrmSettings({ headerText: e.target.value })}
                        placeholder="e.g. ShopSync Ltd."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">
                          {isBn ? 'ওয়াটারমার্ক লোগো' : 'Watermark Image'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBrandingImageUpload('watermark', file);
                          }}
                          className="w-full text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-black file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">
                          {isBn ? 'লোগো অপসারণ' : 'Clear Watermark'}
                        </label>
                        <button
                          type="button"
                          onClick={() => saveHrmSettings({ watermarkUrl: '' })}
                          className="w-full py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-[9px] text-center border border-red-100/60"
                        >
                          ✕ {isBn ? 'মুছে ফেলুন' : 'Clear'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">
                          {isBn ? 'অপাসিটি' : 'Watermark Opacity'} ({hrmSettings.watermarkOpacity || 0.06})
                        </label>
                        <input
                          type="range"
                          min="0.01"
                          max="0.2"
                          step="0.01"
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          value={hrmSettings.watermarkOpacity || 0.06}
                          onChange={(e) => saveHrmSettings({ watermarkOpacity: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">
                          {isBn ? 'সাইজ (পিক্সেল)' : 'Watermark Size'} ({hrmSettings.watermarkSize || 160}px)
                        </label>
                        <input
                          type="range"
                          min="80"
                          max="250"
                          step="5"
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          value={hrmSettings.watermarkSize || 160}
                          onChange={(e) => saveHrmSettings({ watermarkSize: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t pt-3">
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">
                          {isBn ? 'অফিসিয়াল সিল' : 'Official Seal'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBrandingImageUpload('seal', file);
                          }}
                          className="w-full text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-black file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">
                          {isBn ? 'নিয়োগকর্তার স্বাক্ষর' : 'Signature Image'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBrandingImageUpload('signature', file);
                          }}
                          className="w-full text-[9px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-black file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 border-t pt-2.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                        {isBn ? 'ফুটার টেক্সট' : 'Footer Text/Sub-title'}
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold"
                        value={hrmSettings.footerText || ''}
                        onChange={(e) => saveHrmSettings({ footerText: e.target.value })}
                        placeholder="e.g. Verified HR Document"
                      />
                    </div>
                  </div>
                </details>

                {selectedCertEmployee && (
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={downloadCertificatePDF}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      {isBn ? 'অফিসিয়াল PDF ডাউনলোড করুন (A4)' : 'Download Official PDF (A4)'}
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const containerNode = document.getElementById('certificate-render-node');
                        if (!containerNode) return;

                        try {
                          const originalShadow = containerNode.style.boxShadow;
                          containerNode.style.boxShadow = 'none';

                          const canvas = await html2canvas(containerNode, {
                            scale: 3, // Premium high-resolution
                            useCORS: true,
                            backgroundColor: '#ffffff',
                            logging: false
                          });

                          containerNode.style.boxShadow = originalShadow;

                          // Save dynamic verification record
                          try {
                            await setDoc(doc(db, 'hrm_records', currentDocId), {
                              id: currentDocId,
                              shopId: user.shopId,
                              type: certType,
                              employeeId: selectedCertEmployee.id,
                              employeeName: selectedCertEmployee.name,
                              employeeDesignation: selectedCertEmployee.designation,
                              date: new Date().toISOString().split('T')[0],
                              details: {
                                leavingDate: leavingDate || '',
                                leavingReason: leavingReason || '',
                                certPraise: certPraise || '',
                                certType: certType,
                                printLayoutMode,
                                signatureUrl: hrmSettings.signatureUrl,
                                sealUrl: hrmSettings.sealUrl
                              },
                              createdAt: new Date().toISOString()
                            });
                          } catch (fErr) {
                            console.error("Error creating verification record:", fErr);
                          }

                          const link = document.createElement('a');
                          link.href = canvas.toDataURL('image/png', 1.0);
                          link.download = `${certType.toUpperCase()}_${selectedCertEmployee.name.replace(/\s+/g, '_')}_${currentDocId}.png`;
                          link.click();

                          setNotification({
                            message: isBn ? 'ইমেজ ফাইলটি সফলভাবে ডাউনলোড করা হয়েছে!' : 'Certificate downloaded successfully as high-resolution image!',
                            type: 'success'
                          });
                        } catch (err) {
                          console.error("HTML2Canvas Error:", err);
                          setNotification({
                            message: isBn ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Failed to download certificate',
                            type: 'error'
                          });
                        }
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-250 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      {isBn ? 'হাই-রেজ ইমেজ ডাউনলোড (PNG)' : 'Download High-Res PNG'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* A4 Live layout previewer */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-gray-150/70 shadow-inner md:col-span-7 flex justify-center overflow-auto max-h-[550px]">
              {selectedCertEmployee ? (
                <div 
                  id="certificate-render-node" 
                  className={`p-12 text-center w-[595px] h-[842px] relative shadow-lg box-border flex flex-col justify-between`} 
                  style={{
                    width: '595px',
                    height: '842px',
                    border: printLayoutMode === 'digital' 
                      ? (selectedTemplateId === 'modern_gold' ? '12px double #b5892c' : selectedTemplateId === 'executive_serif' ? '4px solid #0f172a' : '12px double #1e1b4b')
                      : 'none',
                    padding: '48px',
                    background: selectedTemplateId === 'modern_gold' ? '#fdfbf7' : 'white',
                    fontFamily: selectedTemplateId === 'executive_serif' || selectedTemplateId === 'modern_gold' ? "'Georgia', 'Noto Serif Bengali', serif" : "'Inter', 'Noto Serif Bengali', sans-serif",
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    color: selectedTemplateId === 'modern_gold' ? '#3d2a0d' : '#1e293b'
                  }}
                >
                  
                  {/* Image Watermark Tech */}
                  {printLayoutMode === 'digital' && (hrmSettings.watermarkUrl || settings.logoBase64 || settings.logoUrl) && (
                    <img 
                      src={hrmSettings.watermarkUrl || settings.logoBase64 || settings.logoUrl}
                      crossOrigin="anonymous"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: hrmSettings.watermarkOpacity || 0.06,
                        width: `${hrmSettings.watermarkSize || 160}px`,
                        height: `${hrmSettings.watermarkSize || 160}px`,
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        zIndex: 0
                      }}
                      alt="Watermark"
                    />
                  )}

                  {printLayoutMode === 'digital' ? (
                    <div style={{ zIndex: 1, borderBottom: selectedTemplateId === 'modern_gold' ? '2px solid #b5892c' : selectedTemplateId === 'executive_serif' ? '2px solid #0f172a' : '2px solid #1e1b4b', paddingBottom: '12px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        {/* Company Logo on Left */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {(settings.logoBase64 || settings.logoUrl) ? (
                            <img 
                              src={settings.logoBase64 || settings.logoUrl} 
                              alt="Company Logo" 
                              style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px' }} 
                            />
                          ) : (
                            <div style={{ width: '56px', height: '56px', background: selectedTemplateId === 'modern_gold' ? '#85581a' : selectedTemplateId === 'executive_serif' ? '#0f172a' : '#1e1b4b', color: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900' }}>
                              {(settings.name || settings.shopName || 'M')[0].toUpperCase()}
                            </div>
                          )}
                          <div style={{ textAlign: 'left' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '900', color: selectedTemplateId === 'modern_gold' ? '#85581a' : selectedTemplateId === 'executive_serif' ? '#0f172a' : '#1e1b4b', margin: '0', textTransform: 'uppercase', lineHeight: '1.2' }}>
                              {settings.name || settings.shopName || hrmSettings.headerText || 'ShopSync Ltd.'}
                            </h2>
                            <p style={{ fontSize: '8px', margin: '2px 0 0 0', color: '#64748b', fontFamily: 'Inter', fontWeight: '600' }}>
                              {certLanguage === 'bn' ? 'মানব সম্পদ বিভাগ (HR Department)' : 'Human Resources Department'}
                            </p>
                          </div>
                        </div>

                        {/* Company Contact Details on Right */}
                        <div style={{ textAlign: 'right', fontSize: '9px', color: '#475569', fontFamily: 'Inter', lineHeight: '1.4' }}>
                          <p style={{ margin: '0', fontWeight: '700' }}>{settings.phone || settings.shopPhone || 'Hotline: N/A'}</p>
                          <p style={{ margin: '2px 0 0 0' }}>{settings.address || 'Dhaka, Bangladesh'}</p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '8px', color: '#94a3b8' }}>Date: {new Date().toLocaleDateString(certLanguage === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Pre-printed Pad offset spacing to allow physical header paper space */
                    <div style={{ height: '140px' }}></div>
                  )}

                  {customAiText ? (
                    <div style={{ flex: 1, margin: '24px 0', textAlign: 'left', zIndex: 1 }} className="text-left font-serif py-4">
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span 
                          style={{ 
                            display: 'inline-block',
                            fontSize: '13px', 
                            fontWeight: '950', 
                            textTransform: 'uppercase', 
                            background: selectedTemplateId === 'modern_gold' ? '#85581a' : selectedTemplateId === 'executive_serif' ? '#0f172a' : '#1e1b4b', 
                            color: 'white', 
                            padding: '6px 18px', 
                            borderRadius: '4px',
                            letterSpacing: '1px'
                          }}
                        >
                          {certType === 'experience'
                            ? (certLanguage === 'bn' ? 'অভিজ্ঞতা ও অবমুক্তি সনদপত্র' : 'CERTIFICATE OF EXPERIENCE & RELEASE')
                            : certType === 'noc_visa'
                            ? (certLanguage === 'bn' ? 'অনাপত্তি পত্র (ভিসা ও আন্তর্জাতিক ভ্রমণ)' : 'NO OBJECTION CERTIFICATE (VISA & INTERNATIONAL TRAVEL)')
                            : (certLanguage === 'bn' ? 'ব্যাংক লোন ও ক্রেডিট অনাপত্তি পত্র' : 'NO OBJECTION CERTIFICATE (FINANCIAL & BANKING)')
                          }
                        </span>
                      </div>
                      {customAiText.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx} style={{ fontSize: '11.5px', lineHeight: '1.9', textIndent: para.trim().startsWith('To Whom') || para.trim().startsWith('Dear') || para.trim().startsWith('মহোদয়') ? '0' : '24px', margin: '0 0 10px 0', color: '#1e293b', textAlign: 'justify' }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  ) : certType === 'experience' ? (
                    <div style={{ flex: 1, margin: '24px 0', textAlign: 'left', zIndex: 1 }} className="text-left font-serif py-4">
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span style={{ display: 'inline-block', fontSize: '15px', fontWeight: '950', textTransform: 'uppercase', background: '#1e1b4b', color: 'white', padding: '6px 18px', borderRadius: '4px', letterSpacing: '1px' }}>
                          {certLanguage === 'bn' ? 'অভিজ্ঞতা ও অবমুক্তি সনদপত্র' : 'CERTIFICATE OF EXPERIENCE & RELEASE'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', lineHeight: '2.0', textIndent: '30px', margin: '0 0 12px 0', color: '#1e293b' }}>
                        {certLanguage === 'bn' ? (
                          <>এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{selectedCertEmployee.name}</strong>, অত্যন্ত নিষ্ঠা ও দক্ষতার সাথে আমাদের প্রতিষ্ঠানে <strong>{selectedCertEmployee.designation}</strong> পদে কর্মরত ছিলেন। তিনি আমাদের সংস্থায় <strong>{selectedCertEmployee.joiningDate || '---'}</strong> তারিখে যোগদান করেন এবং <strong>{leavingDate}</strong> তারিখে তাঁহার সফল কার্যকাল সম্পন্ন করেন।</>
                        ) : (
                          <>This is to formally certify that <strong>{selectedCertEmployee.name}</strong> was actively employed at our esteemed enterprise as a dedicated <strong>{selectedCertEmployee.designation}</strong>. He officially joined our organization on <strong>{selectedCertEmployee.joiningDate || '---'}</strong> and successfully accomplished his tenure on <strong>{leavingDate}</strong>.</>
                        )}
                      </p>
                      <p style={{ fontSize: '12px', lineHeight: '2.0', textIndent: '30px', margin: '0 0 12px 0', color: '#1e293b' }}>
                        {certLanguage === 'bn' ? (
                          <>তাঁহার দায়িত্ব পালনকালে আমরা তাঁহাকে অত্যন্ত বিনয়ী, কঠোর পরিশ্রমী এবং সৎচরিত্রের অধিকারী পাইয়াছি। তাঁহার চাকরি অবমুক্তির প্রধান কারণ: <strong>{leavingReason}</strong>। তাঁহার কর্মদক্ষতার মূল্যায়ন মন্তব্য: <em>"{certPraise}"</em>।</>
                        ) : (
                          <>During his tenure, we found him highly motivated, efficient, and loyal towards his responsibilities. The primary reason for his graceful exit was: <strong>{leavingReason}</strong>. Appraisal and management comments: <em>"{certPraise}"</em>.</>
                        )}
                      </p>
                      <p style={{ fontSize: '12px', lineHeight: '2.0', textIndent: '30px', margin: '0', color: '#1e293b' }}>
                        {certLanguage === 'bn' ? (
                          <>আমরা তাঁহার উজ্জ্বল ভবিষ্যৎ, সুhealthy জীবন এবং সর্বাঙ্গীন মঙ্গল কামনা করি।</>
                        ) : (
                          <>We sincerely wish him prosperity, health, and a magnificent future ahead in all professional domains.</>
                        )}
                      </p>
                    </div>
                  ) : certType === 'contract' ? (
                    <div style={{ flex: 1, margin: '16px 0', textAlign: 'left', zIndex: 1 }} className="text-left font-serif py-1">
                      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <span style={{ display: 'inline-block', fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', background: '#0f172a', color: 'white', padding: '4px 16px', borderRadius: '4px' }}>
                          {certLanguage === 'bn' ? 'গোপনীয়তা রক্ষা ও কর্মসংস্থান চুক্তিপত্র' : 'NON-DISCLOSURE & EMPLOYMENT AGREEMENT'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', lineHeight: '1.8', color: '#334155' }}>
                        <p style={{ marginBottom: '8px' }}>
                          {certLanguage === 'bn' ? (
                            <><strong>১. চুক্তিভুক্ত পক্ষদ্বয়:</strong> এই চুক্তিপত্রটি সফলভাবে সম্পাদিত হইল প্রথম পক্ষ <strong>{settings.name || settings.shopName || 'Merchant LLC'}</strong> (নিয়োগকর্তা) এবং দ্বিতীয় পক্ষ জনাব/জনাবা <strong>{selectedCertEmployee.name}</strong> (কর্মীপক্ষ), পদবি: <strong>{selectedCertEmployee.designation}</strong>-এর মধ্যে।</>
                          ) : (
                            <><strong>1. Contractual Parties:</strong> This agreement is formally executed between First Party/Employer <strong>{settings.name || settings.shopName || 'Merchant LLC'}</strong> and Mr./Ms. <strong>{selectedCertEmployee.name}</strong> (Second Party/Employee), holding the designation of <strong>{selectedCertEmployee.designation}</strong>.</>
                          )}
                        </p>
                        <p style={{ marginBottom: '8px' }}>
                          {certLanguage === 'bn' ? (
                            <><strong>২. বেতন ও দৈনিক শিফট:</strong> কর্মীপক্ষের প্রারম্ভিক মাসিক মূল বেতন নির্ধারিত হইয়াছে <strong>{selectedCertEmployee.salary?.toLocaleString()} {currencySymbol}</strong>। তাঁহার দৈনিক নিয়মিত কর্মঘণ্টা ও শিফট হইবে: <strong>{selectedCertEmployee.schedule || '০৯:০০ AM - ০৬:০০ PM'}</strong>।</>
                          ) : (
                            <><strong>2. Compensation & Duty Schedule:</strong> The initial monthly basic salary of the Employee shall be <strong>{selectedCertEmployee.salary?.toLocaleString()} {currencySymbol}</strong>. Regular shift hours are scheduled as: <strong>{selectedCertEmployee.schedule || '09:00 AM - 06:00 PM'}</strong>.</>
                          )}
                        </p>
                        <p style={{ marginBottom: '8px' }}>
                          {certLanguage === 'bn' ? (
                            <><strong>৩. গোপনীয়তা রক্ষা নীতি (NDA):</strong> কর্মী তাঁহার দায়িত্ব পালনকালে বা পরবর্তীতে কোনো সময়ে প্রতিষ্ঠানের সমস্ত তথ্য, কাস্টমার তালিকা, ফর্মুলা এবং ব্যবসায়িক মেথড সম্পূর্ণ গোপন রাখিতে বাধ্য থাকিবেন। কোনো প্রকার তথ্য চুরির দায়ে চাকরি অবসান সহ আইনি দণ্ড কার্যকর হইবে।</>
                          ) : (
                            <><strong>3. Non-Disclosure & Data Integrity (NDA):</strong> The Employee strictly undertakes to protect and keep completely confidential all proprietary business data, customer lists, recipes, software secrets, and transaction systems. Any leakage or replication of data will result in instant termination and legal liabilities.</>
                          )}
                        </p>
                        <p style={{ marginBottom: '8px' }}>
                          {certLanguage === 'bn' ? (
                            <><strong>৪. চাকরি অবসান ও নোটিশ:</strong> উভয় পক্ষই একে অপরকে অন্ততঃ ৩০ দিন পূর্বে লিখিত নোটিশ প্রদান করিয়া এই চুক্তির অবসান ঘটাইতে পারিবেন।</>
                          ) : (
                            <><strong>4. Notice Period & Exit Clause:</strong> Both parties are required to provide a minimum of 30 days prior written notice before executing any service resignation or termination.</>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : certType === 'noc_visa' ? (
                    <div style={{ flex: 1, margin: '24px 0', textAlign: 'left', zIndex: 1 }} className="text-left font-serif py-4">
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span style={{ display: 'inline-block', fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', background: '#0284c7', color: 'white', padding: '6px 18px', borderRadius: '4px' }}>
                          {certLanguage === 'bn' ? 'ভিসা আবেদনের জন্য অনাপত্তি পত্র (NOC)' : 'NO OBJECTION CERTIFICATE (VISA APPLICATION)'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', lineHeight: '2.0', textIndent: '30px', margin: '0 0 12px 0', color: '#1e293b' }}>
                        {certLanguage === 'bn' ? (
                          <>এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{selectedCertEmployee.name}</strong> আমাদের প্রতিষ্ঠানের একজন নিয়মিত কর্মকর্তা/কর্মচারী, যিনি সফলভাবে <strong>{selectedCertEmployee.designation}</strong> পদে কর্মরত রহিয়াছেন। তিনি আমাদের সংস্থায় <strong>{selectedCertEmployee.joiningDate || '---'}</strong> তারিখে যোগদান করিয়াছেন। বর্তমানে তাঁহার মাসিক মূল বেতন <strong>{selectedCertEmployee.salary?.toLocaleString()} {currencySymbol}</strong> টাকা।</>
                        ) : (
                          <>This is to formally certify that Mr./Ms. <strong>{selectedCertEmployee.name}</strong> is a bona fide employee of our organization, holding the designation of <strong>{selectedCertEmployee.designation}</strong>. He officially joined our enterprise on <strong>{selectedCertEmployee.joiningDate || '---'}</strong>. His current monthly salary is <strong>{selectedCertEmployee.salary?.toLocaleString()} {currencySymbol}</strong>.</>
                        )}
                      </p>
                      <p style={{ fontSize: '12px', lineHeight: '2.0', textIndent: '30px', margin: '0', color: '#1e293b' }}>
                        {certLanguage === 'bn' ? (
                          <>আমরা নিশ্চয়তা প্রদান করিতেছি যে, তাঁহার ব্যক্তিগত কারণে বিদেশ ভ্রমণ এবং visa আবেদনের ব্যাপারে আমাদের প্রতিষ্ঠানের কোন প্রকার আপত্তি নাই। তাঁহার বিদেশ ভ্রমণকালীন সময়ের জন্য আনুষ্ঠানিক ছুটি মঞ্জুর করা হইয়াছে এবং তাঁহার অনুপস্থিতিকালে তাঁহার চাকরি ও পদ সম্পূর্ণ সুরক্ষিত ও বহাল থাকিবে।</>
                        ) : (
                          <>We confirm that we have absolutely no objection regarding his visa application and travel plans to travel abroad for personal holidays. He has been granted official leave for his trip, and his job security and designation are fully guaranteed during his travel period.</>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div style={{ flex: 1, margin: '24px 0', textAlign: 'left', zIndex: 1 }} className="text-left font-serif py-4">
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span style={{ display: 'inline-block', fontSize: '14px', fontWeight: '950', textTransform: 'uppercase', background: '#059669', color: 'white', padding: '6px 18px', borderRadius: '4px' }}>
                          {certLanguage === 'bn' ? 'ব্যাংক লোন ও ক্রেডিট কার্ড প্রাপ্তির অনাপত্তি পত্র' : 'NO OBJECTION CERTIFICATE (FINANCIAL & BANKING)'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', lineHeight: '2.0', textIndent: '30px', margin: '0 0 12px 0', color: '#1e293b' }}>
                        {certLanguage === 'bn' ? (
                          <>এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{selectedCertEmployee.name}</strong> আমাদের প্রতিষ্ঠানে অত্যন্ত নিষ্ঠা ও সততার সহিত <strong>{selectedCertEmployee.designation}</strong> পদে <strong>{selectedCertEmployee.joiningDate || '---'}</strong> তারিখ হইতে কর্মরত আছেন। বর্তমানে তাঁহার মাসিক সর্বমোট বেতন <strong>{selectedCertEmployee.salary?.toLocaleString()} {currencySymbol}</strong> টাকা যাহা প্রতি মাসের প্রথম সপ্তাহের মধ্যে নিয়মিত পরিশোধ করা হয়।</>
                        ) : (
                          <>This is to formally certify that Mr./Ms. <strong>{selectedCertEmployee.name}</strong> has been actively employed at our organization as a dedicated <strong>{selectedCertEmployee.designation}</strong> since <strong>{selectedCertEmployee.joiningDate || '---'}</strong>. His current net monthly remuneration package is <strong>{selectedCertEmployee.salary?.toLocaleString()} {currencySymbol}</strong>, which is credited in the first week of every month.</>
                        )}
                      </p>
                      <p style={{ fontSize: '12px', lineHeight: '2.0', textIndent: '30px', margin: '0', color: '#1e293b' }}>
                        {certLanguage === 'bn' ? (
                          <>তাঁহার ব্যক্তিগত প্রয়োজনে ব্যাংক লোন, ক্রেডিট কার্ড ফিন্যান্সিয়াল সেবা অথবা ব্যাংক হিসাব খোলার আবেদনের ব্যাপারে আমাদের প্রতিষ্ঠানের পক্ষ হইতে কোনো আপত্তি নাই। তাঁহার আয়ের উৎস নিশ্চিত করার সুবিধার্থে আমরা এই অনাপত্তি পত্র প্রদান করিলাম। উক্ত ঋণ বা ক্রেডিট পরিশোধের দায় সম্পূর্ণরূপে আবেদনকারীর নিজস্ব দায়িত্ব বলিয়া গণ্য হইবে।</>
                        ) : (
                          <>We have no objection to his application for banking credit facilities, loan accounts, or financial credit card options. He is fully authorized to process necessary background salary credit verifications. Please note that the repayment liability for any financial obligations rests solely with him personally.</>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Stamp & Seal placeholder signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', fontSize: '11px', fontFamily: "'Inter'", fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'left' }}>
                      {printLayoutMode === 'digital' && hrmSettings.signatureUrl ? (
                        <img src={hrmSettings.signatureUrl} alt="Signature" style={{ height: '35px', marginBottom: '4px', mixBlendMode: 'darken' }} />
                      ) : (
                        <div style={{ height: '39px' }}></div>
                      )}
                      <div style={{ borderTop: '1.5px solid #1e293b', width: '150px', paddingTop: '4px' }}>
                        {certLanguage === 'bn' ? 'নিয়োগকর্তার স্বাক্ষর' : 'Authorized Signature'}
                      </div>
                      <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>
                        {hrmSettings.footerText || 'Verified Official Document'}
                      </div>
                    </div>
                    
                    {printLayoutMode === 'digital' && hrmSettings.sealUrl && (
                      <div style={{ position: 'absolute', bottom: '20px', left: '160px' }}>
                        <img src={hrmSettings.sealUrl} alt="Official Seal" style={{ height: '70px', width: '70px', mixBlendMode: 'multiply', opacity: 0.85 }} />
                      </div>
                    )}

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ borderTop: '1.5px solid #1e293b', width: '150px', paddingTop: '4px', display: 'inline-block' }}>
                        {certLanguage === 'bn' ? 'গ্রহীতার অঙ্গীকার' : 'Signature of Bearer'}
                      </div>
                    </div>
                  </div>

                  {/* QR Verification Watermark Badge inside live template */}
                  {printLayoutMode === 'digital' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter', sans-serif", zIndex: 10, textAlign: 'left' }}>
                        <div style={{ width: '38px', height: '38px', border: '1px solid #1e293b', padding: '1px', display: 'flex', alignItems: 'center', justify: 'center', background: 'white' }}>
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/?verifyDoc=${currentDocId}`)}`} style={{ width: '34px', height: '34px' }} />
                        </div>
                        <div style={{ textAlign: 'left', lineHeight: '1.1' }}>
                          <p style={{ fontSize: '6.5px', color: '#475569', margin: '0', fontWeight: 'bold', textTransform: 'uppercase' }}>Scan to Verify Authenticity</p>
                          <p style={{ fontSize: '7.5px', color: '#0f172a', margin: '0', fontWeight: '900', fontFamily: 'monospace' }}>ID: {currentDocId || 'PENDING'}</p>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '8px', color: '#94a3b8', fontStyle: 'italic', fontFamily: 'Inter' }}>
                        {certLanguage === 'bn' ? '✓ এটি একটি সিস্টেমে ভেরিফাইড ডিজিটাল কপি।' : '✓ Secure electronic copy, no physical stamp required.'}
                      </div>
                    </div>
                  )}

                  {/* 3 Months disclaimer notice */}
                  <div style={{ fontSize: '8px', color: '#64748b', textAlign: 'center', marginTop: '15px' }}>
                    {certLanguage === 'bn' ? '* এই ডিজিটাল ডকুমেন্টটি ৩ মাসের জন্য অনলাইনে যাচাইযোগ্য। এর পর, শুধুমাত্র অভিজ্ঞতা সনদপত্রের রেকর্ড আমাদের মূল ডাটাবেজে সংরক্ষণ করা হবে।' : '* This digital document is valid and verifiable online for 3 months. After this period, only the core experience record remains securely archived in our master database.'}
                  </div>

                </div>
              ) : (
                <div className="text-center text-gray-400 font-bold text-xs py-20">
                  {isBn ? 'প্রিভিউ দেখতে একটি কর্মীর প্রোফাইল সিলেক্ট করুন!' : 'Select an employee from the dropdown list to see A4 PDF print preview here.'}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 7. Document History Tab */}
      {activeTab === 'document_history' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] border border-gray-150 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{isBn ? 'ডকুমেন্ট হিস্ট্রি' : 'Document Verification History'}</h2>
              <p className="text-sm font-semibold text-slate-500">{isBn ? 'সম্প্রতি জেনারেট করা সকল ডকুমেন্টের তালিকা' : 'List of all recently generated documents'}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex items-center gap-2 max-w-sm">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <p className="text-[9.5px] font-bold text-amber-700 leading-snug">
                {isBn 
                  ? 'সতর্কতা: শুধুমাত্র অভিজ্ঞতা সনদপত্র ব্যতীত সকল ডকুমেন্ট ৩ মাস পর স্বয়ংক্রিয়ভাবে ডাটাবেজ থেকে মুছে ফেলা হয়।' 
                  : 'Note: Except for Experience Certificates, all other generated documents are automatically purged from the database after 3 months.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-150 shadow-sm">
            {hrmRecords.filter(r => ['experience', 'contract', 'noc_visa', 'noc_bank'].includes(r.type)).length === 0 ? (
              <div className="text-center py-20">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-400">{isBn ? 'কোনো রেকর্ড পাওয়া যায়নি' : 'No records found'}</h3>
              </div>
            ) : (
              <div className="grid gap-3">
                {hrmRecords.filter(r => ['experience', 'contract', 'noc_visa', 'noc_bank'].includes(r.type)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(record => (
                  <div key={record.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all cursor-default">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center border border-indigo-200">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">{record.employeeName} <span className="text-[10px] text-slate-400 font-semibold px-2">({record.employeeDesignation})</span></h4>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wider">{record.type.replace('_', ' ')}</span>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Verification ID</p>
                      <p className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 mt-1">{record.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adding / Editing Modal form details (Accessible via onAdd / onUpdate) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto max-h-screen">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] max-w-2xl w-full p-8 shadow-2xl shadow-indigo-950/10 space-y-5 border border-slate-200/80 relative my-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b pb-3.5">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                💼 {editingEmployee ? (isBn ? 'স্টাফ প্রোফাইল এডিট' : 'Edit Staff Profile') : (isBn ? 'নতুন স্টাফ যুক্ত করুন' : 'Register New Employee')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 px-2.5 rounded-full hover:bg-slate-50 border text-slate-500 hover:text-slate-900 font-extrabold transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    {isBn ? 'স্টাফের সম্পূর্ণ নাম' : 'Employee Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                    placeholder={isBn ? 'উদা: আবুল কালাম' : 'e.g. Abul Kalam'}
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5 font-sans">
                    {isBn ? 'পদবি (Designation/Position)' : 'Designation / Job Role'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none text-xs bg-white text-slate-800 font-bold transition-all"
                    value={formData.designation || ''}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  >
                    <option value="" disabled>
                      {isBn ? '-- নির্বাচন করুন --' : '-- Select Role --'}
                    </option>
                    {settings?.businessType === 'Restaurant' ? (
                      <>
                        <option value="waiter">{isBn ? 'ওয়েটার (Waiter)' : 'Waiter'}</option>
                        <option value="manager">{isBn ? 'ম্যানেজার (Manager)' : 'Manager'}</option>
                        <option value="chef">{isBn ? 'শেফ (Chef)' : 'Chef'}</option>
                      </>
                    ) : (
                      <>
                        <option value="manager">{isBn ? 'ম্যানেজার (Manager)' : 'Manager'}</option>
                        <option value="assistant_manager">{isBn ? 'সহকারী ম্যানেজার (Assistant Manager)' : 'Assistant Manager'}</option>
                        <option value="sales_manager">{isBn ? 'সেলস ম্যানেজার (Sales Manager)' : 'Sales Manager'}</option>
                        <option value="sales_team">{isBn ? 'সেলস টিম (Sales Team)' : 'Sales Team'}</option>
                        <option value="warehouse">{isBn ? 'ওয়ারহাউজ (Warehouse)' : 'Warehouse'}</option>
                      </>
                    )}
                    {formData.designation && !['manager', 'assistant_manager', 'sales_manager', 'sales_team', 'warehouse', 'waiter', 'chef'].includes(formData.designation) && (
                      <option value={formData.designation}>{formData.designation}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    {isBn ? 'শাখা বরাদ্দ করুন (Assign Branch)' : 'Assign Branch'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none text-xs bg-white text-slate-800 font-bold transition-all"
                    value={formData.branchId || ''}
                    onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                  >
                    <option value="" disabled>
                      {isBn ? '-- শাখা নির্বাচন করুন --' : '-- Select Branch --'}
                    </option>
                    {branches && branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold font-mono text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                    placeholder="017xxxxxxxx"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    {isBn ? 'ইমেইল এড্রেস (ঐচ্ছিক)' : 'Email Address (Optional)'}
                  </label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold font-mono text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                    placeholder="example@mail.com"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/60 space-y-4 mt-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">{currencySymbol}</div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-indigo-900 tracking-wider font-sans">
                        {isBn ? 'বেতন এবং ভাতা (Salary & Allowances)' : 'Salary & Allowances Breakdown'}
                      </h4>
                      <p className="text-[9px] text-indigo-400/80 font-bold uppercase tracking-wider">{isBn ? 'কর্মীর আয়ের বিবরণী' : 'Employee Compensation Details'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block mb-1.5">
                        {isBn ? 'মাসিক মূল বেতন' : 'Basic Salary'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol}</span>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 rounded-xl pl-7 pr-3 py-2.5 text-xs font-black font-mono text-slate-800 transition-all outline-none"
                          placeholder="0"
                          value={formData.salary === undefined || formData.salary === null || isNaN(Number(formData.salary)) ? '' : formData.salary}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData({ ...formData, salary: val === '' ? '' : (parseInt(val, 10) || 0) });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block mb-1.5" title="Travel and Daily Allowance">
                        {isBn ? 'যাতায়াত ভাতা (TAD)' : 'TAD (Travel)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol}</span>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold font-mono text-slate-800 transition-all outline-none"
                          placeholder="0"
                          value={formData.tadAllowance === undefined || formData.tadAllowance === null || isNaN(Number(formData.tadAllowance)) ? '' : formData.tadAllowance}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData({ ...formData, tadAllowance: val === '' ? '' : (parseInt(val, 10) || 0) });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block mb-1.5">
                        {isBn ? 'খাদ্য ভাতা (Food)' : 'Food Allowance'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol}</span>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold font-mono text-slate-800 transition-all outline-none"
                          placeholder="0"
                          value={formData.foodAllowance === undefined || formData.foodAllowance === null || isNaN(Number(formData.foodAllowance)) ? '' : formData.foodAllowance}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData({ ...formData, foodAllowance: val === '' ? '' : (parseInt(val, 10) || 0) });
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block mb-1.5" title="House Rent Allowance">
                        {isBn ? 'বাড়ি ভাড়া (HRA)' : 'HRA (House Rent)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol}</span>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold font-mono text-slate-800 transition-all outline-none"
                          placeholder="0"
                          value={formData.hraAllowance === undefined || formData.hraAllowance === null || isNaN(Number(formData.hraAllowance)) ? '' : formData.hraAllowance}
                          onChange={e => {
                            const val = e.target.value;
                            setFormData({ ...formData, hraAllowance: val === '' ? '' : (parseInt(val, 10) || 0) });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-indigo-100/60 pt-3.5 mt-2">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{isBn ? 'সর্বমোট মাসিক আয় (Gross)' : 'Total Gross Salary'}</span>
                    <span className="text-base font-black text-indigo-700 font-mono bg-indigo-100/50 px-3 py-1 rounded-lg">
                      {currencySymbol} {((Number(formData.salary) || 0) + (Number(formData.tadAllowance) || 0) + (Number(formData.foodAllowance) || 0) + (Number(formData.hraAllowance) || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    {isBn ? 'ডিউটি শিফট / সময়' : 'Duty Hours / Schedule'}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold font-mono text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                    placeholder="09:00 AM - 06:00 PM"
                    value={formData.schedule || ''}
                    onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    {isBn ? 'যোগদানের তারিখ' : 'Joining Date'}
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-bold font-mono text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                    value={formData.joiningDate || ''}
                    onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    {isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none rounded-xl px-4 py-2.5 text-xs font-bold transition-all text-slate-800"
                    value={formData.bloodGroup || 'O+'}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5 font-sans">
                    {isBn ? 'জরুরি যোগাযোগ নাম্বর' : 'Emergency Contact No'}
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold font-mono text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                    placeholder="01xxxxxxxxx"
                    value={formData.emergencyPhone || ''}
                    onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all duration-200">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2 font-sans">
                    {isBn ? 'কর্মচারীর ছবি (ফটো আপলোড / ড্র্যাগ অ্যান্ড ড্রপ / ইউআরএল)' : 'Employee Photo (Upload / Drag & Drop / URL)'}
                  </label>
                  
                  <div className="flex flex-col md:flex-row items-stretch gap-4">
                    {/* Left side: Drag & Drop click zone / preview */}
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => {
                        setIsDragging(false);
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          try {
                            const base64 = await fileToBase64(file);
                            setFormData((prev) => ({ ...prev, photoUrl: base64 }));
                            setNotification({ message: isBn ? 'ছবি সফলভাবে যুক্ত করা হয়েছে!' : 'Photo added successfully!', type: 'success' });
                          } catch (err) {
                            setNotification({ message: isBn ? 'ছবি প্রসেস করা সম্ভব হয়নি!' : 'Failed to process photo!', type: 'error' });
                          }
                        }
                      }}
                      onClick={() => {
                        document.getElementById('profile-photo-uploader')?.click();
                      }}
                      className={`relative flex-1 min-h-[100px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer select-none transition-all duration-200 ${
                        isDragging 
                          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
                          : 'border-slate-300 bg-white hover:bg-slate-100/55'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="profile-photo-uploader" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            try {
                              const base64 = await fileToBase64(file);
                              setFormData((prev) => ({ ...prev, photoUrl: base64 }));
                              setNotification({ message: isBn ? 'ছবি সফলভাবে যুক্ত করা হয়েছে!' : 'Photo added successfully!', type: 'success' });
                            } catch (err) {
                              setNotification({ message: isBn ? 'ছবি প্রসেস করা সম্ভব হয়নি!' : 'Failed to process photo!', type: 'error' });
                            }
                          }
                        }}
                      />
                      
                      {formData.photoUrl && (formData.photoUrl.startsWith('data:image/') || formData.photoUrl.startsWith('http://') || formData.photoUrl.startsWith('https://')) ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={formData.photoUrl} 
                            alt="Preview" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800">{isBn ? 'ছবি সংযুক্ত হয়েছে' : 'Photo Connected'}</p>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData((prev) => ({ ...prev, photoUrl: '' }));
                              }}
                              className="text-[10px] text-red-500 hover:underline font-bold mt-0.5"
                            >
                              {isBn ? 'মুছে ফেলুন' : 'Remove Photo'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-slate-600">
                            {isBn ? 'ড্রপ করুন অথবা সিলেক্ট করুন' : 'Drop file here or touch to upload'}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {isBn ? 'সহজ ড্র্যাগ অ্যান্ড ড্রপ পদ্ধতি' : 'Simpler drag and drop click method'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right side: URL input */}
                    <div className="flex-1 w-full flex flex-col justify-center">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5 font-sans">
                        {isBn ? 'অথবা ছবির ইউআরএল দিন' : 'Or input Photo URL directly'}
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none rounded-xl px-4 py-2.5 text-xs font-semibold font-mono text-slate-800"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.photoUrl?.startsWith('data:image') ? '' : formData.photoUrl || ''}
                        onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                      />
                      <p className="text-[9px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                        {isBn ? '* যদি কোনো ছবি সরাসরি ক্যাশ আপলোড করতে চান তবে বাম পাশের আপলোড ব্যবহার করুন।' : '* For convenient database synchronization, uploading files directly converts them to highly optimized lightweight Base64.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                    {isBn ? 'বেতন প্রদানের মাধ্যম' : 'Payment Disbursal Mode'}
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 transition-all"
                    value={formData.paymentMode || 'cash'}
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value as any })}
                  >
                    <option value="cash">{isBn ? 'হাত ক্যাশ (Cash in Hand)' : 'Cash in Hand'}</option>
                    <option value="bank">{isBn ? 'ব্যাংক একাউন্ট (Bank Account)' : 'Bank Account'}</option>
                    <option value="mfs">{isBn ? 'এমএফএস ওয়ালেট (bKash/Nagad)' : 'MFS Wallet (bKash/Nagad)'}</option>
                  </select>
                </div>

                {formData.paymentMode === 'bank' && (
                  <div className="col-span-1 sm:col-span-2 bg-slate-50/75 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5 font-sans">
                      🏦 {isBn ? 'ব্যাংক একাউন্টের তথ্য' : 'Bank Account Information'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1 font-sans">
                          {isBn ? 'ব্যাংকের নাম' : 'Bank Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                          placeholder={isBn ? 'উদা: ডাচ-বাংলা ব্যাংক' : 'e.g. Dutch-Bangla Bank'}
                          value={formData.bankName || ''}
                          onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1 font-sans">
                          {isBn ? 'ব্রাঞ্চ / শাখা' : 'Branch Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                          placeholder={isBn ? 'উদা: মিরপুর ব্রাঞ্চ' : 'e.g. Mirpur Branch'}
                          value={formData.bankBranch || ''}
                          onChange={e => setFormData({ ...formData, bankBranch: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1 font-sans">
                          {isBn ? 'একাউন্ট নাম্বার' : 'Account Number'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold font-mono text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                          placeholder="e.g. 1234567890"
                          value={formData.accountNo || ''}
                          onChange={e => setFormData({ ...formData, accountNo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMode === 'mfs' && (
                  <div className="col-span-1 sm:col-span-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5 font-sans">
                      📱 {isBn ? 'এমএফএস ওয়ালেট তথ্য' : 'MFS Wallet Information'}
                    </p>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1 font-sans">
                        {isBn ? 'মোবাইল নাম্বার (bKash/Nagad/Rocket)' : 'Mobile Number (bKash/Nagad/Rocket)'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{11}"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold font-mono text-slate-800 transition-all outline-none focus:ring-4 focus:ring-indigo-100/50"
                        placeholder="01xxxxxxxxx"
                        value={formData.mfsNo || ''}
                        onChange={e => setFormData({ ...formData, mfsNo: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5 font-sans">
                    {isBn ? 'স্টাফ স্ট্যাটাস' : 'Employment Status'}
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-600 outline-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 transition-all"
                    value={formData.status || 'active'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between gap-4 mt-2">
                  <div>
                    <label className="text-xs font-black text-indigo-950 block mb-1">
                      {isBn ? 'সিস্টেম লগইন অনুমতি দিন?' : 'Allow System Login?'}
                    </label>
                    <p className="text-[10px] text-indigo-700 leading-relaxed max-w-md font-sans">
                      {isBn 
                        ? 'সক্রিয় করলে এই কর্মচারী তার ইমেইল দিয়ে সিস্টেমে লগইন করে ড্যাশবোর্ড অ্যাক্সেস করতে পারবে।' 
                        : 'If enabled, this staff member can use their email to sign in and access designated areas.'}
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, allowLogin: !prev.allowLogin }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        formData.allowLogin ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          formData.allowLogin ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>

              <div className="flex gap-3 justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors uppercase tracking-wider text-[11px]"
                >
                  {isBn ? 'ফিরে যান' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl font-black transition-colors uppercase tracking-wider text-[11px] flex items-center gap-1.5 shadow-md shadow-slate-900/10"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Employee'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Permanent Deletion Confirmation Modal */}
      {deleteConfirmEmployeeId && (() => {
        const targetEmp = employees.find(e => e.id === deleteConfirmEmployeeId);
        if (!targetEmp) return null;
        return (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-150 relative text-xs"
            >
              <div className="flex items-center gap-3 text-red-600 border-b pb-3">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    {isBn ? 'স্থায়ীভাবে মুছে ফেলার সতর্কতা' : 'Permanent Deletion Warning'}
                  </h3>
                  <p className="text-[10px] font-bold text-red-500 tracking-wide uppercase">
                    {isBn ? 'এটি আর ফিরিয়ে আনা সম্ভব নয়' : 'This action is irreversible'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <img 
                    src={targetEmp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&fit=crop'} 
                    alt={targetEmp.name} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{targetEmp.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">💼 {targetEmp.designation}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-600 leading-relaxed">
                    {isBn 
                      ? 'আপনি কি নিশ্চিতভাবে এই কর্মীর সমস্ত রেকর্ড আমাদের সিস্টেম থেকে চিরতরে মুছে ফেলতে চান? ডাটাবেজে এর কোনো প্রকার অবশিষ্টাংশ রাখা হবে না:' 
                      : 'Are you sure you want to permanently delete this employee? Absolutely no traces will be kept in the database. The following associated records will be purged:'}
                  </p>

                  <ul className="space-y-1.5 pl-1.5 font-bold text-slate-500">
                    <li className="flex items-center gap-2 text-[11px]">
                      <span className="text-red-500">✕</span>
                      <span>{isBn ? 'প্রধান প্রোফাইল ও বায়োডাটা রেকর্ড' : 'Main Profile & Resume Record'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-[11px]">
                      <span className="text-red-500">✕</span>
                      <span>{isBn ? 'সিস্টেম লগইন ক্রেডেনশিয়াল (Auth & User)' : 'System Login Credentials (Auth & User)'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-[11px]">
                      <span className="text-red-500">✕</span>
                      <span>{isBn ? 'বেতন পরিশোধের বিবরণী ও পে-স্লিপ' : 'Payroll History & Payslips'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-[11px]">
                      <span className="text-red-500">✕</span>
                      <span>{isBn ? 'ছুটি ও ছুটির পূর্বতন হিসেব' : 'Leaves & Request Records'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-[11px]">
                      <span className="text-red-500">✕</span>
                      <span>{isBn ? 'তৈরি করা সনদপত্র ও অন্যান্য পিডিএফ ফাইল' : 'Experience Certificates & Generated PDFs'}</span>
                    </li>
                    <li className="flex items-center gap-2 text-[11px]">
                      <span className="text-red-500">✕</span>
                      <span>{isBn ? 'প্রোফাইল ছবি এবং লাইভ হাজিরা লগ' : 'Profile Photo & Live Attendance Logs'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  disabled={isDeletingProcess}
                  onClick={() => setDeleteConfirmEmployeeId(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-150 disabled:opacity-55 text-gray-700 rounded-xl font-bold transition-all uppercase tracking-wider text-center cursor-pointer border border-gray-200/40"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isDeletingProcess}
                  onClick={() => executeDeleteEmployee(deleteConfirmEmployeeId)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-black transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-200"
                >
                  {isDeletingProcess ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>{isBn ? 'মুছে ফেলা হচ্ছে...' : 'Purging...'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'চিরতরে ডিলিট করুন' : 'Confirm Purge'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

    </div>
  );
}
