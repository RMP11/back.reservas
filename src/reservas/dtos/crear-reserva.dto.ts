import {
  IsUUID,
  IsISO8601,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearReservaDto {
  @ApiProperty({ description: 'ID del espacio a reservar', format: 'uuid' })
  @IsUUID('4', { message: 'El ID del espacio debe ser un UUID válido.' })
  idEspacio: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio de la reserva (formato ISO 8601)',
    example: '2025-06-10T10:00:00Z',
  })
  @IsISO8601(
    {},
    {
      message:
        'La hora de inicio debe ser una fecha y hora válidas en formato ISO 8601.',
    },
  )
  horaInicio: string; // Se recomienda recibirlo como string ISO 8601 y convertir a Date en el servicio

  @ApiProperty({
    description: 'Fecha y hora de fin de la reserva (formato ISO 8601)',
    example: '2025-06-10T12:00:00Z',
  })
  @IsISO8601(
    {},
    {
      message:
        'La hora de fin debe ser una fecha y hora válidas en formato ISO 8601.',
    },
  )
  horaFin: string; // Se recomienda recibirlo como string ISO 8601 y convertir a Date en el servicio

  @ApiProperty({
    description: 'Notas adicionales para la reserva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto.' })
  @IsNotEmpty({
    message: 'Las notas no pueden estar vacías si se proporcionan.',
  })
  notas?: string;
}
