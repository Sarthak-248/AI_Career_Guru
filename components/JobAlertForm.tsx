"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const alertSchema = z.object({
  titleQuery: z
    .string()
    .min(3, "Please describe the kind of role you want to track."),
  location: z.string().optional(),
  skills: z.string().optional(),
  experienceLevel: z.enum(["ENTRY", "MID", "SENIOR"]).default("MID"),
  frequency: z.enum(["IMMEDIATE", "DAILY", "WEEKLY"]).default("DAILY"),
  remotePreference: z
    .enum(["FLEXIBLE", "REMOTE", "ONSITE", "HYBRID"])
    .default("FLEXIBLE"),
});

type FormValues = z.infer<typeof alertSchema>;

type Props = {
  onCreated?: () => void;
  className?: string;
};

export function JobAlertForm({ onCreated, className }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      titleQuery: "",
      location: "",
      skills: "",
      experienceLevel: "MID",
      frequency: "DAILY",
      remotePreference: "FLEXIBLE",
    },
  });

  const handleSubmit = (values: FormValues) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/alerts/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error ?? "Unable to save alert.");
        }

        form.reset();
        setSuccess("Alert saved! We'll start matching in the next run.");
        onCreated?.();
      } catch (err: any) {
        setError(err.message ?? "Failed to save alert.");
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className={cn("space-y-4 rounded-xl border p-6", className)}
    >
      <div>
        <Label htmlFor="titleQuery">Role keywords *</Label>
        <Input
          id="titleQuery"
          placeholder="e.g. Senior Frontend Engineer"
          {...form.register("titleQuery")}
        />
        {form.formState.errors.titleQuery && (
          <p className="text-sm text-red-500">
            {form.formState.errors.titleQuery.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, Country"
            {...form.register("location")}
          />
        </div>
        <div>
          <Label htmlFor="remotePreference">Remote preference</Label>
          <Select
            value={form.watch("remotePreference")}
            onValueChange={(value) =>
              form.setValue("remotePreference", value as FormValues["remotePreference"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Remote flexibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FLEXIBLE">Flexible / Either</SelectItem>
              <SelectItem value="REMOTE">Remote only</SelectItem>
              <SelectItem value="ONSITE">On-site only</SelectItem>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="skills">Skills (comma separated)</Label>
        <Textarea
          id="skills"
          placeholder="React, Node.js, GraphQL"
          {...form.register("skills")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="experienceLevel">Experience level</Label>
          <Select
            value={form.watch("experienceLevel")}
            onValueChange={(value) =>
              form.setValue("experienceLevel", value as FormValues["experienceLevel"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTRY">Entry / Junior</SelectItem>
              <SelectItem value="MID">Mid</SelectItem>
              <SelectItem value="SENIOR">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={form.watch("frequency")}
            onValueChange={(value) =>
              form.setValue("frequency", value as FormValues["frequency"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Alert cadence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMMEDIATE">Immediate</SelectItem>
              <SelectItem value="DAILY">Daily digest</SelectItem>
              <SelectItem value="WEEKLY">Weekly digest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button type="submit" disabled={isPending} className="w-full md:w-auto">
        {isPending ? "Saving..." : "Create alert"}
      </Button>
    </form>
  );
}



