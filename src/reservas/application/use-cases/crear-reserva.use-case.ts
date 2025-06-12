import { CrearReservaDto } from 'src/reservas/dtos/crear-reserva.dto';
import { ReservaRepository } from '../posts/out/reserva.repository';
import { ReservaEntity } from 'src/reservas/domain/entity/reserva.entity';

export class CrearReservaUseCase {
  constructor(private readonly reservaRepo: ReservaRepository) {}

  async execute(
    data: CrearReservaDto,
    idUsuario: string,
  ): Promise<ReservaEntity> {
    return await this.reservaRepo.crearReserva(data, idUsuario);
  }
}
