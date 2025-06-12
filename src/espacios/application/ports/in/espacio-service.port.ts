// src/application/ports/in/espacio-service.port.ts

import { Espacio, TipoEspacio } from '../../../domain/entities/espacio.entity';

export interface IEspacioServicePort {
  obtenerTodos(): Promise<Espacio[]>;

  obtenerDisponibilidad(
    idEspacio: string,
    fecha: string, // YYYY-MM-DD
  ): Promise<{ fecha: string; franjasDisponibles: string[] }>;

  obtenerDisponibilidadGlobal(
    fecha: string,
    tipoEspacio?: string,
  ): Promise<{
    fecha: string;
    espacios: Record<
      string,
      { nombre: string; tipoEspacio: TipoEspacio; disponibilidad: string[] }
    >;
  }>;
}
