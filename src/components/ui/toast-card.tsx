import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import toast, { type Toast } from "react-hot-toast";

export interface IToastCard {
  id: Toast["id"];
  status?: "success" | "error" | "warning" | "info";
  title: string;
  text?: string;
  className?: string;
}

const statusBorder: Record<NonNullable<IToastCard["status"]>, string> = {
  success: "border-green-default",
  error: "border-black-default",
  warning: "border-yellow-darker",
  info: "border-blue-default",
};

function ToastCard({
  id,
  status = "success",
  title,
  text,
  className,
}: Readonly<IToastCard>) {
  return (
    <div
      className={cn(
        "rounded-default pointer-events-auto flex w-full justify-between gap-6 border-b-[0.1875rem] bg-white p-6 px-4 py-3 shadow-[0_0.5rem_3rem_-1rem_rgba(0,0,0,0.40)] lg:ml-auto lg:w-[22.5rem] lg:shadow-[0_0.5rem_3rem_-0.75rem_rgba(0,0,0,0.12)]",
        statusBorder[status],
        className,
      )}
    >
      <div className="flex flex-col gap-[0.25rem]">
        <span className="text-title-light font-semibold">{title}</span>
        <p className="text-[0.8125rem]">{text}</p>
      </div>
      <button
        className="cursor-pointer"
        type="button"
        onClick={() => toast.dismiss(id)}
      >
        <Icon size={24} name="close" />
      </button>
    </div>
  );
}

export { ToastCard };
