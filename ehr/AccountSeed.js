const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ehr_db',
};

const users = [
  {
    full_name: 'Nurse',
    email: 'nurse123',
    password: 'password123',
    role: 'NURSE',
  },
  {
    full_name: 'Doctor',
    email: 'doctor123',
    password: 'password123',
    role: 'DOCTOR',
  },
];

async function seedAccounts() {
  console.log('--- Seeding User Accounts ---');
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const [rows] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [user.email],
      );

      if (rows.length === 0) {
        await connection.execute(
          'INSERT INTO users (full_name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
          [user.full_name, user.email, hashedPassword, user.role, true],
        );
        console.log(`User ${user.email} created.`);
      } else {
        await connection.execute(
          'UPDATE users SET password = ?, role = ? WHERE email = ?',
          [hashedPassword, user.role, user.email],
        );
        console.log(`User ${user.email} updated.`);
      }
    }
    await connection.end();
    console.log('Account seeding complete.\n');
  } catch (error) {
    console.error('Error seeding accounts:', error.message);
  }
}

seedAccounts();
