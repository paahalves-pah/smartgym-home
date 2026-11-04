import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEquipamentos1793796421344 implements MigrationInterface {
    name = 'CreateEquipamentos1793796421344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."equipamentos_status_enum" AS ENUM('DISPONIVEL', 'EM_MANUTENCAO', 'INATIVO')`);
        await queryRunner.query(`CREATE TABLE "equipamentos" ("id" SERIAL NOT NULL, "nome" character varying(150) NOT NULL, "categoria" character varying(100) NOT NULL, "descricao" text, "status" "public"."equipamentos_status_enum" NOT NULL DEFAULT 'DISPONIVEL', "ativo" boolean NOT NULL DEFAULT true, "criado_em" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0db94e9eed96824cb4446343a86" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "equipamentos"`);
        await queryRunner.query(`DROP TYPE "public"."equipamentos_status_enum"`);
    }

}
