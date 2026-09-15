# Política de Retención y Depuración de Documentos — Contractor App

**Fecha de vigencia:** 14 de septiembre de 2026

Esta política define los criterios de conservación, anonimización y depuración segura de los datos tratados por **Contractor App**, operado en la República de Panamá bajo el nombre comercial **LEURET TECH**.

La retención se rige por el principio de conservar datos personales únicamente durante el tiempo necesario para la finalidad informada o durante el plazo que exija una obligación legal aplicable.

---

## 1. Criterios de retención

| Categoría | Regla de conservación | Acción al finalizar |
|---|---|---|
| **Perfil y cuenta** | Mientras la cuenta esté activa | Anonimización y deshabilitación al confirmar la eliminación |
| **Credenciales y sesiones** | Mientras sean necesarias para autenticación y seguridad | Revocación / invalidación |
| **Archivos personales y multimedia** | Mientras sean necesarios para prestar el servicio | Eliminación del almacenamiento al eliminar la cuenta, salvo obligación legal |
| **Facturación y registros contables/fiscales** | Durante el plazo comercial, contable o fiscal legalmente aplicable | Conservación restringida, separación o anonimización cuando sea posible |
| **Auditoría y seguridad** | Durante el periodo necesario para seguridad, prevención de fraude, cumplimiento o defensa de reclamaciones | Purgado o anonimización |
| **Respaldos** | Ciclo técnico limitado y documentado | Expiración automática y sustitución por respaldos posteriores |

---

## 2. Eliminación de cuenta

Cuando un usuario confirma **Eliminar mi cuenta** mediante `DELETE /account`:

1. Se revocan las sesiones y credenciales de autenticación.
2. Se elimina o anonimiza la información personal del perfil que no deba conservarse por una obligación legal.
3. Se eliminan del proveedor de almacenamiento los archivos personales asociados a la cuenta que hayan sido identificados por el sistema.
4. Los registros comerciales, contables, fiscales o de auditoría que deban conservarse permanecen únicamente por el plazo legal aplicable y con acceso restringido.
5. La aplicación informa si la limpieza de archivos externos fue completada o si ocurrió una incidencia técnica que requiere revisión.

No se presenta al usuario una eliminación como completada si el sistema únicamente creó una solicitud pendiente sin ejecutar el tratamiento correspondiente.

---

## 3. Exportación y portabilidad

Antes de eliminar su cuenta, el usuario puede solicitar una copia de sus datos mediante `GET /account/export`. La interfaz de Contractor Pro ofrece esta función desde el perfil del usuario.

---

## 4. Seguridad y acceso

- El acceso a información retenida por obligación legal se limita al personal o procesos autorizados.
- La información retenida no puede reutilizarse para finalidades incompatibles con la razón de su conservación.
- Las incidencias de depuración deben quedar registradas sin exponer secretos, credenciales ni datos sensibles en logs.

---

## 5. Revisión

Esta política debe revisarse cuando cambie la legislación aplicable, el modelo de almacenamiento, la arquitectura de eliminación o los periodos legales de conservación.

**Contacto de privacidad:** privacidad@leurettech.com