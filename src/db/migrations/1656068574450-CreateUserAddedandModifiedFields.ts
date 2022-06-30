import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateUserAddedandModifiedFields1656068574450
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'varchar',
        default: 'user',
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'refreshToken',
        type: 'varchar',
        isNullable: false,
      }),
    );

    await queryRunner.renameColumn(
      'users',
      'userName',
      new TableColumn({
        name: 'userName',
        type: 'varchar',
        isUnique: true,
        isNullable: false,
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
