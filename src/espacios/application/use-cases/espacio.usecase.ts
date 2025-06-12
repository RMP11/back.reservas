import { Inject, Injectable } from '@nestjs/common';
import { IEspacioServicePort } from '../ports/in/espacio-service.port';
import { Espacio, TipoEspacio } from '../../domain/entities/espacio.entity';

@Injectable()
export class EspacioUseCase implements IEspacioServicePort {
  constructor(
    @Inject('IEspacioService')
    private readonly espacioRepo: IEspacioServicePort,
  ) {}

  async obtenerTodos(): Promise<Espacio[]> {
    return this.espacioRepo.obtenerTodos();
  }

  async obtenerDisponibilidad(
    idEspacio: string,
    fecha: string,
  ): Promise<{ fecha: string; franjasDisponibles: string[] }> {
    // Validaciones, reglas de negocio...
    return this.espacioRepo.obtenerDisponibilidad(idEspacio, fecha);
  }

  async obtenerDisponibilidadGlobal(
    fecha: string,
    tipoEspacio?: string,
  ): Promise<{
    fecha: string;
    espacios: Record<
      string,
      { nombre: string; tipoEspacio: TipoEspacio; disponibilidad: string[] }
    >;
  }> {
    return this.espacioRepo.obtenerDisponibilidadGlobal(fecha, tipoEspacio);
  }
}
