import { useRef, useState } from 'react'
import { brand } from '../../config/brand.ts'
import { BrandSymbol } from '../../components/ui/BrandSymbol.tsx'
import { ChevronLeftIcon } from '../../components/ui/icons.tsx'
import { CODE_LENGTH, isValidEmail, normalizeEmail } from './authRules.ts'
import { useAuth, type SignInResult } from './authContext.ts'

/**
 * Two-step sign-in: email, then the 6-digit access code.
 * The same two steps will carry over when codes are emailed for real.
 */
export function SignInScreen() {
  const { signIn } = useAuth()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  return (
    <div className="flex min-h-dvh bg-white">
      {/* Desktop: a quiet brand panel on the left. */}
      <aside className="hidden w-[44%] max-w-[560px] flex-col justify-between bg-primary-soft p-14 lg:flex">
        <div className="flex items-center gap-2.5">
          <BrandSymbol size={24} className="text-primary" />
          <span className="text-[19px] font-bold tracking-[-0.02em] text-ink">{brand.appName}</span>
        </div>
        <div>
          <BrandSymbol size={120} className="mb-10 text-primary" />
          <p className="max-w-sm text-[34px] leading-[1.15] font-bold tracking-[-0.03em] text-ink">{brand.tagline}</p>
        </div>
        <p className="text-[14px] text-ink-2">Invite-only for now.</p>
      </aside>

      <main className="flex flex-1 flex-col px-6 pt-[calc(env(safe-area-inset-top)+40px)] pb-10 lg:items-center lg:justify-center lg:px-14 lg:pt-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-12 flex items-center gap-2.5 lg:hidden">
            <BrandSymbol size={24} className="text-primary" />
            <span className="text-[19px] font-bold tracking-[-0.02em] text-ink">{brand.appName}</span>
          </div>

          {step === 'email' ? (
            <form
              className="fade-enter"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                if (!isValidEmail(email)) {
                  setEmailError('Enter a valid email address, like name@example.com.')
                  return
                }
                setEmailError(null)
                setEmail(normalizeEmail(email))
                setStep('code')
              }}
            >
              <h1 className="text-[30px] leading-tight font-bold tracking-[-0.03em] text-ink">Sign in</h1>
              <p className="mt-2 text-[15px] text-ink-2">
                {brand.appName} is invite-only. Use the email you were invited with.
              </p>

              <label htmlFor="email" className="mt-8 block text-[14px] font-semibold text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? 'email-error' : undefined}
                placeholder="you@example.com"
                className="mt-2 h-14 w-full rounded-2xl border border-line bg-white px-4 text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-3 focus:border-ink/40 focus:shadow-[0_4px_24px_rgba(0,0,0,0.06)] aria-[invalid]:border-danger"
              />
              {emailError && (
                <p id="email-error" className="mt-2 text-[13px] text-danger">
                  {emailError}
                </p>
              )}

              <PrimaryButton type="submit">Continue</PrimaryButton>
            </form>
          ) : (
            <CodeStep email={email} onBack={() => setStep('email')} onSubmit={(code) => signIn(email, code)} />
          )}
        </div>
      </main>
    </div>
  )
}

function CodeStep({
  email,
  onBack,
  onSubmit,
}: {
  email: string
  onBack: () => void
  onSubmit: (code: string) => Promise<SignInResult>
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [focused, setFocused] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = async (value: string) => {
    if (value.length !== CODE_LENGTH || checking) return
    setChecking(true)
    const result = await onSubmit(value)
    if (!result.ok) {
      setChecking(false)
      setError(result.message)
      setCode('')
      inputRef.current?.focus()
    }
  }

  return (
    <form
      className="fade-enter"
      onSubmit={(e) => {
        e.preventDefault()
        void submit(code)
      }}
    >
      <button
        type="button"
        onClick={onBack}
        className="-ml-2 mb-6 flex h-9 items-center gap-1 rounded-full pr-3 pl-1 text-[14px] font-semibold text-ink outline-none hover:bg-surface focus-visible:bg-surface"
      >
        <ChevronLeftIcon size={18} strokeWidth={2.2} />
        Use a different email
      </button>

      <h1 className="text-[30px] leading-tight font-bold tracking-[-0.03em] text-ink">Enter your code</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        The 6-digit access code you were given for <span className="font-semibold text-ink">{email}</span>.
      </p>

      {/* One real input (works with paste and one-time-code autofill), drawn as six boxes. */}
      <div className="relative mt-8" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH)
            setCode(next)
            setError(null)
            if (next.length === CODE_LENGTH) void submit(next)
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={CODE_LENGTH}
          aria-label="6-digit access code"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'code-error' : undefined}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
        <div aria-hidden className="grid grid-cols-6 gap-2">
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const char = code[i] ?? ''
            const isCaret = i === Math.min(code.length, CODE_LENGTH - 1)
            return (
              <span
                key={i}
                className={[
                  'grid h-14 place-items-center rounded-2xl border text-[22px] font-semibold text-ink tabular-nums transition-colors duration-150',
                  error ? 'border-danger' : isCaret && focused ? 'border-ink' : 'border-line',
                ].join(' ')}
              >
                {char}
              </span>
            )
          })}
        </div>
      </div>
      {error && (
        <p id="code-error" className="mt-3 text-[13px] text-danger">
          {error}
        </p>
      )}

      <PrimaryButton type="submit" disabled={code.length !== CODE_LENGTH || checking}>
        {checking ? 'Checking…' : 'Sign in'}
      </PrimaryButton>

      <p className="mt-6 text-[13px] text-ink-2">Don't have a code? Ask the person who invited you.</p>
    </form>
  )
}

function PrimaryButton({
  children,
  type,
  disabled,
}: {
  children: string
  type: 'submit' | 'button'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="mt-6 h-14 w-full rounded-2xl bg-primary text-[16px] font-semibold text-on-primary outline-none transition-colors duration-150 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-primary"
    >
      {children}
    </button>
  )
}
