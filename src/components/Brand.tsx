function BrandMark() {
  return (
    <span className="relative inline-block h-6 w-6 rounded-[7px] border-[1.5px] border-accent-500">
      <span className="absolute left-1/2 top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-accent-500" />
    </span>
  );
}

/** Marca: 17px na tela de login, 15px na barra de navegação (layout 2). */
export function Brand({ tamanho = 'login' }: { tamanho?: 'login' | 'barra' }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <span
        className={`${tamanho === 'barra' ? 'text-[15px]' : 'text-[17px]'} font-bold tracking-[0.02em]`}
      >
        EMPREST<span className="text-accent-500">.AI</span>
      </span>
    </div>
  );
}
