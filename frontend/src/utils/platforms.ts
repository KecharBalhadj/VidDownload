export type Platform =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'pinterest'
  | 'threads'
  | 'facebook'
  | 'twitter'
  | 'reddit'
  | 'vimeo'
  | 'dailymotion'
  | 'twitch'
  | 'linkedin'
  | 'snapchat'
  | 'unknown';

export interface PlatformTheme {
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  accent: string;
  gradient: string;
  icon: string;
  emoji: string;
}

export const PLATFORM_THEMES: Record<Platform, PlatformTheme> = {
  youtube: {
    name: 'YouTube',
    primary: '#FF0000',
    secondary: '#ffffff',
    bg: '#0f0f0f',
    text: '#ffffff',
    accent: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)',
    icon: '▶',
    emoji: '🎬',
  },
  tiktok: {
    name: 'TikTok',
    primary: '#00f2ea',
    secondary: '#ff0050',
    bg: '#010101',
    text: '#ffffff',
    accent: '#00f2ea',
    gradient: 'linear-gradient(135deg, #010101 0%, #1a1a2e 100%)',
    icon: '♪',
    emoji: '🎵',
  },
  instagram: {
    name: 'Instagram',
    primary: '#E1306C',
    secondary: '#833AB4',
    bg: '#121212',
    text: '#ffffff',
    accent: '#F77737',
    gradient: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
    icon: '◎',
    emoji: '📸',
  },
  pinterest: {
    name: 'Pinterest',
    primary: '#E60023',
    secondary: '#ffffff',
    bg: '#1a0000',
    text: '#ffffff',
    accent: '#E60023',
    gradient: 'linear-gradient(135deg, #E60023 0%, #a0001a 100%)',
    icon: '📌',
    emoji: '📌',
  },
  threads: {
    name: 'Threads',
    primary: '#0095f6',
    secondary: '#ffffff',
    bg: '#101010',
    text: '#ffffff',
    accent: '#0095f6',
    gradient: 'linear-gradient(135deg, #0095f6 0%, #0060c0 100%)',
    icon: '◎',
    emoji: '🧵',
  },
  facebook: {
    name: 'Facebook',
    primary: '#1877F2',
    secondary: '#ffffff',
    bg: '#0d1117',
    text: '#ffffff',
    accent: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0d5dbf 100%)',
    icon: 'f',
    emoji: '📘',
  },
  twitter: {
    name: 'X (Twitter)',
    primary: '#1DA1F2',
    secondary: '#ffffff',
    bg: '#15202b',
    text: '#ffffff',
    accent: '#1DA1F2',
    gradient: 'linear-gradient(135deg, #15202b 0%, #1a2940 100%)',
    icon: 'X',
    emoji: '🐦',
  },
  reddit: {
    name: 'Reddit',
    primary: '#FF4500',
    secondary: '#ffffff',
    bg: '#1a0d00',
    text: '#ffffff',
    accent: '#FF4500',
    gradient: 'linear-gradient(135deg, #FF4500 0%, #cc3700 100%)',
    icon: '◉',
    emoji: '🤖',
  },
  vimeo: {
    name: 'Vimeo',
    primary: '#1ab7ea',
    secondary: '#ffffff',
    bg: '#0d1b2a',
    text: '#ffffff',
    accent: '#1ab7ea',
    gradient: 'linear-gradient(135deg, #1ab7ea 0%, #0d8fbc 100%)',
    icon: '▷',
    emoji: '🎥',
  },
  dailymotion: {
    name: 'Dailymotion',
    primary: '#003f8a',
    secondary: '#ffffff',
    bg: '#000d1a',
    text: '#ffffff',
    accent: '#0066cc',
    gradient: 'linear-gradient(135deg, #003f8a 0%, #001f47 100%)',
    icon: '▶',
    emoji: '📹',
  },
  twitch: {
    name: 'Twitch',
    primary: '#9146FF',
    secondary: '#ffffff',
    bg: '#0e0e10',
    text: '#ffffff',
    accent: '#9146FF',
    gradient: 'linear-gradient(135deg, #9146FF 0%, #6441a5 100%)',
    icon: '◈',
    emoji: '🎮',
  },
  linkedin: {
    name: 'LinkedIn',
    primary: '#0A66C2',
    secondary: '#ffffff',
    bg: '#0a1628',
    text: '#ffffff',
    accent: '#0A66C2',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #064a96 100%)',
    icon: 'in',
    emoji: '💼',
  },
  snapchat: {
    name: 'Snapchat',
    primary: '#FFFC00',
    secondary: '#000000',
    bg: '#1a1900',
    text: '#FFFC00',
    accent: '#FFFC00',
    gradient: 'linear-gradient(135deg, #FFFC00 0%, #d4d100 100%)',
    icon: '◎',
    emoji: '👻',
  },
  unknown: {
    name: 'Video',
    primary: '#6366f1',
    secondary: '#ffffff',
    bg: '#0f0f1a',
    text: '#ffffff',
    accent: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    icon: '▶',
    emoji: '🎞',
  },
};

export function detectPlatform(url: string): Platform {
  if (!url) return 'unknown';
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('pinterest.com') || u.includes('pin.it')) return 'pinterest';
  if (u.includes('threads.net')) return 'threads';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  if (u.includes('reddit.com')) return 'reddit';
  if (u.includes('vimeo.com')) return 'vimeo';
  if (u.includes('dailymotion.com')) return 'dailymotion';
  if (u.includes('twitch.tv')) return 'twitch';
  if (u.includes('linkedin.com')) return 'linkedin';
  if (u.includes('snapchat.com')) return 'snapchat';
  return 'unknown';
}

export function getPlatformTheme(url: string): PlatformTheme {
  const platform = detectPlatform(url);
  return PLATFORM_THEMES[platform];
}
