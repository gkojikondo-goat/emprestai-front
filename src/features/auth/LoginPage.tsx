import { useState, type FormEvent } from 'react';

export type Credentials = { email: string; password: string };

type FieldErrors = { email?: string; password?: string };

function BrandMark() {
  return (
    <span className="relative inline-block h-6 w-6 rounded-[7px] border-[1.5px] border-accent-500">
      <span className="absolute left-1/2 top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-accent-500" />
    </span>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <span className="text-[17px] font-bold tracking-[0.02em]">
        EMPREST<span className="text-accent-500">.AI</span>
      </span>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[30px] font-semibold leading-none text-accent-500">
        {value}
      </div>
      <div className="mt-2 text-[12.5px] text-text/55">{label}</div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] text-text/70">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-erro` : undefined}
        className="h-9 rounded-md border border-divider bg-surface px-2.5 py-1.5 text-[14px] text-text outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
      />
      {error && (
        <p id={`${id}-erro`} className="text-[12.5px] text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function LoginPage({
  onSubmit,
}: {
  onSubmit: (credentials: Credentials) => void | Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Informe o e-mail.';
    if (!password) next.password = 'Informe a senha.';
    setErrors(next);
    if (next.email || next.password) return;
    void onSubmit({ email: email.trim(), password });
  }

  return (
    <div className="grid min-h-[820px] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#1b1f2e,#161826_60%)] px-14 py-16">
        <div className="pointer-events-none absolute -left-40 top-[120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(47,184,172,0.16),transparent_70%)]" />
        <div className="relative">
          <Brand />
        </div>
        <div className="relative flex max-w-[640px] flex-col gap-5">
          <h1 className="text-[44px]">
            Empréstimo de equipamentos,
            <br />
            sem planilha.
          </h1>
          <p className="text-base text-text/60">
            Veja o que está disponível, peça um item e devolva no prazo. Tudo em
            um lugar só.
          </p>
        </div>
        <div className="relative flex flex-col gap-6">
          <div className="grid max-w-[560px] grid-cols-3 gap-6 border-t border-divider pt-6">
            <Stat value="3" label="itens por pessoa" />
            <Stat value="14" label="dias de prazo" />
            <Stat value="0" label="linhas para preencher" />
          </div>
          <p className="text-xs text-text/40">Operações · TI interno</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-14 py-16">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full max-w-[340px] flex-col gap-4"
        >
          <h2 className="text-[26px]">Entrar</h2>
          <p className="-mt-2 text-sm text-text/55">
            Use o e-mail da sua conta.
          </p>
          <Field
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            error={errors.email}
            onChange={setEmail}
          />
          <Field
            id="password"
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={password}
            error={errors.password}
            onChange={setPassword}
          />
          <button
            type="submit"
            className="mt-2 h-10 w-full cursor-pointer rounded-md border border-accent-500 bg-transparent text-sm font-medium text-accent-300 hover:bg-accent-500/12 active:bg-accent-500/22 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            Entrar
          </button>
          <p className="text-xs text-text/45">
            Cada pessoa vê apenas os próprios empréstimos.
          </p>
        </form>
      </section>
    </div>
  );
}
