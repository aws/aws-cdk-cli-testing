const cdk = require('aws-cdk-lib/core');
const cxschema = require('@aws-cdk/cloud-assembly-schema');

const stackPrefix = process.env.STACK_NAME_PREFIX;
if (!stackPrefix) {
  throw new Error(`the STACK_NAME_PREFIX environment variable is required`);
}

class TestStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const response = cdk.ContextProvider.getValue(scope, {
      provider: cxschema.ContextProvider.CC_API_PROVIDER,
      props: {
        typeName: 'AWS::IAM::Role',
        exactIdentifier: 'DUMMY_ID',
        propertiesToReturn: [
          'Arn',
        ],
      },
      ignoreErrorOnMissingContext: true,
      dummyValue: [
        {
          Arn: 'arn:aws:iam::123456789012:role/DUMMY_ARN',
        },
      ],
    }).value;

    const dummy = response[0];
    new cdk.CfnOutput(this, 'Output', {
      value: dummy.Arn,
    });
  }
}

const app = new cdk.App();
new TestStack(app, `${stackPrefix}-from-lookup-dummy`);

app.synth();
