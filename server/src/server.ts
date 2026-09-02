import dotenv from "dotenv";
import app from "./app";

dotenv.config();

(async () => {
  
  const PORT = process.env.PORT || 2567;

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  //await adminSeeder();
})();
