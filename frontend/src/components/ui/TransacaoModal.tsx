"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import api from "@/lib/api";
import { Transacao } from "@/types";

const schema = z.object({
  descricao: z.string().min(1, "Obrigatório"),
  valor: z.coerce.number().positive("Deve ser maior que zero"),
  tipo: z.enum(["RECEITA", "DESPESA"]),
  categoria: z.string().optional(),
  data: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  transacao?: Transacao | null;
  onClose: () => void;
  onSalvo: () => void;
}

export default function TransacaoModal({ transacao, onClose, onSalvo }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: "DESPESA" },
  });

  useEffect(() => {
    if (transacao) {
      reset({
        descricao: transacao.descricao,
        valor: Number(transacao.valor),
        tipo: transacao.tipo,
        categoria: transacao.categoria ?? "",
        data: transacao.data?.slice(0, 10),
      });
    }
  }, [transacao, reset]);

  async function onSubmit(data: FormData) {
    try {
      if (transacao) {
        await api.put(`/transacoes/${transacao.id}`, data);
      } else {
        await api.post("/transacoes", data);
      }
      onSalvo();
      onClose();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {transacao ? "Editar Transação" : "Nova Transação"}
          </h2>
          <button onClick={onClose} className="text-subtle hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-subtle mb-1.5">Tipo</label>
            <select {...register("tipo")} className="input">
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-subtle mb-1.5">Descrição</label>
            <input {...register("descricao")} placeholder="Ex: Salário, Aluguel..." className="input" />
            {errors.descricao && <p className="text-danger text-xs mt-1">{errors.descricao.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-subtle mb-1.5">Valor (R$)</label>
            <input {...register("valor")} type="number" step="0.01" placeholder="0,00" className="input" />
            {errors.valor && <p className="text-danger text-xs mt-1">{errors.valor.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-subtle mb-1.5">Categoria</label>
            <input {...register("categoria")} placeholder="Ex: Alimentação, Moradia..." className="input" />
          </div>

          <div>
            <label className="block text-sm text-subtle mb-1.5">Data</label>
            <input {...register("data")} type="date" className="input" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
