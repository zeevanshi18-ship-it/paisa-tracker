import { useState } from 'react';

interface AvatarDisplayProps {
  name: string;
  avatarUrl: string;
  sizeClass?: string;
}

export function AvatarDisplay({
  name,
  avatarUrl,
  sizeClass = 'h-9 w-9 text-xs',
}: AvatarDisplayProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'PT';

  const showInitials = !avatarUrl || avatarUrl === 'initials' || imgFailed;

  if (showInitials) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-emerald-600 font-display font-semibold text-white ${sizeClass}`}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={`${name} profile`}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className={`shrink-0 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 ${sizeClass}`}
    />
  );
}
