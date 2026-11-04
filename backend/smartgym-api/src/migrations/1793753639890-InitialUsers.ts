
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUsers1793753639890 implements MigrationInterface {
  name = 'InitialUsers1793753639890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."usuarios_tipo_usuario_enum"
      AS ENUM('USER', 'ADMIN')
    `);

    await queryRunner.query(`
      CREATE TABLE "usuarios" (
        "id" SERIAL NOT NULL,
        "nome" character varying(150) NOT NULL,
        "email" character varying(150) NOT NULL,
        "senha_hash" character varying NOT NULL,
        "tipo_usuario" "public"."usuarios_tipo_usuario_enum"
          NOT NULL DEFAULT 'USER',
        "ativo" boolean NOT NULL DEFAULT true,
        "criado_em" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5"
          UNIQUE ("email"),
        CONSTRAINT "PK_d7281c63c176e152e4c531594a8"
          PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`
      DROP TYPE "public"."usuarios_tipo_usuario_enum"
    `);
  }
}

