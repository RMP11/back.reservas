import { Controller, Get, Param, Query } from '@nestjs/common';
import { EspacioUseCase } from '../application/use-cases/espacio.usecase';

@Controller('espacios')
export class EspacioController {
  constructor(private readonly espacioUseCase: EspacioUseCase) {}

  @Get()
  obtenerTodos() {
    return this.espacioUseCase.obtenerTodos();
  }

  @Get(':id/disponibilidad')
  obtenerDisponibilidad(
    @Param('id') id: string,
    @Query('fecha') fecha: string,
  ) {
    return this.espacioUseCase.obtenerDisponibilidad(id, fecha);
  }

  @Get('disponibilidad-global')
  obtenerDisponibilidadGlobal(
    @Query('fecha') fecha: string,
    @Query('tipoEspacio') tipoEspacio?: string,
  ) {
    return this.espacioUseCase.obtenerDisponibilidadGlobal(fecha, tipoEspacio);
  }
}
