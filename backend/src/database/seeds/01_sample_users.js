const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Generate hashed passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('user123', salt);
  
  // Insert seed entries
  await knex('users').insert([
    {
      username: 'IT ADMINISTRATOR',
      password: '$2b$10$.zZvkmcWZYfhwabmWYDMde4BsNJtRylGfBsk6WQvcB6sWsf6biRla', // Using provided hash
      email: 'it.admin@vismotor.com',
      first_name: 'IT',
      last_name: 'ADMIN',
      role: 'it_admin',
      created_at: new Date('2025-05-06 17:25:46'),
      updated_at: new Date('2025-05-06 17:26:58')
    }
  ]);
};
