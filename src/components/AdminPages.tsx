import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  PenTool, 
  Layers, 
  Terminal, 
  Sliders, 
  Phone, 
  Activity, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Database, 
  RefreshCw, 
  Play, 
  Trash2, 
  Plus, 
  Search, 
  MessageCircle, 
  Check, 
  Settings, 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  Send,
  Sparkles,
  Info,
  MousePointer,
  Hand,
  ArrowRight,
  Type,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid,
  Square,
  Circle,
  Diamond,
  Slash,
  Maximize2,
  Lock,
  Unlock,
  Eraser,
  Image,
  Boxes,
  GripHorizontal,
  Move,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Link2,
  Copy,
  Globe,
  Eye,
  Save,
  AlertCircle,
  Clock,
  Laptop,
  MapPin,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Wrapper to double check user email is stratproamz@gmail.com
export function AdminSecurityWrapper({ user, children }: { user: any, children: React.ReactNode }) {
  const isAuthorized = user?.email?.toLowerCase().trim() === 'stratproamz@gmail.com';
  
  if (!isAuthorized) {
    return (
      <div id="unauthorized-container" className="flex flex-col items-center justify-center min-h-[500px] p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm mt-4">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center text-rose-600 mb-6 border border-rose-100 dark:border-rose-900/40">
          <AlertTriangle className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center text-xs font-semibold uppercase tracking-wider leading-relaxed">
          This secure terminal is exclusively accessible to authorized system administration accounts.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// 1. ADMIN HOMEPAGE
export function AdminHomepage() {
  const stats = [
    { label: 'System Load', value: '14.2%', icon: Cpu, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400' },
    { label: 'Database Status', value: 'Optimal', icon: Database, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
    { label: 'Sync Pipeline', value: 'Active', icon: Activity, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
    { label: 'Admin Session', value: 'Secure', icon: CheckCircle2, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400' }
  ];

  const quickActions = [
    { title: 'Re-initialize Sync Queue', desc: 'Clear local indexedDB buffer and trigger a global resync.', icon: RefreshCw },
    { title: 'View Realtime Logs', desc: 'Stream master cloud instance terminal messages.', icon: Terminal },
    { title: 'System Diagnostics', desc: 'Check network response, latency, and CPU throttle.', icon: Activity }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_70%_70%,#312e81,transparent_50%)] opacity-50 pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-400/20">
            SYSTEM ROOT ACCESS
          </span>
          <h1 className="text-4xl font-black tracking-tight">Welcome back, Admin</h1>
          <p className="text-slate-300 text-sm max-w-xl font-medium">
            You are logged into the central command deck. Manage, test, and audit live micro-services, layout pipelines, and billing structures.
          </p>
        </div>
      </div>

      {/* Grid of System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Sections Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Administrative Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <div key={action.title} className="p-4 rounded-2xl border border-gray-50 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all flex gap-3 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-105 transition-transform shrink-0 self-start">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-wide">{action.title}</h4>
                    <p className="text-[11px] text-gray-400 font-medium leading-normal">{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Info Rail */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </h2>
          <div className="space-y-4 font-mono text-[11px]">
            <div className="flex gap-3 text-emerald-600 dark:text-emerald-400">
              <span className="shrink-0">[08:41:09]</span>
              <span>Secure socket handshake completed</span>
            </div>
            <div className="flex gap-3 text-indigo-600 dark:text-indigo-400">
              <span className="shrink-0">[08:40:42]</span>
              <span>Admin login authenticated successfully</span>
            </div>
            <div className="flex gap-3 text-amber-600 dark:text-amber-400">
              <span className="shrink-0">[08:39:15]</span>
              <span>Pending transaction queue synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 2. EXCALIDRAW SKETCHPAD
export function AdminExcalidraw() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Canvas State
  const [elements, setElements] = useState<any[]>(() => {
    const saved = localStorage.getItem('excalidraw_elements');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<any[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // App Settings
  const [tool, setTool] = useState<'select' | 'pan' | 'pen' | 'line' | 'arrow' | 'rect' | 'diamond' | 'circle' | 'text' | 'eraser'>('pen');
  const [color, setColor] = useState('#4f46e5');
  const [fillColor, setFillColor] = useState('transparent');
  const [fillStyle, setFillStyle] = useState<'none' | 'solid' | 'semi' | 'hachure'>('none');
  const [lineWidth, setLineWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [sloppiness, setSloppiness] = useState<'straight' | 'sloppy' | 'very_sloppy'>('sloppy');
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Architects Daughter');
  const [showGrid, setShowGrid] = useState(true);
  const [canvasBg, setCanvasBg] = useState<'light' | 'dark' | 'grid'>('light');
  const [isToolLocked, setIsToolLocked] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAiDiagram, setShowAiDiagram] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAiDiagram, setIsGeneratingAiDiagram] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  // AI Business Copilot Chat States (চ্যাট সিস্টেম)
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<string>('বিজনেস প্ল্যানার জিপিটি (Business Planner)');
  const [isGeneratingMapFromChat, setIsGeneratingMapFromChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>(() => [
    {
      role: 'assistant',
      content: `স্বাগতম! আমি আপনার **Mind Ingenia Project Map Planner** পার্সোনাল বিজনেস কো-পাইলট। 🚀

আমি যেকোনো ব্যবসায়িক আইডিয়া (যেমন: অ্যামাজন প্রাইভেট লেবেল ব্র্যান্ড, বাংলাদেশে নতুন স্টার্টআপ বা ই-কমার্স) বাস্তবায়নের জন্য এ-টু-জেড মাস্টার প্ল্যান তৈরি করতে পারি। 

আপনি যে বিষয়ে বলবেন, আমি স্বয়ংক্রিয়ভাবে সেই সেক্টরের **১০ বছরের অভিজ্ঞ কন্সালট্যান্টের রূপ (Character Persona)** ধারণ করব এবং গভীর বিশ্লেষণ করে একটি পূর্ণাঙ্গ গাইডলাইন দিব। 

আপনি চাইলে আমার দেওয়া যেকোনো পরামর্শ থেকে সরাসরি **ইন্টারেক্টিভ মাইন্ড ম্যাপ/ডায়াগ্রাম** তৈরি করে বোর্ডে যোগ করতে পারেন! শুরু করতে নিচের যেকোনো একটি সাজেশনে ক্লিক করুন বা আপনার আইডিয়াটি লিখুন।`,
      persona: 'Business Planner Copilot'
    }
  ]);
  const [opacity, setOpacity] = useState(100);
  const [edges, setEdges] = useState<'sharp' | 'round'>('round');
  
  // Floating toolbar drag state (relative offset from default center top position)
  const [toolbarOffset, setToolbarOffset] = useState({ x: 0, y: 0 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const [toolbarDragStart, setToolbarDragStart] = useState({ x: 0, y: 0 });

  // Infinite Canvas Pan / Zoom
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Interaction state
  const [action, setAction] = useState<'none' | 'drawing' | 'moving' | 'resizing' | 'panning'>('none');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // World coords
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Screen coords for panning
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // Element position offsets
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([]);

  // Text tool state
  const [editingTextElement, setEditingTextElement] = useState<any | null>(null);
  const [textValue, setTextValue] = useState('');
  const [textPos, setTextPos] = useState({ x: 0, y: 0 }); // Screen coords

  // Keep history in sync
  const saveState = (newElements: any[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newElements);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setElements(newElements);
    localStorage.setItem('excalidraw_elements', JSON.stringify(newElements));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setElements(history[prevIndex]);
      localStorage.setItem('excalidraw_elements', JSON.stringify(history[prevIndex]));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
      localStorage.setItem('excalidraw_elements', JSON.stringify(history[nextIndex]));
    }
  };

  // Screen to world coord conversion
  const screenToWorld = (screenX: number, screenY: number) => {
    return {
      x: (screenX - panX) / zoom,
      y: (screenY - panY) / zoom
    };
  };

  const worldToScreen = (worldX: number, worldY: number) => {
    return {
      x: worldX * zoom + panX,
      y: worldY * zoom + panY
    };
  };

  // Get distance calculations
  const distance = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1);
  const distanceToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return distance(px, py, x1, y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return distance(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
  };

  // Detect element under pointer
  const getElementAtPosition = (px: number, py: number) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const minX = Math.min(el.x, el.x + el.width);
      const maxX = Math.max(el.x, el.x + el.width);
      const minY = Math.min(el.y, el.y + el.height);
      const maxY = Math.max(el.y, el.y + el.height);

      if (el.type === 'rect' || el.type === 'diamond') {
        if (px >= minX && px <= maxX && py >= minY && py <= maxY) {
          return el;
        }
      } else if (el.type === 'circle') {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const rx = Math.abs(el.width / 2);
        const ry = Math.abs(el.height / 2);
        if (rx > 0 && ry > 0) {
          const normX = (px - cx) / rx;
          const normY = (py - cy) / ry;
          if (normX * normX + normY * normY <= 1.1) {
            return el;
          }
        }
      } else if (el.type === 'line' || el.type === 'arrow') {
        const dist = distanceToSegment(px, py, el.x, el.y, el.x + el.width, el.y + el.height);
        if (dist <= 8) return el;
      } else if (el.type === 'text') {
        const padding = 10;
        if (px >= el.x - padding && px <= el.x + el.width + padding && py >= el.y - padding && py <= el.y + el.height + padding) {
          return el;
        }
      } else if (el.type === 'pen') {
        if (el.points && el.points.length > 1) {
          for (let j = 0; j < el.points.length - 1; j++) {
            const p1 = el.points[j];
            const p2 = el.points[j + 1];
            const dist = distanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y);
            if (dist <= 8) return el;
          }
        }
      }
    }
    return null;
  };

  // Find if click is near resize handles of selected element
  const getResizeHandleAtPosition = (px: number, py: number, el: any) => {
    let minX = el.x;
    let minY = el.y;
    let maxX = el.x + el.width;
    let maxY = el.y + el.height;

    if (el.type === 'pen' && el.points && el.points.length > 0) {
      minX = Math.min(...el.points.map((p: any) => p.x));
      minY = Math.min(...el.points.map((p: any) => p.y));
      maxX = Math.max(...el.points.map((p: any) => p.x));
      maxY = Math.max(...el.points.map((p: any) => p.y));
    } else {
      minX = Math.min(el.x, el.x + el.width);
      minY = Math.min(el.y, el.y + el.height);
      maxX = Math.max(el.x, el.x + el.width);
      maxY = Math.max(el.y, el.y + el.height);
    }

    const handles = [
      { id: 'nw', x: minX, y: minY },
      { id: 'ne', x: maxX, y: minY },
      { id: 'sw', x: minX, y: maxY },
      { id: 'se', x: maxX, y: maxY }
    ];

    const threshold = 10 / zoom;
    for (const h of handles) {
      if (distance(px, py, h.x, h.y) <= threshold) {
        return h.id as 'nw' | 'ne' | 'sw' | 'se';
      }
    }
    return null;
  };

  // Infinite Grid Renderer
  const drawInfiniteGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = canvasBg === 'dark' ? '#1e293b' : '#e2e8f0';
    ctx.lineWidth = 1;
    const gridGap = 30;

    const startX = -panX / zoom;
    const startY = -panY / zoom;
    const endX = (width - panX) / zoom;
    const endY = (height - panY) / zoom;

    const firstX = Math.floor(startX / gridGap) * gridGap;
    const firstY = Math.floor(startY / gridGap) * gridGap;

    for (let x = firstX; x < endX; x += gridGap) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = firstY; y < endY; y += gridGap) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Hand-drawn Line drawing pass helper
  const drawSloppyLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeColor: string,
    w: number,
    sStyle: 'solid' | 'dashed' | 'dotted',
    slop: 'straight' | 'sloppy' | 'very_sloppy'
  ) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (sStyle === 'dashed') {
      ctx.setLineDash([8, 6]);
    } else if (sStyle === 'dotted') {
      ctx.setLineDash([2, 4]);
    } else {
      ctx.setLineDash([]);
    }

    if (slop === 'straight') {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 5) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const passes = slop === 'very_sloppy' ? 3 : 2;
    const maxDev = slop === 'very_sloppy' ? 3.5 : 1.5;
    const overshoot = slop === 'very_sloppy' ? 6 : 3.5;

    for (let pass = 0; pass < passes; pass++) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const sx = x1 - (dx / len) * (Math.random() * overshoot);
      const sy = y1 - (dy / len) * (Math.random() * overshoot);
      const ex = x2 + (dx / len) * (Math.random() * overshoot);
      const ey = y2 + (dy / len) * (Math.random() * overshoot);

      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2;
      const px = -dy / len;
      const py = dx / len;
      const deviation = (Math.random() - 0.5) * (len * 0.012 + maxDev);
      const cx = mx + px * deviation;
      const cy = my + py * deviation;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cx, cy, ex, ey);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Hand-drawn Circle drawing pass helper
  const drawSloppyEllipse = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    strokeColor: string,
    w: number,
    sStyle: 'solid' | 'dashed' | 'dotted',
    slop: 'straight' | 'sloppy' | 'very_sloppy'
  ) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (sStyle === 'dashed') {
      ctx.setLineDash([8, 6]);
    } else if (sStyle === 'dotted') {
      ctx.setLineDash([2, 4]);
    } else {
      ctx.setLineDash([]);
    }

    if (slop === 'straight') {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const passes = slop === 'very_sloppy' ? 3 : 2;
    const maxNoise = slop === 'very_sloppy' ? 0.04 : 0.02;

    for (let pass = 0; pass < passes; pass++) {
      ctx.beginPath();
      const overlap = 0.2 + Math.random() * 0.2;
      const steps = 32;
      const startAngle = (Math.random() - 0.5) * 0.25;

      for (let i = 0; i <= steps; i++) {
        const angle = startAngle + (i / steps) * (2 * Math.PI + overlap);
        const noise = 1 + (Math.random() - 0.5) * maxNoise;
        const xPos = cx + Math.cos(angle) * rx * noise;
        const yPos = cy + Math.sin(angle) * ry * noise;
        if (i === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  // Draw any element to the canvas
  const drawElement = (ctx: CanvasRenderingContext2D, el: any) => {
    ctx.save();
    if (el.opacity !== undefined) {
      ctx.globalAlpha = el.opacity / 100;
    }

    if (el.type === 'pen') {
      if (!el.points || el.points.length < 2) {
        ctx.restore();
        return;
      }
      ctx.save();
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i].x, el.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      return;
    }

    const minX = Math.min(el.x, el.x + el.width);
    const maxX = Math.max(el.x, el.x + el.width);
    const minY = Math.min(el.y, el.y + el.height);
    const maxY = Math.max(el.y, el.y + el.height);
    const w = maxX - minX;
    const h = maxY - minY;

    // Handle Fills
    if (el.fillColor && el.fillColor !== 'transparent') {
      ctx.save();
      ctx.fillStyle = el.fillColor;
      
      // Configure opacity
      const baseOp = el.opacity !== undefined ? el.opacity / 100 : 1.0;
      if (el.fillStyle === 'semi') {
        ctx.globalAlpha = baseOp * 0.35;
      } else if (el.fillStyle === 'hachure') {
        ctx.globalAlpha = baseOp * 0.5;
      } else {
        ctx.globalAlpha = baseOp;
      }

      // Create path shape
      ctx.beginPath();
      if (el.type === 'rect') {
        ctx.rect(minX, minY, w, h);
      } else if (el.type === 'diamond') {
        ctx.moveTo(minX + w / 2, minY);
        ctx.lineTo(maxX, minY + h / 2);
        ctx.lineTo(minX + w / 2, maxY);
        ctx.lineTo(minX, minY + h / 2);
        ctx.closePath();
      } else if (el.type === 'circle') {
        ctx.ellipse(minX + w / 2, minY + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
      }

      if (el.fillStyle === 'hachure') {
        ctx.clip();
        // Draw sketchy diagonal hachure fill lines
        const step = 8 + el.lineWidth;
        const diagonal = Math.hypot(w, h);
        for (let offset = -diagonal; offset < diagonal * 2; offset += step) {
          drawSloppyLine(
            ctx,
            minX + offset,
            minY - 10,
            minX + offset - diagonal,
            maxY + 10,
            el.fillColor,
            Math.max(1, el.lineWidth * 0.5),
            'solid',
            el.sloppiness
          );
        }
      } else {
        ctx.fill();
      }
      ctx.restore();
    }

    // Handle Outlines / Strokes
    if (el.type === 'rect') {
      drawSloppyLine(ctx, minX, minY, maxX, minY, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
      drawSloppyLine(ctx, maxX, minY, maxX, maxY, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
      drawSloppyLine(ctx, maxX, maxY, minX, maxY, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
      drawSloppyLine(ctx, minX, maxY, minX, minY, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
    } else if (el.type === 'diamond') {
      drawSloppyLine(ctx, minX + w / 2, minY, maxX, minY + h / 2, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
      drawSloppyLine(ctx, maxX, minY + h / 2, minX + w / 2, maxY, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
      drawSloppyLine(ctx, minX + w / 2, maxY, minX, minY + h / 2, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
      drawSloppyLine(ctx, minX, minY + h / 2, minX + w / 2, minY, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
    } else if (el.type === 'circle') {
      drawSloppyEllipse(ctx, minX + w / 2, minY + h / 2, w / 2, h / 2, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
    } else if (el.type === 'line') {
      drawSloppyLine(ctx, el.x, el.y, el.x + el.width, el.y + el.height, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
    } else if (el.type === 'arrow') {
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x + el.width;
      const y2 = el.y + el.height;
      drawSloppyLine(ctx, x1, y1, x2, y2, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);

      // Draw Arrow Head
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLength = 15;
      const arrowPoint1X = x2 - headLength * Math.cos(angle - Math.PI / 6);
      const arrowPoint1Y = y2 - headLength * Math.sin(angle - Math.PI / 6);
      const arrowPoint2X = x2 - headLength * Math.cos(angle + Math.PI / 6);
      const arrowPoint2Y = y2 - headLength * Math.sin(angle + Math.PI / 6);

      drawSloppyLine(ctx, x2, y2, arrowPoint1X, arrowPoint1Y, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
      drawSloppyLine(ctx, x2, y2, arrowPoint2X, arrowPoint2Y, el.color, el.lineWidth, el.strokeStyle, el.sloppiness);
    } else if (el.type === 'text') {
      ctx.save();
      ctx.fillStyle = el.color;
      const size = el.fontSize || 18;
      const fFamily = el.fontFamily || 'Architects Daughter';
      ctx.font = `${size}px "${fFamily}", cursive, sans-serif`;
      ctx.textBaseline = 'top';
      if (el.text) {
        const lines = el.text.split('\n');
        lines.forEach((line: string, index: number) => {
          ctx.fillText(line, el.x, el.y + index * size * 1.25);
        });
      }
      ctx.restore();
    } else if (el.type === 'image' && el.src) {
      ctx.save();
      if (!el._img) {
        el._img = new window.Image();
        el._img.src = el.src;
        el._img.onload = () => {
          redrawCanvas();
        };
      }
      if (el._img.complete) {
        ctx.drawImage(el._img, minX, minY, w, h);
      } else {
        // Draw dashed loading box
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(minX, minY, w, h);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(minX, minY, w, h);
      }
      ctx.restore();
    }

    // Centered text support for shapes with automatic wrapping & font-scaling
    if (el.type !== 'text' && el.type !== 'arrow' && el.type !== 'line' && el.type !== 'pen' && el.type !== 'image' && el.text) {
      ctx.save();
      
      const baseSize = el.fontSize || 14;
      const fFamily = el.fontFamily || 'Inter';
      
      // Determine maximum width based on shape type for aesthetic fit
      let maxTextWidth = w - 24;
      if (el.type === 'circle') {
        maxTextWidth = w * 0.72;
      } else if (el.type === 'diamond') {
        maxTextWidth = w * 0.65;
      }
      if (maxTextWidth < 30) maxTextWidth = 30;

      // Wrapping and font scaling algorithm
      let lines: string[] = [];
      let size = baseSize;
      
      for (let s = baseSize; s >= 9; s--) {
        size = s;
        ctx.font = `bold ${size}px "${fFamily}", sans-serif`;
        
        // Wrap text under current font size
        const paragraphs = el.text.split('\n');
        lines = [];
        
        paragraphs.forEach((para: string) => {
          if (!para.trim()) {
            lines.push('');
            return;
          }
          const words = para.split(' ');
          let currentLine = '';
          words.forEach((word: string) => {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTextWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine) {
            lines.push(currentLine);
          }
        });
        
        const totalHeight = lines.length * size * 1.25;
        // If it fits inside the shape height (with padding), or we hit the minimum size, we stop
        if (totalHeight <= h - 16 || s === 9) {
          break;
        }
      }

      ctx.fillStyle = el.color || (canvasBg === 'dark' ? '#f8fafc' : '#0f172a');
      ctx.font = `bold ${size}px "${fFamily}", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textHeight = lines.length * size * 1.25;
      const centerY = minY + h / 2 - textHeight / 2 + size / 2;
      
      lines.forEach((line: string, index: number) => {
        ctx.fillText(line, minX + w / 2, centerY + index * size * 1.25);
      });
      
      ctx.restore();
    }

    ctx.restore();
  };

  // Redraw Canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Background
    ctx.fillStyle = canvasBg === 'dark' ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render elements with pan and zoom
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // Infinite Grid
    if (showGrid) {
      drawInfiniteGrid(ctx, canvas.width, canvas.height);
    }

    // Main elements
    elements.forEach(el => {
      drawElement(ctx, el);
    });

    // Temp element in-progress
    if (action === 'drawing' && drawingPoints.length > 0) {
      const lastPt = drawingPoints[drawingPoints.length - 1];
      if (tool === 'pen') {
        const tempEl = {
          type: 'pen',
          points: drawingPoints,
          color: color,
          lineWidth: lineWidth,
          strokeStyle: strokeStyle,
          sloppiness: sloppiness,
          opacity: opacity
        };
        drawElement(ctx, tempEl);
      } else if (tool === 'rect' || tool === 'diamond' || tool === 'circle' || tool === 'line' || tool === 'arrow') {
        const tempEl = {
          type: tool,
          x: startPos.x,
          y: startPos.y,
          width: lastPt.x - startPos.x,
          height: lastPt.y - startPos.y,
          color: color,
          fillColor: fillColor,
          fillStyle: fillStyle,
          lineWidth: lineWidth,
          strokeStyle: strokeStyle,
          sloppiness: sloppiness,
          opacity: opacity,
          edges: edges
        };
        drawElement(ctx, tempEl);
      }
    }

    // Selection indicators
    if (tool === 'select' && selectedElementId) {
      const selectedEl = elements.find(el => el.id === selectedElementId);
      if (selectedEl) {
        // Draw dotted selector box
        let minX = selectedEl.x;
        let minY = selectedEl.y;
        let maxX = selectedEl.x + selectedEl.width;
        let maxY = selectedEl.y + selectedEl.height;

        if (selectedEl.type === 'pen' && selectedEl.points && selectedEl.points.length > 0) {
          minX = Math.min(...selectedEl.points.map((p: any) => p.x));
          minY = Math.min(...selectedEl.points.map((p: any) => p.y));
          maxX = Math.max(...selectedEl.points.map((p: any) => p.x));
          maxY = Math.max(...selectedEl.points.map((p: any) => p.y));
        } else {
          minX = Math.min(selectedEl.x, selectedEl.x + selectedEl.width);
          minY = Math.min(selectedEl.y, selectedEl.y + selectedEl.height);
          maxX = Math.max(selectedEl.x, selectedEl.x + selectedEl.width);
          maxY = Math.max(selectedEl.y, selectedEl.y + selectedEl.height);
        }

        const padding = 6 / zoom;
        ctx.save();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([6 / zoom, 4 / zoom]);
        ctx.strokeRect(minX - padding, minY - padding, (maxX - minX) + padding * 2, (maxY - minY) + padding * 2);

        // Draw 4 resize handles
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([]);
        const hSize = 5 / zoom;

        const corners = [
          { id: 'nw', x: minX, y: minY },
          { id: 'ne', x: maxX, y: minY },
          { id: 'sw', x: minX, y: maxY },
          { id: 'se', x: maxX, y: maxY }
        ];

        corners.forEach(c => {
          ctx.beginPath();
          ctx.arc(c.x, c.y, hSize, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();
      }
    }

    ctx.restore();
  };

  // Set up resize hook
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    window.addEventListener('resize', handleResize);
    // Initial size
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [elements, panX, panY, zoom, tool, selectedElementId, showGrid, canvasBg, drawingPoints, action, color, fillColor, fillStyle, lineWidth, strokeStyle, sloppiness, opacity, edges]);

  // Key Event triggers for Selection delete & Undo/Redo & Tool Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextElement) return; // Ignore if writing text
      
      // Hotkeys for selecting tools
      if (e.key === '1') {
        setTool('select');
      } else if (e.key === '2') {
        setTool('rect');
        setSelectedElementId(null);
      } else if (e.key === '3') {
        setTool('diamond');
        setSelectedElementId(null);
      } else if (e.key === '4') {
        setTool('circle');
        setSelectedElementId(null);
      } else if (e.key === '5') {
        setTool('arrow');
        setSelectedElementId(null);
      } else if (e.key === '6') {
        setTool('line');
        setSelectedElementId(null);
      } else if (e.key === '7') {
        setTool('pen');
        setSelectedElementId(null);
      } else if (e.key === '8') {
        setTool('text');
        setSelectedElementId(null);
      } else if (e.key === '0') {
        setTool('eraser');
        setSelectedElementId(null);
      }
      
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedElementId) {
        const nextElements = elements.filter(el => el.id !== selectedElementId);
        setSelectedElementId(null);
        saveState(nextElements);
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [elements, selectedElementId, historyIndex, history, editingTextElement]);

  // Handle toolbar dragging
  useEffect(() => {
    if (!isDraggingToolbar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - toolbarDragStart.x;
      const dy = e.clientY - toolbarDragStart.y;
      setToolbarOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setToolbarDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - toolbarDragStart.x;
      const dy = touch.clientY - toolbarDragStart.y;
      setToolbarOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setToolbarDragStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleMouseUp = () => {
      setIsDraggingToolbar(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingToolbar, toolbarDragStart]);

  // Handle Double Click to Edit Text/Shapes
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const world = screenToWorld(screenX, screenY);

    const clickedEl = getElementAtPosition(world.x, world.y);
    if (clickedEl) {
      setEditingTextElement(clickedEl);
      setTextValue(clickedEl.text || '');
      setTextPos({ x: e.clientX, y: e.clientY });
      
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 50);
    } else if (tool === 'select') {
      // Spawn a new text element on double click
      const textId = 'text_' + Math.random().toString(36).substr(2, 9);
      const newTextEl = {
        id: textId,
        type: 'text',
        x: world.x,
        y: world.y,
        width: 120,
        height: fontSize * 1.3,
        color: color,
        text: '',
        fontSize: fontSize,
        fontFamily: fontFamily
      };

      setEditingTextElement(newTextEl);
      setTextValue('');
      setTextPos({ x: e.clientX, y: e.clientY });
      
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 50);
    }
  };

  // Start Interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const world = screenToWorld(screenX, screenY);

    if (tool === 'select') {
      // 1. Check resize handle clicks
      if (selectedElementId) {
        const selectedEl = elements.find(el => el.id === selectedElementId);
        if (selectedEl) {
          const handle = getResizeHandleAtPosition(world.x, world.y, selectedEl);
          if (handle) {
            setAction('resizing');
            setResizeHandle(handle);
            setStartPos(world);
            return;
          }
        }
      }

      // 2. Check direct element clicks
      const clickedEl = getElementAtPosition(world.x, world.y);
      if (clickedEl) {
        setSelectedElementId(clickedEl.id);
        setAction('moving');
        setStartPos(world);
        setDragOffset({
          x: world.x - clickedEl.x,
          y: world.y - clickedEl.y
        });
      } else {
        setSelectedElementId(null);
        setAction('none');
      }
    } else if (tool === 'pan' || e.button === 1 || (tool === 'select' && e.shiftKey)) {
      setAction('panning');
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (tool === 'eraser') {
      const clickedEl = getElementAtPosition(world.x, world.y);
      if (clickedEl) {
        const nextElements = elements.filter(el => el.id !== clickedEl.id);
        saveState(nextElements);
      }
    } else if (tool === 'text') {
      // Finish edit if one is active
      if (editingTextElement) {
        finishTextEdit();
        return;
      }

      // Spawn text input
      const textId = 'text_' + Math.random().toString(36).substr(2, 9);
      const newTextEl = {
        id: textId,
        type: 'text',
        x: world.x,
        y: world.y,
        width: 100,
        height: fontSize * 1.3,
        color: color,
        text: '',
        fontSize: fontSize,
        fontFamily: fontFamily
      };

      setEditingTextElement(newTextEl);
      setTextValue('');
      setTextPos({ x: e.clientX, y: e.clientY });
      
      // Delay focus slightly so textarea mounts
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 50);
    } else {
      // Normal shape drawing
      setAction('drawing');
      setStartPos(world);
      if (tool === 'pen') {
        setDrawingPoints([world]);
      } else {
        setDrawingPoints([world, world]);
      }
    }
  };

  // Move Interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const world = screenToWorld(screenX, screenY);

    // Update cursor style
    if (tool === 'select') {
      if (selectedElementId) {
        const selectedEl = elements.find(el => el.id === selectedElementId);
        if (selectedEl) {
          const handle = getResizeHandleAtPosition(world.x, world.y, selectedEl);
          if (handle) {
            canvas.style.cursor = (handle === 'nw' || handle === 'se') ? 'nwse-resize' : 'nesw-resize';
          } else if (getElementAtPosition(world.x, world.y)) {
            canvas.style.cursor = 'move';
          } else {
            canvas.style.cursor = 'default';
          }
        }
      } else if (getElementAtPosition(world.x, world.y)) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    } else if (tool === 'pan') {
      canvas.style.cursor = action === 'panning' ? 'grabbing' : 'grab';
    } else {
      canvas.style.cursor = 'crosshair';
    }

    if (action === 'panning') {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPanX(prev => prev + dx);
      setPanY(prev => prev + dy);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (action === 'moving' && selectedElementId) {
      const nextElements = elements.map(el => {
        if (el.id === selectedElementId) {
          const dx = world.x - startPos.x;
          const dy = world.y - startPos.y;

          if (el.type === 'pen' && el.points) {
            const nextPoints = el.points.map((p: any) => ({
              x: p.x + dx,
              y: p.y + dy
            }));
            return { ...el, points: nextPoints };
          } else {
            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy
            };
          }
        }
        return el;
      });
      setStartPos(world);
      setElements(nextElements);
    } else if (action === 'resizing' && selectedElementId && resizeHandle) {
      const nextElements = elements.map(el => {
        if (el.id === selectedElementId) {
          let nextX = el.x;
          let nextY = el.y;
          let nextW = el.width;
          let nextH = el.height;

          // NW resize
          if (resizeHandle === 'nw') {
            nextX = world.x;
            nextY = world.y;
            nextW = (el.x + el.width) - world.x;
            nextH = (el.y + el.height) - world.y;
          }
          // NE resize
          else if (resizeHandle === 'ne') {
            nextY = world.y;
            nextW = world.x - el.x;
            nextH = (el.y + el.height) - world.y;
          }
          // SW resize
          else if (resizeHandle === 'sw') {
            nextX = world.x;
            nextW = (el.x + el.width) - world.x;
            nextH = world.y - el.y;
          }
          // SE resize
          else if (resizeHandle === 'se') {
            nextW = world.x - el.x;
            nextH = world.y - el.y;
          }

          if (el.type === 'pen' && el.points) {
            // Pen scaling can be complex; we can offset based on bounding boxes
            const xs = el.points.map((p: any) => p.x);
            const ys = el.points.map((p: any) => p.y);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);
            const originalW = maxX - minX || 1;
            const originalH = maxY - minY || 1;

            let targetMinX = minX;
            let targetMaxX = maxX;
            let targetMinY = minY;
            let targetMaxY = maxY;

            if (resizeHandle === 'nw') { targetMinX = world.x; targetMinY = world.y; }
            if (resizeHandle === 'ne') { targetMaxX = world.x; targetMinY = world.y; }
            if (resizeHandle === 'sw') { targetMinX = world.x; targetMaxY = world.y; }
            if (resizeHandle === 'se') { targetMaxX = world.x; targetMaxY = world.y; }

            const scaleX = (targetMaxX - targetMinX) / originalW;
            const scaleY = (targetMaxY - targetMinY) / originalH;

            const nextPoints = el.points.map((p: any) => ({
              x: targetMinX + (p.x - minX) * scaleX,
              y: targetMinY + (p.y - minY) * scaleY
            }));
            return { ...el, points: nextPoints };
          }

          return {
            ...el,
            x: nextX,
            y: nextY,
            width: nextW,
            height: nextH
          };
        }
        return el;
      });
      setElements(nextElements);
    } else if (action === 'drawing') {
      if (tool === 'pen') {
        setDrawingPoints(prev => [...prev, world]);
      } else {
        const nextPoints = [startPos, world];
        setDrawingPoints(nextPoints);
      }
    }
  };

  // End Interaction
  const handleMouseUp = () => {
    if (action === 'panning') {
      setAction('none');
      return;
    }

    if (action === 'moving' || action === 'resizing') {
      setAction('none');
      setResizeHandle(null);
      // Save state to history on drag finish
      saveState(elements);
      return;
    }

    if (action === 'drawing' && drawingPoints.length > 0) {
      setAction('none');
      let newElement: any = null;

      const minX = Math.min(startPos.x, drawingPoints[drawingPoints.length - 1].x);
      const minY = Math.min(startPos.y, drawingPoints[drawingPoints.length - 1].y);
      const w = drawingPoints[drawingPoints.length - 1].x - startPos.x;
      const h = drawingPoints[drawingPoints.length - 1].y - startPos.y;

      const elementId = 'el_' + Math.random().toString(36).substr(2, 9);

      if (tool === 'pen') {
        newElement = {
          id: elementId,
          type: 'pen',
          points: drawingPoints,
          color: color,
          lineWidth: lineWidth,
          strokeStyle: strokeStyle,
          sloppiness: sloppiness,
          opacity: opacity
        };
      } else if (tool === 'rect' || tool === 'diamond' || tool === 'circle') {
        newElement = {
          id: elementId,
          type: tool,
          x: startPos.x,
          y: startPos.y,
          width: w,
          height: h,
          color: color,
          fillColor: fillColor,
          fillStyle: fillStyle,
          lineWidth: lineWidth,
          strokeStyle: strokeStyle,
          sloppiness: sloppiness,
          opacity: opacity,
          edges: edges
        };
      } else if (tool === 'line' || tool === 'arrow') {
        newElement = {
          id: elementId,
          type: tool,
          x: startPos.x,
          y: startPos.y,
          width: w,
          height: h,
          color: color,
          lineWidth: lineWidth,
          strokeStyle: strokeStyle,
          sloppiness: sloppiness,
          opacity: opacity
        };
      }

      if (newElement) {
        const nextElements = [...elements, newElement];
        saveState(nextElements);
        setSelectedElementId(elementId);
        // Toggle tool back to select automatically for smoother workflow
        if (!isToolLocked) {
          setTool('select');
        }
      }
      setDrawingPoints([]);
    }
  };

  // Finish Text Element Editing
  const finishTextEdit = () => {
    if (!editingTextElement) return;
    const cleanText = textValue.trim();

    if (cleanText) {
      const size = editingTextElement.fontSize || 18;
      const lines = cleanText.split('\n');
      
      // Calculate bounding dimensions for click detection
      const canvas = canvasRef.current;
      let calculatedWidth = 100;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.font = `${size}px "${editingTextElement.fontFamily || 'Architects Daughter'}", cursive, sans-serif`;
          calculatedWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
          ctx.restore();
        }
      }

      const isShape = editingTextElement.type !== 'text';
      const completedElement = {
        ...editingTextElement,
        text: cleanText,
        width: isShape ? editingTextElement.width : calculatedWidth,
        height: isShape ? editingTextElement.height : lines.length * size * 1.25
      };

      const exists = elements.some(el => el.id === editingTextElement.id);
      let nextElements;
      if (exists) {
        nextElements = elements.map(el => el.id === editingTextElement.id ? completedElement : el);
      } else {
        nextElements = [...elements, completedElement];
      }
      saveState(nextElements);
      setSelectedElementId(completedElement.id);
    }

    setEditingTextElement(null);
    setTextValue('');
  };

  const handleClear = () => {
    if (window.confirm('Clear all drawings?')) {
      saveState([]);
      setSelectedElementId(null);
    }
  };

  // Bring layer closer / further
  const updateZIndex = (dir: 'front' | 'back') => {
    if (!selectedElementId) return;
    const element = elements.find(el => el.id === selectedElementId);
    if (!element) return;

    let nextElements = elements.filter(el => el.id !== selectedElementId);
    if (dir === 'front') {
      nextElements.push(element);
    } else {
      nextElements.unshift(element);
    }
    saveState(nextElements);
  };

  // Handle local image file upload to canvas
  const handleImageUploadElement = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const srcStr = event.target?.result as string;
      const centerX = -panX / zoom + (containerRef.current?.clientWidth || 800) / 2 / zoom;
      const centerY = -panY / zoom + (containerRef.current?.clientHeight || 600) / 2 / zoom;
      
      const newImgEl = {
        id: 'el_img_' + Math.random().toString(36).substr(2, 9),
        type: 'image',
        x: centerX - 100,
        y: centerY - 75,
        width: 200,
        height: 150,
        src: srcStr,
        color: color,
        lineWidth: 1
      };
      
      saveState([...elements, newImgEl]);
      setTool('select');
      setSelectedElementId(newImgEl.id);
    };
    reader.readAsDataURL(file);
  };

  // AI Business Copilot Chat Handlers (চ্যাট সিস্টেম)
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const newMessages = [...chatMessages, { role: 'user', content: textToSend }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const systemInstruction = `You are Mind Ingenia Copilot, an elite domain-adaptive business consultant and software/marketing architect.
Your mission is to help the user build highly professional A-to-Z startup master plans, roadmaps, and business structures.

CRITICAL INSTRUCTIONS:
1. ADAPTIVE PERSONA: Immediately identify the domain of the user's business (e.g., Amazon FBA, Bangladesh local startup, SaaS, dropshipping, clothing brand, etc.). Automatically adopt a highly experienced character (e.g., "10-Year Bangladesh E-commerce Architect", "Amazon FBA Private Label Specialist") and declare your persona at the very beginning of the response in a brief card style.
2. EXTREMELY DETAILED AND PRACTICAL: Do NOT give generic high-level advice. Give specific step-by-step strategies (e.g., licensing in Bangladesh, VAT/TIN setup, specific local sourcing areas like Keraniganj, Islampur, or international suppliers like Alibaba, specific delivery couriers like Pathao, Steadfast, Redx, exact marketing budgets, website tech stacks, and scale strategies).
3. LANGUAGE: Answer primarily in Bengali (বাংলা) mixed with fluent technical English terms where natural (Bengali-English hybrid / বাংলিশ style) so it is extremely clear and friendly for Bangladeshi entrepreneurs.
4. WHITEBOARD BLUEPRINT READINESS: Conclude your master plan with a high-level visual structure of the nodes (stages). Let the user know they can click the "Draw Map on Whiteboard" button to immediately convert this entire master plan into an interactive mind-map/diagram on the drawing board.
5. NO TRUNCATION: Do not stop half-way. Write a complete, comprehensive solution.`;

      const apiContents = newMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: apiContents,
          systemInstruction,
          config: {
            model: 'gemini-3.1-pro-preview',
            generationConfig: {
              thinkingConfig: {
                thinkingLevel: 'HIGH'
              }
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI Copilot.');
      }

      const data = await response.json();
      const replyText = data.text || '';

      // Detect and set the active persona
      let detectedPersona = 'Business Planner';
      if (textToSend.toLowerCase().includes('amazon') || textToSend.toLowerCase().includes('fba') || textToSend.toLowerCase().includes('প্রাইভেট')) {
        detectedPersona = '📦 Amazon FBA Expert';
      } else if (textToSend.toLowerCase().includes('bangladesh') || textToSend.toLowerCase().includes('বাংলাদেশ') || textToSend.toLowerCase().includes('ই-কমার্স') || textToSend.toLowerCase().includes('startup')) {
        detectedPersona = '🛒 BD E-commerce Architect';
      } else if (textToSend.toLowerCase().includes('saas') || textToSend.toLowerCase().includes('software') || textToSend.toLowerCase().includes('সফটওয়্যার')) {
        detectedPersona = '💻 SaaS MVP Consultant';
      } else {
        detectedPersona = '💼 Startup Specialist';
      }
      
      setActivePersona(detectedPersona);
      setChatMessages([...newMessages, { role: 'assistant', content: replyText, persona: detectedPersona }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatMessages([...newMessages, { role: 'assistant', content: `দুঃখিত, কোনো টেকনিক্যাল সমস্যার কারণে উত্তর দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।\n\nError: ${err.message || 'Unknown'}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleDrawMapFromMessage = async (index: number, messageContent: string) => {
    setIsGeneratingMapFromChat(String(index));
    setAiError(null);

    const centerX = Math.round(-panX / zoom + (containerRef.current?.clientWidth || 800) / 2 / zoom);
    const centerY = Math.round(-panY / zoom + (containerRef.current?.clientHeight || 600) / 2 / zoom);

    try {
      const systemInstruction = `You are an expert software architect, business diagram modeler, and whiteboard visual layout designer.
Your goal is to translate the user's business plan/strategy into a highly structured, step-by-step sequential mind-map and flowchart with detailed explanation boxes.

CRITICAL DIRECTIVES:
1. SEQUENTIAL STEPS (কোন স্টেপের পর কোন স্টেপ):
   - You MUST model the process chronologically as a sequence of clear steps (e.g. Step 1 -> Step 2 -> Step 3).
   - Label each primary step shape clearly, starting with "ধাপ ১: [নাম]" (Step 1: [Name]), "ধাপ ২: [নাম]", and so on.
2. DETAILED STEP EXPLANATIONS (পুরো বিষয়টির বিস্তারিত বিবরণ):
   - For EACH step, do NOT just draw a simple name box. You MUST create a larger rectangular explanation box (type: 'rect') placed right next to or below it (approx 120-150px offset).
   - Put the detailed, step-by-step strategy, actionable tips, tools/resources (e.g., specific couriers like Pathao, sourcing hubs, marketing budgets, etc.) in the 'text' property of this explanation box.
   - Use beautiful Bengali mixed with English terms (বাংলিশ) so it is clear and actionable.
3. DIRECT TEXT SUPPORT ON SHAPE:
   - To show text inside a rectangle, circle, or diamond, simply specify a 'text' property directly in the shape's JSON object (e.g. text: "ধাপ ১: প্রোডাক্ট রিসার্চ"). Do not create separate overlay text elements unless you want stand-alone annotations.
4. FLOW & CONNECTORS:
   - Connect the steps sequentially using 'arrow' connectors to guide the user from the start to the end.
   - Space everything out with plenty of room (250px to 350px distance) to prevent overlapping.

OUTPUT FORMAT:
Return ONLY a valid, raw JSON array of shape objects. Do NOT include markdown tags like \`\`\`json, and start exactly with [ and end with ].

Supported shape definitions:
1. Rectangle ('rect')
   {
     id: "rect_1",
     type: "rect",
     x: number, y: number,
     width: number, height: number,
     color: string, fillColor: string,
     fillStyle: "solid" | "semi" | "hachure",
     lineWidth: number, strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy",
     text: string // Put text here to show inside the rectangle!
   }
2. Diamond ('diamond') - for decision steps:
   {
     id: "diamond_1",
     type: "diamond",
     x: number, y: number,
     width: number, height: number,
     color: string, fillColor: string,
     fillStyle: "solid" | "semi" | "hachure",
     lineWidth: number, strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy",
     text: string
   }
3. Circle ('circle') - for start, end, or database nodes:
   {
     id: "circle_1",
     type: "circle",
     x: number, y: number,
     width: number, height: number,
     color: string, fillColor: string,
     fillStyle: "solid" | "semi" | "hachure",
     lineWidth: number, strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy",
     text: string
   }
4. Connector Arrow ('arrow') - connects source to target:
   {
     id: "arrow_1",
     type: "arrow",
     x: number, y: number, // starting edge
     width: number, height: number, // delta X and Y
     color: string, lineWidth: number,
     strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy"
   }
5. Text label ('text') - only for separate labels:
   {
     id: "text_1",
     type: "text",
     x: number, y: number, width: number, height: number,
     text: string, color: string, fontSize: number, fontFamily: string
   }`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a beautiful, fully detailed step-by-step whiteboard flowchart with sequential steps and comprehensive explanations for each step based on this strategy plan: "${messageContent}". 
Calculate absolute coordinates relative to (centerX: ${centerX}, centerY: ${centerY}) with healthy spacing (250px+). 
Set the 'text' property directly on the shapes to show the step titles (e.g. "ধাপ ১: ...") and write a comprehensive detailed explanation box next to each main step so the user knows exactly what to do step-by-step. All steps must be sequentially linked with arrows.`,
          systemInstruction,
          config: {
            generationConfig: {
              responseMimeType: 'application/json'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagram from AI service. Please try again.');
      }

      const data = await response.json();
      let rawText = data.text || '';
      rawText = rawText.replace(/^\s*```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();

      const parsedShapes = JSON.parse(rawText);
      if (!Array.isArray(parsedShapes)) {
        throw new Error('AI response did not return a valid list of shapes.');
      }

      const baseId = () => 'el_ai_' + Math.random().toString(36).substr(2, 9);
      const idMap: { [key: string]: string } = {};

      const processedShapes = parsedShapes.map((shape: any) => {
        const oldId = shape.id;
        const newId = baseId();
        if (oldId) idMap[oldId] = newId;

        return {
          id: newId,
          type: shape.type || 'rect',
          x: typeof shape.x === 'number' ? shape.x : centerX,
          y: typeof shape.y === 'number' ? shape.y : centerY,
          width: typeof shape.width === 'number' ? shape.width : 120,
          height: typeof shape.height === 'number' ? shape.height : 60,
          color: shape.color || color,
          fillColor: shape.fillColor || fillColor,
          fillStyle: shape.fillStyle || fillStyle,
          lineWidth: typeof shape.lineWidth === 'number' ? shape.lineWidth : lineWidth,
          strokeStyle: shape.strokeStyle || strokeStyle,
          sloppiness: shape.sloppiness || sloppiness,
          edges: shape.edges || edges,
          opacity: typeof shape.opacity === 'number' ? shape.opacity : opacity,
          text: shape.text || '',
          fontSize: typeof shape.fontSize === 'number' ? shape.fontSize : fontSize,
          fontFamily: shape.fontFamily || fontFamily,
          points: shape.points || []
        };
      });

      const updatedElements = [...elements, ...processedShapes];
      saveState(updatedElements);
      
      if (processedShapes.length > 0) {
        setSelectedElementId(processedShapes[0].id);
      }
    } catch (err: any) {
      console.error('AI Text-to-Diagram error:', err);
      alert('ম্যাপ জেনারেট করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGeneratingMapFromChat(null);
    }
  };

  // Generate an AI vector diagram from a text description using Gemini
  const handleGenerateAiDiagram = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAiDiagram(true);
    setAiError(null);

    const centerX = Math.round(-panX / zoom + (containerRef.current?.clientWidth || 800) / 2 / zoom);
    const centerY = Math.round(-panY / zoom + (containerRef.current?.clientHeight || 600) / 2 / zoom);

    try {
      const systemInstruction = `You are an expert software architect and whiteboard vector diagram generator.
Translate the user's description of a flowchart, diagram, mind map, or software architecture into a beautiful, perfectly positioned JSON array of whiteboard vector shapes.

Coordinate constraints:
- Centered around reference coordinates: (centerX = ${centerX}, centerY = ${centerY}).
- Ensure all shapes are placed in a clear spatial hierarchy, spaced out elegantly so they do NOT overlap (at least 150-250 pixels apart depending on complexity).
- Connect shapes with connectors of type 'arrow'.

OUTPUT FORMAT:
Return ONLY a valid, raw JSON array of shape objects. Do NOT include markdown tags, do NOT wrap in \`\`\`json, and do NOT include any introductory or concluding text. Start exactly with [ and end exactly with ].

Supported shape definitions:

1. Rectangle ('rect')
   {
     id: "rect_1", // unique string ID
     type: "rect",
     x: number, // left edge
     y: number, // top edge
     width: number, // width of box (e.g. 140 to 200)
     height: number, // height of box (e.g. 50 to 90)
     color: string, // hex stroke color (e.g. '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#111827')
     fillColor: string, // hex fill color (e.g. '#e0e7ff', '#d1fae5', '#fef3c7', '#fee2e2', or '#f1f5f9')
     fillStyle: "solid" | "semi" | "hachure",
     lineWidth: number, // e.g. 2
     strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy"
   }

2. Diamond ('diamond') - used for decisions or branching:
   {
     id: "diamond_1",
     type: "diamond",
     x: number,
     y: number,
     width: number, // e.g. 120
     height: number, // e.g. 120
     color: string,
     fillColor: string,
     fillStyle: "solid" | "semi" | "hachure",
     lineWidth: number,
     strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy"
   }

3. Circle ('circle') - used for start/end, users, or databases:
   {
     id: "circle_1",
     type: "circle",
     x: number,
     y: number,
     width: number, // e.g. 80
     height: number, // e.g. 80
     color: string,
     fillColor: string,
     fillStyle: "solid" | "semi" | "hachure",
     lineWidth: number,
     strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy"
   }

4. Text Label ('text') - IMPORTANT: Place text INSIDE the corresponding shape (like a rectangle or circle) to act as its label.
   {
     id: "text_1",
     type: "text",
     x: number, // Centered inside the parent shape. For rect at x, y with width W and height H, place text at (x + W/2 - textW/2, y + H/2 - textH/2)
     y: number,
     width: number, // width of text box
     height: number, // height of text box (e.g. 20)
     text: string, // short text like "User Login" or "Database"
     color: string, // font color (e.g. '#1e293b' or same as shape's stroke color)
     fontSize: number, // e.g. 14, 16, or 18
     fontFamily: "Architects Daughter" | "Patrick Hand" | "Caveat" | "Inter" | "JetBrains Mono"
   }

5. Connector Arrow ('arrow') - Connects two shapes.
   {
     id: "arrow_1",
     type: "arrow",
     x: number, // start X coordinate (at the edge of source shape)
     y: number, // start Y coordinate (at the edge of source shape)
     width: number, // delta X (end X - start X)
     height: number, // delta Y (end Y - start Y)
     color: string, // line color
     lineWidth: number, // e.g. 2
     strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy"
   }

6. Simple Line ('line'):
   {
     id: "line_1",
     type: "line",
     x: number,
     y: number,
     width: number,
     height: number,
     color: string,
     lineWidth: number,
     strokeStyle: "solid" | "dashed" | "dotted",
     sloppiness: "straight" | "sloppy" | "very_sloppy"
   }

Guidelines for professional whiteboard layouts:
- Create a clear flow: Left-to-Right or Top-to-Bottom.
- Always include matching text labels centered inside rectangles/diamonds/circles.
- Draw connectors starting exactly from the border of the source shape and pointing directly to the target shape.
- Use a maximum of 15 shapes for readability.
- Generate valid, clean JSON with no extra characters outside the JSON array.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a detailed whiteboard diagram representing: "${aiPrompt}". Calculate all absolute coordinates carefully relative to (centerX: ${centerX}, centerY: ${centerY}). Ensure all shapes are spaced apart and connected with arrows.`,
          systemInstruction,
          config: {
            generationConfig: {
              responseMimeType: 'application/json'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagram from AI service. Please try again.');
      }

      const data = await response.json();
      let rawText = data.text || '';
      
      // Sanitization: remove potential markdown wraps just in case Gemini ignored the directive
      rawText = rawText.replace(/^\s*```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();

      const parsedShapes = JSON.parse(rawText);
      if (!Array.isArray(parsedShapes)) {
        throw new Error('AI response did not return a valid list of shapes.');
      }

      const baseId = () => 'el_ai_' + Math.random().toString(36).substr(2, 9);
      const idMap: { [key: string]: string } = {};

      const processedShapes = parsedShapes.map((shape: any) => {
        const oldId = shape.id;
        const newId = baseId();
        if (oldId) idMap[oldId] = newId;

        return {
          id: newId,
          type: shape.type || 'rect',
          x: typeof shape.x === 'number' ? shape.x : centerX,
          y: typeof shape.y === 'number' ? shape.y : centerY,
          width: typeof shape.width === 'number' ? shape.width : 100,
          height: typeof shape.height === 'number' ? shape.height : 50,
          color: shape.color || color,
          fillColor: shape.fillColor || fillColor,
          fillStyle: shape.fillStyle || fillStyle,
          lineWidth: typeof shape.lineWidth === 'number' ? shape.lineWidth : lineWidth,
          strokeStyle: shape.strokeStyle || strokeStyle,
          sloppiness: shape.sloppiness || sloppiness,
          edges: shape.edges || edges,
          opacity: typeof shape.opacity === 'number' ? shape.opacity : opacity,
          text: shape.text || '',
          fontSize: typeof shape.fontSize === 'number' ? shape.fontSize : fontSize,
          fontFamily: shape.fontFamily || fontFamily,
          points: shape.points || []
        };
      });

      // Update elements state
      const updatedElements = [...elements, ...processedShapes];
      saveState(updatedElements);
      
      if (processedShapes.length > 0) {
        setSelectedElementId(processedShapes[0].id);
      }
      
      setAiPrompt('');
      setShowAiDiagram(false);
    } catch (err: any) {
      console.error('AI Text-to-Diagram error:', err);
      setAiError(err.message || 'Failed to parse AI response. Try refining your description.');
    } finally {
      setIsGeneratingAiDiagram(false);
    }
  };

  // Insert mock UI assets from the shape library
  const handleInsertLibraryShape = (type: string) => {
    const centerX = -panX / zoom + (containerRef.current?.clientWidth || 800) / 2 / zoom;
    const centerY = -panY / zoom + (containerRef.current?.clientHeight || 600) / 2 / zoom;
    const baseId = () => 'el_lib_' + Math.random().toString(36).substr(2, 9);
    
    let newShapes: any[] = [];
    
    if (type === 'search_bar') {
      newShapes = [
        {
          id: baseId(),
          type: 'rect',
          x: centerX - 120,
          y: centerY - 20,
          width: 240,
          height: 40,
          color: color,
          fillColor: '#f1f5f9',
          fillStyle: 'solid',
          lineWidth: 2,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        {
          id: baseId(),
          type: 'text',
          x: centerX - 100,
          y: centerY - 10,
          width: 150,
          height: 20,
          text: '🔍 Search projects...',
          color: '#64748b',
          fontSize: 16,
          fontFamily: 'Architects Daughter'
        }
      ];
    } else if (type === 'login_card') {
      newShapes = [
        // Main box
        {
          id: baseId(),
          type: 'rect',
          x: centerX - 150,
          y: centerY - 140,
          width: 300,
          height: 280,
          color: color,
          fillColor: '#ffffff',
          fillStyle: 'solid',
          lineWidth: 2,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        // Header Text
        {
          id: baseId(),
          type: 'text',
          x: centerX - 120,
          y: centerY - 110,
          width: 240,
          height: 30,
          text: 'ADMIN SIGN IN',
          color: color,
          fontSize: 20,
          fontFamily: 'Architects Daughter'
        },
        // Input Email
        {
          id: baseId(),
          type: 'rect',
          x: centerX - 120,
          y: centerY - 60,
          width: 240,
          height: 35,
          color: '#94a3b8',
          fillColor: '#f8fafc',
          fillStyle: 'solid',
          lineWidth: 1.5,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        {
          id: baseId(),
          type: 'text',
          x: centerX - 110,
          y: centerY - 52,
          width: 200,
          height: 20,
          text: 'email@example.com',
          color: '#cbd5e1',
          fontSize: 14,
          fontFamily: 'Architects Daughter'
        },
        // Input Password
        {
          id: baseId(),
          type: 'rect',
          x: centerX - 120,
          y: centerY - 10,
          width: 240,
          height: 35,
          color: '#94a3b8',
          fillColor: '#f8fafc',
          fillStyle: 'solid',
          lineWidth: 1.5,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        {
          id: baseId(),
          type: 'text',
          x: centerX - 110,
          y: centerY - 2,
          width: 200,
          height: 20,
          text: '••••••••••••',
          color: '#94a3b8',
          fontSize: 14,
          fontFamily: 'Architects Daughter'
        },
        // Submit Button
        {
          id: baseId(),
          type: 'rect',
          x: centerX - 120,
          y: centerY + 45,
          width: 240,
          height: 40,
          color: color,
          fillColor: color,
          fillStyle: 'solid',
          lineWidth: 2,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        {
          id: baseId(),
          type: 'text',
          x: centerX - 60,
          y: centerY + 53,
          width: 120,
          height: 20,
          text: 'SUBMIT',
          color: '#ffffff',
          fontSize: 16,
          fontFamily: 'Architects Daughter'
        }
      ];
    } else if (type === 'bar_chart') {
      newShapes = [
        // Base Axis line
        {
          id: baseId(),
          type: 'line',
          x: centerX - 120,
          y: centerY + 80,
          width: 240,
          height: 0,
          color: '#475569',
          lineWidth: 3,
          strokeStyle: 'solid',
          sloppiness: 'straight'
        },
        // Bar 1
        {
          id: baseId(),
          type: 'rect',
          x: centerX - 90,
          y: centerY - 60,
          width: 40,
          height: 140,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillStyle: 'hachure',
          lineWidth: 2,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        // Bar 2
        {
          id: baseId(),
          type: 'rect',
          x: centerX - 20,
          y: centerY - 100,
          width: 40,
          height: 180,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillStyle: 'hachure',
          lineWidth: 2,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        // Bar 3
        {
          id: baseId(),
          type: 'rect',
          x: centerX + 50,
          y: centerY - 20,
          width: 40,
          height: 100,
          color: '#10b981',
          fillColor: '#10b981',
          fillStyle: 'hachure',
          lineWidth: 2,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        }
      ];
    } else if (type === 'success_toast') {
      newShapes = [
        // Box
        {
          id: baseId(),
          type: 'rect',
          x: centerX - 140,
          y: centerY - 30,
          width: 280,
          height: 60,
          color: '#10b981',
          fillColor: '#ecfdf5',
          fillStyle: 'solid',
          lineWidth: 2,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        // Success circle icon
        {
          id: baseId(),
          type: 'circle',
          x: centerX - 115,
          y: centerY - 15,
          width: 30,
          height: 30,
          color: '#10b981',
          fillColor: '#10b981',
          fillStyle: 'solid',
          lineWidth: 1.5,
          strokeStyle: 'solid',
          sloppiness: 'sloppy'
        },
        {
          id: baseId(),
          type: 'text',
          x: centerX - 107,
          y: centerY - 10,
          width: 20,
          height: 20,
          text: '✓',
          color: '#ffffff',
          fontSize: 14,
          fontFamily: 'Architects Daughter'
        },
        // Alert message text
        {
          id: baseId(),
          type: 'text',
          x: centerX - 70,
          y: centerY - 10,
          width: 180,
          height: 20,
          text: 'Saved successfully!',
          color: '#064e3b',
          fontSize: 16,
          fontFamily: 'Architects Daughter'
        }
      ];
    }
    
    if (newShapes.length > 0) {
      saveState([...elements, ...newShapes]);
      setShowLibrary(false);
      setTool('select');
      setSelectedElementId(newShapes[0].id);
    }
  };

  // Import JSON File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          saveState(parsed);
          setSelectedElementId(null);
        }
      } catch (err) {
        alert('Invalid file format. Please upload valid ExcaLidraw project JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Export JSON File
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(elements));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "wireboard_sketch.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export clean SVG file
  const handleExportSVG = () => {
    if (elements.length === 0) {
      alert('Sketchpad is empty!');
      return;
    }

    // Determine boundaries of all elements
    const xs: number[] = [];
    const ys: number[] = [];
    elements.forEach(el => {
      if (el.type === 'pen' && el.points) {
        xs.push(...el.points.map((p: any) => p.x));
        ys.push(...el.points.map((p: any) => p.y));
      } else {
        xs.push(el.x, el.x + el.width);
        ys.push(el.y, el.y + el.height);
      }
    });

    const padding = 20;
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    const width = maxX - minX || 800;
    const height = maxY - minY || 600;

    // Compile vector elements to SVG strings
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">`;
    svgContent += `\n  <rect width="100%" height="100%" fill="${canvasBg === 'dark' ? '#0f172a' : '#ffffff'}" />`;

    elements.forEach(el => {
      const stroke = el.color;
      const fill = el.fillColor === 'transparent' ? 'none' : el.fillColor;
      const sWidth = el.lineWidth;
      const dArray = el.strokeStyle === 'dashed' ? '8,6' : el.strokeStyle === 'dotted' ? '2,4' : 'none';

      const x_min = Math.min(el.x, el.x + el.width);
      const y_min = Math.min(el.y, el.y + el.height);
      const w = Math.abs(el.width);
      const h = Math.abs(el.height);

      if (el.type === 'rect') {
        svgContent += `\n  <rect x="${x_min}" y="${y_min}" width="${w}" height="${h}" stroke="${stroke}" fill="${fill}" stroke-width="${sWidth}" ${dArray !== 'none' ? `stroke-dasharray="${dArray}"` : ''} stroke-linecap="round" />`;
      } else if (el.type === 'diamond') {
        const pointsStr = `${x_min + w / 2},${y_min} ${x_min + w},${y_min + h / 2} ${x_min + w / 2},${y_min + h} ${x_min},${y_min + h / 2}`;
        svgContent += `\n  <polygon points="${pointsStr}" stroke="${stroke}" fill="${fill}" stroke-width="${sWidth}" ${dArray !== 'none' ? `stroke-dasharray="${dArray}"` : ''} />`;
      } else if (el.type === 'circle') {
        svgContent += `\n  <ellipse cx="${x_min + w / 2}" cy="${y_min + h / 2}" rx="${w / 2}" ry="${h / 2}" stroke="${stroke}" fill="${fill}" stroke-width="${sWidth}" ${dArray !== 'none' ? `stroke-dasharray="${dArray}"` : ''} />`;
      } else if (el.type === 'line') {
        svgContent += `\n  <line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" stroke="${stroke}" stroke-width="${sWidth}" ${dArray !== 'none' ? `stroke-dasharray="${dArray}"` : ''} stroke-linecap="round" />`;
      } else if (el.type === 'arrow') {
        svgContent += `\n  <line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" stroke="${stroke}" stroke-width="${sWidth}" ${dArray !== 'none' ? `stroke-dasharray="${dArray}"` : ''} stroke-linecap="round" />`;
        // Quick arrow head polygon
        const angle = Math.atan2(el.height, el.width);
        const headLength = 15;
        const arrowPoint1X = (el.x + el.width) - headLength * Math.cos(angle - Math.PI / 6);
        const arrowPoint1Y = (el.y + el.height) - headLength * Math.sin(angle - Math.PI / 6);
        const arrowPoint2X = (el.x + el.width) - headLength * Math.cos(angle + Math.PI / 6);
        const arrowPoint2Y = (el.y + el.height) - headLength * Math.sin(angle + Math.PI / 6);
        svgContent += `\n  <line x1="${el.x + el.width}" y1="${el.y + el.height}" x2="${arrowPoint1X}" y2="${arrowPoint1Y}" stroke="${stroke}" stroke-width="${sWidth}" />`;
        svgContent += `\n  <line x1="${el.x + el.width}" y1="${el.y + el.height}" x2="${arrowPoint2X}" y2="${arrowPoint2Y}" stroke="${stroke}" stroke-width="${sWidth}" />`;
      } else if (el.type === 'text' && el.text) {
        svgContent += `\n  <text x="${el.x}" y="${el.y + (el.fontSize || 18)}" fill="${stroke}" font-size="${el.fontSize || 18}" font-family="${el.fontFamily || 'sans-serif'}">${el.text}</text>`;
      } else if (el.type === 'image' && el.src) {
        svgContent += `\n  <image x="${x_min}" y="${y_min}" width="${w}" height="${h}" href="${el.src}" />`;
      } else if (el.type === 'pen' && el.points && el.points.length > 0) {
        let pStr = `M ${el.points[0].x} ${el.points[0].y}`;
        for (let j = 1; j < el.points.length; j++) {
          pStr += ` L ${el.points[j].x} ${el.points[j].y}`;
        }
        svgContent += `\n  <path d="${pStr}" fill="none" stroke="${stroke}" stroke-width="${sWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
      }
    });

    svgContent += '\n</svg>';

    const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", svgUrl);
    downloadAnchor.setAttribute("download", "wireboard_sketch.svg");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export High Resolution PNG File via an offscreen canvas
  const handleExportPNG = () => {
    if (elements.length === 0) {
      alert('Sketchpad is empty!');
      return;
    }

    // Determine boundaries of all elements
    const xs: number[] = [];
    const ys: number[] = [];
    elements.forEach(el => {
      if (el.type === 'pen' && el.points) {
        xs.push(...el.points.map((p: any) => p.x));
        ys.push(...el.points.map((p: any) => p.y));
      } else {
        xs.push(el.x, el.x + el.width);
        ys.push(el.y, el.y + el.height);
      }
    });

    const padding = 30;
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    const width = Math.max(100, maxX - minX);
    const height = Math.max(100, maxY - minY);

    // Create an offscreen canvas
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width * 2; // Double resolution
    offscreenCanvas.height = height * 2;
    const offCtx = offscreenCanvas.getContext('2d');
    if (!offCtx) return;

    offCtx.scale(2, 2);
    // Draw background
    offCtx.fillStyle = canvasBg === 'dark' ? '#0f172a' : '#ffffff';
    offCtx.fillRect(0, 0, width, height);

    // Translate coordinates so that drawings match top-left of canvas
    offCtx.translate(-minX, -minY);

    // Draw grid if toggled
    if (showGrid) {
      offCtx.save();
      offCtx.strokeStyle = canvasBg === 'dark' ? '#1e293b' : '#e2e8f0';
      offCtx.lineWidth = 1;
      const gridGap = 30;
      const firstX = Math.floor(minX / gridGap) * gridGap;
      const firstY = Math.floor(minY / gridGap) * gridGap;
      for (let x = firstX; x < maxX; x += gridGap) {
        offCtx.beginPath();
        offCtx.moveTo(x, minY);
        offCtx.lineTo(x, maxY);
        offCtx.stroke();
      }
      for (let y = firstY; y < maxY; y += gridGap) {
        offCtx.beginPath();
        offCtx.moveTo(minX, y);
        offCtx.lineTo(maxX, y);
        offCtx.stroke();
      }
      offCtx.restore();
    }

    elements.forEach(el => {
      drawElement(offCtx, el);
    });

    // Save and download
    const pngUrl = offscreenCanvas.toDataURL('image/png');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", pngUrl);
    downloadAnchor.setAttribute("download", "wireboard_sketch.png");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Zoom preset handlers
  const adjustZoom = (amount: number) => {
    setZoom(prev => Math.max(0.1, Math.min(5, prev + amount)));
  };

  const resetZoom = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const [copiedLink, setCopiedLink] = useState(false);

  // Derived styling helpers
  const currentSelectedEl = selectedElementId ? elements.find(el => el.id === selectedElementId) : null;
  const currentStrokeColor = (currentSelectedEl && currentSelectedEl.color) ? currentSelectedEl.color : (color || '#4f46e5');
  const currentFillColor = (currentSelectedEl && currentSelectedEl.fillColor) ? currentSelectedEl.fillColor : (fillColor || 'transparent');
  const currentFillStyle = (currentSelectedEl && currentSelectedEl.fillStyle) ? currentSelectedEl.fillStyle : (fillStyle || 'solid');
  const currentLineWidth = (currentSelectedEl && currentSelectedEl.lineWidth !== undefined) ? currentSelectedEl.lineWidth : (lineWidth || 2);
  const currentStrokeStyle = (currentSelectedEl && currentSelectedEl.strokeStyle) ? currentSelectedEl.strokeStyle : (strokeStyle || 'solid');
  const currentSloppiness = (currentSelectedEl && currentSelectedEl.sloppiness) ? currentSelectedEl.sloppiness : (sloppiness || 'straight');
  const currentOpacity = currentSelectedEl ? (currentSelectedEl.opacity !== undefined ? currentSelectedEl.opacity : 100) : (opacity !== undefined ? opacity : 100);
  const currentEdges = currentSelectedEl ? (currentSelectedEl.edges || 'round') : (edges || 'round');

  const updateStyle = (key: string, value: any) => {
    if (key === 'color') setColor(value);
    if (key === 'fillColor') {
      setFillColor(value);
      if (value !== 'transparent' && fillStyle === 'none') {
        setFillStyle('solid');
      }
    }
    if (key === 'fillStyle') setFillStyle(value);
    if (key === 'lineWidth') setLineWidth(value);
    if (key === 'strokeStyle') setStrokeStyle(value);
    if (key === 'sloppiness') setSloppiness(value);
    if (key === 'opacity') setOpacity(value);
    if (key === 'edges') setEdges(value);

    if (selectedElementId) {
      const next = elements.map(el => {
        if (el.id === selectedElementId) {
          if (key === 'fillColor') {
            const fs = value === 'transparent' ? 'none' : (el.fillStyle === 'none' ? 'solid' : el.fillStyle);
            return { ...el, [key]: value, fillStyle: fs };
          }
          return { ...el, [key]: value };
        }
        return el;
      });
      saveState(next);
    }
  };

  const sendToBack = () => {
    if (!selectedElementId) return;
    const selectedEl = elements.find(el => el.id === selectedElementId);
    if (!selectedEl) return;
    const filtered = elements.filter(el => el.id !== selectedElementId);
    saveState([selectedEl, ...filtered]);
  };

  const sendBackward = () => {
    if (!selectedElementId) return;
    const index = elements.findIndex(el => el.id === selectedElementId);
    if (index <= 0) return;
    const next = [...elements];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    saveState(next);
  };

  const bringForward = () => {
    if (!selectedElementId) return;
    const index = elements.findIndex(el => el.id === selectedElementId);
    if (index === -1 || index >= elements.length - 1) return;
    const next = [...elements];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    saveState(next);
  };

  const bringToFront = () => {
    if (!selectedElementId) return;
    const selectedEl = elements.find(el => el.id === selectedElementId);
    if (!selectedEl) return;
    const filtered = elements.filter(el => el.id !== selectedElementId);
    saveState([...filtered, selectedEl]);
  };

  const duplicateSelected = () => {
    if (!selectedElementId) return;
    const el = elements.find(item => item.id === selectedElementId);
    if (!el) return;
    const newId = 'el_' + Math.random().toString(36).substr(2, 9);
    
    let cloned: any = { ...el, id: newId };
    if (cloned.type === 'pen' && cloned.points) {
      cloned.points = cloned.points.map((p: any) => ({ x: p.x + 15, y: p.y + 15 }));
    } else {
      cloned.x = (cloned.x || 0) + 15;
      cloned.y = (cloned.y || 0) + 15;
    }
    
    const next = [...elements, cloned];
    saveState(next);
    setSelectedElementId(newId);
  };

  const deleteSelected = () => {
    if (!selectedElementId) return;
    const next = elements.filter(el => el.id !== selectedElementId);
    setSelectedElementId(null);
    saveState(next);
  };

  const copyJSONToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(elements, null, 2))
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-none p-0 -mx-4 lg:-mx-8 -my-4 lg:-my-8"
    >
      {/* Import handwriting font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@600&family=Patrick+Hand&display=swap');
      `}</style>

      {/* Main Container - Full width canvas with absolute controls */}
      <div className="w-full flex flex-col gap-0">
        <div className="hidden">
          {/* Active Tool & Shortcuts Legend */}
          <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Active Tool Mode</label>
              <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-1.5 py-0.5 rounded-md animate-pulse">
                {tool.toUpperCase()}
              </span>
            </div>
            
            <div className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1.5 font-bold">
              <div className="flex items-center justify-between">
                <span>Cursor / Select</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono text-[8px]">1</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Rectangle</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono text-[8px]">2</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Diamond</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono text-[8px]">3</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Circle</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono text-[8px]">4</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Arrow line</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono text-[8px]">5</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Pencil draw</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono text-[8px]">7</kbd>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-gray-200 dark:border-slate-700/60 pt-1.5">
                <span>Undo Action</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-mono text-[8px]">Ctrl + Z</kbd>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="w-full mt-2 py-1.5 text-center text-[10px] font-black bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 hover:bg-rose-100 rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Clear Canvas Workspace"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Workspace
            </button>
          </div>

          <hr className="border-gray-100 dark:border-slate-800/80" />

          {/* Stroke style & widths */}
          <div className="space-y-4">
            {/* Color section */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Stroke Color</label>
              <div className="flex flex-wrap gap-1.5">
                {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#111827'].map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      if (selectedElementId) {
                        const next = elements.map(el => el.id === selectedElementId ? { ...el, color: c } : el);
                        saveState(next);
                      }
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-lg ring-offset-2 dark:ring-offset-slate-900 transition-all cursor-pointer ${
                      color === c ? 'ring-2 ring-indigo-500 scale-110' : 'scale-100 hover:scale-105'
                    }`}
                  />
                ))}
                {/* Custom Color Input */}
                <input
                  type="color"
                  value={color}
                  onChange={e => {
                    setColor(e.target.value);
                    if (selectedElementId) {
                      const next = elements.map(el => el.id === selectedElementId ? { ...el, color: e.target.value } : el);
                      saveState(next);
                    }
                  }}
                  className="w-6 h-6 rounded-lg cursor-pointer border border-gray-200 dark:border-slate-800 p-0 overflow-hidden"
                />
              </div>
            </div>

            {/* Fill Style */}
            {(tool === 'rect' || tool === 'diamond' || tool === 'circle' || (selectedElementId && ['rect', 'diamond', 'circle'].includes(elements.find(el => el.id === selectedElementId)?.type))) && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Fill Style</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'solid', label: 'Solid' },
                      { id: 'semi', label: 'Semi' },
                      { id: 'hachure', label: 'Sketch' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFillStyle(f.id as any);
                          const nextColor = f.id === 'none' ? 'transparent' : (fillColor === 'transparent' ? color : fillColor);
                          setFillColor(nextColor);
                          if (selectedElementId) {
                            const next = elements.map(el => el.id === selectedElementId ? { ...el, fillStyle: f.id, fillColor: nextColor } : el);
                            saveState(next);
                          }
                        }}
                        className={`py-1.5 text-[9px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                          fillStyle === f.id
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
                            : 'border-gray-100 dark:border-slate-800 text-gray-500'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {fillStyle !== 'none' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Fill Color</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['#818cf8', '#34d399', '#fbbf24', '#f87171', '#22d3ee', '#f472b6', '#475569'].map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            setFillColor(c);
                            if (selectedElementId) {
                              const next = elements.map(el => el.id === selectedElementId ? { ...el, fillColor: c } : el);
                              saveState(next);
                            }
                          }}
                          style={{ backgroundColor: c }}
                          className={`w-5.5 h-5.5 rounded-lg ring-offset-2 dark:ring-offset-slate-900 transition-all cursor-pointer ${
                            fillColor === c ? 'ring-2 ring-indigo-500 scale-110' : 'scale-100 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Thickness and styles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Stroke Style</label>
                <select
                  value={strokeStyle}
                  onChange={e => {
                    setStrokeStyle(e.target.value as any);
                    if (selectedElementId) {
                      const next = elements.map(el => el.id === selectedElementId ? { ...el, strokeStyle: e.target.value } : el);
                      saveState(next);
                    }
                  }}
                  className="w-full text-xs font-bold p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-xl"
                >
                  <option value="solid">Solid ───</option>
                  <option value="dashed">Dashed ─ ─</option>
                  <option value="dotted">Dotted • •</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Sloppiness</label>
                <select
                  value={sloppiness}
                  onChange={e => {
                    setSloppiness(e.target.value as any);
                    if (selectedElementId) {
                      const next = elements.map(el => el.id === selectedElementId ? { ...el, sloppiness: e.target.value } : el);
                      saveState(next);
                    }
                  }}
                  className="w-full text-xs font-bold p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-xl"
                >
                  <option value="straight">Straight/CAD</option>
                  <option value="sloppy">Sloppy/Draft</option>
                  <option value="very_sloppy">Very Sloppy</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Stroke Width</label>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{lineWidth}px</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={lineWidth} 
                onChange={e => {
                  const val = Number(e.target.value);
                  setLineWidth(val);
                  if (selectedElementId) {
                    const next = elements.map(el => el.id === selectedElementId ? { ...el, lineWidth: val } : el);
                    saveState(next);
                  }
                }}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-800/80" />

          {/* Text configurations */}
          {(tool === 'text' || (selectedElementId && elements.find(el => el.id === selectedElementId)?.type === 'text')) && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Text Options</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-400">Size</span>
                  <select
                    value={fontSize}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setFontSize(val);
                      if (selectedElementId) {
                        const next = elements.map(el => el.id === selectedElementId ? { ...el, fontSize: val } : el);
                        saveState(next);
                      }
                    }}
                    className="w-full text-xs font-bold p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-lg"
                  >
                    <option value="14">Small (14px)</option>
                    <option value="18">Medium (18px)</option>
                    <option value="24">Large (24px)</option>
                    <option value="36">XL (36px)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-400">Font Family</span>
                  <select
                    value={fontFamily}
                    onChange={e => {
                      setFontFamily(e.target.value);
                      if (selectedElementId) {
                        const next = elements.map(el => el.id === selectedElementId ? { ...el, fontFamily: e.target.value } : el);
                        saveState(next);
                      }
                    }}
                    className="w-full text-xs font-bold p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Architects Daughter">Architect</option>
                    <option value="Patrick Hand">Patrick</option>
                    <option value="Caveat">Cursive</option>
                    <option value="Inter">Sans-Serif</option>
                    <option value="JetBrains Mono">Monospace</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Layer and Selected Actions */}
          {selectedElementId && (
            <div className="space-y-2.5 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-950/30 rounded-2xl">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Selected Shape Actions</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => updateZIndex('front')}
                  className="py-1.5 text-[9px] font-black bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-indigo-100 dark:border-slate-700 hover:bg-indigo-50/50 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Bring Front
                </button>
                <button
                  onClick={() => updateZIndex('back')}
                  className="py-1.5 text-[9px] font-black bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-indigo-100 dark:border-slate-700 hover:bg-indigo-50/50 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Send Back
                </button>
                <button
                  onClick={() => {
                    const elToDupe = elements.find(el => el.id === selectedElementId);
                    if (elToDupe) {
                      const newId = 'el_' + Math.random().toString(36).substr(2, 9);
                      const dupe = {
                        ...elToDupe,
                        id: newId,
                        x: elToDupe.x + 20,
                        y: elToDupe.y + 20
                      };
                      saveState([...elements, dupe]);
                      setSelectedElementId(newId);
                    }
                  }}
                  className="py-1.5 text-[9px] font-black bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-indigo-100 dark:border-slate-700 hover:bg-indigo-50/50 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    const next = elements.filter(el => el.id !== selectedElementId);
                    setSelectedElementId(null);
                    saveState(next);
                  }}
                  className="py-1.5 text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-100/50 dark:bg-rose-950/20 dark:text-rose-400 hover:bg-rose-100 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Delete Shape
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - CANVAS CONTAINER & CHAT SPLIT */}
        <div className="w-full flex flex-row gap-0 overflow-hidden h-[calc(100vh-60px)] min-h-[750px]">
          {/* LEFT PANEL - CANVAS ELEMENT */}
          <div className="flex-1 min-w-0 relative h-full">
            <div 
              ref={containerRef}
              className="bg-white dark:bg-slate-900 border-0 overflow-hidden h-full w-full relative select-none"
            >
              {/* Canvas Element */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                className="w-full h-full cursor-default"
              />

            {/* FLOATING LEFT SIDEBAR PROPERTIES PANEL (Excalidraw style same-to-same system) */}
            <div className="absolute top-16 left-4 z-40 w-60 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 shadow-xl rounded-2xl p-3.5 flex flex-col gap-3.5 select-none pointer-events-auto max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {selectedElementId ? 'Element properties' : 'Canvas styles'}
                </span>
                {selectedElementId && (
                  <span className="text-[8px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase">
                    Selected
                  </span>
                )}
              </div>

              {/* STROKE COLOR */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Stroke</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { hex: '#1e1e1e', label: 'Black' },
                    { hex: '#ef4444', label: 'Red' },
                    { hex: '#10b981', label: 'Green' },
                    { hex: '#3b82f6', label: 'Blue' },
                    { hex: '#f59e0b', label: 'Yellow' }
                  ].map(p => (
                    <button
                      key={p.hex}
                      onClick={() => updateStyle('color', p.hex)}
                      className="w-6 h-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-all scale-100 hover:scale-110 relative cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: p.hex }}
                      title={p.label}
                    >
                      {currentStrokeColor === p.hex && (
                        <span className="absolute inset-0 rounded-lg border-2 border-indigo-500 ring-1 ring-indigo-500/30 scale-105" />
                      )}
                    </button>
                  ))}
                  {/* Custom Stroke Picker */}
                  <div className="relative w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 transition-transform" title="Custom stroke color">
                    <input
                      type="color"
                      value={currentStrokeColor}
                      onChange={e => updateStyle('color', e.target.value)}
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 opacity-100 border-0"
                    />
                  </div>
                </div>
              </div>

              {/* BACKGROUND COLOR */}
              {(!tool || ['rect', 'diamond', 'circle', 'select'].includes(tool) || (currentSelectedEl && ['rect', 'diamond', 'circle'].includes(currentSelectedEl.type))) && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Background</span>
                  <div className="flex items-center gap-1.5">
                    {/* Transparent checkered preset */}
                    <button
                      onClick={() => updateStyle('fillColor', 'transparent')}
                      className="w-6 h-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-all scale-100 hover:scale-110 relative cursor-pointer overflow-hidden flex items-center justify-center bg-slate-50"
                      title="Transparent"
                    >
                      {/* Checkerboard Pattern */}
                      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:6px_6px] bg-[position:0_0,0_3px,3px_-3px,-3px_0]" />
                      <div className="absolute w-[120%] h-[1.5px] bg-red-400 rotate-45" />
                      {currentFillColor === 'transparent' && (
                        <span className="absolute inset-0 rounded-lg border-2 border-indigo-500 ring-1 ring-indigo-500/30 scale-105" />
                      )}
                    </button>

                    {[
                      { hex: '#ffc9c9', label: 'Light Pink' },
                      { hex: '#b2f2bb', label: 'Light Green' },
                      { hex: '#a5d8ff', label: 'Light Blue' },
                      { hex: '#ffec99', label: 'Light Yellow' }
                    ].map(p => (
                      <button
                        key={p.hex}
                        onClick={() => updateStyle('fillColor', p.hex)}
                        className="w-6 h-6 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-all scale-100 hover:scale-110 relative cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: p.hex }}
                        title={p.label}
                      >
                        {currentFillColor === p.hex && (
                          <span className="absolute inset-0 rounded-lg border-2 border-indigo-500 ring-1 ring-indigo-500/30 scale-105" />
                        )}
                      </button>
                    ))}
                    {/* Custom Background Picker */}
                    <div className="relative w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 transition-transform" title="Custom background color">
                      <input
                        type="color"
                        value={(!currentFillColor || currentFillColor === 'transparent') ? '#ffffff' : currentFillColor}
                        onChange={e => updateStyle('fillColor', e.target.value)}
                        className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 opacity-100 border-0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FILL STYLE */}
              {currentFillColor !== 'transparent' && (!tool || ['rect', 'diamond', 'circle', 'select'].includes(tool) || (currentSelectedEl && ['rect', 'diamond', 'circle'].includes(currentSelectedEl.type))) && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Fill style</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'solid', label: 'Solid' },
                      { id: 'semi', label: 'Semi' },
                      { id: 'hachure', label: 'Sketch' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => updateStyle('fillStyle', f.id)}
                        className={`py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                          currentFillStyle === f.id
                            ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STROKE WIDTH */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Stroke width</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: 2, label: 'Thin' },
                    { value: 4, label: 'Medium' },
                    { value: 6, label: 'Thick' }
                  ].map(w => (
                    <button
                      key={w.value}
                      onClick={() => updateStyle('lineWidth', w.value)}
                      className={`py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        currentLineWidth === w.value
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* STROKE STYLE */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Stroke style</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'solid', label: 'Solid' },
                    { id: 'dashed', label: 'Dashed' },
                    { id: 'dotted', label: 'Dotted' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => updateStyle('strokeStyle', s.id)}
                      className={`py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        currentStrokeStyle === s.id
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SLOPPINESS */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Sloppiness</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'straight', label: 'Precise' },
                    { id: 'sloppy', label: 'Sloppy' },
                    { id: 'very_sloppy', label: 'Cartoon' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => updateStyle('sloppiness', s.id)}
                      className={`py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        currentSloppiness === s.id
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* EDGES */}
              {(!tool || ['rect', 'diamond', 'select'].includes(tool) || (currentSelectedEl && ['rect', 'diamond'].includes(currentSelectedEl.type))) && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Edges</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'sharp', label: 'Sharp' },
                      { id: 'round', label: 'Round' }
                    ].map(e => (
                      <button
                        key={e.id}
                        onClick={() => updateStyle('edges', e.id)}
                        className={`py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                          currentEdges === e.id
                            ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* OPACITY */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Opacity</span>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{currentOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentOpacity}
                  onChange={e => updateStyle('opacity', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
              </div>

              {/* LAYERS (Selected elements only) */}
              {selectedElementId && (
                <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Layers</span>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={sendToBack}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-center items-center"
                      title="Send to back"
                    >
                      <ChevronsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={sendBackward}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-center items-center"
                      title="Send backward"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={bringForward}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-center items-center"
                      title="Bring forward"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={bringToFront}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-center items-center"
                      title="Bring to front"
                    >
                      <ChevronsUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Actions</span>
                <div className="flex flex-col gap-1.5">
                  {selectedElementId && (
                    <>
                      <button
                        onClick={duplicateSelected}
                        className="w-full py-1.5 px-3 flex items-center gap-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duplicate selection</span>
                      </button>
                      <button
                        onClick={deleteSelected}
                        className="w-full py-1.5 px-3 flex items-center gap-2 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/40 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Delete selection</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={copyJSONToClipboard}
                    className="w-full py-1.5 px-3 flex items-center gap-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{copiedLink ? 'Copied JSON!' : 'Copy JSON to clipboard'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FLOATING TOP-CENTER TOOLBAR EXACTLY FROM image.png */}
            <div 
              style={{
                transform: `translate(calc(-50% + ${toolbarOffset.x}px), ${toolbarOffset.y}px)`
              }}
              className={`absolute top-4 left-1/2 z-40 bg-white/95 dark:bg-slate-900/95 px-2 py-1.5 rounded-2xl border dark:border-slate-800 flex items-center gap-1 transition-shadow duration-200 select-none ${
                isDraggingToolbar 
                  ? 'shadow-2xl border-indigo-500/50 dark:border-indigo-500/50 cursor-move ring-2 ring-indigo-500/20' 
                  : 'shadow-lg border-slate-200/70'
              }`}
            >
              {/* Drag Grip Handle */}
              <div 
                onMouseDown={(e) => {
                  setIsDraggingToolbar(true);
                  setToolbarDragStart({ x: e.clientX, y: e.clientY });
                }}
                onTouchStart={(e) => {
                  if (e.touches.length === 0) return;
                  setIsDraggingToolbar(true);
                  setToolbarDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                }}
                className="p-1.5 cursor-move text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="Hold & Drag to move toolbar"
              >
                <GripHorizontal className="w-4 h-4" />
              </div>

              <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

              {/* Tool Lock Button */}
              <button
                onClick={() => setIsToolLocked(!isToolLocked)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isToolLocked 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold animate-pulse' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Lock Active Tool (prevent auto-switch back to Select)"
              >
                {isToolLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>

              <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Pan Tool */}
              <button
                onClick={() => {
                  setTool('pan');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'pan' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Pan Canvas Tool"
              >
                <Hand className="w-4 h-4" />
              </button>

              {/* Select Tool */}
              <button
                onClick={() => setTool('select')}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'select' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Selection Cursor (1)"
              >
                <MousePointer className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">1</span>
              </button>

              {/* Rect Tool */}
              <button
                onClick={() => {
                  setTool('rect');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'rect' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Rectangle Shape (2)"
              >
                <Square className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">2</span>
              </button>

              {/* Diamond Tool */}
              <button
                onClick={() => {
                  setTool('diamond');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'diamond' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Diamond Shape (3)"
              >
                <Diamond className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">3</span>
              </button>

              {/* Circle Tool */}
              <button
                onClick={() => {
                  setTool('circle');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'circle' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Ellipse Shape (4)"
              >
                <Circle className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">4</span>
              </button>

              {/* Arrow Tool */}
              <button
                onClick={() => {
                  setTool('arrow');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'arrow' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Arrow Tool (5)"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">5</span>
              </button>

              {/* Line Tool */}
              <button
                onClick={() => {
                  setTool('line');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'line' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Line Tool (6)"
              >
                <Slash className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">6</span>
              </button>

              {/* Pen/Pencil Tool */}
              <button
                onClick={() => {
                  setTool('pen');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'pen' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Free Draw Pencil (7)"
              >
                <PenTool className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">7</span>
              </button>

              {/* Text Tool */}
              <button
                onClick={() => {
                  setTool('text');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'text' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Text Box (8)"
              >
                <Type className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">8</span>
              </button>

              {/* Image Upload Button */}
              <label 
                className={`p-2 rounded-xl transition-all relative group cursor-pointer flex items-center justify-center ${
                  tool === 'image' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Upload & Place Image (9)"
              >
                <Image className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">9</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadElement}
                  className="hidden"
                />
              </label>

              {/* Eraser Tool */}
              <button
                onClick={() => {
                  setTool('eraser');
                  setSelectedElementId(null);
                }}
                className={`p-2 rounded-xl transition-all relative group cursor-pointer ${
                  tool === 'eraser' 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Eraser (0)"
              >
                <Eraser className="w-4 h-4" />
                <span className="absolute bottom-0 right-1 text-[7px] font-bold opacity-60">0</span>
              </button>

              <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Color Presets */}
              <div className="flex items-center gap-1.5 px-1.5">
                {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#111827'].map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      updateStyle('color', c);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer border border-white dark:border-slate-900 ${
                      color === c 
                        ? 'ring-2 ring-indigo-500 scale-125' 
                        : 'scale-100 hover:scale-110'
                    }`}
                    title={`Change color to ${c}`}
                  />
                ))}
                {/* Custom color picker */}
                <div 
                  className="relative w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 cursor-pointer flex items-center justify-center overflow-hidden"
                  title="Choose custom color"
                >
                  <input
                    type="color"
                    value={color}
                    onChange={e => {
                      setColor(e.target.value);
                      updateStyle('color', e.target.value);
                    }}
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer p-0 opacity-100 border-0"
                  />
                </div>
              </div>

              <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Library Tool */}
              <button
                onClick={() => {
                  setShowLibrary(!showLibrary);
                  setShowAiDiagram(false);
                }}
                className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                  showLibrary 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="Mock UI Asset Library"
              >
                <Boxes className="w-4 h-4" />
              </button>

              {/* AI Text to Diagram Tool */}
              <button
                onClick={() => {
                  setShowAiDiagram(!showAiDiagram);
                  setShowLibrary(false);
                }}
                className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                  showAiDiagram 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="AI Text to Diagram"
              >
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              </button>

              {/* AI Business Planner Chat Copilot Toggle */}
              <button
                onClick={() => {
                  setIsChatOpen(!isChatOpen);
                  setShowLibrary(false);
                  setShowAiDiagram(false);
                }}
                className={`p-2 rounded-xl transition-all relative cursor-pointer ${
                  isChatOpen 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title="AI Business Planner Copilot"
              >
                <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              </button>

              <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Import JSON file input */}
              <label 
                className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center justify-center transition-colors gap-1"
                title="Import JSON vector project data"
              >
                <Upload className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              {/* Export JSON button */}
              <button
                onClick={handleExportJSON}
                className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center justify-center transition-colors gap-1"
                title="Export JSON vector project data"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Export</span>
              </button>

              {/* Save SVG button */}
              <button
                onClick={handleExportSVG}
                className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center justify-center transition-colors gap-1"
                title="Save drawing to scalable SVG file"
              >
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">SVG</span>
              </button>

              {/* Save PNG button */}
              <button
                onClick={handleExportPNG}
                className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center justify-center transition-colors gap-1"
                title="Save drawing snapshot to PNG file"
              >
                <Play className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">PNG</span>
              </button>

              {/* FLOATING LIBRARY POPUP */}
              {showLibrary && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-white/95 dark:bg-slate-900/95 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-64 space-y-2 pointer-events-auto">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive UI Templates</h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button 
                      onClick={() => handleInsertLibraryShape('search_bar')}
                      className="flex items-center justify-between text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer w-full"
                    >
                      <span>🔍 Mock Search Field</span>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">Add</span>
                    </button>
                    <button 
                      onClick={() => handleInsertLibraryShape('login_card')}
                      className="flex items-center justify-between text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer w-full"
                    >
                      <span>🔒 Admin Login Wireframe</span>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">Add</span>
                    </button>
                    <button 
                      onClick={() => handleInsertLibraryShape('bar_chart')}
                      className="flex items-center justify-between text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer w-full"
                    >
                      <span>📊 Sketchy Bar Chart</span>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">Add</span>
                    </button>
                    <button 
                      onClick={() => handleInsertLibraryShape('success_toast')}
                      className="flex items-center justify-between text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer w-full"
                    >
                      <span>✨ Success Alert Notification</span>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">Add</span>
                    </button>
                  </div>
                </div>
              )}

              {/* FLOATING AI DIAGRAM POPUP */}
              {showAiDiagram && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-80 space-y-3 pointer-events-auto text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Text to Diagram
                    </h4>
                    <button 
                      onClick={() => setShowAiDiagram(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Type a description (e.g. "three-tier web architecture", "checkout flow", "mind map of goals") and let Gemini generate it instantly.
                  </p>
                  
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter diagram description..."
                    rows={3}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    disabled={isGeneratingAiDiagram}
                  />

                  {aiError && (
                    <div className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg font-medium">
                      {aiError}
                    </div>
                  )}

                  <button
                    onClick={handleGenerateAiDiagram}
                    disabled={isGeneratingAiDiagram || !aiPrompt.trim()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isGeneratingAiDiagram ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Diagram...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Generate Diagram
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Float Overlay for editing text */}
            {editingTextElement && (
              <div 
                className="absolute z-50 pointer-events-auto"
                style={{
                  left: textPos.x - 10,
                  top: textPos.y - 10
                }}
              >
                <textarea
                  ref={textInputRef}
                  value={textValue}
                  onChange={e => setTextValue(e.target.value)}
                  onBlur={finishTextEdit}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      finishTextEdit();
                    } else if (e.key === 'Escape') {
                      setEditingTextElement(null);
                    }
                  }}
                  style={{
                    fontSize: `${editingTextElement.fontSize || 18}px`,
                    fontFamily: `"${editingTextElement.fontFamily || 'Architects Daughter'}", cursive, sans-serif`,
                    lineHeight: 1.25,
                    color: editingTextElement.color
                  }}
                  placeholder="Type anything... Enter to finish"
                  className="p-1 min-w-[200px] bg-white/95 dark:bg-slate-800/95 border-2 border-indigo-500 rounded-xl shadow-lg focus:outline-none focus:ring-0 resize-both font-bold"
                />
              </div>
            )}

            {/* FLOATING BOT-LEFT CANVAS UTILITIES */}
            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-md flex items-center gap-2">
              {/* Zoom buttons */}
              <button 
                onClick={() => adjustZoom(-0.1)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-gray-500 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={resetZoom} 
                className="text-xs font-black text-gray-600 dark:text-gray-300 px-1 hover:bg-slate-100 dark:hover:bg-slate-800 py-1 rounded-lg cursor-pointer"
                title="Reset zoom & pan"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button 
                onClick={() => adjustZoom(0.1)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-gray-500 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-6 bg-gray-100 dark:bg-slate-800 mx-1" />

              {/* Grid Toggle */}
              <button 
                onClick={() => setShowGrid(!showGrid)} 
                className={`p-2 rounded-xl cursor-pointer ${showGrid ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Toggle Background Grid"
              >
                <Grid className="w-4 h-4" />
              </button>

              {/* Theme Selector */}
              <button 
                onClick={() => setCanvasBg(prev => prev === 'light' ? 'dark' : 'light')} 
                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl cursor-pointer ${canvasBg === 'dark' ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-800'}`}
                title="Toggle Light/Dark Workspace Canvas"
              >
                {canvasBg === 'dark' ? 'Dark theme' : 'Light theme'}
              </button>
            </div>

            {/* FLOATING TOP-RIGHT UNDO/REDO */}
            <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-md flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 text-gray-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* FLOATING CHAT COPILOT TOGGLE BUTTON (visible when chat closed) */}
            {!isChatOpen && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="absolute right-4 bottom-24 z-40 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 group animate-bounce"
                title="Open AI Business Copilot"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-black max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap pr-0 group-hover:pr-1">
                  চ্যাট কো-পাইলট খুলুন
                </span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR - AI BUSINESS COPILOT PANEL (চ্যাট সিস্টেম) */}
        {isChatOpen && (
          <div className="w-[380px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col h-full pointer-events-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                    Mind Ingenia Copilot
                  </h3>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mt-1">
                    {activePersona}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Persona Indicator for assistant */}
                  {msg.role === 'assistant' && msg.persona && (
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 ml-1">
                      {msg.persona}
                    </span>
                  )}
                  
                  <div 
                    className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed font-medium ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/15'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 shadow-sm rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* ACTION: DRAW MAP BUTTON FOR ASSISTANT RESPONSES */}
                    {msg.role === 'assistant' && idx > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                          onClick={() => handleDrawMapFromMessage(idx, msg.content)}
                          disabled={isGeneratingMapFromChat !== null}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingMapFromChat === String(idx) ? (
                            <>
                              <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                              ম্যাপ আঁকা হচ্ছে...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              Whiteboard-এ ম্যাপ আঁকুন (Draw)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing / Thinking Indicator */}
              {isChatLoading && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 ml-1 animate-pulse">
                    AI Planner is thinking...
                  </span>
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK START IDEAS */}
            {chatMessages.length === 1 && (
              <div className="px-4 py-2 space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Quick Start Blueprints
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { text: 'আমাজনে নতুন প্রাইভেট লেবেল ব্র্যান্ড শুরু করার মাস্টার প্ল্যান', label: '📦 Amazon Private Label' },
                    { text: 'বাংলাদেশে কাস্টম ই-কমার্স স্টার্টআপ এ-টু-জেড রোডম্যাপ', label: '🛒 BD E-commerce Startup' },
                    { text: 'একটি মোবাইল অ্যাক্সেসরিজ ড্রপশিপিং ব্র্যান্ড এবং সোর্সিং প্ল্যান', label: '📱 Dropshipping Flow' }
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => handleSendChatMessage(s.text)}
                      className="text-left p-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 rounded-xl transition-all flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm hover:translate-x-0.5"
                    >
                      <span>{s.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  disabled={isChatLoading}
                  placeholder="আপনার বিজনেস আইডিয়া বা প্রশ্ন লিখুন..."
                  className="w-full text-xs pl-3 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendChatMessage()}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
}

// 3. SIDEBAR & PAGES CONFIGURATION
export function AdminSidebarPages() {
  const [sections, setSections] = useState([
    { name: 'Core POS & Sales', items: 3, active: true },
    { name: 'Accounting & Closing', items: 2, active: true },
    { name: 'HRM & Attendance', items: 6, active: true },
    { name: 'Marketing Content Suite', items: 6, active: false },
    { name: 'Management Portal', items: 13, active: true },
    { name: 'Admin Command (Secured)', items: 7, active: true }
  ]);

  const toggleSection = (index: number) => {
    const updated = [...sections];
    updated[index].active = !updated[index].active;
    setSections(updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase mb-1">SideBar & Pages Manager</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Simulate layout structures, toggle visibility, and configure user routes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Interactive Sidebar Visualizer
            </h3>
            
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div key={section.name} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 dark:border-slate-800/50 hover:border-gray-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${section.active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{section.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">{section.items} sub-navigation paths registered</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSection(idx)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      section.active 
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {section.active ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            Control Context
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
            By toggling sections, you can instantly test navigation profiles and check permissions. In-code conditional rules filter and hide inactive blocks gracefully.
          </p>
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800/80 space-y-2">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-gray-400">Total Modules:</span>
              <span className="font-bold">6 Groupings</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-gray-400">Security Rule:</span>
              <span className="font-bold text-rose-500">stratproamz Exclusive</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 4. MERCHANT CONSOLE
export function AdminMerchantConsole() {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<string[]>([
    'Secure System Diagnostic Shell v1.0.0 Initiated.',
    'Type "help" to view list of available development triggers.'
  ]);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.toLowerCase().trim();
    const newLogs = [...logs, `root@stratproamz:~$ ${command}`];

    if (cmd === 'help') {
      newLogs.push(
        'Available terminal triggers:',
        ' - status    : Display core service ping, DB node latency and system health metrics.',
        ' - db-info   : Output active Firebase and configuration environments.',
        ' - clear     : Wipe screen memory buffer.'
      );
    } else if (cmd === 'status') {
      newLogs.push(
        'STATUS REPORT:',
        ' - Microserver gateway: ONLINE [200 OK]',
        ' - Firestore payload pipeline: CONNECTED [0ms lag]',
        ' - Zender integration agent: READY'
      );
    } else if (cmd === 'db-info') {
      newLogs.push(
        'FIREBASE BLUEPRINT CONFIGURATION:',
        ' - Database ID: ai-studio-3c13c875-aa9a-4ebb-9c9e-aaa6f5ff7638',
        ' - Persistence driver: Cloud Firestore (Web Platform SDK)',
        ' - SSL Cipher encryption: AES-256'
      );
    } else if (cmd === 'clear') {
      setLogs(['Terminal buffer wiped clean.']);
      setCommand('');
      return;
    } else {
      newLogs.push(`Command "${command}" not recognized. Type "help" for a list of diagnostics.`);
    }

    setLogs(newLogs);
    setCommand('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase mb-1">Merchant Dev Console</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Execute diagnostics, audit API schemas, and stream backend container events.</p>
      </div>

      <div className="bg-slate-950 text-emerald-400 p-6 rounded-3xl border border-slate-850 shadow-2xl h-[450px] flex flex-col font-mono text-[12px] relative overflow-hidden">
        <div className="absolute top-4 right-6 flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">LIVE CONNECTION</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-emerald-800/40">
          {logs.map((log, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed select-text">
              {log}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 border-t border-emerald-950/60 pt-4 flex items-center gap-2">
          <span className="text-indigo-400 font-black shrink-0">root@stratproamz:~$</span>
          <input
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-emerald-300 font-mono text-[12px]"
            placeholder="Type terminal directive here..."
            autoFocus
          />
        </form>
      </div>
    </motion.div>
  );
}

// 5. MY HISAB LEDGER
export function AdminMyHisab() {
  const [items, setItems] = useState([
    { description: 'Cloud Engine Deployment Fee', amount: -29.99, date: '2026-07-01', category: 'Infrastructure' },
    { description: 'Merchant Enterprise Licensing Recipt', amount: 350.00, date: '2026-06-28', category: 'Licensing' },
    { description: 'Zender SMS API Token Allotment', amount: -15.00, date: '2026-06-25', category: 'API Usage' },
    { description: 'Global POS Core Subscriptions Bundle', amount: 840.00, date: '2026-06-20', category: 'Subscriptions' }
  ]);

  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('Infrastructure');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amt) return;

    setItems([
      {
        description: desc,
        amount: Number(amt),
        date: new Date().toISOString().split('T')[0],
        category: cat
      },
      ...items
    ]);
    setDesc('');
    setAmt('');
  };

  const totalProceeds = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase mb-1">My HISAB Central Ledger</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Aggregate administrative earnings, compute expenses, and balance accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">Record Transaction</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Description"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border-none outline-none text-xs font-bold w-full"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount (e.g., 250 or -15)"
                value={amt}
                onChange={e => setAmt(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border-none outline-none text-xs font-bold w-full"
              />
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
                Add Entry
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-slate-800/80">
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">Transaction Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-850 text-xs font-semibold">
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-mono text-gray-400">{item.date}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{item.description}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full font-black text-[10px] uppercase tracking-wide">
                          {item.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-black ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
              <Calculator className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NET LEDGER PROCEEDS</p>
            <h3 className={`text-4xl font-black tracking-tight mt-1 ${totalProceeds >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ${totalProceeds.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 6. SYSTEM CONTROL & ADVANCED OPTIONS
export function AdminControl() {
  const [flags, setFlags] = useState({
    multiBranch: true,
    aiHelperEnabled: true,
    debugMode: false,
    strictSecurityPolicy: true,
    realtimeNotificationPolling: true
  });

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags({ ...flags, [key]: !flags[key] });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase mb-1">System Control Center</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Modify global parameters, feature flags, and engine protocols instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            Active Feature Flags
          </h3>

          <div className="space-y-4">
            {[
              { id: 'multiBranch', title: 'Multi-Branch Capabilities', desc: 'Allows merchant warehouses to propagate transfers synchronously across multiple physical stores.' },
              { id: 'aiHelperEnabled', title: 'Jarvis AI Assistive Assistant', desc: 'Activates the background model tokenizer for generating natural language prompts.' },
              { id: 'debugMode', title: 'Developer Diagnostic Logging', desc: 'Streams detailed SQL structure changes and Firestore reads to the active container.' },
              { id: 'strictSecurityPolicy', title: 'Strict Session Token Verification', desc: 'Locks active sessions automatically if anomalous IP shifts are observed.' },
              { id: 'realtimeNotificationPolling', title: 'Real-time WebSocket Synchronization', desc: 'Synchronizes active transactions in micro-second intervals.' }
            ].map(flag => (
              <div key={flag.id} className="flex items-start justify-between p-4 rounded-2xl border border-gray-50 dark:border-slate-800/50">
                <div className="space-y-1 pr-4">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{flag.title}</h4>
                  <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">{flag.desc}</p>
                </div>
                <button
                  onClick={() => toggleFlag(flag.id as any)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all shrink-0 relative ${
                    flags[flag.id as keyof typeof flags] ? 'bg-indigo-600' : 'bg-gray-250 dark:bg-slate-800'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
                    flags[flag.id as keyof typeof flags] ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            Engine Protocols
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
            All system switches act in real-time. Any state changes will automatically persist and coordinate throughout our dynamic context loops.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// 7. CONTACT US & SYSTEM TICKETS
export function AdminContactUs() {
  const [tickets, setTickets] = useState([
    { id: 'TKT-1082', sender: 'john@gmail.com', message: 'Need assistance setting up my custom Zender webhook gateway.', status: 'Pending', date: '2026-07-01' },
    { id: 'TKT-1081', sender: 'sarah@store.org', message: 'Is it possible to receive billing reminders via WhatsApp directly?', status: 'In Progress', date: '2026-06-29' },
    { id: 'TKT-1080', sender: 'dev@merchant.net', message: 'Encountered a tiny visual rendering shift on safari mobile closings list.', status: 'Resolved', date: '2026-06-28' }
  ]);

  const [replyMessage, setReplyMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('TKT-1082');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicketId) return;

    setTickets(tickets.map(t => {
      if (t.id === selectedTicketId) {
        return { ...t, status: 'Resolved' };
      }
      return t;
    }));
    setReplyMessage('');
    alert('Administrative reply dispatched successfully. Ticket marked as Resolved.');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase mb-1">Central Support & Ticket Inbox</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Read incoming customer messages, resolve queries, and dispatch response tokens.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-50 dark:border-slate-800/80">
            <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">Incoming Ticket Desk</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-850">
            {tickets.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`w-full text-left p-4.5 flex flex-col gap-1.5 transition-colors ${
                  selectedTicketId === t.id ? 'bg-indigo-50/50 dark:bg-slate-800/40' : 'hover:bg-gray-50/50 dark:hover:bg-slate-850/20'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-mono">{t.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${
                    t.status === 'Pending' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                    t.status === 'In Progress' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{t.sender}</h4>
                <p className="text-[11px] text-gray-400 font-semibold truncate w-full">{t.message}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col h-[500px]">
          {selectedTicket ? (
            <div className="p-6 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">{selectedTicket.sender}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Ticket ID: {selectedTicket.id} • Received {selectedTicket.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                    selectedTicket.status === 'Pending' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                    selectedTicket.status === 'In Progress' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100/50 dark:border-slate-800">
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                    "{selectedTicket.message}"
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Type your official response token here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-850 rounded-2xl border-none outline-none text-xs font-semibold resize-none"
                />
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Response
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest">No Ticket Selected</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// 8. GOOGLE ANALYTICS INTEGRATION & LIVE TRAFFIC MONITOR
export function AdminGoogleAnalytics() {
  const [config, setConfig] = useState({
    measurementId: 'G-V2D6W7BPAX',
    active: true,
    customScripts: '<!-- Global site tag (gtag.js) - Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-V2D6W7BPAX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n  gtag(\'config\', \'G-V2D6W7BPAX\');\n</script>',
    simulatedUsers: 15,
    multiplier: 1.5,
    simulationEnabled: false
  });

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Real-time visitor state
  const [activeCount, setActiveCount] = useState(23);
  const [trafficLogs, setTrafficLogs] = useState<Array<{ id: string; time: string; location: string; event: string; type: string }>>([
    { id: '1', time: '12:34:10', location: 'Dhaka', event: 'Viewed Premium Cotton Panjabi', type: 'view' },
    { id: '2', time: '12:34:15', location: 'Chittagong', event: 'Added Leather Wallet to Cart', type: 'cart' },
    { id: '3', time: '12:34:28', location: 'Sylhet', event: 'Initiated Checkout Process', type: 'checkout' },
    { id: '4', time: '12:34:42', location: 'Khulna', event: 'Viewed Designer Ladies Kurti', type: 'view' },
    { id: '5', time: '12:35:01', location: 'Dhaka', event: 'Completed purchase of Premium Attar 🎉', type: 'purchase' }
  ]);

  // Load configuration from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/integrations/google-analytics');
        const data = await res.json();
        if (data.success && data.googleAnalytics) {
          setConfig({
            ...data.googleAnalytics,
            simulationEnabled: data.googleAnalytics.simulationEnabled ?? false
          });
          // Set initial live users count based on the config
          const initialVal = Math.round(data.googleAnalytics.simulatedUsers * data.googleAnalytics.multiplier);
          setActiveCount(initialVal > 0 ? initialVal : 23);
        }
      } catch (err) {
        console.error('Failed to load Google Analytics config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Fluctuating real-time counter to look realistic
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
        const target = Math.round(config.simulatedUsers * config.multiplier);
        const nextVal = prev + change;
        // Keep it fluctuating in a reasonable range around simulatedUsers * multiplier
        const minVal = Math.max(5, target - 6);
        const maxVal = target + 8;
        if (nextVal < minVal) return minVal;
        if (nextVal > maxVal) return maxVal;
        return nextVal;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [config.simulatedUsers, config.multiplier]);

  // Simulated traffic log generator
  useEffect(() => {
    const locations = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Gazipur', 'Mymensingh', 'Comilla', 'Narayanganj'];
    const products = [
      'Premium Cotton Panjabi',
      'Premium Leather Wallet',
      'Designer Ladies Kurti',
      'Premium Attar'
    ];
    const actions = [
      { event: 'Viewed {product}', type: 'view' },
      { event: 'Added {product} to Cart 🛒', type: 'cart' },
      { event: 'Initiated Checkout for {product} 💳', type: 'checkout' },
      { event: 'Viewed Homepage', type: 'view' },
      { event: 'Clicked on Whatsapp Chat Assist', type: 'chat' },
      { event: 'Completed order of {product} 🎉', type: 'purchase' }
    ];

    const timer = setInterval(() => {
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const randomProd = products[Math.floor(Math.random() * products.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const eventText = randomAction.event.replace('{product}', randomProd);
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newLog = {
        id: Date.now().toString(),
        time: timeStr,
        location: randomLoc,
        event: eventText,
        type: randomAction.type
      };

      setTrafficLogs(prev => [newLog, ...prev.slice(0, 14)]);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/integrations/google-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('কনফিগারেশন সেভ করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      alert('সার্ভার কানেকশন এরর।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-6"
    >
      {/* Banner / Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Google Analytics & Live Traffic</h2>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            আপনার ওয়েবসাইটের ট্রাফিক ট্র্যাক করুন, মেজারমেন্ট আইডি এবং কাস্টম স্ক্রিপ্ট যুক্ত করুন এবং লাইভ ভিজিটর ট্র্যাক করুন।
          </p>
        </div>

        {/* Realtime Live Indicator */}
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/45 px-4 py-2.5 rounded-2xl shrink-0 self-start md:self-auto">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
          </div>
          <div>
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 block uppercase tracking-widest font-mono">Real-Time Traffic</span>
            <h4 className="text-lg font-black text-gray-900 dark:text-white font-mono leading-none mt-0.5">{activeCount} Users Online</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Setup & Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-5">
            <h3 className="text-xs font-black text-gray-900 dark:text-gray-150 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800/80 pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              মেজারমেন্ট কনফিগারেশন (Configuration)
            </h3>

            {/* Enable/Disable switch */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-150 dark:border-slate-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-gray-800 dark:text-white">অ্যানালিটিক্স ট্র্যাকিং</span>
                <p className="text-[10px] text-gray-400">ওয়েবসাইটে ট্র্যাকিং সচল করতে সুইচ অন রাখুন</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, active: !config.active })}
                className={`w-12 h-6.5 rounded-full p-1 transition-all shrink-0 relative ${
                  config.active ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
                  config.active ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Simulation mode switch */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-150 dark:border-slate-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-gray-800 dark:text-white">সিমুলেশন ডেমো মোড (Simulator)</span>
                <p className="text-[10px] text-gray-400">ড্যাশবোর্ডে কৃত্রিম ট্রাফিক এস্টিমেট ও ডেমো লগ দেখতে সুইচ অন করুন</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, simulationEnabled: !config.simulationEnabled })}
                className={`w-12 h-6.5 rounded-full p-1 transition-all shrink-0 relative ${
                  config.simulationEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
                  config.simulationEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Measurement ID Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Google Analytics Measurement ID</label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={config.measurementId}
                onChange={e => setConfig({ ...config, measurementId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-150 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>

            {/* Custom Code Script area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Custom Header Tag Scripts / Pixel Scripts</label>
              <textarea
                rows={5}
                placeholder="<!-- Global site tag (gtag.js) -->..."
                value={config.customScripts}
                onChange={e => setConfig({ ...config, customScripts: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-[11px] text-gray-700 dark:text-gray-300 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all resize-y"
              />
            </div>

            {/* Simulator controls */}
            {config.simulationEnabled && (
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800/80 space-y-4">
                <h4 className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡ ট্রাফিক সিমুলেটর (Traffic Multiplier)</span>
                </h4>
                
                {/* Base Users */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>বেস ভিজিটর সংখ্যা (Base Users):</span>
                    <span className="font-bold text-gray-800 dark:text-white font-mono">{config.simulatedUsers}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={config.simulatedUsers}
                    onChange={e => setConfig({ ...config, simulatedUsers: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Multiplier */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>মাল্টিপ্লায়ার (Multiplier):</span>
                    <span className="font-bold text-gray-800 dark:text-white font-mono">{config.multiplier}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={config.multiplier}
                    onChange={e => setConfig({ ...config, multiplier: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* Save Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/10 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সেভ সেটিংস (Save)'}</span>
              </button>
            </div>

            {/* Success toast inside modal block */}
            {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold text-center"
              >
                কনফিগারেশন সফলভাবে সেভ করা হয়েছে এবং কোড রিলোড সম্পন্ন! 🎉
              </motion.div>
            )}
          </form>
        </div>

        {/* Right Side: Real-Time Traffic Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {!config.simulationEnabled ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-6 h-full flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/45 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-950 dark:text-gray-100 uppercase tracking-tight">Real Live Google Analytics Connected</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">রিয়েল-টাইম লাইভ ট্র্যাকিং সচল</p>
                  </div>
                </div>

                <div className="border-t border-b border-gray-100 dark:border-slate-800/80 py-4 my-2 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Connected Domain:</span>
                    <span className="font-mono bg-slate-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold">
                      {window.location.hostname || 'pos.sellerscampus.com'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Google Measurement ID:</span>
                    <span className="font-mono bg-slate-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 px-2.5 py-1 rounded-lg text-gray-800 dark:text-white font-bold">
                      {config.measurementId || 'Not Set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Tracking Script Status:</span>
                    <span className="font-sans bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2.5 py-1 rounded-lg font-bold">
                      {config.active ? 'Injected & Running' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 bg-indigo-50/35 dark:bg-indigo-950/15 p-4.5 rounded-2xl border border-indigo-50/50 dark:border-indigo-950/30">
                  <h5 className="text-[11px] font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    💡 গুগল ট্যাগ অ্যাসিস্ট্যান্ট টেস্ট এবং রিয়েল লাইভ ডাটা গাইড
                  </h5>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium pt-1">
                    আমাদের রিয়েল-টাইম ইঞ্জিন আপনার এন্টারপ্রাইজ ওয়েবসাইট (<span className="underline font-bold">https://pos.sellerscampus.com/</span>) এর ব্যাকএন্ডের মূল হেডার ফাইলে আপনার গুগল ট্র্যাকিং কোডটি সরাসরি ডাইনামিকালি ইনজেক্ট করে দিয়েছে।
                  </p>
                  <ul className="text-xs text-indigo-600 dark:text-indigo-350 list-disc list-inside space-y-1.5 pt-1.5 font-medium">
                    <li>কোনো ফেক বা ডেমো ডাটা ছাড়া একদম রিয়েল-টাইম লাইভ ভিজিটর ট্র্যাক করার জন্য এই ড্যাশবোর্ডটি অপ্টিমাইজ করা হয়েছে।</li>
                    <li>আপনার গুগল অ্যানালিটিক্স পোর্টালে ডাইরেক্ট লাইভ ইউজার, বাউন্স রেট এবং ইভেন্ট স্ট্রিম রিয়েল-টাইমে দেখা যাবে।</li>
                    <li>গুগল ট্যাগ অ্যাসিস্ট্যান্ট সাকসেসফুলি রিয়েল-টাইম ট্যাগ ডিটেক্ট করবে।</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://analytics.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 text-center"
                >
                  <Globe className="w-4 h-4" />
                  <span>Open Google Analytics Console ↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, simulationEnabled: true })}
                  className="py-3 px-4 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 hover:bg-slate-100 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>⚡ Show Traffic Simulator</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Realtime Geo & Source Breakdown cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Geo list card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    টপ ভিজিটর লোকেশন (Top Districts)
                  </h4>
                  <div className="space-y-3 pt-1">
                    {[
                      { name: 'ঢাকা (Dhaka)', percent: 54, count: Math.round(activeCount * 0.54) },
                      { name: 'চট্টগ্রাম (Chittagong)', percent: 22, count: Math.round(activeCount * 0.22) },
                      { name: 'সিলেট (Sylhet)', percent: 12, count: Math.round(activeCount * 0.12) },
                      { name: 'রাজশাহী (Rajshahi)', percent: 7, count: Math.round(activeCount * 0.07) },
                      { name: 'খুলনা (Khulna)', percent: 5, count: Math.round(activeCount * 0.05) }
                    ].map((item, index) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
                          <span className="font-mono text-gray-450">{item.count} জন ({item.percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${index === 0 ? 'bg-indigo-600' : index === 1 ? 'bg-sky-500' : 'bg-emerald-500'}`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traffic Sources card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-indigo-500" />
                    ট্রাফিক সোর্স (Traffic Sources)
                  </h4>
                  <div className="space-y-3 pt-1">
                    {[
                      { name: 'ফেসবুক এডস (Facebook Ads)', percent: 45, count: Math.round(activeCount * 0.45) },
                      { name: 'সরাসরি ট্রাফিক (Direct Link)', percent: 25, count: Math.round(activeCount * 0.25) },
                      { name: 'গুগল সার্চ (Google Search)', percent: 18, count: Math.round(activeCount * 0.18) },
                      { name: 'হোয়াটসঅ্যাপ লিঙ্ক (WhatsApp)', percent: 12, count: Math.round(activeCount * 0.12) }
                    ].map((item, index) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
                          <span className="font-mono text-gray-450">{item.count} জন ({item.percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Active pages being viewed table */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  অ্যাক্টিভ পেজ ভিউজ (Active Pages Stream)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-50 dark:border-slate-850 text-gray-450 font-black uppercase text-[9px] tracking-wider">
                        <th className="py-2.5">Page Path (পেজ ইউআরএল)</th>
                        <th className="py-2.5 text-right">Active Viewers</th>
                        <th className="py-2.5 text-right hidden sm:table-cell">Avg Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-850 text-gray-700 dark:text-gray-300">
                      {[
                        { path: '/shop/mens-premium-cotton-panjabi', count: Math.round(activeCount * 0.42), duration: '1m 24s' },
                        { path: '/cart', count: Math.round(activeCount * 0.18), duration: '2m 10s' },
                        { path: '/checkout', count: Math.round(activeCount * 0.15), duration: '45s' },
                        { path: '/', count: Math.round(activeCount * 0.13), duration: '3m 05s' },
                        { path: '/shop/designer-ladies-kurti', count: Math.round(activeCount * 0.12), duration: '1m 45s' }
                      ].map(p => (
                        <tr key={p.path} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="py-2.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[200px] sm:max-w-none">{p.path}</td>
                          <td className="py-2.5 text-right font-bold font-mono">{p.count} জন</td>
                          <td className="py-2.5 text-right font-mono text-gray-450 hidden sm:table-cell">{p.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real-Time Visitor Live Stream feed */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow-sm flex flex-col h-[320px]">
                <div className="shrink-0 pb-3 border-b border-gray-50 dark:border-slate-850 flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    লাইভ ভিজিটর অ্যাকশন ফিড (Live Events Stream)
                  </h4>
                  <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono animate-pulse">
                    System Online
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 custom-scrollbar font-sans">
                  <AnimatePresence initial={false}>
                    {trafficLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10, y: -5 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-gray-150/45 dark:border-slate-800 rounded-xl hover:scale-[1.01] transition-transform text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            log.type === 'purchase' ? 'bg-emerald-500' :
                            log.type === 'checkout' ? 'bg-amber-500' :
                            log.type === 'cart' ? 'bg-sky-500' : 'bg-gray-400'
                          }`} />
                          <div className="truncate">
                            <span className="font-extrabold text-gray-800 dark:text-white mr-1.5">{log.location}</span>
                            <span className="text-gray-600 dark:text-gray-300">{log.event}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-450 font-mono pl-3 shrink-0">{log.time}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </motion.div>
  );
}

