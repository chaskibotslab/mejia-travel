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
          <div className="flex justify-center gap-5 my-4">
            {b.facebook && (
              <a href={b.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                className="w-11 h-11 rounded-full bg-[#1877F2] grid place-items-center shadow-md hover:scale-110 transition">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {b.instagram && (
              <a href={b.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] grid place-items-center shadow-md hover:scale-110 transition">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            )}
            {b.tiktok && (
              <a href={b.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"
                className="w-11 h-11 rounded-full bg-black grid place-items-center shadow-md hover:scale-110 transition">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.4a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.83z"/></svg>
              </a>
            )}
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

