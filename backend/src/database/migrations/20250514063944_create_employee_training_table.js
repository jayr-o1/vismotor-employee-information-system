/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('employee_training', table => {
    table.increments('id').primary();
    table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE');
    table.string('training_name', 100).notNullable();
    table.string('provider', 100).nullable();
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.string('status', 30).notNullable().defaultTo('scheduled'); // scheduled, in progress, completed
    table.string('certificate_path', 255).nullable();
    table.text('description').nullable();
    table.decimal('cost', 10, 2).nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('employee_training');
};
