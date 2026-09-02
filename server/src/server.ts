import dotenv from "dotenv";
import app from "./app";
import { seedPermissionsAndRoles } from "./seeders/permissionsAndRolesSeeder";
import { seedSuperAdmin } from "./seeders/superAdminSeeder";

dotenv.config();

(async () => {
  const PORT = process.env.PORT || 2567;

  await seedPermissionsAndRoles();
  await seedSuperAdmin();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();
