import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  X, 
  Tv2,
  Tv,
  HelpCircle,
  Activity
} from 'lucide-react';
import { TVChannel } from '../utils/tvData';

interface GlobalPipPlayerProps {
  currentStream: TVChannel;
  setCurrentStream: (channel: TVChannel | null) => void;
  onMaximize: () => void;
}

export function GlobalPipPlayer({ currentStream, setCurrentStream, onMaximize }: GlobalPipPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // default mute for PiP to prevent disruption
  const [playerStatus, setPlayerStatus] = useState<'loading' | 'playing' | 'error'>('loading');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setPlayerStatus('loading');
    setIsPlaying(true);

    const streamUrl = currentStream.url;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 8,
        maxMaxBufferLength: 15
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = isMuted;
        video.volume = 0.8;
        video.play()
          .then(() => setPlayerStatus('playing'))
          .catch(() => {
            setPlayerStatus('playing'); // user interaction required or autoplay issue
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setPlayerStatus('error');
              break;
          }
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.muted = isMuted;
      video.volume = 0.8;

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
  }, [currentStream]);

  // Sync mute state on change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

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

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-6 right-6 w-72 h-44 sm:w-80 sm:h-48 md:w-[350px] md:h-[200px] bg-slate-950 border-2 border-indigo-500/80 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col group animate-fade-in ring-4 ring-indigo-500/10">
      
      {/* PiP Header Line */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-white z-10 select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase truncate">
            PiP Mode: {currentStream.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={onMaximize}
            className="p-1 hover:bg-slate-800 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors"
            title="Maximize back to TV page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setCurrentStream(null)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Close PiP Player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main video area */}
      <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
        
        <video 
          ref={videoRef}
          playsInline
          className="w-full h-full object-cover"
        />

        {playerStatus === 'loading' && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin mb-1" />
            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">LOADING PiP FEED...</span>
          </div>
        )}

        {playerStatus === 'error' && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-3 text-center">
            <HelpCircle className="w-6 h-6 text-red-500 mb-1" />
            <span className="text-[9px] font-black text-slate-300 tracking-wider">FEED OFFLINE</span>
          </div>
        )}

        {/* Hover overlay controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePlayPause}
            className="p-2.5 rounded-full bg-indigo-650 hover:bg-indigo-600 text-white shadow-xl transition-all hover:scale-110"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current pl-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleMuteToggle}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-xl transition-all hover:scale-110"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

      </div>

    </div>
  );
}
