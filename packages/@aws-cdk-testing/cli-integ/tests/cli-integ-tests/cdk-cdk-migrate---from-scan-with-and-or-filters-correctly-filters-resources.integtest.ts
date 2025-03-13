import { integTest, withExtendedTimeoutFixture, randomString } from '../../lib';

jest.setTimeout(2 * 60 * 60_000); // Includes the time to acquire locks, worst-case single-threaded runtime

integTest('cdk migrate --from-scan with AND/OR filters correctly filters resources', withExtendedTimeoutFixture(async (fixture) => {
//   const stackName = `cdk-migrate-integ-${fixture.randomString}`;

//   await fixture.cdkDeploy('migrate-stack', {
//     modEnv: { SAMPLE_RESOURCES: '1' },
//   });
//   await fixture.cdk(
//     ['migrate', '--stack-name', stackName, '--from-scan', 'new', '--filter', 'type=AWS::SNS::Topic,tag-key=tag1', 'type=AWS::SQS::Queue,tag-key=tag3'],
//     { modEnv: { MIGRATE_INTEG_TEST: '1' }, neverRequireApproval: true, verbose: true, captureStderr: false },
//   );

//   try {
//     const response = await fixture.aws.cloudFormation('describeGeneratedTemplate', {
//       GeneratedTemplateName: stackName,
//     });
//     const resourceNames = [];
//     for (const resource of response.Resources || []) {
//       if (resource.LogicalResourceId) {
//         resourceNames.push(resource.LogicalResourceId);
//       }
//     }
//     fixture.log(`Resources: ${resourceNames}`);
//     expect(resourceNames.some(ele => ele && ele.includes('migratetopic1'))).toBeTruthy();
//     expect(resourceNames.some(ele => ele && ele.includes('migratequeue1'))).toBeTruthy();
//   } finally {
//     await fixture.cdkDestroy('migrate-stack');
//     await fixture.aws.cloudFormation('deleteGeneratedTemplate', {
//       GeneratedTemplateName: stackName,
//     });
//   }
// }));

// 