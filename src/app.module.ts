import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EspaciosController } from './espacios/espacios.controller';
import { EspaciosService } from './espacios/espacios.service';
import { PrismaService } from './prisma/prisma.service';
import { ReservasService } from './reservas/reservas.service';
import { ReservasController } from './reservas/reservas.controller';
import { UsuariosController } from './usuarios/usuarios.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    EspaciosController,
    ReservasController,
    UsuariosController,
  ],
  providers: [AppService, PrismaService, EspaciosService, ReservasService],
})
export class AppModule {}
