import { integTest, withDefaultFixture } from '../../lib';

integTest(
  'deploy with wildcard and parameters',
  withDefaultFixture(async (fixture) => {
    await fixture.cdkDeploy('param-test-*', {
      options: [
        '--parameters',
        `${fixture.stackNamePrefix}-param-test-1:TopicNameParam=${fixture.stackNamePrefix}bazinga`,
        '--parameters',
        `${fixture.stackNamePrefix}-param-test-2:OtherTopicNameParam=${fixture.stackNamePrefix}ThatsMySpot`,
        '--parameters',
        `${fixture.stackNamePrefix}-param-test-3:DisplayNameParam=${fixture.stackNamePrefix}HeyThere`,
        '--parameters',
        `${fixture.stackNamePrefix}-param-test-3:OtherDisplayNameParam=${fixture.stackNamePrefix}AnotherOne`,
      ],
    });
  }),
);

