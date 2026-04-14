'use client'

/**
 * Modal — a clean light-themed dialog wrapper.
 * Exports kept identical to previous DarkModal for drop-in compatibility.
 * Uses Radix UI Dialog primitives under the hood.
 */

import * as React from 'react'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils'
import type { ActionState } from '@/app/services/actions'

// ── Submit button ──────────────────────────────────────────────────────────────

interface SubmitBtnProps {
  label?: string
  pendingLabel?: string
  accentColor?: string
}

export function DarkSubmitButton({
  label = '提交申请',
  pendingLabel = '提交中...',
  accentColor = '#059669',
}: SubmitBtnProps) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-105"
      style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
        boxShadow: `0 4px 14px ${accentColor}30`,
      }}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

// ── Form feedback ──────────────────────────────────────────────────────────────

export function FormFeedback({ state }: { state: ActionState }) {
  if (state.status === 'idle') return null
  const isOk = state.status === 'success'
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 px-4 py-3 rounded-xl text-[13px] border',
        isOk
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-rose-50 border-rose-200 text-rose-600',
      )}
    >
      {isOk
        ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
        : <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
      <span>{state.message}</span>
    </div>
  )
}

// ── Field components ──────────────────────────────────────────────────────────

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  hint?: string
}

export function DarkField({ label, required, hint, className, ...props }: FieldProps) {
  return (
    <div>
      <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        {hint && <span className="text-slate-400 font-normal ml-1">（{hint}）</span>}
      </label>
      <input
        {...props}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 outline-none transition-all border border-slate-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100',
          className,
        )}
      />
    </div>
  )
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
  children: React.ReactNode
}

export function DarkSelect({ label, required, children, ...props }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <select
        {...props}
        className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-900 outline-none transition-all appearance-none border border-slate-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      >
        {children}
      </select>
    </div>
  )
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
}

export function DarkTextarea({ label, required, ...props }: TextareaFieldProps) {
  return (
    <div>
      <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <textarea
        {...props}
        rows={props.rows ?? 3}
        className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none border border-slate-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  )
}

// ── DarkModal (light-themed) ──────────────────────────────────────────────────

interface DarkModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  accentColor?: string
  accentIcon?: React.ReactNode
  children: React.ReactNode
}

export function DarkModal({
  open,
  onClose,
  title,
  description,
  accentColor = '#059669',
  accentIcon,
  children,
}: DarkModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-0 border-0 shadow-none bg-transparent focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)] overflow-hidden">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {accentIcon && (
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
                      style={{
                        background: `${accentColor}12`,
                        borderColor: `${accentColor}30`,
                      }}
                    >
                      {accentIcon}
                    </div>
                  )}
                  <div>
                    <h2 className="text-[16px] font-bold text-slate-900">{title}</h2>
                    {description && <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>}
                  </div>
                </div>
                <DialogClose asChild>
                  <button className="text-slate-400 hover:text-slate-700 transition-colors mt-0.5 p-1 rounded-lg hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
