import { Module } from '@nestjs/common';
import { PrismaReservaRepository } from './infrastructure/repositories/reserva.repository';
import { CrearReservaUseCase } from './application/use-cases/crear-reserva.use-case';
import { ObtenerReservasUseCase } from './application/use-cases/obtener-reservas.use-case';
import { ReservasController } from './infrastructure/reservas.controller';

@Module({
  controllers: [ReservasController],
  providers: [
    PrismaReservaRepository,
    {
      provide: CrearReservaUseCase,
      useFactory: (repo: PrismaReservaRepository) =>
        new CrearReservaUseCase(repo),
      inject: [PrismaReservaRepository],
    },
    {
      provide: ObtenerReservasUseCase,
      useFactory: (repo: PrismaReservaRepository) =>
        new ObtenerReservasUseCase(repo),
      inject: [PrismaReservaRepository],
    },
  ],
})
export class ReservasModule {}
