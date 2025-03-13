import { DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { CreateTopicCommand, DeleteTopicCommand } from '@aws-sdk/client-sns';
import { integTest, withDefaultFixture } from '../../lib';

integTest(
  'deploy with notification ARN as flag',
  withDefaultFixture(async (fixture) => {
    const topicName = `${fixture.stackNamePrefix}-test-topic-flag`;

    const response = await fixture.aws.sns.send(new CreateTopicCommand({ Name: topicName }));
    const topicArn = response.TopicArn!;

    try {
      await fixture.cdkDeploy('notification-arns', {
        options: ['--notification-arns', topicArn],
      });

      // verify that the stack we deployed has our notification ARN
      const describeResponse = await fixture.aws.cloudFormation.send(
        new DescribeStacksCommand({
          StackName: fixture.fullStackName('notification-arns'),
        }),
      );
      expect(describeResponse.Stacks?.[0].NotificationARNs).toEqual([topicArn]);
    } finally {
      await fixture.aws.sns.send(
        new DeleteTopicCommand({
          TopicArn: topicArn,
        }),
      );
    }
  }),
);

