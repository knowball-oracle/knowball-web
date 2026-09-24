const PALETTE = [
  'bg-red-500/15 text-red-400 border-red-500/25',
  'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'bg-pink-500/15 text-pink-400 border-pink-500/25',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'bg-orange-500/15 text-orange-400 border-orange-500/25',
];

export function teamInitials(name: string | undefined | null): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function teamAvatarColorClass(name: string | undefined | null): string {
  if (!name) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
