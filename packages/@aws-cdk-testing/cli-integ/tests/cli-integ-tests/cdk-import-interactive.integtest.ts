import { DescribeStackResourcesCommand } from '@aws-sdk/client-cloudformation';
import { CreateTopicCommand } from '@aws-sdk/client-sns';
import { integTest, withDefaultFixture } from '../../lib';

integTest('cdk import prompts the user for sns topic arns', withDefaultFixture(async (fixture) => {

  const topicName = (logicalId: string) => `${logicalId}-${fixture.randomString}`;
  const topicArn = (name: string) => `arn:aws:sns:${fixture.aws.region}:${fixture.aws.account()}:${name}`

  const topic1Name = topicName('Topic1');
  const topic2Name = topicName('Topic2');

  const topic1Arn = topicArn(topic1Name);
  const topic2Arn = topicArn(topic2Name);

  console.log(`Creating topic ${topic1Name}`);
  await fixture.aws.sns.send(new CreateTopicCommand({ Name: topic1Name }))
  console.log(`Creating topic ${topic2Name}`);
  await fixture.aws.sns.send(new CreateTopicCommand({ Name: topic2Name }))

  const stackName = 'two-sns-topics';
  const fullStackName = fixture.fullStackName(stackName);

  fixture.log(`Importing topics to stack ${fullStackName}`);
  await fixture.cdk(['import', fullStackName], {
    interact: [
      {
        prompt: /Topic1\/Resource (AWS::SNS::Topic): enter TopicArn/,
        input: topic1Arn,
      },
      {
        prompt: /Topic2\/Resource (AWS::SNS::Topic): enter TopicArn/,
        input: topic2Arn,
      }
    ]
  });

  // assert the stack now has the two topics
  const stackResources = await fixture.aws.cloudFormation.send(new DescribeStackResourcesCommand({ StackName: fullStackName }))
  const stackTopicArns = new Set(stackResources.StackResources?.filter(r => r.ResourceType === 'AWS::SNS::Topic').map(r => r.PhysicalResourceId) ?? []);

  expect(stackTopicArns).toEqual(new Set([topic1Arn, topic2Arn]))

}));
