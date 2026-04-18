import { User } from "../model/user.models";
import bcrypt from "bcrypt";
import { config } from "../config";

const users = [
  {
    _id: "admin-001",
    name: "Admin User",
    email: "admin@eshop.com",
    password: "admin123",
    role: "admin" as const,
    gender: "male" as const,
    dob: "1990-01-01",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
  },
  {
    _id: "user-001",
    name: "John Doe",
    email: "john@example.com",
    password: "user123",
    role: "user" as const,
    gender: "male" as const,
    dob: "1995-05-15",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    _id: "user-002",
    name: "Jane Smith",
    email: "jane@example.com",
    password: "user123",
    role: "user" as const,
    gender: "female" as const,
    dob: "1998-08-22",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  {
    _id: "user-003",
    name: "Test User",
    email: "test@test.com",
    password: "test123",
    role: "user" as const,
    gender: "other" as const,
    dob: "2000-03-10",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Test",
  },
];

export const seedUsers = async () => {
  try {
    console.log("Seeding users...");
    
    // Clear existing users (optional - remove if you want to keep existing)
    await User.deleteMany({});
    
    for (const userData of users) {
      const existingUser = await User.findById(userData._id);
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      await User.create({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        gender: userData.gender,
        dob: new Date(userData.dob),
        photo: userData.photo,
      });
      
      console.log(`Created ${userData.role}: ${userData.email} / ${userData.password}`);
    }
    
    console.log("User seeding completed!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@eshop.com / admin123");
    console.log("User:  john@example.com / user123");
    console.log("User:  jane@example.com / user123");
    console.log("User:  test@test.com / test123");
    
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

// Run if called directly
if (require.main === module) {
  import("../services/db.service").then(({ connectDB }) => {
    connectDB().then(() => {
      seedUsers().then(() => {
        console.log("Done");
        process.exit(0);
      });
    });
  });
}
