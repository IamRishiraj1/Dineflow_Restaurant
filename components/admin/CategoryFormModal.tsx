"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Category, "id">) => void;
  initialCategory?: Category | null;
}

const EMPTY_FORM = { name: "", description: "", image: "", isActive: true };

export function CategoryFormModal({ isOpen, onClose, onSubmit, initialCategory }: CategoryFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialCategory) {
      setForm({
        name: initialCategory.name,
        description: initialCategory.description,
        image: initialCategory.image,
        isActive: initialCategory.isActive,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialCategory, isOpen]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Category name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      slug: form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: form.description.trim(),
      image:
        form.image.trim() ||
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop",
      isActive: form.isActive,
    });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialCategory ? "Edit Category" : "Add Category"} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Burgers"
        />
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short tagline shown on the category card"
        />
        <Input
          label="Image URL"
          hint="Leave blank to use a placeholder image"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="https://…"
        />
        <label className="flex items-center gap-2.5 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-ink-300 text-ember-500 focus:ring-ember-400"
          />
          Visible to customers
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {initialCategory ? "Save Changes" : "Add Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
