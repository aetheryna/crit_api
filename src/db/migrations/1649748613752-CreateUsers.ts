import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateUsers1649748613752 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "users",
      columns: [
        {
          name: "user_id",
          type: "uuid",
          isGenerated: true,
          default: "gen_random_uuid()",
          isPrimary: true
        },
        {
          name: "firstName",
          type: "varchar",
          isNullable: false
        },
        {
          name: "lastName",
          type: "varchar",
          isNullable: false
        },
        {
          name: "email",
          type: "varchar",
          isUnique: true,
          isNullable: false
        },
        {
          name: "created_at",
          type: "timestamp",
          isNullable: true,
          default: "now()"
        },
        {
          name: "updated_at",
          type: "timestamp",
          isNullable: true,
          default: "now()"
        }
      ]
    }), true)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
