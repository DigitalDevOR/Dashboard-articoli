import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return "Oggi";
  } else if (diffInDays === 1) {
    return "Domani";
  } else if (diffInDays > 1 && diffInDays < 7) {
    return `Fra ${diffInDays} giorni`;
  } else {
    return formatDate(date);
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getLeagueIcon(leagueName: string): string {
  // This would ideally be replaced with actual league icons
  // For this demo, we'll return placeholder icons based on league name
  const normalizedName = leagueName.toLowerCase();
  
  if (normalizedName.includes('serie a')) {
    return 'ri-award-fill';
  } else if (normalizedName.includes('serie b')) {
    return 'ri-award-line';
  } else if (normalizedName.includes('premier')) {
    return 'ri-football-fill';
  } else if (normalizedName.includes('champions')) {
    return 'ri-trophy-fill';
  } else if (normalizedName.includes('liga')) {
    return 'ri-flag-2-fill';
  } else {
    return 'ri-football-line';
  }
}

export function getBadgeIcon(iconName: string): string {
  switch (iconName) {
    case 'trophy':
      return 'ri-trophy-line';
    case 'profile':
      return 'ri-profile-line';
    case 'football':
      return 'ri-football-line';
    case 'award':
      return 'ri-award-line';
    default:
      return 'ri-medal-line';
  }
}

export function generateSuccessRate(correct: number, total: number): string {
  if (total === 0) return '0%';
  return Math.round((correct / total) * 100) + '%';
}
