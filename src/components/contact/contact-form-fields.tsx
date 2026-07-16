"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactPageFormValues } from "@/lib/validations/contact";

type Props = {
  form: UseFormReturn<ContactPageFormValues>;
  /** Rows for the message textarea. Modals use a shorter box than the full page. */
  messageRows?: number;
  /**
   * Extra classes for the message textarea. The modal passes a fixed height so
   * the box scrolls internally instead of growing as more lines are added.
   */
  messageClassName?: string;
};

/**
 * Shared field set for the contact form. Used by both the `/contact` page form
 * and the listing inquiry modal so validation and markup stay in one place.
 */
export function ContactFormFields({ form, messageRows = 6, messageClassName }: Props) {
  return (
    <FieldGroup>
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="Your name"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              placeholder="your.email@example.com"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
            <Input
              {...field}
              value={field.value ?? ""}
              id={field.name}
              type="tel"
              placeholder="(optional)"
              aria-invalid={fieldState.invalid}
            />
            <FieldDescription>Optional — share this if you’d prefer a call back.</FieldDescription>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="subject"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Subject</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="What's this about?"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="message"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Message</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              rows={messageRows}
              placeholder="Tell me a bit about what you're looking for..."
              aria-invalid={fieldState.invalid}
              className={messageClassName}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Honeypot field: hidden from humans, filled by bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          {...form.register("honeypot")}
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
    </FieldGroup>
  );
}
