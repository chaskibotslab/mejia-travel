-- =====================================================================
-- RUTA DE LOS DULCES — carga de los locales REALES (Ruta_de_los_Dulces_locales.csv)
-- Ejecutar en el SQL Editor de Supabase PRODUCCIÓN, DESPUÉS de ruta_dulces.sql
--
-- 1) Borra SOLO los 30 locales ficticios del seed demo (por nombre exacto).
--    Los locales reales que se agregaron a mano desde el admin NO se tocan.
-- 2) Inserta los 86 locales del CSV. Si alguno ya existe en la ruta con el
--    mismo nombre, no se duplica. Es seguro volver a ejecutarlo.
-- 3) Renumera el orden: primero los locales que ya estaban, luego los del CSV.
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

-- 2) Insertar los locales reales del CSV
with r as (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, stop_order, address, parish, phone, geo_status)
select r.id, v.name, v.descr, v.lat, v.lng, 1000 + v.ord, v.addr, 'Machachi', v.phone, v.geo from r,
(values
  ('Cafetería ¡Qué Verde!', 'Cafetería', -0.5030409::numeric, -78.5718379::numeric, 1, 'Sector La Bomba, Av. Pablo Guarderas', '+593 96 999 0463', 'verified'),
  ('AGROAHORRO', 'Agropecuaria', -0.5127326::numeric, -78.568956::numeric, 2, '11 de Noviembre y Pérez Pareja', '+593 99 594 5684', 'verified'),
  ('Consultorio Odontológico Smiling', 'Salud', -0.514972::numeric, -78.5667328::numeric, 3, 'Luis Felipe Barriga y Luis Cordero', '+593 99 594 5684', 'verified'),
  ('Curva de la Tilapia', 'Restaurante', -0.5068399::numeric, -78.5633483::numeric, 4, null, '+593 96 295 7200', 'verified'),
  ('Eimmy Estética & Studio', 'Belleza', -0.5103337::numeric, -78.5657251::numeric, 5, 'Sucre y Pérez Pareja', '+593 96 975 6678', 'verified'),
  ('Repuestos Kit Color', 'Repuestos', -0.5129758::numeric, -78.5680371::numeric, 6, null, '+593 96 865 7210', 'verified'),
  ('Fisiomedical SANUS – Rehabilitación Física y Deportiva', 'Salud', -0.5045292::numeric, -78.5704775::numeric, 7, null, '+593 96 137 2890', 'verified'),
  ('Chocosoo y Panadería España', 'Dulces / Panadería', -0.5117332::numeric, -78.5675898::numeric, 8, null, '+593 98 495 5081', 'verified'),
  ('Mandala – Centro de Apoyo Educativo y Psicológico', 'Educación', -0.5110237::numeric, -78.567713::numeric, 9, 'Gran Colombia y Av. Cristóbal Colón', null, 'verified'),
  ('Glam Studio by Estefy', 'Belleza', -0.51189707::numeric, -78.56794256::numeric, 10, null, '+593 99 512 8179', 'verified'),
  ('Ortopedia Machachi', 'Salud', -0.5002688::numeric, -78.572226::numeric, 11, null, '+593 99 985 3374', 'verified'),
  ('PuntoFarma Machachi', 'Farmacia', -0.50627256::numeric, -78.56949719::numeric, 12, null, '+593 98 246 9559', 'verified'),
  ('Pastelería y Bocaditos Roma', 'Dulces / Pastelería', -0.5142936::numeric, -78.5682297::numeric, 13, null, '+593 98 344 9576', 'verified'),
  ('R•T Beauty Studio Damas y Caballeros', 'Belleza', -0.5126258::numeric, -78.5682204::numeric, 14, null, '+593 99 369 7035', 'verified'),
  ('Naguara Cell', 'Celulares', -0.51579::numeric, -78.56877::numeric, 15, null, '+593 99 312 7280', 'verified'),
  ('Shellpet Vet & Spa', 'Mascotas', -0.5208069::numeric, -78.5732865::numeric, 16, 'Calle Capulíes', '+593 98 741 7476', 'verified'),
  ('Bela Studio', 'Belleza', -0.512295::numeric, -78.567083::numeric, 17, null, '+593 99 533 0827', 'verified'),
  ('Moda BIF', 'Ropa', -0.5118946::numeric, -78.5679245::numeric, 18, null, '+593 99 764 4428', 'verified'),
  ('Gglobal Agrot', 'Agropecuaria', -0.5163223::numeric, -78.5676872::numeric, 19, '11 de Noviembre y Barriga', '+593 98 725 0942', 'verified'),
  ('Kiddies Consultorio Odontológico', 'Salud', -0.5109571::numeric, -78.5672022::numeric, 20, null, '+593 98 329 8503', 'verified'),
  ('Luna Boutique', 'Ropa', -0.5122155::numeric, -78.5684882::numeric, 21, 'Luis Cordero y Pérez Pareja', '+593 99 268 8478', 'approx'),
  ('Glamour, Belleza y Perfumería', 'Belleza', -0.5133132::numeric, -78.5680846::numeric, 22, 'Mercado Central de Machachi, local #76', '+593 98 496 9551', 'verified'),
  ('Rey Lechón Restaurante', 'Restaurante', -0.5067437::numeric, -78.5688909::numeric, 23, null, '+593 99 554 6637', 'verified'),
  ('Óptica Perfect View', 'Óptica', -0.5126661::numeric, -78.5676232::numeric, 24, null, '+593 96 896 9609', 'verified'),
  ('Boutique Samelia', 'Ropa', -0.5100182::numeric, -78.5695724::numeric, 25, 'Luis Cordero y El Hogar', '+593 98 013 5635', 'verified'),
  ('Musa Rosa', 'Ropa', -0.5109518::numeric, -78.5654221::numeric, 26, 'Sucre y Pérez Pareja, junto a la Notaría 2', '+593 95 993 4664', 'verified'),
  ('Carminian Designs', 'Manualidades', -0.5105593::numeric, -78.5669329::numeric, 27, 'Gran Colombia E-47 entre Cristóbal Colón y Bolívar, diagonal a CBVision', '+593 98 459 0527', 'verified'),
  ('Punto Guau Machachi', 'Mascotas', -0.5100841::numeric, -78.5730529::numeric, 28, null, '+593 98 763 3291', 'verified'),
  ('Ópticas Visión Social', 'Óptica', -0.5118199::numeric, -78.5678335::numeric, 29, null, '+593 99 990 7972', 'verified'),
  ('Alquiler de Oxígeno Medicinal', 'Salud', -0.5160374::numeric, -78.564409::numeric, 30, null, null, 'verified'),
  ('Tecnocenter "El Colombiano"', 'Tecnología', -0.5132748::numeric, -78.5669796::numeric, 31, null, '+593 98 408 5659', 'verified'),
  ('CEMEBI', 'Salud', -0.5030546::numeric, -78.5719102::numeric, 32, null, '+593 98 354 8541', 'verified'),
  ('Fashion Sport', 'Ropa', -0.5123975::numeric, -78.5684336::numeric, 33, 'Luis Cordero y Pérez Pareja', '+593 99 534 0257', 'verified'),
  ('Nayely Boutique', 'Ropa', -0.5123699::numeric, -78.5702789::numeric, 34, 'Antonio Benítez', '+593 95 998 2193', 'verified'),
  ('Acuario Daud', 'Mascotas', -0.51134617::numeric, -78.57084943::numeric, 35, null, '+593 99 520 6203', 'verified'),
  ('Lía Studio Nails', 'Belleza', -0.5148152::numeric, -78.5711424::numeric, 36, 'Av. Amazonas y Rafael Arroba', '+593 93 964 6748', 'verified'),
  ('Fragance', 'Perfumería', -0.5125154::numeric, -78.5674594::numeric, 37, 'Pasaje José Mejía y González Suárez', '+593 99 848 1889', 'verified'),
  ('Leicester English Academy', 'Educación', -0.5107627::numeric, -78.5706769::numeric, 38, null, '+593 95 864 3659', 'verified'),
  ('R&N Shop', 'Tienda', -0.5123217::numeric, -78.5675334::numeric, 39, null, '+593 96 104 3315', 'verified'),
  ('Calzado Leo''s', 'Calzado', -0.510459::numeric, -78.5648125::numeric, 40, null, '+593 98 193 3864', 'verified'),
  ('Daliz Fashion Boutique', 'Ropa', -0.510284::numeric, -78.5664661::numeric, 41, null, '+593 98 190 6245', 'verified'),
  ('Productos de Limpieza a Granel Jeniffer', 'Limpieza', -0.5132983::numeric, -78.5684221::numeric, 42, null, '+593 98 324 6816', 'verified'),
  ('Esencia', 'Tienda', -0.5110665::numeric, -78.5644875::numeric, 43, 'José Mejía y Nueva España', '+593 98 758 3646', 'verified'),
  ('Krusty Cheese Burger', 'Restaurante', -0.5084394::numeric, -78.5685278::numeric, 44, 'Frente al Parque Manantial de los Volcanes', '+593 99 812 3379', 'verified'),
  ('Distribuidora Amillshop', 'Tienda', -0.5120574::numeric, -78.5682314::numeric, 45, null, '+593 96 801 2775', 'verified'),
  ('Colada Morada de Atocha', 'Dulces / Comida típica', -0.5157655::numeric, -78.5666046::numeric, 46, null, '+593 96 226 1076', 'verified'),
  ('Cevichería La Marinera', 'Restaurante', -0.51605786::numeric, -78.5703331::numeric, 47, null, '+593 97 986 3584', 'verified'),
  ('A&N Celumarket', 'Celulares', -0.5127711::numeric, -78.5672155::numeric, 48, null, '+593 98 602 8087', 'verified'),
  ('D''Camila Pizzería', 'Restaurante', -0.5096734::numeric, -78.5651184::numeric, 49, null, '+593 96 832 8564', 'verified'),
  ('Dulzuras JM', 'Dulces', -0.5127864::numeric, -78.5668078::numeric, 50, null, '+593 96 274 0831', 'verified'),
  ('Fono Kids', 'Salud', -0.51111987::numeric, -78.56707645::numeric, 51, null, '+593 96 319 6414', 'verified'),
  ('Koketas Spa y Maquillaje', 'Belleza', -0.5095486::numeric, -78.5649472::numeric, 52, null, '+593 99 700 2114', 'verified'),
  ('Hotel Valle Azul', 'Hospedaje', -0.5020739::numeric, -78.5659789::numeric, 53, 'Jaime Roldós Aguilera 8-20', null, 'verified'),
  ('GOQUI Store', 'Tienda', -0.5149466::numeric, -78.5712292::numeric, 54, null, '+593 99 882 9997', 'verified'),
  ('Modas Glory', 'Ropa', -0.5100436::numeric, -78.564335::numeric, 55, null, '+593 99 638 1552', 'verified'),
  ('Marcitex DTF', 'Estampados', -0.5125853::numeric, -78.5701801::numeric, 56, null, '+593 98 633 0876', 'verified'),
  ('GluGluGlu Lavandería de Zapatillas', 'Servicios', -0.5149161::numeric, -78.5649733::numeric, 57, null, '+593 98 212 3055', 'verified'),
  ('GOAT SM Sport', 'Deportes', -0.5133607::numeric, -78.5682605::numeric, 58, 'Mercado Central, local #20', '+593 99 923 0598', 'verified'),
  ('El Frigo de mi Barrio Machachi', 'Tienda', -0.5111825::numeric, -78.5654276::numeric, 59, null, '+593 99 900 6671', 'verified'),
  ('Sangucho Sport', 'Confección de ropa deportiva', -0.5101765::numeric, -78.5662268::numeric, 60, null, '+593 99 475 4712', 'verified'),
  ('Unidad Educativa Terry Jim', 'Educación', -0.5144596::numeric, -78.5724342::numeric, 61, null, '+593 99 477 7454', 'verified'),
  ('Bokka Dental Studio', 'Salud', -0.51552762::numeric, -78.56466569::numeric, 62, null, '+593 99 871 6380', 'verified'),
  ('Salón El Monchito Jr', 'Belleza', -0.516062::numeric, -78.579256::numeric, 63, null, '+593 99 805 4644', 'approx'),
  ('Mr. Crepes y Waffles Granizo''s', 'Dulces / Postres', -0.5149412::numeric, -78.5712226::numeric, 64, null, '+593 98 785 2990', 'verified'),
  ('Licorería 7 Gotas', 'Licorería', -0.5164533::numeric, -78.5712862::numeric, 65, '10 de Agosto', null, 'verified'),
  ('Amy Dent', 'Salud', -0.5143078::numeric, -78.5656359::numeric, 66, null, '+593 99 245 9586', 'verified'),
  ('R&F Global Security', 'Seguridad', -0.5078334::numeric, -78.5685105::numeric, 67, null, '+593 98 912 2191', 'verified'),
  ('Farmacia Cruz Azul Pablo Guarderas', 'Farmacia', -0.5051249::numeric, -78.5704205::numeric, 68, null, '+593 98 858 7809', 'verified'),
  ('JosMatFer Asesoría Jurídica', 'Servicios legales', -0.5157557::numeric, -78.5645594::numeric, 69, null, '+593 98 390 0365', 'verified'),
  ('Equilibrio', 'Salud / Bienestar', -0.51374412::numeric, -78.56620917::numeric, 70, '10 de Agosto y González Suárez', '+593 99 522 7539', 'verified'),
  ('ANIMALAB Cía. Ltda.', 'Mascotas', -0.5061921::numeric, -78.5694675::numeric, 71, null, '+593 99 706 0045', 'verified'),
  ('La Villa del Sabor', 'Restaurante', -0.5132::numeric, -78.566902::numeric, 72, 'González Suárez', '+593 97 932 6320', 'verified'),
  ('La Hueca de los Secos', 'Restaurante', -0.51167357::numeric, -78.56693868::numeric, 73, 'Av. Cristóbal Colón y Pérez Pareja N1-63', '+593 96 317 7582', 'verified'),
  ('Créditos Rocío', 'Servicios', -0.5126845::numeric, -78.5689697::numeric, 74, null, '+593 98 996 2507', 'verified'),
  ('Los Trapitos de Derek', 'Ropa', -0.51331659::numeric, -78.56889112::numeric, 75, null, '+593 98 488 4928', 'verified'),
  ('Auxilio Celular', 'Celulares', -0.51175857::numeric, -78.56674957::numeric, 76, null, '+593 98 353 4403', 'verified'),
  ('Criska Bebé', 'Ropa', -0.51431048::numeric, -78.56635284::numeric, 77, null, '+593 97 936 4298', 'verified'),
  ('Restaurante "Don Carlitos"', 'Restaurante', -0.5105336::numeric, -78.5669539::numeric, 78, null, '+593 96 274 5017', 'verified'),
  ('La Matriarca – Herencia del Sabor', 'Restaurante', -0.5157152::numeric, -78.5665717::numeric, 79, null, '+593 98 483 4101', 'verified'),
  ('Laboratorio L.B.C', 'Salud', -0.5121263::numeric, -78.5684975::numeric, 80, 'Calle Luis Cordero', '+593 96 361 5218', 'approx'),
  ('D''nina Studio', 'Belleza', -0.51082456::numeric, -78.56588745::numeric, 81, null, '+593 99 907 7604', 'verified'),
  ('Style Magic by Wendy Carua', 'Belleza', -0.5176762::numeric, -78.5660693::numeric, 82, null, '+593 98 434 0832', 'verified'),
  ('Consultorio Obstétrico Carmen Guerrero Lisintuña', 'Salud', -0.51538819::numeric, -78.56935883::numeric, 83, null, '+593 99 893 6284', 'verified'),
  ('Cevichao Machachi', 'Restaurante', -0.51126339::numeric, -78.56535407::numeric, 84, 'Sucre y José Mejía', '+593 99 723 0624', 'verified'),
  ('Doba Home', 'Tienda', -0.5137501::numeric, -78.5679802::numeric, 85, null, '+593 99 762 9784', 'verified'),
  ('Escuela de Breaking Yeshua', 'Educación', -0.5137751::numeric, -78.5619594::numeric, 86, null, '+593 98 456 0387', 'verified')
) as v(name, descr, lat, lng, ord, addr, phone, geo)
where not exists (
  select 1 from public.tourist_route_stops s
  where s.route_id = r.id and lower(trim(s.name)) = lower(trim(v.name))
);

-- 3) Renumerar 1..N (los que ya estaban primero, en su orden; luego el CSV)
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

-- Verificación: debería mostrar los 4 locales que ya tenías + 86 del CSV
select stop_order, name, description, address, phone, geo_status
from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
order by stop_order;
