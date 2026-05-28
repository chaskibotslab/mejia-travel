export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 text-white p-5 shadow-card">
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -left-6 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-widest text-white/80">
          Una forma distinta de descubrir
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mt-1">
          Todo lo que <span className="text-accent-300">buscas</span>
          <br />
          en el Cantón Mejía
        </h1>
        <ul className="mt-3 text-sm space-y-1 text-white/90">
          <li>• Servicios, turismo y emprendimientos</li>
          <li>• Llama, WhatsApp o ubica en el mapa</li>
          <li>• Compra y vende en 48 horas</li>
        </ul>
      </div>
    </div>
  );
}
