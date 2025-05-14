/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('employee_equipment', table => {
    table.increments('id').primary();
    table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('equipment_type', 50).notNullable();
    table.string('equipment_name', 100).notNullable();
    table.string('serial_number', 100).nullable();
    table.string('condition', 50).notNullable();
    table.date('issue_date').notNullable();
    table.date('return_date').nullable();
    table.string('notes', 255).nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('employee_equipment');
};
