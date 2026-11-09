import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImagemEquipamento1794237303171 implements MigrationInterface {
    name = 'AddImagemEquipamento1794237303171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equipamentos" ADD "imagem" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equipamentos" DROP COLUMN "imagem"`);
    }

}
