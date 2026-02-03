// @/common/hooks/useChatBarKeydown.ts
import { useCallback, RefObject } from 'react';
import { useKeyDown } from '@/common/hooks/keyEvent/useKeydown';
import { useKeyHold } from '@/common/hooks/useKeyHold';

interface UseChatBarKeydownParams {
  // Refs
  inputRef: RefObject<HTMLTextAreaElement>;
  
  // State
  canSend: boolean;
  isRecordMode: boolean;
  chatId?: string;
  
  // Actions
  handleSend: () => Promise<void> | void;
  setIsRecordMode: (mode: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  resetVoiceState: () => void;
  setHasVoiceRecording: (hasRecording: boolean) => void;
  setHasTextContent: (hasContent: boolean) => void;
  setDraftMessage?: (chatId: string, content: string) => void;
  resetPreview?: () => void;
}

export const useChatBarKeydown = ({
  inputRef,
  canSend,
  isRecordMode,
  chatId,
  handleSend,
  setIsRecordMode,
  setIsRecording,
  resetVoiceState,
  setHasVoiceRecording,
  setHasTextContent,
  setDraftMessage,
  resetPreview,
}: UseChatBarKeydownParams) => {
  
  const clearInput = useCallback(() => {
    if (!inputRef.current) return;
    
    // Clear text content
    inputRef.current.value = "";
    
    // Clear draft if chatId provided
    if (chatId && setDraftMessage) {
      setDraftMessage(chatId, "");
    }
    
    // Exit record mode if active
    if (isRecordMode) {
      setIsRecordMode(false);
    }
    
    // Reset states
    setHasTextContent(false);
    setHasVoiceRecording(false);
    
    // Reset preview if provided
    if (resetPreview) {
      resetPreview();
    }
  }, [
    inputRef, 
    chatId, 
    isRecordMode, 
    setIsRecordMode, 
    setHasTextContent, 
    setHasVoiceRecording, 
    setDraftMessage, 
    resetPreview
  ]);

  // 1. Slash (/) to focus input
  useKeyDown(
    useCallback((e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }, [inputRef]),
    ["/"]
  );

  // 2. ContextMenu key for file input
  useKeyDown(
    useCallback(() => {
      if (document.activeElement === inputRef.current) {
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.accept = "*";
          fileInput.click();
        }
      }
    }, [inputRef]),
    ["ContextMenu"]
  );

  // 3. Enter to send message (without Shift)
  useKeyDown(
    useCallback((e: KeyboardEvent) => {
      if (!canSend) return;
      
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }, [canSend, handleSend]),
    ["Enter"],
    { preventDefault: true }
  );

  // 4. Escape to clear/reset
  useKeyDown(
    useCallback(() => {
      if (isRecordMode) {
        resetVoiceState();
        setHasVoiceRecording(false);
      } else {
        clearInput();
      }
    }, [isRecordMode, resetVoiceState, setHasVoiceRecording, clearInput]),
    ["Escape"]
  );

  // 5. Backtick (`) hold for voice recording
  useKeyHold(
    "`",
    useCallback(() => {
      setIsRecordMode(true);
      setIsRecording(true);
    }, [setIsRecordMode, setIsRecording]),
    useCallback(() => {
      setIsRecording(false);
    }, [setIsRecording])
  );

  // Return input-specific handler for direct attachment
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearInput();
      }
      // Note: Shift+Enter for new line works by default
      // Enter without Shift is handled globally above
    },
    [clearInput]
  );

  return {
    handleInputKeyDown,
    clearInput,
  };
};