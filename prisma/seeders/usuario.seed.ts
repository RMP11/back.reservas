import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function UsuarioSeeder() {
  console.log('Seeding usuario...');

  const data: Prisma.UsuarioCreateManyInput[] = [
    {
      id: 'f7d8bba9-7a66-4c2d-bc85-3470558f61fe',
      email: 'admin@sample.com',
      contrasena: '123',
    },
  ];

  await prisma.usuario.createMany({
    data,
  });

  console.log('Seeding de usuario terminado.');
}
