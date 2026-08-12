"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { transactionFormSchema, TransactionFormValues } from "@/lib/schemas";
import { api, ApiError } from "@/lib/api";
import type { Category, Transaction } from "@/lib/types";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onCreated: (transaction: Transaction) => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function AddTransactionModal({ open, onClose, categories, onCreated }: AddTransactionModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
      description: "",
      date: todayIso(),
      type: "EXPENSE",
      categoryId: "",
    },
  });

  const selectedType = watch("type");
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType]
  );

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = async (values: TransactionFormValues) => {
    setServerError(null);
    try {
      const res = await api.post<Transaction>("/transactions", values);
      onCreated(res.data);
      handleClose();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong");
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Transaction">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select label="Type" {...register("type")} error={errors.type?.message}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </Select>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("amount")}
          error={errors.amount?.message}
        />

        <Input
          label="Description"
          placeholder="e.g. Grocery shopping"
          {...register("description")}
          error={errors.description?.message}
        />

        <Input label="Date" type="date" {...register("date")} error={errors.date?.message} />

        <Select label="Category" {...register("categoryId")} error={errors.categoryId?.message}>
          <option value="">Select a category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </Select>

        {serverError && <p className="text-sm text-expense">{serverError}</p>}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
