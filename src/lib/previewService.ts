export interface PlatformPreviewData {
  charCount: number;
  charLimit: number;
  warnings: string[];
  isValid: boolean;
  formattedContent: string;
}

// Regular expressions to detect and wrap social tokens in stylable spans
const HASHTAG_REGEX = /#(\w+)/g;
const MENTION_REGEX = /@(\w+)/g;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function formatSocialText(text: string): string {
  if (!text) return '';
  
  // HTML escape only &, <, and > to prevent XSS issues in dangerouslySetInnerHTML.
  // Quotes (single and double) are safe inside standard HTML element text content.
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Format handles, hashtags, and links
  escaped = escaped.replace(HASHTAG_REGEX, '<span class="text-primary font-semibold hover:underline">#$1</span>');
  escaped = escaped.replace(MENTION_REGEX, '<span class="text-primary font-semibold hover:underline">@$1</span>');
  escaped = escaped.replace(URL_REGEX, '<span class="text-primary hover:underline">$1</span>');
  
  return escaped;
}

export function getAdjustedLength(text: string, platform: string): number {
  if (!text) return 0;
  const p = platform.toLowerCase();
  if (p === 'x' || p === 'x (twitter)' || p === 'x premium' || p === 'twitter') {
    return text.replace(URL_REGEX, "12345678901234567890123").length;
  }
  return text.length;
}

export function getPlatformPreview(
  content: string,
  mediaFiles: { type: 'image' | 'video' | string; name?: string }[],
  platform: string,
  format: 'feed' | 'reel' | 'story' | 'short' | string = 'feed',
  isPremium: boolean = false
): PlatformPreviewData {
  const warnings: string[] = [];
  let charCount = getAdjustedLength(content, platform);
  let charLimit = 5000; // Default fallback
  let displayContent = content || '';
  
  const hasImages = mediaFiles.some(m => m.type.startsWith('image') || m.type === 'image');
  const hasVideos = mediaFiles.some(m => m.type.startsWith('video') || m.type === 'video');
  const mediaCount = mediaFiles.length;

  switch (platform) {
    case 'x':
      charLimit = isPremium ? 25000 : 280; // Premium tier limit is 25000, Standard is 280
      if (charCount > charLimit) {
        warnings.push(
          isPremium
            ? `Content exceeds X's premium 25,000-character limit.`
            : `Content exceeds X's standard 280-character limit.`
        );
      }
      if (mediaCount > 4) {
        warnings.push("X supports a maximum of 4 images.");
      }
      if (hasVideos && mediaCount > 1) {
        warnings.push("X supports only 1 video per post.");
      }
      if (hasImages && hasVideos) {
        warnings.push("X does not support mixing images and videos.");
      }
      break;

    case 'linkedin':
      charLimit = 3000;
      if (charCount > 3000) {
        warnings.push("Content exceeds LinkedIn's 3000-character limit.");
      }
      if (mediaCount > 9) {
        warnings.push("LinkedIn supports a maximum of 9 images.");
      }
      if (hasVideos && mediaCount > 1) {
        warnings.push("LinkedIn supports only 1 video per post.");
      }
      break;

    case 'instagram':
      charLimit = 2200;
      if (charCount > 2200) {
        warnings.push("Content exceeds Instagram's 2200-character limit.");
      }
      if (format === 'story' || format === 'reel') {
        if (mediaCount !== 1) {
          warnings.push(`Instagram ${format === 'story' ? 'Stories' : 'Reels'} require exactly 1 image or video.`);
        }
      } else {
        // Feed carousel
        if (mediaCount > 10) {
          warnings.push("Instagram supports a maximum of 10 images/videos in a carousel.");
        }
      }
      break;

    case 'tiktok':
      charLimit = 2200;
      if (charCount > 2200) {
        warnings.push("Content exceeds TikTok's 2200-character limit.");
      }
      if (mediaCount === 0) {
        warnings.push("TikTok requires a video or image attachment.");
      } else if (hasVideos && mediaCount > 1) {
        warnings.push("TikTok only supports uploading 1 video.");
      } else if (hasImages && hasVideos) {
        warnings.push("TikTok does not support mixing images and videos.");
      }
      break;

    case 'youtube': {
      let title = "";
      let description = content || "";
      
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          title = parsed.title || "";
          description = parsed.description || "";
        }
      } catch (e) {
        title = "";
        description = content || "";
      }

      displayContent = description;
      charLimit = 100; // Display Title character limit progress
      charCount = title.length;

      if (!title || title.trim() === "") {
        warnings.push("YouTube title is required.");
      } else if (title.length > 100) {
        warnings.push("YouTube titles are limited to 100 characters.");
      }
      
      if (description.length > 5000) {
        warnings.push("YouTube descriptions are limited to 5,000 characters.");
      }

      if (format === 'short') {
        if (mediaCount === 0) {
          warnings.push("YouTube Shorts require a video attachment.");
        } else if (mediaCount > 1) {
          warnings.push("YouTube Shorts support only 1 video.");
        } else if (hasImages) {
          warnings.push("YouTube Shorts require a video file; static images are not supported.");
        }
      }
      break;
    }

    case 'bluesky':
      charLimit = 300;
      if (charCount > 300) {
        warnings.push("Content exceeds Bluesky's 300-character limit.");
      }
      break;

    case 'threads':
      charLimit = 500;
      if (charCount > 500) {
        warnings.push("Content exceeds Threads' 500-character limit.");
      }
      break;

    case 'pinterest': {
      let caption = content || '';
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          caption = parsed.caption !== undefined ? parsed.caption : content;
        }
      } catch (e) {
        caption = content || '';
      }

      displayContent = caption;
      charLimit = 500;
      charCount = caption.length;

      if (charCount > 500) {
        warnings.push("Content exceeds Pinterest's 500-character limit.");
      }
      break;
    }

    case 'facebook':
      charLimit = 5000;
      if (charCount > 5000) {
        warnings.push("Content exceeds Facebook's 5000-character limit.");
      }
      break;

    default:
      break;
  }

  const isValid = warnings.length === 0;

  return {
    charCount,
    charLimit,
    warnings,
    isValid,
    formattedContent: formatSocialText(displayContent)
  };
}
