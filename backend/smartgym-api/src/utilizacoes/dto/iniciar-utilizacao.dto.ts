
import {
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class IniciarUtilizacaoDto {
  @IsInt({ message: 'Informe um ID de equipamento válido.' })
  @IsNotEmpty()
  @Min(1)
  equipamentoId: number;
}
