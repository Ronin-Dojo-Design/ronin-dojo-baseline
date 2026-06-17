"use client"

import type {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/common/form"
import { FormMedia } from "~/components/common/form-media"
import { Input } from "~/components/common/input"
import { TextArea } from "~/components/common/textarea"

/**
 * Shared form-field primitives (SESSION_0400, D-023 / ADR 0025).
 *
 * Thin wrappers that each compose the Dirstarter L1 form parts —
 * `FormField` + `FormItem` + `FormLabel` + `FormControl` + the matching input
 * primitive + `FormMessage` — so the identity-edit surfaces (the canonical
 * `PassportEditor` and the lineage-node profile form) render their plain
 * text/date/avatar fields from ONE place instead of hand-rolling the same block
 * each. Pure presentation; no behaviour of their own.
 *
 * Each primitive is generic over `FieldValues` (mirroring `FormMedia`) so it
 * serves forms built with both `useForm<T>` (typed control) and
 * `useHookFormAction` (`UseFormReturn<any>`).
 */

/** Coerce null/undefined to empty string for HTML inputs. */
const str = (v: string | null | undefined) => v ?? ""

const toDateInputValue = (value: Date | string | null | undefined) => {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  // `slice(0, 10)` of an ISO string is the `yyyy-mm-dd` the date input wants.
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------

type TextFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  maxLength?: number
  className?: string
}

/** Labeled single-line text input bound to a react-hook-form field. */
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type,
  maxLength,
  className,
}: TextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              maxLength={maxLength}
              {...field}
              value={str(field.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// ---------------------------------------------------------------------------

type TextAreaFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
  rows?: number
  className?: string
}

/** Labeled multi-line text area bound to a react-hook-form field. */
export function TextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rows = 4,
  className,
}: TextAreaFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <TextArea rows={rows} placeholder={placeholder} {...field} value={str(field.value)} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// ---------------------------------------------------------------------------

type DateFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  className?: string
  /**
   * Value written when the input is cleared. The two identity forms differ:
   * the lineage form clears to `null`, the Passport `dob` clears to `undefined`
   * (its schema's default). Defaults to `null`.
   */
  clearTo?: "null" | "undefined"
}

/**
 * Labeled `type="date"` input that folds the duplicated `Date <-> yyyy-mm-dd`
 * coercion both identity forms hand-rolled.
 */
export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  className,
  clearTo = "null",
}: DateFieldProps<T>) {
  const empty = clearTo === "undefined" ? undefined : null
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="date"
              value={toDateInputValue(field.value)}
              onChange={event =>
                field.onChange(event.target.value ? new Date(event.target.value) : empty)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// ---------------------------------------------------------------------------

type AvatarFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  control: Control<T>
  name: FieldPath<T>
  path: string
  className?: string
  /** Alt text for the rounded preview image. */
  previewAlt?: string
}

/**
 * Media-upload field with the rounded avatar preview both identity forms use.
 * Wraps `FormMedia` (which supplies its own label + upload control).
 */
export function AvatarField<T extends FieldValues>({
  form,
  control,
  name,
  path,
  className,
  previewAlt = "Avatar preview",
}: AvatarFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: { field: ControllerRenderProps<T, FieldPath<T>> }) => (
        <FormMedia form={form} field={field} path={path} className={className}>
          {field.value && (
            <img src={field.value} alt={previewAlt} className="size-20 rounded-full object-cover" />
          )}
        </FormMedia>
      )}
    />
  )
}
