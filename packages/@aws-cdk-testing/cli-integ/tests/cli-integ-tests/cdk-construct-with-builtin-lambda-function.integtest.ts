import { integTest, withDefaultFixture } from '../../lib';

integTest(
  'Construct with builtin Lambda function',
  withDefaultFixture(async (fixture) => {
    await fixture.cdkDeploy('builtin-lambda-function');
    fixture.log('Setup complete!');
    await fixture.cdkDestroy('builtin-lambda-function');
  }),
);

// this is to ensure that asset bundling for apps under a stage does not break
