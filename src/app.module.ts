import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EspaciosModule } from './espacios/espacios.module';
import { ReservasModule } from './reservas/reservas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [EspaciosModule, ReservasModule, UsuariosModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
