# Política de Privacidad — Contractor App

**Fecha de última actualización:** 14 de septiembre de 2026

**Contractor App**, operado en la República de Panamá bajo el nombre comercial **LEURET TECH**, respeta la privacidad de sus usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos, compartimos, protegemos y eliminamos información personal de conformidad con la Ley 81 de 26 de marzo de 2019 sobre Protección de Datos Personales y demás normativa panameña aplicable.

---

## 1. Información que Recopilamos

### 1.1 Información Proporcionada Directamente
- **Datos de Identificación y Contacto:** Nombre completo, dirección de correo electrónico, número de teléfono, documento de identidad (Cédula/RUC) y dirección.
- **Información Profesional y Comercial:** Nombre comercial, razón social, especialidades, años de experiencia, certificado de aviso de operación, tarifas y certificaciones.
- **Datos Operativos:** Proyectos, presupuestos, facturas, clientes registrados, tareas e historial de avance con fotos.

### 1.2 Información Recopilada Automáticamente
- **Registros de Sistema:** Dirección IP, tipo de navegador, sistema operativo, identificadores de dispositivo, cookies de sesión y registros de auditoría de actividad (*activity logs*).

---

## 2. Finalidad del Tratamiento de Datos

Utilizamos su información para:
1. Prestar, mantener y optimizar los servicios de la Plataforma.
2. Autenticar usuarios, gestionar roles (RBAC) y asegurar la cuenta.
3. Facilitar la comunicación y contratación entre Contratistas, Empresas y Clientes.
4. Generar documentos operativos (presupuestos, facturas, órdenes de trabajo).
5. Cumplir con obligaciones legales, contables, fiscales y de auditoría de seguridad.

---

## 3. Almacenamiento y Seguridad de la Información

- **Cifrado en Transito y Reposo:** Todos los canales de comunicación utilizan TLS 1.3/HTTPS. Los datos de la base de datos se almacenan en infraestructura PostgreSQL segura con aislamiento por usuario (RLS).
- **Control de Acceso:** Acceso restringido mediante JSON Web Tokens (JWT) y cookies HTTP-only con atributos `SameSite` y `Secure`.
- **Archivos y Fotografías:** Almacenados en contenedores privados con URLs firmadas con tiempo de expiración limitado.

---

## 4. Retención y Supresión de Datos

De acuerdo con nuestra **Política de Retención de Documentos**:
- **Cuentas Activas:** Mantendremos su información mientras su cuenta permanezca activa.
- **Cuentas Eliminadas:** Al confirmar la eliminación de la cuenta, se deshabilita el acceso y se anonimizan los datos personales asociados al perfil. Los archivos externos asociados se eliminan como parte del mismo flujo, salvo aquellos que deban conservarse por una obligación legal.
- **Registros Fiscales/Contables:** Los registros necesarios para cumplir obligaciones comerciales, contables o fiscales se conservarán durante el plazo legal aplicable. Cuando sea posible, se mantendrán separados o anonimizados respecto de la identidad del usuario eliminado.

---

## 5. Derechos de los Usuarios (ARCO / RGPD)

Usted posee los siguientes derechos sobre su información personal:
- **Acceso y Rectificación:** Puede consultar y actualizar sus datos en cualquier momento desde su perfil.
- **Exportación (Portabilidad):** Puede descargar una copia íntegra de sus datos en formato JSON (`GET /account/export`).
- **Eliminación (Supresión):** Puede solicitar el borrado definitivo de su cuenta (`DELETE /account`).
- **Oposición y Revocación:** Puede solicitar revocar el consentimiento para el tratamiento de datos opcionales.

---

## 6. Transferencias y Terceros

No vendemos ni alquilamos sus datos personales a terceros. Compartimos información únicamente con proveedores de infraestructura esenciales bajo estrictos acuerdos de confidencialidad:
- **Hosting y Base de Datos:** PostgreSQL / Render / Cloudflare Pages.
- **Servicios de Almacenamiento Cifrado:** Cloudflare R2 / S3 compatible.

---

## 7. Contacto de Privacidad

Si desea ejercer sus derechos o tiene consultas sobre esta política:
- **Delegado de Protección de Datos (DPO):** privacidad@leurettech.com
- **Dirección Postal:** LEURET TECH, República de Panamá
