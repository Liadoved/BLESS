import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import ReactPlayer from 'react-player';
import { ScissorsIcon } from "@heroicons/react/24/outline";
import { VideoThumbnails } from "./VideoThumbnails";

interface VideoTrimmerProps {
  file: File | null;
  onClose: () => void;
  onSave: (trimmedVideo: Blob) => void;
}

export default function VideoTrimmer({ file, onClose, onSave }: VideoTrimmerProps) {
  const [ready, setReady] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());

  // טעינת FFmpeg
  useEffect(() => {
    const load = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd";
      const ffmpeg = ffmpegRef.current;
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      
      setReady(true);
    };
    load();
  }, []);

  // חיתוך הוידאו
  const handleTrim = async () => {
    if (!file || !ready) return;

    setProcessing(true);
    try {
      const ffmpeg = ffmpegRef.current;
      
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));

      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-ss",
        startTime.toString(),
        "-t",
        (endTime - startTime).toString(),
        "-c",
        "copy",
        "output.mp4"
      ]);

      const data = await ffmpeg.readFile("output.mp4");
      const trimmedVideo = new Blob([data], { type: "video/mp4" });

      onSave(trimmedVideo);
      onClose();
    } catch (error) {
      console.error("Error trimming video:", error);
    } finally {
      setProcessing(false);
    }
  };

  // טעינת הוידאו
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // עדכון זמן נוכחי
  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  // עדכון משך הוידאו
  const handleDuration = (duration: number) => {
    setDuration(duration);
    setEndTime(duration);
  };

  // טיפול בגרירת קווי החיתוך
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !duration) return;

      const container = document.querySelector('.timeline-container');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;

      // עדכון הזמן והתצוגה המקדימה
      if (isDragging === 'start') {
        const time = Math.min(newTime, endTime - 0.1);
        setStartTime(time);
        setPreviewTime(time);
        
        // עדכון התצוגה המקדימה של ההתחלה
        const player = document.querySelector('.start-preview video') as HTMLVideoElement;
        if (player) player.currentTime = time;
      } else {
        const time = Math.max(newTime, startTime + 0.1);
        setEndTime(time);
        setPreviewTime(time);
        
        // עדכון התצוגה המקדימה של הסוף
        const player = document.querySelector('.end-preview video') as HTMLVideoElement;
        if (player) player.currentTime = time;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      setPreviewTime(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration, startTime, endTime]);

  // עדכון נגן התצוגה המקדימה
  useEffect(() => {
    if (previewTime !== null && playerRef.current) {
      playerRef.current.seekTo(previewTime, 'seconds');
    }
  }, [previewTime]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1A1C1E] rounded-xl p-6 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">חיתוך וידאו</h2>
        </div>
        
        {/* נגן וידאו */}
        <div className="relative aspect-video bg-gradient-to-b from-black to-[#1A1C1E] rounded-2xl overflow-hidden mb-6 ring-1 ring-white/10 shadow-2xl">
          <ReactPlayer
            ref={playerRef}
            url={videoSrc}
            width="100%"
            height="100%"
            playing={isPlaying}
            controls
            onDuration={handleDuration}
            onProgress={(state) => {
              handleProgress(state);
              // אם הגענו לסוף הקטע הנבחר, נעצור ונחזור להתחלה
              if (state.playedSeconds >= endTime) {
                setIsPlaying(false);
                playerRef.current?.seekTo(startTime, 'seconds');
              }
              // אם אנחנו לפני תחילת הקטע הנבחר, נקפוץ להתחלה
              if (state.playedSeconds < startTime) {
                playerRef.current?.seekTo(startTime, 'seconds');
              }
            }}
            progressInterval={50}
            config={{
              file: {
                attributes: {
                  style: { borderRadius: '16px' }
                },
                forceVideo: true,
                forceAudio: true
              }
            }}
          />

          {/* תצוגת זמן נוכחי */}
          <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-mono border border-white/10">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* פרטי החיתוך */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#00A3FF] rounded-full" />
              <div className="text-sm font-medium text-white/80">התחלה</div>
              <div className="font-mono text-sm text-white/60">{formatTime(startTime)}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#00A3FF] rounded-full" />
              <div className="text-sm font-medium text-white/80">סיום</div>
              <div className="font-mono text-sm text-white/60">{formatTime(endTime)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full">
            <div className="text-sm font-medium text-white/80">משך</div>
            <div className="font-mono text-sm text-[#00A3FF]">{formatTime(endTime - startTime)}</div>
          </div>
        </div>

        {/* תצוגה מקדימה וסליידר */}
        <div className="mb-8">
          <div className="relative timeline-container h-28 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
            {/* רקע */}
            <div className="absolute inset-0 bg-gradient-to-b from-black to-[#1A1C1E]" />

            {/* תמונות ממוזערות */}
            <div className="relative h-full">
              <VideoThumbnails
                videoSrc={videoSrc}
                duration={duration}
                count={30}
              />

              {/* שכבת הכהייה */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
            </div>
            
            {/* אזורים שיחתכו */}
            <div className="absolute inset-0">
              {/* אזור שמאלי */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-black/80 backdrop-blur"
                style={{
                  width: `${(startTime / duration) * 100}%`,
                  transition: 'width 0.1s linear'
                }}
              />
              {/* אזור ימני */}
              <div 
                className="absolute top-0 bottom-0 right-0 bg-black/80 backdrop-blur"
                style={{
                  width: `${100 - (endTime / duration) * 100}%`,
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
            
            {/* אזור החיתוך */}
            <div 
              className="absolute top-0 bottom-0 backdrop-brightness-110"
              style={{
                left: `${(startTime / duration) * 100}%`,
                right: `${100 - (endTime / duration) * 100}%`,
                transition: 'left 0.1s linear, right 0.1s linear'
              }}
            >
              {/* מסגרת מודגשת */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 border-2 border-[#00A3FF] shadow-[0_0_20px_rgba(0,163,255,0.3)]" />
                <div className="absolute inset-0 border border-white/20" />
              </div>
              
              {/* סמן התחלה */}
              <div 
                className="absolute left-0 top-0 bottom-0 flex items-center cursor-ew-resize group"
                onMouseDown={(e) => {
                  setIsDragging('start');
                  if (playerRef.current) {
                    const container = e.currentTarget.closest('.timeline-container');
                    if (container) {
                      const rect = container.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(1, x / rect.width));
                      const newTime = percentage * duration;
                      playerRef.current.seekTo(newTime, 'seconds');
                    }
                  }
                }}
              >
                {/* קו אנכי */}
                <div className="absolute inset-y-0 left-0 w-px bg-white">
                  <div className="absolute inset-0 animate-pulse bg-white opacity-50 blur-sm" />
                </div>
                
                {/* ידית גרירה */}
                <div className="absolute top-1/2 -translate-y-1/2 translate-x-[15px] w-8 h-16">
                  <div className="absolute inset-0 bg-[#00A3FF] rounded-full opacity-20 blur-lg transform transition-all group-hover:scale-150" />
                  <div className="relative w-full h-full bg-[#00A3FF] rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0084FF]">
                    <div className="w-1 h-8 bg-white/90 rounded-full transform transition-all group-hover:scale-110" />
                  </div>
                </div>
              </div>
              
              {/* סמן סיום */}
              <div 
                className="absolute right-0 top-0 bottom-0 flex items-center cursor-ew-resize group"
                onMouseDown={(e) => {
                  setIsDragging('end');
                  if (playerRef.current) {
                    const container = e.currentTarget.closest('.timeline-container');
                    if (container) {
                      const rect = container.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(1, x / rect.width));
                      const newTime = percentage * duration;
                      playerRef.current.seekTo(newTime, 'seconds');
                    }
                  }
                }}
              >
                {/* קו אנכי */}
                <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-[#00A3FF]">
                  <div className="absolute inset-0 animate-pulse bg-[#00A3FF] opacity-50 blur-sm" />
                </div>
                
                {/* ידית גרירה */}
                <div className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-16">
                  <div className="absolute inset-0 bg-[#00A3FF] rounded-full opacity-20 blur-lg transform transition-all group-hover:scale-150" />
                  <div className="relative w-full h-full bg-[#00A3FF] rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0084FF]">
                    <div className="w-1 h-8 bg-white/90 rounded-full transform transition-all group-hover:scale-110" />
                  </div>
                </div>
              </div>
            </div>

            {/* סמן זמן נוכחי */}
            <div 
              className="absolute top-0 bottom-0 pointer-events-none" 
              style={{ 
                left: `${(currentTime / duration) * 100}%`,
                transition: 'left 0.1s linear'
              }}
            >
              {/* קו אנכי */}
              <div className="absolute inset-y-0 left-0 w-px bg-white">
                <div className="absolute inset-0 animate-pulse bg-white opacity-50 blur-sm" />
              </div>
              
              {/* נקודה עליונה */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <div className="absolute inset-0 w-4 h-4 bg-white rounded-full opacity-20 blur-lg animate-pulse" />
                <div className="relative w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </div>

          {/* כפתורי שליטה */}
          <div className="flex justify-between mt-6">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => {
                  if (!isPlaying) {
                    // כשמתחילים לנגן, נוודא שאנחנו בנקודת ההתחלה
                    playerRef.current?.seekTo(startTime, 'seconds');
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors group"
              >
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 bg-white rounded-full opacity-20 blur-lg transform transition-all group-hover:scale-150" />
                  {isPlaying ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="w-2 h-6 bg-white rounded-sm transform transition-transform" />
                      <div className="w-2 h-6 bg-white rounded-sm transform transition-transform ml-1" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent transform transition-transform translate-x-0.5" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">{isPlaying ? "עצור" : "נגן"}</span>
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                ביטול
              </button>
              <button
                onClick={handleTrim}
                disabled={processing}
                className="relative px-8 py-2.5 bg-[#00A3FF] hover:bg-[#0084FF] text-white rounded-xl transition-all duration-300 disabled:opacity-50 group"
              >
                <div className="absolute inset-0 bg-[#00A3FF] rounded-xl opacity-20 blur-lg transform transition-all group-hover:scale-110" />
                <span className="relative text-sm font-medium">
                  {processing ? "מעבד..." : "שמור"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// פונקציית עזר לפורמט זמן
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 100);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}
