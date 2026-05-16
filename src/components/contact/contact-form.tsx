"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactPageFormSchema, type ContactPageFormValues } from "@/lib/validations/contact";

/**
 * Contact form for the public `/contact` page. Handles user input,
 * client-side validation, and submission to `/api/contact`.
 *
 * @returns JSX for the contact form.
 */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ContactPageFormValues>({
    resolver: zodResolver(contactPageFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      honeypot: "",
    },
  });

  const handleSubmit = async (values: ContactPageFormValues) => {
    setStatus("submitting");
    setErrorMessage(null);
    console.log("Form submitted with values:", values);

    try {
      // Simulate a 1-second network call.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // DEV-ONLY: simulate a failure if the email contains "fail".
      // Remove this when wiring up the real API in Step 2.
      if (values.email === "fail@test.com") {
        throw new Error("Simulated submission failure");
      }

      console.log("Fake submission complete.");
      setStatus("success");
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setErrorMessage(
        "Something went wrong sending your message. Please try again, or call directly if it's urgent.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center sm:p-12">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Message sent</h2>
        <p className="mx-auto mt-3 max-w-md text-zinc-600">
          Thanks for reaching out. I’ll get back to you within a day. In the meantime, feel free to
          give me a call if anything’s urgent.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Send a message</h2>
      <p className="mt-1 text-sm text-zinc-500">I usually reply within a day.</p>

      <form className="mt-6" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
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
                <FieldDescription>
                  Optional — share this if you’d prefer a call back.
                </FieldDescription>
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
                  rows={6}
                  placeholder="Tell me a bit about what you're looking for..."
                  aria-invalid={fieldState.invalid}
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

          {status === "error" && errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {errorMessage}
            </div>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={status === "submitting"}>
            {status === "submitting" ? "Sending..." : "Send Message"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
