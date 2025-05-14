/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('feedback', table => {
    table.increments('id').primary();
    table.integer('interview_id').unsigned().notNullable().references('id').inTable('interviews').onDelete('CASCADE');
    table.integer('applicant_id').unsigned().notNullable().references('id').inTable('applicants').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
    table.text('comments').notNullable();
    table.integer('technical_score').unsigned().nullable();
    table.integer('communication_score').unsigned().nullable();
    table.integer('culture_fit_score').unsigned().nullable();
    table.integer('overall_score').unsigned().nullable();
    table.string('recommendation', 50).notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('feedback');
};
