import { integTest, CdkCliOptions, withDefaultFixture } from '../../lib';

integTest(
  'ci=true output to stdout',
  withDefaultFixture(async (fixture) => {
    const execOptions: CdkCliOptions = {
      captureStderr: true,
      onlyStderr: true,
      modEnv: {
        CI: 'true',
        JSII_SILENCE_WARNING_KNOWN_BROKEN_NODE_VERSION: 'true',
        JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION: 'true',
        JSII_SILENCE_WARNING_DEPRECATED_NODE_VERSION: 'true',
      },
      options: ['--no-notices'],
    };

    const deployOutput = await fixture.cdkDeploy('test-2', execOptions);
    const diffOutput = await fixture.cdk(['diff', fixture.fullStackName('test-2')], execOptions);
    const destroyOutput = await fixture.cdkDestroy('test-2', execOptions);
    expect(deployOutput).toEqual('');
    expect(destroyOutput).toEqual('');
    expect(diffOutput).toEqual('');
  }),
);

