
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConversasMensagens1794337393026
  implements MigrationInterface
{
  name = 'CreateConversasMensagens1794337393026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "conversas" (
        "id" SERIAL NOT NULL,
        "acao_pendente" jsonb,
        "acao_pendente_expira_em" TIMESTAMP,
        "criada_em" TIMESTAMP NOT NULL DEFAULT now(),
        "atualizada_em" TIMESTAMP NOT NULL DEFAULT now(),
        "usuario_id" integer NOT NULL,
        CONSTRAINT "PK_437d17a2367997521e4f46cb5ab"
          PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "mensagens_chat" (
        "id" SERIAL NOT NULL,
        "remetente" character varying(10) NOT NULL,
        "conteudo" text NOT NULL,
        "intencao" character varying(80),
        "equipamento" character varying(150),
        "confianca" numeric(5,4),
        "criada_em" TIMESTAMP NOT NULL DEFAULT now(),
        "conversa_id" integer NOT NULL,
        CONSTRAINT "PK_03412d2421e231bc41b19115a02"
          PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "conversas"
      ADD CONSTRAINT "FK_008c39cec6da4c0b7b7d4c99ecf"
      FOREIGN KEY ("usuario_id")
      REFERENCES "usuarios"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "mensagens_chat"
      ADD CONSTRAINT "FK_28d41920f354c569c5dfc899809"
      FOREIGN KEY ("conversa_id")
      REFERENCES "conversas"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mensagens_chat"
      DROP CONSTRAINT "FK_28d41920f354c569c5dfc899809"
    `);

    await queryRunner.query(`
      ALTER TABLE "conversas"
      DROP CONSTRAINT "FK_008c39cec6da4c0b7b7d4c99ecf"
    `);

    await queryRunner.query(`DROP TABLE "mensagens_chat"`);
    await queryRunner.query(`DROP TABLE "conversas"`);
  }
}
