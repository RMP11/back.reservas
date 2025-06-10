import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function EspacioSeeder() {
  console.log('Seeding espacio...');

  const data: Prisma.EspacioCreateManyInput[] = [
    {
      nombre: 'Salón Comunitario Principal',
      descripcion:
        'Amplio salón ideal para eventos grandes, reuniones y celebraciones.',
      capacidad: 100,
      tipoEspacio: 'SALON',
      ubicacion: 'Edificio Central, Planta Baja',
    },
    {
      nombre: 'Auditorio Municipal',
      descripcion:
        'Equipado con proyector, sonido y asientos cómodos para presentaciones y conferencias.',
      capacidad: 150,
      tipoEspacio: 'AUDITORIO',
      ubicacion: 'Anexo Norte, Piso 2',
    },
    {
      nombre: 'Cancha de Baloncesto Multiusos',
      descripcion:
        'Cancha techada para baloncesto, fútbol sala y otras actividades deportivas.',
      capacidad: 50,
      tipoEspacio: 'CANCHA',
      ubicacion: 'Zona Deportiva, Sector A',
    },
    {
      nombre: 'Sala de Reuniones "La Colina"',
      descripcion:
        'Pequeña sala privada para reuniones de equipo o talleres íntimos.',
      capacidad: 12,
      tipoEspacio: 'SALA_REUNION',
      ubicacion: 'Edificio Central, Piso 1',
    },
    {
      nombre: 'Área de Parrilladas "El Roble"',
      descripcion:
        'Espacio al aire libre con parrilleros, mesas y áreas verdes para eventos recreativos.',
      capacidad: 30,
      tipoEspacio: 'OTRO', // Usamos OTRO para casos que no encajan directamente
      ubicacion: 'Jardines del Oeste',
    },
    {
      nombre: 'Salón de Usos Múltiples Pequeño',
      descripcion:
        'Salón versátil para clases, talleres y eventos de menor escala.',
      capacidad: 40,
      tipoEspacio: 'SALON',
      ubicacion: 'Anexo Este, Planta Baja',
    },
    {
      nombre: 'Cancha de Tenis',
      descripcion: 'Cancha exterior para jugar al tenis.',
      capacidad: 4,
      tipoEspacio: 'CANCHA',
      ubicacion: 'Zona Deportiva, Sector B',
    },
  ];

  await prisma.espacio.createMany({
    data,
  });

  console.log('Seeding de espacios terminado.');
}
