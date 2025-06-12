export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  COMPLETADA = 'COMPLETADA',
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export class ReservaEntity {
  constructor(
    public readonly id: string,
    public readonly idUsuario: string,
    public readonly idEspacio: string,
    public readonly horaInicio: Date,
    public readonly horaFin: Date,
    public readonly estado: EstadoReserva,
    public readonly notas?: string,
    public readonly idPago?: string,
    public readonly estadoPago?: EstadoPago,
    public readonly fechaCreacion?: Date,
    public readonly fechaActualizacion?: Date,
  ) {}
}
