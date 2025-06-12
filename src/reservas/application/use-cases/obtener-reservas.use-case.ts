import { FiltrosReservas } from 'src/reservas/dtos/filtros-reservas';
import { ReservaRepository } from '../posts/out/reserva.repository';
import { ReservaEntity } from 'src/reservas/domain/entity/reserva.entity';

export class ObtenerReservasUseCase {
  constructor(private readonly reservaRepo: ReservaRepository) {}

  async execute(
    idUsuario: string,
    esAdmin: boolean,
    filtros: FiltrosReservas,
  ): Promise<ReservaEntity[]> {
    return this.reservaRepo.obtenerReservas(idUsuario, esAdmin, filtros);
  }
}
