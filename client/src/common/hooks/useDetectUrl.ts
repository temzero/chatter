import { useEffect, useRef, useState } from "react";
import { extractFirstUrl } from "@/shared/extractFirstUrl";
import { debounce } from "@/common/utils/debounce";

export function useDetectUrl(delay = 300) {
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const debouncedDetectRef = useRef<
    ((value: string) => void) & { cancel?: () => void }
  >(null);

  useEffect(() => {
    debouncedDetectRef.current = debounce((value: string) => {
      const url = extractFirstUrl(value);

      if (url) {
        setDetectedUrl(url);
        setShowPreview(true);
      } else {
        setDetectedUrl(null);
        setShowPreview(false);
      }
    }, delay);

    return () => {
      debouncedDetectRef.current?.cancel?.();
    };
  }, [delay]);

  const detectFromText = (value: string) => {
    // optional: instant hide for better UX
    if (!value.includes("http")) {
      setDetectedUrl(null);
      setShowPreview(false);
    }

    debouncedDetectRef.current?.(value);
  };

  const resetPreview = () => {
    setDetectedUrl(null);
    setShowPreview(false);
    debouncedDetectRef.current?.cancel?.();
  };

  return {
    detectedUrl,
    showPreview,
    detectFromText,
    resetPreview,
  };
}
