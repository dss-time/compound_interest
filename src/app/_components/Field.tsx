import { HelpTip } from "@/app/_components/HelpTip";

type FieldProps = {
  label: string;
  help?: string;
  children: React.ReactNode;
  inline?: boolean;
  error?: string;
};

export function Field({ label, help, children, inline = false, error }: FieldProps) {
  return (
    <div className={inline ? "grid gap-2" : "grid gap-2"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{label}</span>
        {help ? <HelpTip text={help} /> : null}
      </div>
      {children}
      {error ? <div className="text-xs text-rose-500">{error}</div> : null}
    </div>
  );
}
