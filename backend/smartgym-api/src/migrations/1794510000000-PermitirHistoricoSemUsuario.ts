import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermitirHistoricoSemUsuario1794510000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "utilizacoes"
      DROP CONSTRAINT "FK_73e9d103c2804b417650492f0ba"
    `);

    await queryRunner.query(`
      ALTER TABLE "utilizacoes"
      ALTER COLUMN "usuario_id" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "utilizacoes"
      ADD CONSTRAINT "FK_73e9d103c2804b417650492f0ba"
      FOREIGN KEY ("usuario_id")
      REFERENCES "usuarios"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "utilizacoes"
      DROP CONSTRAINT "FK_73e9d103c2804b417650492f0ba"
    `);

    await queryRunner.query(`
      ALTER TABLE "utilizacoes"
      ALTER COLUMN "usuario_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "utilizacoes"
      ADD CONSTRAINT "FK_73e9d103c2804b417650492f0ba"
      FOREIGN KEY ("usuario_id")
      REFERENCES "usuarios"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }
}