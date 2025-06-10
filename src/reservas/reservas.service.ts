import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoReserva, Prisma, Reserva } from '@prisma/client';
import * as dayjs from 'dayjs';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { CrearReservaDto } from './dtos/crear-reserva.dto';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

interface FiltrosReservas {
  idEspacio?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

@Injectable()
export class ReservasService {
  constructor(private prisma: PrismaService) {}

  async crearReserva(dto: CrearReservaDto): Promise<Reserva> {
    const { idEspacio, horaInicio, horaFin, notas } = dto;

    const inicio = dayjs(horaInicio);
    const fin = dayjs(horaFin);

    // 1. Validar fechas y horas
    if (!inicio.isValid() || !fin.isValid() || inicio.isSameOrBefore(dayjs())) {
      throw new BadRequestException(
        'Las fechas y horas de inicio/fin no son válidas o están en el pasado.',
      );
    }
    if (fin.isSameOrBefore(inicio)) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio.',
      );
    }

    // 2. Verificar existencia del espacio
    const espacio = await this.prisma.espacio.findUnique({
      where: { id: idEspacio },
    });

    if (!espacio) {
      throw new NotFoundException(`El espacio con ID ${idEspacio} no existe.`);
    }

    // 3. Verificar disponibilidad del espacio (sin solapamientos)
    const reservasExistentes = await this.prisma.reserva.findMany({
      where: {
        idEspacio: idEspacio,
        // Buscar reservas que se solapen con el rango propuesto
        OR: [
          {
            horaInicio: { lte: fin.toDate() },
            horaFin: { gte: inicio.toDate() },
          },
        ],
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA'], // Solo considerar reservas que ocupan el espacio
        },
      },
    });

    if (reservasExistentes.length > 0) {
      throw new BadRequestException(
        'El espacio no está disponible en el horario seleccionado.',
      );
    }

    // 4. Crear la reserva
    try {
      const nuevaReserva = await this.prisma.reserva.create({
        data: {
          idUsuario: 'f7d8bba9-7a66-4c2d-bc85-3470558f61fe',
          idEspacio: idEspacio,
          horaInicio: inicio.toDate(),
          horaFin: fin.toDate(),
          notas: notas,
          estado: 'PENDIENTE', // Por defecto, una nueva reserva puede estar pendiente de confirmación/pago
        },
      });
      return nuevaReserva;
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      throw new BadRequestException(
        'No se pudo crear la reserva. Intente de nuevo.',
      );
    }
  }

  async obtenerReservas(
    idUsuario: string,
    esAdmin: boolean,
    filtros: FiltrosReservas,
  ): Promise<Reserva[]> {
    const where: Prisma.ReservaScalarWhereInput = {};

    if (!esAdmin) {
      // Si no es administrador, solo puede ver sus propias reservas
      where.idUsuario = idUsuario;
    } else {
      // Si es administrador, aplicar filtros si se proporcionan
      if (filtros.idEspacio) {
        where.idEspacio = filtros.idEspacio;
      }
      if (filtros.estado) {
        // Validar que el estado sea uno de los valores del enum
        if (
          !Object.values(EstadoReserva).includes(
            filtros.estado as EstadoReserva,
          )
        ) {
          throw new BadRequestException(
            `Estado de reserva inválido: ${filtros.estado}`,
          );
        }
        where.estado = filtros.estado as EstadoReserva;
      }
      if (filtros.fechaInicio) {
        const fechaInicio = dayjs(filtros.fechaInicio).startOf('day');
        if (!fechaInicio.isValid()) {
          throw new BadRequestException(
            'Formato de fechaInicio inválido. Use YYYY-MM-DD.',
          );
        }
        where.horaInicio = { gte: fechaInicio.toDate() };
      }
      if (filtros.fechaFin) {
        const fechaFin = dayjs(filtros.fechaFin).endOf('day'); // Incluye todo el día final
        if (!fechaFin.isValid()) {
          throw new BadRequestException(
            'Formato de fechaFin inválido. Use YYYY-MM-DD.',
          );
        }
        where.horaFin = { lte: fechaFin.toDate() };
      }

      // Si se proporcionan ambas fechas, asegurar que inicio <= fin
      if (filtros.fechaInicio && filtros.fechaFin) {
        const inicio = dayjs(filtros.fechaInicio);
        const fin = dayjs(filtros.fechaFin);
        if (inicio.isAfter(fin)) {
          throw new BadRequestException(
            'La fecha de inicio no puede ser posterior a la fecha de fin.',
          );
        }
      }
    }

    return this.prisma.reserva.findMany({
      where,
      orderBy: {
        horaInicio: 'desc', // Ordenar por las reservas más recientes primero
      },
      include: {
        espacio: {
          select: {
            nombre: true,
            tipoEspacio: true,
            ubicacion: true,
          },
        },
        usuario: {
          select: {
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });
  }
}
