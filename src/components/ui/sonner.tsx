import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#FAF8F5] dark:group-[.toaster]:bg-[#1E1C1A] group-[.toaster]:text-neutral-900 dark:group-[.toaster]:text-neutral-100 group-[.toaster]:border-[#EFECE6] dark:group-[.toaster]:border-[#2E2C2A] group-[.toaster]:shadow-[0_8px_30px_rgba(0,0,0,0.06)] group-[.toaster]:rounded-[20px] font-sans p-4 border",
          description: "group-[.toast]:text-neutral-600 dark:group-[.toast]:text-neutral-400 text-xs font-semibold",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground rounded-none",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground rounded-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
