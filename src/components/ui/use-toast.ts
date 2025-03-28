
import { useToast as useHookToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Re-export the toast from sonner directly
export const useToast = useHookToast;

// Export toast with Sonner's API signature to ensure consistent usage
export const toast = sonnerToast;
