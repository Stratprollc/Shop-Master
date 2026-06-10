import React, { useRef, useEffect, useState, useMemo } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Heart, 
  Search, 
  Tv, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Wifi, 
  Info, 
  ListFilter, 
  Bookmark, 
  Radio, 
  Activity, 
  Eye, 
  HelpCircle,
  Sparkles,
  Sliders,
  Globe2,
  Tv2
} from 'lucide-react';
import { TV_CHANNELS, TVChannel } from '../utils/tvData';

interface LiveTVPortalProps {
  currentStream?: TVChannel | null;
  setCurrentStream?: (channel: TVChannel | null) => void;
}

export function LiveTVPortal({ currentStream, setCurrentStream }: LiveTVPortalProps) {
  const [channels] = useState<TVChannel[]>(TV_CHANNELS);
  
  // Initialize to current stream state if exist
  const [selectedChannel, setSelectedChannel] = useState<TVChannel>(() => {
    if (currentStream) {
      const match = TV_CHANNELS.find(c => c.url === currentStream.url || c.name === currentStream.name);
      if (match) return match;
    }
    return TV_CHANNELS[0];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sellers_tv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track isPlaying internally inside Live TV view
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [aspectRatio, setAspectRatio] = useState<'video-16-9' | 'video-21-9' | 'video-4-3'>('video-16-9');
  const [playerStatus, setPlayerStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [diagnosticVisible, setDiagnosticVisible] = useState(false);
  const [playbackStats, setPlaybackStats] = useState({
    bufferLen: 0.0,
    currentQuality: 'Auto',
    fps: 30,
    networkSpeed: 'Live HLS Chunk'
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Sync favorites to local storage
  const toggleFavorite = (channelName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(channelName)
      ? favorites.filter(f => f !== channelName)
      : [...favorites, channelName];
    setFavorites(updated);
    try {
      localStorage.setItem('sellers_tv_favorites', JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage write blocked", err);
    }
  };

  // Groups list
  const groups = useMemo(() => {
    const rawGroups = channels.map(c => c.group);
    const unique = Array.from(new Set(rawGroups)).filter(g => g && g !== 'Other' && g !== 'Channels');
    return ['All', 'Favorites', ...unique.sort(), 'Channels', 'Other'];
  }, [channels]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.group.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedGroup === 'All') return matchesSearch;
      if (selectedGroup === 'Favorites') return matchesSearch && favorites.includes(c.name);
      return matchesSearch && c.group === selectedGroup;
    });
  }, [channels, searchQuery, selectedGroup, favorites]);

  // Handle HLS Player mounting & binding
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Destroy existing HLS connection
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setPlayerStatus('loading');
    setIsPlaying(true);

    const streamUrl = selectedChannel.url;

    // Report stream change to context/global
    if (setCurrentStream) {
      setCurrentStream(selectedChannel);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 20
      });
      hlsRef.current = hls;
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = isMuted;
        video.volume = volume;
        video.play()
          .then(() => {
            setPlayerStatus('playing');
          })
          .catch((err) => {
            console.warn("Autoplay block detected:", err);
            setPlayerStatus('playing'); 
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("Network error encountered on stream, attempting dynamic reload...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("Media decoding glitch. Recovering...");
              hls.recoverMediaError();
              break;
            default:
              setPlayerStatus('error');
              break;
          }
        }
      });

      // Poll statistics periodically for diagnostic telemetry
      const interval = setInterval(() => {
        if (hls.media) {
          const buffered = hls.media.buffered;
          const len = buffered.length > 0 ? (buffered.end(0) - hls.media.currentTime) : 0;
          setPlaybackStats({
            bufferLen: Math.round(len * 10) / 10,
            currentQuality: hls.levels[hls.currentLevel]?.height ? `${hls.levels[hls.currentLevel].height}p` : 'Auto',
            fps: 30,
            networkSpeed: 'HLS Live Link'
          });
        }
      }, 3000);

      return () => {
        clearInterval(interval);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Direct stream support for iOS / Mac Safari
      video.src = streamUrl;
      video.muted = isMuted;
      video.volume = volume;

      const onCanPlay = () => {
        video.play()
          .then(() => setPlayerStatus('playing'))
          .catch(() => setPlayerStatus('playing'));
      };

      const onError = () => {
        setPlayerStatus('error');
      };

      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);

      return () => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
      };
    } else {
      setPlayerStatus('error');
    }
  }, [selectedChannel]);

  // Adjust play pause status client-side
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Adjust mute/unmute
  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Adjust absolute TV volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      video.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Real-time stream reload function
  const reloadStream = () => {
    const video = videoRef.current;
    if (!video) return;
    setPlayerStatus('loading');
    
    // Simple teardown state
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = selectedChannel.url;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setPlayerStatus('playing')).catch(() => setPlayerStatus('playing'));
      });
    } else {
      video.src = streamUrl;
      video.load();
      video.play().then(() => setPlayerStatus('playing')).catch(() => setPlayerStatus('playing'));
    }
  };

  // Full screen trigger
  const triggerFullScreen = () => {
    const video = videoRef.current;
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-600/10 overflow-hidden" id="messaging-gateway-view">
      
      {/* Upper Glowing Ribbon Header - Light Elegant Version */}
      <div className="w-full bg-white border-b border-slate-200/80 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 left-1/4 w-80 h-24 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-24 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-md shadow-red-100/40 animate-pulse flex items-center justify-center">
            <Radio className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-[#00a884] uppercase bg-[#00a884]/10 px-2.5 py-0.5 rounded-full">SellersCampus Broadcast</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">Live Merchant Entertainment Portal</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-700">
            <Activity className="w-4.5 h-4.5 text-[#00a884]" />
            <span className="text-slate-500">Merchant Nodes:</span>
            <span className="text-emerald-600 font-bold font-sans">189 Channels Live</span>
          </div>

          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin-slow" />
            <span>Smooth HLS Live Engine</span>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="flex-grow p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1700px] w-full mx-auto">
        
        {/* Left Projection Area (Col Span 7 on large screens) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          
          {/* Main Display Theater Frame inside dynamic light theme */}
          <div className="w-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 relative group/player flex flex-col">
            
            {/* Top Info Bar of Current stream */}
            <div className="p-4 bg-white/95 border-b border-slate-200 backdrop-blur-sm flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {selectedChannel.logo ? (
                  <img 
                    src={selectedChannel.logo} 
                    alt={selectedChannel.name}
                    className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1.5 border border-slate-200"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2364748b">TV</text></svg>';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 text-sm">
                    {selectedChannel.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    {selectedChannel.name}
                    <span className="text-[10px] font-bold text-[#00a884] bg-[#00a884]/10 border border-[#00a884]/20 px-2 py-0.5 rounded-md">
                      {selectedChannel.group}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                    Live Broadcast Feed • Instant latency alignment node
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => toggleFavorite(selectedChannel.name, e)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    favorites.includes(selectedChannel.name)
                      ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                  }`}
                  title={`${favorites.includes(selectedChannel.name) ? 'Remove from Favorites' : 'Add to Favorites'}`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedChannel.name) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => setDiagnosticVisible(!diagnosticVisible)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    diagnosticVisible 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                  title="Show Diagnostic Stats"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Box Canvas */}
            <div className={`relative bg-slate-950 flex items-center justify-center overflow-hidden aspect-video ${aspectRatio} transition-all`}>
              
              {/* Actual Video tag for raw feed loading */}
              <video
                ref={videoRef}
                playsInline
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Status and Diagnostics Overlays */}
              {playerStatus === 'loading' && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
                    <Tv className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-black text-white mb-1 tracking-wider uppercase">CONNECTING BROADCAST FEED...</h4>
                  <p className="text-xs text-slate-400 font-mono">Initializing HLS streams • Buffer alignment secure</p>
                </div>
              )}

              {playerStatus === 'error' && (
                <div className="absolute inset-0 bg-slate-900/98 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 flex items-center justify-center mb-4 animate-bounce">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-white mb-1 tracking-wider uppercase">FEED UNREACHABLE OR RESTRICTED</h4>
                  <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                    This live stream node could be offline, geographically blocked, or experiencing transit downtime. Try reloading or selecting another channel.
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={reloadStream}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Try Reloading Stream
                    </button>
                    <a
                      href={selectedChannel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      Open Stream Direct Link
                    </a>
                  </div>
                </div>
              )}

              {/* HLS Diagnostics / Stats overlay */}
              {diagnosticVisible && (
                <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-800 text-slate-300 p-4 rounded-2xl text-[10px] font-mono space-y-1.5 z-20 shadow-2xl backdrop-blur-sm max-w-[280px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                    <span className="font-bold text-[#00a884] flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-[#00a884]" /> STREAM TELEMETRY
                    </span>
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] text-[#00a884]">LIVE</span>
                  </div>
                  <p><span className="text-slate-500">Codec Profile:</span> <span className="text-white">H264 / AAC High</span></p>
                  <p><span className="text-slate-500">Live Buffer:</span> <span className="text-indigo-400 font-bold">{playbackStats.bufferLen}s lag</span></p>
                  <p><span className="text-slate-500">Resolution:</span> <span className="text-indigo-400 font-bold">{playbackStats.currentQuality}</span></p>
                  <p><span className="text-slate-500">Video FPS:</span> <span className="text-emerald-400">{playbackStats.fps} frames/sec</span></p>
                  <p className="text-[9px] text-slate-400 border-t border-slate-800 pt-1.5 mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    {selectedChannel.url}
                  </p>
                </div>
              )}
            </div>

            {/* Light Interactive Player Controller Deck with Hover highlights */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Playback Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center text-white cursor-pointer hover:scale-110 active:scale-90 shadow-md shadow-indigo-600/20"
                >
                  {isPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current pl-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={reloadStream}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer hover:scale-105"
                  title="Reload Live Feed"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-slate-200 hidden sm:block" />

                {/* Aspect ratios triggers */}
                <div className="flex items-center gap-1.5 bg-slate-200/50 p-1 border border-slate-200 rounded-xl">
                  {(['video-16-9', 'video-21-9', 'video-4-3'] as const).map((ratio) => {
                    const label = ratio === 'video-16-9' ? '16:9' : ratio === 'video-21-9' ? '21:9' : '4:3';
                    const active = aspectRatio === ratio;
                    return (
                      <button 
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all ${
                          active 
                            ? 'bg-indigo-600 text-white shadow-xs' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound slider, Full screen triggers */}
              <div className="flex items-center justify-between sm:justify-end gap-4 flex-grow sm:flex-grow-0">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-2xl flex-grow sm:flex-grow-0 max-w-[170px] shadow-xs">
                  <button onClick={handleMuteToggle} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 md:w-20 accent-indigo-600 h-1.5 rounded-lg bg-slate-200 cursor-pointer"
                  />
                </div>

                <button 
                  onClick={triggerFullScreen}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer hover:scale-105"
                  title="Fullscreen Video Node"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Quick Informational Notice beneath player - Light Mode styled */}
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-12 h-full bg-indigo-500/5 rotate-12 blur-xl pointer-events-none" />
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">HLS BROADCAST ASSISTANCE</h5>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  These streaming links are aggregated from public news and content distribution networks. If a channel experiences transit delay, reload with the spin button, or shuffle dynamically.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                const randomChannel = channels[Math.floor(Math.random() * channels.length)];
                setSelectedChannel(randomChannel);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-150 border border-indigo-100 text-indigo-700 font-black text-xs rounded-xl flex-shrink-0 cursor-pointer transition-all flex items-center justify-center gap-1.5 hover:scale-102"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              Surprise Channel Shuffle
            </button>
          </div>

        </div>

        {/* Right Dashboard Sidebar (Col Span 5 on large screens) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          
          <div className="w-full bg-white border border-slate-200 rounded-[2rem] p-5 flex flex-col gap-4 shadow-xl hover:shadow-2xl transition-all duration-300">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-sans">Live Channel Tuner</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 font-bold">
                {filteredChannels.length} TV Found
              </span>
            </div>

            {/* Smart search search field */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search TV Channels, groups..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium placeholder-slate-400 shadow-inner transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[10px] font-black text-slate-400 hover:text-slate-700 px-2 py-1 bg-slate-200 rounded-lg transition-colors"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Scrolling group filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {groups.map((grp) => {
                const isActive = selectedGroup === grp;
                return (
                  <button
                    key={grp}
                    onClick={() => {
                      setSelectedGroup(grp);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer whitespace-nowrap transition-all border ${
                      isActive 
                        ? 'bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-100' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    {grp === 'Favorites' ? '❤️ Favorites' : grp}
                  </button>
                );
              })}
            </div>

            {/* Real list deck */}
            <div className="overflow-y-auto max-h-[480px] lg:max-h-[600px] flex flex-col gap-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {filteredChannels.length > 0 ? (
                filteredChannels.map((chan) => {
                  const isCurrent = chan.name === selectedChannel.name;
                  const isFav = favorites.includes(chan.name);
                  
                  return (
                    <div
                      key={chan.name}
                      onClick={() => {
                        setSelectedChannel(chan);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group/item relative overflow-hidden ${
                        isCurrent
                          ? 'bg-indigo-50/50 border-indigo-200 shadow-xs'
                          : 'bg-white border-slate-100 hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                      )}

                      <div className="flex items-center gap-3">
                        
                        {/* Channel logo / generic */}
                        {chan.logo ? (
                          <img 
                            src={chan.logo} 
                            alt={chan.name}
                            className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200/60 flex-shrink-0 transition-transform duration-300 group-hover/item:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2394a3b8">TV</text></svg>';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-[11px] flex-shrink-0">
                            {chan.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="text-left">
                          <h4 className={`text-xs font-black leading-tight flex items-center gap-1.5 ${
                            isCurrent ? 'text-indigo-650' : 'text-slate-800 group-hover/item:text-slate-950'
                          }`}>
                            {chan.name}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                            {chan.group}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        
                        {/* Action status */}
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping mr-2" />
                        )}

                        {/* Favorite button */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(chan.name, e)}
                          className={`p-2 rounded-xl transition-all border cursor-pointer hover:scale-105 ${
                            isFav 
                              ? 'bg-rose-50 border-rose-100 text-rose-500'
                              : 'bg-transparent border-transparent text-slate-300 hover:text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400 shadow-xs">
                    <Search className="w-5 h-5" />
                  </div>
                  <h5 className="text-[11px] font-black uppercase text-slate-800 tracking-wider mb-1">NO MATCHING FEED</h5>
                  <p className="text-[10px] text-slate-400">
                    Verify spelling or search and configure another group list above.
                  </p>
                </div>
              )}
            </div>

            {/* Quick action buttons row - Light themed */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => {
                  setSelectedGroup('Favorites');
                }}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Filter Favorites
              </button>
              <button
                onClick={() => {
                  setSelectedGroup('All');
                  setSearchQuery('');
                }}
                className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Directory
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
