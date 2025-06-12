import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EstadoReserva, Prisma } from '@prisma/client';

import * as dayjs from 'dayjs';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { PrismaService } from '../../../prisma/prisma.service';

import { ReservaRepository } from 'src/reservas/application/posts/out/reserva.repository';
import { ReservaEntity } from 'src/reservas/domain/entity/reserva.entity';
import { CrearReservaDto } from 'src/reservas/dtos/crear-reserva.dto';
import { FiltrosReservas } from 'src/reservas/dtos/filtros-reservas';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

@Injectable()
export class PrismaReservaRepository implements ReservaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crearReserva(
    data: CrearReservaDto,
    idUsuario: string,
  ): Promise<ReservaEntity> {
    const { idEspacio, horaInicio, horaFin, notas } = data;

    const inicio = dayjs(horaInicio);
    const fin = dayjs(horaFin);

    if (!inicio.isValid() || !fin.isValid() || inicio.isSameOrBefore(dayjs())) {
      throw new BadRequestException('Fechas inválidas o en el pasado.');
    }
    if (fin.isSameOrBefore(inicio)) {
      throw new BadRequestException('Fin debe ser después de inicio.');
    }

    const espacio = await this.prisma.espacio.findUnique({
      where: { id: idEspacio },
    });
    if (!espacio) {
      throw new NotFoundException(`Espacio con ID ${idEspacio} no existe.`);
    }

    const solapadas = await this.prisma.reserva.findMany({
      where: {
        idEspacio,
        OR: [
          {
            horaInicio: { lte: fin.toDate() },
            horaFin: { gte: inicio.toDate() },
          },
        ],
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
    });

    if (solapadas.length > 0) {
      throw new BadRequestException('El espacio no está disponible.');
    }

    return (await this.prisma.reserva.create({
      data: {
        idUsuario,
        idEspacio,
        horaInicio: inicio.toDate(),
        horaFin: fin.toDate(),
        notas,
        estado: EstadoReserva.PENDIENTE,
      },
    })) as ReservaEntity;
  }

  async obtenerReservas(
    idUsuario: string,
    esAdmin: boolean,
    filtros: FiltrosReservas,
  ): Promise<ReservaEntity[]> {
    const where: Prisma.ReservaScalarWhereInput = {};

    if (!esAdmin) {
      where.idUsuario = idUsuario;
    } else {
      if (filtros.idEspacio) where.idEspacio = filtros.idEspacio;
      if (filtros.estado) {
        if (
          !Object.values(EstadoReserva).includes(
            filtros.estado as EstadoReserva,
          )
        ) {
          throw new BadRequestException(`Estado inválido: ${filtros.estado}`);
        }
        where.estado = filtros.estado as EstadoReserva;
      }

      if (filtros.fechaInicio) {
        const inicio = dayjs(filtros.fechaInicio).startOf('day');
        if (!inicio.isValid()) {
          throw new BadRequestException('fechaInicio inválida.');
        }
        where.horaInicio = { gte: inicio.toDate() };
      }

      if (filtros.fechaFin) {
        const fin = dayjs(filtros.fechaFin).endOf('day');
        if (!fin.isValid()) {
          throw new BadRequestException('fechaFin inválida.');
        }
        where.horaFin = Object.assign(where.horaFin || {}, {
          lte: fin.toDate(),
        });
      }

      if (filtros.fechaInicio && filtros.fechaFin) {
        if (dayjs(filtros.fechaInicio).isAfter(filtros.fechaFin)) {
          throw new BadRequestException(
            'fechaInicio no puede ser posterior a fechaFin.',
          );
        }
      }
    }

    return (await this.prisma.reserva.findMany({
      where,
      orderBy: { horaInicio: 'desc' },
      include: {
        espacio: {
          select: { nombre: true, tipoEspacio: true, ubicacion: true },
        },
        usuario: { select: { nombre: true, email: true, rol: true } },
      },
    })) as ReservaEntity[];
  }
}
