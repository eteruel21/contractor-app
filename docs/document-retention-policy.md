# Política de Retención y Depuración de Documentos — Contractor App

**Fecha de vigencia:** 21 de julio de 2026

Esta política define los periodos de conservación, retención y depuración segura de los datos y documentos almacenados en **Contractor App**, garantizando el cumplimiento legal, contable y la protección de la privacidad de los usuarios.

---

## 1. Matriz de Retención por Categoría de Datos

| Categoría de Datos | Tipo de Documento / Registro | Periodo de Retención | Acción Posterior |
|---|---|---|---|
| **Datos de Perfil** | Nombre, email, teléfono, credenciales | Duración de la cuenta + 30 días | Eliminación / Anonimización |
| **Registros Fiscales** | Facturas, recibos, datos de impuestos (RUC/NIT) | 7 años fiscales | Archivado / Anonimización |
| **Documentos Contratación** | Contratos de proyectos, órdenes de trabajo | 5 años tras cierre de proyecto | Archivado inalterable |
| **Multimedia y Proyectos** | Fotos de avances, documentos adjuntos | 3 años tras cierre de proyecto | Borrado de almacenamiento |
| **Registros de Auditoría** | Log de actividades, logins, cambios de rol | 1 año rotativo | Sobreescritura / Purgado |
| **Respaldos de Base Datos** | Dumps automáticos de base de datos | 30 días continuos | Purgado automático seguro |

---

## 2. Procedimiento de Depuración por Eliminación de Cuenta

Cuando un usuario ejerce su derecho de **Eliminación de Cuenta** (`DELETE /account`):

1. **Fase 1 — Bloqueo Inmediato (T+0 horas):**
   - Se inhabilitan las credenciales de acceso (tokens JWT invalidados).
   - El usuario es desvinculado de las empresas y proyectos activos.

2. **Fase 2 — Exportación de Gracia (T+0 a T+30 días):**
   - La cuenta entra en estado `pending_deletion`. Los datos permanecen aislados de las consultas normales.

3. **Fase 3 — Depuración Definitiva (T+30 días):**
   - **Anonimización:** Las referencias en facturas históricas sustituyen los datos personales por `[USUARIO_ELIMINADO]`.
   - **Purga de Almacenamiento:** Fotografías, copias de cédula y adjuntos son eliminados físicamente de los buckets de almacenamiento.
   - **Eliminación SQL:** El registro de perfil y usuario es eliminado de la base de datos PostgreSQL.

---

## 3. Seguridad en la Depuración

- **Borrado Criptográfico:** La eliminación de objetos en almacenamiento borra las claves de descifrado asociadas.
- **Sin Recuperación:** Transcurridos los 30 días de la solicitud, los datos eliminados no podrán ser recuperados bajo ninguna circunstancia.

---

## 4. Responsabilidad y Auditoría

El equipo de operaciones realiza auditorías trimestrales para verificar la ejecución automática de los scripts de purga y certificar el cumplimiento de los plazos descritos.
