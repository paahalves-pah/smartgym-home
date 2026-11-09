
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFotoUrlUsuario1794258678077
  implements MigrationInterface
{
  name = 'AddFotoUrlUsuario1794258678077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios"
      ADD "foto_url" character varying(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios"
      DROP COLUMN "foto_url"
    `);
  }
}
