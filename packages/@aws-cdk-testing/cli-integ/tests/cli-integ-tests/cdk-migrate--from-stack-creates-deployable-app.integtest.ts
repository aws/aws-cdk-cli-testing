import { promises as fs } from 'fs';
import * as path from 'path';
import { CreateStackCommand, DescribeStacksCommand } from "@aws-sdk/client-cloudformation";
import { integTest, sleep, withExtendedTimeoutFixture } from "../../lib";

['typescript', 'python', 'csharp', 'java'].forEach((language) => {
  integTest(
    `cdk migrate --from-stack creates deployable ${language} app`,
    withExtendedTimeoutFixture(async (fixture) => {
      const migrateStackName = fixture.fullStackName('migrate-stack');
      await fixture.aws.cloudFormation.send(
        new CreateStackCommand({
          StackName: migrateStackName,
          TemplateBody: await fs.readFile(
            path.join(__dirname, '..', '..', 'resources', 'templates', 'sqs-template.json'),
            'utf8',
          ),
        }),
      );
      try {
        let stackStatus = 'CREATE_IN_PROGRESS';
        while (stackStatus === 'CREATE_IN_PROGRESS') {
          stackStatus = await (
            await fixture.aws.cloudFormation.send(new DescribeStacksCommand({ StackName: migrateStackName }))
          ).Stacks?.[0].StackStatus!;
          await sleep(1000);
        }
        await fixture.cdk(['migrate', '--stack-name', migrateStackName, '--from-stack'], {
          modEnv: { MIGRATE_INTEG_TEST: '1' },
          neverRequireApproval: true,
          verbose: true,
          captureStderr: false,
        });
        await fixture.shell(['cd', path.join(fixture.integTestDir, migrateStackName)]);
        await fixture.cdk(['deploy', migrateStackName], {
          neverRequireApproval: true,
          verbose: true,
          captureStderr: false,
        });
        const response = await fixture.aws.cloudFormation.send(
          new DescribeStacksCommand({
            StackName: migrateStackName,
          }),
        );

        expect(response.Stacks?.[0].StackStatus).toEqual('UPDATE_COMPLETE');
      } finally {
        await fixture.cdkDestroy('migrate-stack');
      }
    }),
  );
});