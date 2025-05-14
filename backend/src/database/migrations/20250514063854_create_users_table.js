/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('role', 20).notNullable().defaultTo('user');
    table.string('profile_picture', 255).nullable();
    table.string('phone', 20).nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
