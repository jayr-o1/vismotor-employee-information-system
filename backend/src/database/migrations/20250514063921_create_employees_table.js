/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('employees', table => {
    table.increments('id').primary();
    table.string('employee_id', 20).notNullable().unique(); // Custom employee ID
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('phone', 20).notNullable();
    table.string('address', 255).nullable();
    table.date('date_of_birth').nullable();
    table.string('gender', 10).nullable();
    table.date('hire_date').notNullable();
    table.string('department', 50).notNullable();
    table.string('position', 50).notNullable();
    table.decimal('salary', 10, 2).notNullable();
    table.string('status', 20).notNullable().defaultTo('active'); // active, on leave, terminated
    table.string('profile_picture', 255).nullable();
    table.text('emergency_contact').nullable();
    table.text('education').nullable();
    table.text('skills').nullable();
    table.text('notes').nullable();
    table.integer('applicant_id').unsigned().nullable().references('id').inTable('applicants');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('employees');
};
