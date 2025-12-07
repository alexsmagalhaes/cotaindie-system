import { Icon } from "@/components/ui/icon";

export const OrderEmptyTable = ({
  title,
  text,
  ...props
}: {
  title: string;
  text: string;
} & React.ComponentProps<"button">) => {
  return (
    <button
      className="rounded-default border-b-light flex w-full cursor-pointer flex-col items-center gap-1 border border-dashed bg-[#E6E6E650] px-4 py-6 text-center hover:bg-[#F0F0EC] lg:px-6 lg:py-8"
      type="button"
      {...props}
    >
      <Icon name="add_2" size={24} className="text-red-default" />
      <div className="text-title-light font-semibold">{title}</div>
      <p>{text}</p>
    </button>
  );
};
