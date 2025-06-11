import { Global, Module } from '@nestjs/common';
import { EspaciosService } from './espacios.service';
import { EspaciosController } from './espacios.controller';

@Global()
@Module({
  controllers: [EspaciosController],
  providers: [EspaciosService],
})
export class EspaciosModule {}
