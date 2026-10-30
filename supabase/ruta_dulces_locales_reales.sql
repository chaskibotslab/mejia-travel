-- =====================================================================
-- RUTA DE LOS DULCES — sincroniza los locales REALES (Ruta_de_los_Dulces_locales.csv)
-- Ejecutar en el SQL Editor de Supabase PRODUCCIÓN, DESPUÉS de ruta_dulces.sql
--
-- Seguro de ejecutar varias veces (cada vez que se actualice el Excel):
-- 1) Borra SOLO los 30 locales ficticios del seed demo (por nombre exacto).
-- 2) Los locales que ya existen (mismo nombre) se ACTUALIZAN con los datos del CSV.
-- 3) Los que no existen se AGREGAN al final.
-- 4) Los locales agregados a mano desde el admin que no están en el CSV NO se tocan.
--
-- Datos publicados: nombre, categoría (descripción), dirección, teléfono y
-- ubicación. Las notas internas del CSV ("solo mandó el link", etc.) NO se suben.
-- =====================================================================

begin;

-- 1) Quitar los locales ficticios del seed demo
delete from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
  and name in (
    'Panadería La Calabaza', 'Tienda Don Fantasma', 'Farmacia Luna Llena', 'Heladería El Murciélago',
    'Ferretería Escoba Mágica', 'Cafetería La Bruja Buena', 'Minimarket El Caldero', 'Papelería Calavera Feliz',
    'Pastelería Telaraña', 'Óptica Ojo de Gato', 'Juguetería El Duende', 'Restaurante La Momia',
    'Bazar Las Calabacitas', 'Dulcería El Vampiro', 'Peluquería La Araña', 'Licorería Noche de Brujas',
    'Panadería Pan de Muerto', 'Tienda Mi Calabacín', 'Cyber El Esqueleto', 'Florería Rosa Negra',
    'Zapatería Bota de Bruja', 'Frutería La Manzana Encantada', 'Lavandería Sábana Fantasma', 'Asadero El Hombre Lobo',
    'Librería El Hechizo', 'Abarrotes La Linterna', 'Veterinaria Gato Negro', 'Chocolatería Noche Oscura',
    'Tienda El Castillo Embrujado', 'Parque Central de Machachi'
  );

-- Nombres que cambiaron en el Excel (para no duplicar el local)
update public.tourist_route_stops
set name = 'C-Salud – Alquiler y Venta de Oxígeno Medicinal'
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
  and name = 'Alquiler de Oxígeno Medicinal'
  and not exists (
    select 1 from public.tourist_route_stops
    where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
      and name = 'C-Salud – Alquiler y Venta de Oxígeno Medicinal'
  );

create temp table _locales (name text, descr text, lat numeric, lng numeric, ord int, addr text, phone text, geo text) on commit drop;

insert into _locales (name, descr, lat, lng, ord, addr, phone, geo) values
  ('Cafetería ¡Qué Verde!', 'Cafetería', -0.5030409, -78.5718379, 1, 'Sector La Bomba, Av. Pablo Guarderas', '+593 96 999 0463', 'verified'),
  ('AGROAHORRO', 'Agropecuaria', -0.5127326, -78.568956, 2, '11 de Noviembre y Pérez Pareja', '+593 99 594 5684', 'verified'),
  ('Consultorio Odontológico Smiling', 'Salud', -0.514972, -78.5667328, 3, 'Luis Felipe Barriga y Luis Cordero', '+593 99 594 5684', 'verified'),
  ('Curva de la Tilapia', 'Restaurante', -0.5068399, -78.5633483, 4, null, '+593 96 295 7200', 'verified'),
  ('Eimmy Estética & Studio', 'Belleza', -0.5103337, -78.5657251, 5, 'Sucre y Pérez Pareja', '+593 96 975 6678', 'verified'),
  ('Repuestos Kit Color', 'Repuestos', -0.5129758, -78.5680371, 6, null, '+593 96 865 7210', 'verified'),
  ('Fisiomedical SANUS – Rehabilitación Física y Deportiva', 'Salud', -0.5045292, -78.5704775, 7, null, '+593 96 137 2890', 'verified'),
  ('Chocosoo y Panadería España', 'Dulces / Panadería', -0.5117332, -78.5675898, 8, null, '+593 98 495 5081', 'verified'),
  ('Mandala – Centro de Apoyo Educativo y Psicológico', 'Educación', -0.5110237, -78.567713, 9, 'Gran Colombia y Av. Cristóbal Colón', null, 'verified'),
  ('Glam Studio by Estefy', 'Belleza', -0.51189707, -78.56794256, 10, null, '+593 99 512 8179', 'verified'),
  ('Ortopedia Machachi', 'Salud', -0.5002688, -78.572226, 11, null, '+593 99 985 3374', 'verified'),
  ('PuntoFarma Machachi', 'Farmacia', -0.50627256, -78.56949719, 12, null, '+593 98 246 9559', 'verified'),
  ('Pastelería y Bocaditos Roma', 'Dulces / Pastelería', -0.5142936, -78.5682297, 13, null, '+593 98 344 9576', 'verified'),
  ('R•T Beauty Studio Damas y Caballeros', 'Belleza', -0.5126258, -78.5682204, 14, null, '+593 99 369 7035', 'verified'),
  ('Naguara Cell', 'Celulares', -0.51579, -78.56877, 15, null, '+593 99 312 7280', 'verified'),
  ('Shellpet Vet & Spa', 'Mascotas', -0.5208069, -78.5732865, 16, 'Calle Capulíes', '+593 98 741 7476', 'verified'),
  ('Bela Studio', 'Belleza', -0.512295, -78.567083, 17, null, '+593 99 533 0827', 'verified'),
  ('Moda BIF', 'Ropa', -0.5118946, -78.5679245, 18, null, '+593 99 764 4428', 'verified'),
  ('Gglobal Agrot', 'Agropecuaria', -0.5163223, -78.5676872, 19, '11 de Noviembre y Barriga', '+593 98 725 0942', 'verified'),
  ('Kiddies Consultorio Odontológico', 'Salud', -0.5109571, -78.5672022, 20, null, '+593 98 329 8503', 'verified'),
  ('Luna Boutique', 'Ropa', -0.5122155, -78.5684882, 21, 'Luis Cordero y Pérez Pareja', '+593 99 268 8478', 'approx'),
  ('Glamour, Belleza y Perfumería', 'Belleza', -0.5133009018780362, -78.56834056131095, 22, 'Mercado Central de Machachi, local #76', '+593 98 496 9551', 'verified'),
  ('Rey Lechón Restaurante', 'Restaurante', -0.5067437, -78.5688909, 23, null, '+593 99 554 6637', 'verified'),
  ('Óptica Perfect View', 'Óptica', -0.5126661, -78.5676232, 24, null, '+593 96 896 9609', 'verified'),
  ('Boutique Samelia', 'Ropa', -0.5100182, -78.5695724, 25, 'Luis Cordero y El Hogar', '+593 98 013 5635', 'verified'),
  ('Musa Rosa', 'Ropa', -0.5109518, -78.5654221, 26, 'Sucre y Pérez Pareja, junto a la Notaría 2', '+593 95 993 4664', 'verified'),
  ('Carminian Designs', 'Manualidades', -0.5105593, -78.5669329, 27, 'Gran Colombia E-47 entre Cristóbal Colón y Bolívar, diagonal a CBVision', '+593 98 459 0527', 'verified'),
  ('Punto Guau Machachi', 'Mascotas', -0.5100841, -78.5730529, 28, null, '+593 98 763 3291', 'verified'),
  ('Ópticas Visión Social', 'Óptica', -0.5118199, -78.5678335, 29, null, '+593 99 990 7972', 'verified'),
  ('C-Salud – Alquiler y Venta de Oxígeno Medicinal', 'Salud', -0.5160374, -78.564409, 30, null, null, 'verified'),
  ('Tecnocenter "El Colombiano"', 'Tecnología', -0.5132748, -78.5669796, 31, null, '+593 98 408 5659', 'verified'),
  ('CEMEBI', 'Salud', -0.5030546, -78.5719102, 32, null, '+593 98 354 8541', 'verified'),
  ('Fashion Sport', 'Ropa', -0.5123975, -78.5684336, 33, 'Luis Cordero y Pérez Pareja', '+593 99 534 0257', 'verified'),
  ('Nayely Boutique', 'Ropa', -0.5123699, -78.5702789, 34, 'Antonio Benítez', '+593 95 998 2193', 'verified'),
  ('Acuario Daud', 'Mascotas', -0.51134617, -78.57084943, 35, null, '+593 99 520 6203', 'verified'),
  ('Lía Studio Nails', 'Belleza', -0.5148152, -78.5711424, 36, 'Av. Amazonas y Rafael Arroba', '+593 93 964 6748', 'verified'),
  ('Fragance', 'Perfumería', -0.5125154, -78.5674594, 37, 'Pasaje José Mejía y González Suárez', '+593 99 848 1889', 'verified'),
  ('Leicester English Academy', 'Educación', -0.5107627, -78.5706769, 38, null, '+593 95 864 3659', 'verified'),
  ('R&N Shop', 'Tienda', -0.5123217, -78.5675334, 39, null, '+593 96 104 3315', 'verified'),
  ('Calzado Leo''s', 'Calzado', -0.510459, -78.5648125, 40, null, '+593 98 193 3864', 'verified'),
  ('Daliz Fashion Boutique', 'Ropa', -0.510284, -78.5664661, 41, null, '+593 98 190 6245', 'verified'),
  ('Productos de Limpieza a Granel Jeniffer', 'Limpieza', -0.5132983, -78.5684221, 42, null, '+593 98 324 6816', 'verified'),
  ('Esencia', 'Tienda', -0.5110665, -78.5644875, 43, 'José Mejía y Nueva España', '+593 98 758 3646', 'verified'),
  ('Krusty Cheese Burger', 'Restaurante', -0.5084394, -78.5685278, 44, 'Frente al Parque Manantial de los Volcanes', '+593 99 812 3379', 'verified'),
  ('Distribuidora Amillshop', 'Tienda', -0.5120574, -78.5682314, 45, null, '+593 96 801 2775', 'verified'),
  ('Colada Morada de Atocha', 'Dulces / Comida típica', -0.5157655, -78.5666046, 46, null, '+593 96 226 1076', 'verified'),
  ('Cevichería La Marinera', 'Restaurante', -0.51605786, -78.5703331, 47, null, '+593 97 986 3584', 'verified'),
  ('A&N Celumarket', 'Celulares', -0.5127711, -78.5672155, 48, null, '+593 98 602 8087', 'verified'),
  ('D''Camila Pizzería', 'Restaurante', -0.5096734, -78.5651184, 49, null, '+593 96 832 8564', 'verified'),
  ('Dulzuras JM', 'Dulces', -0.5127864, -78.5668078, 50, null, '+593 96 274 0831', 'verified'),
  ('Fono Kids', 'Salud', -0.51111987, -78.56707645, 51, null, '+593 96 319 6414', 'verified'),
  ('Koketas Spa y Maquillaje', 'Belleza', -0.5095486, -78.5649472, 52, null, '+593 99 700 2114', 'verified'),
  ('Hotel Valle Azul', 'Hospedaje', -0.5020739, -78.5659789, 53, 'Jaime Roldós Aguilera 8-20', null, 'verified'),
  ('GOQUI Store', 'Tienda', -0.5149466, -78.5712292, 54, null, '+593 99 882 9997', 'verified'),
  ('Modas Glory', 'Ropa', -0.5100436, -78.564335, 55, null, '+593 99 638 1552', 'verified'),
  ('Marcitex DTF', 'Estampados', -0.5125853, -78.5701801, 56, null, '+593 98 633 0876', 'verified'),
  ('GluGluGlu Lavandería de Zapatillas', 'Servicios', -0.5149161, -78.5649733, 57, null, '+593 98 212 3055', 'verified'),
  ('GOAT SM Sport', 'Deportes', -0.5133009018780362, -78.56834056131095, 58, 'Mercado Central, local #20', '+593 99 923 0598', 'verified'),
  ('El Frigo de mi Barrio Machachi', 'Tienda', -0.5111825, -78.5654276, 59, null, '+593 99 900 6671', 'verified'),
  ('Sangucho Sport', 'Confección de ropa deportiva', -0.5101765, -78.5662268, 60, null, '+593 99 475 4712', 'verified'),
  ('Unidad Educativa Terry Jim', 'Educación', -0.5144596, -78.5724342, 61, null, '+593 99 477 7454', 'verified'),
  ('Bokka Dental Studio', 'Salud', -0.51552762, -78.56466569, 62, null, '+593 99 871 6380', 'verified'),
  ('Salón El Monchito Jr', 'Belleza', -0.516062, -78.579256, 63, null, '+593 99 805 4644', 'approx'),
  ('Mr. Crepes y Waffles Granizo''s', 'Dulces / Postres', -0.5149412, -78.5712226, 64, null, '+593 98 785 2990', 'verified'),
  ('Licorería 7 Gotas', 'Licorería', -0.5164533, -78.5712862, 65, '10 de Agosto', null, 'verified'),
  ('Amy Dent', 'Salud', -0.5143078, -78.5656359, 66, null, '+593 99 245 9586', 'verified'),
  ('R&F Global Security', 'Seguridad', -0.5078334, -78.5685105, 67, null, '+593 98 912 2191', 'verified'),
  ('Farmacia Cruz Azul Pablo Guarderas', 'Farmacia', -0.5051249, -78.5704205, 68, null, '+593 98 858 7809', 'verified'),
  ('JosMatFer Asesoría Jurídica', 'Servicios legales', -0.5157557, -78.5645594, 69, null, '+593 98 390 0365', 'verified'),
  ('Equilibrio', 'Salud / Bienestar', -0.51374412, -78.56620917, 70, '10 de Agosto y González Suárez', '+593 99 522 7539', 'verified'),
  ('ANIMALAB Cía. Ltda.', 'Mascotas', -0.5061921, -78.5694675, 71, null, '+593 99 706 0045', 'verified'),
  ('La Villa del Sabor', 'Restaurante', -0.5132, -78.566902, 72, 'González Suárez', '+593 97 932 6320', 'verified'),
  ('La Hueca de los Secos', 'Restaurante', -0.51167357, -78.56693868, 73, 'Av. Cristóbal Colón y Pérez Pareja N1-63', '+593 96 317 7582', 'verified'),
  ('Créditos Rocío', 'Servicios', -0.5126845, -78.5689697, 74, null, '+593 98 996 2507', 'verified'),
  ('Los Trapitos de Derek', 'Ropa', -0.51331659, -78.56889112, 75, null, '+593 98 488 4928', 'verified'),
  ('Auxilio Celular', 'Celulares', -0.51175857, -78.56674957, 76, null, '+593 98 353 4403', 'verified'),
  ('Criska Bebé', 'Ropa', -0.51431048, -78.56635284, 77, null, '+593 97 936 4298', 'verified'),
  ('Restaurante "Don Carlitos"', 'Restaurante', -0.5105336, -78.5669539, 78, null, '+593 96 274 5017', 'verified'),
  ('La Matriarca – Herencia del Sabor', 'Restaurante', -0.5157152, -78.5665717, 79, null, '+593 98 483 4101', 'verified'),
  ('Laboratorio L.B.C', 'Salud', -0.5121263, -78.5684975, 80, 'Calle Luis Cordero', '+593 96 361 5218', 'approx'),
  ('D''nina Studio', 'Belleza', -0.51082456, -78.56588745, 81, null, '+593 99 907 7604', 'verified'),
  ('Style Magic by Wendy Carua', 'Belleza', -0.5176762, -78.5660693, 82, null, '+593 98 434 0832', 'verified'),
  ('Consultorio Obstétrico Carmen Guerrero Lisintuña', 'Salud', -0.51538819, -78.56935883, 83, null, '+593 99 893 6284', 'verified'),
  ('Cevichao Machachi', 'Restaurante', -0.51126339, -78.56535407, 84, 'Sucre y José Mejía', '+593 99 723 0624', 'verified'),
  ('Doba Home', 'Tienda', -0.5137501, -78.5679802, 85, null, '+593 99 762 9784', 'verified'),
  ('Escuela de Breaking Yeshua', 'Educación', -0.5137751, -78.5619594, 86, null, '+593 98 456 0387', 'verified'),
  ('Mundo de Exploradores', null, -0.5121976, -78.5720303, 87, null, '+593 99 003 9468', 'verified'),
  ('CHARMI', 'Ropa', -0.511634, -78.5672914, 88, null, '+593 96 333 5099', 'verified'),
  ('Diseños Valentina', 'Modista', -0.5116175, -78.5672694, 89, 'Pérez Pareja y Av. Cristóbal Colón', '+593 96 333 5089', 'verified'),
  ('Capy Food (Restaurante Capy)', 'Restaurante', -0.5127192, -78.5681368, 90, null, '+593 96 360 6358', 'verified'),
  ('Óptica Vista Ágil', 'Óptica', -0.5109477, -78.5671745, 91, null, '+593 98 788 8379', 'verified'),
  ('Ruta Fuego', 'Restaurante', -0.5164215, -78.5714252, 92, null, '+593 99 427 7253', 'verified'),
  ('City Pizza Machachi', 'Restaurante', -0.5144858, -78.5708977, 93, 'Av. Amazonas', '+593 98 487 2124', 'verified'),
  ('Que Bendición Restaurant', 'Restaurante', -0.5132644, -78.5659388, 94, null, '+593 98 408 8196', 'verified'),
  ('Pégate Unito oh te Freseas', null, -0.5109948, -78.5672587, 95, null, '+593 98 953 0050', 'verified'),
  ('PAIDOS CENTER – Atención Psicopedagógica', 'Salud', -0.519446, -78.5744229, 96, null, '+593 93 993 5313', 'verified'),
  ('Hogar y Detalles', 'Tienda', -0.512885, -78.5678217, 97, null, '+593 99 173 9953', 'verified'),
  ('Cyber 4', 'Servicios', -0.5149479, -78.5621265, 98, null, '+593 98 796 4017', 'verified'),
  ('Dulce y Sal Cafetería', 'Dulces / Cafetería', -0.5130005, -78.5643769, 99, null, '+593 99 449 9673', 'verified'),
  ('Fashion May Pris', 'Ropa', -0.5133009018780362, -78.56834056131095, 100, 'Mercado Central de Machachi', '+593 99 240 0011', 'verified'),
  ('Flor Boutique', 'Ropa', -0.5130892, -78.5661926, 101, null, '+593 98 500 1648', 'verified'),
  ('La Hueca del Pescado a Leña del Jr.', 'Restaurante', -0.5118819, -78.5645701, 102, null, '+593 98 876 7714', 'verified'),
  ('Chagri Choclo', 'Restaurante', -0.5171889, -78.5714439, 103, null, '+593 98 739 5699', 'verified'),
  ('Variedades D y D', 'Tienda', -0.5203511, -78.5720505, 104, null, '+593 98 609 2275', 'verified'),
  ('Pizzería Pameliny', 'Restaurante', -0.5169211, -78.5713934, 105, null, '+593 98 830 9482', 'verified'),
  ('La Casona de las Carnes', 'Restaurante', -0.5083189, -78.568627, 106, null, '+593 99 764 8971', 'verified'),
  ('Phin Pollo', 'Restaurante', -0.5093337, -78.5679823, 107, null, '+593 99 764 8971', 'verified'),
  ('Carlos Cola – Centro de Terapias para Reducir el Estrés', 'Salud / Bienestar', -0.516111, -78.564306, 108, null, null, 'verified'),
  ('Agrosolución', 'Agropecuaria', -0.5164994, -78.5714541, 109, 'Calle Néstor Cueva Negrete', '+593 99 503 8230', 'verified'),
  ('Cattaleya Deco – Tienda de Regalos', 'Tienda', -0.5112123, -78.5666809, 110, null, '+593 98 386 5586', 'verified'),
  ('Familia Shoes', 'Calzado', -0.5134964, -78.565955, 111, null, '+593 98 967 8818', 'verified'),
  ('Sportscenter', 'Deportes', -0.5134437, -78.5686482, 112, null, '+593 98 093 3229', 'verified'),
  ('Las Maxi Papas', 'Restaurante', -0.5034507, -78.5714035, 113, null, '+593 98 431 1856', 'verified'),
  ('QUELO''S Campo & Piscina', 'Turismo / Recreación', -0.5049001, -78.5642471, 114, null, '+593 93 958 3000', 'verified'),
  ('Electrocell', 'Celulares', -0.5133009018780362, -78.56834056131095, 115, 'Mercado Central de Machachi, planta baja, local 79', '+593 99 638 7812', 'verified'),
  ('Jugos Naturales Merceditas', 'Jugos / Dulces', -0.5133009018780362, -78.56834056131095, 116, 'Av. Amazonas y Luis Cordero (esquina), junto al Mercado Central', '+593 93 975 2739', 'verified'),
  ('Jugos Naturales Merceditas 2', 'Jugos / Dulces', -0.5034592165287098, -78.56875754035178, 117, 'Junto al Polideportivo', '+593 93 962 2549', 'verified');

-- 2) Actualizar los que ya existen
update public.tourist_route_stops s
set description = v.descr, latitude = v.lat, longitude = v.lng, address = v.addr,
    phone = v.phone, geo_status = v.geo, parish = 'Machachi'
from _locales v
where s.route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
  and lower(trim(s.name)) = lower(trim(v.name));

-- 3) Agregar los nuevos
with r as (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, stop_order, address, parish, phone, geo_status)
select r.id, v.name, v.descr, v.lat, v.lng, 1000 + v.ord, v.addr, 'Machachi', v.phone, v.geo
from r, _locales v
where not exists (
  select 1 from public.tourist_route_stops s
  where s.route_id = r.id and lower(trim(s.name)) = lower(trim(v.name))
);

-- 4) Renumerar 1..N (los que ya estaban primero, en su orden; luego los nuevos)
update public.tourist_route_stops s
set stop_order = o.n
from (
  select id, row_number() over (order by stop_order, created_at) as n
  from public.tourist_route_stops
  where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
) o
where s.id = o.id;

-- El texto demo decía "Más de 200 locales"; solo se cambia si nadie lo editó
update public.tourist_routes
set short_description = 'Los locales del Cantón Mejía entregan dulces este Halloween', updated_at = now()
where slug = 'ruta-de-los-dulces'
  and short_description = 'Más de 200 locales entregan dulces este Halloween';

commit;

-- Verificación: total de locales y lista completa
select count(*) as total_locales
from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces');

select stop_order, name, description, address, phone, geo_status
from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
order by stop_order;
