import { DescribeStacksCommand } from "@aws-sdk/client-cloudformation";
import { integTest, withCDKMigrateFixture } from "../../lib";

// TODO add more testing that ensures the symmetry of the generated constructs to the resources.
['typescript', 'python', 'csharp', 'java'].forEach((language) => {
  integTest(
    `cdk migrate ${language} deploys successfully`,
    withCDKMigrateFixture(language, async (fixture) => {
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
    }),
  );
});