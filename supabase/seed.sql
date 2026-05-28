-- =====================================================================
-- SEED v2: SOLO árbol de categorías + subcategorías del Cantón Mejía
-- NO incluye negocios — todo se crea desde el panel admin.
-- Ejecutar después de schema.sql y schema_v2.sql
-- =====================================================================

-- Categorías raíz
insert into public.categories (slug, name_es, name_en, icon, color, sort_order, listing_mode) values
  ('gastronomia',          'Gastronomía',         'Food',            'UtensilsCrossed', '#F39C3E',  1, 'businesses'),
  ('hospedaje',            'Hospedaje',           'Lodging',         'BedDouble',       '#6B7280',  2, 'businesses'),
  ('medicina',             'Medicina y Salud',    'Healthcare',      'Stethoscope',     '#E84855',  3, 'businesses'),
  ('automotriz',           'Automotriz',          'Automotive',      'Wrench',          '#3B2EAD',  4, 'businesses'),
  ('servicios-publicos',   'Servicios Públicos',  'Public Services', 'Zap',             '#1B97A3',  5, 'businesses'),
  ('turismo',              'Turismo',             'Tourism',         'Mountain',        '#5B4BB8',  6, 'businesses'),
  ('educacion',            'Educación',           'Education',       'GraduationCap',   '#F39C3E',  7, 'businesses'),
  ('compras',              'Compras e Insumos',   'Shopping',        'ShoppingBag',     '#6B7280',  8, 'businesses'),
  ('cultura',              'Cultura y Arte',      'Culture',         'Palette',         '#1B97A3',  9, 'businesses'),
  ('profesionales',        'Profesionales',       'Professionals',   'Briefcase',       '#5B4BB8', 10, 'professionals'),
  ('transporte',           'Transporte',          'Transport',       'Bus',             '#1B97A3', 11, 'cooperatives'),
  ('agroindustria',        'Agroindustria',       'Agro',            'Wheat',           '#16A34A', 12, 'businesses'),
  ('belleza',              'Belleza y Bienestar', 'Beauty',          'Scissors',        '#EC4899', 13, 'businesses'),
  ('servicios-tecnicos',   'Servicios Técnicos',  'Tech Services',   'Hammer',          '#0EA5E9', 14, 'businesses'),
  ('finanzas',             'Finanzas',            'Finance',         'Landmark',        '#0F766E', 15, 'businesses'),
  ('emergencias',          'Emergencias',         'Emergencies',     'Siren',           '#DC2626', 16, 'businesses')
on conflict (slug) do nothing;

-- =====================================================================
-- Subcategorías por categoría raíz
-- =====================================================================

-- GASTRONOMÍA
with c as (select id from public.categories where slug = 'gastronomia')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('comida-tipica',   'Comida Típica Mejía',   'Typical Food',  'ChefHat',  '#F39C3E', 1),
  ('huecas',          'Huecas',                'Local Spots',   'Soup',     '#F39C3E', 2),
  ('restaurantes',    'Restaurantes',          'Restaurants',   'Utensils', '#F39C3E', 3),
  ('pinchos',         'Pinchos y Parrilladas', 'BBQ',           'Flame',    '#F39C3E', 4),
  ('pizzerias',       'Pizzerías',             'Pizza',         'Pizza',    '#F39C3E', 5),
  ('comida-rapida',   'Comida Rápida',         'Fast Food',     'Sandwich', '#F39C3E', 6),
  ('cafeterias',      'Cafeterías',            'Coffee Shops',  'Coffee',   '#F39C3E', 7),
  ('panaderias',      'Panaderías',            'Bakeries',      'Croissant','#F39C3E', 8),
  ('heladerias',      'Heladerías',            'Ice Cream',     'IceCream', '#F39C3E', 9),
  ('bares',           'Bares y Karaokes',      'Bars',          'Wine',     '#F39C3E', 10)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- HOSPEDAJE
with c as (select id from public.categories where slug = 'hospedaje')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('hoteles',     'Hoteles',          'Hotels',         'Hotel',     '#6B7280', 1),
  ('hostales',    'Hostales',         'Hostels',        'Building2', '#6B7280', 2),
  ('hosterias',   'Hosterías',        'Country Inns',   'Trees',     '#6B7280', 3),
  ('cabanas',     'Cabañas',          'Cabins',         'Home',      '#6B7280', 4),
  ('camping',     'Camping',          'Camping',        'Tent',      '#6B7280', 5),
  ('haciendas',   'Haciendas',        'Haciendas',      'Wheat',     '#6B7280', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- MEDICINA
with c as (select id from public.categories where slug = 'medicina')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('hospitales',      'Hospitales',          'Hospitals',         'Hospital',     '#E84855', 1),
  ('clinicas',        'Clínicas',            'Clinics',           'BriefcaseMedical','#E84855', 2),
  ('laboratorios',    'Laboratorios Clínicos','Laboratories',     'TestTube',     '#E84855', 3),
  ('farmacias',       'Farmacias',           'Pharmacies',        'Pill',         '#E84855', 4),
  ('odontologia',     'Odontología',         'Dentists',          'Smile',        '#E84855', 5),
  ('veterinarias',    'Veterinarias',        'Vets',              'PawPrint',     '#E84855', 6),
  ('opticas',         'Ópticas',             'Optics',            'Eye',          '#E84855', 7),
  ('terapias',        'Terapias y Rehab.',   'Therapy',           'HeartPulse',   '#E84855', 8)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- AUTOMOTRIZ
with c as (select id from public.categories where slug = 'automotriz')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('mecanicas',     'Mecánicas',           'Mechanics',     'Wrench',     '#3B2EAD', 1),
  ('repuestos',     'Repuestos',           'Auto Parts',    'Cog',        '#3B2EAD', 2),
  ('lavadoras',     'Lavadoras y Lubric.', 'Car Wash',      'Droplets',   '#3B2EAD', 3),
  ('llantas',       'Vulcanizadoras',      'Tire Shops',    'CircleDot',  '#3B2EAD', 4),
  ('latoneria',     'Latonería y Pintura', 'Body Shop',     'PaintBucket','#3B2EAD', 5),
  ('grua',          'Grúas',               'Tow Trucks',    'Truck',      '#3B2EAD', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- SERVICIOS PÚBLICOS
with c as (select id from public.categories where slug = 'servicios-publicos')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('gad-municipal',  'GAD Municipal',     'City Hall',       'Building',    '#1B97A3', 1),
  ('registro-civil', 'Registro Civil',    'Civil Registry',  'IdCard',      '#1B97A3', 2),
  ('policia',        'Policía Nacional',  'Police',          'Shield',      '#1B97A3', 3),
  ('bomberos',       'Bomberos',          'Firefighters',    'Flame',       '#1B97A3', 4),
  ('luz',            'Empresa Eléctrica', 'Power Company',   'Zap',         '#1B97A3', 5),
  ('agua',           'Agua Potable',      'Water',           'Droplet',     '#1B97A3', 6),
  ('correos',        'Correos',           'Post Office',     'Mail',        '#1B97A3', 7)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- TURISMO
with c as (select id from public.categories where slug = 'turismo')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('atractivos',         'Atractivos Naturales', 'Natural Sites',  'Mountain',    '#5B4BB8', 1),
  ('aguas-termales',     'Aguas Termales',       'Hot Springs',    'Waves',       '#5B4BB8', 2),
  ('volcanes',           'Volcanes y Páramos',   'Volcanoes',      'Triangle',    '#5B4BB8', 3),
  ('parques',            'Parques',              'Parks',          'Trees',       '#5B4BB8', 4),
  ('iglesias',           'Iglesias y Patrimonio','Churches',       'Church',      '#5B4BB8', 5),
  ('miradores',          'Miradores',            'Viewpoints',     'Eye',         '#5B4BB8', 6),
  ('agencias-viaje',     'Agencias de Viajes',   'Travel Agencies','Plane',       '#5B4BB8', 7),
  ('guias-turisticos',   'Guías Turísticos',     'Tour Guides',    'Compass',     '#5B4BB8', 8)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- EDUCACIÓN
with c as (select id from public.categories where slug = 'educacion')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('inicial',     'Educación Inicial',  'Pre-school',     'Baby',          '#F39C3E', 1),
  ('escuelas',    'Escuelas',           'Primary',        'School',        '#F39C3E', 2),
  ('colegios',    'Colegios',           'High School',    'GraduationCap', '#F39C3E', 3),
  ('institutos',  'Institutos Sup.',    'Institutes',     'BookOpen',      '#F39C3E', 4),
  ('academias',   'Academias',          'Academies',      'Languages',     '#F39C3E', 5),
  ('universidades','Universidades',     'Universities',   'University',    '#F39C3E', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- COMPRAS / INSUMOS
with c as (select id from public.categories where slug = 'compras')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('supermercados',    'Supermercados',      'Supermarkets',  'ShoppingCart','#6B7280', 1),
  ('tiendas',          'Tiendas de Barrio',  'Corner Stores', 'Store',       '#6B7280', 2),
  ('ferreterias',      'Ferreterías',        'Hardware',      'Hammer',      '#6B7280', 3),
  ('agropecuarias',    'Agropecuarias',      'Agro',          'Sprout',      '#6B7280', 4),
  ('ropa',             'Ropa y Calzado',     'Clothing',      'Shirt',       '#6B7280', 5),
  ('papelerias',       'Papelerías',         'Stationery',    'Notebook',    '#6B7280', 6),
  ('mercados',         'Mercados',           'Markets',       'ShoppingBag', '#6B7280', 7)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- CULTURA
with c as (select id from public.categories where slug = 'cultura')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('museos',           'Museos',           'Museums',        'Landmark',  '#1B97A3', 1),
  ('bibliotecas',      'Bibliotecas',      'Libraries',      'Library',   '#1B97A3', 2),
  ('artesanias',       'Artesanías',       'Crafts',         'Palette',   '#1B97A3', 3),
  ('musica',           'Música y Danza',   'Music & Dance',  'Music',     '#1B97A3', 4),
  ('grupos-folkloricos','Grupos Folklóricos','Folk Groups',  'Drum',      '#1B97A3', 5),
  ('artistas',         'Artistas Locales', 'Local Artists',  'Mic',       '#1B97A3', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- PROFESIONALES (modo "professionals" — gente individual)
with c as (select id from public.categories where slug = 'profesionales')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order, listing_mode)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord, 'professionals' from c,
(values
  ('albanil',          'Albañil',         'Mason',           'Hammer',     '#5B4BB8', 1),
  ('arquitecto',       'Arquitecto',      'Architect',       'Compass',    '#5B4BB8', 2),
  ('ingeniero-civil',  'Ingeniero Civil', 'Civil Engineer',  'HardHat',    '#5B4BB8', 3),
  ('doctor',           'Doctor',          'Doctor',          'Stethoscope','#5B4BB8', 4),
  ('abogado',          'Abogado',         'Lawyer',          'Scale',      '#5B4BB8', 5),
  ('enfermero',        'Enfermero/a',     'Nurse',           'HeartPulse', '#5B4BB8', 6),
  ('contador',         'Contador',        'Accountant',      'Calculator', '#5B4BB8', 7),
  ('electricista',     'Electricista',    'Electrician',     'Zap',        '#5B4BB8', 8),
  ('plomero',          'Plomero',         'Plumber',         'Wrench',     '#5B4BB8', 9),
  ('carpintero',       'Carpintero',      'Carpenter',       'Saw',        '#5B4BB8', 10),
  ('mecanico',         'Mecánico',        'Mechanic',        'Cog',        '#5B4BB8', 11),
  ('peluquero',        'Peluquero/a',     'Hair Stylist',    'Scissors',   '#5B4BB8', 12),
  ('veterinario',      'Veterinario',     'Veterinarian',    'PawPrint',   '#5B4BB8', 13),
  ('psicologo',        'Psicólogo/a',     'Psychologist',    'Brain',      '#5B4BB8', 14),
  ('disenador',        'Diseñador',       'Designer',        'PenTool',    '#5B4BB8', 15),
  ('fotografo',        'Fotógrafo',       'Photographer',    'Camera',     '#5B4BB8', 16),
  ('chef',             'Chef',            'Chef',            'ChefHat',    '#5B4BB8', 17),
  ('profesor',         'Profesor',        'Teacher',         'BookOpen',   '#5B4BB8', 18)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- TRANSPORTE (modo "cooperatives")
with c as (select id from public.categories where slug = 'transporte')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order, listing_mode)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord, 'cooperatives' from c,
(values
  ('bus-interprovincial', 'Buses Interprovinciales', 'Inter-prov. Bus', 'Bus',       '#1B97A3', 1),
  ('bus-urbano',          'Buses Urbanos',           'Urban Bus',       'Bus',       '#1B97A3', 2),
  ('taxis',               'Taxis',                   'Taxis',           'Car',       '#F39C3E', 3),
  ('camionetas',          'Camionetas',              'Pickup',          'Truck',     '#3B2EAD', 4),
  ('camiones',            'Camiones de Carga',       'Cargo Trucks',    'TruckIcon', '#6B7280', 5),
  ('escolares',           'Transporte Escolar',      'School Transport','BookOpen',  '#16A34A', 6),
  ('turismo',             'Transporte Turístico',    'Tourism Transp.', 'Plane',     '#5B4BB8', 7)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- AGROINDUSTRIA
with c as (select id from public.categories where slug = 'agroindustria')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('lecheras',     'Centros de Acopio',  'Dairy Centers',   'Milk',     '#16A34A', 1),
  ('queseras',     'Queseras Artesanales','Cheese Makers',  'Cake',     '#16A34A', 2),
  ('floricolas',   'Florícolas',         'Flower Farms',    'Flower',   '#16A34A', 3),
  ('viveros',      'Viveros',            'Nurseries',       'Sprout',   '#16A34A', 4),
  ('granjas',      'Granjas Integrales', 'Farms',           'Trees',    '#16A34A', 5),
  ('apicultores',  'Apicultores',        'Beekeepers',      'Hexagon',  '#16A34A', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- BELLEZA
with c as (select id from public.categories where slug = 'belleza')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('peluquerias',  'Peluquerías',     'Hair Salons',    'Scissors',   '#EC4899', 1),
  ('barberias',    'Barberías',       'Barbershops',    'Scissors',   '#EC4899', 2),
  ('spa',          'Spa y Masajes',   'Spa',            'Sparkles',   '#EC4899', 3),
  ('manicure',     'Manicure',        'Nails',          'Hand',       '#EC4899', 4),
  ('gimnasios',    'Gimnasios',       'Gyms',           'Dumbbell',   '#EC4899', 5),
  ('estetica',     'Estética',        'Aesthetics',     'Smile',      '#EC4899', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- SERVICIOS TÉCNICOS
with c as (select id from public.categories where slug = 'servicios-tecnicos')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('computadoras',  'Computadoras y Celulares','Tech Repair',  'Laptop',    '#0EA5E9', 1),
  ('internet',      'Internet y Cable',        'ISP',          'Wifi',      '#0EA5E9', 2),
  ('refrigeracion', 'Refrigeración',           'Refrigeration','Refrigerator','#0EA5E9', 3),
  ('electrodomesticos','Electrodomésticos',    'Appliances',   'Tv',        '#0EA5E9', 4),
  ('cerrajeros',    'Cerrajeros',              'Locksmiths',   'KeyRound',  '#0EA5E9', 5),
  ('jardineria',    'Jardinería',              'Gardening',    'Flower2',   '#0EA5E9', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- FINANZAS
with c as (select id from public.categories where slug = 'finanzas')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('bancos',       'Bancos',                'Banks',         'Landmark',   '#0F766E', 1),
  ('cooperativas-ahorro','Coop. de Ahorro', 'Credit Unions', 'PiggyBank',  '#0F766E', 2),
  ('cajeros',      'Cajeros Automáticos',   'ATMs',          'CreditCard', '#0F766E', 3),
  ('seguros',      'Seguros',               'Insurance',     'ShieldCheck','#0F766E', 4),
  ('cambio',       'Casas de Cambio',       'Exchange',      'DollarSign', '#0F766E', 5),
  ('giros',        'Giros y Remesas',       'Money Transfer','Send',       '#0F766E', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;

-- EMERGENCIAS
with c as (select id from public.categories where slug = 'emergencias')
insert into public.categories (parent_id, slug, name_es, name_en, icon, color, sort_order)
select c.id, v.slug, v.es, v.en, v.icon, v.color, v.ord from c,
(values
  ('911',          'ECU 911',           '911',            'PhoneCall',  '#DC2626', 1),
  ('cruz-roja',    'Cruz Roja',         'Red Cross',      'Cross',      '#DC2626', 2),
  ('bomberos-em',  'Bomberos',          'Firefighters',   'Flame',      '#DC2626', 3),
  ('policia-em',   'Policía',           'Police',         'Shield',     '#DC2626', 4),
  ('ambulancias',  'Ambulancias',       'Ambulances',     'Ambulance',  '#DC2626', 5),
  ('transito',     'Tránsito',          'Traffic',        'TrafficCone','#DC2626', 6)
) as v(slug,es,en,icon,color,ord)
on conflict (slug) do nothing;
