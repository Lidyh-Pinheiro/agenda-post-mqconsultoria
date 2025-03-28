
import { useToast as useHookToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Re-export elements from the hook for compatibility
export const useToast = useHookToast;

// Export the toast function directly from sonner library
export const toast = sonnerToast;
