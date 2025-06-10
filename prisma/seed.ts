import { PrismaClient } from '@prisma/client';
import { EspacioSeeder } from './seeders/espacios.seed';
import { UsuarioSeeder } from './seeders/usuario.seed';

const prisma = new PrismaClient();

async function main() {
  await EspacioSeeder();
  await UsuarioSeeder();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
