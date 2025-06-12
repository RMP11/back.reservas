import { Global, Module } from '@nestjs/common';
import { EspacioUseCase } from './application/use-cases/espacio.usecase';
import { EspacioPrismaRepository } from './infrastructure/repositories/espacio.repository';
import { EspacioController } from './infrastructure/espacios.controller';

@Global()
@Module({
  controllers: [EspacioController],
  providers: [
    {
      provide: 'IEspacioService',
      useClass: EspacioPrismaRepository,
    },
    EspacioUseCase,
  ],
})
export class EspaciosModule {}
