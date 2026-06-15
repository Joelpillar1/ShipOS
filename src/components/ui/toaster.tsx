import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

function getToastIcon(variant?: string, title?: any, description?: any) {
  const isDestructive = variant === "destructive";
  const titleText = typeof title === 'string' ? title.toLowerCase() : '';
  const descText = typeof description === 'string' ? description.toLowerCase() : '';
  
  const isSuccess = 
    titleText.includes("success") || 
    titleText.includes("created") || 
    titleText.includes("deleted") || 
    titleText.includes("updated") || 
    titleText.includes("saved") ||
    titleText.includes("added") ||
    titleText.includes("complete") ||
    titleText.includes("sent") ||
    descText.includes("successfully") ||
    descText.includes("success");

  if (isDestructive) {
    return (
      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm font-sans">
        <span className="text-[11px] font-black leading-none">!</span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm font-sans">
        <span className="text-[11px] font-black leading-none">✓</span>
      </div>
    );
  }

  // Warning/Default: solid black circle with white '!'
  return (
    <div className="w-5 h-5 rounded-full bg-[#18181B] flex items-center justify-center text-white shrink-0 shadow-sm font-sans">
      <span className="text-[11px] font-black leading-none">!</span>
    </div>
  );
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {getToastIcon(props.variant, title, description)}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                {title && <ToastTitle className="text-xs font-black uppercase tracking-wider leading-tight text-neutral-900 dark:text-neutral-100">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-xs font-semibold leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
