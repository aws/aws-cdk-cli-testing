import { DescribeStacksCommand } from "@aws-sdk/client-cloudformation";
import { TestFixture } from "../../../lib";

export async function deploysSuccessfully(fixture: TestFixture, language: string) {
  if (language === 'python') {
    await fixture.shell(['pip', 'install', '-r', 'requirements.txt']);
  }

  const stackArn = await fixture.cdkDeploy(
    fixture.stackNamePrefix,
    { neverRequireApproval: true, verbose: true, captureStderr: false },
    true,
  );
  const response = await fixture.aws.cloudFormation.send(
    new DescribeStacksCommand({
      StackName: stackArn,
    }),
  );

  expect(response.Stacks?.[0].StackStatus).toEqual('CREATE_COMPLETE');
  await fixture.cdkDestroy(fixture.stackNamePrefix);
}