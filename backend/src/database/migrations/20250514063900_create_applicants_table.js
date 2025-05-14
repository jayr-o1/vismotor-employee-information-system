/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('applicants', table => {
    table.increments('id').primary();
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('phone', 20).notNullable();
    table.string('address', 255).nullable();
    table.string('resume_path', 255).nullable();
    table.string('position_applied', 100).notNullable();
    table.date('application_date').notNullable();
    table.string('status', 30).notNullable().defaultTo('new');
    table.decimal('expected_salary', 10, 2).nullable();
    table.text('skills').nullable();
    table.text('education').nullable();
    table.text('experience').nullable();
    table.text('references').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('applicants');
};
