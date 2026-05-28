import { notFound } from 'next/navigation';
import { Phone, MessageCircle, MapPin, Globe, Mail, FileText, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { telLink, waLink, mapLink } from '@/lib/utils';
import type { Business } from '@/lib/types';
import TrackButton from '@/components/TrackButton';
import dynamic from 'next/dynamic';
import ReviewsSection from '@/components/ReviewsSection';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export const revalidate = 30;

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!data) notFound();
  const b = data as Business;

  // Incrementar vista (best-effort, no bloquea)
  supabase
    .from('business_analytics')
    .insert({ business_id: b.id, event_type: 'view' })
    .then(() => {});

  return (
    <article className="fade-in pb-6">
      {/* Cover */}
      <div className="relative w-full aspect-[16/9] bg-slate-200">
        {b.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.cover_image} alt={b.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-600 to-accent-500 grid place-items-center text-white text-3xl font-bold">
            {b.name.charAt(0)}
          </div>
        )}
        {b.is_verified && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            ✓ Verificado
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold leading-tight">{b.name}</h1>
        {b.short_description && (
          <p className="text-sm text-slate-600 mt-1">{b.short_description}</p>
        )}

        {b.rating_count > 0 && (
          <div className="flex items-center gap-1 mt-2 text-amber-600">
            <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
            <span className="font-semibold">{Number(b.rating_avg).toFixed(1)}</span>
            <span className="text-slate-500 text-sm">({b.rating_count} reseñas)</span>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="flex justify-around mt-5 mb-6">
          {b.phone && (
            <TrackButton
              businessId={b.id}
              event="call"
              href={telLink(b.phone)}
              ariaLabel="Llamar"
              ringClass="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600"
              label="Llamar"
            >
              <Phone className="w-6 h-6" />
            </TrackButton>
          )}
          {b.whatsapp && (
            <TrackButton
              businessId={b.id}
              event="whatsapp"
              href={waLink(b.whatsapp, `Hola ${b.name}, los contacto desde Mejía Travel.`)}
              ariaLabel="WhatsApp"
              ringClass="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600"
              label="WhatsApp"
              external
            >
              <MessageCircle className="w-6 h-6" />
            </TrackButton>
          )}
          {b.latitude != null && b.longitude != null && (
            <TrackButton
              businessId={b.id}
              event="map"
              href={mapLink(b.latitude, b.longitude, b.name)}
              ariaLabel="Mapa"
              ringClass="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600"
              label="Mapa"
              external
            >
              <MapPin className="w-6 h-6" />
            </TrackButton>
          )}
          {b.website && (
            <TrackButton
              businessId={b.id}
              event="website"
              href={b.website}
              ariaLabel="Sitio web"
              ringClass="bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600"
              label="Web"
              external
            >
              <Globe className="w-6 h-6" />
            </TrackButton>
          )}
        </div>

        {/* Descripción */}
        {b.description && (
          <section className="rounded-2xl bg-white border border-slate-200 p-4 mb-3 shadow-soft">
            <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700">
              {b.description}
            </p>
          </section>
        )}

        {/* Direcciones */}
        {(b.address || b.address_branch_1 || b.address_branch_2) && (
          <section className="rounded-2xl bg-white border border-slate-200 p-4 mb-3 shadow-soft space-y-3">
            {b.address && <Field label="Dirección" value={b.address} />}
            {b.address_branch_1 && <Field label="Sucursal 1" value={b.address_branch_1} />}
            {b.address_branch_2 && <Field label="Sucursal 2" value={b.address_branch_2} />}
          </section>
        )}

        {/* Datos extra */}
        <section className="rounded-2xl bg-white border border-slate-200 p-4 mb-3 shadow-soft space-y-3">
          {b.owner_name && <Field label="Propietario" value={b.owner_name} />}
          {b.phone && <Field label="Teléfono de contacto" value={b.phone} />}
          {b.email && <Field label="Correo electrónico" value={b.email} />}
          {b.website && <Field label="Página web" value={b.website} link={b.website} />}
        </section>

        {/* Redes sociales */}
        {(b.facebook || b.instagram || b.tiktok) && (
          <div className="flex justify-center gap-4 my-4">
            {b.facebook && <SocialIcon href={b.facebook} label="Facebook" emoji="📘" />}
            {b.instagram && <SocialIcon href={b.instagram} label="Instagram" emoji="📷" />}
            {b.tiktok && <SocialIcon href={b.tiktok} label="TikTok" emoji="🎵" />}
          </div>
        )}

        {/* Catálogo PDF */}
        {b.catalog_pdf && (
          <a
            href={b.catalog_pdf}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold shadow-card mb-4"
          >
            <FileText className="w-5 h-5" /> Ver Catálogo PDF
          </a>
        )}

        {/* Mapa */}
        {b.latitude != null && b.longitude != null && (
          <section className="rounded-2xl overflow-hidden border border-slate-200 shadow-soft mb-4">
            <MapView lat={Number(b.latitude)} lng={Number(b.longitude)} name={b.name} />
          </section>
        )}

        {/* Reseñas */}
        <ReviewsSection businessId={b.id} />
      </div>
    </article>
  );
}

function Field({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-600 break-all">
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-slate-800">{value}</p>
      )}
    </div>
  );
}

function SocialIcon({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-2xl shadow-soft hover:scale-105 transition"
    >
      {emoji}
    </a>
  );
}
