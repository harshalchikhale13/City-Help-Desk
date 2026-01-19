const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function regenerateUserPasswords() {
  const password = 'Password123!';
  const usersPath = path.join(__dirname, '../data', 'users.json');
  
  // Generate hash
  const hash = await bcrypt.hash(password, 10);
  console.log('Generated hash for "Password123!":', hash);
  
  // Read users
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  
  // Update all passwords
  users.forEach(user => {
    user.password = hash;
  });
  
  // Write back
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  console.log('✅ All user passwords updated!');
  console.log('\nDemo Credentials:');
  console.log('- Email: citizen@example.com | Password: Password123!');
  console.log('- Email: officer@example.com | Password: Password123!');
  console.log('- Email: admin@example.com | Password: Password123!');
}

regenerateUserPasswords().catch(console.error);
