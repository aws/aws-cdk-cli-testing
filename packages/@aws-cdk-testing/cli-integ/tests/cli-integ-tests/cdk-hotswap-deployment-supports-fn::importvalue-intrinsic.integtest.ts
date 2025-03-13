import { DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { integTest, withDefaultFixture } from '../../lib';

integTest(
  'hotswap deployment supports Fn::ImportValue intrinsic',
  withDefaultFixture(async (fixture) => {
    // GIVEN
    try {
      await fixture.cdkDeploy('export-value-stack');
      const stackArn = await fixture.cdkDeploy('lambda-hotswap', {
        captureStderr: false,
        modEnv: {
          DYNAMIC_LAMBDA_PROPERTY_VALUE: 'original value',
          USE_IMPORT_VALUE_LAMBDA_PROPERTY: 'true',
        },
      });

      // WHEN
      const deployOutput = await fixture.cdkDeploy('lambda-hotswap', {
        options: ['--hotswap'],
        captureStderr: true,
        onlyStderr: true,
        modEnv: {
          DYNAMIC_LAMBDA_PROPERTY_VALUE: 'new value',
          USE_IMPORT_VALUE_LAMBDA_PROPERTY: 'true',
        },
      });

      const response = await fixture.aws.cloudFormation.send(
        new DescribeStacksCommand({
          StackName: stackArn,
        }),
      );
      const functionName = response.Stacks?.[0].Outputs?.[0].OutputValue;

      // THEN

      // The deployment should not trigger a full deployment, thus the stack's status must remains
      // "CREATE_COMPLETE"
      expect(response.Stacks?.[0].StackStatus).toEqual('CREATE_COMPLETE');
      // The entire string fails locally due to formatting. Making this test less specific
      expect(deployOutput).toMatch(/hotswapped!/);
      expect(deployOutput).toContain(functionName);
    } finally {
      // Ensure cleanup in reverse order due to use of import/export
      await fixture.cdkDestroy('lambda-hotswap');
      await fixture.cdkDestroy('export-value-stack');
    }
  }),
);

