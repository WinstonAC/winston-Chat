import type { CommandCenterAppliedAction } from '../lib/command-center-bridge';

interface AppliedActionChipsProps {
  applied: CommandCenterAppliedAction[];
}

export default function AppliedActionChips({ applied }: AppliedActionChipsProps) {
  if (!applied.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {applied.map((item, index) => (
        <span
          key={`${item.type}-${index}`}
          title={item.detail}
          className={`inline-flex max-w-full items-center rounded-full px-3 py-1 text-xs ${
            item.success
              ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
              : 'bg-red-50 text-red-800 ring-1 ring-red-200'
          }`}
        >
          {item.success ? '✓' : '✗'} {item.label}
        </span>
      ))}
    </div>
  );
}
