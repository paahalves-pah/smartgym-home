import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateManutencoes1793817004180 implements MigrationInterface {
    name = 'CreateManutencoes1793817004180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."manutencoes_tipo_enum" AS ENUM('PREVENTIVA', 'CORRETIVA')`);
        await queryRunner.query(`CREATE TYPE "public"."manutencoes_status_enum" AS ENUM('AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')`);
        await queryRunner.query(`CREATE TABLE "manutencoes" ("id" SERIAL NOT NULL, "tipo" "public"."manutencoes_tipo_enum" NOT NULL, "descricao" text NOT NULL, "data_prevista" TIMESTAMP NOT NULL, "data_inicio" TIMESTAMP, "data_conclusao" TIMESTAMP, "status" "public"."manutencoes_status_enum" NOT NULL DEFAULT 'AGENDADA', "responsavel" character varying(150), "observacoes" text, "criado_em" TIMESTAMP NOT NULL DEFAULT now(), "equipamento_id" integer NOT NULL, CONSTRAINT "PK_111387939cd265e4e30b3653433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "manutencoes" ADD CONSTRAINT "FK_5066a63d187218ceaceb3f7d36a" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manutencoes" DROP CONSTRAINT "FK_5066a63d187218ceaceb3f7d36a"`);
        await queryRunner.query(`DROP TABLE "manutencoes"`);
        await queryRunner.query(`DROP TYPE "public"."manutencoes_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."manutencoes_tipo_enum"`);
    }

}
