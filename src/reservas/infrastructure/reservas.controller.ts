import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { Reserva } from '@prisma/client';
import { ApiQuery } from '@nestjs/swagger';
import { CrearReservaUseCase } from '../application/use-cases/crear-reserva.use-case';
import { ObtenerReservasUseCase } from '../application/use-cases/obtener-reservas.use-case';
import { CrearReservaDto } from '../dtos/crear-reserva.dto';
import { ReservaEntity } from '../domain/entity/reserva.entity';

@Controller('reservas')
export class ReservasController {
  constructor(
    private readonly crearReservaUC: CrearReservaUseCase,
    private readonly obtenerReservasUC: ObtenerReservasUseCase,
  ) {}

  @Post()
  async crearReserva(@Body() crearReservaDto: CrearReservaDto) {
    // return await this.reservasService.crearReserva(crearReservaDto);
    return await this.crearReservaUC.execute(
      crearReservaDto,
      'f7d8bba9-7a66-4c2d-bc85-3470558f61fe',
    );
  }

  @Get()
  @ApiQuery({
    name: 'idEspacio',
    description: 'Filtrar por ID de espacio (solo para ADMIN)',
    required: false,
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'estado',
    description:
      'Filtrar por estado de reserva (solo para ADMIN, ej. PENDIENTE, CONFIRMADA)',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'fechaInicio',
    description:
      'Filtrar por fecha de inicio (solo para ADMIN, formato YYYY-MM-DD)',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'fechaFin',
    description:
      'Filtrar por fecha de fin (solo para ADMIN, formato YYYY-MM-DD)',
    required: false,
    type: 'string',
  })
  async obtenerReservas(
    @Query('idEspacio') idEspacio?: string,
    @Query('estado') estado?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ): Promise<ReservaEntity[]> {
    return await this.obtenerReservasUC.execute(
      'f7d8bba9-7a66-4c2d-bc85-3470558f61fe',
      true,
      {
        idEspacio,
        estado,
        fechaInicio,
        fechaFin,
      },
    );
  }
}
