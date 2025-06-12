import { Espacio } from 'src/espacios/domain/entities/espacio.entity';

export interface EspacioRepository {
  obtenerTodos(): Promise<Espacio[]>;
  obtenerPorId(id: string): Promise<Espacio | null>;
  obtenerConReservasEnFecha(
    fecha: string,
    tipoEspacio?: string,
  ): Promise<(Espacio & { reservas: { horaInicio: Date; horaFin: Date }[] })[]>;
  obtenerReservasPorEspacioYFecha(
    idEspacio: string,
    fecha: string,
  ): Promise<{ horaInicio: Date; horaFin: Date }[]>;
}
