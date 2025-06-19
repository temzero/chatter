// components/ui/ErrorView.tsx
// import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

const ErrorView = ({ message, onRetry }: ErrorViewProps) => (
  <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
    {/* <ExclamationTriangleIcon className="h-12 w-12 mb-4" /> */}
    <p className="text-lg font-medium">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-100 rounded-md text-red-700 hover:bg-red-200 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorView;
