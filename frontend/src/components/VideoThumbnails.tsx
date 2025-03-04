import { useEffect, useRef, useState } from 'react';

interface VideoThumbnailsProps {
  videoSrc: string;
  duration: number;
  count: number;
}

export function VideoThumbnails({ videoSrc, duration, count }: VideoThumbnailsProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const generateThumbnails = async () => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      // הגדרת גודל הקנבס לאיכות גבוהה יותר
      canvas.width = 240;
      canvas.height = 135;

      const newThumbnails: string[] = [];
      
      // יצירת תמונות ממוזערות במרווחים שווים
      for (let i = 0; i < count; i++) {
        const time = (duration * i) / (count - 1);
        video.currentTime = time;
        
        // המתנה לטעינת הפריים
        await new Promise(resolve => {
          video.onseeked = resolve;
        });

        // שיפור איכות התמונה
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // המרה ל-URL עם איכות טובה
        newThumbnails.push(canvas.toDataURL('image/jpeg', 0.8));
      }

      setThumbnails(newThumbnails);
    };

    if (videoSrc && duration > 0) {
      generateThumbnails();
    }
  }, [videoSrc, duration, count]);

  return (
    <div className="flex w-full h-24 bg-transparent">
      <video ref={videoRef} src={videoSrc} className="hidden" />
      {thumbnails.map((thumbnail, index) => (
        <div
          key={index}
          className="flex-1 h-full"
          style={{
            backgroundImage: `url(${thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRight: index < thumbnails.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }}
        />
      ))}
    </div>
  );
}
