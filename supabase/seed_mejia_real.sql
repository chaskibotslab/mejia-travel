-- =====================================================================
-- SEED MEJIA REAL DATA — Contenido inicial para arrancar la app
-- Ejecutar DESPUÉS de schema.sql + schema_v2.sql + seed.sql
-- Carga: banners hero, eventos típicos, atractivos turísticos reales,
-- algunos negocios destacados, una cooperativa con rutas.
-- =====================================================================

-- ---------------------------------------------------------------------
-- BANNERS HERO (carrusel del home)
-- ---------------------------------------------------------------------
insert into public.banners (title, subtitle, image, link, is_active, sort_order) values
  (
    'Descubre el Cotopaxi',
    'El volcán activo más alto del mundo, a las puertas de Machachi',
    'https://images.unsplash.com/photo-1568388505325-cad6c925da12?w=1200&q=80',
    '/c/turismo',
    true, 1
  ),
  (
    'Paseo del Chagra',
    'Tradición ancestral cada julio en Machachi',
    'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1200&q=80',
    '/eventos',
    true, 2
  ),
  (
    'Aguas Termales',
    'Relájate en La Calera y Tesalia, manantiales naturales',
    'https://images.unsplash.com/photo-1582550945154-d1cf95d8a9d2?w=1200&q=80',
    '/c/turismo/aguas-termales',
    true, 3
  ),
  (
    'Gastronomía Mejiense',
    'Hornado, yaguarlocro, fritada y mucho más',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
    '/c/gastronomia',
    true, 4
  )
on conflict do nothing;

-- ---------------------------------------------------------------------
-- EVENTOS PRÓXIMOS / RECURRENTES
-- ---------------------------------------------------------------------
insert into public.events (title, description, cover_image, starts_at, ends_at, location, latitude, longitude, organizer, contact_phone, category, is_published) values
  (
    'Paseo Procesional del Chagra 2026',
    'La fiesta más emblemática del cantón Mejía. Desfile de chagras con sus mejores caballos, vestimenta tradicional, música andina y comida típica. Declarada Patrimonio Cultural Inmaterial del Ecuador.',
    'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1200&q=80',
    (now() + interval '15 days')::timestamptz,
    (now() + interval '17 days')::timestamptz,
    'Centro de Machachi',
    -0.5081, -78.5680,
    'GAD Municipal de Mejía', '023150040', 'tradicion', true
  ),
  (
    'Fiestas de Cantonización de Mejía',
    'Celebración del aniversario del cantón con desfiles, conciertos, ferias gastronómicas, juegos pirotécnicos y actividades culturales para toda la familia.',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    (now() + interval '45 days')::timestamptz,
    (now() + interval '52 days')::timestamptz,
    'Plaza Central de Machachi',
    -0.5081, -78.5680,
    'GAD Municipal de Mejía', '023150040', 'cultura', true
  ),
  (
    'Feria Gastronómica Aloasí',
    'Disfruta de los mejores platos típicos de la sierra ecuatoriana: hornado, yaguarlocro, fritada, locro de papas y postres artesanales.',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
    (now() + interval '7 days')::timestamptz,
    (now() + interval '9 days')::timestamptz,
    'Parque Central de Aloasí',
    -0.5180, -78.5800,
    'Junta Parroquial de Aloasí', '023097200', 'gastronomia', true
  ),
  (
    'Caminata Ecológica al Pasochoa',
    'Recorrido guiado de 4 horas por el Bosque Protector Pasochoa. Avistamiento de aves, flora endémica y vistas panorámicas. Cupo limitado.',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80',
    (now() + interval '20 days')::timestamptz,
    (now() + interval '20 days' + interval '6 hours')::timestamptz,
    'Refugio Pasochoa',
    -0.4669, -78.4892,
    'Fundación Natura', '022430052', 'turismo', true
  ),
  (
    'Festival del Hornado',
    'El plato emblemático de Mejía celebrado con concurso de hornaderos, música en vivo, danza folclórica y artesanías locales.',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
    (now() + interval '30 days')::timestamptz,
    (now() + interval '31 days')::timestamptz,
    'Mercado Central Machachi',
    -0.5089, -78.5675,
    'Asociación de Hornaderos', '0998765432', 'gastronomia', true
  )
on conflict do nothing;

-- ---------------------------------------------------------------------
-- ATRACTIVOS TURÍSTICOS (como businesses dentro de subcategorías de turismo)
-- ---------------------------------------------------------------------
do $$
declare
  cat_atractivos uuid;
  cat_termales   uuid;
  cat_volcanes   uuid;
  cat_iglesias   uuid;
  cat_miradores  uuid;
  cat_parques    uuid;
  cat_huecas     uuid;
  cat_tipica     uuid;
  cat_hoteles    uuid;
  cat_hosterias  uuid;
begin
  select id into cat_atractivos from public.categories where slug = 'atractivos';
  select id into cat_termales   from public.categories where slug = 'aguas-termales';
  select id into cat_volcanes   from public.categories where slug = 'volcanes';
  select id into cat_iglesias   from public.categories where slug = 'iglesias';
  select id into cat_miradores  from public.categories where slug = 'miradores';
  select id into cat_parques    from public.categories where slug = 'parques';
  select id into cat_huecas     from public.categories where slug = 'huecas';
  select id into cat_tipica     from public.categories where slug = 'comida-tipica';
  select id into cat_hoteles    from public.categories where slug = 'hoteles';
  select id into cat_hosterias  from public.categories where slug = 'hosterias';

  -- VOLCANES Y ATRACTIVOS NATURALES
  insert into public.businesses (category_id, slug, name, description, short_description, address, latitude, longitude, cover_image, is_published, is_featured, is_verified) values
    (cat_volcanes, 'volcan-cotopaxi', 'Volcán Cotopaxi',
     'El Cotopaxi es uno de los volcanes activos más altos del mundo (5.897 m). Ícono natural del Ecuador y joya turística del Cantón Mejía. Sus paisajes nevados, refugios de montaña y leyendas indígenas lo convierten en destino obligado para amantes de la naturaleza y el andinismo.',
     'Volcán activo a 5.897 m, ícono del Ecuador',
     'Parque Nacional Cotopaxi, vía Pedregal',
     -0.6810, -78.4377,
     'https://images.unsplash.com/photo-1568388505325-cad6c925da12?w=1200&q=80',
     true, true, true),

    (cat_volcanes, 'volcan-pasochoa', 'Volcán Pasochoa',
     'Volcán inactivo de 4.199 m convertido en Bosque Protector. Refugio de más de 110 especies de aves nativas y flora endémica. Senderos para caminatas de 2 a 6 horas con miradores espectaculares hacia el Cotopaxi y Antisana.',
     'Bosque Protector con avistamiento de aves',
     'Refugio de Vida Silvestre Pasochoa',
     -0.4669, -78.4892,
     'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80',
     true, true, true),

    (cat_volcanes, 'volcan-corazon', 'Volcán El Corazón',
     'Cumbre de 4.788 m con forma de corazón al amanecer. Ascenso de dificultad media, ideal para excursionistas con experiencia. Vistas panorámicas hacia los Ilinizas y el Cotopaxi.',
     'Cumbre andina con forma de corazón',
     'Cordillera Occidental, Aloasí',
     -0.5333, -78.6500,
     'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
     true, true, true),

    (cat_volcanes, 'volcan-ruminahui', 'Volcán Rumiñahui',
     'Volcán extinto de 4.722 m dentro del Parque Nacional Cotopaxi. Su nombre significa "Cara de Piedra" en kichwa. Ascenso técnico que requiere experiencia y equipo adecuado.',
     'Volcán extinto en el Parque Cotopaxi',
     'Parque Nacional Cotopaxi',
     -0.6500, -78.5000,
     'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80',
     true, false, true);

  -- AGUAS TERMALES
  insert into public.businesses (category_id, slug, name, description, short_description, address, latitude, longitude, phone, cover_image, is_published, is_featured, is_verified) values
    (cat_termales, 'termales-la-calera', 'Aguas Termales La Calera',
     'Complejo turístico con piscinas de aguas mineromedicinales a 35°C. Ubicado en Aloasí, ofrece piscinas para adultos y niños, áreas verdes, restaurante y zona de camping. Tradición familiar desde hace décadas.',
     'Piscinas mineromedicinales en Aloasí',
     'Vía Aloasí, sector La Calera',
     -0.5250, -78.5950,
     '022309045',
     'https://images.unsplash.com/photo-1582550945154-d1cf95d8a9d2?w=1200&q=80',
     true, true, true),

    (cat_termales, 'termales-tesalia', 'Balneario Tesalia',
     'Famoso balneario de aguas termales naturales con propiedades curativas. Conocido también por la marca de aguas minerales Tesalia que se embotella aquí. Piscinas, toboganes y zona recreativa.',
     'Histórico balneario termal de Machachi',
     'Sector Tesalia, Machachi',
     -0.5180, -78.5750,
     '022315678',
     'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
     true, true, true);

  -- IGLESIAS Y PATRIMONIO
  insert into public.businesses (category_id, slug, name, description, short_description, address, latitude, longitude, cover_image, is_published, is_featured, is_verified) values
    (cat_iglesias, 'iglesia-matriz-machachi', 'Iglesia Matriz de Machachi',
     'Templo católico construido en el siglo XIX, ícono arquitectónico de Machachi. Su fachada de piedra y altares de pan de oro la convierten en visita obligada. Centro de la fe del pueblo mejiense.',
     'Templo histórico del siglo XIX',
     'Plaza Central, Machachi',
     -0.5081, -78.5680,
     'https://images.unsplash.com/photo-1548276145-69a9521f0499?w=1200&q=80',
     true, true, true);

  -- MIRADORES
  insert into public.businesses (category_id, slug, name, description, short_description, address, latitude, longitude, cover_image, is_published, is_featured, is_verified) values
    (cat_miradores, 'mirador-aloasi', 'Mirador de Aloasí',
     'Vista panorámica del Valle de Machachi y los volcanes circundantes: Cotopaxi, Pasochoa, Rumiñahui y El Corazón. Ideal para fotografía al amanecer y atardecer.',
     'Vista panorámica de los volcanes',
     'Loma de Aloasí',
     -0.5150, -78.5900,
     'https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=1200&q=80',
     true, true, true);

  -- PARQUES
  insert into public.businesses (category_id, slug, name, description, short_description, address, latitude, longitude, cover_image, is_published, is_featured, is_verified) values
    (cat_parques, 'parque-central-machachi', 'Parque Central de Machachi',
     'Corazón social y cultural de Machachi. Rodeado por la iglesia matriz, el municipio y comercios. Eventos públicos, música los domingos y vendedores de productos típicos como humitas y morocho.',
     'Centro social y cultural del cantón',
     'Plaza Central, Machachi',
     -0.5081, -78.5680,
     'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1200&q=80',
     true, false, true);

  -- COMIDA TÍPICA (HUECAS DESTACADAS)
  insert into public.businesses (category_id, slug, name, description, short_description, address, phone, whatsapp, latitude, longitude, cover_image, is_published, is_featured, is_verified) values
    (cat_tipica, 'hornados-dieguito', 'Hornados Dieguito',
     'Hornado tradicional preparado en leña, con tortillas de papa, mote, agrio y la mejor cuerina del cantón. Más de 30 años de tradición familiar en Machachi.',
     'Hornado tradicional desde hace 30 años',
     'Av. Amazonas y García Moreno, Machachi',
     '022315234', '593987654321',
     -0.5085, -78.5685,
     'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
     true, true, true),

    (cat_tipica, 'yaguarlocro-machachi', 'Yaguarlocro Doña Rosa',
     'Yaguarlocro tradicional con sangre de borrego, papas, hierbas andinas y aguacate. Plato emblemático de la sierra ecuatoriana servido en el mercado central.',
     'El mejor yaguarlocro del mercado',
     'Mercado Central, Local 12, Machachi',
     '0987654321', '593987654322',
     -0.5089, -78.5675,
     'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80',
     true, true, true);

  -- HOTELES Y HOSTERÍAS
  insert into public.businesses (category_id, slug, name, description, short_description, address, phone, whatsapp, latitude, longitude, cover_image, is_published, is_featured, is_verified) values
    (cat_hosterias, 'hosteria-papagayo', 'Hostería Papagayo',
     'Hostería con encanto rural rodeada de naturaleza. Habitaciones cálidas con chimenea, restaurante con cocina ecuatoriana e internacional, spa, caballos y actividades al aire libre.',
     'Hostería rural cerca del Cotopaxi',
     'Vía a Pedregal Km 5, Machachi',
     '022309900', '593987654323',
     -0.5500, -78.5500,
     'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
     true, true, true),

    (cat_hosterias, 'hacienda-cienega', 'Hacienda La Ciénega',
     'Hacienda colonial del siglo XVI convertida en hostería de lujo. Habitaciones con historia, restaurante gourmet, capilla privada, jardines y vista al Cotopaxi. Patrimonio histórico.',
     'Hacienda colonial del siglo XVI',
     'Panamericana Sur Km 72, Lasso',
     '032719052', '593987654324',
     -0.7800, -78.6200,
     'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
     true, true, true);
end $$;

-- ---------------------------------------------------------------------
-- COOPERATIVAS DE TRANSPORTE (con rutas)
-- ---------------------------------------------------------------------
insert into public.transport_cooperatives (slug, name, type, description, founded_year, color, phone, whatsapp, address, is_published, is_featured) values
  ('coop-mejia', 'Cooperativa Mejía',
   'Cooperativa de transporte interprovincial e interparroquial. Sirve a las comunidades del cantón Mejía con buses cómodos y seguros desde 1965.',
   1965, '#1B97A3', '022315700', '593987100200',
   'Terminal Terrestre Machachi',
   true, true),
  ('coop-rumiñahui', 'Cooperativa Rumiñahui',
   'Transporte interprovincial Quito - Machachi - Latacunga. Frecuencias cada 10 minutos en horas pico.',
   1972, '#3B2EAD', '022316800', '593987100201',
   'Terminal Quitumbe, Quito',
   true, true),
  ('coop-taxis-machachi', 'Cooperativa de Taxis Machachi',
   'Servicio de taxi 24/7 en todo el cantón Mejía. Tarifas justas, conductores capacitados y unidades nuevas.',
   1995, '#F39C3E', '022315500', '593987100202',
   'Plaza Central Machachi',
   true, false)
on conflict (slug) do nothing;

-- Rutas de Coop Mejía
with c as (select id from public.transport_cooperatives where slug = 'coop-mejia')
insert into public.transport_routes (cooperative_id, origin, destination, schedule_start, schedule_end, frequency, fare, sort_order)
select c.id, v.o, v.d, v.s, v.e, v.f, v.p, v.ord from c,
(values
  ('Machachi', 'Quito',         '04:00', '21:00', 'Cada 10 minutos', 0.90, 1),
  ('Machachi', 'Aloasí',        '05:00', '20:00', 'Cada 15 minutos', 0.35, 2),
  ('Machachi', 'El Chaupi',     '06:00', '19:00', 'Cada 30 minutos', 0.50, 3),
  ('Machachi', 'Cutuglagua',    '05:30', '20:30', 'Cada 20 minutos', 0.40, 4)
) as v(o,d,s,e,f,p,ord);

-- Rutas de Coop Rumiñahui
with c as (select id from public.transport_cooperatives where slug = 'coop-rumiñahui')
insert into public.transport_routes (cooperative_id, origin, destination, schedule_start, schedule_end, frequency, fare, sort_order)
select c.id, v.o, v.d, v.s, v.e, v.f, v.p, v.ord from c,
(values
  ('Quito',     'Machachi',  '04:00', '22:00', 'Cada 10 minutos', 0.90, 1),
  ('Machachi',  'Latacunga', '05:00', '20:00', 'Cada 20 minutos', 1.50, 2),
  ('Machachi',  'Ambato',    '06:00', '19:00', 'Cada 1 hora',     2.50, 3)
) as v(o,d,s,e,f,p,ord);

-- ---------------------------------------------------------------------
-- PROFESIONALES DE EJEMPLO
-- ---------------------------------------------------------------------
do $$
declare
  cat_doc uuid;
  cat_abo uuid;
  cat_arq uuid;
  cat_elec uuid;
begin
  select id into cat_doc  from public.categories where slug = 'doctor';
  select id into cat_abo  from public.categories where slug = 'abogado';
  select id into cat_arq  from public.categories where slug = 'arquitecto';
  select id into cat_elec from public.categories where slug = 'electricista';

  insert into public.professionals (category_id, full_name, profession, bio, phone, whatsapp, address, is_published, is_featured) values
    (cat_doc, 'Dr. Carlos Mantilla', 'Médico General',
     'Médico general con 15 años de experiencia. Atención de adultos y niños. Consultas a domicilio bajo cita.',
     '022315111', '593987111111',
     'Av. Amazonas 234, Machachi', true, true),
    (cat_abo, 'Ab. María Sánchez', 'Abogada Civil y Laboral',
     'Especialista en derecho laboral y civil. Más de 10 años defendiendo los derechos de trabajadores y familias del cantón.',
     '022315222', '593987222222',
     'Calle Sucre 456, Machachi', true, true),
    (cat_arq, 'Arq. Luis Padilla', 'Arquitecto e Ingeniero Civil',
     'Diseño y construcción de viviendas, locales comerciales y proyectos turísticos. Especializado en arquitectura rural sostenible.',
     '022315333', '593987333333',
     'Aloasí, sector La Calera', true, true),
    (cat_elec, 'José Quishpe', 'Electricista Calificado',
     'Instalaciones eléctricas residenciales e industriales. Mantenimiento, reparaciones de emergencia 24/7.',
     null, '593987444444',
     'Disponible en todo Mejía', true, true);
end $$;

-- ---------------------------------------------------------------------
-- AJUSTES INICIALES DE LA APP (sobrescribe los vacíos)
-- ---------------------------------------------------------------------
insert into public.app_settings (key, value) values
  ('site.name',        '"Mejía Travel"'::jsonb),
  ('site.tagline',     '"Todo lo que buscas en el Cantón Mejía"'::jsonb),
  ('site.gad_phone',   '"023150040"'::jsonb),
  ('site.gad_email',   '"info@municipiomejia.gob.ec"'::jsonb),
  ('site.gad_address', '"Plaza Central, Machachi - Pichincha, Ecuador"'::jsonb),
  ('site.center_lat',  '-0.5081'::jsonb),
  ('site.center_lng',  '-78.5680'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
