export enum TipoEspacio {
  SALON = 'SALON',
  AUDITORIO = 'AUDITORIO',
  CANCHA = 'CANCHA',
  SALA_REUNION = 'SALA_REUNION',
  OTRO = 'OTRO',
}

export class Espacio {
  constructor(
    public readonly id: string,
    public nombre: string,
    public descripcion: string | null,
    public capacidad: number | null,
    public tipoEspacio: TipoEspacio,
    public ubicacion: string | null,
    public fechaCreacion: Date | null,
    public fechaActualizacion: Date | null,
  ) {}
}
