CREATE TEMP TABLE fk_validation_results (
  constraint_name text,
  source_table text,
  referenced_table text,
  orphan_rows bigint
);

DO $block$
DECLARE
  fk record;
  join_condition text;
  source_not_null_condition text;
  orphan_count bigint;
BEGIN
  FOR fk IN
    SELECT
      constraint_object.oid,
      constraint_object.conname,
      constraint_object.conrelid AS source_oid,
      constraint_object.confrelid AS referenced_oid,
      constraint_object.conkey,
      constraint_object.confkey,
      format(
        '%I.%I',
        source_namespace.nspname,
        source_table.relname
      ) AS source_table,
      format(
        '%I.%I',
        referenced_namespace.nspname,
        referenced_table.relname
      ) AS referenced_table
    FROM pg_constraint AS constraint_object
    JOIN pg_class AS source_table
      ON source_table.oid = constraint_object.conrelid
    JOIN pg_namespace AS source_namespace
      ON source_namespace.oid = source_table.relnamespace
    JOIN pg_class AS referenced_table
      ON referenced_table.oid = constraint_object.confrelid
    JOIN pg_namespace AS referenced_namespace
      ON referenced_namespace.oid = referenced_table.relnamespace
    WHERE constraint_object.contype = 'f'
      AND source_namespace.nspname = 'public'
    ORDER BY source_table.relname, constraint_object.conname
  LOOP
    SELECT
      string_agg(
        format(
          'source_row.%I = referenced_row.%I',
          source_attribute.attname,
          referenced_attribute.attname
        ),
        ' AND '
        ORDER BY key_position
      ),
      string_agg(
        format(
          'source_row.%I IS NOT NULL',
          source_attribute.attname
        ),
        ' AND '
        ORDER BY key_position
      )
    INTO
      join_condition,
      source_not_null_condition
    FROM generate_subscripts(fk.conkey, 1) AS key_position
    JOIN pg_attribute AS source_attribute
      ON source_attribute.attrelid = fk.source_oid
     AND source_attribute.attnum = fk.conkey[key_position]
    JOIN pg_attribute AS referenced_attribute
      ON referenced_attribute.attrelid = fk.referenced_oid
     AND referenced_attribute.attnum = fk.confkey[key_position];

    EXECUTE format(
      'SELECT COUNT(*)
       FROM %s AS source_row
       WHERE %s
         AND NOT EXISTS (
           SELECT 1
           FROM %s AS referenced_row
           WHERE %s
         )',
      fk.source_table,
      source_not_null_condition,
      fk.referenced_table,
      join_condition
    )
    INTO orphan_count;

    INSERT INTO fk_validation_results (
      constraint_name,
      source_table,
      referenced_table,
      orphan_rows
    )
    VALUES (
      fk.conname,
      fk.source_table,
      fk.referenced_table,
      orphan_count
    );
  END LOOP;
END
$block$;

SELECT
  constraint_name,
  source_table,
  referenced_table,
  orphan_rows
FROM fk_validation_results
WHERE orphan_rows > 0
ORDER BY source_table, constraint_name;

SELECT
  COUNT(*) AS foreign_keys_checked,
  COUNT(*) FILTER (
    WHERE orphan_rows > 0
  ) AS failed_foreign_keys,
  COALESCE(SUM(orphan_rows), 0) AS total_orphan_rows
FROM fk_validation_results;