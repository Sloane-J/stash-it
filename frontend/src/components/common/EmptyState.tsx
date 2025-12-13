// src/components/common/EmptyState.tsx

import type { LucideProps } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {/* Icon */}
      <div className="empty-state-icon">
        <Icon className="w-full h-full" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="empty-state-title">
        {title}
      </h2>

      {/* Description */}
      <p className="empty-state-description">
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              size="lg"
              className="touch-target"
            >
              {actionLabel}
            </Button>
          )}
          
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size="lg"
              className="touch-target"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}