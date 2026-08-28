"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { useToast } from "@/context/ToastContext";
import { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";

export default function AdminCategoriesPage() {
  const { categories, foods, addCategory, updateCategory, deleteCategory, toggleCategoryActive } = useCatalog();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  function foodCount(categoryId: string) {
    return foods.filter((f) => f.categoryId === categoryId).length;
  }

  function handleSubmit(data: Omit<Category, "id">) {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
      showToast(`${data.name} updated`, "success");
    } else {
      addCategory(data);
      showToast(`${data.name} added`, "success");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">{categories.length} categories</p>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <EmptyState icon={Tag} title="No categories yet" description="Add a category to start organizing your menu." />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
              <div className="relative h-28 w-full">
                <Image src={category.image} alt="" fill sizes="400px" className="object-cover" />
                <div className="absolute right-2.5 top-2.5">
                  <Badge variant={category.isActive ? "success" : "neutral"}>
                    {category.isActive ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="font-display text-base font-semibold text-ink-900">{category.name}</p>
                <p className="mt-0.5 text-sm text-ink-500">{category.description}</p>
                <p className="mt-2 text-xs text-ink-400">{foodCount(category.id)} items</p>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => toggleCategoryActive(category.id)}
                    role="switch"
                    aria-checked={category.isActive}
                    aria-label={`Toggle visibility for ${category.name}`}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      category.isActive ? "bg-success-500" : "bg-ink-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        category.isActive ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setIsFormOpen(true);
                      }}
                      aria-label={`Edit ${category.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(category)}
                      aria-label={`Delete ${category.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialCategory={editingCategory}
      />

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => {
          if (deletingCategory) {
            deleteCategory(deletingCategory.id);
            showToast(`${deletingCategory.name} deleted`, "info");
          }
        }}
        title="Delete category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? Foods in this category will remain but lose their category label.`}
      />
    </div>
  );
}
