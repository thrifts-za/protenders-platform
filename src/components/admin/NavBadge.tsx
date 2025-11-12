/**
 * Navigation Badge Component
 * Displays unread count badges (like WhatsApp) on admin navigation items
 */

interface NavBadgeProps {
  count: number;
  className?: string;
}

export function NavBadge({ count, className = '' }: NavBadgeProps) {
  if (count === 0) return null;

  // Format count (99+ for large numbers)
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <span
      className={`ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full ${className}`}
      title={`${count} unread`}
    >
      {displayCount}
    </span>
  );
}
