'use client'

/**
 * DarkModal — a lightweight dark-themed dialog wrapper.
 * Styled to match the site's deep-dark sci-fi aesthetic.
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

// ── Submit button (reads pending from useFormStatus) ──────────────────────────

interface SubmitBtnProps {
  label?: string
  pendingLabel?: string
  accentColor?: string
}

export function DarkSubmitButton({
  label = '提交申请',
  pendingLabel = '提交中...',
  accentColor = '#10b981',
}: SubmitBtnProps) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
        boxShadow: `0 4px 16px ${accentColor}40`,
      }}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

// ── Form feedback banner ──────────────────────────────────────────────────────

export function FormFeedback({ state }: { state: ActionState }) {
  if (state.status === 'idle') return null
  const isOk = state.status === 'success'
  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-[13px]"
      style={{
        background: isOk ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.10)',
        border: `1px solid ${isOk ? 'rgba(16,185,129,0.28)' : 'rgba(244,63,94,0.28)'}`,
        color: isOk ? '#34d399' : '#f87171',
      }}
    >
      {isOk
        ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
        : <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />}
      <span>{state.message}</span>
    </div>
  )
}

// ── Dark field ────────────────────────────────────────────────────────────────

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  hint?: string
}

export function DarkField({ label, required, hint, className, ...props }: FieldProps) {
  return (
    <div>
      <label className="block text-[12px] text-slate-400 mb-1.5 font-medium">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        {hint && <span className="text-slate-600 font-normal ml-1">（{hint}）</span>}
      </label>
      <input
        {...props}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white/90 placeholder-slate-600 outline-none transition-all',
          className,
        )}
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid rgba(16,185,129,0.40)'
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)'
          props.onBlur?.(e)
        }}
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
      <label className="block text-[12px] text-slate-400 mb-1.5 font-medium">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <select
        {...props}
        className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white/90 outline-none transition-all appearance-none"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
        onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(16,185,129,0.40)' }}
        onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)' }}
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
      <label className="block text-[12px] text-slate-400 mb-1.5 font-medium">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <textarea
        {...props}
        rows={props.rows ?? 3}
        className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white/90 placeholder-slate-600 outline-none transition-all resize-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(16,185,129,0.40)' }}
        onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)' }}
      />
    </div>
  )
}

// ── DarkModal ─────────────────────────────────────────────────────────────────

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
  accentColor = '#10b981',
  accentIcon,
  children,
}: DarkModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-0 border-0 shadow-none bg-transparent focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div
            style={{
              background: 'rgba(8, 14, 26, 0.97)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: `0 0 80px rgba(0,0,0,0.80), 0 0 40px ${accentColor}20`,
            }}
            className="rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {accentIcon && (
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${accentColor}22`, boxShadow: `0 2px 10px ${accentColor}33` }}
                    >
                      {accentIcon}
                    </div>
                  )}
                  <div>
                    <h2 className="text-[16px] font-bold text-white">{title}</h2>
                    {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
                  </div>
                </div>
                <DialogClose asChild>
                  <button className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5">
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
