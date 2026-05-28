'use client';
import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSun } from 'lucide-react';

type Weather = { temp: number; code: number; desc: string };

// Open-Meteo: API gratis sin token. Machachi: -0.5072, -78.5705
const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=-0.5072&longitude=-78.5705&current=temperature_2m,weather_code&timezone=America%2FGuayaquil';

function describe(code: number): { desc: string; Icon: any } {
  if (code === 0) return { desc: 'Despejado', Icon: Sun };
  if (code <= 3) return { desc: 'Parcialmente nublado', Icon: CloudSun };
  if (code <= 48) return { desc: 'Nublado', Icon: Cloud };
  if (code <= 67) return { desc: 'Lluvia', Icon: CloudRain };
  if (code <= 77) return { desc: 'Nieve', Icon: Cloud };
  if (code <= 82) return { desc: 'Chubascos', Icon: CloudRain };
  return { desc: 'Tormenta', Icon: CloudRain };
}

export default function WeatherWidget() {
  const [w, setW] = useState<Weather | null>(null);

  useEffect(() => {
    fetch(URL)
      .then((r) => r.json())
      .then((d) =>
        setW({
          temp: Math.round(d.current?.temperature_2m ?? 0),
          code: d.current?.weather_code ?? 0,
          desc: '',
        })
      )
      .catch(() => {});
  }, []);

  if (!w) return null;
  const { desc, Icon } = describe(w.code);

  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-3 py-2 shadow-soft">
      <Icon className="w-7 h-7 text-brand-600" />
      <div className="flex-1">
        <div className="text-sm font-semibold leading-tight">Machachi</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
      <div className="text-2xl font-bold text-brand-700">{w.temp}°</div>
    </div>
  );
}
