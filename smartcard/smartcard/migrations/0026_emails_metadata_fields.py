from django.db import migrations, models


def ensure_email_metadata_columns(apps, schema_editor):
    Emails = apps.get_model("smartcard", "Emails")
    connection = schema_editor.connection
    table_name = Emails._meta.db_table

    with connection.cursor() as cursor:
        existing_columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, table_name)
        }

    fields = (
        ("criado_por", models.CharField(max_length=100, null=True)),
        ("modificado_em", models.DateTimeField(auto_now=True)),
        ("modificado_por", models.CharField(max_length=100, null=True)),
    )

    for field_name, field in fields:
        field.set_attributes_from_name(field_name)
        if field.column in existing_columns:
            continue

        table = schema_editor.quote_name(table_name)
        column = schema_editor.quote_name(field.column)
        schema_editor.execute(
            f"ALTER TABLE {table} ADD COLUMN {column} {field.db_type(connection)} NULL"
        )
        if not field.null:
            schema_editor.execute(
                f"UPDATE {table} SET {column} = CURRENT_TIMESTAMP WHERE {column} IS NULL"
            )
            schema_editor.execute(
                f"ALTER TABLE {table} ALTER COLUMN {column} SET NOT NULL"
            )
        existing_columns.add(field.column)


class Migration(migrations.Migration):

    dependencies = [
        ("smartcard", "0025_loggererro"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    ensure_email_metadata_columns,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="emails",
                    name="criado_por",
                    field=models.CharField(max_length=100, null=True),
                ),
                migrations.AddField(
                    model_name="emails",
                    name="modificado_em",
                    field=models.DateTimeField(auto_now=True),
                ),
                migrations.AddField(
                    model_name="emails",
                    name="modificado_por",
                    field=models.CharField(max_length=100, null=True),
                ),
            ],
        ),
    ]
