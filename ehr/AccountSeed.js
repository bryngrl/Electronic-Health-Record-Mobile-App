const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ehr_db', //
};

const users = [
  // New Admin Account
  {
    full_name: 'System Administrator',
    email: 'admin123',
    password: 'password123',
    role: 'admin',
  },
  {
    full_name: 'Nurse',
    email: 'nurse123',
    password: 'password123',
    role: 'nurse',
  },
  {
    full_name: 'Doctor',
    email: 'doctor123',
    password: 'password123',
    role: 'doctor',
  },
];

function buildUsername(seedUser) {
  const email = (seedUser.email || '').trim().toLowerCase();
  const name = (seedUser.full_name || '').trim().toLowerCase();

  if (email) {
    return email.includes('@') ? email.split('@')[0] : email;
  }

  return name ? name.replace(/\s+/g, '_') : `user_${Date.now()}`;
}

async function seedAccounts() {
  console.log('--- Seeding User Accounts ---');
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    for (const user of users) {
      // Hashing the password for security
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const username = buildUsername(user);
      
      const [rows] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [user.email],
      );

      if (rows.length === 0) {
        // Create user if they don't exist
        await connection.execute(
          'INSERT INTO users (full_name, email, username, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          [user.full_name, user.email, username, hashedPassword, user.role, true],
        );
        console.log(`User ${user.email} created.`);
      } else {
        // Update existing user to ensure the role and password are correct
        await connection.execute(
          'UPDATE users SET username = ?, password = ?, role = ?, is_active = ? WHERE email = ?',
          [username, hashedPassword, user.role, true, user.email],
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