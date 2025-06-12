import { Injectable, NotFoundException } from '@nestjs/common';
import { IEspacioServicePort } from '../../application/ports/in/espacio-service.port';
import { Espacio, TipoEspacio } from '../../domain/entities/espacio.entity';
import * as dayjs from 'dayjs';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { PrismaService } from 'src/prisma/prisma.service';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

@Injectable()
export class EspacioPrismaRepository implements IEspacioServicePort {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerTodos(tipoEspacio?: TipoEspacio): Promise<Espacio[]> {
    const espacios = await this.prisma.espacio.findMany({
      where: tipoEspacio ? { tipoEspacio } : {},
    });

    return espacios.map(
      (e) =>
        new Espacio(
          e.id,
          e.nombre,
          e.descripcion,
          e.capacidad,
          e.tipoEspacio as TipoEspacio,
          e.ubicacion,
          e.fechaCreacion,
          e.fechaActualizacion,
        ),
    );
  }

  async obtenerDisponibilidad(
    idEspacio: string,
    fecha: string,
  ): Promise<{ fecha: string; franjasDisponibles: string[] }> {
    const espacio = await this.prisma.espacio.findUnique({
      where: { id: idEspacio },
    });

    if (!espacio) {
      throw new NotFoundException(`Espacio con id ${idEspacio} no encontrado`);
    }

    const fechaConsulta = dayjs(fecha).startOf('day');
    if (!fechaConsulta.isValid()) {
      throw new Error('Fecha inválida. Formato esperado: YYYY-MM-DD');
    }

    const reservas = await this.prisma.reserva.findMany({
      where: {
        idEspacio,
        horaInicio: {
          gte: fechaConsulta.toDate(),
          lt: fechaConsulta.add(1, 'day').toDate(),
        },
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA'],
        },
      },
      orderBy: {
        horaInicio: 'asc',
      },
    });

    const franjasDisponibles: string[] = [];
    let current = fechaConsulta.set('hour', 8);
    const fin = fechaConsulta.set('hour', 22);

    while (current.isBefore(fin)) {
      const next = current.add(1, 'hour');
      const libre = !reservas.some((r) => {
        const rStart = dayjs(r.horaInicio);
        const rEnd = dayjs(r.horaFin);
        return (
          (current.isSameOrAfter(rStart) && current.isBefore(rEnd)) ||
          (next.isAfter(rStart) && next.isSameOrBefore(rEnd)) ||
          (rStart.isSameOrAfter(current) && rEnd.isSameOrBefore(next))
        );
      });

      if (libre) {
        franjasDisponibles.push(
          `${current.format('HH:mm')} - ${next.format('HH:mm')}`,
        );
      }

      current = next;
    }

    return { fecha, franjasDisponibles };
  }

  async obtenerDisponibilidadGlobal(
    fecha: string,
    tipoEspacio?: TipoEspacio,
  ): Promise<{
    fecha: string;
    espacios: Record<
      string,
      { nombre: string; tipoEspacio: TipoEspacio; disponibilidad: string[] }
    >;
  }> {
    const fechaConsulta = dayjs(fecha).startOf('day');
    if (!fechaConsulta.isValid()) {
      throw new Error('Fecha inválida. Formato esperado: YYYY-MM-DD');
    }

    const whereClause: any = {};
    if (tipoEspacio) whereClause.tipoEspacio = tipoEspacio;

    const espacios = await this.prisma.espacio.findMany({
      where: whereClause,
      include: {
        reservas: {
          where: {
            horaInicio: {
              gte: fechaConsulta.toDate(),
              lt: fechaConsulta.add(1, 'day').toDate(),
            },
            estado: {
              in: ['PENDIENTE', 'CONFIRMADA'],
            },
          },
          orderBy: { horaInicio: 'asc' },
        },
      },
    });

    const resultados: Record<
      string,
      { nombre: string; tipoEspacio: TipoEspacio; disponibilidad: string[] }
    > = {};

    for (const espacio of espacios) {
      const franjasDisponibles: string[] = [];
      let current = fechaConsulta.set('hour', 8);
      const fin = fechaConsulta.set('hour', 22);

      while (current.isBefore(fin)) {
        const next = current.add(1, 'hour');
        const libre = !espacio.reservas.some((r) => {
          const rStart = dayjs(r.horaInicio);
          const rEnd = dayjs(r.horaFin);
          return (
            (current.isSameOrAfter(rStart) && current.isBefore(rEnd)) ||
            (next.isAfter(rStart) && next.isSameOrBefore(rEnd)) ||
            (rStart.isSameOrAfter(current) && rEnd.isSameOrBefore(next))
          );
        });

        if (libre) {
          franjasDisponibles.push(
            `${current.format('HH:mm')} - ${next.format('HH:mm')}`,
          );
        }
        current = next;
      }

      resultados[espacio.id] = {
        nombre: espacio.nombre,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tipoEspacio: espacio.tipoEspacio as any,
        disponibilidad: franjasDisponibles,
      };
    }

    return { fecha, espacios: resultados };
  }
}
