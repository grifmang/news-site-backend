
exports.seed = function(knex) {
  // Deletes ALL existing entries
      // Inserts seed entries
      return knex('users').insert([
        {name: 'timothy', email: 'tim@tim.com', password: '12345678'}
      ]);
};
