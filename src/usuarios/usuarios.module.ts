import { Module } from '@nestjs/common';
import { UsuariosServices } from './usuarios.services';
import { UsuariosController } from './usuarios.controller';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosServices],
})
export class UsuariosModule {}
