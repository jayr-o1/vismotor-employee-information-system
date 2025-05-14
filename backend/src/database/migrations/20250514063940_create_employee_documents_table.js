/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('employee_documents', table => {
    table.increments('id').primary();
    table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('document_type', 50).notNullable();
    table.string('document_name', 100).notNullable();
    table.string('file_path', 255).notNullable();
    table.string('description', 255).nullable();
    table.date('upload_date').notNullable();
    table.date('expiry_date').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('employee_documents');
};
