
import { useToast as useHookToast } from "@/hooks/use-toast";
import { toast as hookToast } from "sonner";

// Re-export the toast from sonner directly
export const useToast = useHookToast;
export const toast = hookToast;
