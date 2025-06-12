import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PrismaReservaRepository } from './reserva.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('PrismaReservaRepository', () => {
  let repository: PrismaReservaRepository;

  const mockPrismaService = {
    espacio: {
      findUnique: jest.fn(),
    },
    reserva: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaReservaRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get(PrismaReservaRepository);
  });

  afterEach(() => jest.clearAllMocks());

  const now = dayjs();
  const crearReservaValida = {
    idEspacio: 'espacio1',
    horaInicio: now.add(2, 'hour').toISOString(),
    horaFin: now.add(3, 'hour').toISOString(),
    notas: 'Test reserva',
  };

  it('lanza error si la fecha es en el pasado', async () => {
    await expect(() =>
      repository.crearReserva(
        {
          ...crearReservaValida,
          horaInicio: now.subtract(1, 'hour').toISOString(),
        },
        'usuario1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza error si la horaFin es antes de horaInicio', async () => {
    await expect(() =>
      repository.crearReserva(
        {
          ...crearReservaValida,
          horaFin: now.add(1, 'hour').toISOString(),
          horaInicio: now.add(2, 'hour').toISOString(),
        },
        'usuario1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza error si el espacio no existe', async () => {
    mockPrismaService.espacio.findUnique.mockResolvedValue(null);

    await expect(() =>
      repository.crearReserva(crearReservaValida, 'usuario1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza error si hay reservas solapadas', async () => {
    mockPrismaService.espacio.findUnique.mockResolvedValue({ id: 'espacio1' });
    mockPrismaService.reserva.findMany.mockResolvedValue([{ id: 'reserva1' }]);

    await expect(() =>
      repository.crearReserva(crearReservaValida, 'usuario1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('crea una reserva válida correctamente', async () => {
    mockPrismaService.espacio.findUnique.mockResolvedValue({ id: 'espacio1' });
    mockPrismaService.reserva.findMany.mockResolvedValue([]);
    mockPrismaService.reserva.create.mockResolvedValue({
      id: 'reserva123',
      idUsuario: 'usuario1',
      idEspacio: crearReservaValida.idEspacio,
      horaInicio: new Date(crearReservaValida.horaInicio),
      horaFin: new Date(crearReservaValida.horaFin),
      notas: crearReservaValida.notas,
      estado: 'PENDIENTE',
    });

    const result = await repository.crearReserva(
      crearReservaValida,
      'usuario1',
    );

    expect(result).toEqual({
      id: 'reserva123',
      idUsuario: 'usuario1',
      idEspacio: crearReservaValida.idEspacio,
      horaInicio: new Date(crearReservaValida.horaInicio),
      horaFin: new Date(crearReservaValida.horaFin),
      notas: crearReservaValida.notas,
      estado: 'PENDIENTE',
    });

    expect(mockPrismaService.espacio.findUnique).toHaveBeenCalledWith({
      where: { id: crearReservaValida.idEspacio },
    });

    expect(mockPrismaService.reserva.findMany).toHaveBeenCalled();
  });
});
