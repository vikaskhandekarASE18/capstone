import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = 'Something went wrong.', onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Oops!</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description = '',
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-500 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
