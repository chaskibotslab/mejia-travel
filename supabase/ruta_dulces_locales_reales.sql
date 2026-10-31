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

-- 2) y 3) En una sola instrucción: actualiza los que ya existen (mismo nombre)
--    y agrega los nuevos al final
with v (name, descr, lat, lng, ord, addr, phone, geo) as (
values
  ('JB Laboratorios de Diagnóstico Clínico', 'Salud', -0.50890760027579, -78.57002645731, 1, null, null, 'verified'),
  ('Cafetería ¡Qué Verde!', 'Cafetería', -0.5030409, -78.5718379, 2, 'Sector La Bomba, Av. Pablo Guarderas', '+593 96 999 0463', 'verified'),
  ('AGROAHORRO', 'Agropecuaria', -0.5127326, -78.568956, 3, '11 de Noviembre y Pérez Pareja', '+593 99 594 5684', 'verified'),
  ('Consultorio Odontológico Smiling', 'Salud', -0.514972, -78.5667328, 4, 'Luis Felipe Barriga y Luis Cordero', '+593 99 594 5684', 'verified'),
  ('Curva de la Tilapia', 'Restaurante', -0.5068399, -78.5633483, 5, null, '+593 96 295 7200', 'verified'),
  ('Eimmy Estética & Studio', 'Belleza', -0.5103337, -78.5657251, 6, 'Sucre y Pérez Pareja', '+593 96 975 6678', 'verified'),
  ('Repuestos Kit Color', 'Repuestos', -0.5129758, -78.5680371, 7, null, '+593 96 865 7210', 'verified'),
  ('Fisiomedical SANUS – Rehabilitación Física y Deportiva', 'Salud', -0.5045292, -78.5704775, 8, null, '+593 96 137 2890', 'verified'),
  ('Chocosoo y Panadería España', 'Dulces / Panadería', -0.5117332, -78.5675898, 9, null, '+593 98 495 5081', 'verified'),
  ('Mandala – Centro de Apoyo Educativo y Psicológico', 'Educación', -0.5110237, -78.567713, 10, 'Gran Colombia y Av. Cristóbal Colón', null, 'verified'),
  ('Glam Studio by Estefy', 'Belleza', -0.51189707, -78.56794256, 11, null, '+593 99 512 8179', 'verified'),
  ('Ortopedia Machachi', 'Salud', -0.5002688, -78.572226, 12, null, '+593 99 985 3374', 'verified'),
  ('PuntoFarma Machachi', 'Farmacia', -0.50627256, -78.56949719, 13, null, '+593 98 246 9559', 'verified'),
  ('Pastelería y Bocaditos Roma', 'Dulces / Pastelería', -0.5142936, -78.5682297, 14, null, '+593 98 344 9576', 'verified'),
  ('R•T Beauty Studio Damas y Caballeros', 'Belleza', -0.5126258, -78.5682204, 15, null, '+593 99 369 7035', 'verified'),
  ('Naguara Cell', 'Celulares', -0.51579, -78.56877, 16, null, '+593 99 312 7280', 'verified'),
  ('Shellpet Vet & Spa', 'Mascotas', -0.5208069, -78.5732865, 17, 'Calle Capulíes', '+593 98 741 7476', 'verified'),
  ('Bela Studio', 'Belleza', -0.512295, -78.567083, 18, null, '+593 99 533 0827', 'verified'),
  ('Moda BIF', 'Ropa', -0.5118946, -78.5679245, 19, null, '+593 99 764 4428', 'verified'),
  ('Gglobal Agrot', 'Agropecuaria', -0.5163223, -78.5676872, 20, '11 de Noviembre y Barriga', '+593 98 725 0942', 'verified'),
  ('Kiddies Consultorio Odontológico', 'Salud', -0.5109571, -78.5672022, 21, null, '+593 98 329 8503', 'verified'),
  ('Luna Boutique', 'Ropa', -0.5122155, -78.5684882, 22, 'Luis Cordero y Pérez Pareja', '+593 99 268 8478', 'approx'),
  ('Glamour, Belleza y Perfumería', 'Belleza', -0.5133009018780362, -78.56834056131095, 23, 'Mercado Central de Machachi, local #76', '+593 98 496 9551', 'verified'),
  ('Rey Lechón Restaurante', 'Restaurante', -0.5067437, -78.5688909, 24, null, '+593 99 554 6637', 'verified'),
  ('Óptica Perfect View', 'Óptica', -0.5126661, -78.5676232, 25, null, '+593 96 896 9609', 'verified'),
  ('Boutique Samelia', 'Ropa', -0.5100182, -78.5695724, 26, 'Luis Cordero y El Hogar', '+593 98 013 5635', 'verified'),
  ('Musa Rosa', 'Ropa', -0.5109518, -78.5654221, 27, 'Sucre y Pérez Pareja, junto a la Notaría 2', '+593 95 993 4664', 'verified'),
  ('Carminian Designs', 'Manualidades', -0.5105593, -78.5669329, 28, 'Gran Colombia E-47 entre Cristóbal Colón y Bolívar, diagonal a CBVision', '+593 98 459 0527', 'verified'),
  ('Punto Guau Machachi', 'Mascotas', -0.5100841, -78.5730529, 29, null, '+593 98 763 3291', 'verified'),
  ('Ópticas Visión Social', 'Óptica', -0.5118199, -78.5678335, 30, null, '+593 99 990 7972', 'verified'),
  ('C-Salud – Alquiler y Venta de Oxígeno Medicinal', 'Salud', -0.5160374, -78.564409, 31, null, null, 'verified'),
  ('Tecnocenter "El Colombiano"', 'Tecnología', -0.5132748, -78.5669796, 32, null, '+593 98 408 5659', 'verified'),
  ('CEMEBI', 'Salud', -0.5030546, -78.5719102, 33, null, '+593 98 354 8541', 'verified'),
  ('Fashion Sport', 'Ropa', -0.5123975, -78.5684336, 34, 'Luis Cordero y Pérez Pareja', '+593 99 534 0257', 'verified'),
  ('Nayely Boutique', 'Ropa', -0.5123699, -78.5702789, 35, 'Antonio Benítez', '+593 95 998 2193', 'verified'),
  ('Acuario Daud', 'Mascotas', -0.51134617, -78.57084943, 36, null, '+593 99 520 6203', 'verified'),
  ('Lía Studio Nails', 'Belleza', -0.5148152, -78.5711424, 37, 'Av. Amazonas y Rafael Arroba', '+593 93 964 6748', 'verified'),
  ('Fragance', 'Perfumería', -0.5125154, -78.5674594, 38, 'Pasaje José Mejía y González Suárez', '+593 99 848 1889', 'verified'),
  ('Leicester English Academy', 'Educación', -0.5107627, -78.5706769, 39, null, '+593 95 864 3659', 'verified'),
  ('R&N Shop', 'Tienda', -0.5123217, -78.5675334, 40, null, '+593 96 104 3315', 'verified'),
  ('Calzado Leo''s', 'Calzado', -0.510459, -78.5648125, 41, null, '+593 98 193 3864', 'verified'),
  ('Daliz Fashion Boutique', 'Ropa', -0.510284, -78.5664661, 42, null, '+593 98 190 6245', 'verified'),
  ('Productos de Limpieza a Granel Jeniffer', 'Limpieza', -0.5133009018780362, -78.56834056131095, 43, 'Mercado Central de Machachi, planta baja, local 30', '+593 98 324 6816', 'verified'),
  ('Esencia', 'Tienda', -0.5110665, -78.5644875, 44, 'José Mejía y Nueva España', '+593 98 758 3646', 'verified'),
  ('Krusty Cheese Burger', 'Restaurante', -0.5084394, -78.5685278, 45, 'Frente al Parque Manantial de los Volcanes', '+593 99 812 3379', 'verified'),
  ('Distribuidora Amillshop', 'Tienda', -0.5120574, -78.5682314, 46, null, '+593 96 801 2775', 'verified'),
  ('Colada Morada de Atocha', 'Dulces / Comida típica', -0.5157655, -78.5666046, 47, null, '+593 96 226 1076', 'verified'),
  ('Cevichería La Marinera', 'Restaurante', -0.51605786, -78.5703331, 48, null, '+593 97 986 3584', 'verified'),
  ('A&N Celumarket', 'Celulares', -0.5127711, -78.5672155, 49, null, '+593 98 602 8087', 'verified'),
  ('D''Camila Pizzería', 'Restaurante', -0.5096734, -78.5651184, 50, null, '+593 96 832 8564', 'verified'),
  ('Dulzuras JM', 'Dulces', -0.5127864, -78.5668078, 51, null, '+593 96 274 0831', 'verified'),
  ('Fono Kids', 'Salud', -0.51111987, -78.56707645, 52, null, '+593 96 319 6414', 'verified'),
  ('Koketas Spa y Maquillaje', 'Belleza', -0.5095486, -78.5649472, 53, null, '+593 99 700 2114', 'verified'),
  ('Hotel Valle Azul', 'Hospedaje', -0.5020739, -78.5659789, 54, 'Jaime Roldós Aguilera 8-20', null, 'verified'),
  ('GOQUI Store', 'Tienda', -0.5149466, -78.5712292, 55, null, '+593 99 882 9997', 'verified'),
  ('Modas Glory', 'Ropa', -0.5100436, -78.564335, 56, null, '+593 99 638 1552', 'verified'),
  ('Marcitex DTF', 'Estampados', -0.5125853, -78.5701801, 57, null, '+593 98 633 0876', 'verified'),
  ('GluGluGlu Lavandería de Zapatillas', 'Servicios', -0.5149161, -78.5649733, 58, null, '+593 98 212 3055', 'verified'),
  ('GOAT SM Sport', 'Deportes', -0.5133009018780362, -78.56834056131095, 59, 'Mercado Central, local #20', '+593 99 923 0598', 'verified'),
  ('El Frigo de mi Barrio Machachi', 'Tienda', -0.5111825, -78.5654276, 60, null, '+593 99 900 6671', 'verified'),
  ('Sangucho Sport', 'Confección de ropa deportiva', -0.5101765, -78.5662268, 61, null, '+593 99 475 4712', 'verified'),
  ('Unidad Educativa Terry Jim', 'Educación', -0.5144596, -78.5724342, 62, null, '+593 99 477 7454', 'verified'),
  ('Bokka Dental Studio', 'Salud', -0.51552762, -78.56466569, 63, null, '+593 99 871 6380', 'verified'),
  ('Salón El Monchito Jr', 'Belleza', -0.516062, -78.579256, 64, null, '+593 99 805 4644', 'approx'),
  ('Mr. Crepes y Waffles Granizo''s', 'Dulces / Postres', -0.5149412, -78.5712226, 65, null, '+593 98 785 2990', 'verified'),
  ('Licorería 7 Gotas', 'Licorería', -0.5164533, -78.5712862, 66, '10 de Agosto', null, 'verified'),
  ('Amy Dent', 'Salud', -0.5143078, -78.5656359, 67, null, '+593 99 245 9586', 'verified'),
  ('R&F Global Security', 'Seguridad', -0.5078334, -78.5685105, 68, null, '+593 98 912 2191', 'verified'),
  ('Farmacia Cruz Azul Pablo Guarderas', 'Farmacia', -0.5051249, -78.5704205, 69, null, '+593 98 858 7809', 'verified'),
  ('JosMatFer Asesoría Jurídica', 'Servicios legales', -0.5157557, -78.5645594, 70, null, '+593 98 390 0365', 'verified'),
  ('Equilibrio', 'Salud / Bienestar', -0.51374412, -78.56620917, 71, '10 de Agosto y González Suárez', '+593 99 522 7539', 'verified'),
  ('ANIMALAB Cía. Ltda.', 'Mascotas', -0.506105, -78.5693652, 72, 'Av. Pablo Guarderas y De los Nardos', '+593 99 706 0045', 'verified'),
  ('La Villa del Sabor', 'Restaurante', -0.5132, -78.566902, 73, 'González Suárez', '+593 97 932 6320', 'verified'),
  ('La Hueca de los Secos', 'Restaurante', -0.51167357, -78.56693868, 74, 'Av. Cristóbal Colón y Pérez Pareja N1-63', '+593 96 317 7582', 'verified'),
  ('Créditos Rocío', 'Servicios', -0.5126845, -78.5689697, 75, null, '+593 98 996 2507', 'verified'),
  ('Los Trapitos de Derek', 'Ropa', -0.51331659, -78.56889112, 76, null, '+593 98 488 4928', 'verified'),
  ('Auxilio Celular', 'Celulares', -0.51175857, -78.56674957, 77, null, '+593 98 353 4403', 'verified'),
  ('Criska Bebé', 'Ropa', -0.51431048, -78.56635284, 78, null, '+593 97 936 4298', 'verified'),
  ('Restaurante "Don Carlitos"', 'Restaurante', -0.5105336, -78.5669539, 79, null, '+593 96 274 5017', 'verified'),
  ('La Matriarca – Herencia del Sabor', 'Restaurante', -0.5157152, -78.5665717, 80, null, '+593 98 483 4101', 'verified'),
  ('Laboratorio L.B.C', 'Salud', -0.5121263, -78.5684975, 81, 'Calle Luis Cordero', '+593 96 361 5218', 'approx'),
  ('D''nina Studio', 'Belleza', -0.51082456, -78.56588745, 82, null, '+593 99 907 7604', 'verified'),
  ('Style Magic by Wendy Carua', 'Belleza', -0.5176762, -78.5660693, 83, null, '+593 98 434 0832', 'verified'),
  ('Consultorio Obstétrico Carmen Guerrero Lisintuña', 'Salud', -0.51538819, -78.56935883, 84, null, '+593 99 893 6284', 'verified'),
  ('Cevichao Machachi', 'Restaurante', -0.51126339, -78.56535407, 85, 'Sucre y José Mejía', '+593 99 723 0624', 'verified'),
  ('Doba Home', 'Tienda', -0.5137501, -78.5679802, 86, null, '+593 99 762 9784', 'verified'),
  ('Escuela de Breaking Yeshua', 'Educación', -0.5137751, -78.5619594, 87, null, '+593 98 456 0387', 'verified'),
  ('Mundo de Exploradores', null, -0.5121976, -78.5720303, 88, null, '+593 99 003 9468', 'verified'),
  ('CHARMI', 'Ropa', -0.511634, -78.5672914, 89, null, '+593 96 333 5099', 'verified'),
  ('Diseños Valentina', 'Modista', -0.5116175, -78.5672694, 90, 'Pérez Pareja y Av. Cristóbal Colón', '+593 96 333 5089', 'verified'),
  ('Capy Food (Restaurante Capy)', 'Restaurante', -0.5127192, -78.5681368, 91, null, '+593 96 360 6358', 'verified'),
  ('Óptica Vista Ágil', 'Óptica', -0.5109477, -78.5671745, 92, null, '+593 98 788 8379', 'verified'),
  ('Ruta Fuego', 'Restaurante', -0.5164215, -78.5714252, 93, null, '+593 99 427 7253', 'verified'),
  ('City Pizza Machachi', 'Restaurante', -0.5144858, -78.5708977, 94, 'Av. Amazonas', '+593 98 487 2124', 'verified'),
  ('Que Bendición Restaurant', 'Restaurante', -0.5132644, -78.5659388, 95, null, '+593 98 408 8196', 'verified'),
  ('Pégate Unito oh te Freseas', null, -0.5109948, -78.5672587, 96, null, '+593 98 953 0050', 'verified'),
  ('PAIDOS CENTER – Atención Psicopedagógica', 'Salud', -0.519446, -78.5744229, 97, null, '+593 93 993 5313', 'verified'),
  ('Hogar y Detalles', 'Tienda', -0.512885, -78.5678217, 98, null, '+593 99 173 9953', 'verified'),
  ('Cyber 4', 'Servicios', -0.5149479, -78.5621265, 99, null, '+593 98 796 4017', 'verified'),
  ('Dulce y Sal Cafetería', 'Dulces / Cafetería', -0.5130005, -78.5643769, 100, null, '+593 99 449 9673', 'verified'),
  ('Fashion May Pris', 'Ropa', -0.5133009018780362, -78.56834056131095, 101, 'Mercado Central de Machachi', '+593 99 240 0011', 'verified'),
  ('Flor Boutique', 'Ropa', -0.5130892, -78.5661926, 102, null, '+593 98 500 1648', 'verified'),
  ('La Hueca del Pescado a Leña del Jr.', 'Restaurante', -0.5118819, -78.5645701, 103, null, '+593 98 876 7714', 'verified'),
  ('Chagri Choclo', 'Restaurante', -0.5171889, -78.5714439, 104, null, '+593 98 739 5699', 'verified'),
  ('Variedades D y D', 'Tienda', -0.5203511, -78.5720505, 105, null, '+593 98 609 2275', 'verified'),
  ('Pizzería Pameliny', 'Restaurante', -0.5169211, -78.5713934, 106, null, '+593 98 830 9482', 'verified'),
  ('La Casona de las Carnes', 'Restaurante', -0.5083189, -78.568627, 107, null, '+593 99 764 8971', 'verified'),
  ('Phin Pollo', 'Restaurante', -0.5093337, -78.5679823, 108, null, '+593 99 764 8971', 'verified'),
  ('Carlos Cola – Centro de Terapias para Reducir el Estrés', 'Salud / Bienestar', -0.516111, -78.564306, 109, null, null, 'verified'),
  ('Agrosolución', 'Agropecuaria', -0.5164994, -78.5714541, 110, 'Calle Néstor Cueva Negrete', '+593 99 503 8230', 'verified'),
  ('Cattaleya Deco – Tienda de Regalos', 'Tienda', -0.5112244, -78.5665665, 111, null, '+593 98 386 5586', 'verified'),
  ('Familia Shoes', 'Calzado', -0.5134964, -78.565955, 112, null, '+593 98 967 8818', 'verified'),
  ('Sportscenter', 'Deportes', -0.5134437, -78.5686482, 113, null, '+593 98 093 3229', 'verified'),
  ('Las Maxi Papas', 'Restaurante', -0.5034507, -78.5714035, 114, null, '+593 98 431 1856', 'verified'),
  ('QUELO''S Campo & Piscina', 'Turismo / Recreación', -0.5049001, -78.5642471, 115, null, '+593 93 958 3000', 'verified'),
  ('Stefy''s Accesorios y Estilos', 'Tienda', -0.5046692, -78.5697327, 116, null, '+593 99 822 6115', 'verified'),
  ('Trans Venegas TRAVEC S.A.', 'Transporte', -0.5094847, -78.5682297, 117, null, '+593 98 902 5728', 'verified'),
  ('Los Agachaditos de Rosita', 'Restaurante', -0.5168133, -78.5714733, 118, null, '+593 98 039 7987', 'verified'),
  ('Jessi Aulestia Odontóloga', 'Salud', -0.5164247, -78.5676422, 119, 'Calle 11 de Noviembre y Barriga', '+593 99 878 9976', 'verified'),
  ('Chifa Bambú', 'Restaurante', -0.5157336, -78.5703045, 120, null, '+593 96 319 2336', 'verified'),
  ('Los Pinchos de Pitu', 'Restaurante', -0.51697, -78.571379, 121, 'Agachaditos del Chagra', '+593 96 902 5903', 'verified'),
  ('Farmacia Cruz Azul Machachi', 'Farmacia', -0.5124346, -78.5636833, 122, null, '+593 99 667 2412', 'verified'),
  ('Electrónica TESLA', 'Tecnología', -0.5136389, -78.5667265, 123, null, '+593 99 877 7956', 'verified'),
  ('Ambrosía Shawarmas y Alitas', 'Restaurante', -0.51697, -78.571379, 124, 'Agachaditos del Chagra', '+593 98 026 9518', 'verified'),
  ('Cevichería Viña del Mar', 'Restaurante', -0.5128371, -78.5689437, 125, null, '+593 99 440 9607', 'verified'),
  ('Chela Plan D', 'Bar / Licorería', -0.5059614, -78.5696284, 126, null, '+593 99 769 4910', 'verified'),
  ('Recuerdos de Chocolate', 'Dulces', -0.514256, -78.566132, 127, null, '+593 99 523 4428', 'verified'),
  ('Variedades A&E', 'Artículos militares y policiales, confecciones', -0.5094268, -78.5710199, 128, null, '+593 98 572 3876', 'verified'),
  ('Los Pollos del Artesano', 'Restaurante', -0.5107316, -78.5658951, 129, 'Pérez Pareja', '+593 98 928 0950', 'verified'),
  ('San Martín Papelería', 'Papelería', -0.5047704, -78.5698766, 130, null, '+593 96 347 0700', 'verified'),
  ('AG Ferretería Anita Gordillo', 'Ferretería', -0.5108074, -78.5659332, 131, 'Pérez Pareja entre Sucre, diagonal al Produbanco', '+593 99 998 0617', 'verified'),
  ('Los Carbones de Gaby', 'Restaurante', -0.51697, -78.571379, 132, 'Agachaditos del Chagra', '+593 96 864 3692', 'verified'),
  ('El Ranchito Loco', 'Restaurante', -0.51697, -78.571379, 133, 'Agachaditos del Chagra', '+593 93 970 2969', 'verified'),
  ('Bendito Verde', 'Restaurante', -0.51697, -78.571379, 134, 'Agachaditos del Chagra', '+593 98 481 5540', 'verified'),
  ('CEI Gutenberg Academy', 'Educación', -0.5117061, -78.5733353, 135, null, '+593 98 759 4904', 'verified'),
  ('Vimédica', 'Salud', -0.515222, -78.5679245, 136, '11 de Noviembre y Barriga', '+593 96 969 7345', 'verified'),
  ('Deco-Moad', 'Detalles y entregas personalizadas', -0.5118222, -78.5667136, 137, null, '+593 99 986 7487', 'verified'),
  ('Lotería Nacional', 'Servicios', -0.5134051442146301, -78.56754302978516, 138, null, '+593 95 883 1701', 'verified'),
  ('La Casa de las Ideas', null, -0.5078391, -78.569552, 139, null, '+593 95 884 0561', 'verified'),
  ('Electrocell', 'Celulares', -0.5133009018780362, -78.56834056131095, 140, 'Mercado Central de Machachi, planta baja, local 79', '+593 99 638 7812', 'verified'),
  ('Jugos Naturales Merceditas', 'Jugos / Dulces', -0.5133009018780362, -78.56834056131095, 141, 'Av. Amazonas y Luis Cordero (esquina), junto al Mercado Central', '+593 93 975 2739', 'verified'),
  ('Jugos Naturales Merceditas 2', 'Jugos / Dulces', -0.5034592165287098, -78.56875754035178, 142, 'Junto al Polideportivo', '+593 93 962 2549', 'verified'),
  ('Restaurant La Casa de la Abuela', 'Restaurante', -0.5110058, -78.5671307, 143, null, '+593 98 744 1676', 'verified'),
  ('JB Laboratorio Sucursal 2', 'Salud', -0.5124896168708801, -78.56893920898438, 144, null, null, 'verified')
),
r as (select id from public.tourist_routes where slug = 'ruta-de-los-dulces'),
actualizados as (
  update public.tourist_route_stops s
  set description = v.descr, latitude = v.lat, longitude = v.lng, address = v.addr,
      phone = v.phone, geo_status = v.geo, parish = 'Machachi'
  from v, r
  where s.route_id = r.id and lower(trim(s.name)) = lower(trim(v.name))
  returning s.id
)
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, stop_order, address, parish, phone, geo_status)
select r.id, v.name, v.descr, v.lat, v.lng, 1000 + v.ord, v.addr, 'Machachi', v.phone, v.geo
from r, v
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
