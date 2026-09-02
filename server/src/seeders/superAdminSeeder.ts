import User from '../models/user.model';

export const seedSuperAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existingSuperAdmin = await User.findOne({ email });

  if (existingSuperAdmin) {
    if (!existingSuperAdmin.isSuperAdmin || !existingSuperAdmin.isActive) {
      existingSuperAdmin.isSuperAdmin = true;
      existingSuperAdmin.isActive = true;
      await existingSuperAdmin.save();
    }

    return existingSuperAdmin;
  }

  return User.create({
    nome: process.env.ADMIN_FIRST_NAME || 'Super',
    cognome: process.env.ADMIN_LAST_NAME || 'Admin',
    email,
    password,
    isSuperAdmin: true,
    siteAccess: [],
    isActive: true,
  });
};
