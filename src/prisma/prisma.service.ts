import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger('PrismaService');
  async onModuleInit() {
    await this.$connect(); // Conectar automáticamente con la base de datos
    this.logger.log('Prisma Service Initialized');
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Desconectar la base de datos
  }
}
