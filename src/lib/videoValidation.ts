export interface VideoMetadata {
  width: number;
  height: number;
  duration?: number;
}

export const getVideoMetadata = (fileOrUrl: File | string): Promise<VideoMetadata> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    let objectUrl: string | null = null;
    if (typeof fileOrUrl === 'string') {
      video.src = fileOrUrl;
      video.crossOrigin = 'anonymous';
    } else {
      objectUrl = URL.createObjectURL(fileOrUrl);
      video.src = objectUrl;
    }

    video.onloadedmetadata = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      });
    };

    video.onerror = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      resolve({ width: 0, height: 0 });
    };
  });
};

export const validateTikTokVideo = (metadata: VideoMetadata): { isValid: boolean; reason?: string } => {
  const { width, height } = metadata;
  if (width === 0 || height === 0) {
    return { isValid: false, reason: "Unable to read video dimensions." };
  }

  // 1. Resolution Check: TikTok requires at least 720p (720x1280 or higher).
  // This means the smaller dimension must be at least 720px. Since the allowed aspect ratios
  // are vertical (9:16), square (1:1), and portrait (4:5), both width and height should be at least 720px.
  if (width < 720 || height < 720) {
    return {
      isValid: false,
      reason: `Resolution is too low (${width}x${height}). TikTok requires a minimum resolution of 720p (both width and height must be at least 720px).`
    };
  }

  // 2. Aspect Ratio Check: Allowed aspect ratios: 9:16 (0.5625), 1:1 (1.0), or 4:5 (0.8).
  const ratio = width / height;
  const is9to16 = Math.abs(ratio - (9 / 16)) <= 0.02; // e.g. 0.5625
  const is1to1 = Math.abs(ratio - 1.0) <= 0.02;       // e.g. 1.0
  const is4to5 = Math.abs(ratio - (4 / 5)) <= 0.02;   // e.g. 0.8

  if (!is9to16 && !is1to1 && !is4to5) {
    return {
      isValid: false,
      reason: `Aspect ratio is non-standard (${ratio.toFixed(2)}:1). TikTok only supports 9:16 (vertical), 1:1 (square), or 4:5 aspect ratios.`
    };
  }

  return { isValid: true };
};
