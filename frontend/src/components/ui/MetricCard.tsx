import { LucideIcon } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";

interface Props {
  label: string;
  valor: number;
  icon: LucideIcon;
  cor?: "default" | "green" | "red";
}

const cores = {
  default: "text-text",
  green: "text-accent",
  red: "text-danger",
};

export default function MetricCard({ label, valor, icon: Icon, cor = "default" }: Props) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-subtle text-xs uppercase tracking-widest mb-2">{label}</p>
        <p className={`text-2xl font-bold font-mono ${cores[cor]}`}>
          {formatarMoeda(valor)}
        </p>
      </div>
      <div className="p-2 bg-white/5 rounded-lg">
        <Icon size={18} className="text-subtle" />
      </div>
    </div>
  );
}
