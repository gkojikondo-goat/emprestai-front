import { Brand } from '../../components/Brand';
import { HealthStatus } from '../health/HealthStatus';

export function HomePage({
  email,
  apiUrl,
  onSignOut,
}: {
  email: string;
  apiUrl: string;
  onSignOut: () => void;
}) {
  return (
    <div className="min-h-[820px]">
      <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-divider bg-bg px-10">
        <Brand />
        <div className="flex items-center gap-4 text-[13.5px]">
          <span className="text-text/70">{email}</span>
          <button
            type="button"
            onClick={onSignOut}
            className="h-9 cursor-pointer rounded-md border border-divider bg-transparent px-3.5 text-text hover:bg-text/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1000px] flex-col gap-6 px-10 pb-16 pt-9">
        <div>
          <h1 className="text-[30px]">Início</h1>
          <p className="mt-1 text-sm text-text/55">Você está logado como {email}.</p>
        </div>
        <section className="rounded-lg border border-divider bg-surface p-[18px]">
          <p className="mb-3 text-[11.5px] uppercase tracking-[0.09em] text-text/45">
            Status do sistema
          </p>
          <HealthStatus apiUrl={apiUrl} />
        </section>
      </main>
    </div>
  );
}
