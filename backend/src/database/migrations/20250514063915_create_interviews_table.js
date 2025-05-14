/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('interviews', table => {
    table.increments('id').primary();
    table.integer('applicant_id').unsigned().notNullable().references('id').inTable('applicants').onDelete('CASCADE');
    table.dateTime('interview_date').notNullable();
    table.string('type', 30).notNullable(); // phone, video, in-person
    table.string('interviewer', 100).notNullable();
    table.string('status', 30).notNullable().defaultTo('scheduled'); // scheduled, completed, cancelled
    table.text('notes').nullable();
    table.string('location', 255).nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('interviews');
};
