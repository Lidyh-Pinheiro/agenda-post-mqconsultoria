
import { useToast as useHookToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Re-export elementos do hook de toast para manter compatibilidade
export const useToast = useHookToast;

// Exporta a função toast diretamente da biblioteca sonner
export const toast = sonnerToast;
