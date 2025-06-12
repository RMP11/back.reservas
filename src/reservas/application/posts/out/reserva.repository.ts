import { ReservaEntity } from 'src/reservas/domain/entity/reserva.entity';
import { CrearReservaDto } from 'src/reservas/dtos/crear-reserva.dto';
import { FiltrosReservas } from 'src/reservas/dtos/filtros-reservas';

export interface ReservaRepository {
  crearReserva(
    data: CrearReservaDto,
    idUsuario: string,
  ): Promise<ReservaEntity>;
  obtenerReservas(
    idUsuario: string,
    esAdmin: boolean,
    filtros: FiltrosReservas,
  ): Promise<ReservaEntity[]>;
}
