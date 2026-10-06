import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import { seedPermissionsAndRoles } from "./seeders/permissionsAndRolesSeeder";
import { seedSuperAdmin } from "./seeders/superAdminSeeder";
import { seedMockDataPosts } from "./seeders/mockDataPostSeeder";
import { startArticleWorker } from "./workers/article.worker";
import { seedVectorSearchIndexes } from "./seeders/vectorSearchIndexesSeeder";
dotenv.config();

(async () => {
  const PORT = process.env.PORT || 2567;
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI non definita");
    }

    console.log("Connessione a MongoDB...");

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connesso");

    /* Seeders */
    await seedPermissionsAndRoles();
    await seedSuperAdmin();
    await seedMockDataPosts();
    await seedVectorSearchIndexes();
    
    /* Redis worker */
    startArticleWorker()
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Errore durante l'avvio del server:", error);
    process.exit(1);
  }


})();