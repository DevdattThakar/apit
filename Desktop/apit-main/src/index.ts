import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { usersTable } from './db/schema';
  
const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const user: typeof usersTable.$inferInsert = {
    fullName: 'John Doe',
    phone: '123-456-7890',
  };

  // Create User
  await db.insert(usersTable).values(user);
  console.log('New user created!')

  // Read Users
  const users = await db.select().from(usersTable);
  console.log('Getting all users from the database: ', users)

  // Update User
  await db
    .update(usersTable)
    .set({
      phone: '098-765-4321',
    })
    .where(eq(usersTable.fullName, user.fullName as string));
  console.log('User info updated!')

  // Delete User
  await db.delete(usersTable).where(eq(usersTable.fullName, user.fullName as string));
  console.log('User deleted!')
}

main();
