import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUtilizacoes1793800063674 implements MigrationInterface {
    name = 'CreateUtilizacoes1793800063674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."utilizacoes_status_enum" AS ENUM('EM_ANDAMENTO', 'FINALIZADA')`);
        await queryRunner.query(`CREATE TABLE "utilizacoes" ("id" SERIAL NOT NULL, "inicio_em" TIMESTAMP NOT NULL DEFAULT now(), "fim_em" TIMESTAMP, "status" "public"."utilizacoes_status_enum" NOT NULL DEFAULT 'EM_ANDAMENTO', "usuario_id" integer NOT NULL, "equipamento_id" integer NOT NULL, CONSTRAINT "PK_3cbeb3142bd60a146d38c56395c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "utilizacoes" ADD CONSTRAINT "FK_73e9d103c2804b417650492f0ba" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "utilizacoes" ADD CONSTRAINT "FK_7835cf1cc8a878cb52b5f1a509c" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "utilizacoes" DROP CONSTRAINT "FK_7835cf1cc8a878cb52b5f1a509c"`);
        await queryRunner.query(`ALTER TABLE "utilizacoes" DROP CONSTRAINT "FK_73e9d103c2804b417650492f0ba"`);
        await queryRunner.query(`DROP TABLE "utilizacoes"`);
        await queryRunner.query(`DROP TYPE "public"."utilizacoes_status_enum"`);
    }

}
