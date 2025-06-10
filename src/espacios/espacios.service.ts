import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Asegúrate de tener un PrismaService
import { Espacio, TipoEspacio, Reserva } from '@prisma/client';
import * as dayjs from 'dayjs'; // Para manejo de fechas, puedes instalar 'dayjs'
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

@Injectable()
export class EspaciosService {
  constructor(private prisma: PrismaService) {}

  async obtenerTodosLosEspacios(): Promise<Espacio[]> {
    return this.prisma.espacio.findMany();
  }

  async obtenerDisponibilidadEspacio(
    idEspacio: string,
    fecha: string,
  ): Promise<{ fecha: string; franjasDisponibles: string[] }> {
    const espacio = await this.prisma.espacio.findUnique({
      where: { id: idEspacio },
    });

    if (!espacio) {
      throw new NotFoundException(`Espacio con ID ${idEspacio} no encontrado.`);
    }

    const fechaConsulta = dayjs(fecha).startOf('day');
    if (!fechaConsulta.isValid()) {
      throw new Error('Formato de fecha inválido. Use YYYY-MM-DD.');
    }

    // Obtener las reservas para este espacio en la fecha seleccionada
    const reservas = await this.prisma.reserva.findMany({
      where: {
        idEspacio: idEspacio,
        horaInicio: {
          gte: fechaConsulta.toDate(),
          lt: fechaConsulta.add(1, 'day').toDate(),
        },
        // Considerar solo reservas confirmadas o pendientes para la disponibilidad
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA'],
        },
      },
      orderBy: {
        horaInicio: 'asc',
      },
    });

    // Lógica para determinar franjas disponibles (ej. franjas de 1 hora)
    // Esto es un ejemplo, la lógica real puede ser más compleja dependiendo de tus requisitos
    const franjasDisponibles: string[] = [];
    const inicioOperacion = dayjs(fechaConsulta)
      .set('hour', 8)
      .set('minute', 0)
      .set('second', 0); // Ejemplo: 8 AM
    const finOperacion = dayjs(fechaConsulta)
      .set('hour', 22)
      .set('minute', 0)
      .set('second', 0); // Ejemplo: 10 PM

    let horaActual = inicioOperacion;
    while (horaActual.isSameOrBefore(finOperacion)) {
      const proximaHora = horaActual.add(1, 'hour'); // Franjas de 1 hora

      // Verificar si esta franja de 1 hora está libre
      const estaLibre = !reservas.some((reserva) => {
        const reservaInicio = dayjs(reserva.horaInicio);
        const reservaFin = dayjs(reserva.horaFin);

        // Si la franja propuesta se solapa con una reserva existente
        return (
          (horaActual.isSameOrAfter(reservaInicio) &&
            horaActual.isBefore(reservaFin)) ||
          (proximaHora.isAfter(reservaInicio) &&
            proximaHora.isSameOrBefore(reservaFin)) ||
          (reservaInicio.isSameOrAfter(horaActual) &&
            reservaFin.isSameOrBefore(proximaHora))
        );
      });

      if (estaLibre) {
        franjasDisponibles.push(
          `${horaActual.format('HH:mm')} - ${proximaHora.format('HH:mm')}`,
        );
      }

      horaActual = proximaHora;
    }

    return { fecha: fecha, franjasDisponibles: franjasDisponibles };
  }

  async obtenerDisponibilidadGlobal(
    fecha: string,
    tipoEspacio?: string,
  ): Promise<any> {
    const fechaConsulta = dayjs(fecha).startOf('day');
    if (!fechaConsulta.isValid()) {
      throw new Error('Formato de fecha inválido. Use YYYY-MM-DD.');
    }

    const whereClause: any = {};
    if (tipoEspacio) {
      whereClause.tipoEspacio = tipoEspacio as TipoEspacio; // Castear al tipo de enum
    }

    const espacios = await this.prisma.espacio.findMany({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
          orderBy: {
            horaInicio: 'asc',
          },
        },
      },
    });

    const resultadosDisponibilidad: {
      [key: string]: {
        nombre: string;
        tipoEspacio: TipoEspacio;
        disponibilidad: string[];
      };
    } = {};

    for (const espacio of espacios) {
      const franjasDisponibles: string[] = [];
      const inicioOperacion = dayjs(fechaConsulta)
        .set('hour', 8)
        .set('minute', 0)
        .set('second', 0);
      const finOperacion = dayjs(fechaConsulta)
        .set('hour', 22)
        .set('minute', 0)
        .set('second', 0);

      let horaActual = inicioOperacion;
      while (horaActual.isSameOrBefore(finOperacion)) {
        const proximaHora = horaActual.add(1, 'hour');

        const estaLibre = !espacio.reservas.some((reserva) => {
          const reservaInicio = dayjs(reserva.horaInicio);
          const reservaFin = dayjs(reserva.horaFin);

          return (
            (horaActual.isSameOrAfter(reservaInicio) &&
              horaActual.isBefore(reservaFin)) ||
            (proximaHora.isAfter(reservaInicio) &&
              proximaHora.isSameOrBefore(reservaFin)) ||
            (reservaInicio.isSameOrAfter(horaActual) &&
              reservaFin.isSameOrBefore(proximaHora))
          );
        });

        if (estaLibre) {
          franjasDisponibles.push(
            `${horaActual.format('HH:mm')} - ${proximaHora.format('HH:mm')}`,
          );
        }

        horaActual = proximaHora;
      }
      resultadosDisponibilidad[espacio.id] = {
        nombre: espacio.nombre,
        tipoEspacio: espacio.tipoEspacio,
        disponibilidad: franjasDisponibles,
      };
    }

    return {
      fecha: fecha,
      espacios: resultadosDisponibilidad,
    };
  }
}
