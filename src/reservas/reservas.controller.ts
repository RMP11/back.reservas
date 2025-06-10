import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CrearReservaDto } from './dtos/crear-reserva.dto';
import { Reserva } from '@prisma/client';
import { ApiQuery } from '@nestjs/swagger';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  async crearReserva(@Body() crearReservaDto: CrearReservaDto) {
    return await this.reservasService.crearReserva(crearReservaDto);
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
  ): Promise<Reserva[]> {
    return this.reservasService.obtenerReservas(
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
