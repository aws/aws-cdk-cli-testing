const cdk = require('aws-cdk-lib/core');
const iam = require('aws-cdk-lib/aws-iam');
const sqs = require('aws-cdk-lib/aws-sqs');

const stackPrefix = process.env.STACK_NAME_PREFIX;
if (!stackPrefix) {
  throw new Error(`the STACK_NAME_PREFIX environment variable is required`);
}

class TestStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const queue = new sqs.Queue(this, 'queue', {
      visibilityTimeout: cdk.Duration.seconds(300),
    });
    const role = new iam.Role(this, 'role', {
      assumedBy: new iam.AccountRootPrincipal(),
    });
    queue.grantConsumeMessages(role);
  }
}

const app = new cdk.App();
const stack = new TestStack(app, `${stackPrefix}-annotations`);
cdk.Annotations.of(stack).addInfo(`stackId: ${stack.stackId}`); // `stack.stackId` is a token

app.synth();
