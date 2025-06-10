import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { EspaciosService } from './espacios.service';
import { Espacio } from '@prisma/client';

@Controller('espacios')
export class EspaciosController {
  constructor(private readonly espaciosService: EspaciosService) {}

  @Get()
  async obtenerTodosLosEspacios(): Promise<Espacio[]> {
    return this.espaciosService.obtenerTodosLosEspacios();
  }

  @Get(':id/disponibilidad')
  async obtenerDisponibilidadEspacio(
    @Param('id', ParseUUIDPipe) idEspacio: string,
    @Query('fecha') fecha: string, // Esperamos 'YYYY-MM-DD'
  ): Promise<{ fecha: string; franjasDisponibles: string[] }> {
    // Aquí puedes añadir validación para el formato de la fecha si lo deseas
    return this.espaciosService.obtenerDisponibilidadEspacio(idEspacio, fecha);
  }

  @Get('disponibilidad')
  async obtenerDisponibilidadGlobal(
    @Query('fecha') fecha: string,
    @Query('tipoEspacio') tipoEspacio?: string, // Opcional
  ): Promise<any> {
    // Puedes definir un DTO más específico para el retorno
    return this.espaciosService.obtenerDisponibilidadGlobal(fecha, tipoEspacio);
  }
}
