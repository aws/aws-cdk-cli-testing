import { promises as fs } from 'fs';
import * as path from 'path';
import { integTest, withExtendedTimeoutFixture, randomString } from '../../lib';

jest.setTimeout(2 * 60 * 60_000); // Includes the time to acquire locks, worst-case single-threaded runtime

integTest('cdk migrate --from-scan for resources with Write Only Properties generates warnings', withExtendedTimeoutFixture(async (fixture) => {
//   const stackName = `cdk-migrate-integ-${fixture.randomString}`;

//   await fixture.cdkDeploy('migrate-stack', {
//     modEnv: {
//       LAMBDA_RESOURCES: '1',
//     },
//   });
//   await fixture.cdk(
//     ['migrate', '--stack-name', stackName, '--from-scan', 'new', '--filter', 'type=AWS::Lambda::Function,tag-key=lambda-tag'],
//     { modEnv: { MIGRATE_INTEG_TEST: '1' }, neverRequireApproval: true, verbose: true, captureStderr: false },
//   );

//   try {

//     const response = await fixture.aws.cloudFormation('describeGeneratedTemplate', {
//       GeneratedTemplateName: stackName,
//     });
//     const resourceNames = [];
//     for (const resource of response.Resources || []) {
//       if (resource.LogicalResourceId && resource.ResourceType === 'AWS::Lambda::Function') {
//         resourceNames.push(resource.LogicalResourceId);
//       }
//     }
//     fixture.log(`Resources: ${resourceNames}`);
//     const readmePath = path.join(fixture.integTestDir, stackName, 'README.md');
//     const readme = await fs.readFile(readmePath, 'utf8');
//     expect(readme).toContain('## Warnings');
//     for (const resourceName of resourceNames) {
//       expect(readme).toContain(`### ${resourceName}`);
//     }
//   } finally {
//     await fixture.cdkDestroy('migrate-stack');
//     await fixture.aws.cloudFormation('deleteGeneratedTemplate', {
//       GeneratedTemplateName: stackName,
//     });
//   }
// }));

['typescript', 'python', 'csharp', 'java'].forEach((language) => {
  