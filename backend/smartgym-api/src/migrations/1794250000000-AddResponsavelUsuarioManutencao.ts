import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResponsavelUsuarioManutencao1794250000000
  implements MigrationInterface
{
  name = 'AddResponsavelUsuarioManutencao1794250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "manutencoes"
      ADD COLUMN "responsavel_id" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "manutencoes"
      ADD CONSTRAINT "FK_manutencoes_responsavel_usuario"
      FOREIGN KEY ("responsavel_id")
      REFERENCES "usuarios"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "manutencoes"
      DROP CONSTRAINT "FK_manutencoes_responsavel_usuario"
    `);

    await queryRunner.query(`
      ALTER TABLE "manutencoes"
      DROP COLUMN "responsavel_id"
    `);
  }
}
