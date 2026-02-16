import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { Button } from './ui';

interface FormFeedbackProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'info';
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  actionText?: string;
  showRetry?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const FormFeedback: React.FC<FormFeedbackProps> = ({
  status,
  message,
  onRetry,
  onDismiss,
  actionText = 'Try Again',
  showRetry = false,
  autoHide = false,
  autoHideDelay = 5000,
}) => {
  React.useEffect(() => {
    if (autoHide && (status === 'success' || status === 'info') && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [status, autoHide, autoHideDelay, onDismiss]);

  if (status === 'idle' || !message) return null;

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 size={20} className="animate-spin text-blue-600 flex-shrink-0" />;
      case 'success':
        return <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600 flex-shrink-0" />;
      case 'info':
        return <Info size={20} className="text-blue-600 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-800';
      case 'success':
        return 'text-emerald-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`
      mt-4 p-4 rounded-2xl border-2 transition-all duration-300
      ${getBackgroundColor()}
      animate-in fade-in-0 slide-in-from-top-1
    `}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className={`font-medium ${getTextColor()}`}>
            {message}
          </p>

          {(showRetry && status === 'error' && onRetry) && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                {actionText}
              </Button>
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-red-600 hover:text-red-800"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}

          {onDismiss && status !== 'loading' && !showRetry && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className={`
                  ${status === 'error' ? 'text-red-600 hover:text-red-800' :
                    status === 'success' ? 'text-emerald-600 hover:text-emerald-800' :
                    'text-blue-600 hover:text-blue-800'}
                `}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProgressFeedbackProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
  errorSteps: number[];
}

export const ProgressFeedback: React.FC<ProgressFeedbackProps> = ({
  steps,
  currentStep,
  completedSteps,
  errorSteps,
}) => {
  return (
    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
      <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest">
        Progress
      </h4>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isError = errorSteps.includes(index);
          const isCurrent = currentStep === index;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isCompleted ? 'bg-emerald-500 text-white' :
                  isError ? 'bg-red-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' :
                  'bg-slate-300 text-slate-600'}
              `}>
                {isCompleted ? (
                  <CheckCircle2 size={12} />
                ) : isError ? (
                  <AlertCircle size={12} />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`
                text-sm font-medium
                ${isCompleted ? 'text-emerald-700' :
                  isError ? 'text-red-700' :
                  isCurrent ? 'text-blue-700' :
                  'text-slate-600'}
              `}>
                {step}
              </span>
              {isCurrent && !isCompleted && !isError && (
                <Loader2 size={16} className="animate-spin text-blue-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface FormStatusBarProps {
  title: string;
  subtitle?: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  progress?: number;
  showProgress?: boolean;
}

export const FormStatusBar: React.FC<FormStatusBarProps> = ({
  title,
  subtitle,
  status,
  progress = 0,
  showProgress = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-600';
      case 'success':
        return 'bg-emerald-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className={`
          w-3 h-3 rounded-full
          ${status === 'loading' ? 'animate-pulse' : ''}
          ${getStatusColor()}
        `} />
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`
              h-2 rounded-full transition-all duration-500 ease-out
              ${getStatusColor()}
            `}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
