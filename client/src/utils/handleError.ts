import { toast } from "react-toastify";

export function handleError(error: unknown, defaultMessage: string) {
  console.error(error);

  // Handle Axios error structure
  if (typeof error === "object" && error !== null) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string | string[];
          error?: string;
        };
      };
      message?: string;
    };

    // Check for array message in response
    if (Array.isArray(axiosError?.response?.data?.message)) {
      toast.error(axiosError.response.data.message[0] || defaultMessage);
      return;
    }

    // Check for string message in response
    if (typeof axiosError?.response?.data?.message === "string") {
      toast.error(axiosError.response.data.message || defaultMessage);
      return;
    }

    // Check for error field in response
    if (axiosError?.response?.data?.error) {
      toast.error(axiosError.response.data.error || defaultMessage);
      return;
    }

    // Check for top-level message
    if (axiosError.message) {
      toast.error(axiosError.message || defaultMessage);
      return;
    }
  }

  // Fallback to default message
  toast.error(defaultMessage);
}
