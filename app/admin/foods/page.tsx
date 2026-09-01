"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { Food } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FoodFormModal } from "@/components/admin/FoodFormModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";

export default function AdminFoodsPage() {
  const { foods, categories, isLoading, error, addFood, updateFood, deleteFood, toggleFoodAvailability } =
    useCatalog();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function openAddForm() {
    setEditingFood(null);
    setIsFormOpen(true);
  }

  function openEditForm(food: Food) {
    setEditingFood(food);
    setIsFormOpen(true);
  }

  async function handleSubmit(data: Omit<Food, "id" | "rating" | "reviewCount">) {
    if (editingFood) {
      await updateFood(editingFood.id, data);
      showToast(`${data.name} updated`, "success");
    } else {
      await addFood(data);
      showToast(`${data.name} added to the menu`, "success");
    }
  }

  async function handleToggleAvailability(food: Food) {
    setTogglingId(food.id);
    try {
      await toggleFoodAvailability(food.id);
      showToast(`${food.name} marked as ${food.isAvailable ? "unavailable" : "available"}`, "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't update availability", "error");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(food: Food) {
    try {
      await deleteFood(food.id);
      showToast(`${food.name} removed from the menu`, "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't delete this food", "error");
    }
  }

  function categoryName(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.name ?? "Uncategorized";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">{isLoading ? "Loading…" : `${foods.length} items on the menu`}</p>
        <Button onClick={openAddForm}>
          <Plus className="h-4 w-4" /> Add New Food
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-600">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={UtensilsCrossed}
              title="No foods yet"
              description="Add your first dish to start building the menu."
              action={<Button onClick={openAddForm}>Add New Food</Button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                  <th className="py-3 pl-5 pr-4 font-medium">Food</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">Availability</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-5 pl-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food.id} className="border-b border-ink-50 last:border-none hover:bg-ink-50/50">
                    <td className="py-3 pl-5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                          <Image src={food.image} alt="" fill sizes="44px" className="object-cover" />
                        </div>
                        <span className="font-medium text-ink-900">{food.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-ink-600">{categoryName(food.categoryId)}</td>
                    <td className="py-3 pr-4 font-medium text-ink-900">{formatCurrency(food.price)}</td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleToggleAvailability(food)}
                        disabled={togglingId === food.id}
                        role="switch"
                        aria-checked={food.isAvailable}
                        aria-label={`Toggle availability for ${food.name}`}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                          food.isAvailable ? "bg-success-500" : "bg-ink-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            food.isAvailable ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={food.isAvailable ? "success" : "neutral"}>
                        {food.isAvailable ? "Active" : "Sold out"}
                      </Badge>
                    </td>
                    <td className="py-3 pl-4 pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(food)}
                          aria-label={`Edit ${food.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingFood(food)}
                          aria-label={`Delete ${food.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FoodFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        categories={categories}
        initialFood={editingFood}
      />

      <ConfirmDialog
        isOpen={!!deletingFood}
        onClose={() => setDeletingFood(null)}
        onConfirm={() => {
          if (deletingFood) handleDelete(deletingFood);
        }}
        title="Delete food item"
        description={`Are you sure you want to delete "${deletingFood?.name}"? This can't be undone.`}
      />
    </div>
  );
}
