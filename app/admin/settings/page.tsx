"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { defaultRestaurantSettings } from "@/data/restaurant";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { RestaurantSettings } from "@/types";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<RestaurantSettings>(defaultRestaurantSettings);

  function updateHours(day: string, field: "isOpen" | "open" | "close", value: string | boolean) {
    setSettings((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((h) => (h.day === day ? { ...h, [field]: value } : h)),
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    showToast("Settings saved (mock — not persisted to a server)", "success");
  }

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-6">
      {/* Restaurant information */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink-900">Restaurant Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Restaurant name"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          />
          <Input
            label="Phone"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          />
          <Input
            label="Address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>
      </section>

      {/* Opening hours */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink-900">Opening Hours</h2>
        <div className="mt-4 space-y-2.5">
          {settings.openingHours.map((h) => (
            <div key={h.day} className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 p-3">
              <span className="w-24 shrink-0 text-sm font-medium text-ink-800">{h.day}</span>
              <label className="flex items-center gap-2 text-sm text-ink-600">
                <input
                  type="checkbox"
                  checked={h.isOpen}
                  onChange={(e) => updateHours(h.day, "isOpen", e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-ember-500 focus:ring-ember-400"
                />
                Open
              </label>
              {h.isOpen ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    type="time"
                    value={h.open}
                    onChange={(e) => updateHours(h.day, "open", e.target.value)}
                    className="h-9 rounded-lg border border-ink-200 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-400/50"
                    aria-label={`${h.day} opening time`}
                  />
                  <span className="text-sm text-ink-400">to</span>
                  <input
                    type="time"
                    value={h.close}
                    onChange={(e) => updateHours(h.day, "close", e.target.value)}
                    className="h-9 rounded-lg border border-ink-200 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ember-400/50"
                    aria-label={`${h.day} closing time`}
                  />
                </div>
              ) : (
                <span className="text-sm text-ink-400">Closed</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink-900">Restaurant Preferences</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="Currency"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
          >
            <option value="BDT">BDT (৳)</option>
            <option value="USD">USD ($)</option>
          </Select>
          <Input
            label="Delivery fee (৳)"
            type="number"
            min={0}
            value={settings.deliveryFee}
            onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
          />
          <Input
            label="Minimum order (৳)"
            type="number"
            min={0}
            value={settings.minimumOrder}
            onChange={(e) => setSettings({ ...settings, minimumOrder: Number(e.target.value) })}
          />
        </div>
      </section>

      <Button type="submit">
        <Save className="h-4 w-4" /> Save Settings
      </Button>
    </form>
  );
}
