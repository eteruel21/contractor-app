-- Catálogo oficial de costos directos de construcción de Panamá.
-- Fuente: Contraloría General de la República, actualización 10 de julio de 2025.
-- Importa 1,169 partidas sin eliminar ni reemplazar los registros existentes.
-- Los códigos contraloria:2025:* permiten ejecutar esta migración varias veces de forma segura.

begin;

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:46', 'CG-0046', 'LIMPIEZA MANUAL DE TERRENO PARA REPLANTEO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 0.7, 0.94, 0, true),
  ('contraloria:2025:47', 'CG-0047', 'LIMPIEZA Y DESARRAIGUE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); MOTOSIERRA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 0.98, 1.32, 0, true),
  ('contraloria:2025:48', 'CG-0048', 'LIMPIEZA GENERAL DEL PROYECTO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 1.75, 2.36, 0, true),
  ('contraloria:2025:49', 'CG-0049', 'REPLANTEO Y DEMARCACIÓN', 'Materiales: CLAVOS DE ALAMBRE DE 3"; MADERA - TRAMO DE MADERA DE 2 X 2"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 2.17, 2.93, 0, true),
  ('contraloria:2025:50', 'CG-0050', 'EXCAVACIÓN MANUAL', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 42.03, 56.74, 0, true),
  ('contraloria:2025:51', 'CG-0051', 'EXCAVACIÓN COMÚN CON PALA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 5.69, 7.68, 0, true),
  ('contraloria:2025:52', 'CG-0052', 'EXCAVACIÓN COMÚN CON RETROEXCAVADORA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 3.72, 5.02, 0, true),
  ('contraloria:2025:53', 'CG-0053', 'DEMOLICIÓN DE ESTRUCTURA DE HORMIGON CON RETROMARTILLO (INCLUYE ACARREO)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible); RETROEXCAVADORA CON MARTILLO (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 5.2, 7.02, 0, true),
  ('contraloria:2025:54', 'CG-0054', 'DEMOLICIÓN MANUAL DE PAREDES DE CONCRETO, CON ESPESOR HASTA 0.2 m (INCLUYE ACARREO)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 7.03, 9.49, 0, true),
  ('contraloria:2025:55', 'CG-0055', 'DEMOLICIÓN Y REMOCIÓN DE ACERAS', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 6.9, 9.31, 0, true),
  ('contraloria:2025:56', 'CG-0056', 'DEMOLICIÓN Y REMOCIÓN DE CORDÓN SIMPLE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO; RETROEXCAVADORA CON MARTILLO (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 5.75, 7.76, 0, true),
  ('contraloria:2025:57', 'CG-0057', 'DEMOLICIÓN Y REMOCIÓN DE CORDÓN CUNETA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO; RETROEXCAVADORA CON MARTILLO (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 9.99, 13.49, 0, true),
  ('contraloria:2025:58', 'CG-0058', 'RELLENO CON MATERIAL EXISTENTE COMPACTADO MANUALMENTE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cúbico', 'm³', 6.62, 8.94, 0, true),
  ('contraloria:2025:59', 'CG-0059', 'RELLENO CON MATERIAL SELECTO COMPACTADO MANUALMENTE', 'Materiales: AGREGADO PETREO - MATERIAL SELECTO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPACTADOR TIPO SAPO; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cúbico', 'm³', 30.12, 40.66, 0, true),
  ('contraloria:2025:60', 'CG-0060', 'RELLENO CON CAPA BASE COMPACTADO MANUALMENTE', 'Materiales: AGREGADO PETREO - CAPA BASE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cúbico', 'm³', 42.79, 57.77, 0, true),
  ('contraloria:2025:61', 'CG-0061', 'RELLENO CON PIEDRA #4 COMPACTADO MANUALMENTE', 'Materiales: AGREGADO PETREO - PIEDRA #4, COSTO POR m3
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cúbico', 'm³', 40.61, 54.82, 0, true),
  ('contraloria:2025:62', 'CG-0062', 'RELLENO CON ARENA COMPACTADO MANUALMENTE', 'Materiales: ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cúbico', 'm³', 55.87, 75.42, 0, true),
  ('contraloria:2025:63', 'CG-0063', 'GRADO FINAL PARA VACIADOS DE CONCRETO, RELLENO CON MATERIAL EXISTENTE COMPACTADO MANUALMENTE DE ESPESOR HASTA 0.15 m', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 0.9, 1.21, 0, true),
  ('contraloria:2025:64', 'CG-0064', 'GRADO FINAL PARA VACIADOS DE CONCRETO, RELLENO CON MATERIAL SELECTO COMPACTADO MANUALMENTE DE ESPESOR HASTA 0.15 m', 'Materiales: AGREGADO PETREO - MATERIAL SELECTO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 4.41, 5.95, 0, true),
  ('contraloria:2025:65', 'CG-0065', 'GRADO FINAL PARA VACIADOS DE CONCRETO, RELLENO CON CAPA BASE COMPACTADO MANUALMENTE DE ESPESOR HASTA 0.15 m', 'Materiales: AGREGADO PETREO - CAPA BASE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible); PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 6.42, 8.67, 0, true),
  ('contraloria:2025:66', 'CG-0066', 'GRADO FINAL PARA VACIADOS DE CONCRETO, RELLENO CON PIEDRA #4 COMPACTADO MANUALMENTE DE ESPESOR HASTA 0.15 m', 'Materiales: AGREGADO PETREO - PIEDRA #4, COSTO POR m3
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible); PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 6.18, 8.34, 0, true),
  ('contraloria:2025:67', 'CG-0067', 'GRADO FINAL PARA VACIADOS DE CONCRETO, RELLENO CON ARENA COMPACTADO MANUALMENTE DE ESPESOR HASTA 0.15 m', 'Materiales: ARENA
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 39.31, 53.07, 0, true),
  ('contraloria:2025:68', 'CG-0068', 'CONCRETO REGULAR DE 2000 psi (HECHO EN PLANTA)', 'Materiales: CONCRETO DE 2000 psi; BOLSA DE HIELO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 199.88, 269.84, 0, true),
  ('contraloria:2025:69', 'CG-0069', 'CONCRETO REGULAR DE 2500 psi (HECHO EN PLANTA)', 'Materiales: CONCRETO DE 2500 psi; BOLSA DE HIELO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 205.85, 277.9, 0, true),
  ('contraloria:2025:70', 'CG-0070', 'CONCRETO REGULAR DE 3000 psi (HECHO EN PLANTA)', 'Materiales: CONCRETO DE 3000 psi; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; BOLSA DE HIELO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 214.43, 289.48, 0, true),
  ('contraloria:2025:71', 'CG-0071', 'CONCRETO REGULAR DE 4000 psi (HECHO EN PLANTA)', 'Materiales: CONCRETO DE 4000 psi; BOLSA DE HIELO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 222.35, 300.17, 0, true),
  ('contraloria:2025:72', 'CG-0072', 'CONCRETO DE 2000 psi (HECHO EN EL SITIO MANUALMENTE)', 'Materiales: ADITIVO PLÁSTIFICANTE; CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MEZCLADORA DE CONCRETO; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 156.76, 211.63, 0, true),
  ('contraloria:2025:73', 'CG-0073', 'CONCRETO DE 2500 psi (HECHO EN EL SITIO MANUALMENTE)', 'Materiales: ADITIVO PLÁSTIFICANTE; CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO; MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 161.36, 217.84, 0, true),
  ('contraloria:2025:74', 'CG-0074', 'CONCRETO DE 3000 psi (HECHO EN EL SITIO MANUALMENTE)', 'Materiales: ADITIVO PLÁSTIFICANTE; CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO; MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 163.66, 220.94, 0, true),
  ('contraloria:2025:75', 'CG-0075', 'CONCRETO DE 4000 psi (HECHO EN EL SITIO MANUALMENTE)', 'Materiales: ADITIVO PLÁSTIFICANTE; CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MEZCLADORA DE CONCRETO; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 174.15, 235.1, 0, true),
  ('contraloria:2025:76', 'CG-0076', 'REPLANTEO DE BLOQUES DE CONCRETO DE 4" (SOBRE PISO O LOSA)', 'Materiales: CEMENTO GRIS TIPO I; ACERO DE REFUERZO; ARENA; AGREGADO PETREO - GRAVA #4; BLOQUE DE CEMENTO DE 4"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 13.25, 17.89, 0, true),
  ('contraloria:2025:77', 'CG-0077', 'REPLANTEO DE BLOQUES DE CONCRETO DE 6" (SOBRE PISO O LOSA)', 'Materiales: BLOQUE DE CEMENTO DE 6"; AGREGADO PETREO - GRAVA #4; ARENA; ACERO DE REFUERZO; CEMENTO GRIS TIPO I
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 14.39, 19.43, 0, true),
  ('contraloria:2025:78', 'CG-0078', 'REPLANTEO DE BLOQUES DE CONCRETO DE 8" (SOBRE PISO O LOSA)', 'Materiales: BLOQUE DE CEMENTO DE 8"; AGREGADO PETREO - GRAVA #4; ARENA; ACERO DE REFUERZO; CEMENTO GRIS TIPO I
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 17.98, 24.27, 0, true),
  ('contraloria:2025:79', 'CG-0079', 'REPLANTEO DE BLOQUES DE ARCILLA DE 4" (SOBRE PISO O LOSA)', 'Materiales: BLOQUE DE ARCILLA DE 4"; AGREGADO PETREO - GRAVA #4; ARENA; ACERO DE REFUERZO; CEMENTO GRIS TIPO I
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 13.4, 18.09, 0, true),
  ('contraloria:2025:80', 'CG-0080', 'REPLANTEO DE BLOQUES DE ARCILLA DE 6" (SOBRE PISO O LOSA)', 'Materiales: CEMENTO GRIS TIPO I; ACERO DE REFUERZO; ARENA; AGREGADO PETREO - GRAVA #4; BLOQUE DE ARCILLA DE 6"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 16.01, 21.61, 0, true),
  ('contraloria:2025:81', 'CG-0081', 'MURO DE BLOQUES DE CEMENTO DE 4" RELLENO DE CONCRETO (SIN REFUERZO)', 'Materiales: AGREGADO PETREO - GRAVA #4; CEMENTO GRIS TIPO I; ARENA; BLOQUE DE CEMENTO DE 4"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 35.56, 48.01, 0, true),
  ('contraloria:2025:82', 'CG-0082', 'MURO DE BLOQUES DE CEMENTO DE 6" RELLENO DE CONCRETO (SIN REFUERZO)', 'Materiales: AGREGADO PETREO - GRAVA #4; CEMENTO GRIS TIPO I; ARENA; BLOQUE DE CEMENTO DE 6"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 42.62, 57.54, 0, true),
  ('contraloria:2025:83', 'CG-0083', 'MURO DE BLOQUES DE CEMENTO DE 8" RELLENO DE CONCRETO (SIN REFUERZO)', 'Materiales: AGREGADO PETREO - GRAVA #4; CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 8"; ARENA
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 57.09, 77.07, 0, true),
  ('contraloria:2025:84', 'CG-0084', 'PARED DE BLOQUE DE 4" DE CEMENTO RELLENO DE CONCRETO (SIN REFUERZO)', 'Materiales: ARENA; BLOQUE DE CEMENTO DE 4"; CEMENTO GRIS TIPO I; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 35.56, 48.01, 0, true),
  ('contraloria:2025:85', 'CG-0085', 'PARED DE BLOQUE DE 6" DE CEMENTO RELLENO DE CONCRETO (SIN REFUERZO)', 'Materiales: BLOQUE DE CEMENTO DE 6"; ARENA; CEMENTO GRIS TIPO I; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 42.62, 57.54, 0, true),
  ('contraloria:2025:86', 'CG-0086', 'PARED DE BLOQUE DE 8" DE CEMENTO RELLENO DE CONCRETO (SIN REFUERZO)', 'Materiales: ARENA; BLOQUE DE CEMENTO DE 8"; CEMENTO GRIS TIPO I; AGREGADO PETREO - GRAVA #4
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 55.44, 74.84, 0, true),
  ('contraloria:2025:87', 'CG-0087', 'PARED DE BLOQUE DE 4" DE ARCILLA RELLENO DE CONCRETO (SIN REFUERZO)', 'Materiales: AGREGADO PETREO - GRAVA #4; CEMENTO GRIS TIPO I; BLOQUE DE ARCILLA DE 4"; ARENA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 34.45, 46.51, 0, true),
  ('contraloria:2025:88', 'CG-0088', 'PARED DE BLOQUE DE 6" DE ARCILLA RELLENO DE CONCRETO (SIN REFUERZO)', 'Materiales: AGREGADO PETREO - GRAVA #4; CEMENTO GRIS TIPO I; ARENA; BLOQUE DE ARCILLA DE 6"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 46.96, 63.4, 0, true),
  ('contraloria:2025:89', 'CG-0089', 'PARED DE BLOQUE DE 4" DE CEMENTO (SIN REFUERZO) HASTA ALTURA DE 1.80 METROS', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 4"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 20.3, 27.4, 0, true),
  ('contraloria:2025:90', 'CG-0090', 'PARED DE BLOQUE DE 4" DE CEMENTO (SIN REFUERZO) PARA ALTURA MAYORES A 1.80 METROS', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 4"
Mano de obra: GUINDOLERO (CALIFICADO + 16%); AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 25.72, 34.72, 0, true),
  ('contraloria:2025:91', 'CG-0091', 'PARED DE BLOQUE DE 6" DE CEMENTO (SIN REFUERZO) HASTA ALTURA DE 1.80 METROS', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 6"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 22.69, 30.63, 0, true),
  ('contraloria:2025:92', 'CG-0092', 'PARED DE BLOQUE DE 6" DE CEMENTO (SIN REFUERZO) PARA ALTURA MAYORES A 1.80 METROS', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 6"
Mano de obra: AYUDANTE GENERAL; GUINDOLERO (CALIFICADO + 16%)
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 28.12, 37.96, 0, true),
  ('contraloria:2025:93', 'CG-0093', 'RETAQUEO DE BLOQUE DE 4 IN DE CEMENTO (10 CM DE ALTO)', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 4"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro lineal', 'm', 3.79, 5.12, 0, true),
  ('contraloria:2025:94', 'CG-0094', 'RETAQUEO DE BLOQUE DE 6 IN DE CEMENTO (10 CM DE ALTO)', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 6"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro lineal', 'm', 4.8, 6.48, 0, true),
  ('contraloria:2025:95', 'CG-0095', 'PARED DE BLOQUES DE 8" DE CEMENTO (SIN REFUERZO)', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 8"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 35.23, 47.56, 0, true),
  ('contraloria:2025:96', 'CG-0096', 'PARED DE BLOQUES DE 4" DE ARCILLA (SIN REFUERZO)', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE ARCILLA DE 4"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 19.21, 25.93, 0, true),
  ('contraloria:2025:97', 'CG-0097', 'PARED DE BLOQUES DE 6" DE ARCILLA (SIN REFUERZO)', 'Materiales: ARENA; CEMENTO GRIS TIPO I; BLOQUE DE ARCILLA DE 6"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 27.49, 37.11, 0, true),
  ('contraloria:2025:98', 'CG-0098', 'PARED DE LADRILLOS DE ARCILLA', 'Materiales: CEMENTO GRIS TIPO I; ARENA; LADRILLOS DE ARCILLA DE 5 cm x 10 cm x 20 cm
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 83.94, 113.32, 0, true),
  ('contraloria:2025:99', 'CG-0099', 'PARED DE BLOQUES DE VIDRIO DE 8" x 8"', 'Materiales: BLOQUE DE VIDRIO DE 4" x 4"; CEMENTO GRIS TIPO I; ARENA
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 86.65, 116.98, 0, true),
  ('contraloria:2025:100', 'CG-0100', 'VENTANA DE BLOQUES ORNAMENTALES DE CONCRETO (INCLUYE MOCHETEARLO)', 'Materiales: CEMENTO GRIS TIPO I; BLOQUE ORNAMENTAL DE CONCRETO; ARENA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 25.67, 34.65, 0, true),
  ('contraloria:2025:101', 'CG-0101', 'VENTANA DE BLOQUES ORNAMENTALES DE ARCILLA (INCLUYE MOCHETEARLO)', 'Materiales: BLQUES ORNAMENTALES DE ARCILLA; ARENA; CEMENTO GRIS TIPO I
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 27.5, 37.12, 0, true),
  ('contraloria:2025:102', 'CG-0102', 'ADHESIVO LÍQUIDO PARA REPELLO DE SHEAR WALL, COLUMNAS, VIGAS Y MUROS DE CONCRETO', 'Materiales: ADITIVO ADHESIVO PARA REPELLOS
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 4.36, 5.89, 0, true),
  ('contraloria:2025:103', 'CG-0103', 'REPELLO DE PAREDES INTERIORES Y EXTERIORES HASTA ALTURA DE 1.80 METROS', 'Materiales: ARENA; MADERA - 1X4X10'', PINOTEA (tres usos); CLAVOS DE ACERO DE 3"; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 10.24, 13.82, 0, true),
  ('contraloria:2025:104', 'CG-0104', 'REPELLO DE PAREDES EXTERIORES PARA ALTURA MAYORES A 1.80 METROS', 'Materiales: CEMENTO GRIS TIPO I; CLAVOS DE ACERO DE 3"; MADERA - 1X4X10'', PINOTEA (tres usos); ARENA; ADITIVO IMPERMEABILIZANTE
Mano de obra: AYUDANTE GENERAL; GUINDOLERO (CALIFICADO + 16%)
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 24.17, 32.63, 0, true),
  ('contraloria:2025:105', 'CG-0105', 'REPELLO DE MOCHETAS CON JUNTAS DE DILATACIÓN PARA PUERTAS Y VENTANAS ESPECIALES', 'Materiales: ARENA; CEMENTO GRIS TIPO I; MADERA - 1X4X10'', PINOTEA (tres usos); PEGAMENTO PARA MOLDURA DE 600 ml; MOLDURA O JUNTA DE EXPANSIÓN - REPELLO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro lineal', 'm', 15.31, 20.67, 0, true),
  ('contraloria:2025:106', 'CG-0106', 'REPELLO DE MOCHETAS DE PUERTAS Y VENTANAS', 'Materiales: ARENA; MADERA - 1X4X10'', PINOTEA (tres usos); CEMENTO GRIS TIPO I
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro lineal', 'm', 5.96, 8.05, 0, true),
  ('contraloria:2025:107', 'CG-0107', 'REPELLO DE MOCHETAS BORDE DE LOSA', 'Materiales: ARENA; CEMENTO GRIS TIPO I; MADERA - 1X4X10'', PINOTEA (tres usos); MOLDURA O JUNTA DE EXPANSIÓN - REPELLO
Mano de obra: GUINDOLERO (CALIFICADO + 16%); AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 14.96, 20.2, 0, true),
  ('contraloria:2025:108', 'CG-0108', 'REPELLO DE COLUMNAS Y VIGAS (INCLUYE REPELLO DE FILOS)', 'Materiales: ARENA; MADERA - 1X4X10'', PINOTEA (tres usos); CLAVOS DE ACERO DE 3"; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 14.96, 20.2, 0, true),
  ('contraloria:2025:109', 'CG-0109', 'REPELLO DE SHEAR WALL (INCLUYE REPELLO DE FILOS)', 'Materiales: ARENA; MADERA - 1X4X10'', PINOTEA (tres usos); CLAVOS DE ACERO DE 3"; CEMENTO GRIS TIPO I
Mano de obra: AYUDANTE GENERAL; GUINDOLERO (CALIFICADO + 16%)
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 13.96, 18.85, 0, true),
  ('contraloria:2025:110', 'CG-0110', 'FORMALETA DE PLYWOOD REGULAR', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 17.81, 24.04, 0, true),
  ('contraloria:2025:111', 'CG-0111', 'FORMALETA PARA VIGAS DE AMARRE Y VIGAS SÍSMICAS', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 17.81, 24.04, 0, true),
  ('contraloria:2025:112', 'CG-0112', 'ACERO DE REFUERZO', 'Materiales: ACERO DE REFUERZO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Libra', 'lb', 0.57, 0.77, 0, true),
  ('contraloria:2025:113', 'CG-0113', 'ALFEIZAR DETALLE TIPICO DEL REP 2014', 'Materiales: CEMENTO GRIS TIPO I; ACERO DE REFUERZO; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 22.53, 30.42, 0, true),
  ('contraloria:2025:114', 'CG-0114', 'DINTEL (VIGA DE AMARRE SOBRE EL DINTEL) DETALLE DEL REP 2014', 'Materiales: CEMENTO GRIS TIPO I; ACERO DE REFUERZO; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 27.95, 37.73, 0, true),
  ('contraloria:2025:115', 'CG-0115', 'DINTEL (PARED DE BLOQUES SOBRE EL DINTEL) DETALLE DEL REP 2014', 'Materiales: AGREGADO PETREO - GRAVA #4; ARENA; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; ACERO DE REFUERZO; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 31.01, 41.86, 0, true),
  ('contraloria:2025:116', 'CG-0116', 'REFUERZO PARA PUERTAS Y VENTANAS, DETALLE DEL REP 2014', 'Materiales: CEMENTO GRIS TIPO I; ACERO DE REFUERZO; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro lineal', 'm', 31.12, 42.01, 0, true),
  ('contraloria:2025:117', 'CG-0117', 'VIGAS Y COLUMNAS DE AMARRE (HASTA 0.15 m X 0.3 m)', 'Materiales: AGREGADO PETREO - GRAVA #4; ARENA; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; ACERO DE REFUERZO; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 34.1, 46.03, 0, true),
  ('contraloria:2025:118', 'CG-0118', 'TOPPING DE PISO DE 0.05 m', 'Materiales: CEMENTO GRIS TIPO I; PLÁSTICO PARA PROTECCIÓN (POLIETIRENO); ARENA
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 10.46, 14.12, 0, true),
  ('contraloria:2025:119', 'CG-0119', 'PISO DE CONCRETO DE 3000 psi (HECHO EN PLANTA) DE ESPESOR DE 0.1 m (SIN REFUERZO) (INCLUYE FORMALETA Y GRADO FINAL)', 'Materiales: ADITIVO PLÁSTIFICANTE; CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MEZCLADORA DE CONCRETO; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 17.57, 23.72, 0, true),
  ('contraloria:2025:120', 'CG-0120', 'PISO DE CONCRETO DE 4000 psi (HECHO EN PLANTA) DE ESPESOR DE 0.1 m (SIN REFUERZO) (INCLUYE FORMALETA Y GRADO FINAL)', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; ADITIVO PLÁSTIFICANTE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MEZCLADORA DE CONCRETO; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 18.63, 25.15, 0, true),
  ('contraloria:2025:121', 'CG-0121', 'PISO COMPLETO DE CONCRETO DE 3000 psi (HECHO EN PLANTA) DE ESPESOR DE 0.10 m (INCLUYE ACERO DE REFUERZO, FORMALETA Y GRADO FINAL)', 'Materiales: CONCRETO DE 3000 psi; BOLSA DE HIELO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 31.08, 41.96, 0, true),
  ('contraloria:2025:122', 'CG-0122', 'PISO COMPLETO DE CONCRETO DE 3000 psi (HECHO EN PLANTA) DE ESPESOR DE 0.15 m (INCLUYE ACERO DE REFUERZO, FORMALETA Y GRADO FINAL)', 'Materiales: CONCRETO DE 3000 psi; BOLSA DE HIELO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 42.27, 57.06, 0, true),
  ('contraloria:2025:123', 'CG-0123', 'PISO COMPLETO DE CONCRETO DE 4000 psi (HECHO EN PLANTA) DE ESPESOR DE 0.10 m (INCLUYE ACERO DE REFUERZO, FORMALETA Y GRADO FINAL)', 'Materiales: CONCRETO DE 4000 psi; BOLSA DE HIELO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 31.97, 43.16, 0, true),
  ('contraloria:2025:124', 'CG-0124', 'PISO COMPLETO DE CONCRETO DE 4000 psi (HECHO EN PLANTA) DE ESPESOR DE 0.15 m (INCLUYE ACERO DE REFUERZO, FORMALETA Y GRADO FINAL)', 'Materiales: BOLSA DE HIELO; CONCRETO DE 4000 psi
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 43.61, 58.87, 0, true),
  ('contraloria:2025:125', 'CG-0125', 'PICADO Y RESANE DE PARED PARA TUBOS ELÉCTRICOS (5 cm X 7 cm)', 'Materiales: ARENA; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 11.04, 14.9, 0, true),
  ('contraloria:2025:126', 'CG-0126', 'RESANE Y AFINAMIENTO DE ESCALERA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ESMERILADORA ANGULAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 2.51, 3.39, 0, true),
  ('contraloria:2025:127', 'CG-0127', 'RESANE FOSO DE ASCENSOR', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: GUINDOLERO (CALIFICADO + 16%)
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ESMERILADORA ANGULAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 2.88, 3.89, 0, true),
  ('contraloria:2025:128', 'CG-0128', 'DESVASTE DE LOSA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ESMERILADORA ANGULAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 1.0, 1.35, 0, true),
  ('contraloria:2025:129', 'CG-0129', 'DESCOLGADOS DE CONCRETO', 'Materiales: CONCRETO DE 4000 psi; ACERO DE REFUERZO; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 64.57, 87.17, 0, true),
  ('contraloria:2025:130', 'CG-0130', 'QUICIO DE CONCRETO', 'Materiales: ACERO DE REFUERZO; MADERA - 1X4X10'', PINOTEA (tres usos); ARENA; AGREGADO PETREO - GRAVA #4; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 19.31, 26.07, 0, true),
  ('contraloria:2025:131', 'CG-0131', 'IMPERMEABILIZACIÓN DE PAREDES DE CONCRETO Y MAMPOSTERÍAS', 'Materiales: PINTURA - PROTECTOR E IMPERMEABILIZANTE PARA CONCRETO Y MAMPOSTERÍAS
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 5.73, 7.74, 0, true),
  ('contraloria:2025:132', 'CG-0132', 'TOPE DE CAUCHO PARA ESTACIONAMIENTOS', 'Materiales: TOPE DE CAUCHO PARA ESTACIONAMIENTOS; PERNO DE ANCLAJE DE 5/8" x 7"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 82.0, 110.7, 0, true),
  ('contraloria:2025:133', 'CG-0133', 'TOPE DE CONCRETO PARA ESTACIONAMIENTO', 'Materiales: PERNO DE ANCLAJE DE 5/8" x 7"; TOPE DE CONCRETO DE 1.80 m PARA ESTACIONAMIENTOS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 68.76, 92.83, 0, true),
  ('contraloria:2025:134', 'CG-0134', 'ACERA REFORZADA SOBRE PISO O LOSA (CON CONCRETO VACIADO)', 'Materiales: CONCRETO DE 3000 psi; ACERO DE REFUERZO; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 27.03, 36.49, 0, true),
  ('contraloria:2025:135', 'CG-0135', 'ACERA REFORZADA SOBRE PISO O LOSA (CON CONCRETO IN SITU)', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; ACERO DE REFUERZO; CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 26.91, 36.33, 0, true),
  ('contraloria:2025:136', 'CG-0136', 'ACERA REFORZADA (CON CONCRETO VACIADO)', 'Materiales: CONCRETO DE 3000 psi; ACERO DE REFUERZO; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGREGADO PETREO - CAPA BASE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPACTADOR - BANDEJA VIBRANTE GUIADO MANUAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 33.37, 45.05, 0, true),
  ('contraloria:2025:137', 'CG-0137', 'ACERA SIN REFUERZO (CON CONCRETO VACIADO)', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGREGADO PETREO - CAPA BASE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPACTADOR - BANDEJA VIBRANTE GUIADO MANUAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 29.17, 39.38, 0, true),
  ('contraloria:2025:138', 'CG-0138', 'ACERA REFORZADA (CON CONCRETO IN SITU)', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGREGADO PETREO - CAPA BASE; ACERO DE REFUERZO; CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPACTADOR - BANDEJA VIBRANTE GUIADO MANUAL; MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 30.71, 41.46, 0, true),
  ('contraloria:2025:139', 'CG-0139', 'ACERA SIN REFUERZO (CON CONCRETO IN SITU)', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGREGADO PETREO - CAPA BASE; CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPACTADOR - BANDEJA VIBRANTE GUIADO MANUAL; MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 26.51, 35.79, 0, true),
  ('contraloria:2025:140', 'CG-0140', 'BARANDA DE BLOQUES DE 4" REPELLO AMBAS CARAS, 1.20 m DE ALTO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 85.8, 115.83, 0, true),
  ('contraloria:2025:141', 'CG-0141', 'CORDÓN SIMPLE', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CONCRETO DE 3000 psi; SELLADOR ASFÁLTICO; ACERO DE REFUERZO; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 21.03, 28.39, 0, true),
  ('contraloria:2025:142', 'CG-0142', 'CORDÓN CUNETA DE 45 CM', 'Materiales: ACERO DE REFUERZO; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; CONCRETO DE 3000 psi; SELLADOR ASFÁLTICO; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 35.24, 47.57, 0, true),
  ('contraloria:2025:143', 'CG-0143', 'REMOCIÓN DE LÁMINAS DE TECHO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 5.79, 7.82, 0, true),
  ('contraloria:2025:144', 'CG-0144', 'REMOCIÓN DE LÁMINAS Y ESTRUCTURA DE TECHO COMPLETA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 9.25, 12.49, 0, true),
  ('contraloria:2025:145', 'CG-0145', 'LIMPIEZA Y DESINFECCIÓN DE TECHOS', 'Materiales: CLOROX
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; HIDROLAVADORA 3800 PSI
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 1.92, 2.59, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:146', 'CG-0146', 'IMPERMEABILIZACIÓN DE TECHOS', 'Materiales: IMPERMEABILIZANTE DE TECHO; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 10.67, 14.4, 0, true),
  ('contraloria:2025:147', 'CG-0147', 'CARRIOLA GALVANIZADA DE 2" X 4" cal.16', 'Materiales: BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CARRIOLA GALVANIZADA 2" X 4" cal.16; ALINEADORES DE CARRIOLAS; SOLDADURA 6011 X 1/8"
Mano de obra: AYUDANTE GENERAL; SOLDADOR DE 1RA - CAMPO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 12.55, 16.94, 0, true),
  ('contraloria:2025:148', 'CG-0148', 'CARRIOLA GALVANIZADA DE 2" X 6" cal.16', 'Materiales: BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 6" cal.16; ALINEADORES DE CARRIOLAS
Mano de obra: AYUDANTE GENERAL; SOLDADOR DE 1RA - CAMPO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 14.15, 19.1, 0, true),
  ('contraloria:2025:149', 'CG-0149', 'CARRIOLA GALVANIZADA DE 2" X 8" cal.16', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 8" cal.16; ALINEADORES DE CARRIOLAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; SOLDADOR DE 1RA - CAMPO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 28.81, 38.89, 0, true),
  ('contraloria:2025:150', 'CG-0150', 'CARRIOLA GALVANIZADA DE 1-1/2" X 3" cal.18', 'Materiales: SOLDADURA 6011 X 1/8"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CARRIOLA GALVANIZADA 1-1/2" X 3" cal.18; ALINEADORES DE CARRIOLAS; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; SOLDADOR DE 1RA - CAMPO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 10.87, 14.67, 0, true),
  ('contraloria:2025:151', 'CG-0151', 'CARRIOLA GALVANIZADA DE 2" X 4" cal.18', 'Materiales: SOLDADURA 6011 X 1/8"; ALINEADORES DE CARRIOLAS; CARRIOLA GALVANIZADA 2" X 4" cal.18; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 11.67, 15.75, 0, true),
  ('contraloria:2025:152', 'CG-0152', 'CARRIOLA GALVANIZADA DE 2" X 6" cal.18', 'Materiales: SOLDADURA 6011 X 1/8"; ALINEADORES DE CARRIOLAS; CARRIOLA GALVANIZADA 2" X 6" cal.18; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 14.55, 19.64, 0, true),
  ('contraloria:2025:153', 'CG-0153', 'CARRIOLA GALVANIZADA DE 2" X 8" cal.18', 'Materiales: SOLDADURA 6011 X 1/8"; ALINEADORES DE CARRIOLAS; CARRIOLA GALVANIZADA 2" X 8" cal.18; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 38.09, 51.42, 0, true),
  ('contraloria:2025:154', 'CG-0154', 'FASCIA DE CARRIOLA GALVANIZADA DE 2" X 4" cal.16', 'Materiales: BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CARRIOLA GALVANIZADA 2" X 4" cal.16; SOLDADURA 6011 X 1/8"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 9.02, 12.18, 0, true),
  ('contraloria:2025:155', 'CG-0155', 'FASCIA DE CARRIOLA GALVANIZADA DE 2" X 6" cal.16', 'Materiales: BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CARRIOLA GALVANIZADA 2" X 6" cal.16; SOLDADURA 6011 X 1/8"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 10.62, 14.34, 0, true),
  ('contraloria:2025:156', 'CG-0156', 'FASCIA DE CARRIOLA GALVANIZADA DE 2" X 8" cal.16', 'Materiales: BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CARRIOLA GALVANIZADA 2" X 8" cal.16; SOLDADURA 6011 X 1/8"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 25.28, 34.13, 0, true),
  ('contraloria:2025:157', 'CG-0157', 'FASCIA DE CARRIOLA GALVANIZADA DE 1-1/2" X 3" cal.18', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 1-1/2" X 3" cal.18; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; SOLDADOR DE 1RA - CAMPO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 7.34, 9.91, 0, true),
  ('contraloria:2025:158', 'CG-0158', 'FASCIA DE CARRIOLA GALVANIZADA DE 2" X 4" cal.18', 'Materiales: BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CARRIOLA GALVANIZADA 2" X 4" cal.18; SOLDADURA 6011 X 1/8"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 8.14, 10.99, 0, true),
  ('contraloria:2025:159', 'CG-0159', 'FASCIA DE CARRIOLA GALVANIZADA DE 2" X 6" cal.18', 'Materiales: BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CARRIOLA GALVANIZADA 2" X 6" cal.18; SOLDADURA 6011 X 1/8"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 11.02, 14.88, 0, true),
  ('contraloria:2025:160', 'CG-0160', 'FASCIA DE CARRIOLA GALVANIZADA DE 2" X 8" cal.18', 'Materiales: BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CARRIOLA GALVANIZADA 2" X 8" cal.18; SOLDADURA 6011 X 1/8"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 34.56, 46.66, 0, true),
  ('contraloria:2025:161', 'CG-0161', 'AISLANTE REFLECTIVO DE ESPUMA DE 5 mm', 'Materiales: AISLANTE REFLECTIVO DE ESPUMA DE 5 mm; ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 6.19, 8.36, 0, true),
  ('contraloria:2025:162', 'CG-0162', 'AISLANTE REFLECTIVO DE BURBUJA DE 3/16"', 'Materiales: ALAMBRE DE AMARRE, LISO GALVANIZADO; AISLANTE REFLECTIVO DE BURBUJA DE 3/16"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 4.49, 6.06, 0, true),
  ('contraloria:2025:163', 'CG-0163', 'TECHO DE LÁMINAS DE ZINC GALVANIZADA cal.26', 'Materiales: BROCHA DE 2"; TORNILLO 2-1/2" PUNTA DE BROCA; LÁMINA DE ZINC GALVANIZADO cal.26; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 17.89, 24.15, 0, true),
  ('contraloria:2025:164', 'CG-0164', 'TECHO DE LÁMINAS DE ZINC ESMALTADO cal.26', 'Materiales: TORNILLO 2-1/2" PUNTA DE BROCA; PINTURA ANTICORROSIVO TIPO MINIO ROJO; LAMINA DE ZINC ESMALTADO cal.26; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 19.19, 25.91, 0, true),
  ('contraloria:2025:165', 'CG-0165', 'TECHO DE LÁMINAS DE POLICARBONATO', 'Materiales: TORNILLO PARA TECHO PANALIT 4''''X1/4"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; LÁMINA DE POLICARBONATO - TECHOS; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 29.64, 40.01, 0, true),
  ('contraloria:2025:166', 'CG-0166', 'TECHO DE LÁMINAS DE UPVC', 'Materiales: LAMINA UPVC - TECHOS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; TORNILLO PARA TECHO PANALIT 4''''X1/4"; BROCHA DE 2"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 26.77, 36.14, 0, true),
  ('contraloria:2025:167', 'CG-0167', 'TECHO DE LÁMINAS AISLANTES O TERMOPANEL', 'Materiales: TORNILLO PARA TECHO PANALIT 4''''X1/4"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; LÁMINA AISLANTE O TERMOPANEL; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 57.42, 77.52, 0, true),
  ('contraloria:2025:168', 'CG-0168', 'TECHO DE TEJAS DE FIBROCEMENTO', 'Materiales: TORNILLO PARA TECHO PANALIT 4''''X1/4"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; LÁMINA DE FIBROCEMENTO - TECHOS; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 25.87, 34.92, 0, true),
  ('contraloria:2025:169', 'CG-0169', 'TECHO DE TEJAS DE ARCILLA', 'Materiales: TORNILLO PARA TECHO PANALIT 4''''X1/4"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; TEJAS DE ARCILLA (11/m2); BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 40.28, 54.38, 0, true),
  ('contraloria:2025:170', 'CG-0170', 'TECHO DE TEJAS PLÁSTICAS', 'Materiales: TORNILLO PARA TECHO PANALIT 4''''X1/4"; LÁMINA DE TEJA PLÁSTICA (2/m2); PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 48.41, 65.35, 0, true),
  ('contraloria:2025:171', 'CG-0171', 'TECHO DE TEJAS METÁLICAS', 'Materiales: TORNILLO PARA TECHO PANALIT 4''''X1/4"; LÁMINA DE TEJA METÁLICA - TECHOS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 24.4, 32.94, 0, true),
  ('contraloria:2025:172', 'CG-0172', 'CABALLETE O CUMBRERA DE ZINC GALVANIZADO DE 24" cal.26', 'Materiales: CUMBRERA O CABALLETE LISO GALVANIZADO DE 24" cal.26; PINTURA ANTICORROSIVO TIPO MINIO ROJO; TORNILLO 2-1/2" PUNTA DE BROCA; BROCHA DE 2"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 8.72, 11.77, 0, true),
  ('contraloria:2025:173', 'CG-0173', 'CABALLETE O CUMBRERA DE ZINC ESMALTADO DE 24" cal.26', 'Materiales: BROCHA DE 2"; TORNILLO 2-1/2" PUNTA DE BROCA; CUMBRERA O CABALLETE LISO ESMALTADO DE 24" cal.26; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 9.77, 13.19, 0, true),
  ('contraloria:2025:174', 'CG-0174', 'CABALLETE O CUMBRERA PARA LÁMINAS DE UPVC', 'Materiales: CUMBRERA O CABALLETE PARA TECHO UPVC; PINTURA ANTICORROSIVO TIPO MINIO ROJO; TORNILLO 2-1/2" PUNTA DE BROCA; BROCHA DE 2"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 14.61, 19.72, 0, true),
  ('contraloria:2025:175', 'CG-0175', 'CABALLETE O CUMBRERA PARA TEJAS DE ARCILLA', 'Materiales: CUMBRERA PARA TEJAS DE ARCILLA (3/m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 10.3, 13.9, 0, true),
  ('contraloria:2025:176', 'CG-0176', 'CABALLETE O CUMBRERA PARA TEJAS PLÁSTICAS', 'Materiales: TORNILLO 2-1/2" PUNTA DE BROCA; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CUMBRERA O CABALLETE PARA TEJAS PLÁSTICAS (2/m); BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 24.6, 33.21, 0, true),
  ('contraloria:2025:177', 'CG-0177', 'CABALLETE O CUMBRERA PARA TEJAS METÁLICAS', 'Materiales: CUMBRERA O CABALLETE PARA TEJAS METÁLICAS; TORNILLO 2-1/2" PUNTA DE BROCA; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 12.61, 17.02, 0, true),
  ('contraloria:2025:178', 'CG-0178', 'CABALLETE O CUMBRERA PARA TEJAS DE FIBROCEMENTO', 'Materiales: TORNILLO 2-1/2" PUNTA DE BROCA; PINTURA ANTICORROSIVO TIPO MINIO ROJO; CUMBRERA O CABALLETE PARA LÁMINAS DE FIBROCEMENTO; BROCHA DE 2"
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 17.78, 24.0, 0, true),
  ('contraloria:2025:179', 'CG-0179', 'ESTRUCTURA COMPLETA DE TECHO DE ZINC GALVANIZADO cal.26 (carriolas 2"x4" cal.16 espaciadas a 1m + cumbrera + aislante 3/16")', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 4" cal.16; ALINEADORES DE CARRIOLAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; CUMBRERA O CABALLETE LISO GALVANIZADO DE 24" cal.26; ALAMBRE DE AMARRE, LISO GALVANIZADO; AISLANTE REFLECTIVO DE BURBUJA DE 3/16"; LÁMINA DE ZINC GALVANIZADO cal.26; TORNILLO 2-1/2" PUNTA DE BROCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 43.89, 59.25, 0, true),
  ('contraloria:2025:180', 'CG-0180', 'ESTRUCTURA COMPLETA DE TECHO DE ZINC ESMALTADO cal.26 (carriolas 2"x4" cal.16 espaciadas a 1m + cumbrera + aislante 3/16")', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 4" cal.16; ALINEADORES DE CARRIOLAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; CUMBRERA O CABALLETE LISO ESMALTADO DE 24" cal.26; ALAMBRE DE AMARRE, LISO GALVANIZADO; AISLANTE REFLECTIVO DE BURBUJA DE 3/16"; LAMINA DE ZINC ESMALTADO cal.26; TORNILLO 2-1/2" PUNTA DE BROCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 45.34, 61.21, 0, true),
  ('contraloria:2025:181', 'CG-0181', 'ESTRUCTURA COMPLETA DE TECHO DE UPVC (carriolas 2"x4" cal.16 espaciadas a 1m + cumbrera + aislante 3/16")', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 4" cal.16; ALINEADORES DE CARRIOLAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; CUMBRERA O CABALLETE PARA TECHO UPVC; ALAMBRE DE AMARRE, LISO GALVANIZADO; AISLANTE REFLECTIVO DE BURBUJA DE 3/16"; LAMINA UPVC - TECHOS; TORNILLO 2-1/2" PUNTA DE BROCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 51.85, 70.0, 0, true),
  ('contraloria:2025:182', 'CG-0182', 'ESTRUCTURA COMPLETA DE TECHO DE TEJAS PLÁSTICAS (carriolas 2"x4" cal.16 espaciadas a 1m + cumbrera + aislante 3/16")', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 4" cal.16; ALINEADORES DE CARRIOLAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; CUMBRERA O CABALLETE PARA TEJAS PLÁSTICAS (2/m); ALAMBRE DE AMARRE, LISO GALVANIZADO; AISLANTE REFLECTIVO DE BURBUJA DE 3/16"; LÁMINA DE TEJA PLÁSTICA (2/m2); TORNILLO 2-1/2" PUNTA DE BROCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 74.99, 101.24, 0, true),
  ('contraloria:2025:183', 'CG-0183', 'ESTRUCTURA COMPLETA DE TECHO DE TEJAS METÁLICAS (carriolas 2"x4" cal.16 espaciadas a 1m + cumbrera + aislante 3/16")', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 4" cal.16; ALINEADORES DE CARRIOLAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; CUMBRERA O CABALLETE PARA TEJAS METÁLICAS; ALAMBRE DE AMARRE, LISO GALVANIZADO; AISLANTE REFLECTIVO DE BURBUJA DE 3/16"; LÁMINA DE TEJA METÁLICA - TECHOS; TORNILLO 2-1/2" PUNTA DE BROCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 49.18, 66.39, 0, true),
  ('contraloria:2025:184', 'CG-0184', 'ESTRUCTURA COMPLETA DE TECHO DE TEJAS DE FIBROCEMENTO (carriolas 2"x4" cal.16 espaciadas a 1m + cumbrera + aislante 3/16")', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 4" cal.16; ALINEADORES DE CARRIOLAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; CUMBRERA O CABALLETE PARA LÁMINAS DE FIBROCEMENTO; ALAMBRE DE AMARRE, LISO GALVANIZADO; AISLANTE REFLECTIVO DE BURBUJA DE 3/16"; LÁMINA DE FIBROCEMENTO - TECHOS; TORNILLO 2-1/2" PUNTA DE BROCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 51.39, 69.38, 0, true),
  ('contraloria:2025:185', 'CG-0185', 'ESTRUCTURA COMPLETA DE TECHOS AISLANTE O TERMOPANELES (carriolas 2"x4" cal.16 espaciadas a 1m + cumbrera + aislante 3/16")', 'Materiales: SOLDADURA 6011 X 1/8"; CARRIOLA GALVANIZADA 2" X 4" cal.16; ALINEADORES DE CARRIOLAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; CUMBRERA O CABALLETE LISO ESMALTADO DE 24" cal.26; LÁMINA AISLANTE O TERMOPANEL; TORNILLO 2-1/2" PUNTA DE BROCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 78.84, 106.43, 0, true),
  ('contraloria:2025:186', 'CG-0186', 'CANAL DE METAL ESMALTADO cal.26', 'Materiales: CANAL DE METAL ESMALTADO cal.26 + 25% DE ACCESORIOS; GANCHO PARA SOSTENER CANAL DE METAL; SECCIÓN DE CANAL DE METAL CON BAJANTE DE 4"
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 24.23, 32.71, 0, true),
  ('contraloria:2025:187', 'CG-0187', 'CANAL DE PVC COLONIAL', 'Materiales: SOPORTE PARA CANAL DE PVC; CANAL DE PVC, COLONIAL + 25% DE ACCESORIOS; SECCIÓN BAJANTE PARA CANAL DE PVC COLONIAL
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 26.02, 35.13, 0, true),
  ('contraloria:2025:188', 'CG-0188', 'CANAL DE PVC LISO', 'Materiales: SOPORTE PARA CANAL DE PVC; CANAL DE PVC, LISO + 25% DE ACCESORIOS; SECCIÓN BAJANTE PARA CANAL DE PVC LISO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 27.31, 36.87, 0, true),
  ('contraloria:2025:189', 'CG-0189', 'BAJANTE PLUVIAL DE PVC DE 4" SDR-41', 'Materiales: TUBERÍA PVC SDR-41 DE 4 IN DE 20PIES; ABRAZADERA PARA BAJANTE PLUVIAL; CODO 4 IN PVC SDR41
Mano de obra: GUINDOLERO (CALIFICADO + 16%); AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 14.47, 19.53, 0, true),
  ('contraloria:2025:190', 'CG-0190', 'BAJANTE PLUVIAL DE PVC DE 6" SDR-41', 'Materiales: ABRAZADERA PARA BAJANTE PLUVIAL; TUBERÍA PVC SDR-41 DE 6 IN Y 20 PIES; CODO 6 IN PVC SDR41
Mano de obra: GUINDOLERO (CALIFICADO + 16%); AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 23.58, 31.83, 0, true),
  ('contraloria:2025:191', 'CG-0191', 'FLASHING DE ZINC ESMALTADO cal.26', 'Materiales: PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; FLASHING DE ZINC ESMALTADO cal.26 DE 8 PIES; TORNILLO 2-1/2" PUNTA DE BROCA; ADIFLEX MEMBRANA DE REFUERZO PARA IMPERMEABILIZAR 6" x 100 m
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 10.94, 14.77, 0, true),
  ('contraloria:2025:192', 'CG-0192', 'FLASHING DE ZINC GALVANIZADO cal.26', 'Materiales: PINTURA ANTICORROSIVO TIPO MINIO ROJO; BROCHA DE 2"; FLASHING DE ZINC GALVANIZADO cal.26 DE 8 PIES; TORNILLO 2-1/2" PUNTA DE BROCA; ADIFLEX MEMBRANA DE REFUERZO PARA IMPERMEABILIZAR 6" x 100 m
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 9.49, 12.81, 0, true),
  ('contraloria:2025:193', 'CG-0193', 'REMOCIÓN DE PISOS EXISTENTES (BALDOSAS)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MARTILLO NEUMÁTICO MANUAL ELÉCTRICO (Sin Compresor)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 1.69, 2.28, 0, true),
  ('contraloria:2025:194', 'CG-0194', 'DEMOLICIÓN Y ACARREO DE PAREDES DE GYPSUM DE 1/2" CON ESTRUCTURA DE ALUMINIO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 3.08, 4.16, 0, true),
  ('contraloria:2025:195', 'CG-0195', 'DEMOLICIÓN Y ACARREO DE CIELO RASO DE GYPSUM DE 1/2" CON ESTRUCTURA DE ALUMINIO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 1.9, 2.56, 0, true),
  ('contraloria:2025:196', 'CG-0196', 'DEMOLICIÓN Y ACARREO DE CIELO RASO SUSPENDIDO DE 2 X 2', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 1.69, 2.28, 0, true),
  ('contraloria:2025:197', 'CG-0197', 'LIMPIEZA MANUAL DE DEMOLICIÓN DE PISOS EXISTENTES', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 0.46, 0.62, 0, true),
  ('contraloria:2025:198', 'CG-0198', 'DESECHO DE PISOS EXISTENTES (ACARREO)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible); RETROEXCAVADORA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 0.92, 1.24, 0, true),
  ('contraloria:2025:199', 'CG-0199', 'REMOCIÓN Y LIMPIEZA DE BALDOSAS (con acarreo necesario)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 3.07, 4.14, 0, true),
  ('contraloria:2025:200', 'CG-0200', 'REMOCIÓN Y LIMPIEZA DE BALDOSAS (sin acarreo necesario)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 2.15, 2.9, 0, true),
  ('contraloria:2025:201', 'CG-0201', 'LIMPIEZA Y DESINFECCIÓN DE PARED/MURO O SIMILAR', 'Materiales: CLOROX
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; HIDROLAVADORA 3800 PSI
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 3.33, 4.5, 0, true),
  ('contraloria:2025:202', 'CG-0202', 'CORDÓN PARA EL CONFINAMIENTO DE ADOQUINES (0.20 m x 0.30 m)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 29.81, 40.24, 0, true),
  ('contraloria:2025:203', 'CG-0203', 'ADOQUIN HOLLAND DE 8 cm + RELLENO DE JUNTAS Y COMPACTACIÓN', 'Materiales: ARENA; ADOQUIN HOLLAND 8CM
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 53.03, 71.59, 0, true),
  ('contraloria:2025:204', 'CG-0204', 'ESTRUCTURA COMPLETA DE ADOQUINES HOLLAND DE 8 cm (PEATONAL 15 cm CAPA BASE + 5 cm CAMA DE ARENA) COMPLETA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 70.81, 95.59, 0, true),
  ('contraloria:2025:205', 'CG-0205', 'PAVIMENTO DE GRAMA BLOCK (para estacionamientos)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 64.87, 87.57, 0, true),
  ('contraloria:2025:206', 'CG-0206', 'PAREDES GYPSUM BOARD DE 1/2" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 41.67, 56.25, 0, true),
  ('contraloria:2025:207', 'CG-0207', 'PAREDES GYPSUM BOARD DE 1/2" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 67.73, 91.44, 0, true),
  ('contraloria:2025:208', 'CG-0208', 'PAREDES GYPSUM BOARD DE 1/2" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 43.73, 59.04, 0, true),
  ('contraloria:2025:209', 'CG-0209', 'PAREDES GYPSUM BOARD DE 1/2" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 69.79, 94.22, 0, true),
  ('contraloria:2025:210', 'CG-0210', 'PAREDES GYPSUM BOARD DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 45.2, 61.02, 0, true),
  ('contraloria:2025:211', 'CG-0211', 'PAREDES GYPSUM BOARD DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 71.26, 96.2, 0, true),
  ('contraloria:2025:212', 'CG-0212', 'PAREDES GYPSUM BOARD DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 2"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 47.3, 63.85, 0, true),
  ('contraloria:2025:213', 'CG-0213', 'PAREDES GYPSUM BOARD DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 2" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 73.36, 99.04, 0, true),
  ('contraloria:2025:214', 'CG-0214', 'PAREDES GYPSUM BOARD RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 1/2" RESISTENTE A LA HUMEDAD; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 44.76, 60.43, 0, true),
  ('contraloria:2025:215', 'CG-0215', 'PAREDES GYPSUM BOARD RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 1/2" RESISTENTE A LA HUMEDAD; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 70.82, 95.61, 0, true),
  ('contraloria:2025:216', 'CG-0216', 'PAREDES GYPSUM BOARD RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 1/2" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 46.82, 63.21, 0, true),
  ('contraloria:2025:217', 'CG-0217', 'PAREDES GYPSUM BOARD RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 1/2" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 72.88, 98.39, 0, true),
  ('contraloria:2025:218', 'CG-0218', 'PAREDES GYPSUM BOARD RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 1/2" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 48.29, 65.19, 0, true),
  ('contraloria:2025:219', 'CG-0219', 'PAREDES GYPSUM BOARD RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 1/2" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 74.35, 100.37, 0, true),
  ('contraloria:2025:220', 'CG-0220', 'PAREDES GYPSUM BOARD RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 2"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 1/2" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 50.39, 68.03, 0, true),
  ('contraloria:2025:221', 'CG-0221', 'PAREDES GYPSUM BOARD RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 2" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 1/2" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 76.45, 103.21, 0, true),
  ('contraloria:2025:222', 'CG-0222', 'PAREDES GYPSUM BOARD RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 2 1/2 X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 5/8" RESISTENTE A LA HUMEDAD; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 48.01, 64.81, 0, true),
  ('contraloria:2025:223', 'CG-0223', 'PAREDES GYPSUM BOARD RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 2 1/2 X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; ANCLAJE AUTO PERFORANTE #8; LÁMINA DE GYPSUM BOARD DE 5/8" RESISTENTE A LA HUMEDAD; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 74.07, 99.99, 0, true),
  ('contraloria:2025:224', 'CG-0224', 'PAREDES GYPSUM BOARD RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD DE 5/8" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 49.24, 66.47, 0, true),
  ('contraloria:2025:225', 'CG-0225', 'PAREDES GYPSUM BOARD RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD DE 5/8" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 75.3, 101.65, 0, true),
  ('contraloria:2025:226', 'CG-0226', 'PAREDES GYPSUM BOARD RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD DE 5/8" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 50.71, 68.46, 0, true),
  ('contraloria:2025:227', 'CG-0227', 'PAREDES GYPSUM BOARD RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD DE 5/8" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 76.77, 103.64, 0, true),
  ('contraloria:2025:228', 'CG-0228', 'PAREDES GYPSUM BOARD RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 4" X 2"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD DE 5/8" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 52.81, 71.29, 0, true),
  ('contraloria:2025:229', 'CG-0229', 'PAREDES GYPSUM BOARD RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 4" X 2 (completa incluye pintura y pasteo)"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD DE 5/8" RESISTENTE A LA HUMEDAD; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 78.87, 106.47, 0, true),
  ('contraloria:2025:230', 'CG-0230', 'PAREDES GYPSUM BOARD FIRECODE DE 1/2" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM FIDECODE DE 4 X 8 '' X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 43.93, 59.31, 0, true),
  ('contraloria:2025:231', 'CG-0231', 'PAREDES GYPSUM BOARD FIRECODE DE 1/2" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM FIDECODE DE 4 X 8 '' X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 69.99, 94.49, 0, true),
  ('contraloria:2025:232', 'CG-0232', 'PAREDES GYPSUM BOARD FIRECODE DE 1/2" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM FIDECODE DE 4 X 8 '' X 1/2"; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 45.99, 62.09, 0, true),
  ('contraloria:2025:233', 'CG-0233', 'PAREDES GYPSUM BOARD FIRECODE DE 1/2" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM FIDECODE DE 4 X 8 '' X 1/2"; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 72.05, 97.27, 0, true),
  ('contraloria:2025:234', 'CG-0234', 'PAREDES GYPSUM BOARD FIRECODE DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM FIDECODE DE 4 X 8 '' X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 47.46, 64.07, 0, true),
  ('contraloria:2025:235', 'CG-0235', 'PAREDES GYPSUM BOARD FIRECODE DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM FIDECODE DE 4 X 8 '' X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 73.52, 99.25, 0, true),
  ('contraloria:2025:236', 'CG-0236', 'PAREDES GYPSUM BOARD FIRECODE DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 2"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM FIDECODE DE 4 X 8 '' X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 49.56, 66.91, 0, true),
  ('contraloria:2025:237', 'CG-0237', 'PAREDES GYPSUM BOARD FIRECODE DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 2" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM FIDECODE DE 4 X 8 '' X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 75.62, 102.09, 0, true),
  ('contraloria:2025:238', 'CG-0238', 'PAREDES FIBEROCK RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 58.71, 79.26, 0, true),
  ('contraloria:2025:239', 'CG-0239', 'PAREDES FIBEROCK RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 84.77, 114.44, 0, true),
  ('contraloria:2025:240', 'CG-0240', 'PAREDES FIBEROCK RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 1/2"; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 60.77, 82.04, 0, true),
  ('contraloria:2025:241', 'CG-0241', 'PAREDES FIBEROCK RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 1/2"; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 86.83, 117.22, 0, true),
  ('contraloria:2025:242', 'CG-0242', 'PAREDES FIBEROCK RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 62.24, 84.02, 0, true),
  ('contraloria:2025:243', 'CG-0243', 'PAREDES FIBEROCK RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 88.3, 119.2, 0, true),
  ('contraloria:2025:244', 'CG-0244', 'PAREDES FIBEROCK RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 2"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 64.34, 86.86, 0, true),
  ('contraloria:2025:245', 'CG-0245', 'PAREDES FIBEROCK RH DE 1/2" + ESTRUCTURA DE ALUMINIO DE 4" X 2" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 90.4, 122.04, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:246', 'CG-0246', 'PAREDES FIBEROCK RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 5/8"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 60.05, 81.07, 0, true),
  ('contraloria:2025:247', 'CG-0247', 'PAREDES FIBEROCK RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 2 1/2" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 5/8"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 86.11, 116.25, 0, true),
  ('contraloria:2025:248', 'CG-0248', 'PAREDES FIBEROCK RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 5/8"; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 62.11, 83.85, 0, true),
  ('contraloria:2025:249', 'CG-0249', 'PAREDES FIBEROCK RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 3 5/8" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 5/8"; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL.24; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 88.17, 119.03, 0, true),
  ('contraloria:2025:250', 'CG-0250', 'PAREDES FIBEROCK RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 5/8"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 63.58, 85.83, 0, true),
  ('contraloria:2025:251', 'CG-0251', 'PAREDES FIBEROCK RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 4" X 1 1/4" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 5/8"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 89.64, 121.01, 0, true),
  ('contraloria:2025:252', 'CG-0252', 'PAREDES FIBEROCK RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 4" X 2"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 5/8"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 65.68, 88.67, 0, true),
  ('contraloria:2025:253', 'CG-0253', 'PAREDES FIBEROCK RH DE 5/8" + ESTRUCTURA DE ALUMINIO DE 4" X 2" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE FIBEROCK RESIST. HUM. 4 X 8'' X 5/8"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; CINTA DE 300 PL X 2" PARA GYPSUM; SELLADOR PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 91.74, 123.85, 0, true),
  ('contraloria:2025:254', 'CG-0254', 'PAREDES DE PLYROCK DE 14 mm + ESTRUCTURA DE ALUMINIO DE 4"', 'Materiales: LÁMINA DE PLYROCK DE 14 MM; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; TORNILLO PLYCEM PHB-125 PT #8 * 1 1/4; CINTA DE 300 PL X 2" PARA GYPSUM; MORTERO PLYROCK JUNTA (TANQUE 5 KG)
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 60.06, 81.08, 0, true),
  ('contraloria:2025:255', 'CG-0255', 'PAREDES DE PLYROCK DE 14 MM + ESTRUCTURA DE ALUMINIO DE 4" (completa incluye pintura y pasteo)', 'Materiales: LÁMINA DE PLYROCK DE 14 MM; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; TORNILLO PLYCEM PHB-125 PT #8 * 1 1/4; CINTA DE 300 PL X 2" PARA GYPSUM; MORTERO PLYROCK JUNTA (TANQUE 5 KG)
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 86.12, 116.26, 0, true),
  ('contraloria:2025:256', 'CG-0256', 'PAREDES DE PLYROCK DE 12 mm + ESTRUCTURA DE ALUMINIO DE 4"', 'Materiales: LÁMINA DE PLYROCK DE 12 MM; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; TORNILLO PLYCEM PHB-125 PT #8 * 1 1/4; CINTA DE 300 PL X 2" PARA GYPSUM; MORTERO PLYROCK JUNTA (TANQUE 5 KG)
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 56.02, 75.63, 0, true),
  ('contraloria:2025:257', 'CG-0257', 'PAREDES DE PLYROCK DE 12 MM + ESTRUCTURA DE ALUMINIO DE 4" (completa incluye pintura y pasteo)', 'Materiales: LÁMINA DE PLYROCK DE 12 MM; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; TORNILLO PLYCEM PHB-125 PT #8 * 1 1/4; CINTA DE 300 PL X 2" PARA GYPSUM; MORTERO PLYROCK JUNTA (TANQUE 5 KG)
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 82.08, 110.81, 0, true),
  ('contraloria:2025:258', 'CG-0258', 'PAREDES DE PLYROCK DE 8 mm + ESTRUCTURA DE ALUMINIO DE 4"', 'Materiales: LÁMINA DE PLYROCK DE 8 MM; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; TORNILLO PLYCEM PHB-125 PT #8 * 1 1/4; CINTA DE 300 PL X 2" PARA GYPSUM; MORTERO PLYROCK JUNTA (TANQUE 5 KG)
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 48.63, 65.65, 0, true),
  ('contraloria:2025:259', 'CG-0259', 'PAREDES DE PLYROCK DE 8 MM + ESTRUCTURA DE ALUMINIO DE 4" (completa incluye pintura y pasteo)', 'Materiales: LÁMINA DE PLYROCK DE 8 MM; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; TORNILLO PLYCEM PHB-125 PT #8 * 1 1/4; CINTA DE 300 PL X 2" PARA GYPSUM; MORTERO PLYROCK JUNTA (TANQUE 5 KG)
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 74.69, 100.83, 0, true),
  ('contraloria:2025:260', 'CG-0260', 'PAREDES DE PLYROCK DE 6 mm + ESTRUCTURA DE ALUMINIO DE 4"', 'Materiales: LÁMINA DE PLYROCK DE 6 MM; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; TORNILLO PLYCEM PHB-125 PT #8 * 1 1/4; CINTA DE 300 PL X 2" PARA GYPSUM; MORTERO PLYROCK JUNTA (TANQUE 5 KG)
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 45.28, 61.13, 0, true),
  ('contraloria:2025:261', 'CG-0261', 'PAREDES DE PLYROCK DE 6 MM + ESTRUCTURA DE ALUMINIO DE 4" (completa incluye pintura y pasteo)', 'Materiales: LÁMINA DE PLYROCK DE 6 MM; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ALUMINIO DE 4" X 1 1/4" X 10´ CAL 24; TORNILLO PLYCEM PHB-125 PT #8 * 1 1/4; CINTA DE 300 PL X 2" PARA GYPSUM; MORTERO PLYROCK JUNTA (TANQUE 5 KG)
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 71.34, 96.31, 0, true),
  ('contraloria:2025:262', 'CG-0262', 'PARED DE PANEL ESTRUCTURAL PCH-100 (INCLUYE REFUERZOS Y 1RA CAPA DE SCRATCH)', 'Materiales: PANEL DE PCH-100 mm ESTRUCTURAL DE 4´ X 10´ X 4" DE ESP.; ACERO DE REFUERZO; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); ALAMBRE DE AMARRE, LISO GALVANIZADO; MALLA PLANA DE REFUERZO DE 10.24 IN X 4 PIE DE LARGO X 2 MM PCH; MALLA DE REFUERZO U DE 4" X 4 PIE DE LONG. PCH; MALLA ESQUINERA DE 6" X 6" X 4 PIES DE LONG PCH; GRAPA TIPO OMEGA DE 16MM X 1250 UND; MADERA - PINOTEA REGULAR DE 2" X 2" X 8 PIE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 45.93, 62.01, 0, true),
  ('contraloria:2025:263', 'CG-0263', 'PARED DE PANEL ESTRUCTURAL PCH-150 (INCLUYE REFUERZO Y 1RA CAPA DE SCRATHC)', 'Materiales: PANEL ESTRUCTURAL PCH-150 DE 4´ X 10´ X 15 CM DE ESP.; ACERO DE REFUERZO; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); ALAMBRE DE AMARRE, LISO GALVANIZADO; MALLA PLANA DE REFUERZO DE 10.24 IN X 4 PIE DE LARGO X 2 MM PCH; MALLA DE REFUERZO U DE 4" X 4 PIE DE LONG. PCH; MALLA ESQUINERA DE 6" X 6" X 4 PIES DE LONG PCH; GRAPA TIPO OMEGA DE 16MM X 1250 UND; MADERA - PINOTEA REGULAR DE 2" X 2" X 8 PIE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 55.22, 74.55, 0, true),
  ('contraloria:2025:264', 'CG-0264', 'BOMBEO DE MORTERO CON MÁQUINA ROCEADORA', 'Materiales: CEMENTO GRIS TIPO I; ARENA
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; BOMBA DE PROYECCIÓN DE MORTERO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 7.13, 9.63, 0, true),
  ('contraloria:2025:265', 'CG-0265', 'FACHADA DE LÁMINA DE ALUCOBOND ACM DE 4 mm DE ESPESOR', 'Materiales: LÁMINA DE ALUCOBOND DE 4´ X 8´ X 4 mm DE ESP.; TRACK DE ALUMINIO DE 4" X 2" X 10´ CAL. 20; STUD DE ALUMINIO DE 3 5/8" X 1 1/4" X 10'' CAL. 24; JUNTA DE DILATACIÓN DE 10 mm x 2.0 M; SELLADOR DE JUNTA SIKAFLEX - 1A DE 300 ml - ALUCOBOND; TORNILLO PH 8 - 125; TORNILLO DE ANCLAJE - ALUCOBOND
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 85.55, 115.49, 0, true),
  ('contraloria:2025:266', 'CG-0266', 'CIELO RASO DE GYPSUM BOARD 1/2"', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 21.23, 28.66, 0, true),
  ('contraloria:2025:267', 'CG-0267', 'CIELO RASO DE GYPSUM BOARD 1/2" (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 34.26, 46.25, 0, true),
  ('contraloria:2025:268', 'CG-0268', 'CIELO RASO DE GYPSUM BOARD 1/2" CON AISLANTE', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 23.3, 31.45, 0, true),
  ('contraloria:2025:269', 'CG-0269', 'CIELO RASO DE GYPSUM BOARD 1/2" CON AISLANTE (completo incluye pasteo y pintura)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 36.33, 49.05, 0, true),
  ('contraloria:2025:270', 'CG-0270', 'CIELO RASO DE GYPSUM BOARD 1/2" CON DISEÑO (completo incluye pasteo, puntura y aislante)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM; AISLANTE DE FIBRA DE 3.5" X 1.22 X 25.0 FT
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 60.01, 81.01, 0, true),
  ('contraloria:2025:271', 'CG-0271', 'ESPEJO DE GYPSUM BOARD HASTA 60 CM DE ALTO', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro lineal', 'm', 15.79, 21.32, 0, true),
  ('contraloria:2025:272', 'CG-0272', 'ESPEJO DE GYPSUM BOARD HASTA 60 cm DE ALTO (completa incluye pintura y pasteo)', 'Materiales: LIJA #80; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; CINTA DE 300 PL X 2" PARA GYPSUM; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; SELLADOR PARA GYPSUM
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro lineal', 'm', 23.61, 31.87, 0, true),
  ('contraloria:2025:273', 'CG-0273', 'CIELO RASO SUSPENDIDO DE 2'' X 2'' DE FOAM', 'Materiales: ÁNGULO DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 2´; LÁMINA DE FOAM 2 X 2´; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); TORNILLO DE 7/16"; ANCLAJES CON TEE 4´ - CIELO RASO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 17.96, 24.25, 0, true),
  ('contraloria:2025:274', 'CG-0274', 'CIELO RASO SUSPENDIDO DE 2'' X 4'' DE FOAM', 'Materiales: ÁNGULO DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 4´; LÁMINA DE FOAM 2 X 4; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); TORNILLO DE 7/16"; ANCLAJES CON TEE 4´ - CIELO RASO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 16.46, 22.22, 0, true),
  ('contraloria:2025:275', 'CG-0275', 'CIELO RASO SUSPENDIDO DE 2'' X 2'' DE YESO', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA DE YESO 2 X 2; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 18.52, 25.0, 0, true),
  ('contraloria:2025:276', 'CG-0276', 'CIELO RASO SUSPENDIDO DE 2'' X 4'' DE YESO', 'Materiales: ÁNGULO DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 4´; LÁMINA DE YESO DE 2 X 4; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); TORNILLO DE 7/16"; ANCLAJES CON TEE 4´ - CIELO RASO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 17.4, 23.49, 0, true),
  ('contraloria:2025:277', 'CG-0277', 'CIELO RASO SUSPENDIDO DE 2'' X 2'' DE ESCAYOLA', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA DE ESCAYOLA 2 X 2; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 24.29, 32.79, 0, true),
  ('contraloria:2025:278', 'CG-0278', 'CIELO RASO SUSPENDIDO DE 2'' X 2'' DE FIBRA MINERAL', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA DE FIBRA MINERAL 2 X 2; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 28.24, 38.12, 0, true),
  ('contraloria:2025:279', 'CG-0279', 'CIELO RASO SUSPENDIDO DE 2'' X 4'' DE FIBRA MINERAL', 'Materiales: ÁNGULO DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 4´; LÁMINA DE FIBRA MINERAL DE 2 X 4´; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); ANCLAJES CON TEE 4´ - CIELO RASO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 24.89, 33.6, 0, true),
  ('contraloria:2025:280', 'CG-0280', 'CIELO RASO DE 2'' X 2'' DE FIBROCEMENTO', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA DE FIBROCEMENTO DE 2 X 2´; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 22.33, 30.15, 0, true),
  ('contraloria:2025:281', 'CG-0281', 'CIELO RASO DE 2'' X 4'' DE FIBROCEMENTO', 'Materiales: ÁNGULO DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 12´; TEE DE ALUMINIO DE 4´; LÁMINA DE FIBROCEMENTO DE 2 X 4´; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); TORNILLO DE 7/16"; ANCLAJES CON TEE 4´ - CIELO RASO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 20.03, 27.04, 0, true),
  ('contraloria:2025:282', 'CG-0282', 'CIELO RASO DE 2'' X 2'' DE PVC LISO', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA 2 X 2 DE PVC LISO; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 19.92, 26.89, 0, true),
  ('contraloria:2025:283', 'CG-0283', 'CIELO RASO DE 2'' X 2'' DE PVC TEXTURIZADO', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA 2 X 2 DE PVC TEXTURIZADO; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 21.77, 29.39, 0, true),
  ('contraloria:2025:284', 'CG-0284', 'CIELO RASO DE PVC DE 200 X 2980 X 6 mm', 'Materiales: CLAVOS DE IMPACTO 3/4" (100 UNIDADES); TORNILLOS 1/2" PUNTA FINA; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; ÁNGULO / CORNISA INTERNO 7.5 MM X 5.9 M; UNIÓN DE 6 MM X 5.9 M - CIELO RASO; LÁMINA DE PVC 200 X 2980 X 6MM
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 26.21, 35.38, 0, true),
  ('contraloria:2025:285', 'CG-0285', 'CIELO RASO DE PVC DE 200 X 5950 X 6 mm', 'Materiales: CLAVOS DE IMPACTO 3/4" (100 UNIDADES); TORNILLOS 1/2" PUNTA FINA; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; ÁNGULO / CORNISA INTERNO 7.5 MM X 5.9 M; UNIÓN DE 6 MM X 5.9 M - CIELO RASO; LÁMINA DE PVC 200 X 5950 X 6 MM
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 24.51, 33.09, 0, true),
  ('contraloria:2025:286', 'CG-0286', 'CIELO RASO DE PVC DE 200 X 5950 X 7.5 mm', 'Materiales: CLAVOS DE IMPACTO 3/4" (100 UNIDADES); TORNILLOS 1/2" PUNTA FINA; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; ÁNGULO / CORNISA INTERNO 7.5 MM X 5.9 M; UNIÓN DE 6 MM X 5.9 M - CIELO RASO; LÁMINA DE PVC 250 X 5950 X 7.5 MM
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 27.95, 37.73, 0, true),
  ('contraloria:2025:287', 'CG-0287', 'CAJÓN DECORATIVO DE GYPSUM BOARD PARA LUZ INDIRECTA, DE 10 X 10 X 5 cm (Completo incluye pintura y pasteo)', 'Materiales: CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; CINTA DE 300 PL X 2" PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro lineal', 'm', 20.9, 28.21, 0, true),
  ('contraloria:2025:288', 'CG-0288', 'CAJÓN DECORATIVO DE GYPSUM BOARD PARA LUZ INDIRECTA, DE 15 X 15 X 5 cm (Completa incluye pintura y pasteo)', 'Materiales: CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; CINTA DE 300 PL X 2" PARA GYPSUM; ESQUINERA METÁLICA 1 1/4" X 8''
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro lineal', 'm', 21.3, 28.75, 0, true),
  ('contraloria:2025:289', 'CG-0289', 'PASTEO PARA LÁMINAS DE GYPSUM', 'Materiales: PASTA MULTIUSO
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 6.46, 8.72, 0, true),
  ('contraloria:2025:290', 'CG-0290', 'RESANE (LIJADO) DE PAREDES CON PASTA DE GYPSUM ACABADO LISO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO GYPSERO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ESMERILADORA ANGULAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 1.58, 2.13, 0, true),
  ('contraloria:2025:291', 'CG-0291', 'RESANE (LIJADO) DE PAREDES CON PASTA DE GYPSUM ACABADO MICROCEMENTO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO GYPSERO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ESMERILADORA ANGULAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 1.89, 2.55, 0, true),
  ('contraloria:2025:292', 'CG-0292', 'RESANE (LIJADO) DE PAREDES CON PASTA DE GYPSUM ACABADO TEXTURIZADO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO GYPSERO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ESMERILADORA ANGULAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 2.36, 3.19, 0, true),
  ('contraloria:2025:293', 'CG-0293', 'TOPPING DE PISOS DE ESPESOR 0.05 m', 'Materiales: CEMENTO GRIS TIPO I; PLÁSTICO PARA PROTECCIÓN (POLIETIRENO); ARENA
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 10.46, 14.12, 0, true),
  ('contraloria:2025:294', 'CG-0294', 'NIVELACIÓN DE PISO Y LOSA CON MORTERO AUTONIVELANTE (Capa hasta 10 mm de esp.)', 'Materiales: MORTERO AUTONIVELANTE CEMENTICIO ULTRAPAN ECO-20 (SACO 23 KG)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 21.68, 29.27, 0, true),
  ('contraloria:2025:295', 'CG-0295', 'PISO DE PVC / VINYL DE 18 X 92 CM X 2 MM DE ESPESOR (CON PEGAMENTO)', 'Materiales: PISO DE PVC / VINYL DE 92 X 18 CM X 2 MM DE ESP.; TERMINAL PARA PISO DE VINYL O PVC; PEGAMENTO PARA PISO DE VINYL COLOR BLANCO (LANCO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 16.97, 22.91, 0, true),
  ('contraloria:2025:296', 'CG-0296', 'PISO DE PVC / VINYL DE 92 X 18 CM X 3 MM DE ESPESOR (CON PEGAMENTO)', 'Materiales: PISO DE PVC / VINYL DE 92 X 18 CM X 3 MM DE ESPESOR; TERMINAL PARA PISO DE VINYL O PVC; PEGAMENTO PARA PISO DE VINYL COLOR BLANCO (LANCO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 22.97, 31.01, 0, true),
  ('contraloria:2025:297', 'CG-0297', 'PISO DE PVC / VINYL SPC SISTEMA CLICK DE 122 X 18 CM X 4 MM DE ESPESOR', 'Materiales: PISO DE PVC / VINYL SPC SISTEMA CLICK DE 122 X 18 CM X 4.5 MM DE ESPESOR; SUB-BASE CON AISLANTE ACÚSTICO DE 1 mm - PISO DE VINYL; TERMINAL PARA PISO DE VINYL O PVC
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 30.91, 41.73, 0, true),
  ('contraloria:2025:298', 'CG-0298', 'PISO DE PVC / VINYL SPC SISTEMA CLICK DE 122 X 18 CM X 5 MM DE ESPESOR', 'Materiales: PISO DE PVC / VINYL SPC SISTEMA CLICK DE 122 X 18 CM X 5.0 MM DE ESPESOR; TERMINAL PARA PISO DE VINYL O PVC; SUB-BASE CON AISLANTE ACÚSTICO DE 1 mm - PISO DE VINYL
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 25.22, 34.05, 0, true),
  ('contraloria:2025:299', 'CG-0299', 'BALDOSA (TIPO PORCELANA) DE 40 X 40 cm (piezas hasta B/.14.00 /m2)', 'Materiales: BALDOSA DE PORCELANA 0.4 X 0.4 M (B/.14); LECHADA (saco de 5 kg); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 22.95, 30.98, 0, true),
  ('contraloria:2025:300', 'CG-0300', 'BALDOSA (TIPO PORCELANA) DE 60 X 60 cm (piezas hasta B/.18.00 /m2)', 'Materiales: BALDOSA DE PORCELANA 0.6 X 0.6 (B/.18); LECHADA (saco de 5 kg); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 26.95, 36.38, 0, true),
  ('contraloria:2025:301', 'CG-0301', 'BALDOSA (TIPO PORCELANA) DE 60 X 40 cm (piezas hasta B/.18.00 /m2)', 'Materiales: BALDOSA DE PORCELANA 0.6 X 0.4 (B/.18); LECHADA (saco de 5 kg); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 26.95, 36.38, 0, true),
  ('contraloria:2025:302', 'CG-0302', 'BALDOSAS DE TERRAZO', 'Materiales: LECHADA (saco de 5 kg); BALDOSA DE TERRAZO DE 0.3 m X 0.3 m; PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 43.86, 59.21, 0, true),
  ('contraloria:2025:303', 'CG-0303', 'BALDOSAS DE GRANITO DE 0.3 m X 0.3 m (piezas hasta B/. 30.00 / m2)', 'Materiales: LECHADA (saco de 5 kg); BALDOSAS DE GRANITO DE 0.3 m X 0.3 m (B/.30); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 40.65, 54.88, 0, true),
  ('contraloria:2025:304', 'CG-0304', 'AZULEJOS DE 20 X 30 cm (piezas hasta B/. 11.00 / m2)', 'Materiales: AZULEJOS DE 0.2 X 0.3 M (B/.11); PEGAMENTO PARA BALDOSAS (saco de 50 lbs); LECHADA (saco de 5 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 24.04, 32.45, 0, true),
  ('contraloria:2025:305', 'CG-0305', 'AZULEJOS DE 30 X 60 cm (piezas hasta B/. 15.00 / m2)', 'Materiales: AZULEJOS DE 30 X 60 cm (B/.15); PEGAMENTO PARA BALDOSAS (saco de 50 lbs); LECHADA (saco de 5 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 28.04, 37.85, 0, true),
  ('contraloria:2025:306', 'CG-0306', 'AZULEJO DE 25 X 40 cm (Piezas hasta B/. 11.00 / m2)', 'Materiales: AZULEJOS DE 25 X 40 cm (B/.11); PEGAMENTO PARA BALDOSAS (saco de 50 lbs); LECHADA (saco de 5 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 24.04, 32.45, 0, true),
  ('contraloria:2025:307', 'CG-0307', 'REVESTIMIENTO DE 10 X 20 cm (tipo subway) (piezas hasta B/.18.00 /m2)', 'Materiales: AZULEJO DE PORCELANA 0.1 X 0.2 (TIPO SUBWAY B/.18); PEGAMENTO PARA BALDOSAS (saco de 50 lbs); LECHADA (saco de 5 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 32.16, 43.42, 0, true),
  ('contraloria:2025:308', 'CG-0308', 'REVESTIMIENTO DE GRANITO DE 0.3 m x 0.3 m (piezas hasta B/. 30.00 / m2)', 'Materiales: LECHADA (saco de 5 kg); BALDOSAS DE GRANITO DE 0.3 m X 0.3 m (B/.30); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 45.13, 60.93, 0, true),
  ('contraloria:2025:309', 'CG-0309', 'ZÓCALO DE BALDOSA DE PORCELANATO DE 0.1 m X 0.4 m', 'Materiales: BALDOSA DE PORCELANA 0.4 X 0.4 M (B/.14); LECHADA (saco de 5 kg); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 4.95, 6.68, 0, true),
  ('contraloria:2025:310', 'CG-0310', 'ZÓCALO DE BALDOSA DE TERRAZO DE 0.1 m x 0.3 m', 'Materiales: BALDOSA DE TERRAZO DE 0.3 m X 0.3 m; LECHADA (saco de 5 kg); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 8.57, 11.57, 0, true),
  ('contraloria:2025:311', 'CG-0311', 'ZÓCALO DE BALDOSA DE GRANITO DE 0.1 m X 0.3 m', 'Materiales: BALDOSAS DE GRANITO DE 0.3 m X 0.3 m (B/.30); LECHADA (saco de 5 kg); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 8.96, 12.1, 0, true),
  ('contraloria:2025:312', 'CG-0312', 'CENEFA DE 8 X 25 cm (pieza hasta B/. 2.00 / UND)', 'Materiales: CENEFA DE 8 X 25 CM (B/.2); LECHADA (saco de 5 kg); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 6.14, 8.29, 0, true),
  ('contraloria:2025:313', 'CG-0313', 'CENEFA DE 8.5 X 33 CM (piezas hasta B/. 1.50 / und)', 'Materiales: CENEFA DE 8.5 X 33 cm (B/.1.50); LECHADA (saco de 5 kg); PEGAMENTO PARA BALDOSAS (saco de 50 lbs)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro lineal', 'm', 5.6, 7.56, 0, true),
  ('contraloria:2025:314', 'CG-0314', 'PINTURA BASE DE PAREDES', 'Materiales: JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS; PINTURA BASE; AGUARRAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.39, 4.58, 0, true),
  ('contraloria:2025:315', 'CG-0315', 'PINTURA DE PAREDES CON ACABADO LISO MATE (DOS MANOS)', 'Materiales: JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS; PINTURA DE ACABADO LISO MATE; AGUARRAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.18, 4.29, 0, true),
  ('contraloria:2025:316', 'CG-0316', 'PINTURA DE PAREDES CON ACABADO LISO SATINADO (DOS MANOS)', 'Materiales: AGUARRAS; PINTURA DE ACABADO LISO SATINADO; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.62, 4.89, 0, true),
  ('contraloria:2025:317', 'CG-0317', 'PINTURA DE PAREDES CON ACABADO LISO SEMIBRILLANTE (DOS MANOS)', 'Materiales: AGUARRAS; PINTURA DE ACABADO LISO SEMIBRILLANTE; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.35, 4.52, 0, true),
  ('contraloria:2025:318', 'CG-0318', 'PINTURA DE PAREDES CON ACABADO LISO BRILLANTE (DOS MANOS)', 'Materiales: AGUARRAS; PINTURA DE ACABADO LISO BRILLANTE; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.89, 5.25, 0, true),
  ('contraloria:2025:319', 'CG-0319', 'PINTURA DE PAREDES CON ACABADO LISO ANTIHONGOS (DOS MANOS)', 'Materiales: AGUARRAS; PINTURA DE ACABADO LISO ANTIHONGOS; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.54, 4.78, 0, true),
  ('contraloria:2025:320', 'CG-0320', 'PINTURA DE PAREDES CON ACABADO LISO IMPERMEABILIZANTE', 'Materiales: AGUARRAS; PINTURA DE ACABADO LISO IMPERMEABILIZANTE; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 5.5, 7.42, 0, true),
  ('contraloria:2025:321', 'CG-0321', 'PINTURA LAVABLE DE PAREDES CON ACABADO LISO (DOS MANOS)', 'Materiales: AGUARRAS; PINTURA DE ACABADO LISO MATE; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.07, 4.14, 0, true),
  ('contraloria:2025:322', 'CG-0322', 'PINTURA ANTICORROSIVO A BASE DE AGUA (DOS MANOS)', 'Materiales: PINTURA ANTICORROSIVO A BASE DE AGUA; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.93, 5.31, 0, true),
  ('contraloria:2025:323', 'CG-0323', 'PINTURA ANTICORROSIVO A BASE DE ACEITE (DOS MANOS)', 'Materiales: AGUARRAS; PINTURA ANTICORROSIVO TIPO MINIO ROJO; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 3.84, 5.18, 0, true),
  ('contraloria:2025:324', 'CG-0324', 'PINTURA EPÓXICA PARA PISOS (DOS PASADAS)', 'Materiales: PINTURA EPÓXICA PARA PISO (dos capas); AGUARRAS; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 5.61, 7.57, 0, true),
  ('contraloria:2025:325', 'CG-0325', 'PINTURA EPÓXICA DE GRADO HOSPITALARIO PARA PAREDES', 'Materiales: PINTURA EPÓXICA ANTICORROSIVA PRIMER (EPÓXICO + CATALIZADOR); AGUARRAS; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 15.41, 20.8, 0, true),
  ('contraloria:2025:326', 'CG-0326', 'PINTURA EPÓXICA DE GRADO ALIMENTICIO PARA PAREDES', 'Materiales: PINTURA EPÓXICA ANTICORROSIVA GRADO ALIMENTICIO (EPÓXICO + CATALIZADOR); AGUARRAS; JUEGO DE RODILLO COMPLETO + BANDEJA + BROCHAS
Mano de obra: CALIFICADO PINTOR; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 16.16, 21.82, 0, true),
  ('contraloria:2025:327', 'CG-0327', 'GRAMA FINA NATURAL (Incluye cama de suelo orgánico mezclado de 4 cm)', 'Materiales: GRAMA NATURAL; SUELO ORGÁNICO (SACO DE 70 LB)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Paisajismo', 'Metro cuadrado', 'm²', 10.36, 13.99, 0, true),
  ('contraloria:2025:328', 'CG-0328', 'GRAMA ARTIFICIAL PARA PAISAJISMO (Incluye base de gravilla de 5 cm)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Paisajismo', 'Metro cuadrado', 'm²', 23.05, 31.12, 0, true),
  ('contraloria:2025:329', 'CG-0329', 'GRAMA SINTÉTICA PARA CANCHAS DEPORTIVAS (+ Base de grava y gravilla con pendiente)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Paisajismo', 'Metro cuadrado', 'm²', 42.95, 57.98, 0, true),
  ('contraloria:2025:330', 'CG-0330', 'GOTERO DE LOSA', 'Materiales: ARENA; CEMENTO GRIS TIPO I
Mano de obra: GUINDOLERO (CALIFICADO + 16%); AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 5.98, 8.07, 0, true),
  ('contraloria:2025:331', 'CG-0331', 'REVESTIMIENTO DE PARED CON PAPEL TAPIZ', 'Materiales: ROLLO DE PAPEL TAPIZ DECORATIVO (0.52 M X 10.0 M); PEGAMENTO PARA PAPEL TAPIZ ECO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 26.6, 35.91, 0, true),
  ('contraloria:2025:332', 'CG-0332', 'SUMINISTRO E INSTALACIÓN DE REVESTIMIENTO CON PANEL 3D', 'Materiales: PANEL 3D DE PVC DE 0.50 M X 0.50 M; AGUARRAS; PEGAMENTO CONTACT CEMENT DE SECADO RÁPIDO; PINTURA DE ACABADO LISO SEMIBRILLANTE
Mano de obra: CALIFICADO; AYUDANTE GENERAL; CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPRESOR DE AIRE DE 125 PSI + PISTOLA DE PINTURA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 18.01, 24.31, 0, true),
  ('contraloria:2025:333', 'CG-0333', 'SELLADO DE FISURAS DE LOSA', 'Materiales: CEMENTO BLANCO (bolsa de 45 kg); ADITIVO GOMAFLEX
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; DRILL MEZCLADOR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 16.33, 22.05, 0, true),
  ('contraloria:2025:334', 'CG-0334', 'IMPERMEABILIZACIÓN CON MEMBRANA ASFÁLTICA PARA TECHOS, AZOTEAS Y LOSAS', 'Materiales: IMPERMEABILIZANTE MEMBRANA ASFÁLTICA DE 4 mm; SELLADOR Y ADHESIVO ELÁSTICO DE 300 ml - IMPERMIABILIZACIÓN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; SOPLETE A GAS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 12.52, 16.9, 0, true),
  ('contraloria:2025:335', 'CG-0335', 'IMPERMEABILIZACIÓN CON MEMBRANA LÍQUIDA PARA TECHOS, AZOTEAS Y LOSAS', 'Materiales: SELLADOR Y ADHESIVO ELÁSTICO DE 300 ml - IMPERMIABILIZACIÓN; MEMBRANA DE REFUERZO - IMPERMIABILIZACIÓN; IMPERMEABILIZANTE MEMBRANA LÍQUIDA GRIS (SIKALASTIC)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 23.29, 31.44, 0, true),
  ('contraloria:2025:336', 'CG-0336', 'LOUVERS', 'Materiales: LAMA DE LOUVERS EN FORMA DE ONDA (10 CM X 5.8 M X 1 MM DE ESP.); MARCO REFORZADO PARA MONTAJE DE LUVERS (L=5.85 m/und)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 52.9, 71.41, 0, true),
  ('contraloria:2025:337', 'CG-0337', 'PASAMANO SIMPLE A PARED, DE TUBO DE ACERO INOXIDABLE DE 2" DE DIAMETRO', 'Materiales: TUBO DE ACERO GALVANIZADO DE 5.8 M 2" X 1/8"; TUBO BRILLANTE DE ACERO DE 1" X 6.0 m X 1mm DE ESP. - PASA MANOS; ACERO - PLATINA DE ACERO INOXIDABLE DE 50 MM X 3 MM DE ESP. X 19 PIES DE LONG.; ANCLAJE DE EN PISO O PARED DE ACERO; SOLDADURA 6011 X 1/8"; PINTURA DE ESMALTE ANTICORROSIVO DE ACRÍLICO DUREX LANCO; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro lineal', 'm', 34.33, 46.35, 0, true),
  ('contraloria:2025:338', 'CG-0338', 'PASAMANO DOBLE A PARED, DE TUBO DE ACERO INOXIDABLE DE 2" DE DIAM.', 'Materiales: TUBO DE ACERO GALVANIZADO DE 5.8 M 2" X 1/8"; TUBO BRILLANTE DE ACERO DE 1" X 6.0 m X 1mm DE ESP. - PASA MANOS; ACERO - PLATINA DE ACERO INOXIDABLE DE 50 MM X 3 MM DE ESP. X 19 PIES DE LONG.; ANCLAJE DE EN PISO O PARED DE ACERO; SOLDADURA 6011 X 1/8"; PINTURA DE ESMALTE ANTICORROSIVO DE ACRÍLICO DUREX LANCO; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro lineal', 'm', 41.56, 56.11, 0, true),
  ('contraloria:2025:339', 'CG-0339', 'BARANDA DE ACERO GALVANIZADO H=1.10 m (2 TUB SUP DE 2", INTERMEDIO DE 1 1/2", INFERIOR DE 1") + LIJADO, PINTURA ANTICORROSIVA Y ACABADO FINAL', 'Materiales: TUBO DE ACERO GALVANIZADO DE 5.8 M 2" X 1/8"; AC G 1 1/2 TUBO DE ACERO GALVANIZADO DE 1 1/2" X 5.8 M; TUBO DE ACERO GALVANIZADO CALIBRE 16 DE 5.8 M 1 IN; DISCO DE CORTE DE 14" X 3/32"; DS 4 1/2 DISCO DE DESVASTE DE METAL DE 4 1/2" X 1/4"; DISCO DE LIJA FINA PARA PULIR; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC; PINTURA ANTICORROSIVO TIPO MINIO ROJO; PINTURA DE ESMALTE ANTICORROSIVO DE ACRÍLICO DUREX LANCO; SOLDADURA 6011 X 1/8"; BASE...
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL; CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro lineal', 'm', 99.38, 134.16, 0, true),
  ('contraloria:2025:340', 'CG-0340', 'LIMPIEZA Y DESRAIGUE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); MOTOSIERRA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Hectárea', 'ha', 2735.68, 3693.17, 0, true),
  ('contraloria:2025:341', 'CG-0341', 'DESMONTE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Hectárea', 'ha', 2064.38, 2786.91, 0, true),
  ('contraloria:2025:342', 'CG-0342', 'REMOCIÓN TOTAL DE ÁRBOLES HASTA 0.60 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; OPERADOR DE MONTARGA; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MONTACARGAS; TRACTOR D8 (Incluye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); MOTOSIERRA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Unidad', 'und', 205.17, 276.98, 0, true),
  ('contraloria:2025:343', 'CG-0343', 'TALAR ÁRBOLES', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; OPERADOR DE MONTARGA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MÁQUINA TELEHANDLER; MONTACARGAS; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); MOTOSIERRA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Paisajismo', 'Unidad', 'und', 90.43, 122.08, 0, true),
  ('contraloria:2025:344', 'CG-0344', 'REMOCIÓN DE MAMPOSTERÍA, ZAMPEADO Y SIMILARES', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 53.71, 72.51, 0, true),
  ('contraloria:2025:345', 'CG-0345', 'REMOCIÓN DE PAVIMENTOS DE HORMIGÓN DE CEMENTO PORTLAND DE 0.10 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 8.1, 10.93, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:346', 'CG-0346', 'REMOCIÓN DE PAVIMENTOS DE HORMIGÓN DE CEMENTO PORTLAND DE 0.20 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA CON MARTILLO (Incluye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 14.87, 20.07, 0, true),
  ('contraloria:2025:347', 'CG-0347', 'REMOCIÓN DE PAVIMENTOS DE HORMIGÓN DE CEMENTO PORTLAND 0.25 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA CON MARTILLO (Incluye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 18.19, 24.56, 0, true),
  ('contraloria:2025:348', 'CG-0348', 'REMOCIÓN DE PAVIMENTOS DE HORMIGÓN ASFÁLTICO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MOTONIVELADORA (Incluye Combustible); RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 7.67, 10.35, 0, true),
  ('contraloria:2025:349', 'CG-0349', 'REMOCIÓN DE TUBERÍAS DE 0.45 M @ 0.75 M (INCLUYENDO CABEZALES DE EXISTIR)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible); BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 60.12, 81.16, 0, true),
  ('contraloria:2025:350', 'CG-0350', 'REMOCIÓN DE TUBERÍAS DE 0.90 M @ 1.05 M (INCLUYENDO CABEZALES DE EXISTIR)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible); BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 93.91, 126.78, 0, true),
  ('contraloria:2025:351', 'CG-0351', 'REMOCIÓN DE TUBERÍAS DE 1.20 M (INCLUYENDO CABEZALES DE EXISTIR)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible); BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 104.99, 141.74, 0, true),
  ('contraloria:2025:352', 'CG-0352', 'REMOCIÓN DE TUBERÍAS DE 1.35 M @ 1.80 M (INCLUYENDO CABEZALES DE EXISTIR)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible); BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 157.91, 213.18, 0, true),
  ('contraloria:2025:353', 'CG-0353', 'REMOCIÓN DE TUBERÍA DE AGUA POTABLE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible); BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 18.42, 24.87, 0, true),
  ('contraloria:2025:354', 'CG-0354', 'REMOCIÓN DE POSTES DE KILOMETRAJE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; CHOFER DE VEHÍCULOS LIVIANOS; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Unidad', 'und', 33.92, 45.79, 0, true),
  ('contraloria:2025:355', 'CG-0355', 'REMOCIÓN DE BARRERA DE PROTECCIÓN METÁLICA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible); EQUIPO DE OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 4.42, 5.97, 0, true),
  ('contraloria:2025:356', 'CG-0356', 'REUBICACIÓN DE CERCA DE PÚAS', 'Materiales: ALAMBRE DE PÚAS 200 M; GRAPAS DE ALAMBRE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 5.12, 6.91, 0, true),
  ('contraloria:2025:357', 'CG-0357', 'DEMOLICIÓN Y REMOCIÓN DE ACERAS (INCLUYE RETIRO DE MATERIAL)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 8.1, 10.93, 0, true),
  ('contraloria:2025:358', 'CG-0358', 'DEMOLICIÓN DE CORDÓN SIMPLE (INCLUYE RETIRO DE MATERIAL)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 7.02, 9.48, 0, true),
  ('contraloria:2025:359', 'CG-0359', 'DEMOLICIÓN DE CORDÓN CUNETA (INCLUYE RETIRO DE MATERIAL)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 12.31, 16.62, 0, true),
  ('contraloria:2025:360', 'CG-0360', 'DEMOLICIÓN Y REMOCIÓN DE TRAGANTE (INCLUYE RETIRO DE MATERIAL)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 236.86, 319.76, 0, true),
  ('contraloria:2025:361', 'CG-0361', 'DEMOLICIÓN Y REMOCIÓN DE CUNETA LLANERA 1.80 M DE ANCHO (INCLUYE RETIRO DE MATERIAL)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 22.62, 30.54, 0, true),
  ('contraloria:2025:362', 'CG-0362', 'REMOCIÓN DE MURO DE GAVIONES (INCLUYE RETIRO DE MATERIAL)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 26.21, 35.38, 0, true),
  ('contraloria:2025:363', 'CG-0363', 'TUBERÍA DE HORMIGÓN REFORZADO CLASE III DE 0.45 M', 'Materiales: TUBO DE HORMIGÓN DE 0.45 M DE DIÁMETRO CLASE III; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 95.73, 129.24, 0, true),
  ('contraloria:2025:364', 'CG-0364', 'TUBERÍA DE HORMIGÓN REFORZADO CLASE III DE 0.60 M', 'Materiales: TUBO DE HORMIGÓN DE 0.60 M DE DIÁMETRO CLASE III; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 121.89, 164.55, 0, true),
  ('contraloria:2025:365', 'CG-0365', 'TUBERÍA DE HORMIGÓN REFORZADO CLASE III DE 0.75 M', 'Materiales: TUBO DE HORMIGÓN DE 0.75 M DE DIÁMETRO CLASE III; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 176.37, 238.1, 0, true),
  ('contraloria:2025:366', 'CG-0366', 'TUBERÍA DE HORMIGÓN REFORZADO CLASE III DE 0.90 M', 'Materiales: TUBO DE HORMIGÓN DE 0.90 M DE DIÁMETRO CLASE III; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN PLATAFORMA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 225.92, 304.99, 0, true),
  ('contraloria:2025:367', 'CG-0367', 'TUBERÍA DE HORMIGÓN REFORZADO CLASE III DE 1.05 M', 'Materiales: TUBO DE HORMIGÓN DE 1.05 M DE DIÁMETRO CLASE III; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN PLATAFORMA (Incluye Combustible); ROMPEPECHO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 257.55, 347.69, 0, true),
  ('contraloria:2025:368', 'CG-0368', 'TUBERÍA DE HORMIGÓN REFORZADO CLASE III DE 1.20 M', 'Materiales: TUBO DE HORMIGÓN DE 1.20 M DE DIÁMETRO CLASE III; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN PLATAFORMA (Incluye Combustible); ROMPEPECHO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 356.52, 481.3, 0, true),
  ('contraloria:2025:369', 'CG-0369', 'TUBERÍA DE HORMIGÓN REFORZADO CLASE III DE 1.50 M', 'Materiales: TUBO DE HORMIGÓN DE 1.50 M DE DIÁMETRO CLASE III; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN PLATAFORMA (Incluye Combustible); ROMPEPECHO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 486.02, 656.13, 0, true),
  ('contraloria:2025:370', 'CG-0370', 'TUBERÍA DE HORMIGÓN REFORZADO CLASE III DE 1.80 M', 'Materiales: TUBO DE HORMIGÓN DE 1.82 M DE DIÁMETRO CLASE III; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN PLATAFORMA (Incluye Combustible); ROMPEPECHO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 843.98, 1139.37, 0, true),
  ('contraloria:2025:371', 'CG-0371', 'MATERIAL Y EXCAVACIÓN PARA LECHO TIPO B (INCLUYE ACARREO)', 'Materiales: ARENON (PARA LECHO DE TUBOS)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 45.92, 61.99, 0, true),
  ('contraloria:2025:372', 'CG-0372', 'EXCAVACIÓN COMÚN', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 6.65, 8.98, 0, true),
  ('contraloria:2025:373', 'CG-0373', 'EXCAVACIÓN EN ROCA VOLCÁNICA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); EXCAVADORA CON MARTILLO (Incluye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 19.23, 25.96, 0, true),
  ('contraloria:2025:374', 'CG-0374', 'EXCAVACIÓN NO CLASIFICADA (CORTE)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 6.65, 8.98, 0, true),
  ('contraloria:2025:375', 'CG-0375', 'EXCAVACIÓN NO CLASIFICADA(RELLENO)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO LIVIANO; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMION DE AGUA (Incliuye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROLA 10 TON (Incluye Combustible); TRACTOR D8 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 12.96, 17.5, 0, true),
  ('contraloria:2025:376', 'CG-0376', 'EXCAVACIÓN DE DESPERDICIO NO CLASIFICADA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 7.54, 10.18, 0, true),
  ('contraloria:2025:377', 'CG-0377', 'EXCAVACIÓN DE MATERIAL DESECHABLE NO CLASIFICADA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 9.4, 12.69, 0, true),
  ('contraloria:2025:378', 'CG-0378', 'REMOCIÓN DE DERRUMBES', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 8.97, 12.11, 0, true),
  ('contraloria:2025:379', 'CG-0379', 'LIMPIEZA Y CONFORMACIÓN DE CAUCE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 9.65, 13.03, 0, true),
  ('contraloria:2025:380', 'CG-0380', 'DRAGADO DE CAUCE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 13.44, 18.14, 0, true),
  ('contraloria:2025:381', 'CG-0381', 'CAMBIO DE CAUCE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 15.11, 20.4, 0, true),
  ('contraloria:2025:382', 'CG-0382', 'CUNETAS PAVIMENTADAS EN ¨V¨ DE 45 CM (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL)', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 46.08, 62.21, 0, true),
  ('contraloria:2025:383', 'CG-0383', 'CUNETAS PAVIMENTADAS DE MEDIA CAÑA (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL)', 'Materiales: CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO); CUNETA DE MEDIA CAÑA PREFABRICADA (45 cm x 1.22 M); ARENON (PARA LECHO DE TUBOS)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 34.56, 46.66, 0, true),
  ('contraloria:2025:384', 'CG-0384', 'CUNETAS PAVIMENTADAS DE MEDIA CAÑA CON REVESTIMIENTO DE TALUDES', 'Materiales: CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO); CONCRETO DE 3000 psi; CUNETA DE MEDIA CAÑA PREFABRICADA (45 cm x 1.22 M); ARENON (PARA LECHO DE TUBOS)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 50.59, 68.3, 0, true),
  ('contraloria:2025:385', 'CG-0385', 'CUNETAS TRANSITABLES O LLANERAS (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL) DE 1.70 M', 'Materiales: CONCRETO DE PAVIMENTO CONVENCIONAL 650 PSI 28 DÍAS; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); VIBRADOR PARA CONCRETO; COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 82.9, 111.91, 0, true),
  ('contraloria:2025:386', 'CG-0386', 'CANAL DE HORMIGÓN DE B=0.30 M X H=0.30 M, 1:1, E=0.075 M (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL)', 'Materiales: AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 49.06, 66.23, 0, true),
  ('contraloria:2025:387', 'CG-0387', 'CANAL DE HORMIGÓN DE B=0.30 M X H=0.35 M, 1:1, E=0.075 M (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL)', 'Materiales: AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 50.65, 68.38, 0, true),
  ('contraloria:2025:388', 'CG-0388', 'CANAL DE HORMIGÓN DE B=0.30 M X H=0.40 M, 1:1, E=0.075 M (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL)', 'Materiales: AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 52.27, 70.56, 0, true),
  ('contraloria:2025:389', 'CG-0389', 'CANAL DE HORMIGÓN DE B=0.30 M X H=0.45 M, 1:1, E=0.075 M (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL)', 'Materiales: AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 53.88, 72.74, 0, true),
  ('contraloria:2025:390', 'CG-0390', 'CANAL DE HORMIGÓN DE B=0.40 M X H=0.45 M, 1:1, E=0.075 M (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL)', 'Materiales: AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 55.73, 75.24, 0, true),
  ('contraloria:2025:391', 'CG-0391', 'CANAL DE HORMIGÓN DE B=0.30 M X H=0.30 M, (1:1 - 1:3) ASIMÉTRICA, E=0.075 M', 'Materiales: AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 55.21, 74.53, 0, true),
  ('contraloria:2025:392', 'CG-0392', 'CUNETAS PAVIMENTADAS PARA BANQUETAS 1.50 BASE + 0.30 TALUD, ESPESOR 0.075 M (INCLUYE LA EXCAVACIÓN, CONFORMACIÓN Y RETIRO DE MATERIAL)', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 46.5, 62.77, 0, true),
  ('contraloria:2025:393', 'CG-0393', 'HORMIGÓN SIMPLE (CARRETERA), DE 210 kg/cm2 (3000 psi normal)', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 272.81, 368.29, 0, true),
  ('contraloria:2025:394', 'CG-0394', 'HORMIGÓN SIMPLE (CARRETERA), DE 280 kg/cm2 (4000 psi normal)', 'Materiales: CONCRETO DE 4000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 281.77, 380.39, 0, true),
  ('contraloria:2025:395', 'CG-0395', 'HORMIGÓN REFORZADO (CARRETERA), DE 210 kg/cm2 (3000 psi normal) 1.5 % DE ACERO', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 432.21, 583.48, 0, true),
  ('contraloria:2025:396', 'CG-0396', 'HORMIGÓN REFORZADO (CARRETERA), DE 280 kg/cm2 (4000 psi normal) 1.5% DE ACERO', 'Materiales: CONCRETO DE 4000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 441.17, 595.58, 0, true),
  ('contraloria:2025:397', 'CG-0397', 'HORMIGÓN REFORZADO, PARA CABEZALES (3000 psi normal) 0.45 m', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 322.02, 434.73, 0, true),
  ('contraloria:2025:398', 'CG-0398', 'HORMIGÓN REFORZADO, PARA CABEZALES (3000 psi normal) 0.60 m', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 303.52, 409.75, 0, true),
  ('contraloria:2025:399', 'CG-0399', 'HORMIGÓN REFORZADO, PARA CABEZALES (3000 psi normal) 0.75 m', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 291.53, 393.57, 0, true),
  ('contraloria:2025:400', 'CG-0400', 'HORMIGÓN REFORZADO, PARA CABEZALES (3000 psi normal) 0.90 m', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 285.13, 384.93, 0, true),
  ('contraloria:2025:401', 'CG-0401', 'HORMIGÓN REFORZADO, PARA CABEZALES (3000 psi normal) 1.05 m', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 281.87, 380.52, 0, true),
  ('contraloria:2025:402', 'CG-0402', 'HORMIGÓN REFORZADO, PARA CABEZALES (3000 psi normal) 1.20 m', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 274.29, 370.29, 0, true),
  ('contraloria:2025:403', 'CG-0403', 'HORMIGÓN REFORZADO, PARA CABEZALES (3000 psi normal) 1.50 m', 'Materiales: CONCRETO DE 3000 psi; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; DESENCOFRANTE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 271.03, 365.89, 0, true),
  ('contraloria:2025:404', 'CG-0404', 'ACERO DE REFUERZO', 'Materiales: ACERO DE REFUERZO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Kilogramo', 'kg', 1.26, 1.7, 0, true),
  ('contraloria:2025:405', 'CG-0405', 'ÁREA DE ZAMPEADO CON MORTERO', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGREGADO PETREO - MATACÁN O BOULDER; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO); MALLA EXPANDIDA DE 3/4 IN CALIBRE 16 4X8 PIES; TUBERÍA PVC SCH40 DE 3 IN Y 20 PIES
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); BOMBA DE AGUA; COMPACTADOR TIPO SAPO; MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 50.5, 68.17, 0, true),
  ('contraloria:2025:406', 'CG-0406', 'DIENTE DE LA BASE DE ZAMPEADO CON MORTERO', 'Materiales: AGREGADO PETREO - MATACÁN O BOULDER; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO); MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); MEZCLADORA DE CONCRETO; BOMBA DE AGUA; COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 35.77, 48.29, 0, true),
  ('contraloria:2025:407', 'CG-0407', 'DIENTE LATERAL DE ZAMPEADO CON MORTERO', 'Materiales: AGREGADO PETREO - MATACÁN O BOULDER; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO); MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); MEZCLADORA DE CONCRETO; BOMBA DE AGUA; COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 31.8, 42.93, 0, true),
  ('contraloria:2025:408', 'CG-0408', 'REMATE SUPERIOR DE ZAMPEADO CON MORTERO', 'Materiales: AGREGADO PETREO - MATACÁN O BOULDER; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO); MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); MEZCLADORA DE CONCRETO; BOMBA DE AGUA; COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 31.8, 42.93, 0, true),
  ('contraloria:2025:409', 'CG-0409', 'ÁREA DE ZAMPEADO DE HORMIGÓN ARMADO', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CEMENTO GRIS TIPO I; AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; ARENA (INCLUYE ACARREO); MALLA EXPANDIDA DE 3/4 IN CALIBRE 16 4X8 PIES; TUBERÍA PVC SCH40 DE 3 IN Y 20 PIES
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO; MEZCLADORA DE CONCRETO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 77.4, 104.49, 0, true),
  ('contraloria:2025:410', 'CG-0410', 'DIENTE DE LA BASE DE ZAMPEADO DE HORMIGÓN ARMADO', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CEMENTO GRIS TIPO I; AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO; MEZCLADORA DE CONCRETO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 71.7, 96.79, 0, true),
  ('contraloria:2025:411', 'CG-0411', 'DIENTE LATERAL DE ZAMPEADO DE HORMIGÓN ARMADO', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CEMENTO GRIS TIPO I; AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO; MEZCLADORA DE CONCRETO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 46.2, 62.37, 0, true),
  ('contraloria:2025:412', 'CG-0412', 'REMATE SUPERIOR DE ZAMPEADO DE HORMIGÓN ARMADO', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CEMENTO GRIS TIPO I; AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO; VIBRADOR PARA CONCRETO; MEZCLADORA DE CONCRETO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 46.2, 62.37, 0, true),
  ('contraloria:2025:413', 'CG-0413', 'MATERIAL SELECTO O SUBBASE 0.10 M @ 0.15 M', 'Materiales: AGREGADO PETREO - MATERIAL SELECTO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible); RETROEXCAVADORA (Incluye Combustible); MOTONIVELADORA (Incluye Combustible); ROLA 10 TON (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 34.09, 46.02, 0, true),
  ('contraloria:2025:414', 'CG-0414', 'MATERIAL SELECTO O SUBBASE 0.20 M @ 0.30 M', 'Materiales: AGREGADO PETREO - MATERIAL SELECTO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible); RETROEXCAVADORA (Incluye Combustible); MOTONIVELADORA (Incluye Combustible); ROLA 10 TON (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 36.91, 49.83, 0, true),
  ('contraloria:2025:415', 'CG-0415', 'CAPABASE DE 0.10 M @ 0.15 M', 'Materiales: AGREGADO PETREO - CAPA BASE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible); RETROEXCAVADORA (Incluye Combustible); MOTONIVELADORA (Incluye Combustible); ROLA 10 TON (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 38.43, 51.88, 0, true),
  ('contraloria:2025:416', 'CG-0416', 'CAPABASE DE 0.20 M @ 0.30 M', 'Materiales: AGREGADO PETREO - CAPA BASE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 1RA; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible); RETROEXCAVADORA (Incluye Combustible); MOTONIVELADORA (Incluye Combustible); ROLA 10 TON (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 40.35, 54.47, 0, true),
  ('contraloria:2025:417', 'CG-0417', 'RIEGO DE IMPRIMACIÓN', 'Materiales: ASFÁLTO LIQUIDO RC-250; ARENA (INCLUYE ACARREO)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMION DE AGUA (Incliuye combustible); CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Paisajismo', 'Metro cuadrado', 'm²', 2.3, 3.1, 0, true),
  ('contraloria:2025:418', 'CG-0418', 'HORMIGÓN ASFÁLTICO CALIENTE (2,205 lb)(1000 kg) - ASFÁLTO', 'Materiales: ASFÁLTO LIQUIDO RC-250; ASFÁLTO - MEZCLA ASFÁLTICA CALIENTE (2.4 TON/M3) - PAVIMENTO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; RASTRILLERO; TORNILLERO; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMION DE AGUA (Incliuye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); ROLA 10 TON (Incluye Combustible); ROLA NEUMÁTICA; BARREDORA; PAVIMENTADORA ASFÁLTICA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Tonelada', 'ton', 126.14, 170.29, 0, true),
  ('contraloria:2025:419', 'CG-0419', 'PRIMER SELLO', 'Materiales: ASFÁLTO LIQUIDO RC-250; AGREGADO PETREO DE 3/4 (INCLUYE TRANSPORTE)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; RASTRILLERO; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMION DE AGUA (Incliuye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible); ROLA 10 TON (Incluye Combustible); BARREDORA; ESPACIADORA DE GRAVILLA (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 2.45, 3.31, 0, true),
  ('contraloria:2025:420', 'CG-0420', 'SEGUNDO SELLO', 'Materiales: ASFÁLTO LIQUIDO RC-250; AGREGADO PETREO DE 1/2 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; RASTRILLERO; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMION DE AGUA (Incliuye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible); ROLA 10 TON (Incluye Combustible); BARREDORA; ESPACIADORA DE GRAVILLA (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 2.46, 3.32, 0, true),
  ('contraloria:2025:421', 'CG-0421', 'TERCER SELLO', 'Materiales: ASFÁLTO LIQUIDO RC-250; AGREGADO PETREO DE 1/2 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; RASTRILLERO; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMION DE AGUA (Incliuye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible); ROLA 10 TON (Incluye Combustible); BARREDORA; ESPACIADORA DE GRAVILLA (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 2.74, 3.7, 0, true),
  ('contraloria:2025:422', 'CG-0422', 'SELLO DE REFUERZO', 'Materiales: ASFÁLTO LIQUIDO RC-250; AGREGADO PETREO DE 3/4 (INCLUYE TRANSPORTE)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; RASTRILLERO; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 2DA; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMION DE AGUA (Incliuye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible); ROLA 10 TON (Incluye Combustible); BARREDORA; ESPACIADORA DE GRAVILLA (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 3.31, 4.47, 0, true),
  ('contraloria:2025:423', 'CG-0423', 'CERCA DE ALAMBRE DE PÚAS', 'Materiales: ALAMBRE DE PÚAS 200 M; GRAPAS DE ALAMBRE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 4.14, 5.59, 0, true),
  ('contraloria:2025:424', 'CG-0424', 'DRENAJE SUBTERRÁNEO 4 IN (INCLUYE LA EXCAVACIÓN, GRAVA, GEOTEXTIL, Y RELLENO CON MATERIAL EXISTENTE)', 'Materiales: TUBERÍA PERFORADA DE 4 IN - PLUVIAL; AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; ARENON (PARA LECHO DE TUBOS)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 45.67, 61.65, 0, true),
  ('contraloria:2025:425', 'CG-0425', 'DRENAJE SUBTERRÁNEO 6 IN (INCLUYE LA EXCAVACIÓN, GRAVA, GEOTEXTIL, Y RELLENO CON MATERIAL EXISTENTE)', 'Materiales: TUBERÍA PERFORADA 6 IN - PLUVIAL; AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; ARENON (PARA LECHO DE TUBOS)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 47.72, 64.42, 0, true),
  ('contraloria:2025:426', 'CG-0426', 'CAJA DE REGISTRO DE CONCRETO 1.23 M X 1.23 M - 0.45 M @ 1.50 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Unidad', 'und', 954.04, 1287.95, 0, true),
  ('contraloria:2025:427', 'CG-0427', 'CAJA DE REGISTRO DE CONCRETO 1.23 M X 1.23 - 1.50 M A 3.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Unidad', 'und', 1478.5, 1995.97, 0, true),
  ('contraloria:2025:428', 'CG-0428', 'CAJA DE REGISTRO DE CONCRETO 1.23 M X 1.23 M - 3.00 M A 5.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Unidad', 'und', 2029.07, 2739.24, 0, true),
  ('contraloria:2025:429', 'CG-0429', 'CAJA DE REGISTRO DE BLOQUES LINCOLN 1.23 M X 1.23 M - 0.45 M A 1.50 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Unidad', 'und', 1072.21, 1447.48, 0, true),
  ('contraloria:2025:430', 'CG-0430', 'CAJA DE REGISTRO DE BLOQUES LINCOLN 1.23 M X 1.23 M - 1.50 M A 3.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Unidad', 'und', 1862.53, 2514.42, 0, true),
  ('contraloria:2025:431', 'CG-0431', 'CAJA DE REGISTRO DE BLOQUES LINCOLN 1.23 M X 1.23 M - 3.00 M A 5.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Unidad', 'und', 3557.66, 4802.84, 0, true),
  ('contraloria:2025:432', 'CG-0432', 'CAJA DE REGISTRO DE 2 M X 2 M X 4 M DE CONCRETO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Unidad', 'und', 4022.5, 5430.37, 0, true),
  ('contraloria:2025:433', 'CG-0433', 'CAJA DE REGISTRO PLUVIAL DE 1.23 M X 1.23 M - 0.45 M @ 1.50 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 570.19, 769.76, 0, true),
  ('contraloria:2025:434', 'CG-0434', 'CAJA DE REGISTRO PLUVIAL DE 1.23 M X 1.23 M - 1.50 M @ 3.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 1333.11, 1799.7, 0, true),
  ('contraloria:2025:435', 'CG-0435', 'CAJA DE REGISTRO PLUVIAL DE 1.23 M X 1.23 M - 3.00 M @ 5.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2148.35, 2900.27, 0, true),
  ('contraloria:2025:436', 'CG-0436', 'TRAGANTE TIPO L1 - 0.45 M @ 1.50 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 959.17, 1294.88, 0, true),
  ('contraloria:2025:437', 'CG-0437', 'TRAGANTE TIPO L1 - 1.50 M @ 3.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 1700.74, 2296.0, 0, true),
  ('contraloria:2025:438', 'CG-0438', 'TRAGANTE TIPO L1 - 3.00 M @ 5.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2529.05, 3414.22, 0, true),
  ('contraloria:2025:439', 'CG-0439', 'TRAGANTE TIPO L2 - 0.45 M @ 1.50 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 1399.96, 1889.95, 0, true),
  ('contraloria:2025:440', 'CG-0440', 'TRAGANTE TIPO L2- 1.50 M @ 3.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 1961.35, 2647.82, 0, true),
  ('contraloria:2025:441', 'CG-0441', 'TRAGANTE TIPO L2 - 3.00 M @ 5.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2792.64, 3770.06, 0, true),
  ('contraloria:2025:442', 'CG-0442', 'TRAGANTE TIPO L3 (0.45 M @ 1.50 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 1647.05, 2223.52, 0, true),
  ('contraloria:2025:443', 'CG-0443', 'TRAGANTE TIPO L3(1.50 M @ 3.00 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2210.14, 2983.69, 0, true),
  ('contraloria:2025:444', 'CG-0444', 'TRAGANTE TIPO L3 (3.00 M @ 5.00 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 3042.63, 4107.55, 0, true),
  ('contraloria:2025:445', 'CG-0445', 'TRAGANTE TIPO L4 (0.45 M @ 1.50 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 1893.2, 2555.82, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:446', 'CG-0446', 'TRAGANTE TIPO L4 (1.50 M @ 3.00 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2456.8, 3316.68, 0, true),
  ('contraloria:2025:447', 'CG-0447', 'TRAGANTE TIPO L4 (3.00 M @ 5.00 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 3295.97, 4449.56, 0, true),
  ('contraloria:2025:448', 'CG-0448', 'TRAGANTE TIPO L5 (0.45 M @ 1.50 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2128.51, 2873.49, 0, true),
  ('contraloria:2025:449', 'CG-0449', 'TRAGANTE TIPO L5 (1.50 M @ 3.00 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2692.62, 3635.04, 0, true),
  ('contraloria:2025:450', 'CG-0450', 'TRAGANTE TIPO L5 (3.00 M @ 5.00 M DE PROFUNDIDAD)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 3525.25, 4759.09, 0, true),
  ('contraloria:2025:451', 'CG-0451', 'TRAGANTE TIPO PARRILLA (P-2) - 0.45 M @ 1.50 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 1257.03, 1696.99, 0, true),
  ('contraloria:2025:452', 'CG-0452', 'TRAGANTE TIPO PARRILLA (P-2) - 1.50 M @ 3.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 1996.71, 2695.56, 0, true),
  ('contraloria:2025:453', 'CG-0453', 'TRAGANTE TIPO PARRILLA (P-2) - 3.00 M @ 5.00 M PROFUNDIDAD', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2751.56, 3714.61, 0, true),
  ('contraloria:2025:454', 'CG-0454', 'SUMINISTRO E INSTALACIÓN DE TAPA PARA C.I.', 'Materiales: ARO Y TAPA PESADO ALCANTARILLADO CON BISAGRA Y CIERRE DE SEGURIDAD; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 155.63, 210.1, 0, true),
  ('contraloria:2025:455', 'CG-0455', 'BARRERAS DE VIGUETAS DE LÁMINAS CORRUGADAS DE ACERO', 'Materiales: DEFENSAS METÁLICAS TL3/TL4, TIPO C DE 1.70 M
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 90.0, 121.5, 0, true),
  ('contraloria:2025:456', 'CG-0456', 'CONTROL DE EROSIÓN CON MANTO DE COCO', 'Materiales: MANTO DE COCO 2.29X36.58M
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; CHOFER DE CAMIONES LIVIANOS; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 4.72, 6.37, 0, true),
  ('contraloria:2025:457', 'CG-0457', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.15 M DE ESPESOR (650 lb/in2 a flexión 24 HORAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 24 HR; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 47.52, 64.15, 0, true),
  ('contraloria:2025:458', 'CG-0458', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.15 M DE ESPESOR (650 lb/in2 a flexión 72 HORAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 72 HORAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 36.35, 49.07, 0, true),
  ('contraloria:2025:459', 'CG-0459', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.15 M DE ESPESOR (650 lb/in2 a flexión 7 DÍAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 7 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 44.59, 60.2, 0, true),
  ('contraloria:2025:460', 'CG-0460', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.15 M DE ESPESOR (650 lb/in2 a flexión 28 DÍAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO CONVENCIONAL 650 PSI 28 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 28.85, 38.95, 0, true),
  ('contraloria:2025:461', 'CG-0461', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.20 M DE ESPESOR (650 lb/in2 a flexión 24 HORAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 24 HR; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 61.76, 83.38, 0, true),
  ('contraloria:2025:462', 'CG-0462', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.20 M DE ESPESOR (650 lb/in2 a flexión 72 HORAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 72 HORAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 47.1, 63.58, 0, true),
  ('contraloria:2025:463', 'CG-0463', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.20 M DE ESPESOR (650 lb/in2 a flexión 72 HORAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 7 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 57.91, 78.18, 0, true),
  ('contraloria:2025:464', 'CG-0464', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.20 M DE ESPESOR (650 lb/in2 a flexión 28 DÍAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO CONVENCIONAL 650 PSI 28 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 37.77, 50.99, 0, true),
  ('contraloria:2025:465', 'CG-0465', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.25 M DE ESPESOR (650 lb/in2 a flexión 24 HORAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 24 HR; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 79.1, 106.78, 0, true),
  ('contraloria:2025:466', 'CG-0466', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.25 M DE ESPESOR (650 lb/in2 a flexión 72 HORAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 72 HORAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 60.25, 81.34, 0, true),
  ('contraloria:2025:467', 'CG-0467', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.25 M DE ESPESOR (650 lb/in2 a flexión 7 DÍAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 7 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 74.15, 100.1, 0, true),
  ('contraloria:2025:468', 'CG-0468', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.25 M DE ESPESOR (650 lb/in2 a flexión 28 DÍAS) CON PAVIMENTADORA', 'Materiales: CONCRETO DE PAVIMENTO CONVENCIONAL 650 PSI 28 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PAVIMENTADORA DE PAVIMENTO PORTALD; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 48.25, 65.14, 0, true),
  ('contraloria:2025:469', 'CG-0469', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.15 M DE ESPESOR (650 lb/in2 a flexión 24 HORAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 24 HR; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; CORTADORA DE PAVIMENTO; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 49.29, 66.54, 0, true),
  ('contraloria:2025:470', 'CG-0470', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.15 M DE ESPESOR (650 lb/in2 a flexión 72 HORAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 72 HORAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; CORTADORA DE PAVIMENTO; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 38.12, 51.46, 0, true),
  ('contraloria:2025:471', 'CG-0471', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.15 M DE ESPESOR (650 lb/in2 a flexión 7 DÍAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 7 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; CORTADORA DE PAVIMENTO; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 46.36, 62.59, 0, true),
  ('contraloria:2025:472', 'CG-0472', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.15 M DE ESPESOR (650 lb/in2 a flexión 28 DÍAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO CONVENCIONAL 650 PSI 28 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; CORTADORA DE PAVIMENTO; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 31.01, 41.86, 0, true),
  ('contraloria:2025:473', 'CG-0473', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.20 M DE ESPESOR (650 lb/in2 a flexión 24 HORAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 24 HR; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; CORTADORA DE PAVIMENTO; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 63.57, 85.82, 0, true),
  ('contraloria:2025:474', 'CG-0474', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.20 M DE ESPESOR (650 lb/in2 a flexión 72 HORAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 72 HORAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; CORTADORA DE PAVIMENTO; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 48.91, 66.03, 0, true),
  ('contraloria:2025:475', 'CG-0475', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.20 M DE ESPESOR (650 lb/in2 a flexión 7 DÍAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 7 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; CORTADORA DE PAVIMENTO; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 59.72, 80.62, 0, true),
  ('contraloria:2025:476', 'CG-0476', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.20 M DE ESPESOR (650 lb/in2 a flexión 28 DÍAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO CONVENCIONAL 650 PSI 28 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; CORTADORA DE PAVIMENTO; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 39.58, 53.43, 0, true),
  ('contraloria:2025:477', 'CG-0477', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.25 M DE ESPESOR (650 lb/in2 a flexión 24 HORAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 24 HR; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; REGLA VIBRATORIA; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 80.89, 109.2, 0, true),
  ('contraloria:2025:478', 'CG-0478', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.25 M DE ESPESOR (650 lb/in2 a flexión 72 HORAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 72 HORAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; REGLA VIBRATORIA; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 62.04, 83.75, 0, true),
  ('contraloria:2025:479', 'CG-0479', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.25 M DE ESPESOR (650 lb/in2 a flexión 7 DÍAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO FAST TRACK 650 PSI A 7 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; REGLA VIBRATORIA; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 75.94, 102.52, 0, true),
  ('contraloria:2025:480', 'CG-0480', 'PAVIMENTO DE HORMIGÓN DE CEMENTO PORTLAND, DE 0.25 M DE ESPESOR (650 lb/in2 a flexión 28 DÍAS) ARTESANAL', 'Materiales: CONCRETO DE PAVIMENTO CONVENCIONAL 650 PSI 28 DÍAS; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; REGLA VIBRATORIA; CORTADORA DE PAVIMENTO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 50.04, 67.55, 0, true),
  ('contraloria:2025:481', 'CG-0481', 'LOSA DE ACCESO A PUENTE 0.27 M DE ESPESOR (INCLUYE ACERO Y FORMALETA)', 'Materiales: CONCRETO DE PAVIMENTO CONVENCIONAL 650 PSI 28 DÍAS; MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO DE MOCHILA; REGLA VIBRATORIA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 64.24, 86.72, 0, true),
  ('contraloria:2025:482', 'CG-0482', 'SEÑALES PREVENTIVAS 60 CM x 60 CM', 'Materiales: SEÑALES PREVENTIVAS 60 CM X 60 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 120.0, 162.0, 0, true),
  ('contraloria:2025:483', 'CG-0483', 'SEÑALES PREVENTIVAS 90 CM X 90 CM', 'Materiales: SEÑALE PREVENTIVA 90 CM X 90 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 225.0, 303.75, 0, true),
  ('contraloria:2025:484', 'CG-0484', 'SEÑALES RESTRICTIVAS 60 cm x 60 cm', 'Materiales: SEÑALES RESTRICTIVAS 60 CM X 60 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 120.0, 162.0, 0, true),
  ('contraloria:2025:485', 'CG-0485', 'SEÑALES RESTRICTIVAS 90 CM X 90 CM', 'Materiales: SEÑAL RESTRICTIVA 90 CM X 90 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 225.0, 303.75, 0, true),
  ('contraloria:2025:486', 'CG-0486', 'SEÑALES INFORMATIVAS 60 cm x 60 cm', 'Materiales: SEÑALES INFORMATIVAS 60 CM X 60 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 120.0, 162.0, 0, true),
  ('contraloria:2025:487', 'CG-0487', 'SEÑALES INFORMATIVAS 90 CM X 90 CM', 'Materiales: SEÑALES INFORMATIVAS 90 CM X 90 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 225.0, 303.75, 0, true),
  ('contraloria:2025:488', 'CG-0488', 'FRANJAS REFLECTANTES CONTINUAS BLANCAS 15 CM', 'Materiales: FRANJA REFLECTANTE CONTINUA BLNACA DE 15 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Kilómetro', 'km', 2350.0, 3172.5, 0, true),
  ('contraloria:2025:489', 'CG-0489', 'FRANJA REFLECTANTES CONTINUAS BLANCAS 10 CM', 'Materiales: FRANJA REFLECTANTE CONTINUA BLANCA DE 10 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Kilómetro', 'km', 1765.0, 2382.75, 0, true),
  ('contraloria:2025:490', 'CG-0490', 'FRANJAS REFLECTANTES CONTINUAS AMARILLAS 15 CM', 'Materiales: FRANJA REFLECTANTE CONTINUA AMARILLA DE 15 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Kilómetro', 'km', 2350.0, 3172.5, 0, true),
  ('contraloria:2025:491', 'CG-0491', 'FRANJAS REFLECTANTES CONTINUAS AMARILLAS 10 CM', 'Materiales: FRANJAS REFLECTANTES CONTINUAS AMARILLAS 10 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Kilómetro', 'km', 1765.0, 2382.75, 0, true),
  ('contraloria:2025:492', 'CG-0492', 'FRANJAS REFLECTANTES SEGMENTADAS BLANCAS 15 CM', 'Materiales: FRANJAS REFLECTANTES SEGMENTADAS BLANCAS 15 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Kilómetro', 'km', 2200.0, 2970.0, 0, true),
  ('contraloria:2025:493', 'CG-0493', 'FRANJAS REFLECTANTES SEGMENTADAS BLANCAS 10 CM', 'Materiales: FRANJAS REFLECTANTES SEGMENTADAS BLANCAS 10 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Kilómetro', 'km', 1600.0, 2160.0, 0, true),
  ('contraloria:2025:494', 'CG-0494', 'FRANJAS REFLECTANTES SEGMENTADAS AMARILLAS 15 CM', 'Materiales: FRANJAS REFLECTANTES SEGMENTADAS AMARILLA 15 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Kilómetro', 'km', 2200.0, 2970.0, 0, true),
  ('contraloria:2025:495', 'CG-0495', 'FRANJAS REFLECTANTES SEGMENTADAS AMARILLA 10 CM', 'Materiales: FRANJAS REFLECTANTES SEGMENTADASAMARILLA 10 CM
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Kilómetro', 'km', 16007.0, 21609.45, 0, true),
  ('contraloria:2025:496', 'CG-0496', 'FRANJAS REFLECTANTES BLANCAS PARA CRUCE PEATONAL', 'Materiales: FRANJAS REFLECTANTES BLANCAS PARA CRUCE PEATONAL
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 35.0, 47.25, 0, true),
  ('contraloria:2025:497', 'CG-0497', 'LETRAS REFLECTANTES BLANCAS 2.40 M ALTO', 'Materiales: LETRAS REFLECTANTES BLANCAS 2.40 M ALTO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Unidad', 'und', 50.0, 67.5, 0, true),
  ('contraloria:2025:498', 'CG-0498', 'LETRAS REFLECTANTES BLANCAS 5.00 M ALTO', 'Materiales: LETRAS REFLECTANTES BLANCAS 5.00 M ALTO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Unidad', 'und', 100.0, 135.0, 0, true),
  ('contraloria:2025:499', 'CG-0499', 'FLECHAS REFLECTANTES BLANCAS', 'Materiales: FLECHAS REFLECTANTES BLANCAS
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 40.0, 54.0, 0, true),
  ('contraloria:2025:500', 'CG-0500', 'PINTURA AMARILLA PARA ISLETA', 'Materiales: PINTURA AMARILLA PARA ISLETA
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 35.0, 47.25, 0, true),
  ('contraloria:2025:501', 'CG-0501', 'FRANJA REFLECTANTE DE ALTO BLANCA, DE 0.30 M DE ANCHO', 'Materiales: FRANJA REFLECTANTE DE ALTO BLANCA, DE 0.30 M DE ANCHO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 20.0, 27.0, 0, true),
  ('contraloria:2025:502', 'CG-0502', 'MARCADORES REFLEXIVOS TIPO TACHUELA O BOTONES (OJOS DE GATO)', 'Materiales: MARCADORES REFLEXIVOS TIPO TACHUELA O BOTONES (OJOS DE GATO)
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 2.8, 3.78, 0, true),
  ('contraloria:2025:503', 'CG-0503', 'REMOCIÓN DE PINTURA TERMOPLÁSTICA', 'Materiales: REMOCIÓN DE PINTURA TERMOPLÁSTICA
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Kilómetro', 'km', 750.0, 1012.5, 0, true),
  ('contraloria:2025:504', 'CG-0504', 'SIMBOLOS DE CICLOVÍA', 'Materiales: SIMBOLOS DE CICLOVÍA
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 150.0, 202.5, 0, true),
  ('contraloria:2025:505', 'CG-0505', 'BOYAS PLÁSTICAS DE 40 CM DE ANCHO', 'Materiales: BOYAS PLÁSTICAS DE 40 CM DE ANCHO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 35.0, 47.25, 0, true),
  ('contraloria:2025:506', 'CG-0506', 'BOYAS PLÁSTICAS DE 20 CM DE ANCHO', 'Materiales: BOYAS PLÁSTICAS DE 20 CM DE ANCHO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 18.4, 24.84, 0, true),
  ('contraloria:2025:507', 'CG-0507', 'CERCA DE MALLA DE ALAMBRE (0.50 M BLOQUEO + 5 PIES MALLA + .46 CM SERPERTINA)', 'Materiales: ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 88.84, 119.93, 0, true),
  ('contraloria:2025:508', 'CG-0508', 'CERCA DE MALLA DE ALAMBRE (0.50 M BLOQUEO + 6 PIES MALLA + .46 CM SERPERTINA)', 'Materiales: ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 91.1, 122.98, 0, true),
  ('contraloria:2025:509', 'CG-0509', 'CERCA DE MALLA DE ALAMBRE (0.50 M BLOQUEO + 8 PIES MALLA + .46 CM SERPERTINA)', 'Materiales: ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 96.08, 129.71, 0, true),
  ('contraloria:2025:510', 'CG-0510', 'CORDÓN HORMIGÓN TIPO A', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CONCRETO DE 3000 psi; SELLADOR ASFÁLTICO; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: AYUDANTE GENERAL; BANDERILLERO; CALIFICADO; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN PLATAFORMA (Incluye Combustible); VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 21.86, 29.51, 0, true),
  ('contraloria:2025:511', 'CG-0511', 'CORDÓN TIPO B SOBRE PAVIMENTO EXISTENTE', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CONCRETO DE 3000 psi; SELLADOR ASFÁLTICO; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: AYUDANTE GENERAL; BANDERILLERO; CALIFICADO; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN PLATAFORMA (Incluye Combustible); VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 14.86, 20.06, 0, true),
  ('contraloria:2025:512', 'CG-0512', 'CORDÓN-CUNETA DE HORMIGÓN DE 45 CM - CARRETERAS', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CONCRETO DE 3000 psi; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; SELLADOR ASFÁLTICO
Mano de obra: AYUDANTE GENERAL; BANDERILLERO; CALIFICADO; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN PLATAFORMA (Incluye Combustible); VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 38.22, 51.6, 0, true),
  ('contraloria:2025:513', 'CG-0513', 'CORDÓN-CUNETA DE HORMIGÓN DE 60 CM - CARRETERAS', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CONCRETO DE 3000 psi; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; SELLADOR ASFÁLTICO
Mano de obra: AYUDANTE GENERAL; BANDERILLERO; CALIFICADO; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN PLATAFORMA (Incluye Combustible); VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 44.56, 60.16, 0, true),
  ('contraloria:2025:514', 'CG-0514', 'CORDÓN-CUNETA DE HORMIGÓN DE 75 CM - CARRETERAS', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CONCRETO DE 3000 psi; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt; SELLADOR ASFÁLTICO
Mano de obra: AYUDANTE GENERAL; BANDERILLERO; CALIFICADO; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN PLATAFORMA (Incluye Combustible); VIBRADOR PARA CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 56.88, 76.79, 0, true),
  ('contraloria:2025:515', 'CG-0515', 'CORDÓN DE HORMIGÓN - CARRETERAS', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 28.88, 38.99, 0, true),
  ('contraloria:2025:516', 'CG-0516', 'CORDÓN-CUNETA DE HORMIGÓN DE 45 CM - CARRETERAS', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 50.53, 68.22, 0, true),
  ('contraloria:2025:517', 'CG-0517', 'CORDÓN-CUNETA DE HORMIGÓN DE 60 CM - CARRETERAS', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 56.87, 76.77, 0, true),
  ('contraloria:2025:518', 'CG-0518', 'ESCARIFICACIÓN Y CONFORMACIÓN DE CALZADA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MOTONIVELADORA (Incluye Combustible); ROLA 10 TON (Incluye Combustible); RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 2.56, 3.46, 0, true),
  ('contraloria:2025:519', 'CG-0519', 'CONFORMACIÓN DE CALZADA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MOTONIVELADORA (Incluye Combustible); ROLA 10 TON (Incluye Combustible); RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 1.18, 1.59, 0, true),
  ('contraloria:2025:520', 'CG-0520', 'CONFORMACIÓN DE CUNETAS O ZANJAS DE DRENAJES TRAPEZOIDALES', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible); TANQUE DE AGUA MÁS BOMBA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 1.5, 2.02, 0, true),
  ('contraloria:2025:521', 'CG-0521', 'PERFILAR CUNETAS A MANO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 4.17, 5.63, 0, true),
  ('contraloria:2025:522', 'CG-0522', 'GEOTEXTIL PARA SEPARACIÓN', 'Materiales: GEOTEXTIL SEPARADOR NO TEJIDO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; CHOFER DE CAMIONES LIVIANOS; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: RETROEXCAVADORA (Incluye Combustible); CAMIÓN PLATAFORMA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 3.12, 4.21, 0, true),
  ('contraloria:2025:523', 'CG-0523', 'GAVIONES GALVANIZADOS DOBLE TORSIÓN', 'Materiales: CAJA DE GAVIÓN DE 2X1X1 M DE MALLA DE TORSIÓN GALVANIZADO, 1 DIAFRAGMA Y ALAMBRE DE AMARRE; AGREGADO PETREO - PIEDRA DE GAVIÓN (INCLUYE TRANSPORTE)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 127.94, 172.72, 0, true),
  ('contraloria:2025:524', 'CG-0524', 'GAVIONES GALVANIZADOS TIPO COLCHÓN (BASE)', 'Materiales: CAJÓN DE GAVIÓN GALVANIZADO TIPO COLCHÓN DE 4MX2MX0.23M, 3 DIAFRAGMAS Y SU ALAMBRE DE AMARRE; MADERA - 1X4X10'', PINOTEA (tres usos); AGREGADO PETREO - PIEDRA DE GAVIÓN (INCLUYE TRANSPORTE)
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 190.1, 256.63, 0, true),
  ('contraloria:2025:525', 'CG-0525', 'PEDRAPLÉN DE PIEDRA, COLOCADO CON CABRIA', 'Materiales: AGREGADO PETREO - MATACÁN O BOULDER
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: ROLA 10 TON (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); TRACTOR D8 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cúbico', 'm³', 43.33, 58.5, 0, true),
  ('contraloria:2025:526', 'CG-0526', 'RESTAURACIÓN DE CALZADA ASFÁLTICA TIPO ¨A¨ (INCLUYE IMPRIMACIÓN Y SELLO SIMPLE)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 7.31, 9.87, 0, true),
  ('contraloria:2025:527', 'CG-0527', 'RESTAURACIÓN DE CALZADA ASFÁLTICA TIPO ¨B¨ (INCLUYE CAPABASE A COLOCAR, IMPRIMACIÓN Y SELLO SIMPLE)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 15.0, 20.25, 0, true),
  ('contraloria:2025:528', 'CG-0528', 'RESTAURACIÓN DE CALZADA ASFÁLTICA TIPO ¨C¨ (INCLUYE SELECTO Y CAPABASE A COLOCAR, IMPRIMACIÓN Y SELLO SIMPLE)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 21.82, 29.46, 0, true),
  ('contraloria:2025:529', 'CG-0529', 'RESTAURACIÓN DE CALZADA ASFÁLTICA TIPO ¨A¨ (INCLUYE IMPRIMACIÓN Y SELLO DOBLE)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 9.77, 13.19, 0, true),
  ('contraloria:2025:530', 'CG-0530', 'RESTAURACIÓN DE CALZADA ASFÁLTICA TIPO ¨B¨ (INCLUYE CAPABASE A COLOCAR, IMPRIMACIÓN Y SELLO DOBLE)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 17.46, 23.57, 0, true),
  ('contraloria:2025:531', 'CG-0531', 'RESTAURACIÓN DE CALZADA ASFÁLTICA TIPO ¨C¨ (INCLUYE SELECTO Y CAPABASE A COLOCAR, IMPRIMACIÓN Y SELLO DOBLE)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 24.28, 32.78, 0, true),
  ('contraloria:2025:532', 'CG-0532', 'LIMPIEZA DE TUBOS DE 0.30 M A 0.90 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 18.55, 25.04, 0, true),
  ('contraloria:2025:533', 'CG-0533', 'LIMPIEZA DE TUBOS DE 1.05 M A 1.50 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro lineal', 'm', 30.91, 41.73, 0, true),
  ('contraloria:2025:534', 'CG-0534', 'LIMPIEZA DE ALCANTARILLA DE CAJÓN', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 46.37, 62.6, 0, true),
  ('contraloria:2025:535', 'CG-0535', 'LIMPIEZA DE CORNDÓN CUNETA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 1.56, 2.11, 0, true),
  ('contraloria:2025:536', 'CG-0536', 'LIMPIEZA DE TRAGANTE', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 56.89, 76.8, 0, true),
  ('contraloria:2025:537', 'CG-0537', 'LIMPIEZA DE CUNETAS PAVIMENTADAS BASE 0.30 M H:0.45', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 6.01, 8.11, 0, true),
  ('contraloria:2025:538', 'CG-0538', 'PARCHEO PROFUNDO CON MEZCLA ASFÁLTICA CALIENTE', 'Materiales: ASFÁLTO - MEZCLA ASFÁLTICA CALIENTE (2.4 TON/M3) - PAVIMENTO; ASFÁLTO LIQUIDO RC-250; ASFALTO REBAJADO MC-250; AGREGADO PETREO - CAPA BASE
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); CAMION DE AGUA (Incliuye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible); CORTADORA DE PAVIMENTO; COMPACTADOR TIPO SAPO; ROMPEPECHO; COMPRESOR DE AIRE; TAMPER (COMPACTADORA)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 67.91, 91.68, 0, true),
  ('contraloria:2025:539', 'CG-0539', 'PARCHEO SUPERFICIAL CON MEZCLA ASFÁLTICA CALIENTE', 'Materiales: ASFÁLTO - MEZCLA ASFÁLTICA CALIENTE (2.4 TON/M3) - PAVIMENTO; ASFÁLTO LIQUIDO RC-250; ASFALTO REBAJADO MC-250
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS; CHOFER DE VEHÍCULOS LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); CAMION DE AGUA (Incliuye combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMIÓN PLATAFORMA (Incluye Combustible); CORTADORA DE PAVIMENTO; ROMPEPECHO; COMPRESOR DE AIRE; TAMPER (COMPACTADORA)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 58.59, 79.1, 0, true),
  ('contraloria:2025:540', 'CG-0540', 'PERFILADO DE CARPETA ASFÁLTICADE 5 CM DE ESPESOR', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible); RETROEXCAVADORA (Incluye Combustible); PERFILADORA DE PAVIMENTO (Incluye combustible); BARREDORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 1.66, 2.24, 0, true),
  ('contraloria:2025:541', 'CG-0541', 'PERFILADO DE CARPETA ASFÁLTICADE 10 CM DE ESPESOR', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible); RETROEXCAVADORA (Incluye Combustible); PERFILADORA DE PAVIMENTO (Incluye combustible); BARREDORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 3.32, 4.48, 0, true),
  ('contraloria:2025:542', 'CG-0542', 'PERFILADO DE CARPETA ASFÁLTICADE 15 CM DE ESPESOR', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); CAMION DE AGUA (Incliuye combustible); RETROEXCAVADORA (Incluye Combustible); PERFILADORA DE PAVIMENTO (Incluye combustible); BARREDORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 4.13, 5.58, 0, true),
  ('contraloria:2025:543', 'CG-0543', 'SELLO DE GRIETAS', 'Materiales: ASFÁLTO - MEZCLA ASFÁLTICA CALIENTE (2.4 TON/M3) - PAVIMENTO; ASFÁLTO LIQUIDO RC-250
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; AYUDANTE GENERAL; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN DISTRIBUIDOR DE ACEITE (Incluye combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Metro lineal', 'm', 2.97, 4.01, 0, true),
  ('contraloria:2025:544', 'CG-0544', 'ACERAS SIN REFUERZO - CARRETERAS', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CONCRETO DE 3000 psi; AGREGADO PETREO - CAPA BASE
Mano de obra: AYUDANTE GENERAL; BANDERILLERO; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 31.69, 42.78, 0, true),
  ('contraloria:2025:545', 'CG-0545', 'RECONSTRUCCIÓN DE ACERAS - CARRETERAS', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 39.79, 53.72, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:546', 'CG-0546', 'ACERA REFORZADA - CARRETERAS', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; CONCRETO DE 3000 psi; AGREGADO PETREO - CAPA BASE
Mano de obra: AYUDANTE GENERAL; BANDERILLERO; CALIFICADO; OPERADOR DE EQUIPO PESADO DE 2DA; CHOFER DE CAMIONES PESADOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); COMPACTADOR TIPO SAPO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 38.54, 52.03, 0, true),
  ('contraloria:2025:547', 'CG-0547', 'TUBERÍA PVC SDR-17 DE 2 1/2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 2 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 13.71, 18.51, 0, true),
  ('contraloria:2025:548', 'CG-0548', 'TUBERÍA PVC SDR-17 DE 3 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 3 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 19.3, 26.05, 0, true),
  ('contraloria:2025:549', 'CG-0549', 'TUBERÍA PVC SDR-17 DE 4 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 4 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 26.66, 35.99, 0, true),
  ('contraloria:2025:550', 'CG-0550', 'TUBERÍA PVC SDR-17 DE 6 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 6 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 32.47, 43.83, 0, true),
  ('contraloria:2025:551', 'CG-0551', 'TUBERÍA PVC SDR-17 DE 8 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 8 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 38.75, 52.31, 0, true),
  ('contraloria:2025:552', 'CG-0552', 'TUBERÍA PVC SDR-17 DE 10 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 10 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 88.86, 119.96, 0, true),
  ('contraloria:2025:553', 'CG-0553', 'TUBERÍA PVC SDR-17 DE 12 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 12 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 134.52, 181.6, 0, true),
  ('contraloria:2025:554', 'CG-0554', 'TUBERÍA PVC SDR-17 DE 16 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 15 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 148.49, 200.46, 0, true),
  ('contraloria:2025:555', 'CG-0555', 'TUBERÍA PVC SDR-17 DE 6 IN CORRUGADA - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 6 IN Y 20 PIES CORRUGADA; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 25.78, 34.8, 0, true),
  ('contraloria:2025:556', 'CG-0556', 'TUBERÍA PVC SDR-17 DE 8 IN CORRUGADA - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 8 IN Y 20 PIES CORRUGADA; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 33.12, 44.71, 0, true),
  ('contraloria:2025:557', 'CG-0557', 'TUBERÍA PVC SDR-17 DE 10 IN CORRUGADA - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 10 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 45.46, 61.37, 0, true),
  ('contraloria:2025:558', 'CG-0558', 'TUBERÍA PVC SDR-17 DE 12 IN CORRUGADA - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 12 IN Y 20 PIES CORRUGADA; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 48.43, 65.38, 0, true),
  ('contraloria:2025:559', 'CG-0559', 'TUBERÍA PVC SDR-17 DE 15 IN CORRUGADA - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 15 IN Y 20 PIES CORRUGADA; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 69.55, 93.89, 0, true),
  ('contraloria:2025:560', 'CG-0560', 'TUBERÍA PVC SDR-17 DE 18 IN CORRUGADA - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 18 IN Y 20 PIES CORRUGADA; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 79.2, 106.92, 0, true),
  ('contraloria:2025:561', 'CG-0561', 'TUBERÍA PVC SDR-17 DE 24 IN CORRUGADA - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-17 DE 24 IN Y 20 PIES CORRUGADA; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 127.67, 172.35, 0, true),
  ('contraloria:2025:562', 'CG-0562', 'TUBERÍA PVC SDR-21 DE 2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 2 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 13.21, 17.83, 0, true),
  ('contraloria:2025:563', 'CG-0563', 'TUBERÍA PVC SDR-21 DE 2 1/2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 2 1/2 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 14.31, 19.32, 0, true),
  ('contraloria:2025:564', 'CG-0564', 'TUBERÍA PVC SDR-21 DE 3 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 3 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 18.09, 24.42, 0, true),
  ('contraloria:2025:565', 'CG-0565', 'TUBERÍA PVC SDR-21 DE 4 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 4 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 25.24, 34.07, 0, true),
  ('contraloria:2025:566', 'CG-0566', 'TUBERÍA PVC SDR-21 DE 6 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 6 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 36.95, 49.88, 0, true),
  ('contraloria:2025:567', 'CG-0567', 'TUBERÍA PVC SDR-21 DE 8 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 8 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 51.62, 69.69, 0, true),
  ('contraloria:2025:568', 'CG-0568', 'TUBERÍA PVC SDR-21 DE 10 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 10 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 85.7, 115.69, 0, true),
  ('contraloria:2025:569', 'CG-0569', 'TUBERÍA PVC SDR-21 DE 12 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 12 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 99.18, 133.89, 0, true),
  ('contraloria:2025:570', 'CG-0570', 'TUBERÍA PVC SDR-21 DE 16 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-21 DE 16 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 153.04, 206.6, 0, true),
  ('contraloria:2025:571', 'CG-0571', 'TUBERÍA PVC SDR-26 DE 2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 2 IN 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 12.1, 16.33, 0, true),
  ('contraloria:2025:572', 'CG-0572', 'TUBERÍA PVC SDR-26 DE 2 1/2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 2 1/2 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 12.63, 17.05, 0, true),
  ('contraloria:2025:573', 'CG-0573', 'TUBERÍA PVC SDR-26 DE 3 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 3 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 15.42, 20.82, 0, true),
  ('contraloria:2025:574', 'CG-0574', 'TUBERÍA PVC SDR-26 DE 4 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 4 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 24.07, 32.49, 0, true),
  ('contraloria:2025:575', 'CG-0575', 'TUBERÍA PVC SDR-26 DE 6 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 6 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 28.85, 38.95, 0, true),
  ('contraloria:2025:576', 'CG-0576', 'TUBERÍA PVC SDR-26 DE 8 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 8 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 40.18, 54.24, 0, true),
  ('contraloria:2025:577', 'CG-0577', 'TUBERÍA PVC SDR-26 DE 10 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 10 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 55.66, 75.14, 0, true),
  ('contraloria:2025:578', 'CG-0578', 'TUBERÍA PVC SDR-26 DE 12 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 12 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 73.86, 99.71, 0, true),
  ('contraloria:2025:579', 'CG-0579', 'TUBERÍA PVC SDR-26 DE 16 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-26 DE 16 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 115.54, 155.98, 0, true),
  ('contraloria:2025:580', 'CG-0580', 'TUBERÍA PVC SDR-32.5 DE 2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: ARENA (INCLUYE ACARREO); TUBERÍA PVC SDR-32.5 DE 2 IN 20 PIES; AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 12.11, 16.35, 0, true),
  ('contraloria:2025:581', 'CG-0581', 'TUBERÍA PVC SDR-32.5 DE 2 1/2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-32.5 DE 2 1/2 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 12.98, 17.52, 0, true),
  ('contraloria:2025:582', 'CG-0582', 'TUBERÍA PVC SDR-32.5 DE 3 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-32.5 DE 3 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 15.43, 20.83, 0, true),
  ('contraloria:2025:583', 'CG-0583', 'TUBERÍA PVC SDR-32.5 DE 4 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-32.5 DE 4 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 21.32, 28.78, 0, true),
  ('contraloria:2025:584', 'CG-0584', 'TUBERÍA PVC SDR-32.5 DE 6 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-32.5 DE 6 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 29.13, 39.33, 0, true),
  ('contraloria:2025:585', 'CG-0585', 'TUBERÍA PVC SDR-32.5 DE 8 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-32.5 DE 8 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 41.57, 56.12, 0, true),
  ('contraloria:2025:586', 'CG-0586', 'TUBERÍA PVC SDR-32.5 DE 10 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-32.5 DE 10 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 59.55, 80.39, 0, true),
  ('contraloria:2025:587', 'CG-0587', 'TUBERÍA PVC SDR-32.5 DE 12 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-32.5 DE 12 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 77.17, 104.18, 0, true),
  ('contraloria:2025:588', 'CG-0588', 'TUBERÍA PVC SDR-32.5 DE 16 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-32.5 DE 16 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 118.08, 159.41, 0, true),
  ('contraloria:2025:589', 'CG-0589', 'TUBERÍA PVC SDR-41 DE 2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 2 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 11.89, 16.05, 0, true),
  ('contraloria:2025:590', 'CG-0590', 'TUBERÍA PVC SDR-41 DE 2 1/2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 2 1/2 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 12.3, 16.61, 0, true),
  ('contraloria:2025:591', 'CG-0591', 'TUBERÍA PVC SDR-41 DE 3 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 3 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 15.54, 20.98, 0, true),
  ('contraloria:2025:592', 'CG-0592', 'TUBERÍA PVC SDR-41 DE 4 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 4 IN DE 20PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 21.66, 29.24, 0, true),
  ('contraloria:2025:593', 'CG-0593', 'TUBERÍA PVC SDR-41 DE 6 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 6 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 29.05, 39.22, 0, true),
  ('contraloria:2025:594', 'CG-0594', 'TUBERÍA PVC SDR-41 DE 8 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 8 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 33.32, 44.98, 0, true),
  ('contraloria:2025:595', 'CG-0595', 'TUBERÍA PVC SDR-41 DE 10 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 10 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 45.0, 60.75, 0, true),
  ('contraloria:2025:596', 'CG-0596', 'TUBERÍA PVC SDR-41 DE 12 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 12 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 58.11, 78.45, 0, true),
  ('contraloria:2025:597', 'CG-0597', 'TUBERÍA PVC SDR-41 DE 15 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-41 DE 15 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); ROMPEPECHO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 80.48, 108.65, 0, true),
  ('contraloria:2025:598', 'CG-0598', 'TUBERÍA PVC SDR-64 DE 3 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-64 DE 3 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 15.54, 20.98, 0, true),
  ('contraloria:2025:599', 'CG-0599', 'TUBERÍA PVC SDR-64 DE 4 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-64 DE 4 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 18.91, 25.53, 0, true),
  ('contraloria:2025:600', 'CG-0600', 'TUBERÍA PVC SDR-64 DE 6 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-64 DE 6 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 24.36, 32.89, 0, true),
  ('contraloria:2025:601', 'CG-0601', 'TUBERÍA PVC SCH-40 DE 2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SCH-40 DE 2 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 13.47, 18.18, 0, true),
  ('contraloria:2025:602', 'CG-0602', 'TUBERÍA PVC SCH-40 DE 2 1/2 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SCH-40 DE 2 1/2 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 14.04, 18.95, 0, true),
  ('contraloria:2025:603', 'CG-0603', 'TUBERÍA PVC SCH-40 DE 3 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SCH-40 DE 3 IN DE 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 19.5, 26.32, 0, true),
  ('contraloria:2025:604', 'CG-0604', 'TUBERÍA PVC SCH-40 DE 4 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SCH-40 DE 4 IN DE 20PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 26.31, 35.52, 0, true),
  ('contraloria:2025:605', 'CG-0605', 'TUBERÍA PVC SCH-40 DE 6 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SDR-40 DE 6 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 36.11, 48.75, 0, true),
  ('contraloria:2025:606', 'CG-0606', 'TUBERÍA PVC SCH-40 DE 8 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA PVC SCH-40 DE 8 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 39.45, 53.26, 0, true),
  ('contraloria:2025:607', 'CG-0607', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 76.2 (3 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 76.2 (3 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 54.13, 73.08, 0, true),
  ('contraloria:2025:608', 'CG-0608', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 100 (4 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 100 (4 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 61.2, 82.62, 0, true),
  ('contraloria:2025:609', 'CG-0609', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 150 (6 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 150 (6 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 85.74, 115.75, 0, true),
  ('contraloria:2025:610', 'CG-0610', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 200 (8 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 200 (8 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 106.79, 144.17, 0, true),
  ('contraloria:2025:611', 'CG-0611', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 250 (10 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 250 (10 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 136.64, 184.46, 0, true),
  ('contraloria:2025:612', 'CG-0612', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 300 (12 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 300 (12 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 156.04, 210.65, 0, true),
  ('contraloria:2025:613', 'CG-0613', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 350 (14 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 350 (14 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 175.78, 237.3, 0, true),
  ('contraloria:2025:614', 'CG-0614', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 400 (16 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 400 (16 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 293.43, 396.13, 0, true),
  ('contraloria:2025:615', 'CG-0615', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 450 (18 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 450 (18 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 324.48, 438.05, 0, true),
  ('contraloria:2025:616', 'CG-0616', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 500 (20 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 500 (20 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 413.22, 557.85, 0, true),
  ('contraloria:2025:617', 'CG-0617', 'SUMINISTRO E INSTALACIÓN DE TUBERÍA DE HIERRO DUCTIL DN 600 (24 IN) AWWA CL350', 'Materiales: TUBERÍA DE HIERRO DUCTIL DN 600 (24 IN); ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 559.38, 755.16, 0, true),
  ('contraloria:2025:618', 'CG-0618', 'TUBERÍA CORRUGADA R35 DE 18 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA CORRUGADA R35 DE 18 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 88.44, 119.39, 0, true),
  ('contraloria:2025:619', 'CG-0619', 'TUBERÍA CORRUGADA R35 DE 24 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA CORRUGADA R35 DE 24 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 134.2, 181.17, 0, true),
  ('contraloria:2025:620', 'CG-0620', 'TUBERÍA CORRUGADA R35 DE 30 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA CORRUGADA R35 DE 30 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 200.5, 270.67, 0, true),
  ('contraloria:2025:621', 'CG-0621', 'TUBERÍA CORRUGADA R35 DE 36 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA CORRUGADA R35 DE 36 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 261.72, 353.32, 0, true),
  ('contraloria:2025:622', 'CG-0622', 'TUBERÍA CORRUGADA R35 DE 42 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO; TUBERÍA CORRUGADA R35 DE 42 IN Y 20 PIES
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 1RA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 374.02, 504.93, 0, true),
  ('contraloria:2025:623', 'CG-0623', 'TUBERÍA CORRUGADA R46 DE 4 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA CORRUGADA R46 DE 4 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 19.91, 26.88, 0, true),
  ('contraloria:2025:624', 'CG-0624', 'TUBERÍA CORRUGADA R46 DE 6 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA CORRUGADA R46 DE 6 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 23.79, 32.12, 0, true),
  ('contraloria:2025:625', 'CG-0625', 'TUBERÍA CORRUGADA R46 DE 8 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA CORRUGADA R46 DE 8 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 2DA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA (Incluye Combustible); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 29.57, 39.92, 0, true),
  ('contraloria:2025:626', 'CG-0626', 'TUBERÍA CORRUGADA R46 DE 10 IN - INSTALACIÓN CON EQUIPOS', 'Materiales: TUBERÍA CORRUGADA R46 DE 10 IN Y 20 PIES; ARENA (INCLUYE ACARREO); AGREGADO PETREO - GRAVA #4 INCLUYE ACARREO; GRASA PARA TUBOS DE ACUEDUCTO Y ALCANTARILLADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); TUBERO DE 2DA; AYUDANTE GENERAL; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EXCAVADORA DE 17 TON CON BALDE (INCLUYE COMBUSTIBLE); COMPACTADOR TIPO SAPO; BOMBA DE DIAFRAGMA DE AGUA; BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 39.95, 53.93, 0, true),
  ('contraloria:2025:627', 'CG-0627', 'ENTIBADO DE MADERA PARA ZANJAS', 'Materiales: MADERA - PLYWOOD 4 PIES X 8 PIES X 3/4 IN; MADERA - PINOTEA 2 IN X 6 IN X 12 PIES; CLAVOS DE ALAMBRE DE 3"; ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: CAPATAZ (SALARIO MAS ALTO + 14%); CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 16.09, 21.72, 0, true),
  ('contraloria:2025:628', 'CG-0628', 'VÁLVULAS DE CONTROL DE 4 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE CONTROL 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1848.58, 2495.58, 0, true),
  ('contraloria:2025:629', 'CG-0629', 'VÁLVULAS DE CONTROL DE 6 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE CONTROL 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2031.56, 2742.61, 0, true),
  ('contraloria:2025:630', 'CG-0630', 'VÁLVULAS DE CONTROL DE 10 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE CONTROL 10 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 3207.97, 4330.76, 0, true),
  ('contraloria:2025:631', 'CG-0631', 'VÁLVULAS DE CONTROL DE 12 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE CONTROL 12 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 3356.71, 4531.56, 0, true),
  ('contraloria:2025:632', 'CG-0632', 'VÁLVULAS DE COMPUERTA DE 2 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE COMPUERTA 2 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 823.1, 1111.18, 0, true),
  ('contraloria:2025:633', 'CG-0633', 'VÁLVULAS DE COMPUERTA DE 3 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE COMPUERTA 3 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 979.86, 1322.81, 0, true),
  ('contraloria:2025:634', 'CG-0634', 'VÁLVULAS DE COMPUERTA DE 4 IN (ACUEDUCTO RURAL)', 'Materiales: VALVULA DE COMPUERTA 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1018.43, 1374.88, 0, true),
  ('contraloria:2025:635', 'CG-0635', 'VÁLVULAS DE COMPUERTA DE 6 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE COMPUERTA 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1437.76, 1940.98, 0, true),
  ('contraloria:2025:636', 'CG-0636', 'VÁLVULAS DE COMPUERTA DE 8 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE COMPUERTA 8 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2023.95, 2732.33, 0, true),
  ('contraloria:2025:637', 'CG-0637', 'VÁLVULAS DE COMPUERTA DE 10 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE COMPUERTA 10 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2915.02, 3935.28, 0, true),
  ('contraloria:2025:638', 'CG-0638', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 2 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 2 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 677.35, 914.42, 0, true),
  ('contraloria:2025:639', 'CG-0639', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 3 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 3 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 658.1, 888.43, 0, true),
  ('contraloria:2025:640', 'CG-0640', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 4 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 661.57, 893.12, 0, true),
  ('contraloria:2025:641', 'CG-0641', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 6 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 728.27, 983.16, 0, true),
  ('contraloria:2025:642', 'CG-0642', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 8 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 8 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 999.24, 1348.97, 0, true),
  ('contraloria:2025:643', 'CG-0643', 'VÁLVULAS DE RETENCIÓN 4 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE RETENCIÓN 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 588.31, 794.22, 0, true),
  ('contraloria:2025:644', 'CG-0644', 'VÁLVULAS DE RETENCIÓN 6 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE RETENCIÓN 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1369.91, 1849.38, 0, true),
  ('contraloria:2025:645', 'CG-0645', 'VÁLVULAS DE RETENCIÓN 8 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE RETENCIÓN 8 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1833.48, 2475.2, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:646', 'CG-0646', 'VÁLVULAS DE RETENCIÓN 10 IN (ACUEDUCTO RURAL)', 'Materiales: VÁLVULA DE RETENCIÓN 10 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2647.97, 3574.76, 0, true),
  ('contraloria:2025:647', 'CG-0647', 'VÁLVULAS DE CONTROL DE 4 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE CONTROL 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2565.45, 3463.36, 0, true),
  ('contraloria:2025:648', 'CG-0648', 'VÁLVULAS DE CONTROL DE 6 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE CONTROL 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2748.43, 3710.38, 0, true),
  ('contraloria:2025:649', 'CG-0649', 'VÁLVULAS DE CONTROL DE 8 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE CONTROL 8 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2880.47, 3888.63, 0, true),
  ('contraloria:2025:650', 'CG-0650', 'VÁLVULAS DE CONTROL DE 10 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE CONTROL 10 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 4027.3, 5436.85, 0, true),
  ('contraloria:2025:651', 'CG-0651', 'VÁLVULAS DE CONTROL DE 12 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE CONTROL 12 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 4176.04, 5637.65, 0, true),
  ('contraloria:2025:652', 'CG-0652', 'VÁLVULAS DE COMPUERTA DE 2 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE COMPUERTA 2 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1539.97, 2078.96, 0, true),
  ('contraloria:2025:653', 'CG-0653', 'VÁLVULAS DE COMPUERTA DE 3 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE COMPUERTA 3 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1682.97, 2272.01, 0, true),
  ('contraloria:2025:654', 'CG-0654', 'VÁLVULAS DE COMPUERTA DE 4 IN (ACUEDUCTO URBANO)', 'Materiales: VALVULA DE COMPUERTA 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1720.78, 2323.05, 0, true),
  ('contraloria:2025:655', 'CG-0655', 'VÁLVULAS DE COMPUERTA DE 6 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE COMPUERTA 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2131.89, 2878.05, 0, true),
  ('contraloria:2025:656', 'CG-0656', 'VÁLVULAS DE COMPUERTA DE 8 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE COMPUERTA 8 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2706.67, 3654.0, 0, true),
  ('contraloria:2025:657', 'CG-0657', 'VÁLVULAS DE COMPUERTA DE 10 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE COMPUERTA 10 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 3734.35, 5041.37, 0, true),
  ('contraloria:2025:658', 'CG-0658', 'VÁLVULAS DE COMPUERTA DE 12 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE COMPUERTA 12 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 4320.88, 5833.19, 0, true),
  ('contraloria:2025:659', 'CG-0659', 'VÁLVULAS DE COMPUERTA DE 16 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE COMPUERTA 16 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 8727.64, 11782.31, 0, true),
  ('contraloria:2025:660', 'CG-0660', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 2 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 2 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1394.22, 1882.2, 0, true),
  ('contraloria:2025:661', 'CG-0661', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 3 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 3 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1374.97, 1856.21, 0, true),
  ('contraloria:2025:662', 'CG-0662', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 4 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1378.44, 1860.89, 0, true),
  ('contraloria:2025:663', 'CG-0663', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 6 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1445.14, 1950.94, 0, true),
  ('contraloria:2025:664', 'CG-0664', 'VÁLVULAS DE EXPULSIÓN DE AIRE DE 8 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE EXPULSIÓN DE AIRE 8 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1716.11, 2316.75, 0, true),
  ('contraloria:2025:665', 'CG-0665', 'VÁLVULAS DE MARIPOSA 4 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2555.93, 3450.51, 0, true),
  ('contraloria:2025:666', 'CG-0666', 'VÁLVULAS DE MARIPOSA 6 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1110.56, 1499.26, 0, true),
  ('contraloria:2025:667', 'CG-0667', 'VÁLVULAS DE MARIPOSA 8 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 8 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1947.2, 2628.72, 0, true),
  ('contraloria:2025:668', 'CG-0668', 'VÁLVULAS DE MARIPOSA 10 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 10 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2279.1, 3076.78, 0, true),
  ('contraloria:2025:669', 'CG-0669', 'VÁLVULAS DE MARIPOSA 12 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 12 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 4004.58, 5406.18, 0, true),
  ('contraloria:2025:670', 'CG-0670', 'VÁLVULAS DE MARIPOSA 16 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 16 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 6423.34, 8671.51, 0, true),
  ('contraloria:2025:671', 'CG-0671', 'VÁLVULAS DE MARIPOSA 18 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 18 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 6423.34, 8671.51, 0, true),
  ('contraloria:2025:672', 'CG-0672', 'VÁLVULAS DE MARIPOSA 20 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 20 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 6527.1, 8811.58, 0, true),
  ('contraloria:2025:673', 'CG-0673', 'VÁLVULAS DE MARIPOSA 24 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE MARIPOSA 24 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 7054.36, 9523.39, 0, true),
  ('contraloria:2025:674', 'CG-0674', 'VÁLVULAS DE RETENCIÓN 4 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE RETENCIÓN 4 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1305.18, 1761.99, 0, true),
  ('contraloria:2025:675', 'CG-0675', 'VÁLVULAS DE RETENCIÓN 6 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE RETENCIÓN 6 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2086.78, 2817.15, 0, true),
  ('contraloria:2025:676', 'CG-0676', 'VÁLVULAS DE RETENCIÓN 8 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE RETENCIÓN 8 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 2550.35, 3442.97, 0, true),
  ('contraloria:2025:677', 'CG-0677', 'VÁLVULAS DE RETENCIÓN 10 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE RETENCIÓN 10 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 3467.3, 4680.85, 0, true),
  ('contraloria:2025:678', 'CG-0678', 'VÁLVULAS DE RETENCIÓN 12 IN (ACUEDUCTO URBANO)', 'Materiales: VÁLVULA DE RETENCIÓN 12 IN
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 3917.32, 5288.38, 0, true),
  ('contraloria:2025:679', 'CG-0679', 'HIDRANTE 4 IN', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 4087.99, 5518.79, 0, true),
  ('contraloria:2025:680', 'CG-0680', 'HIDRANTE 6 IN', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 3969.84, 5359.28, 0, true),
  ('contraloria:2025:681', 'CG-0681', 'JABONERA', 'Materiales: JABONERA DE CERAMICA; CEMENTO BLANCO (bolsa de 45 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 17.82, 24.06, 0, true),
  ('contraloria:2025:682', 'CG-0682', 'TOALLERO DE ALUMINIO CROMADO 24 IN', 'Materiales: TOALLERO DE ALUMINIO CROMADO DE 24 IN; CEMENTO BLANCO (bolsa de 45 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 56.75, 76.61, 0, true),
  ('contraloria:2025:683', 'CG-0683', 'PAPELERA EMPOTRADA', 'Materiales: PORTA PAPEL CROMADA; CEMENTO BLANCO (bolsa de 45 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 16.81, 22.69, 0, true),
  ('contraloria:2025:684', 'CG-0684', 'TUBO PARA CORTINA DE BAÑO EMPOTRADO', 'Materiales: BARRA PARA CORTINA DE BAÑO; AGREGADO PETREO - CAPA BASE; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Unidad', 'und', 35.04, 47.3, 0, true),
  ('contraloria:2025:685', 'CG-0685', 'GABINETE PLÁSTICO CON ESPEJO PARA BAÑO', 'Materiales: GABINETE PARA BAÑO CON ESPEJO; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 39.66, 53.54, 0, true),
  ('contraloria:2025:686', 'CG-0686', 'BOTIQUÍN DE ACERO INOXIDABLE CON ESPEJO PARA BAÑO', 'Materiales: GABINETE DE ACERO INOXIDABLE CON ESPEJO PARA BAÑO; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 73.66, 99.44, 0, true),
  ('contraloria:2025:687', 'CG-0687', 'ESPEJO 70 CM X 50 CM CON BISELADO', 'Materiales: ESPEJO 70 CM X50 CM CON BISELADO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 27.3, 36.85, 0, true),
  ('contraloria:2025:688', 'CG-0688', 'DISPENSADOR PLÁSTICO PARA JABÓN LIQUIDO 450 ml', 'Materiales: DISPENSADOR PLÁSTICO DE JABÓN LIQUIDO 450 ml; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 21.68, 29.27, 0, true),
  ('contraloria:2025:689', 'CG-0689', 'DISPENSADOR PARA JABÓN DE ACERO INOXIDABLE 850 ml', 'Materiales: DISPENSADOR DE JABÓN LIQUIDO EN ACERO INOXIDABLE 850 ml; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 32.1, 43.34, 0, true),
  ('contraloria:2025:690', 'CG-0690', 'DISPENSADOR DE PAPEL ROLLO DE 260X130 MM EN ACERO INOXIDABLE REDONDO', 'Materiales: DISPENSADOR DE PAPEL ROLLO DE 260X130 MM EN ACERO INOXIDABLE; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 43.72, 59.02, 0, true),
  ('contraloria:2025:691', 'CG-0691', 'DISPENSADOR DE PAPEL ROLLO DE 310X130 MM EN ACERO INOXIDABLE REDONDO', 'Materiales: DISPENSADOR DE PAPEL ROLLO DE 310X130 MM EN ACERO INOXIDABLE; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 59.78, 80.7, 0, true),
  ('contraloria:2025:692', 'CG-0692', 'DISPENSADOR DE PLÁSTICO CON PALANCA PARA PAPEL TOALLA', 'Materiales: DISPENSADOR DE PLÁSTICO CON PALANCA INTEGRA PARA PAPEL TOALLA; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 43.65, 58.93, 0, true),
  ('contraloria:2025:693', 'CG-0693', 'SECADOR PARA MANOS DE AIRE CALIENTE AUTOMÁTICO EN ACERO INOXIDABLE', 'Materiales: SECADOR PARA MANOS DE AIRE CALIENTE AUTOMÁTICO EN ACERO INOXIDABLE; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 171.48, 231.5, 0, true),
  ('contraloria:2025:694', 'CG-0694', 'BARRA DE ACERO INOXIDABLE 36 IN PARA PERSONAS CON DISCAPACIDAD', 'Materiales: BARRA DE SEGURIDAD DE ACERO INOXIDABLE 36 IN; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 47.23, 63.76, 0, true),
  ('contraloria:2025:695', 'CG-0695', 'BARRA DE ACERO INOXIDABLE 32 IN PARA PERSONAS CON DISCAPACIDAD', 'Materiales: BARRA DE SEGURIDAD DE ACERO INOXIDABLE 32 IN; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 43.38, 58.56, 0, true),
  ('contraloria:2025:696', 'CG-0696', 'BARRA DE ACERO INOXIDABLE 24 IN PARA PERSONAS CON DISCAPACIDAD', 'Materiales: BARRA DE SEGURIDAD DE ACERO INOXIDABLE 16 IN; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 50.67, 68.4, 0, true),
  ('contraloria:2025:697', 'CG-0697', 'ESPEJO 5 MM MENOS DE 2.5 M2', 'Materiales: ESPEJO FIJO ESPESOR 5MM; CINTA DOBLE PEGA; SELLADOR ASFÁLTICO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 41.75, 56.36, 0, true),
  ('contraloria:2025:698', 'CG-0698', 'ESPEJO 5 MM MAS DE 2.5 M2', 'Materiales: ESPEJO FIJO ESPESOR 5MM; ANCLAJE PLÁSTICO 1 1/4" PARA ESPEJOS; ARANDELA PLÁSTICA; TORNILLO PARA ESPEJO FIJO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 34.45, 46.51, 0, true),
  ('contraloria:2025:699', 'CG-0699', 'TINA SENCILLA DE CONCRETO CON DESAGUE DE HIERRO COLADO Y ACCESORIOS COMPLETOS', 'Materiales: TINA DE CONCRETO SENCILLA 49 CM X 49 CM CON DESAGUE DE HIERRO COLADO; TRAMPA SIMPLE PVC 1 1/4" - SANITARIO; PEGAMENTO PVC 8 ONZAS; TUBERÍA PVC SDR-41 DE 2 IN DE 20 PIES; LLAVE DE MANGUERA PARA TINA; BLOQUE DE CEMENTO DE 4"; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO); AGREGADO PETREO - PIEDRA #4, COSTO POR m3
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Unidad', 'und', 55.55, 74.99, 0, true),
  ('contraloria:2025:700', 'CG-0700', 'TINA DOBLE DE CONCRETO CON DESAGUE DE HIERRO COLADO Y ACCESORIOS COMPLETOS', 'Materiales: TINA DE CONCRETO DOBLE 1.00 M X 0.50 M CON DESAGUE DE HIERRO COLADO; DESAGUE DOBLE PVC 1 1/2" X 16"; PEGAMENTO PVC 8 ONZAS; TUBERÍA PVC SDR-41 DE 2 IN DE 20 PIES; LLAVE DE MANGUERA PARA TINA; BLOQUE DE CEMENTO DE 4"; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO); AGREGADO PETREO - PIEDRA #4, COSTO POR m3
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Unidad', 'und', 63.06, 85.13, 0, true),
  ('contraloria:2025:701', 'CG-0701', 'REGADERA DE BAÑO CON BRAZO CROMADA LLAVES DE 1/2 IN Y REJILLA DE DESAGUE', 'Materiales: CEMENTO BLANCO (bolsa de 45 kg); REGADERA CON BRAZO CROMADA DOBLE DE 1/2 IN (INCLUYE LLAVES); PARRILLA PARA DESAGUE DE BAÑO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 92.32, 124.63, 0, true),
  ('contraloria:2025:702', 'CG-0702', 'INODORO SENCILLO Y ACCESORIOS COMPLETOS', 'Materiales: INODORO SENCILLO 2 PIEZAS CON FERRETERIA COMPLETA; TUBO DE ABASTO DE ACERO INOXIDABLE; FLANGE PARA INODORO; DE CERA ARO DE CERA PARA INODORO; CEMENTO BLANCO (bolsa de 45 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 140.05, 189.07, 0, true),
  ('contraloria:2025:703', 'CG-0703', 'LAVAMANOS PEDESTAL', 'Materiales: LAVAMANOS PEDESTAL; ANCLAJE DE EN PISO O PARED DE ACERO; LLAVE DOBLE PARA LAVAMANOS 4 IN; TUBO DE ABASTO DE ACERO INOXIDABLE; TRAMPA SIMPLE PVC 1 1/4" - SANITARIO; DESAGUE PARA LAVAMANOS CROMADO 1 1/4" X 6"; EXTENSIÓN PVC PARA LAVAMANOS 1-1/4" x 4"; PEGAMENTO PVC 8 ONZAS; SILICON; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 88.26, 119.15, 0, true),
  ('contraloria:2025:704', 'CG-0704', 'LAVAMANOS EMPROTADO EN PARED', 'Materiales: LAVAMANOS EMPOTRABLE EN PARED; ANCLAJE DE EN PISO O PARED DE ACERO; LLAVE DOBLE PARA LAVAMANOS 4 IN; TUBO DE ABASTO DE ACERO INOXIDABLE; TRAMPA SIMPLE PVC 1 1/4" - SANITARIO; DESAGUE PARA LAVAMANOS CROMADO 1 1/4" X 6"; EXTENSIÓN PVC PARA LAVAMANOS 1-1/4" x 4"; PEGAMENTO PVC 8 ONZAS; SILICON; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 109.56, 147.91, 0, true),
  ('contraloria:2025:705', 'CG-0705', 'INODORO AHORRADOR DE AGUA (Incluye Ferretería Completa)', 'Materiales: INODORO 2 PIEZAS AHORRADOR DE AGUA MAS ACCESORIOS COMPLETOS; TUBO DE ABASTO DE ACERO INOXIDABLE; FLANGE PARA INODORO; DE CERA ARO DE CERA PARA INODORO; CEMENTO BLANCO (bolsa de 45 kg)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 184.74, 249.4, 0, true),
  ('contraloria:2025:706', 'CG-0706', 'INODOROS CON FLUXÓMETROS', 'Materiales: INODORO DE FLUXÓMETRO; FLUXOMETRO PARA INODORO 1.5 gal; FLANGE PARA INODORO; DE CERA ARO DE CERA PARA INODORO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 344.72, 465.37, 0, true),
  ('contraloria:2025:707', 'CG-0707', 'URINAL CON FLUXÓMETRO', 'Materiales: URINAL CON FLUXÓMETRO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 270.89, 365.7, 0, true),
  ('contraloria:2025:708', 'CG-0708', 'FREGADERO DE ACERO INOXIDABLE DOBLE INCLUYE FERRETERÍA', 'Materiales: FREGADOR DOBLE DE ACERO INOXIDABLE 33"x22"x6"; LLAVE DE FREGADOR CROMADA 8 IN; TRAMPA SIMPLE PVC 1 1/4" - SANITARIO; TUBO DE ABASTO DE ACERO INOXIDABLE; DESAGUE DOBLE PVC 1 1/2" X 16"; CANASTA DE DESAGUE PARA FREGADOR; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 126.15, 170.3, 0, true),
  ('contraloria:2025:709', 'CG-0709', 'FREGADERO DE ACERO INOXIDABLE SENCILLO INCLUYE FERRETERÍA', 'Materiales: FREGADOR DE ACERO INOXIDABLE SENCILLO 19"x19"x6"; LLAVE DE FREGADOR CROMADA 8 IN; TRAMPA SIMPLE PVC 1 1/4" - SANITARIO; TUBO DE ABASTO DE ACERO INOXIDABLE; CANASTA DE DESAGUE PARA FREGADOR; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 101.65, 137.23, 0, true),
  ('contraloria:2025:710', 'CG-0710', 'FUENTE DE AGUA DE PARED 30 L/HR', 'Materiales: FUENTE DE AGUA DE PARED DE 15 L/HR
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Unidad', 'und', 912.35, 1231.67, 0, true),
  ('contraloria:2025:711', 'CG-0711', 'TUBERÍA POTABLE PVC DE 1/2 IN (EN MAMPOSTERÍA, CONCRETO O BAJO TIERRA) - INSTALACIÓN MANUAL', 'Materiales: TUBERÍA DE PRESIÓN 1/2 IN 20 PIES - SDR 13.5; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 4.99, 6.74, 0, true),
  ('contraloria:2025:712', 'CG-0712', 'TUBERÍA POTABLE PVC DE 3/4 IN (EN MAMPOSTERÍA, CONCRETO O BAJO TIERRA) - INSTALACIÓN MANUAL', 'Materiales: TUBERÍA PVC DE 3/4 IN DE 20 PIES - SDR21; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.27, 7.11, 0, true),
  ('contraloria:2025:713', 'CG-0713', 'TUBERÍA POTABLE PVC DE 1 IN (EN MAMPOSTERÍA, CONCRETO O BAJO TIERRA) - INSTALACIÓN MANUAL', 'Materiales: TUBERÍA PVC 1 IN DE 20 PIES - SDR26 AGUA POTABLE; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.45, 7.36, 0, true),
  ('contraloria:2025:714', 'CG-0714', 'TUBERÍA POTABLE PVC DE 1 1/4 IN (EN MAMPOSTERÍA, CONCRETO O BAJO TIERRA) - INSTALACIÓN MANUAL', 'Materiales: TUBERÍA PVC PARA AGUA 1-1/4"X20'' SDR 26; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.74, 7.75, 0, true),
  ('contraloria:2025:715', 'CG-0715', 'TUBERÍA POTABLE PVC DE 1 1/2 IN (EN MAMPOSTERÍA, CONCRETO O BAJO TIERRA) - INSTALACIÓN MANUAL', 'Materiales: 1/2 TUBERÍA PVC 1 1/2 IN DE 20 PIES - SDR26; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.53, 7.47, 0, true),
  ('contraloria:2025:716', 'CG-0716', 'TUBERÍA POTABLE PVC DE 1 IN (SUSPENDIDAS) - INSTALACIÓN MANUAL', 'Materiales: TUBERÍA PVC 1 IN DE 20 PIES - SDR26 AGUA POTABLE; PEGAMENTO PVC 8 ONZAS; COLGADOR DE TUBERIA TIPO PERA 1 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.01, 6.76, 0, true),
  ('contraloria:2025:717', 'CG-0717', 'TUBERÍA POTABLE PVC DE 1 1/4 IN (SUSPENDIDAS) - INSTALACIÓN MANUAL', 'Materiales: TUBERÍA PVC PARA AGUA 1-1/4"X20'' SDR 26; PEGAMENTO PVC 8 ONZAS; COLGADOR DE TUBERIA TIPO PERA 1 1/4 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.66, 7.64, 0, true),
  ('contraloria:2025:718', 'CG-0718', 'TUBERÍA POTABLE PVC DE 1 1/2 IN (SUSPENDIDAS) - INSTALACIÓN MANUAL', 'Materiales: 1/2 TUBERÍA PVC 1 1/2 IN DE 20 PIES - SDR26; PEGAMENTO PVC 8 ONZAS; COLGADOR DE TUBERÍA TIPO PERA 1 1/2 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.37, 7.25, 0, true),
  ('contraloria:2025:719', 'CG-0719', 'SALIDA DE AGUA POTABLE', 'Materiales: TUBERÍA DE PRESIÓN 1/2 IN 20 PIES - SDR 13.5; TEE PVC DE 3/4 IN X 1/2 IN POTABLE; CODO PVC 1/2 IN 90º SDR26; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 23.57, 31.82, 0, true),
  ('contraloria:2025:720', 'CG-0720', 'CONEXIÓN DOMICILIARÍA SIMPLE', 'Materiales: TUBERÍA DE PRESIÓN 1/2 IN 20 PIES - SDR 13.5; ADAPTADOR HEMBRA PVC 1/2 IN; ADAPTADOR MACHO PVC 1/2 IN; COLLARIN PVC 4 IN X 1/2 IN; LLAVE DE PASO BOLA NPT DE 1/2 IN; CONJUNTO ROCETA CRUZ DE BRONCE DE 1/2 IN; CAJA DE MEDIDOR DE HIERRO DUCTIL; NIPLE DE BRONCE DE 1/2 IN X 2 IN; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 149.89, 202.35, 0, true),
  ('contraloria:2025:721', 'CG-0721', 'CONEXIÓN DOMICILIARÍA DOBLE', 'Materiales: TUBERÍA DE PRESIÓN 1/2 IN 20 PIES - SDR 13.5; COLLARIN PVC 4 IN X 3/4 IN; TEE PVC DE 3/4 IN X 1/2 IN POTABLE; ADAPTADOR MACHO PVC 3/4 IN; CODO PVC 1/2 IN 90º SDR26; TUBERÍA PVC DE 3/4 IN DE 20 PIES - SDR21; REDUCCIÓN DE PVC DE 3/4 IN X 1/2 IN CAL 40; LLAVE DE PASO BOLA NPT DE 1/2 IN; CONJUNTO ROCETA CRUZ DE BRONCE DE 1/2 IN; CAJA DE MEDIDOR DE HIERRO DUCTIL; NIPLE DE BRONCE DE 1/2 IN X 2 IN; ADAPTADOR HEMBRA PVC 1/2 IN; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 261.41, 352.9, 0, true),
  ('contraloria:2025:722', 'CG-0722', 'TUBERÍA SANITARIA PVC DE 1 IN - (BAJO TIERRA) INSTALACIÓN MANUAL', 'Materiales: TUBERÍA DE PVC DE 1" X 20'' SCH 40 USO SANITARIO; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 6.26, 8.45, 0, true),
  ('contraloria:2025:723', 'CG-0723', 'TUBERÍA SANITARIA PVC DE 1 1/2 IN - (BAJO TIERRA) INSTALACIÓN MANUAL', 'Materiales: TUBERÍA DE PVC DE 1 1/2" X 20'' SCH 40 USO SANITARIO; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 7.25, 9.79, 0, true),
  ('contraloria:2025:724', 'CG-0724', 'TUBERÍA SANITARIA PVC DE 2 IN - (BAJO TIERRA) INSTALACIÓN MANUAL', 'Materiales: TUBERÍA PVC SDR-41 DE 2 IN DE 20 PIES; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.94, 8.02, 0, true),
  ('contraloria:2025:725', 'CG-0725', 'TUBERÍA SANITARIA PVC DE 3 IN - (BAJO TIERRA) INSTALACIÓN MANUAL', 'Materiales: TUBERÍA PVC SDR-41 DE 3 IN DE 20 PIES; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 10.37, 14.0, 0, true),
  ('contraloria:2025:726', 'CG-0726', 'TUBERÍA SANITARIA PVC DE 4 IN - (BAJO TIERRA) INSTALACIÓN MANUAL', 'Materiales: TUBERÍA PVC SDR-41 DE 4 IN DE 20PIES; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 14.59, 19.7, 0, true),
  ('contraloria:2025:727', 'CG-0727', 'TUBERÍA SANITARIA PVC DE 6 IN - (BAJO TIERRA) INSTALACIÓN MANUAL', 'Materiales: TUBERIA DE PVC DE 6" X 20'' SDR 41 SANITARIA; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 25.35, 34.22, 0, true),
  ('contraloria:2025:728', 'CG-0728', 'REGISTRO SANITARIO PVC DE 4 IN', 'Materiales: REGISTRO SANITARIO DE 4 IN; YEE PVC DE 4 IN - SANITARIA; CODO PVC DE 4 IN Y 45 GRADOS SANITARIA; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 36.36, 49.09, 0, true),
  ('contraloria:2025:729', 'CG-0729', 'REGISTRO SANITARIO PVC DE 6 IN', 'Materiales: REGISTRO SANITARIO DE 4 IN; YEE DE PVC DE 6" - SANITARIA; CODO PVC DE 4 IN Y 45 GRADOS SANITARIA; PEGAMENTO PVC 8 ONZAS
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 46.36, 62.59, 0, true),
  ('contraloria:2025:730', 'CG-0730', 'VENTILACIÓN SANITARIA 2 IN', 'Materiales: TUBERÍA PVC SDR-41 DE 2 IN DE 20 PIES; PEGAMENTO PVC 8 ONZAS; CODO PVC 2 IN 90º SANITARIA; TEE PVC 2 IN SANITARIO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 18.7, 25.24, 0, true),
  ('contraloria:2025:731', 'CG-0731', 'SUMIDERO DE PISO 2 IN', 'Materiales: SUMIDERO PISO 2"
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Unidad', 'und', 24.75, 33.41, 0, true),
  ('contraloria:2025:732', 'CG-0732', 'SALIDA SANITARIA', 'Materiales: TUBERÍA PVC SDR-41 DE 4 IN DE 20PIES; PEGAMENTO PVC 8 ONZAS; TEE PVC SIMPLE CON REDUCCIÓN DE 4 IN A 2 IN SANITARIO; YEE PVC DE 4 IN X 4 IN X 2 IN SANITARIA; CODO PVC 2 IN 90º SANITARIA; SIFÓN SANITARIO 2 IN
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 80.61, 108.82, 0, true),
  ('contraloria:2025:733', 'CG-0733', 'SALIDA HIDROSANITARIA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 104.18, 140.64, 0, true),
  ('contraloria:2025:734', 'CG-0734', 'BIODIGESTOR MONOCAPA 800 L', 'Materiales: BIODIGESTOR MONOCAPA 800 LITROS
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 498.92, 673.54, 0, true),
  ('contraloria:2025:735', 'CG-0735', 'BIODIGESTOR MONOCAPA 1150 L', 'Materiales: BIODIGESTOR MONOCAPA 1150 LITROS
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 697.14, 941.14, 0, true),
  ('contraloria:2025:736', 'CG-0736', 'BIODIGESTOR PREFABRICADO 3000 L', 'Materiales: BIODIGESTOR PREFABRICADO RP-3000
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 4283.57, 5782.82, 0, true),
  ('contraloria:2025:737', 'CG-0737', 'BIODIGESTOR PREFABRICADO 7000 L', 'Materiales: BIODIGESTOR PREFABRICADO RP-7000
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 6471.67, 8736.75, 0, true),
  ('contraloria:2025:738', 'CG-0738', 'CAMARA DE LODO (0.6 m x 0.6 m)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 135.84, 183.38, 0, true),
  ('contraloria:2025:739', 'CG-0739', 'ZANJA DE OXIDACIÓN (0.30 m de ancho)', 'Materiales: PEGAMENTO PVC 8 ONZAS; TUBERÍA PVC SDR-41 DE 4 IN DE 20PIES
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 35.41, 47.8, 0, true),
  ('contraloria:2025:740', 'CG-0740', 'POZO DE ABSORCIÓN (1.250 m diámetro) CON CAMARA DE INSPECCIÓN (0.45m x 0.45m)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 205.73, 277.74, 0, true),
  ('contraloria:2025:741', 'CG-0741', 'TANQUE SEPTICO DE UNA CÁMARA PARA VIVIENDA UNIFAMILIAR', 'Materiales: TUBERÍA PVC SDR-41 DE 4 IN DE 20PIES; PEGAMENTO PVC 8 ONZAS; TEE DE PVC 4 IN SANITARIO
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas especiales y seguridad', 'Unidad', 'und', 1923.34, 2596.51, 0, true),
  ('contraloria:2025:742', 'CG-0742', 'TUBERÍA ELÉCTRICA LIVIANA EMT DE 1/2 IN', 'Materiales: TUBERÍA EMT TR DE 10 PIES 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.23, 7.06, 0, true),
  ('contraloria:2025:743', 'CG-0743', 'TUBERÍA ELÉCTRICA LIVIANA EMT DE 3/4 IN', 'Materiales: TUBERÍA EMT TR DE 10 PIES 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 6.61, 8.92, 0, true),
  ('contraloria:2025:744', 'CG-0744', 'TUBERÍA ELÉCTRICA LIVIANA EMT DE 1 IN', 'Materiales: TUBERÍA EMT TR DE 10 PIES 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 8.48, 11.45, 0, true),
  ('contraloria:2025:745', 'CG-0745', 'TUBERÍA ELÉCTRICA LIVIANA EMT DE 1 1/4 IN', 'Materiales: TUBERÍA EMT TR DE 10 PIES 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 10.63, 14.35, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:746', 'CG-0746', 'TUBERÍA ELÉCTRICA LIVIANA EMT DE 1 1/2 IN', 'Materiales: TUBERÍA EMT TR DE 10 PIES 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 12.06, 16.28, 0, true),
  ('contraloria:2025:747', 'CG-0747', 'TUBERÍA ELÉCTRICA LIVIANA EMT DE 2 IN', 'Materiales: TUBERÍA EMT TR DE 10 PIES 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 17.2, 23.22, 0, true),
  ('contraloria:2025:748', 'CG-0748', 'TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 1/2 IN', 'Materiales: TUBERÍA ELÉCTRICA RIGIDA INTERMEDIA IMC TR DE 10 PIES, 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 8.77, 11.84, 0, true),
  ('contraloria:2025:749', 'CG-0749', 'TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 3/4 IN', 'Materiales: TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 10 PIES, 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 8.17, 11.03, 0, true),
  ('contraloria:2025:750', 'CG-0750', 'TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 1 IN', 'Materiales: TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 10 FT, 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 10.27, 13.86, 0, true),
  ('contraloria:2025:751', 'CG-0751', 'TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 1 1/4 IN', 'Materiales: TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 10 PIES, 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 11.08, 14.96, 0, true),
  ('contraloria:2025:752', 'CG-0752', 'TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 1 1/2 IN', 'Materiales: TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 10 PIES, 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 17.06, 23.03, 0, true),
  ('contraloria:2025:753', 'CG-0753', 'TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 2 IN', 'Materiales: TUBERÍA ELÉCTRICA RÍGIDA INTERMEDIA IMC TR DE 10 PIES, 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 16.97, 22.91, 0, true),
  ('contraloria:2025:754', 'CG-0754', 'TUBERÍA ELÉCTRICA PVC TR DE 1/2 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 3.74, 5.05, 0, true),
  ('contraloria:2025:755', 'CG-0755', 'TUBERÍA ELÉCTRICA PVC TR DE 3/4 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 4.16, 5.62, 0, true),
  ('contraloria:2025:756', 'CG-0756', 'TUBERÍA ELÉCTRICA PVC TR DE 1 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 4.77, 6.44, 0, true),
  ('contraloria:2025:757', 'CG-0757', 'TUBERÍA ELÉCTRICA PVC TR DE 1 1/4 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.87, 7.92, 0, true),
  ('contraloria:2025:758', 'CG-0758', 'TUBERÍA ELÉCTRICA PVC TR DE 1 1/2 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 6.97, 9.41, 0, true),
  ('contraloria:2025:759', 'CG-0759', 'TUBERÍA ELÉCTRICA PVC TR DE 2 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 8.5, 11.47, 0, true),
  ('contraloria:2025:760', 'CG-0760', 'TUBERÍA ELÉCTRICA PVC TR DE 2 1/2 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 2 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 9.82, 13.26, 0, true),
  ('contraloria:2025:761', 'CG-0761', 'TUBERÍA ELÉCTRICA PVC TR DE 3 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 3 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 14.86, 20.06, 0, true),
  ('contraloria:2025:762', 'CG-0762', 'TUBERÍA ELÉCTRICA PVC TR DE 4 IN', 'Materiales: TUBERÍA PVC TR DE 10 PIES, 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 20.79, 28.07, 0, true),
  ('contraloria:2025:763', 'CG-0763', 'TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 3/8 IN', 'Materiales: TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 3/8 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 3.19, 4.31, 0, true),
  ('contraloria:2025:764', 'CG-0764', 'TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 1/2 IN', 'Materiales: TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 4.27, 5.76, 0, true),
  ('contraloria:2025:765', 'CG-0765', 'TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 3/4 IN', 'Materiales: TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.01, 6.76, 0, true),
  ('contraloria:2025:766', 'CG-0766', 'TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 1 IN', 'Materiales: TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 8.21, 11.08, 0, true),
  ('contraloria:2025:767', 'CG-0767', 'TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 1 1/4 IN', 'Materiales: TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 11.36, 15.34, 0, true),
  ('contraloria:2025:768', 'CG-0768', 'TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 1 1/2 IN', 'Materiales: TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 16.66, 22.49, 0, true),
  ('contraloria:2025:769', 'CG-0769', 'TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 2 1/2 IN', 'Materiales: TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 2 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 25.38, 34.26, 0, true),
  ('contraloria:2025:770', 'CG-0770', 'TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 4 IN', 'Materiales: TUBERÍA METÁLICA FLEXIBLE GREENFIELD DE 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 52.56, 70.96, 0, true),
  ('contraloria:2025:771', 'CG-0771', 'TUBERÍA LIQUID TIGHT DE 1/2 IN', 'Materiales: TUBERÍA LIQUID TIGHT DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 5.9, 7.96, 0, true),
  ('contraloria:2025:772', 'CG-0772', 'TUBERÍA LIQUID TIGHT DE 3/4 IN', 'Materiales: TUBERÍA LIQUID TIGHT DE 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 6.14, 8.29, 0, true),
  ('contraloria:2025:773', 'CG-0773', 'TUBERÍA LIQUID TIGHT DE 1 IN', 'Materiales: TUBERÍA LIQUID TIGHT DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 9.21, 12.43, 0, true),
  ('contraloria:2025:774', 'CG-0774', 'TUBERÍA LIQUID TIGHT DE 2 IN', 'Materiales: TUBERÍA LIQUID TIGHT DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 25.43, 34.33, 0, true),
  ('contraloria:2025:775', 'CG-0775', 'TUBERÍA LIQUID TIGHT DE 3 IN', 'Materiales: TUBERÍA LIQUID TIGHT DE 3 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 40.27, 54.36, 0, true),
  ('contraloria:2025:776', 'CG-0776', 'TUBERÍA LIQUID TIGHT DE 4 IN', 'Materiales: TUBERÍA LIQUID TIGHT DE 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 49.42, 66.72, 0, true),
  ('contraloria:2025:777', 'CG-0777', 'CONECTOR RECTO GREENFIELD DE 1/2 IN', 'Materiales: CONECTOR RECTO GREENFIELD DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 3.68, 4.97, 0, true),
  ('contraloria:2025:778', 'CG-0778', 'CONECTOR RECTO GREENFIELD DE 1 IN', 'Materiales: CONECTOR RECTO GREENFIELD DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 5.44, 7.34, 0, true),
  ('contraloria:2025:779', 'CG-0779', 'CONECTOR RECTO GREENFIELD DE 1 1/2 IN', 'Materiales: CONECTOR RECTO GREENFIELD DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 9.14, 12.34, 0, true),
  ('contraloria:2025:780', 'CG-0780', 'CONECTOR RECTO GREENFIELD DE 2 IN', 'Materiales: CONECTOR RECTO GREENFIELD DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 11.41, 15.4, 0, true),
  ('contraloria:2025:781', 'CG-0781', 'CONECTOR RECTO GREENFIELD DE 2 1/2 IN', 'Materiales: CONECTOR RECTO GREENFIELD DE 2 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 22.22, 30.0, 0, true),
  ('contraloria:2025:782', 'CG-0782', 'CONECTOR RECTO GREENFIELD DE 3 IN', 'Materiales: CONECTOR RECTO GREENFIELD DE 3 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 25.37, 34.25, 0, true),
  ('contraloria:2025:783', 'CG-0783', 'CONECTOR RECTO GREENFIELD DE 4 IN', 'Materiales: CONECTOR RECTO GREENFIELD DE 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 36.7, 49.55, 0, true),
  ('contraloria:2025:784', 'CG-0784', 'CONECTOR CURVO GREENFIELD DE 3/8 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 3/8 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 3.53, 4.77, 0, true),
  ('contraloria:2025:785', 'CG-0785', 'CONECTOR CURVO GREENFIELD DE 1/2 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 4.52, 6.1, 0, true),
  ('contraloria:2025:786', 'CG-0786', 'CONECTOR CURVO GREENFIELD DE 3/4 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 5.32, 7.18, 0, true),
  ('contraloria:2025:787', 'CG-0787', 'CONECTOR CURVO GREENFIELD DE 1 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 7.91, 10.68, 0, true),
  ('contraloria:2025:788', 'CG-0788', 'CONECTOR CURVO GREENFIELD DE 1 1/4 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 10.09, 13.62, 0, true),
  ('contraloria:2025:789', 'CG-0789', 'CONECTOR CURVO GREENFIELD DE 1 1/2 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 14.19, 19.16, 0, true),
  ('contraloria:2025:790', 'CG-0790', 'CONECTOR CURVO GREENFIELD DE 2 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 13.91, 18.78, 0, true),
  ('contraloria:2025:791', 'CG-0791', 'CONECTOR CURVO GREENFIELD DE 2 1/2 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 2 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 33.18, 44.79, 0, true),
  ('contraloria:2025:792', 'CG-0792', 'CONECTOR CURVO GREENFIELD DE 4 IN', 'Materiales: CONECTOR CURVO GREENFIELD DE 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 93.88, 126.74, 0, true),
  ('contraloria:2025:793', 'CG-0793', 'CONECTOR RECTO LIQUID TIGHT DE 1/2 IN', 'Materiales: CONECTOR RECTO LIQUID TIGHT DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 5.38, 7.26, 0, true),
  ('contraloria:2025:794', 'CG-0794', 'CONECTOR RECTO LIQUID TIGHT DE 1 IN', 'Materiales: CONECTOR RECTO LIQUID TIGHT DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 8.59, 11.6, 0, true),
  ('contraloria:2025:795', 'CG-0795', 'CONECTOR RECTO LIQUID TIGHT DE 1 1/4 IN', 'Materiales: CONECTOR RECTO LIQUID TIGHT DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 12.33, 16.65, 0, true),
  ('contraloria:2025:796', 'CG-0796', 'CONECTOR RECTO LIQUID TIGHT DE 1 1/2 IN', 'Materiales: CONECTOR RECTO LIQUID TIGHT DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 12.85, 17.35, 0, true),
  ('contraloria:2025:797', 'CG-0797', 'CONECTOR RECTO LIQUID TIGHT DE 2 IN', 'Materiales: CONECTOR RECTO LIQUID TIGHT DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 15.23, 20.56, 0, true),
  ('contraloria:2025:798', 'CG-0798', 'CONECTOR RECTO LIQUID TIGHT DE 2 1/2 IN', 'Materiales: CONECTOR RECTO LIQUID TIGHT DE 2 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 32.88, 44.39, 0, true),
  ('contraloria:2025:799', 'CG-0799', 'CONECTOR RECTO LIQUID TIGHT DE 3 IN', 'Materiales: CONECTOR RECTO LIQUID TIGHT DE 3 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 41.42, 55.92, 0, true),
  ('contraloria:2025:800', 'CG-0800', 'CONECTOR RECTO LIQUID TIGHT DE 4 IN', 'Materiales: CONECTOR RECTO LIQUID TIGHT DE 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 69.23, 93.46, 0, true),
  ('contraloria:2025:801', 'CG-0801', 'CONECTOR CURVO LIQUID TIGHT DE 1/2 IN', 'Materiales: CONECTOR CURVO LIQUID TIGHT DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 6.46, 8.72, 0, true),
  ('contraloria:2025:802', 'CG-0802', 'CONECTOR CURVO LIQUID TIGHT DE 1 IN', 'Materiales: CONECTOR CURVO LIQUID TIGHT DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 10.42, 14.07, 0, true),
  ('contraloria:2025:803', 'CG-0803', 'CONECTOR CURVO LIQUID TIGHT DE 1 1/4 IN', 'Materiales: CONECTOR CURVO LIQUID TIGHT DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 14.79, 19.97, 0, true),
  ('contraloria:2025:804', 'CG-0804', 'CONECTOR CURVO LIQUID TIGHT DE 1 1/2 IN', 'Materiales: CONECTOR CURVO LIQUID TIGHT DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 19.41, 26.2, 0, true),
  ('contraloria:2025:805', 'CG-0805', 'CONECTOR CURVO LIQUID TIGHT DE 2 IN', 'Materiales: CONECTOR CURVO LIQUID TIGHT DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 29.25, 39.49, 0, true),
  ('contraloria:2025:806', 'CG-0806', 'CONECTOR CURVO LIQUID TIGHT DE 2 1/2 IN', 'Materiales: CONECTOR CURVO LIQUID TIGHT DE 2 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 35.62, 48.09, 0, true),
  ('contraloria:2025:807', 'CG-0807', 'CONECTOR CURVO LIQUID TIGHT DE 3 IN', 'Materiales: CONECTOR CURVO LIQUID TIGHT DE 3 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 42.27, 57.06, 0, true),
  ('contraloria:2025:808', 'CG-0808', 'CONECTOR CURVO LIQUID TIGHT DE 4 IN', 'Materiales: CONECTOR CURVO LIQUID TIGHT DE 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 118.62, 160.14, 0, true),
  ('contraloria:2025:809', 'CG-0809', 'CONECTOR TORNILLO EMT DE 1/2 IN', 'Materiales: CONECTOR TORNILLO EMT DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.26, 3.05, 0, true),
  ('contraloria:2025:810', 'CG-0810', 'CONECTOR TORNILLO EMT DE 3/4 IN', 'Materiales: CONECTOR TORNILLO EMT DE 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.8, 3.78, 0, true),
  ('contraloria:2025:811', 'CG-0811', 'CONECTOR TORNILLO EMT DE 1 IN', 'Materiales: CONECTOR TORNILLO EMT DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 3.64, 4.91, 0, true),
  ('contraloria:2025:812', 'CG-0812', 'CONECTOR TORNILLO EMT DE 1 1/4 IN', 'Materiales: CONECTOR TORNILLO EMT DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 5.17, 6.98, 0, true),
  ('contraloria:2025:813', 'CG-0813', 'CONECTOR ELÉCTRICO PVC DE 1/2 IN', 'Materiales: CONECTOR ELECTRICO PVC DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 0.53, 0.72, 0, true),
  ('contraloria:2025:814', 'CG-0814', 'UNIÓN TORNILLO EMT DE 1/2 IN', 'Materiales: UNIÓN TORNILLO EMT DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 1.31, 1.77, 0, true),
  ('contraloria:2025:815', 'CG-0815', 'UNIÓN TORNILLO EMT DE 1 IN', 'Materiales: UNIÓN TORNILLO EMT DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.02, 2.73, 0, true),
  ('contraloria:2025:816', 'CG-0816', 'UNIÓN TORNILLO EMT DE 1 1/4 IN', 'Materiales: UNIÓN TORNILLO EMT DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.74, 3.7, 0, true),
  ('contraloria:2025:817', 'CG-0817', 'UNIÓN TORNILLO EMT DE 1 1/2 IN', 'Materiales: UNIÓN TORNILLO EMT DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 3.9, 5.26, 0, true),
  ('contraloria:2025:818', 'CG-0818', 'UNIÓN TORNILLO EMT DE 2 IN', 'Materiales: UNIÓN TORNILLO EMT DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 4.46, 6.02, 0, true),
  ('contraloria:2025:819', 'CG-0819', 'CODO EMT DE 1/2 IN', 'Materiales: CODO EMT DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 6.1, 8.23, 0, true),
  ('contraloria:2025:820', 'CG-0820', 'CODO EMT DE 3/4 IN', 'Materiales: CODO EMT DE 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 6.95, 9.38, 0, true),
  ('contraloria:2025:821', 'CG-0821', 'CODO EMT DE 1 IN', 'Materiales: CODO EMT DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 8.72, 11.77, 0, true),
  ('contraloria:2025:822', 'CG-0822', 'CODO EMT DE 1 1/4 IN', 'Materiales: CODO EMT DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 12.56, 16.96, 0, true),
  ('contraloria:2025:823', 'CG-0823', 'CODO EMT DE 1 1/2 IN', 'Materiales: CODO EMT DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 15.54, 20.98, 0, true),
  ('contraloria:2025:824', 'CG-0824', 'CODO EMT DE 2 IN', 'Materiales: CODO EMT DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 20.67, 27.9, 0, true),
  ('contraloria:2025:825', 'CG-0825', 'CODOS ELÉCTRICOS PVC DE 1/2 IN', 'Materiales: CODOS ELECTRICO PVC DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 5.38, 7.26, 0, true),
  ('contraloria:2025:826', 'CG-0826', 'CODOS ELÉCTRICOS PVC DE 3/4 IN', 'Materiales: CODOS ELECTRICO PVC DE 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 6.11, 8.25, 0, true),
  ('contraloria:2025:827', 'CG-0827', 'CODOS ELÉCTRICOS PVC DE 1 IN', 'Materiales: CODOS ELECTRICO PVC DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 6.92, 9.34, 0, true),
  ('contraloria:2025:828', 'CG-0828', 'CODOS ELÉCTRICOS PVC DE 1 1/4 IN', 'Materiales: CODOS ELECTRICO PVC DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 9.16, 12.37, 0, true),
  ('contraloria:2025:829', 'CG-0829', 'CODOS ELÉCTRICOS PVC DE 1 1/2 IN', 'Materiales: CODOS ELECTRICO PVC DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 11.01, 14.86, 0, true),
  ('contraloria:2025:830', 'CG-0830', 'CODOS ELÉCTRICOS PVC DE 2 IN', 'Materiales: CODOS ELECTRICO PVC DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 15.23, 20.56, 0, true),
  ('contraloria:2025:831', 'CG-0831', 'CODOS ELÉCTRICOS PVC DE 2 1/2 IN', 'Materiales: CODOS ELECTRICO PVC DE 2 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 18.57, 25.07, 0, true),
  ('contraloria:2025:832', 'CG-0832', 'CODOS ELÉCTRICOS PVC DE 3 IN', 'Materiales: CODOS ELECTRICO PVC DE 3 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 23.56, 31.81, 0, true),
  ('contraloria:2025:833', 'CG-0833', 'CODOS ELÉCTRICOS PVC DE 4 IN', 'Materiales: CODOS ELECTRICO PVC DE 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 37.49, 50.61, 0, true),
  ('contraloria:2025:834', 'CG-0834', 'CONDUCTOR 14 AWG COBRE', 'Materiales: CONDUCTOR 14 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 0.8, 1.08, 0, true),
  ('contraloria:2025:835', 'CG-0835', 'CONDUCTOR 12 AWG COBRE', 'Materiales: CONDUCTOR 12 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 1.01, 1.36, 0, true),
  ('contraloria:2025:836', 'CG-0836', 'CONDUCTOR 10 AWG COBRE', 'Materiales: CONDUCTOR 10 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 1.39, 1.88, 0, true),
  ('contraloria:2025:837', 'CG-0837', 'CONDUCTOR 8 AWG COBRE', 'Materiales: CONDUCTOR 8 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 2.04, 2.75, 0, true),
  ('contraloria:2025:838', 'CG-0838', 'CONDUCTOR 6 AWG COBRE', 'Materiales: CONDUCTOR 6 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 2.95, 3.98, 0, true),
  ('contraloria:2025:839', 'CG-0839', 'CONDUCTOR 4 AWG COBRE', 'Materiales: CONDUCTOR 4 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 4.24, 5.72, 0, true),
  ('contraloria:2025:840', 'CG-0840', 'CONDUCTOR 2 AWG COBRE', 'Materiales: CONDUCTOR 2 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 7.31, 9.87, 0, true),
  ('contraloria:2025:841', 'CG-0841', 'CONDUCTOR 1/0 AWG COBRE', 'Materiales: CONDUCTOR 1/0 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 10.35, 13.97, 0, true),
  ('contraloria:2025:842', 'CG-0842', 'CONDUCTOR 2/0 AWG COBRE', 'Materiales: CONDUCTOR 2/0 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 12.93, 17.46, 0, true),
  ('contraloria:2025:843', 'CG-0843', 'CONDUCTOR 3/0 AWG COBRE', 'Materiales: CONDUCTOR 3/0 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 15.62, 21.09, 0, true),
  ('contraloria:2025:844', 'CG-0844', 'CONDUCTOR 4/0 AWG COBRE', 'Materiales: CONDUCTOR 4/0 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 19.32, 26.08, 0, true),
  ('contraloria:2025:845', 'CG-0845', 'CONDUCTOR 500 MCM COBRE', 'Materiales: CONDUCTOR 500 MCM COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 46.01, 62.11, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:846', 'CG-0846', 'CONDUCTOR 2/0 AWG ALUMINIO', 'Materiales: CONDUCTOR 2/0 AWG ALUMINIO
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 4.36, 5.89, 0, true),
  ('contraloria:2025:847', 'CG-0847', 'CONDUCTOR 3/0 AWG ALUMINIO', 'Materiales: CONDUCTOR 3/0 AWG ALUMINIO
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 4.63, 6.25, 0, true),
  ('contraloria:2025:848', 'CG-0848', 'PANEL 125 AMP 8C MONTAJE SUPERFICIAL', 'Materiales: PANEL 125 AMP 8C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 78.61, 106.12, 0, true),
  ('contraloria:2025:849', 'CG-0849', 'PANEL 125 AMP 12C MONTAJE SUPERFICIAL', 'Materiales: PANEL 125 AMP 12C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 108.81, 146.89, 0, true),
  ('contraloria:2025:850', 'CG-0850', 'PANEL 125 AMP 16C MONTAJE SUPERFICIAL', 'Materiales: PANEL 125 AMP 16C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 141.02, 190.38, 0, true),
  ('contraloria:2025:851', 'CG-0851', 'PANEL 125 AMP 24C MONTAJE SUPERFICIAL', 'Materiales: PANEL 125 AMP 24C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 191.22, 258.15, 0, true),
  ('contraloria:2025:852', 'CG-0852', 'PANEL 150 AMP 18C MONTAJE SUPERFICIAL', 'Materiales: PANEL 150 AMP 18C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 216.75, 292.61, 0, true),
  ('contraloria:2025:853', 'CG-0853', 'PANEL 150 AMP 24C MONTAJE SUPERFICIAL', 'Materiales: PANEL 150 AMP 24C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 247.56, 334.21, 0, true),
  ('contraloria:2025:854', 'CG-0854', 'PANEL 225 AMP 30C MONTAJE SUPERFICIAL', 'Materiales: PANEL 225 AMP 30C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 363.85, 491.2, 0, true),
  ('contraloria:2025:855', 'CG-0855', 'PANEL 225 AMP 42C MONTAJE SUPERFICIAL', 'Materiales: PANEL 225 AMP 42C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 409.36, 552.64, 0, true),
  ('contraloria:2025:856', 'CG-0856', 'PANEL 125 AMP 8C MONTAJE EMPOTRADO', 'Materiales: PANEL 125 AMP 8C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 109.22, 147.45, 0, true),
  ('contraloria:2025:857', 'CG-0857', 'PANEL 125 AMP 12C MONTAJE EMPOTRADO', 'Materiales: PANEL 125 AMP 12C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 139.43, 188.23, 0, true),
  ('contraloria:2025:858', 'CG-0858', 'PANEL 125 AMP 16C MONTAJE EMPOTRADO', 'Materiales: PANEL 125 AMP 16C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 171.63, 231.7, 0, true),
  ('contraloria:2025:859', 'CG-0859', 'PANEL 125 AMP 24C MONTAJE EMPOTRADO', 'Materiales: PANEL 125 AMP 24C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 232.04, 313.25, 0, true),
  ('contraloria:2025:860', 'CG-0860', 'PANEL 150 AMP 18C MONTAJE EMPOTRADO', 'Materiales: PANEL 150 AMP 18C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 246.34, 332.56, 0, true),
  ('contraloria:2025:861', 'CG-0861', 'PANEL 150 AMP 24C MONTAJE EMPOTRADO', 'Materiales: PANEL 150 AMP 24C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 278.17, 375.53, 0, true),
  ('contraloria:2025:862', 'CG-0862', 'PANEL 225 AMP 30C MONTAJE EMPOTRADO', 'Materiales: PANEL 225 AMP 30C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 394.47, 532.53, 0, true),
  ('contraloria:2025:863', 'CG-0863', 'PANEL 225 AMP 42C MONTAJE EMPOTRADO', 'Materiales: PANEL 225 AMP 42C
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 439.98, 593.97, 0, true),
  ('contraloria:2025:864', 'CG-0864', 'BREAKER PLUG IN 1 POLO, 15 A', 'Materiales: BREAKER 15 A, 1P
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 18.82, 25.41, 0, true),
  ('contraloria:2025:865', 'CG-0865', 'BREAKER PLUG IN 1 POLO, 20 A', 'Materiales: BREAKER 20 A, 1P
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 19.56, 26.41, 0, true),
  ('contraloria:2025:866', 'CG-0866', 'BREAKER PLUG IN 1 POLO, 30 A', 'Materiales: BREAKER 30 A, 1P
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 20.97, 28.31, 0, true),
  ('contraloria:2025:867', 'CG-0867', 'BREAKER PLUG IN 1 POLO, 40 A', 'Materiales: BREAKER 40 A, 1P
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 24.29, 32.79, 0, true),
  ('contraloria:2025:868', 'CG-0868', 'BREAKER PLUG IN 1 POLO AFCI, 20 A', 'Materiales: BREAKER 20 A, 1P AFCI
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 92.36, 124.69, 0, true),
  ('contraloria:2025:869', 'CG-0869', 'BREAKER PLUG IN 1 POLO GFCI, 20 A', 'Materiales: BREAKER 20 A, 1P GFCI
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 91.83, 123.97, 0, true),
  ('contraloria:2025:870', 'CG-0870', 'BREAKER PLUG IN 2 POLO, 15 A', 'Materiales: BREAKER 2 POLO, 15 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 20.23, 27.31, 0, true),
  ('contraloria:2025:871', 'CG-0871', 'BREAKER PLUG IN 2 POLO, 20 A', 'Materiales: BREAKER 2 POLO, 20 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 35.56, 48.01, 0, true),
  ('contraloria:2025:872', 'CG-0872', 'BREAKER PLUG IN 2 POLO, 30 A', 'Materiales: BREAKER 2 POLO, 30 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 37.19, 50.21, 0, true),
  ('contraloria:2025:873', 'CG-0873', 'BREAKER PLUG IN 2 POLO, 40 A', 'Materiales: BREAKER 2 POLO, 40 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 26.31, 35.52, 0, true),
  ('contraloria:2025:874', 'CG-0874', 'BREAKER PLUG IN 2 POLO, 50 A', 'Materiales: BREAKER 2 POLO, 50 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 30.61, 41.32, 0, true),
  ('contraloria:2025:875', 'CG-0875', 'BREAKER PLUG IN 2 POLO, 60 A', 'Materiales: BREAKER 2 POLO, 60 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 32.56, 43.96, 0, true),
  ('contraloria:2025:876', 'CG-0876', 'BREAKER PLUG IN 2 POLO, 70 A', 'Materiales: BREAKER 2 POLO, 70 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 55.2, 74.52, 0, true),
  ('contraloria:2025:877', 'CG-0877', 'BREAKER PLUG IN 2 POLO, 100 A', 'Materiales: BREAKER 2 POLO, 100 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 70.07, 94.59, 0, true),
  ('contraloria:2025:878', 'CG-0878', 'BREAKER PLUG IN 2 POLO, 125 A', 'Materiales: BREAKER 2 POLO, 125 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 66.73, 90.09, 0, true),
  ('contraloria:2025:879', 'CG-0879', 'BREAKER PLUG IN 3 POLO, 20 A', 'Materiales: BREAKER 3 POLO, 20 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 80.47, 108.63, 0, true),
  ('contraloria:2025:880', 'CG-0880', 'BREAKER PLUG IN 3 POLO, 60 A', 'Materiales: BREAKER 3 POLO, 60 A
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 71.05, 95.92, 0, true),
  ('contraloria:2025:881', 'CG-0881', 'BREAKER 125 A, 2 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 125 A, 2 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 212.05, 286.27, 0, true),
  ('contraloria:2025:882', 'CG-0882', 'BREAKER 150 A, 2 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 150 A, 2 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 190.37, 257.0, 0, true),
  ('contraloria:2025:883', 'CG-0883', 'BREAKER 175 A, 2 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 175 A, 2 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 201.08, 271.46, 0, true),
  ('contraloria:2025:884', 'CG-0884', 'BREAKER 60 A, 3 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 60 A, 3 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 126.06, 170.18, 0, true),
  ('contraloria:2025:885', 'CG-0885', 'BREAKER 125 A, 3 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 125 A, 3 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 313.49, 423.21, 0, true),
  ('contraloria:2025:886', 'CG-0886', 'BREAKER 150 A, 3 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 150 A, 3 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 334.94, 452.17, 0, true),
  ('contraloria:2025:887', 'CG-0887', 'BREAKER 175 A, 3 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 175 A, 3 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 346.24, 467.42, 0, true),
  ('contraloria:2025:888', 'CG-0888', 'BREAKER 200 A, 3 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 200 A, 3 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 363.42, 490.62, 0, true),
  ('contraloria:2025:889', 'CG-0889', 'BREAKER 225 A, 3 POLOS EN CAJA NEMA 1', 'Materiales: BREAKER 225 A, 3 POLOS EN CAJA NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 387.21, 522.73, 0, true),
  ('contraloria:2025:890', 'CG-0890', 'SAFETY SWITCHES TIPO CUCHILLA 30A, 3 POLOS NEMA 1', 'Materiales: SAFETY SWITCHES TIPO CUCHILLA 30A, 3 POLOS NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 97.02, 130.98, 0, true),
  ('contraloria:2025:891', 'CG-0891', 'SAFETY SWITCHES TIPO CUCHILLA 60A, 3 POLOS NEMA 1', 'Materiales: SAFETY SWITCHES TIPO CUCHILLA 60A, 3 POLOS NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 155.86, 210.41, 0, true),
  ('contraloria:2025:892', 'CG-0892', 'SAFETY SWITCHES TIPO CUCHILLA 30A, 3 POLOS NEMA 3R', 'Materiales: SAFETY SWITCHES TIPO CUCHILLA 30A, 3 POLOS NEMA 3R
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 145.04, 195.8, 0, true),
  ('contraloria:2025:893', 'CG-0893', 'SAFETY SWITCHES TIPO CUCHILLA 60A, 3 POLOS NEMA 3R', 'Materiales: SAFETY SWITCHES TIPO CUCHILLA 60A, 3 POLOS NEMA 3R
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 273.46, 369.17, 0, true),
  ('contraloria:2025:894', 'CG-0894', 'SAFETY SWITCHES TIPO CUCHILLA 100A, 3 POLOS NEMA 3R', 'Materiales: SAFETY SWITCHES TIPO CUCHILLA 100A, 3 POLOS NEMA 3R
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 358.89, 484.5, 0, true),
  ('contraloria:2025:895', 'CG-0895', 'SWITCH 15 AMPS 1 POLO 120 V', 'Materiales: SWITCH 15 AMPS 1 POLO 120 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 4.03, 5.44, 0, true),
  ('contraloria:2025:896', 'CG-0896', 'SWITCH 20 AMPS 1 POLO', 'Materiales: SWITCH 20 AMPS 1 POLO
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 8.81, 11.89, 0, true),
  ('contraloria:2025:897', 'CG-0897', 'SWITCH 15 AMPS 2 POLO 120 V', 'Materiales: SWITCH 15 AMPS 2 POLO 120 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 8.1, 10.93, 0, true),
  ('contraloria:2025:898', 'CG-0898', 'SWITCH 15 AMPS 3 VÍAS 120 V', 'Materiales: SWITCH 15 AMPS 3 VÍAS 120 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 11.8, 15.93, 0, true),
  ('contraloria:2025:899', 'CG-0899', 'TIPOS DE ENTRADA ELÉCTRICA DE 1/2 IN', 'Materiales: TIPOS DE ENTRADA ELECTRICO DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 17.01, 22.96, 0, true),
  ('contraloria:2025:900', 'CG-0900', 'TIPOS DE ENTRADA ELÉCTRICA DE 3/4 IN', 'Materiales: TIPOS DE ENTRADA ELECTRICO DE 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 19.65, 26.53, 0, true),
  ('contraloria:2025:901', 'CG-0901', 'TIPOS DE ENTRADA ELÉCTRICA DE 1 IN', 'Materiales: TIPOS DE ENTRADA ELECTRICO DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 23.16, 31.27, 0, true),
  ('contraloria:2025:902', 'CG-0902', 'TIPOS DE ENTRADA ELÉCTRICA DE 1 1/4 IN', 'Materiales: TIPOS DE ENTRADA ELECTRICO DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 25.85, 34.9, 0, true),
  ('contraloria:2025:903', 'CG-0903', 'TIPOS DE ENTRADA ELÉCTRICA DE 1 1/2 IN', 'Materiales: TIPOS DE ENTRADA ELECTRICO DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 29.07, 39.24, 0, true),
  ('contraloria:2025:904', 'CG-0904', 'TIPOS DE ENTRADA ELÉCTRICA DE 2 IN', 'Materiales: TIPOS DE ENTRADA ELECTRICO DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 40.63, 54.85, 0, true),
  ('contraloria:2025:905', 'CG-0905', 'CAJA PARA MEDIDOR 100A REDONDA 1 F', 'Materiales: CAJA PARA MEDIDOR 100A REDONDA 1 F
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 64.29, 86.79, 0, true),
  ('contraloria:2025:906', 'CG-0906', 'CAJA PARA MEDIDOR 100A CUADRADA 1 F', 'Materiales: CAJA PARA MEDIDOR 100A CUADRADA 1 F
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 66.84, 90.23, 0, true),
  ('contraloria:2025:907', 'CG-0907', 'CAJA PARA MEDIDOR 200A CUADRADA 1 F', 'Materiales: CAJA PARA MEDIDOR 200A CUADRADA 1 F
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 126.71, 171.06, 0, true),
  ('contraloria:2025:908', 'CG-0908', 'CAJA PARA MEDIDOR 200A CUADRADA 3 F', 'Materiales: CAJA PARA MEDIDOR 200A CUADRADA 3 F
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 211.16, 285.07, 0, true),
  ('contraloria:2025:909', 'CG-0909', 'CAJA ELÉCTRICA 4 11/16 IN X 4 11/16 IN', 'Materiales: CAJA 4 11/16 IN X 4 11/16 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 11.13, 15.03, 0, true),
  ('contraloria:2025:910', 'CG-0910', 'CAJA ELÉCTRICA 3 GANGS', 'Materiales: CAJA 3 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 12.6, 17.01, 0, true),
  ('contraloria:2025:911', 'CG-0911', 'CAJA ELÉCTRICA 4 GANGS', 'Materiales: CAJA 4 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 13.19, 17.81, 0, true),
  ('contraloria:2025:912', 'CG-0912', 'CAJA ELÉCTRICA 5 GANGS', 'Materiales: CAJA 5 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 21.41, 28.9, 0, true),
  ('contraloria:2025:913', 'CG-0913', 'CAJA ELÉCTRICA 6 GANGS', 'Materiales: CAJA 6 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 23.23, 31.36, 0, true),
  ('contraloria:2025:914', 'CG-0914', 'CAJA DE UTILIDAD ELÉCTRICA 2 IN X 4 IN', 'Materiales: CAJA DE UTILIDAD 2 IN X 4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 7.43, 10.03, 0, true),
  ('contraloria:2025:915', 'CG-0915', 'CAJA OCTOGONAL ELÉCTRICA', 'Materiales: CAJA OCTOGONAL
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 8.13, 10.98, 0, true),
  ('contraloria:2025:916', 'CG-0916', 'CAJA DE PASO METAL ELÉCTRICA 6"X6"X4" NEMA 1', 'Materiales: CAJA DE PASO METAL 6"X6"X4" NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 32.14, 43.39, 0, true),
  ('contraloria:2025:917', 'CG-0917', 'CAJA DE PASO METAL ELÉCTRICA 8"X8"4" NEMA 1', 'Materiales: CAJA DE PASO METAL 8"X8"4" NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 37.44, 50.54, 0, true),
  ('contraloria:2025:918', 'CG-0918', 'CAJA DE PASO METAL ELÉCTRICA 12"X12"X4" NEMA 1', 'Materiales: CAJA DE PASO METAL 12"X12"X4" NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 55.17, 74.48, 0, true),
  ('contraloria:2025:919', 'CG-0919', 'CAJA DE PASO METAL ELÉCTRICA 12"X12"X6" NEMA 1', 'Materiales: CAJA DE PASO METAL 12"X12"X6" NEMA 1
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 65.88, 88.94, 0, true),
  ('contraloria:2025:920', 'CG-0920', 'TAPA DE REPELLO PARA CAJA CUADRADA ELÉCTRICA 4" X 4"', 'Materiales: TAPA DE REPELLO PARA CAJA CUADRADA 4" X 4"
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 4.52, 6.1, 0, true),
  ('contraloria:2025:921', 'CG-0921', 'TAPA DE REPELLO PARA CAJA ELÉCTRICA 4 11/16" X 4 11/16"', 'Materiales: TAPA DE REPELLO PARA CAJA 4 11/16" X 4 11/16"
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 5.68, 7.67, 0, true),
  ('contraloria:2025:922', 'CG-0922', 'TAPA DE REPELLO PARA CAJA ELÉCTRICA DE 2 GANGS', 'Materiales: TAPA DE REPELLO PARA CAJA DE 2 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 6.17, 8.33, 0, true),
  ('contraloria:2025:923', 'CG-0923', 'TAPA DE REPELLO PARA CAJA ELÉCTRICA DE 3 GANGS', 'Materiales: TAPA DE REPELLO PARA CAJA DE 3 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 8.64, 11.66, 0, true),
  ('contraloria:2025:924', 'CG-0924', 'TAPA DE REPELLO PARA CAJA ELÉCTRICA DE 4 GANGS', 'Materiales: TAPA DE REPELLO PARA CAJA DE 4 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 9.08, 12.26, 0, true),
  ('contraloria:2025:925', 'CG-0925', 'TAPA DE REPELLO PARA CAJA ELÉCTRICA DE 5 GANGS', 'Materiales: TAPA DE REPELLO PARA CAJA DE 5 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 10.08, 13.61, 0, true),
  ('contraloria:2025:926', 'CG-0926', 'TAPA DE REPELLO PARA CAJA ELÉCTRICA DE 6 GANGS', 'Materiales: TAPA DE REPELLO PARA CAJA DE 6 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 13.42, 18.12, 0, true),
  ('contraloria:2025:927', 'CG-0927', 'TAPA CIEGA PARA CAJA CUADRADA ELÉCTRICA 4" X 4"', 'Materiales: TAPA CIEGA PARA CAJA CUADRADA 4" X 4"
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.32, 3.13, 0, true),
  ('contraloria:2025:928', 'CG-0928', 'TAPA CIEGA PARA CAJA ELÉCTRICA 4 11/16" X 4 11/16"', 'Materiales: TAPA CIEGA PARA CAJA 4 11/16" X 4 11/16"
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.69, 3.63, 0, true),
  ('contraloria:2025:929', 'CG-0929', 'TAPA CIEGA PARA CAJA ELÉCTRICA DE 2 GANGS', 'Materiales: TAPA CIEGA PARA CAJA DE 2 GANGS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.82, 3.81, 0, true),
  ('contraloria:2025:930', 'CG-0930', 'TAPA CIEGA PARA CAJA DE UTILIDAD ELÉCTRICA 2" X 4"', 'Materiales: TAPA CIEGA PARA CAJA DE UTILIDAD 2" X 4"
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.19, 2.96, 0, true),
  ('contraloria:2025:931', 'CG-0931', 'TAPA CIEGA PARA CAJA OCTOGONAL ELÉCTRICA', 'Materiales: TAPA CIEGA PARA CAJA OCTOGONAL
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2.22, 3.0, 0, true),
  ('contraloria:2025:932', 'CG-0932', 'TAPA PARA SWITCH 1 GANG', 'Materiales: TAPA PARA SWITCH 1 GANG
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 3.31, 4.47, 0, true),
  ('contraloria:2025:933', 'CG-0933', 'TAPA PARA SWITCH 2 GANG', 'Materiales: TAPA PARA SWITCH 2 GANG
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 4.56, 6.16, 0, true),
  ('contraloria:2025:934', 'CG-0934', 'TAPA PARA SWITCH 3 GANG', 'Materiales: TAPA PARA SWITCH 3 GANG
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 5.94, 8.02, 0, true),
  ('contraloria:2025:935', 'CG-0935', 'TAPA PARA SWITCH 4 GANG', 'Materiales: TAPA PARA SWITCH 4 GANG
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 7.7, 10.39, 0, true),
  ('contraloria:2025:936', 'CG-0936', 'TAPA PARA SWITCH 5 GANG', 'Materiales: TAPA PARA SWITCH 5 GANG
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 10.1, 13.63, 0, true),
  ('contraloria:2025:937', 'CG-0937', 'TAPA PARA SWITCH 6 GANG', 'Materiales: TAPA PARA SWITCH 6 GANG
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 12.34, 16.66, 0, true),
  ('contraloria:2025:938', 'CG-0938', 'TAPA PARA TOMA 1 GANG GFCI WATER PROOF', 'Materiales: TAPA PARA TOMA 1 GANG GFCI WATER PROOF
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 13.1, 17.68, 0, true),
  ('contraloria:2025:939', 'CG-0939', 'CORDON CAUCHO 2 X 16 AWG COBRE', 'Materiales: CORDON CAUCHO 2 X 16 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 2.56, 3.46, 0, true),
  ('contraloria:2025:940', 'CG-0940', 'CORDON CAUCHO 2 X 14 AWG COBRE', 'Materiales: CORDON CAUCHO 2 X 14 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 3.35, 4.52, 0, true),
  ('contraloria:2025:941', 'CG-0941', 'CORDON CAUCHO 2 X 12 AWG COBRE', 'Materiales: CORDON CAUCHO 2 X 12 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 3.92, 5.29, 0, true),
  ('contraloria:2025:942', 'CG-0942', 'CORDON CAUCHO 3 X 16 AWG COBRE', 'Materiales: CORDON CAUCHO 3 X 16 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 2.99, 4.04, 0, true),
  ('contraloria:2025:943', 'CG-0943', 'CORDON CAUCHO 3 X 14 AWG COBRE', 'Materiales: CORDON CAUCHO 3 X 14 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 3.93, 5.31, 0, true),
  ('contraloria:2025:944', 'CG-0944', 'CORDON CAUCHO 3 X 12 AWG COBRE', 'Materiales: CORDON CAUCHO 3 X 12 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 4.71, 6.36, 0, true),
  ('contraloria:2025:945', 'CG-0945', 'CORDON CAUCHO 3 X 10 AWG COBRE', 'Materiales: CORDON CAUCHO 3 X 10 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 6.15, 8.3, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:946', 'CG-0946', 'CORDON CAUCHO 4 X 10 AWG COBRE', 'Materiales: CORDON CAUCHO 4 X 10 AWG COBRE
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Metro lineal', 'm', 7.05, 9.52, 0, true),
  ('contraloria:2025:947', 'CG-0947', 'CONDULETAS 2 SALIDAS DE 1/2 IN', 'Materiales: CONDULETAS 2 SALIDAS DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 15.61, 21.07, 0, true),
  ('contraloria:2025:948', 'CG-0948', 'CONDULETAS 2 SALIDAS DE 3/4 IN', 'Materiales: CONDULETAS 2 SALIDAS DE 3/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 20.14, 27.19, 0, true),
  ('contraloria:2025:949', 'CG-0949', 'CONDULETAS 2 SALIDAS DE 1 IN', 'Materiales: CONDULETAS 2 SALIDAS DE 1 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 24.39, 32.93, 0, true),
  ('contraloria:2025:950', 'CG-0950', 'CONDULETAS 2 SALIDAS DE 1 1/4 IN', 'Materiales: CONDULETAS 2 SALIDAS DE 1 1/4 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 35.54, 47.98, 0, true),
  ('contraloria:2025:951', 'CG-0951', 'CONDULETAS 2 SALIDAS DE 1 1/2 IN', 'Materiales: CONDULETAS 2 SALIDAS DE 1 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 45.87, 61.92, 0, true),
  ('contraloria:2025:952', 'CG-0952', 'CONDULETAS 2 SALIDAS DE 2 IN', 'Materiales: CONDULETAS 2 SALIDAS DE 2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 66.9, 90.31, 0, true),
  ('contraloria:2025:953', 'CG-0953', 'CONDULETAS 2 SALIDAS DE 2 1/2 IN', 'Materiales: CONDULETAS 2 SALIDAS DE 2 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 104.43, 140.98, 0, true),
  ('contraloria:2025:954', 'CG-0954', 'CONDULETAS 2 SALIDAS DE 3 IN', 'Materiales: CONDULETAS 2 SALIDAS DE 3 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 117.02, 157.98, 0, true),
  ('contraloria:2025:955', 'CG-0955', 'CONDULETAS 3 SALIDAS DE 1/2 IN', 'Materiales: CONDULETAS 3 SALIDAS DE 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 23.4, 31.59, 0, true),
  ('contraloria:2025:956', 'CG-0956', 'TOMACORRIENTE SENCILLO 3 HILOS 15 AMP 250 V', 'Materiales: TOMACORRIENTE SENCILLO 3 HILOS 15 AMP 250 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 7.84, 10.58, 0, true),
  ('contraloria:2025:957', 'CG-0957', 'TOMACORRIENTE SENCILLO 3 HILOS 20 AMP 125 V', 'Materiales: TOMACORRIENTE SENCILLO 3 HILOS 20 AMP 125 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 9.16, 12.37, 0, true),
  ('contraloria:2025:958', 'CG-0958', 'TOMACORRIENTE SENCILLO 3 HILOS 20 AMP 250 V', 'Materiales: TOMACORRIENTE SENCILLO 3 HILOS 20 AMP 250 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 9.16, 12.37, 0, true),
  ('contraloria:2025:959', 'CG-0959', 'TOMACORRIENTE DOBLE 15 AMP 3 HILOS 250 V', 'Materiales: TOMACORRIENTE DOBLE 15 AMP 3 HILOS 250 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 10.38, 14.01, 0, true),
  ('contraloria:2025:960', 'CG-0960', 'TOMACORRIENTE DOBLE 15 AMP 3 HILOS 125 V', 'Materiales: TOMACORRIENTE DOBLE 15 AMP 3 HILOS 125 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 7.45, 10.06, 0, true),
  ('contraloria:2025:961', 'CG-0961', 'TOMACORRIENTE DOBLE 15 AMP 3 HILOS GFCI O AFCI', 'Materiales: TOMACORRIENTE DOBLE 15 AMP 3 HILOS GFCI O AFCI
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 24.65, 33.28, 0, true),
  ('contraloria:2025:962', 'CG-0962', 'TOMACORRIENTE DOBLE 20 AMP 3 HILOS 250 V', 'Materiales: TOMACORRIENTE DOBLE 20 AMP 3 HILOS 250 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 10.65, 14.38, 0, true),
  ('contraloria:2025:963', 'CG-0963', 'TOMACORRIENTE DOBLE 20 AMP 3 HILOS GFCI O AFCI', 'Materiales: TOMACORRIENTE DOBLE 20 AMP 3 HILOS GFCI O AFCI
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 32.92, 44.44, 0, true),
  ('contraloria:2025:964', 'CG-0964', 'TOMACORRIENTE DOBLE 15 AMP 3 HILOS CON PUERTO USB 125 V', 'Materiales: TOMACORRIENTE DOBLE 15 AMP 3 HILOS CON PUERTO USB 125 V
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 42.39, 57.23, 0, true),
  ('contraloria:2025:965', 'CG-0965', 'TOMACORRIENTE DOBLE 20 AMP 3 HILOS CON PUERTO USB', 'Materiales: TOMACORRIENTE DOBLE 20 AMP 3 HILOS CON PUERTO USB
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 36.65, 49.48, 0, true),
  ('contraloria:2025:966', 'CG-0966', 'ROSETA DE PORCELANA', 'Materiales: ROSETA DE PORCELANA
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 10.55, 14.24, 0, true),
  ('contraloria:2025:967', 'CG-0967', 'ROSETA DE PLÁSTICO', 'Materiales: ROSETA DE PLÁSTICO
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 9.55, 12.89, 0, true),
  ('contraloria:2025:968', 'CG-0968', 'LUMINARIA DE ESTACIONAMIENTOS 250 W HID', 'Materiales: LUMINARIA DE ESTACIONAMIENTO 250 W HID
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Unidad', 'und', 232.55, 313.94, 0, true),
  ('contraloria:2025:969', 'CG-0969', 'LUMINARIA TIPO WALLPACK HID 50W', 'Materiales: LUMINARIA TIPO WALLPACK HID 50W
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 176.84, 238.73, 0, true),
  ('contraloria:2025:970', 'CG-0970', 'LUMINARIA TIPO WALLPACK HID 70W', 'Materiales: LUMINARIA TIPO WALLPACK HID 70W
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 232.84, 314.33, 0, true),
  ('contraloria:2025:971', 'CG-0971', 'LUMINARIA TIPO WALLPACK HID 100W', 'Materiales: LUMINARIA TIPO WALLPACK HID 100W
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 256.84, 346.73, 0, true),
  ('contraloria:2025:972', 'CG-0972', 'LUMINARIA FLUORESCENTE DE CIELO RASO DE 2 X 4 PIES LED', 'Materiales: LUMINARIA FLUORESCENTE DE CIELO RASO DE 2 X 4 PIES LED
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 79.16, 106.87, 0, true),
  ('contraloria:2025:973', 'CG-0973', 'LUMINARIA DE EMERGENCIA DOBLE OJO', 'Materiales: LUMINARIA DE EMERGENCIA DOBLE OJO
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 48.2, 65.07, 0, true),
  ('contraloria:2025:974', 'CG-0974', 'DETECTOR DE HUMO A BATERÍA', 'Materiales: DETECTOR DE HUMO A BATERÍA
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas especiales y seguridad', 'Unidad', 'und', 42.12, 56.86, 0, true),
  ('contraloria:2025:975', 'CG-0975', 'DETECTOR DE CALOR', 'Materiales: DETECTOR DE CALOR
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas especiales y seguridad', 'Unidad', 'und', 50.42, 68.07, 0, true),
  ('contraloria:2025:976', 'CG-0976', 'VARILLA A TIERRA 3/8 IN DE 5 PIES', 'Materiales: VARILLA A TIERRA 3/8 IN DE 5 PIES
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 27.94, 37.72, 0, true),
  ('contraloria:2025:977', 'CG-0977', 'VARILLA A TIERRA 1/2 IN DE 5 PIES', 'Materiales: VARILLA A TIERRA 1/2 IN DE 5 PIES
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 29.44, 39.74, 0, true),
  ('contraloria:2025:978', 'CG-0978', 'VARILLA A TIERRA 5/8 IN DE 8 PIES', 'Materiales: VARILLA A TIERRA 5/8 IN DE 8 PIES
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 41.05, 55.42, 0, true),
  ('contraloria:2025:979', 'CG-0979', 'GRAPA PARA VARILLA DE TIERRA 3/8 IN', 'Materiales: GRAPA PARA VARILLA DE TIERRA 3/8 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Unidad', 'und', 17.93, 24.21, 0, true),
  ('contraloria:2025:980', 'CG-0980', 'GRAPA PARA VARILLA DE TIERRA 1/2 IN', 'Materiales: GRAPA PARA VARILLA DE TIERRA 1/2 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Unidad', 'und', 23.64, 31.91, 0, true),
  ('contraloria:2025:981', 'CG-0981', 'GRAPA PARA VARILLA DE TIERRA 5/8 IN', 'Materiales: GRAPA PARA VARILLA DE TIERRA 5/8 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Unidad', 'und', 29.35, 39.62, 0, true),
  ('contraloria:2025:982', 'CG-0982', 'ABANICO INDUSTRIAL KDK 56 IN DE DÍAMETRO INCLUYE DIMMER', 'Materiales: ABANICO DE TECHO INDUSTRIAL 56 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 58.68, 79.22, 0, true),
  ('contraloria:2025:983', 'CG-0983', 'FOTOCELDA DE 3000 WATTS', 'Materiales: FOTOCELDA DE 3000 WATTS
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 31.54, 42.58, 0, true),
  ('contraloria:2025:984', 'CG-0984', 'TIMBRE DE 8 IN', 'Materiales: TIMBRE TIPO CAMPANA DE 10 IN
Mano de obra: CALIFICADO ELECTRICISTA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 45.83, 61.87, 0, true),
  ('contraloria:2025:985', 'CG-0985', 'SALIDAS ELÉCTRICAS', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 55.86, 75.41, 0, true),
  ('contraloria:2025:986', 'CG-0986', 'ABANICOS DE TECHO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Unidad', 'und', 88.1, 118.93, 0, true),
  ('contraloria:2025:987', 'CG-0987', 'TUBERÍA CABLEADA 12 AWG', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Metro lineal', 'm', 9.56, 12.91, 0, true),
  ('contraloria:2025:988', 'CG-0988', 'LIMPIEZA DE OXIDO CON DISOLVENTE SSPC-SP1', 'Materiales: DISOLVENTE RUST TREATMENT SOLUTION; BROCHA DE 4"; AGUARRAS
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 4.63, 6.25, 0, true),
  ('contraloria:2025:989', 'CG-0989', 'LIJADO MANUAL SSPC-SP2 PARA ESTRUCTURA DE ACERO', 'Materiales: CEPILLO DE ALAMBRE DE 10" MANGO MADERA
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 4.74, 6.4, 0, true),
  ('contraloria:2025:990', 'CG-0990', 'CHORRO COMERCIAL SSPC-SP3 (SANDBLASTING)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; HIDROLAVADORA 5000 PSI
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 1.84, 2.48, 0, true),
  ('contraloria:2025:991', 'CG-0991', 'PINTURA BASE P/METAL (1 MANO)', 'Materiales: PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC; BROCHA DE 4"; AGUARRAS
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 4.87, 6.57, 0, true),
  ('contraloria:2025:992', 'CG-0992', 'PINTURA ACABADO FINAL PARA ESTRUCTURA DE ACERO (2 MANOS)', 'Materiales: PINTURA PARA ESTRUCTURAS METÁLICAS; BROCHA DE 4"; AGUARRAS
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 9.61, 12.97, 0, true),
  ('contraloria:2025:993', 'CG-0993', 'REMOCIÓN DE PINTURA EPÓXICA', 'Materiales: AGUARRAS; PINTURA - PROTECTO SOLVENTE P/EPÓXICA; BROCHA DE 4"
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 5.02, 6.78, 0, true),
  ('contraloria:2025:994', 'CG-0994', 'PINTURA EPÓXICA GRADO ALIMENTICIO (3 MANOS)', 'Materiales: PINTURA - PINTUCO AT PLUS; AGUARRAS; BROCHA DE 4"
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 19.77, 26.69, 0, true),
  ('contraloria:2025:995', 'CG-0995', 'ACERO ESTRUCTURAL EN lb', 'Materiales: ACERO ESTRUCTURAL; SOLDADURA 6011 X 1/8"; SOLDADURA 7018; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC
Mano de obra: SOLDADOR DE 1RA - TALLER; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; CAMIÓN GRÚA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Libra', 'lb', 1.48, 2.0, 0, true),
  ('contraloria:2025:996', 'CG-0996', 'ACERO ESTRUCTURAL EN kg', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Kilogramo', 'kg', 3.26, 4.4, 0, true),
  ('contraloria:2025:997', 'CG-0997', 'SUMINISTRO E INSTALACIÓN DE PERFIL TUBO CUADRADO DE 4" X 4" X 1/8"', 'Materiales: TUBO CUADRADO 4X4X1/8; SOLDADURA 6011 X 1/8"; SOLDADURA 7018; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC
Mano de obra: SOLDADOR DE 1RA - TALLER; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; CAMIÓN GRÚA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 31.62, 42.69, 0, true),
  ('contraloria:2025:998', 'CG-0998', 'SUMINISTRO E INSTALACIÓN DE PERFIL TUBO CUADRADO DE 4" X 4" X 3/16"', 'Materiales: TUBO CUADRADO 4X4X3/16 IN; SOLDADURA 6011 X 1/8"; SOLDADURA 7018; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC
Mano de obra: SOLDADOR DE 1RA - TALLER; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; CAMIÓN GRÚA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 44.88, 60.59, 0, true),
  ('contraloria:2025:999', 'CG-0999', 'SUMINISTRO E INSTALACIÓN DE PERFIL TUBO CUADRADO DE 4" X 4" X 1/4"', 'Materiales: TUBO CUADRADO 4X4X1/4 IN; SOLDADURA 6011 X 1/8"; SOLDADURA 7018; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC
Mano de obra: SOLDADOR DE 1RA - TALLER; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; CAMIÓN GRÚA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 55.22, 74.55, 0, true),
  ('contraloria:2025:1000', 'CG-1000', 'SUMINISTRO E INSTALACIÓN DE PERFIL TUBO DE 6" X 6" X 3/16"', 'Materiales: TUBO CUADRADO 6X6X3/16 IN; SOLDADURA 6011 X 1/8"; SOLDADURA 7018; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC
Mano de obra: SOLDADOR DE 1RA - TALLER; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; CAMIÓN GRÚA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 74.16, 100.12, 0, true),
  ('contraloria:2025:1001', 'CG-1001', 'SUMINISTRO E INSTALACIÓN DE PERFIL TUBO DE 6" X 6" X 1/4"', 'Materiales: TUBO CUADRADO 6X6X1/4 IN; SOLDADURA 6011 X 1/8"; SOLDADURA 7018; PINTURA ANTICORROSIVO PRIMARIO TIPO CROMATO DE ZINC
Mano de obra: SOLDADOR DE 1RA - TALLER; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; CAMIÓN GRÚA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 90.29, 121.89, 0, true),
  ('contraloria:2025:1002', 'CG-1002', 'PERNO DE 1" EN "J" LONG 1 M', 'Materiales: ARANDELA 1"; ROSCA METALICA DE 1" PARA PERNO; PERNO DE 1"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 18.61, 25.12, 0, true),
  ('contraloria:2025:1003', 'CG-1003', 'PERNO DE 1/2" EN "J" LONG 1 M', 'Materiales: ARANDELA 1/2"; ROSCA METALICA DE 1/2" PARA PERNO; PERNOS 1/2" C.TUERCA Y ARANDELA
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 6.1, 8.23, 0, true),
  ('contraloria:2025:1004', 'CG-1004', 'PERNO DE 3/4" EN "J" LONG 1 M', 'Materiales: ARANDELA 3/4"; ROSCA METALICA DE 3/4" PARA PERNO; PERNO 3/4" CON ROSCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 11.24, 15.17, 0, true),
  ('contraloria:2025:1005', 'CG-1005', 'PERNO DE 3/4" EN "U" LONG 1 M', 'Materiales: ARANDELA 3/4"; ROSCA METALICA DE 3/4" PARA PERNO; PERNO 3/4" CON ROSCA
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 12.12, 16.36, 0, true),
  ('contraloria:2025:1006', 'CG-1006', 'PERNO DE 1/2" EN "U" LONG 1 M', 'Materiales: ARANDELA 1/2"; ROSCA METALICA DE 1/2" PARA PERNO; PERNOS 1/2" C.TUERCA Y ARANDELA
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 6.5, 8.77, 0, true),
  ('contraloria:2025:1007', 'CG-1007', 'PERNO DE 1" EN "U" LONG 1 M', 'Materiales: ARANDELA 1"; ROSCA METALICA DE 1" PARA PERNO; PERNO DE 1"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 21.56, 29.11, 0, true),
  ('contraloria:2025:1008', 'CG-1008', 'ANCLAJE 1/2" X 4 1/4" SRS ( INCLUYE TALADRO, EXTRACCIÓN DE POLVO Y LIMPIEZA)', 'Materiales: ANCLAJE MECÁNICO 1/2"X4 1/4" SRS (INCLUYE TUERCA Y ARANDELA)
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Unidad', 'und', 3.8, 5.13, 0, true),
  ('contraloria:2025:1009', 'CG-1009', 'ANCLAJE 3/4" X 6-1/4" SRS (INCLUYE TALADRO, EXTRACCIÓN DE POLVO Y LIMPIEZA)', 'Materiales: ANCLAJE MECÁNICO 3/4"X6-1/4" SRS (INCLUYE TUERCA Y ARANDELA)
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Unidad', 'und', 9.7, 13.09, 0, true),
  ('contraloria:2025:1010', 'CG-1010', 'ANCLAJE 3/8" X 3" SRS (INCLUYE TALADRO, EXTRACCIÓN DE POLVO Y LIMPIEZA)', 'Materiales: ANCLAJE MECÁNICO 3/8" X 3" SRS (INCLUYE TUERCA Y ARANDELA)
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Unidad', 'und', 2.43, 3.28, 0, true),
  ('contraloria:2025:1011', 'CG-1011', 'ANCLAJE 5/8" X 6" SRS (INCLUYE TALADRO, EXTRACCIÓN DE POLVO Y LIMPIEZA)', 'Materiales: ANCLAJE MECÁNICO 5/8" X 6" SRS (INCLUYE TUERCA Y ARANDELA)
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Unidad', 'und', 5.47, 7.38, 0, true),
  ('contraloria:2025:1012', 'CG-1012', 'ANCLAJE 5/8" X 7" SRS (INCLUYE TALADRO, EXTRACCIÓN DE POLVO Y LIMPIEZA)', 'Materiales: ANCLAJE MECÁNICO 5/8" X 7" SRS ( INCLUYE TUERCA Y ARANDELA).
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Unidad', 'und', 6.71, 9.06, 0, true),
  ('contraloria:2025:1013', 'CG-1013', 'ANCLAJE 5/8" X 4-1/2" SRS ( INCLUYE TALADRO, EXTRACCIÓN DE POLVO Y LIMPIEZA)', 'Materiales: ANCLAJE MECÁNICO 5/8" X 4-1/2" SRS (INCLUYE TUERCA Y ARANDELA)
Mano de obra: CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Unidad', 'und', 2.58, 3.48, 0, true),
  ('contraloria:2025:1014', 'CG-1014', 'PLACA LISA DE 3/8" 12"X12"', 'Materiales: PLACA DE ACERO LISA 3/8" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 36.3, 49.0, 0, true),
  ('contraloria:2025:1015', 'CG-1015', 'PLACA LISA DE 3/8"14"X14"', 'Materiales: PLACA DE ACERO LISA 3/8" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 44.3, 59.8, 0, true),
  ('contraloria:2025:1016', 'CG-1016', 'PLACA LISA DE 3/8" 16"X16"', 'Materiales: PLACA DE ACERO LISA 3/8" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 69.86, 94.31, 0, true),
  ('contraloria:2025:1017', 'CG-1017', 'PLACA LISA DE 1/2" 12"X12"', 'Materiales: PLACA DE ACERO LISA 1/2" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 39.32, 53.08, 0, true),
  ('contraloria:2025:1018', 'CG-1018', 'PLACA LISA DE 1/2" 14"X14"', 'Materiales: PLACA DE ACERO LISA 1/2" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 48.11, 64.95, 0, true),
  ('contraloria:2025:1019', 'CG-1019', 'PLACA LISA DE 1/2" 16"X16"', 'Materiales: PLACA DE ACERO LISA 1/2" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 57.52, 77.65, 0, true),
  ('contraloria:2025:1020', 'CG-1020', 'PLACA LISA DE 3/4" 12"X12"', 'Materiales: PLACA DE ACERO LISA 3/4" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 50.18, 67.74, 0, true),
  ('contraloria:2025:1021', 'CG-1021', 'PLACA LISA DE 3/4" 14"X14"', 'Materiales: PLACA DE ACERO LISA 3/4" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 62.78, 84.75, 0, true),
  ('contraloria:2025:1022', 'CG-1022', 'PLACA LISA DE 3/4" 16"X16"', 'Materiales: PLACA DE ACERO LISA 3/4" X 4'' X 8''; ELECTRODO UTP 82AS (CORTE)
Mano de obra: SOLDADOR DE 1RA - TALLER
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 77.42, 104.52, 0, true),
  ('contraloria:2025:1023', 'CG-1023', 'MORTERO DE NIVELACIÓN DE ESPESOR 0.05 m', 'Materiales: MORTERO DE NIVELACIÓN (25 KG)
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 63.12, 85.21, 0, true),
  ('contraloria:2025:1024', 'CG-1024', 'CORTE DE PERFIL ESTRUCTURAL', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; EQUIPO OXICORTE
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 13.08, 17.66, 0, true),
  ('contraloria:2025:1025', 'CG-1025', 'PLACA BASE 12" X 12" X 3/8" + 4 PERNOS DE 1/2" + MORTERO DE NIVELACIÓN + PINTURA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 67.53, 91.17, 0, true),
  ('contraloria:2025:1026', 'CG-1026', 'PLACA BASE DE 14" X 14" X 3/8" + 4 PERNOS DE 1/2" + MORTERO DE NIVELACIÓN + PINTURA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 77.98, 105.27, 0, true),
  ('contraloria:2025:1027', 'CG-1027', 'PLACA BASE DE 16" X 16" X 3/8" + 4 PERNOS DE 1/2" + MORTERO DE NIVELACIÓN + PINTURA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 106.36, 143.59, 0, true),
  ('contraloria:2025:1028', 'CG-1028', 'PLACA BASE DE 12" X 12" X 1/2" + 4 PERNOS DE 3/4" + MORTERO DE NIVELACIÓN + PINTURA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 91.86, 124.01, 0, true),
  ('contraloria:2025:1029', 'CG-1029', 'PLACA BASE DE 14" X 14" X 1/2" + 4 PERNOS DE 3/4" + MORTERO DE NIVELACIÓN + PINTURA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 102.37, 138.2, 0, true),
  ('contraloria:2025:1030', 'CG-1030', 'PLACA BASE DE 16" X 16" X 1/2" + 4 PERNOS DE 3/4" + MORTERO DE NIVELACIÓN + PINTURA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 114.6, 154.71, 0, true),
  ('contraloria:2025:1031', 'CG-1031', 'PLACA BASE DE 12" X 12" X 3/4" + 4 PERNOS DE 1" + MORTERO DE NIVELACIÓN + PINTURA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 131.51, 177.54, 0, true),
  ('contraloria:2025:1032', 'CG-1032', 'PLACA BASE DE 14" X 14" X 3/4" + 4 PERNOS DE 1" + MORTERO DE NIVELACIÓN + PINTURA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 146.53, 197.82, 0, true),
  ('contraloria:2025:1033', 'CG-1033', 'PUERTA DE MADERA PARA INTERIOR HDF GALIC 3X7 PIES', 'Materiales: PUERTA DE MADERA PARA INTERIOR HDF 3X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 116.65, 157.48, 0, true),
  ('contraloria:2025:1034', 'CG-1034', 'PUERTA DE MADERA PARA INTERIOR HDF 4 PANELES 3X7 PIES', 'Materiales: PUERTA DE MADERA PARA INTERIOR 4 PANELES 3X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 116.65, 157.48, 0, true),
  ('contraloria:2025:1035', 'CG-1035', 'PUERTA DE MADERA PARA INTERIOR PLYWOOD OKUME 3X7 PIES', 'Materiales: PUERTA DE MADERA PARA INTERIOR PLYWOOD OKUME 3X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 110.65, 149.38, 0, true),
  ('contraloria:2025:1036', 'CG-1036', 'PUERTA DE MADERA PARA INTERIOR HDF PLEGABLE 3X7 PIES', 'Materiales: PUERTA DE MADERA PARA INTERIOR HDF PLEGABLE DE 3X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 141.61, 191.17, 0, true),
  ('contraloria:2025:1037', 'CG-1037', 'PUERTA DE MADERA PARA INTERIOR HDF 2X7 PIES', 'Materiales: PUERTA DE MADERA PARA INTERIOR HDF 2X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 116.65, 157.48, 0, true),
  ('contraloria:2025:1038', 'CG-1038', 'SUMINISTRO E INSTALACIÓN DE PUERTA DE PLYWOOD OKUME PARA INTERIOR 2X7 PIES', 'Materiales: PUERTA DE MADERA INTERIOR OKUME 2X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 109.65, 148.03, 0, true),
  ('contraloria:2025:1039', 'CG-1039', 'PUERTA DE PUERTA DE MADERA SÓLIDA DE PINO CON NUDOS PARA INTERIOR 3X7 PIES', 'Materiales: PUERTA DE MADERA SÓLIDA DE PINO CON NUDOS 3X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 139.65, 188.53, 0, true),
  ('contraloria:2025:1040', 'CG-1040', 'PUERTA DE PUERTA DE MADERA SÓLIDA DE PINO CON NUDOS PARA INTERIOR 3X7 PIES (FRANCESA, MEDÍA LUNA O MEDIA FRANCESA)', 'Materiales: PUERTA DE MADERA SÓLIDA DE PINO CON NUDOS PARA INTERIOR FRANCESA, MEDIA FRANCESA O CON MEDIA LUNA 3X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 196.65, 265.48, 0, true),
  ('contraloria:2025:1041', 'CG-1041', 'PUERTA DE PUERTA DE MADERA SÓLIDA DE PINO CON NUDOS PARA INTERIOR 2X7 PIES', 'Materiales: PUERTA DE MADERA SÓLIDA DE PINO CON NUDOS PARA INTERIOR DE 2X7 PIES; MARCOS DE MADERA PARA PUERTA 9 CM X 3.5 CM; CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 131.65, 177.73, 0, true),
  ('contraloria:2025:1042', 'CG-1042', 'PUERTA CORREDIZA DE UPVC DE 2.20 M X 2.0 M', 'Materiales: PUERTA CORREDIZA DE UPVC DE 2.2 M X 2.0 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 462.27, 624.06, 0, true),
  ('contraloria:2025:1043', 'CG-1043', 'PUERTA METÁLICA CON BORDE DE MADERA 3X7 PIES', 'Materiales: PUERTA DE METAL CON BASTIDOR DE MADERA 3X7 PIES; MARCO DE METAL PARA PUERTA 3X7 PIES CALIBRE 20; CERRADURA DE GATILLO CON TIRADOR ACABADO LATÓN ANTIGUO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 230.72, 311.47, 0, true),
  ('contraloria:2025:1044', 'CG-1044', 'PUERTA METÁLICA CON BORDE DE MADERA 3X7 PIES Y ACABADO', 'Materiales: PUERTA DE METAL CON BORDES DE MADERA 3X7 PIES Y ACABADO; MARCO DE METAL PARA PUERTA 3X7 PIES CALIBRE 20; CERRADURA DE GATILLO CON TIRADOR ACABADO LATÓN ANTIGUO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 230.7, 311.44, 0, true),
  ('contraloria:2025:1045', 'CG-1045', 'PUERTA METÁLICA CON BASTIDOR DE MADERA 3X7 PIES CON VITRAL EN MEDIA LUNA', 'Materiales: PUERTA DE METAL CON BASTIDOR DE MADERA 3X7 PIES CON VITRAL DE MEDIA LUNA; MARCO DE METAL PARA PUERTA 3X7 PIES CALIBRE 20; CERRADURA DE GATILLO CON TIRADOR ACABADO LATÓN ANTIGUO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 250.72, 338.47, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:1046', 'CG-1046', 'PUERTA METÁLICA CON BASTIDOR DE MADERA 3X7 PIES Y 9 VIDRIOS ESTILO FRANCESA', 'Materiales: PUERTA DE METAL CON BASTIDOR DE MADERA 9 VIDRIOS ESTILO FRANCESA 3X7 PIES; MARCO DE METAL PARA PUERTA 3X7 PIES CALIBRE 20; CERRADURA DE GATILLO CON TIRADOR ACABADO LATÓN ANTIGUO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 280.72, 378.97, 0, true),
  ('contraloria:2025:1047', 'CG-1047', 'PUERTA METÁLICA CON BASTIDOR DE MADERA 3X7 PIES Y 15 VIDRIOS ESTILO FRANCESA', 'Materiales: PUERTA DE METAL CON BASTIDOR DE MADERA 15 VIDRIOS ESTILO FRANCESA 3X7 PIES; MARCO DE METAL PARA PUERTA 3X7 PIES CALIBRE 20; CERRADURA DE GATILLO CON TIRADOR ACABADO LATÓN ANTIGUO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 340.72, 459.97, 0, true),
  ('contraloria:2025:1048', 'CG-1048', 'PUERTA METÁLICA CON BASTIDOR DE MADERA 3X7 PIES Y VIDRIO MAS HIERRO OVALADO', 'Materiales: PUERTA DE METAL CON BASTIDOR DE MADERA 3X7 PIES Y VIDRIO MAS HIERRO OVALADO; MARCO DE METAL PARA PUERTA 3X7 PIES CALIBRE 20; CERRADURA DE GATILLO CON TIRADOR ACABADO LATÓN ANTIGUO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 340.72, 459.97, 0, true),
  ('contraloria:2025:1049', 'CG-1049', 'PUERTA METÁLICA CON BASTIDOR DE MADERA 3X7 PIES Y VITRAL RECTANGULAR', 'Materiales: PUERTA DE METAL CON BASTIDOR DE MADERA 3X7 PIES Y VITRAL RECTANGULAR; MARCO DE METAL PARA PUERTA 3X7 PIES CALIBRE 20; CERRADURA DE GATILLO CON TIRADOR ACABADO LATÓN ANTIGUO; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 340.72, 459.97, 0, true),
  ('contraloria:2025:1050', 'CG-1050', 'PUERTA MULTIPUNTOS GALVANIZADA SECURE TIPO HOPSA', 'Materiales: PUERTA MULTIPUNTOS GALVANIZADA SECURE TIPO HOPSA
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 393.15, 530.75, 0, true),
  ('contraloria:2025:1051', 'CG-1051', 'PUERTA DE SEGURIDAD LISA CON CERRADURA TIPO B SECURE MAX TIPO HOPSA', 'Materiales: PUERTA DE SEGURIDAD LISA CON CERRADURA TIPO B SECURE MAX TIPO HOPSA
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 693.15, 935.75, 0, true),
  ('contraloria:2025:1052', 'CG-1052', 'PUERTA DE SEGURIDAD 6 PANELES CON CERRADURA TIPO B SECURE MAX TIPO HOPSA', 'Materiales: PUERTA DE SEGURIDAD 6 PANELES CON CERRADURA TIPO B SECURE MAX TIPO HOPSA
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 773.15, 1043.75, 0, true),
  ('contraloria:2025:1053', 'CG-1053', 'PUERTA DE SEGURIDAD CON CERRADURA PLATEADA SECUREMAX TIPO HOPSA', 'Materiales: PUERTA DE SEGURIDAD CON CERRADURA PLATEADA SECUREMAX TIPO HOPSA
Mano de obra: CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 793.15, 1070.75, 0, true),
  ('contraloria:2025:1054', 'CG-1054', 'PUERTA SIMPLE DE 1.16 X 1.80 M DE ACERO DE 1/2 IN X 1/2 IN CON MALLA EXPANDIDA CAL. 13 COMPLETA', 'Materiales: SOLDADURA 6011 X 1/8"; TUBO DE ACERO DE 1" X 1" X 1/8"; BARRA DE ACERO CUADRADA LISA DE 1/2 IN de 20 PIES; ACERO - ÁNGULO DE ACERO DE 1 1/4 IN X 6 M CON 3/16 IN DE ESPESOR; ACERO DE REFUERZO; MALLA EXPANDIDA DE 3/4 IN CALIBRE 16 4X8 PIES; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; CERRDADURA DE METAL PARA EXTERIORES; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 362.92, 489.94, 0, true),
  ('contraloria:2025:1055', 'CG-1055', 'PUERTA DE ACERO SIMPLE CAL. 16 (INCLUYE MARCOS DE 1-1/4 IN X 1-1/4 IN X 1/8 IN, CERRADURA, BISAGRAS, ANCLAJES Y PINTURA)', 'Materiales: SOLDADURA 6011 X 1/8"; TUBO DE ACERO DE 1" X 1" X 1/8"; ACERO - ÁNGULO DE ACERO DE 1 1/4 IN X 6 M CON 3/16 IN DE ESPESOR; ACERO DE REFUERZO; BISAGRA DE 3 1/2 IN C 3 1/2 IN X 2.2 MM; CERRDADURA DE METAL PARA EXTERIORES; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Unidad', 'und', 360.93, 487.26, 0, true),
  ('contraloria:2025:1056', 'CG-1056', 'DESMONTE DE PUERTA DE MADERA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 12.47, 16.83, 0, true),
  ('contraloria:2025:1057', 'CG-1057', 'DESMONTE DE PUERTAS DE METAL CON ANCLAJE DE TORNILLO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 20.28, 27.38, 0, true),
  ('contraloria:2025:1058', 'CG-1058', 'DESMONTE DE PUERTA DE SEGURIDAD O METALICA FUNDIDA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 54.07, 72.99, 0, true),
  ('contraloria:2025:1059', 'CG-1059', 'DESMONTE DE PUERTA DOBLE DE MADERA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 20.28, 27.38, 0, true),
  ('contraloria:2025:1060', 'CG-1060', 'DESMONTE DE PUERTA DOBLE DE METAL CON ANCLAJE DE TORNILLO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 32.44, 43.79, 0, true),
  ('contraloria:2025:1061', 'CG-1061', 'DESMONTE DE PUERTA DOBLE DE SEGURIDAD O METALICA FUNDIDA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 81.11, 109.5, 0, true),
  ('contraloria:2025:1062', 'CG-1062', 'CAMBIO DE CERRADURA SIMPLE', 'Materiales: CERRADURA DE MANIJA DE LLAVE SATIN NIQUEL
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 20.31, 27.42, 0, true),
  ('contraloria:2025:1063', 'CG-1063', 'CIERRAPUERTA ARTICULADO 45 KGS', 'Materiales: CIERRAPUERTAS ARTICULADO DE 25 A 45 KGS
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 28.0, 37.8, 0, true),
  ('contraloria:2025:1064', 'CG-1064', 'CIERRAPUERTA ARTICULADO 65 KGS', 'Materiales: CIERRAPUERTAS ARTICULADO DE 45 A 65 KGS
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 29.18, 39.39, 0, true),
  ('contraloria:2025:1065', 'CG-1065', 'CIERRAPUERTA ARTICULADO 85 KGS', 'Materiales: CIERRAPUERTAS ARTICULADO DE 65 A 85 KGS
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 28.93, 39.06, 0, true),
  ('contraloria:2025:1066', 'CG-1066', 'CIERRAPUERTA ARTICULADO 120 KGS', 'Materiales: CIERRAPUERTAS ARTICULADO DE 85 A 120 KGS
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 47.09, 63.57, 0, true),
  ('contraloria:2025:1067', 'CG-1067', 'CIERRAPUERTA ARTICULADO 150 KGS', 'Materiales: CIERRAPUERTAS ARTICULADO DE 15 A 150 KGS
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 62.91, 84.93, 0, true),
  ('contraloria:2025:1068', 'CG-1068', 'BARRA ANTIPÁNICO TIPO FULLPUSH', 'Materiales: BARRA ANTIPÁNICO DE 35 IN TIPO FULLPUSH CON CERRADURA Y MANIJA
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 76.86, 103.76, 0, true),
  ('contraloria:2025:1069', 'CG-1069', 'BARRA ANTIPÁNICO DOBLE TIPO FULLPUSH', 'Materiales: BARRA ANTIPÁNICO DOBLE DE 35 IN TIPO FULLPUSH CON CERRADURA Y MANIJA
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 81.6, 110.16, 0, true),
  ('contraloria:2025:1070', 'CG-1070', 'BARRA ANTIPÁNICO TIPO EUROPEA DE PALANCA', 'Materiales: BARRA ANTIPÁNICO DE 42 IN TIPO EUROPEA DE PALANCA CON CERRADURA Y MANIJA
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 67.55, 91.19, 0, true),
  ('contraloria:2025:1071', 'CG-1071', 'BARRA ANTIPÁNICO DOBLE TIPO EUROPEA DE PALANCA', 'Materiales: BARRA ANTIPÁNICO DOBLE DE 42 IN TIPO EUROPEA DE PALANCA CON CERRADURA Y MANIJA
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 67.55, 91.19, 0, true),
  ('contraloria:2025:1072', 'CG-1072', 'PUERTAS ENRROLLABLES DE 1900 X 3000 MODEL 2000 W MOTOR COMPLETAS AUTOMÁTICAS', 'Materiales: PUERTAS ENRROLLABLES DE 1900 X 3000 MODEL 2000 W MOTOR
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 2231.27, 3012.21, 0, true),
  ('contraloria:2025:1073', 'CG-1073', 'PUERTAS ENRROLLABLES DE 4000 X 4000 MODEL 2000 W MOTOR COMPLETAS AUTOMÁTICAS', 'Materiales: PUERTAS ENRROLLABLES DE 4.0 M X 4.0 M (CON MOTOR Y ACCESORIOS)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 3831.27, 5172.21, 0, true),
  ('contraloria:2025:1074', 'CG-1074', 'VENTANA DE ALUMINIO TIPO FRANCESA CORREDIZA DE 0.60 X 0.60', 'Materiales: VENTANA DE ALUMINIO TIPO FRANCESA CORREDIZA DE 0.60 X 0.60 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 42.18, 56.94, 0, true),
  ('contraloria:2025:1075', 'CG-1075', 'VENTANA DE ALUMINIO TIPO FRANCESA CORREDIZA DE 1.20 X 1.20', 'Materiales: VENTANA DE ALUMINIO TIPO FRANCESA CORREDIZA DE 1.20 X 1.20 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 73.41, 99.1, 0, true),
  ('contraloria:2025:1076', 'CG-1076', 'VENTANA DE ALUMINIO TIPO FRANCESA CORREDIZA DE 1.20 X 1.50', 'Materiales: VENTANA DE ALUMINIO TIPO FRANCESA CORREDIZA DE 1.20 X 1.50 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 128.81, 173.89, 0, true),
  ('contraloria:2025:1077', 'CG-1077', 'VENTANA DE ALUMINIO TIPO FRANCESA CORREDIZA DE 1.20 X 1.80', 'Materiales: VENTANA DE ALUMINIO TIPO FRANCESA CORREDIZA de 1.20 x 1.80 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 152.88, 206.39, 0, true),
  ('contraloria:2025:1078', 'CG-1078', 'VENTANA ARCO UPVC PARA VENTANA DE 0.45 M X 0.90 M', 'Materiales: ARCO UPVC PARA VENTANA DE 0.45 M X 0.90 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 72.08, 97.31, 0, true),
  ('contraloria:2025:1079', 'CG-1079', 'VENTANA ARCO UPVC PARA VENTANA DE 0.45 M X 1.00 M', 'Materiales: ARCO UPVC PARA VENTANA DE 0.45 M X 1.00 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 78.45, 105.91, 0, true),
  ('contraloria:2025:1080', 'CG-1080', 'VENTANA ARCO UPVC PARA VENTANA DE 0.45 M X 1.20 M', 'Materiales: ARCO UPVC PARA VENTANA DE 0.45 M X 1.20 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 85.47, 115.38, 0, true),
  ('contraloria:2025:1081', 'CG-1081', 'VENTANA ARCO UPVC PARA VENTANA DE 0.45 M X 1.50 M', 'Materiales: ARCO UPVC PARA VENTANA DE 0.45 M X 1.50 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 85.49, 115.41, 0, true),
  ('contraloria:2025:1082', 'CG-1082', 'VENTANA ARCO UPVC PARA VENTANA DE 0.45 M X 1.80 M', 'Materiales: ARCO UPVC PARA VENTANA DE 0.45 M X 1.80 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 89.53, 120.87, 0, true),
  ('contraloria:2025:1083', 'CG-1083', 'VENTANA UPVC FRANCESA DE 0.60 M X 0.60 M', 'Materiales: VENTANA UPVC FRANCESA DE 0.60 M X 0.60 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 48.09, 64.92, 0, true),
  ('contraloria:2025:1084', 'CG-1084', 'VENTANA UPVC FRANCESA DE 0.90 M X 0.90 M', 'Materiales: VENTANA UPVC FRANCESA DE 0.90 M X 0.90 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 61.19, 82.61, 0, true),
  ('contraloria:2025:1085', 'CG-1085', 'VENTANA UPVC FRANCESA DE 1.00 M X 0.80 M', 'Materiales: VENTANA UPVC FRANCESA DE 1.00 M X 0.80 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 78.55, 106.04, 0, true),
  ('contraloria:2025:1086', 'CG-1086', 'VENTANA UPVC FRANCESA DE 1.00 M X 1.00 M', 'Materiales: VENTANA UPVC FRANCESA DE 1.00 M X 1.00 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 68.59, 92.6, 0, true),
  ('contraloria:2025:1087', 'CG-1087', 'VENTANA UPVC FRANCESA DE 1.20 M X 1.00 M', 'Materiales: VENTANA UPVC FRANCESA DE 1.20 M X 1.00 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 89.12, 120.31, 0, true),
  ('contraloria:2025:1088', 'CG-1088', 'VENTANA UPVC FRANCESA DE 1.20 M X 1.20 M', 'Materiales: VENTANA UPVC FRANCESA DE 1.20 M X 1.20 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 83.68, 112.97, 0, true),
  ('contraloria:2025:1089', 'CG-1089', 'VENTANA UPVC FRANCESA DE 1.20 M X 1.50 M', 'Materiales: VENTANA UPVC FRANCESA DE 1.20 M X 1.50 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 105.73, 142.74, 0, true),
  ('contraloria:2025:1090', 'CG-1090', 'VENTANA UPVC FRANCESA DE 1.20 M X 1.80 M', 'Materiales: VENTANA UPVC FRANCESA DE 1.20 M X 1.80 M; TORNILLO DE 1 1/4 IN CABEZA PLANA CALIBRE Nº 10; TACO DE 3/8 IN X 2 IN DE PLÁSTICO; ESPUMA DE PULIURETANO PARA VENTANA 750 mL (100m)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 140.79, 190.07, 0, true),
  ('contraloria:2025:1091', 'CG-1091', 'VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 0.60 M X 0.60 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 0.60 M X 0.60 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 78.88, 106.49, 0, true),
  ('contraloria:2025:1092', 'CG-1092', 'VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 0.75 M X 0.90 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 0.75 M X 0.90 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 66.41, 89.65, 0, true),
  ('contraloria:2025:1093', 'CG-1093', 'VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 0.90 M X 0.90 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 0.90 M X 0.90 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 73.1, 98.68, 0, true),
  ('contraloria:2025:1094', 'CG-1094', 'VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 1.00 M X 1.00 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 1.00 M X 1.00 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 77.79, 105.02, 0, true),
  ('contraloria:2025:1095', 'CG-1095', 'VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 1.20 M X 0.90 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 1.20 M X 0.90 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 84.05, 113.47, 0, true),
  ('contraloria:2025:1096', 'CG-1096', 'VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 1.20 M X 1.00 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 1 PAÑO 1.20 M X 1.00 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 86.17, 116.33, 0, true),
  ('contraloria:2025:1097', 'CG-1097', 'VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 0.75 M X 1.20 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 0.75 M X 1.20 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 126.32, 170.53, 0, true),
  ('contraloria:2025:1098', 'CG-1098', 'VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 1.0 M X 1.20 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 1.0 M X 1.20 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 142.76, 192.73, 0, true),
  ('contraloria:2025:1099', 'CG-1099', 'VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 1.20 M X 1.20 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 1.20 M X 1.20 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 158.36, 213.79, 0, true),
  ('contraloria:2025:1100', 'CG-1100', 'VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 1.20 M X 1.50 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 1.20 M X 1.50 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 173.42, 234.12, 0, true),
  ('contraloria:2025:1101', 'CG-1101', 'VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 1.20 M X 1.80 M', 'Materiales: VENTANA DE CELOSÍA DE ALUMINIO 2 PAÑOS 1.20 M X 1.80 M; VIDRIOS PARA VENTANA DE CELOSÍA; OPERADOR DE VENTANA MARIPOSA; CEMENTO GRIS TIPO I; ARENA (INCLUYE ACARREO)
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Unidad', 'und', 182.66, 246.59, 0, true),
  ('contraloria:2025:1102', 'CG-1102', 'VERJA DE METAL CON BARRAS CUADRADA DE 1/2 IN', 'Materiales: BARRA DE ACERO CUADRADA LISA DE 1/2 IN de 20 PIES; ACERO DE REFUERZO; SOLDADURA 6011 X 1/8"; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro cuadrado', 'm²', 88.45, 119.41, 0, true),
  ('contraloria:2025:1103', 'CG-1103', 'VERJA DE METAL CON TUBOS CUADRADOS DE 1 IN X 1 IN', 'Materiales: TUBO DE ACERO DE 1" X 1" X 1/8"; ACERO DE REFUERZO; SOLDADURA 6011 X 1/8"; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: SOLDADOR DE 1RA - CAMPO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro cuadrado', 'm²', 103.58, 139.83, 0, true),
  ('contraloria:2025:1104', 'CG-1104', 'VIGADUCTO TIPO A, ANCHO 0.20 X ALTO 0.39 M Y 2 TUBOS 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 52.59, 71.0, 0, true),
  ('contraloria:2025:1105', 'CG-1105', 'VIGADUCTO TIPO B, ANCHO 0.20 X ALTO 0.58 M Y 3 TUBOS 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 70.5, 95.17, 0, true),
  ('contraloria:2025:1106', 'CG-1106', 'VIGADUCTO TIPO C, ANCHO 0.39 X ALTO 0.39 M Y 4 TUBOS 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 84.57, 114.17, 0, true),
  ('contraloria:2025:1107', 'CG-1107', 'VIGADUCTO TIPO D, ANCHO 0.58 X ALTO 0.39 M Y 6 TUBOS 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 117.98, 159.27, 0, true),
  ('contraloria:2025:1108', 'CG-1108', 'VIGADUCTO TIPO E, ANCHO 0.39 X ALTO 0.58 M Y 6 TUBOS 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 118.54, 160.03, 0, true),
  ('contraloria:2025:1109', 'CG-1109', 'VIGADUCTO TIPO F, ANCHO 0.58 X ALTO 0.58 M Y 9 TUBOS 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 161.97, 218.66, 0, true),
  ('contraloria:2025:1110', 'CG-1110', 'VIGADUCTO TIPO G, ANCHO 0.77 X ALTO 0.58 M Y 9 TUBO 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 187.63, 253.3, 0, true),
  ('contraloria:2025:1111', 'CG-1111', 'VIGADUCTO TIPO H, ANCHO 0.20 X ALTO 0.20 M Y 1 TUBO 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 33.17, 44.78, 0, true),
  ('contraloria:2025:1112', 'CG-1112', 'VIGADUCTO TIPO I, ANCHO 0.77 X ALTO 0.77 M Y 12 TUBO 4 IN 4000 PSI', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Climatización y ventilación', 'Metro lineal', 'm', 253.67, 342.45, 0, true),
  ('contraloria:2025:1113', 'CG-1113', 'NS-4-12 CÁMARA DE INSPECCIÓN ELÉCTRICA TIPO C PARA CABLES DE BAJA TENSIÓN', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Plomería, sanitaria y drenajes', 'Unidad', 'und', 1434.06, 1935.98, 0, true),
  ('contraloria:2025:1114', 'CG-1114', 'NS-4-13 CÁMARA DE PASO ELÉCTRICA TIPO C - B1', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 1982.57, 2676.47, 0, true),
  ('contraloria:2025:1115', 'CG-1115', 'NS-4-14 CÁMARA DE PASO ELÉCTRICA BT TIPO C - B1', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2692.64, 3635.06, 0, true),
  ('contraloria:2025:1116', 'CG-1116', 'NS-4-15 CÁMARA DE PASO ELÉCTRICA BT-MT TIPO C - 1CP', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2734.23, 3691.21, 0, true),
  ('contraloria:2025:1117', 'CG-1117', 'NS-4-16 CÁMARA DE EMPALME ELÉCTRICA MT TIPO A', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 6337.77, 8555.99, 0, true),
  ('contraloria:2025:1118', 'CG-1118', 'NS-4-17 CÁMARA DE EMPALME ELÉCTRICA MT TIPO A1', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 5886.95, 7947.38, 0, true),
  ('contraloria:2025:1119', 'CG-1119', 'NS-4-18 CÁMARA DE EMPALME ELÉCTRICA MT TIPO T', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 7432.86, 10034.36, 0, true),
  ('contraloria:2025:1120', 'CG-1120', 'NS-4-19 CÁMARA DE EMPALME ELÉCTRICA MT TIPO V1 - 22', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 6755.1, 9119.39, 0, true),
  ('contraloria:2025:1121', 'CG-1121', 'NS-4-20 BASE DE HORMIGÓN Y CÁMARA DE PASO PARA TRANSFORMADORES', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 2327.36, 3141.94, 0, true),
  ('contraloria:2025:1122', 'CG-1122', 'NS-4-22 BASE DE HORMIGÓN Y CÁMARA DE PASO PARA TRANSFORMADORES TRIFÁSICOS', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 1938.07, 2616.39, 0, true),
  ('contraloria:2025:1123', 'CG-1123', 'NS-4-23 CÁMARA TIPO C-1D PARA TRANSFORMADORES SUMERGIBLES', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: No registra mano de obra directa separada.
Equipo/herramienta: No registra equipo o herramienta directa separada.
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Electricidad', 'Unidad', 'und', 9047.14, 12213.64, 0, true),
  ('contraloria:2025:1124', 'CG-1124', 'FECE - EXCAVACIÓN MECANIZADA SOBRE TERRENO DE ROCA, PROFUNDA MÁXIMA 4.00 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CAPATAZ (SALARIO MAS ALTO + 14%); BANDERILLERO; CHOFER DE CAMIONES PESADOS; OPERADOR DE EQUIPO PESADO DE 1RA
Equipo/herramienta: HERRAMIENTAS EN GENERAL; RETROEXCAVADORA CON MARTILLO (Incluye Combustible); CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 16.28, 21.98, 0, true),
  ('contraloria:2025:1125', 'CG-1125', 'FECE - EXCAVACIÓN MANUAL EN SUELOS DE ARCILLA BLANDA, HASTA UNA PROFUNDIDAD MÁX. DE 1.60 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 33.89, 45.75, 0, true),
  ('contraloria:2025:1126', 'CG-1126', 'FECE - EXCAVACIÓN MANUAL EN TOSCA SUAVE, HASTA PROFUNDIDAD MAX. = 1.60M Y ANCHO MN = 0.30 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 31.96, 43.15, 0, true),
  ('contraloria:2025:1127', 'CG-1127', 'FECE - EXCAVACIÓN MANUAL EN ROCA CON MEDIOS MANUALES', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPRESOR PORTATIL DIESEL + 1 MARTILLO NEUMÁTICO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 38.22, 51.6, 0, true),
  ('contraloria:2025:1128', 'CG-1128', 'FECE - RELLENO, COMPACTACIÓN Y NIVELACIÓN, DE FORMA MANUAL, CON MATERIAL PROPIO DE LA EXCAVACIÓN', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 14.43, 19.48, 0, true),
  ('contraloria:2025:1129', 'CG-1129', 'FECE - COMPACTACIÓN DE MATERIAL SELECTO DE FORMA MANUAL', 'Materiales: AGREGADO PETREO - MATERIAL SELECTO
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cúbico', 'm³', 29.8, 40.23, 0, true),
  ('contraloria:2025:1130', 'CG-1130', 'FECE - DEMOLICIÓN Y ACARREO DE TECHOS DE LÁMINAS DE ACERO O FIBROCEMENTO CON ESTR. METÁLICA', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 3.85, 5.2, 0, true),
  ('contraloria:2025:1131', 'CG-1131', 'FECE - DEMOLICIÓN DE PAREDES DE BLOQUES DE CONCRETO CON ESPESOR DE 0.15 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cuadrado', 'm²', 5.68, 7.67, 0, true),
  ('contraloria:2025:1132', 'CG-1132', 'FECE - DEMOLICIÓN DE VIGAS Y COLUMNAS DE CONCRETO', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Preliminares, demolición y excavación', 'Metro cúbico', 'm³', 26.21, 35.38, 0, true),
  ('contraloria:2025:1133', 'CG-1133', 'FECE - DEMOLICIÓN DE ELEMENTOS DE MADERA (PISOS, TABIQUES, PAREDES Y TECHOS)', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 4.82, 6.51, 0, true),
  ('contraloria:2025:1134', 'CG-1134', 'FECE - DEMOLICIÓN DE PAVIMENTO DE HORMIGÓN HASTA UN ESPESOR MAX. DE 0.20 M', 'Materiales: No requiere materiales directos; predomina mano de obra/equipo.
Mano de obra: AYUDANTE GENERAL; OPERADOR DE MÁQUINA MANUAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; COMPRESOR PORTATIL DIESEL + 1 MARTILLO NEUMÁTICO; CAMIÓN VOLQUETE DE 15 m3 POR VIAJES HASTA DISTANCIAS DE 35 km (incluye conductor + combustible)
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 10.21, 13.78, 0, true),
  ('contraloria:2025:1135', 'CG-1135', 'FECE - MEDIA CAÑA DE 12" SOBRE SUELO', 'Materiales: CEMENTO GRIS TIPO I; ARENA; CUNETA DE MEDIA CAÑA PREFABRICAD 12" x 1.1 M
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Metro lineal', 'm', 26.24, 35.42, 0, true),
  ('contraloria:2025:1136', 'CG-1136', 'FECE - MEDIA CAÑA DE 14" SOBRE SUELO', 'Materiales: CEMENTO GRIS TIPO I; ARENA; CUNETA DE MEDIA CAÑA PREFABRICADA 14" X 1.1 M
Mano de obra: AYUDANTE GENERAL; CALIFICADO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Metro lineal', 'm', 33.18, 44.79, 0, true),
  ('contraloria:2025:1137', 'CG-1137', 'FECE - TUBOS DE HORMIGÓN DE 18" DE DIÁMETRO', 'Materiales: CEMENTO GRIS TIPO I; ARENA; ARENON (PARA LECHO DE TUBOS); AGREGADO PETREO - MATERIAL SELECTO; TUBO DE HORMIGÓN DE 18 IN DE DIÁMETRO X 1.2 M
Mano de obra: TUBERO DE 1ra; CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2da; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); PLANCHA COMPACTADORA; CAMIÓN PLATAFORMA (Incluye Combustible); BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 98.2, 132.57, 0, true),
  ('contraloria:2025:1138', 'CG-1138', 'FECE - COLOCACIÓN DE TUBOS DE 24" DE DIÁMETRO', 'Materiales: CEMENTO GRIS TIPO I; ARENA; ARENON (PARA LECHO DE TUBOS); AGREGADO PETREO - MATERIAL SELECTO; TUBO DE HORMIGÓN DE 24 IN DE DIÁMETRO X 1.2 M
Mano de obra: TUBERO DE 1ra; CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2da; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); PLANCHA COMPACTADORA; CAMIÓN PLATAFORMA (Incluye Combustible); BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Otros trabajos especializados', 'Metro lineal', 'm', 130.65, 176.38, 0, true),
  ('contraloria:2025:1139', 'CG-1139', 'FECE - COLOCACIÓN DE TUBOS DE HORMIGÓN 30" DE DIÁMETRO', 'Materiales: CEMENTO GRIS TIPO I; ARENA; ARENON (PARA LECHO DE TUBOS); AGREGADO PETREO - MATERIAL SELECTO; TUBO DE HORMIGÓN DE 30" DE DIÁMETRO X 1.2 M
Mano de obra: TUBERO DE 1ra; CAPATAZ (SALARIO MAS ALTO + 14%); AYUDANTE GENERAL; BANDERILLERO; OPERADOR DE EQUIPO PESADO DE 2da; CHOFER DE CAMIONES PESADOS; CHOFER DE CAMIONES LIVIANOS
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN VOLQUETE DE 15 m3 (Incluye combustible); RETROEXCAVADORA (Incluye Combustible); PLANCHA COMPACTADORA; CAMIÓN PLATAFORMA (Incluye Combustible); BOMBA DE AGUA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 184.47, 249.03, 0, true),
  ('contraloria:2025:1140', 'CG-1140', 'FECE - CORTE, DOBLADO Y COLOCACIÓN DE ACERO DE REFUERZO DE CUALQUIER DIÁMETRO', 'Materiales: ALAMBRE DE AMARRE, LISO GALVANIZADO; ACERO DE REFUERZO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Libra', 'lb', 0.54, 0.73, 0, true),
  ('contraloria:2025:1141', 'CG-1141', 'FECE - CONCRETO DE 3,500 LBS/PULG2 PREPARADO EN SITIO CON MÁQUINA', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO; MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 163.49, 220.71, 0, true),
  ('contraloria:2025:1142', 'CG-1142', 'FECE - FUNDACIÓN CORRIDA DE PARED, CON REFUERZO 2#4 + EST #3 @ 0.20 M DE C.A.C', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 237.84, 321.08, 0, true),
  ('contraloria:2025:1143', 'CG-1143', 'FECE - MURO DE BLOQUES DE 6" DE HORMIGÓN, CON REFUERZO #4 @ 0.40 M C.A.C.', 'Materiales: CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 6"; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 47.43, 64.03, 0, true),
  ('contraloria:2025:1144', 'CG-1144', 'FECE - MURO DE BLOQUES DE 6", RELLENOS DE HOMIGÓN CON REFUEZO EN AMBAS DIRECCIONES', 'Materiales: CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 6"; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 49.08, 66.26, 0, true),
  ('contraloria:2025:1145', 'CG-1145', 'FECE - MURO DE BLOQUES DE 8" DE HOMIGÓN, CON REFUERZO EN AMBAS DIRECCIONES Y RELLENO DE CONCRETO', 'Materiales: CEMENTO GRIS TIPO I; BLOQUE DE CEMENTO DE 8"; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Movimiento de tierra y compactación', 'Metro cuadrado', 'm²', 80.68, 108.92, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

insert into public.platform_catalog_items (
  code, sku, name, description, item_type, category_name, unit_name, unit_symbol, default_unit_cost, default_sale_price, default_waste_percentage, active
) values
  ('contraloria:2025:1146', 'CG-1146', 'FECE - VIGA SÍSMICA (0.30 X 0.45) 6#5 + EST. #3 @ 0.20M c.a.c.', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 306.63, 413.95, 0, true),
  ('contraloria:2025:1147', 'CG-1147', 'FECE - COLUMNA ESTRUCTURAL DE 0.35 X 0.40, 8 #6, EST. #3 @ 0.20 m c.a.c.', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; MADERA - TRAMO DE MADERA DE 2 X 2"; MADERA- TRAMO DE MADERA DE 2 X 4"; CLAVOS DE ACERO DE 3"
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 585.93, 791.01, 0, true),
  ('contraloria:2025:1148', 'CG-1148', 'FECE - COLUMNAS DE AMARRE DE HORMIGÓN DE 3,500 psi DE 0.10 m x 0.30 m + 2#4', 'Materiales: CEMENTO GRIS TIPO I; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; CLAVOS DE ACERO DE 3"; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 18.75, 25.31, 0, true),
  ('contraloria:2025:1149', 'CG-1149', 'FECE - VIGAS DE TECHO 0.15 X 0.30 2#5, EST #3 @ 0.20 C.A.C SIMPLEMENTE APOYADA SOBRE COLUMNAS', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; MADERA - TRAMO DE MADERA DE 2 X 2"; MADERA- TRAMO DE MADERA DE 2 X 4"; CLAVOS DE ALAMBRE DE 2 1/2"; CLAVOS DE ACERO DE 3"
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA PARA CONCRETO; CUADRILLA DESENCOFRADO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 34.55, 46.64, 0, true),
  ('contraloria:2025:1150', 'CG-1150', 'FECE - VIGA ESTRUCTURAL DE MÁXIMA 0.30 X 0.40 M 6#6, EST #3 @ 0.15 c.a.c.', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; MADERA - TRAMO DE MADERA DE 2 X 2"; MADERA- TRAMO DE MADERA DE 2 X 4"; CLAVOS DE ACERO DE 3"
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 554.51, 748.59, 0, true),
  ('contraloria:2025:1151', 'CG-1151', 'FECE - DINTEL Y ALFEIZAR', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; MADERA - TRAMO DE MADERA DE 2 X 2"; MADERA- TRAMO DE MADERA DE 2 X 4"; CLAVOS DE ALAMBRE DE 2 1/2"; CLAVOS DE ACERO DE 3"
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 15.38, 20.76, 0, true),
  ('contraloria:2025:1152', 'CG-1152', 'FECE - ESCALERAS Y ESCALINATAS DE HORMIGÓN SOBRE SUELO', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; ACERO DE REFUERZO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; MADERA - TRAMO DE MADERA DE 2 X 2"
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 284.55, 384.14, 0, true),
  ('contraloria:2025:1153', 'CG-1153', 'FECE - FORMALETA PARA VIGAS Y COLUMNAS', 'Materiales: LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; MADERA - TRAMO DE MADERA DE 2 X 2"; MADERA- TRAMO DE MADERA DE 2 X 4"; CLAVOS DE ALAMBRE DE 2 1/2"; CLAVO DE ALAMBRE DE 3 1/2"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 16.3, 22.0, 0, true),
  ('contraloria:2025:1154', 'CG-1154', 'FECE - CONCRETO DE 3,500 lbs/pulg2 PREPARADO EN SITIO CON MEZCLADORA', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 147.29, 198.84, 0, true),
  ('contraloria:2025:1155', 'CG-1155', 'FECE - CONCRETO DE 3,500 lbs/in2 BOMBEADO', 'Materiales: CONCRETO DE 3,500 PSI FINO BOMBLEABLE
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO; BOMBA TELESCÓPICA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 261.61, 353.17, 0, true),
  ('contraloria:2025:1156', 'CG-1156', 'FECE - CONCRETO DE 3,500 lbs/pulg2 VACIADO', 'Materiales: CONCRETO DE 3500 PSI; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; VIBRADOR DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cúbico', 'm³', 241.78, 326.4, 0, true),
  ('contraloria:2025:1157', 'CG-1157', 'FECE - CURADO DE CONCRETO', 'Materiales: AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pintura, impermeabilización y acabados', 'Metro cuadrado', 'm²', 0.8, 1.08, 0, true),
  ('contraloria:2025:1158', 'CG-1158', 'FECE - ALEROS DE HORMIGÓN', 'Materiales: CONCRETO DE 3500 PSI; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; CLAVOS DE ALAMBRE DE 2 1/2"
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: ALUMAS PARA VIGAS PRINCIPALES; PUNTALES
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 57.91, 78.18, 0, true),
  ('contraloria:2025:1159', 'CG-1159', 'FECE - LOSA DE HORMIGÓN SÓLIDO', 'Materiales: CONCRETO DE 3500 PSI; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; CLAVOS DE ALAMBRE DE 2 1/2"; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: ALUMAS PARA VIGAS PRINCIPALES; PUNTALES
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 83.86, 113.21, 0, true),
  ('contraloria:2025:1160', 'CG-1160', 'FECE - LOSA DE BLOQUES DE 0.1 M Y VIGUETAS DE 0.3 X 0.20 M', 'Materiales: CONCRETO DE 3500 PSI; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; BLOQUE DE ARCILLA DE 0.30 X 0.30 X 0.1; BLOQUE DE ARCILLA DE 0.30 X 0.30 X 0.15 M; CLAVOS DE ALAMBRE DE 2 1/2"; MADERA - TABLA DE ESPAVÉ DE 1" X 12"
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: ALUMAS PARA VIGAS PRINCIPALES; PUNTALES
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 146.81, 198.19, 0, true),
  ('contraloria:2025:1161', 'CG-1161', 'FECE - LOSA POSTENSADA', 'Materiales: CONCRETO DE 3500 PSI; ACERO DE REFUERZO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; ALAMBRE DE AMARRE, LISO GALVANIZADO; CLAVOS DE ALAMBRE DE 2 1/2"; CABLE CON CUBIERTA ANTIADERENTE; DESENCOFRANTE
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: ALUMAS PARA VIGAS PRINCIPALES; PUNTALES
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 98.76, 133.33, 0, true),
  ('contraloria:2025:1162', 'CG-1162', 'FECE - LOSA LIGERA CON LÁMINAS DE METAL GALVANIZADO (METAL DECK)', 'Materiales: CONCRETO DE 3500 PSI; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; CARRIOLA GALVANIZADA 2" X 6" cal.16; LÁMINA COLABORANTE DE ACERO GALV. DE 36" X 20´ CAL.22; SOLDADURA 7018; CONECTORES DE CORTANTE METALDECK
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL; CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA CONCRETO
Equipo/herramienta: EQUIPOS Y ELEMENTOS AUXILIARES DE SOLDADURA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 147.92, 199.69, 0, true),
  ('contraloria:2025:1163', 'CG-1163', 'FECE - ACERAS DE CONCRETO DE 3,500 lbs/pulg2 (SIN REFUERZO)', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; CARRIOLA GALVANIZADA 2" X 4" cal.16; AGREGADO PETREO - MATERIAL SELECTO; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: AYUDANTE GENERAL; CALIFICADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro cuadrado', 'm²', 27.03, 36.49, 0, true),
  ('contraloria:2025:1164', 'CG-1164', 'FECE - PISO DE CONCRETO DE 3,500 psi REFORZADO + BARRERA DE VAPOR DE POLIETILENO Y CAPA DE GRAVA TRITURADA, ACABADO A LLANA', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; CARRIOLA GALVANIZADA 2" X 4" cal.16; ACERO DE REFUERZO; ALAMBRE DE AMARRE, LISO GALVANIZADO; PLÁSTICO DE SEPARACIÓN PARA PISO (POLIETIRENO) 6PIESX100PIES; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA DESENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 35.61, 48.07, 0, true),
  ('contraloria:2025:1165', 'CG-1165', 'FECE - CORDÓN CUNETA', 'Materiales: CONCRETO DE 4000 psi; ACERO DE REFUERZO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; MADERA - TRAMO DE MADERA DE 2 X 2"; CLAVOS DE ACERO DE 3"
Mano de obra: CUADRILLA PARA ENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 36.58, 49.38, 0, true),
  ('contraloria:2025:1166', 'CG-1166', 'FECE - CORDÓN SIMPLE', 'Materiales: CONCRETO DE 4000 psi; ACERO DE REFUERZO; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"; MADERA - TRAMO DE MADERA DE 2 X 2"; CLAVOS DE ACERO DE 3"
Mano de obra: CUADRILLA PARA ENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO; PLANCHA COMPACTADORA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Urbanismo, vialidad e infraestructura', 'Metro lineal', 'm', 28.3, 38.2, 0, true),
  ('contraloria:2025:1167', 'CG-1167', 'FECE - PISO DE CONCRETO DE 3,500 lb/in2 DE 4" (REFORZADO)', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; CARRIOLA GALVANIZADA 2" X 4" cal.16; ACERO DE REFUERZO; PLÁSTICO DE SEPARACIÓN PARA PISO (POLIETIRENO) 6PIESX100PIES; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CUADRILLA PARA REFUERZO DE ACERO; CUADRILLA PARA ENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 33.67, 45.45, 0, true),
  ('contraloria:2025:1168', 'CG-1168', 'FECE - PISO DE CONCRETO DE 3,500 lb/in2 DE 4" (SIN REFUERZO)', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; CARRIOLA GALVANIZADA 2" X 4" cal.16; PLÁSTICO DE SEPARACIÓN PARA PISO (POLIETIRENO) 6PIESX100PIES; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CUADRILLA PARA ENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 22.06, 29.78, 0, true),
  ('contraloria:2025:1169', 'CG-1169', 'FECE - SOBREPISO DE CONCRETO DE 0.05 m DE ESPESOR', 'Materiales: CEMENTO GRIS TIPO I; ARENA; AGREGADO PETREO - GRAVA #4; CARRIOLA GALVANIZADA 2" X 4" cal.16; AGENTE DE CURADO (ANTISOL-SIKA) 20 lt
Mano de obra: CUADRILLA PARA ENCOFRADO; CUADRILLA PARA CONCRETO
Equipo/herramienta: MEZCLADORA DE CONCRETO
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Pisos, revestimientos y fachadas', 'Metro cuadrado', 'm²', 10.72, 14.47, 0, true),
  ('contraloria:2025:1170', 'CG-1170', 'FECE - PAREDES DE BLOQUES DE CONCRETO DE 4"', 'Materiales: CEMENTO GRIS TIPO I; ARENA; BLOQUE DE CEMENTO DE 4"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 18.58, 25.08, 0, true),
  ('contraloria:2025:1171', 'CG-1171', 'FECE - PAREDES DE BLOQUES DE CONCRETO DE 6", SIN REFUERZO, HASTA UNA ALTURA DE 3.00 M MAX', 'Materiales: CEMENTO GRIS TIPO I; ARENA; BLOQUE DE CEMENTO DE 6"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 20.98, 28.32, 0, true),
  ('contraloria:2025:1172', 'CG-1172', 'FECE - PAREDES DE BLOQUES DE CONCRETO DE 8"', 'Materiales: CEMENTO GRIS TIPO I; ARENA; BLOQUE DE CEMENTO DE 8"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 33.09, 44.67, 0, true),
  ('contraloria:2025:1173', 'CG-1173', 'FECE - PAREDES DE BLOQUES DE ARCILLA DE 4", SIN REFUERZO', 'Materiales: CEMENTO GRIS TIPO I; ARENA; BLOQUE DE ARCILLA DE 4"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 17.82, 24.06, 0, true),
  ('contraloria:2025:1174', 'CG-1174', 'FECE - PAREDES DE BLOQUES DE ARCILLA DE 6"', 'Materiales: CEMENTO GRIS TIPO I; ARENA; BLOQUE DE ARCILLA DE 6"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 26.1, 35.23, 0, true),
  ('contraloria:2025:1175', 'CG-1175', 'FECE - PAREDES DE LADRILLOS DE ARCILLA, HASTA UNA ALTURA DE 3.05 M.', 'Materiales: CEMENTO GRIS TIPO I; ARENA; LADRILLOS DE ARCILLA DE 5 cm x 10 cm x 20 cm
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 74.5, 100.57, 0, true),
  ('contraloria:2025:1176', 'CG-1176', 'FECE - PAREDES DE BLOQUE DE VIDRIO DE 8" X 8"', 'Materiales: CEMENTO GRIS TIPO I; ARENA; BLOQUE DE VIDRIO DE 8" X 8"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 76.4, 103.14, 0, true),
  ('contraloria:2025:1177', 'CG-1177', 'FECE - BLOQUE ORNAMENTALES TIPO "R"', 'Materiales: CEMENTO GRIS TIPO I; ARENA; BLOQUE ORNAMENTAL TIPO "R"
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 29.45, 39.76, 0, true),
  ('contraloria:2025:1178', 'CG-1178', 'FECE - PAREDES DE LÁMINAS DE YESO RESISTENTE A LA HUMEDAD EN ESTRUCTURAS DE ALUMINIO', 'Materiales: STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ACERO GALVANIZADO 2 1/2" X 1" X 20´ CAL.20; TORNILLO PUNTA FINA #6; TORNILLO PARA GYPSUM PUNTA INA #2 DE 1 1/4; LÁMINA DE GYPSUM RESISTENTE A LA HUMEDAD DE 4´ X 8´ X 1/2"; ESQUINERA METÁLICA 1 1/4" X 8''; PASTA DE GYPSUM PARA JUNTAS; CINTA PARA JUNTA DE 2" X 250´; SELLADOR PARA GYPSUM
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Puertas, ventanas y carpintería', 'Metro cuadrado', 'm²', 39.12, 52.81, 0, true),
  ('contraloria:2025:1179', 'CG-1179', 'FECE - PAREDES DE LÁMINAS DE PLYROCK EN ESTRUCTURA DE ACERO GALVANIZADO', 'Materiales: STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ACERO GALVANIZADO 2 1/2" X 1" X 20´ CAL.20; TORNILLO PUNTA FINA #6; TORNILLO PARA PLYROCK PUNTA BROCA; LÁMINA DE PLYROCK DE 4´ X 8´ X 1/2"; ESQUINERA METÁLICA 1 1/4" X 8''; PASTA DE GYPSUM PARA JUNTAS; CINTA PARA JUNTA DE 2" X 250´; SELLADOR PARA GYPSUM
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 53.61, 72.37, 0, true),
  ('contraloria:2025:1180', 'CG-1180', 'FECE - PAREDES DE LÁMINAS DE PLYWOOD DE 3/4 EN ESTRUCTURA DE ACERO GALVANIZADO', 'Materiales: STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE ACERO GALVANIZADO 2 1/2" X 1" X 20´ CAL.20; TORNILLO PUNTA FINA #6; TORNILLO PARA PLYROCK PUNTA BROCA; LÁMINA DE PLYWOOD DE 4´ X 8´ X 3/4"
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 47.99, 64.79, 0, true),
  ('contraloria:2025:1181', 'CG-1181', 'FECE - BARANDA DE TUBOS DE ACERO GALVANIZADO DE 1 1/2" DE DIAM. CON ESPESOR DE 1/8", A 8 LÍNEAS A CADA 0.1 m c.a.c. DE 1.2 M DE ALTO', 'Materiales: TUBO DE ACERO GALVANIZADO CALIBRE 16 DE 5.8 M 1 1/2 IN; TUBO DE 2" X 3/16 X 5.8 M DE ACERO GALV.; SOLDADURA 6011 X 1/8"; DISCO DE CORTE DE 14" X 3/32"; DISCO DE DESVASTE DE 4 1/2" x 7/8"; DISCO DE PULIR DE 4"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; PINTURA ESMALTE
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL; CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 95.17, 128.48, 0, true),
  ('contraloria:2025:1182', 'CG-1182', 'FECE - PASAMANOS DE TUBO DE ACERO GALV. DE 1 1/2" DE DIÁMETRO CON ESPESOR DE 3/32"', 'Materiales: TUBO DE ACERO GALVANIZADO CALIBRE 16 DE 5.8 M 1 1/2 IN; ACERO - PLATINA DE 4" X 1/4"; SOLDADURA 6011 X 1/8"; DISCO DE CORTE DE 14" X 3/32"; DISCO DE DESVASTE DE 4 1/2" x 7/8"; DISCO DE PULIR DE 4"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; PINTURA ESMALTE
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL; CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro lineal', 'm', 58.9, 79.51, 0, true),
  ('contraloria:2025:1183', 'CG-1183', 'FECE - COLUMNAS DE TUBOS DE METAL MÁXIMO TUBOS DE 6" X 6" X 1/4"', 'Materiales: TUBO DE ACERO DE 6" X 6" X 1/4"; DISCO DE DESVASTE DE 4 1/2" x 7/8"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; SOLDADURA 7018
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; CAMIÓN GRÚA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro lineal', 'm', 60.52, 81.7, 0, true),
  ('contraloria:2025:1184', 'CG-1184', 'FECE - VIGAS Y COLUMNAS WIDE FLANGE', 'Materiales: ACERO ESTRUCTURAL; PINTURA ANTICORROSIVO TIPO MINIO ROJO; SOLDADURA 7018
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; CAMIÓN GRÚA
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Libra', 'lb', 1.14, 1.54, 0, true),
  ('contraloria:2025:1185', 'CG-1185', 'FECE - PLATOS DE ACERO A36, MÁXIMO 0.30 m x 0.30 m x 1/2" DE ESPESOR', 'Materiales: ACERO - PLATINA DE ACERO A36 DE 0.3 M DE ANCHO X 1/2" DE ESP.; ARANDELA DE 5/8"; TUERCAS DE 5/8" - PLACA DE ACERO; PERNO 3/4" CON ROSCA; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Unidad', 'und', 67.25, 90.79, 0, true),
  ('contraloria:2025:1186', 'CG-1186', 'FECE - VERJAS DE TUBOS DE 1" X 1" X 1/8"', 'Materiales: TUBO DE ACERO DE 1" X 1" X 1/8"; SOLDADURA 6011 X 1/8"; DISCO DE DESVASTE DE 4 1/2" x 7/8"; DISCO DE PULIR DE 4"; PINTURA ANTICORROSIVO TIPO MINIO ROJO; PINTURA ESMALTE
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL; CALIFICADO PINTOR
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Metales y herrería', 'Metro cuadrado', 'm²', 92.21, 124.48, 0, true),
  ('contraloria:2025:1187', 'CG-1187', 'FECE - TECHOS DE CUBIERTA DE LÁMINAS DE METAL GALVANIZADO CL. 24, CANAL ANCHO Y CARRIOLAS 2" X 6", INCLUYE AISLANTE Y MALLA DE SOPORTE', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; SOLDADURA 6011 X 1/8"; ALINEADORES DE CARRIOLAS; AISLANTE TÉRMICO DE 4´ X 125´ X 3 MM DE ESP.; MALLA BIAXIAL; LÁMINAS DE ACERO GALVANIZADO, CAL.24; CARRIOLA GALVANIZADA 2" X 6" cal.16; CUMBRERA O CABALLETE LISO GALVANIZADO DE 24" cal.26
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 111.17, 150.08, 0, true),
  ('contraloria:2025:1188', 'CG-1188', 'FECE - TECHO DE CUBIERTA DE PANELES TIPO SANDWICH, CANAL ANCHO Y ESTRUCTURA DE CARRIOLAS 2" X 6"', 'Materiales: TORNILLO AUTOPERFORANTE N°14 DE 6"; TORNILLO AUTOPERFORANTE DE 1"; SOLDADURA 6011 X 1/8"; LÁMINA AISLANTE O TERMOPANEL; CARRIOLA GALVANIZADA 2" X 6" cal.16; CUMBRERA O CABALLETE LISO GALVANIZADO DE 24" cal.26
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 248.32, 335.23, 0, true),
  ('contraloria:2025:1189', 'CG-1189', 'FECE - TECHO DE LÁMINAS DE FIBROCEMENTO EN ESTRUCTURAS DE MADERA DE 2" X 6"', 'Materiales: TORNILLO AUTOPERFORANTE N°14 DE 6"; MADERA - TRAMOS DE 2" X 6" CEDRO ESPINO; LÁMINA DE FIBROCEMENTO - TECHOS; CUMBRERA O CABALLETE PARA LÁMINAS DE FIBROCEMENTO
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 101.05, 136.42, 0, true),
  ('contraloria:2025:1190', 'CG-1190', 'FECE - TECHOS CON CUBIERTA DE LÁMINAS DE FIBROCEMENTO ONDULADO SOBRE ESTRUCTURA DE METAL Y CARRIOLAS CAL.24', 'Materiales: TORNILLO AUTOPERFORANTE N°14 DE 6"; CARRIOLA GALVANIZADA 2" X 6" cal.16; LÁMINA DE FIBROCEMENTO - TECHOS; CUMBRERA O CABALLETE PARA LÁMINAS DE FIBROCEMENTO
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 114.06, 153.98, 0, true),
  ('contraloria:2025:1191', 'CG-1191', 'FECE - TECHO CON CUBIERTA DE LÁMINAS DE ALEACIÓN DE ZINC, ALUMINIO Y SILICIO (GALVALUM) SOBRE ESTRUCTURA DE CARRIOLAS CAL. 20', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; SOLDADURA 6011 X 1/8"; ALINEADORES DE CARRIOLAS; AISLANTE TÉRMICO DE 4´ X 125´ X 3 MM DE ESP.; MALLA BIAXIAL; LÁMINAS DE GALVALUME; CARRIOLA GALVANIZADA 2" X 6" cal.16; CUMBRERA O CABALLETE LISO GALVANIZADO DE 24" cal.26
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 84.28, 113.78, 0, true),
  ('contraloria:2025:1192', 'CG-1192', 'FECE - TECHOS DE COBERTIZO CON LÁMINAS DE ACERO GALVANIZADO CAL.24 EN ESTRUCTURA DE CARRIOLAS CAL.26.', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; SOLDADURA 6011 X 1/8"; ALINEADORES DE CARRIOLAS; LÁMINAS DE ACERO GALVANIZADO, CAL.24; CARRIOLA GALVANIZADA 2" X 6" cal.16; CUMBRERA O CABALLETE LISO GALVANIZADO DE 24" cal.26
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 72.01, 97.21, 0, true),
  ('contraloria:2025:1193', 'CG-1193', 'FECE - SUMINISTRO E INSTALACIÓN DE CARRIOLAS 2" X 4" DE ACERO GALV.', 'Materiales: CARRIOLA GALVANIZADA 2" X 4" cal.16; PINTURA ANTICORROSIVO TIPO MINIO ROJO; ALINEADORES DE CARRIOLAS; SOLDADURA 6011 X 1/8"; BROCHA DE 2"
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 27.15, 36.65, 0, true),
  ('contraloria:2025:1194', 'CG-1194', 'FECE - SUMINISTRO E INSTALACIÓN DE CARRIOLAS 2" X 6" DE ACERO GALVANIZADO', 'Materiales: CARRIOLA GALVANIZADA 2" X 6" cal.16; PINTURA ANTICORROSIVO TIPO MINIO ROJO; SOLDADURA 6011 X 1/8"; BROCHA DE 2"
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 30.01, 40.51, 0, true),
  ('contraloria:2025:1195', 'CG-1195', 'FECE - SUMINISTRO E INSTALACIÓN DE DOBLE CARRIOLA DE 2" X 4"', 'Materiales: CARRIOLA GALVANIZADA 2" X 4" cal.16; PINTURA ANTICORROSIVO TIPO MINIO ROJO; SOLDADURA 6011 X 1/8"; BROCHA DE 2"
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 52.67, 71.1, 0, true),
  ('contraloria:2025:1196', 'CG-1196', 'FECE - SUMINISTRO E INSTALACÓN DE CARRIOLA DOBLE DE 2" X 6"', 'Materiales: CARRIOLA GALVANIZADA 2" X 6" cal.16; PINTURA ANTICORROSIVO TIPO MINIO ROJO; SOLDADURA 6011 X 1/8"; BROCHA DE 2"
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 63.98, 86.37, 0, true),
  ('contraloria:2025:1197', 'CG-1197', 'FECE - SUMINISTRO E INSTALACIÓN DE CARRIOLAS DOBLE DE 2" X 8"', 'Materiales: CARRIOLA GALVANIZADA 2" X 8" cal.16; PINTURA ANTICORROSIVO TIPO MINIO ROJO; SOLDADURA 6011 X 1/8"; BROCHA DE 2"
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; MAQUINA DE SOLDAR
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 160.15, 216.2, 0, true),
  ('contraloria:2025:1198', 'CG-1198', 'FECE - SUMINISTRO E INSTALACIÓN DE AISLANTE REFLECTIVO DE BURBUJAS', 'Materiales: AISLANTE TÉRMICO DE 4´ X 125´ X 3 MM DE ESP.; MALLA BIAXIAL; TORNILLO AUTOPERFORANTE #14 DE 2 1/2"
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 7.88, 10.64, 0, true),
  ('contraloria:2025:1199', 'CG-1199', 'FECE - SUMINISTRO E INSTALACIÓN DE CUBIERTA DE LÁMINAS DE ACERO GALV. CAL.24', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; BROCHA DE 2"; LÁMINAS DE ACERO GALVANIZADO, CAL.24; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 24.59, 33.2, 0, true),
  ('contraloria:2025:1200', 'CG-1200', 'FECE - SUMINISTRO E INSTALACIÓN DE CUBIERTA DE LÁMINA DE ACERO ESMALTADO CAL.24', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; BROCHA DE 2"; LÁMINA DE ACERO ESMALTADO CAL.24; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: SOLDADOR 1RA; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 28.76, 38.83, 0, true),
  ('contraloria:2025:1201', 'CG-1201', 'FECE - SUMINISTRO E INSTALACIÓN DE CUBIERTA DE FIBROCEMENTO', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; LÁMINA DE FIBROCEMENTO - TECHOS; BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 53.37, 72.05, 0, true),
  ('contraloria:2025:1202', 'CG-1202', 'FECE - SUMINISTRO E INSTALACIÓN DE CABALLETE DE ACERO GALVANIZADO CAL. 24', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; CUMBRERA O CABALLETE LISO GALVANIZADO DE 24" cal.26; BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 20.53, 27.72, 0, true),
  ('contraloria:2025:1203', 'CG-1203', 'FECE - SUMINISTRO E INSTALACIÓN DE CABALLETE DE ACERO ESMALTADO CAL.26', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; CABALLETE LISO DE LÁMINA DE ACERO ESMALTADO CAL. 24; BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 12.12, 16.36, 0, true),
  ('contraloria:2025:1204', 'CG-1204', 'FECE - SUMINISTRO E INSTALACIÓN DE CABALLETE DE FIBROCEMENTO', 'Materiales: TORNILLO AUTOPERFORANTE #14 DE 2 1/2"; CABALLETE DE FIBROCEMENTO; BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 20.16, 27.22, 0, true),
  ('contraloria:2025:1205', 'CG-1205', 'FECE - BAJANTE DE TUBO DE PVC DE 4"', 'Materiales: CODO DE 45° DE PVC DE 4" SCH 40; CODO DE 90° DE PVC DE 4" SCH 40; PEGAMENTO PVC 8 ONZAS; TUBERÍA PVC SDR-41 DE 4 IN DE 20PIES; GRAPA DE ACERO GALVANIZADO DE 4" PARA BAJANTES PLUVIALES
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 14.59, 19.7, 0, true),
  ('contraloria:2025:1206', 'CG-1206', 'FECE - CANAL DE DESAGUE DE TECHO DE ACERO GALVANIZADO CAL.20', 'Materiales: CANAL DE ACERO GALVANIZADO FABRICADO; BROCHA DE 2"; PINTURA ANTICORROSIVO TIPO MINIO ROJO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro lineal', 'm', 37.84, 51.08, 0, true),
  ('contraloria:2025:1207', 'CG-1207', 'FECE - CIELO RASO SUSPENDIDO DE LÁMINAS DE YESO DE 2´ X 2´ X 7 mm, CON AISLANTE REFLECTIVO Y CUBIERTA DE VINIL EN ESTRUCTURA DE ALUMINIO CAL. 22.', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA DE YESO 2 X 2; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 16.43, 22.18, 0, true),
  ('contraloria:2025:1208', 'CG-1208', 'FECE - CIELO RASO SUSPENDIDO DE SKAYOLA EN ESTRUCTURA DE ALUMINIO O ACERO GALV. CAL. 22', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA DE ESCAYOLA 2 X 2; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 25.48, 34.4, 0, true),
  ('contraloria:2025:1209', 'CG-1209', 'FECE - CIELO RASO DE LÁMINAS DE GYPSUM EN ESTRUCTURA DE ACERO GALV. CAL. 20', 'Materiales: LÁMINA DE GYPSUM BOARD REGULAR 4 X 8 ´ X 1/2"; STUD DE ALUMINIO DE 4" X 2" X 10´ CAL 24; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; TORNILLO PARA GYPSUM #6 X 1 1/4" PUNTA FINA; TORNILLO DE 7/16"; CINTA DE 300 PL X 2" PARA GYPSUM; PASTA MULTIUSO; LIJA DE AGUA #40; LIJA DE AGUA #1500
Mano de obra: CALIFICADO GYPSERO; AYUDANTE GENERAL; PASTERO
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 27.54, 37.18, 0, true),
  ('contraloria:2025:1210', 'CG-1210', 'FECE - CIELO RASO DE PÁNELES DE PVC EN ESTRUCTURA DE ACERO DE ACERO GALVANIZADO CAL.20', 'Materiales: CLAVOS DE IMPACTO 3/4" (100 UNIDADES); TORNILLOS 1/2" PUNTA FINA; CHANELL STUD DE 2 1/2" X 1 1/4 X 10´ CAL. 26; TRACK DE CHANELL 2 1/2" X 10''. CAL. 24; ÁNGULO / CORNISA INTERNO 7.5 MM X 5.9 M; UNIÓN DE 6 MM X 5.9 M - CIELO RASO; LÁMINA DE PVC 200 X 2980 X 6MM; CORNISA PARA ESTRUCTURA DE CIELO RASO
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Sistemas livianos y cielos', 'Metro cuadrado', 'm²', 26.39, 35.63, 0, true),
  ('contraloria:2025:1211', 'CG-1211', 'FECE - CIELO RASO SUSPENDIDO DE LÁMINAS DE FIBRA MINERAL DE 2´ X 2´ X 25 MM, CON AISLANTE REFLECTIVO Y CUBIERTA DE VINIL EN ESTRUCTURA DE ALUMINIO CAL. 22', 'Materiales: ANCLAJES CON TEE 4´ - CIELO RASO; TORNILLO DE 7/16"; CLAVOS DE IMPACTO 3/4" (100 UNIDADES); LÁMINA DE FIBRA MINERAL 2 X 2; TEE DE ALUMINIO DE 2´; TEE DE ALUMINIO DE 4´; TEE DE ALUMINIO DE 12´; ÁNGULO DE ALUMINIO DE 12´
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Techos y cubiertas', 'Metro cuadrado', 'm²', 26.15, 35.3, 0, true),
  ('contraloria:2025:1212', 'CG-1212', 'FECE - REPELLO LISO CON MORTERO, HASTA 1.80 M DE ALTURA', 'Materiales: ARENA; MADERA - 1X4X10'', PINOTEA (tres usos); CLAVOS DE ACERO DE 3"; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 9.9, 13.36, 0, true),
  ('contraloria:2025:1213', 'CG-1213', 'FECE - REPELLO RÚSTICO CON MORTERO, HASTA 1.80 m DE ALTURA', 'Materiales: ARENA; MADERA - 1X4X10'', PINOTEA (tres usos); CLAVOS DE ACERO DE 3"; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Mampostería y repello', 'Metro cuadrado', 'm²', 8.09, 10.92, 0, true),
  ('contraloria:2025:1214', 'CG-1214', 'FECE - REPELLO LISO DE LOSA CON MORTERO, HASTA 1.80 m DE ALTURA', 'Materiales: ARENA; MADERA - 1X4X10'', PINOTEA (tres usos); CLAVOS DE ACERO DE 3"; CEMENTO GRIS TIPO I
Mano de obra: CALIFICADO; AYUDANTE GENERAL
Equipo/herramienta: HERRAMIENTAS EN GENERAL; ANDAMIOS
Base oficial de costos directos de la Contraloría General de la República, actualizada al 10 de julio de 2025.', 'service', 'Concreto y estructuras', 'Metro cuadrado', 'm²', 14.38, 19.41, 0, true)
on conflict (code) do update set
  sku = excluded.sku,
  name = excluded.name,
  description = excluded.description,
  item_type = excluded.item_type,
  category_name = excluded.category_name,
  unit_name = excluded.unit_name,
  unit_symbol = excluded.unit_symbol,
  default_unit_cost = excluded.default_unit_cost,
  default_sale_price = excluded.default_sale_price,
  default_waste_percentage = excluded.default_waste_percentage,
  active = excluded.active,
  updated_at = now();

commit;

-- Verificación esperada: 1,169 registros importados desde esta fuente.
select
  count(*) as partidas_importadas,
  min(default_unit_cost) as costo_minimo,
  max(default_unit_cost) as costo_maximo
from public.platform_catalog_items
where code like 'contraloria:2025:%';