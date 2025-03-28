
import { toast } from "sonner";

// Re-export toast from sonner directly
export { toast };

// Also export useToast from our custom hook for backwards compatibility
export { useToast } from "@/hooks/use-toast";
