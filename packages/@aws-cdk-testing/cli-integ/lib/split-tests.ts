import * as fs from 'fs';
import * as path from 'path';

async function main() {

  const maybeLibImport = [
    'CdkCliOptions',
    'RESOURCES_DIR',
    'retry',
    'shell',
    'withDefaultFixture',
    'withCDKMigrateFixture',
    'withDefaultFixture',
    'withExtendedTimeoutFixture',
    'withoutBootstrap',
    'withSamIntegrationFixture',
    'withSpecificFixture',
    'randomInteger',
    'randomString',
    'sleep',
    'cloneDirectory',
  ]

  const uberfile = fs.readFileSync(path.join(__dirname, '..', 'tests/cli-integ-tests/garbage-collection.integtest.ts'), 'utf-8');
  const targetDir = path.join(__dirname, '..', 'tests/cli-integ-tests');
  const splitter = 'integTest(';

  const tests = uberfile.split(splitter).slice(1);
  for (const test of tests) {
    const name = test.split(',', 1)[0].trim().toLowerCase()
      .replace(/ /g, '-')
      .replace(/\//, '-')
      .replace(/=/, '-')
      // .replace(/`/g, '')
      .replace(/"/g, '')
      .replace(/'/g, '');
    const targetFile = path.join(targetDir, `cdk-gc-${name}.integtest.ts`);

    const libImports = new Set(['integTest'])

    for (const im of maybeLibImport) {
      if (test.includes(im)) {
        libImports.add(im);
      }
    }

    const imports = [];

    const fsImports = [];
    if (test.includes('existsSync(')) {
      fsImports.push('existsSync');
    }
    if (test.includes('fs.')) {
      fsImports.push('promises as fs');
    }

    if (fsImports.length > 0) {
      imports.push(`import { ${fsImports.join(', ')} } from 'fs';`);
    }

    if (test.includes('os.')) {
      imports.push(`import * as os from 'os';`)
    }

    if (test.includes('path.')) {
      imports.push(`import * as path from 'path';`);
    }

    const sdkImports = {
      '@aws-sdk/client-cloudformation': [
        'CreateStackCommand',
        'DescribeStackResourcesCommand',
        'DescribeStacksCommand',
        'GetTemplateCommand',
        'ListChangeSetsCommand',
        'UpdateStackCommand',
        'waitUntilStackUpdateComplete',
      ],
      '@aws-sdk/client-ecs': [
        'DescribeServicesCommand'
      ],
      '@aws-sdk/client-iam': [
        'CreateRoleCommand',
        'DeleteRoleCommand',
        'DeleteRolePolicyCommand',
        'ListRolePoliciesCommand',
        'PutRolePolicyCommand',
        'CreatePolicyCommand',
        'DeletePolicyCommand',
        'GetRoleCommand'
      ],
      '@aws-sdk/client-lambda': [
        'InvokeCommand'
      ],
      '@aws-sdk/client-s3': [
        'PutObjectLockConfigurationCommand',
        'GetObjectTaggingCommand',
        'ListObjectsV2Command',
        'PutObjectTaggingCommand'
      ],
      '@aws-sdk/client-sns': [
        'CreateTopicCommand',
        'DeleteTopicCommand',
      ],
      '@aws-sdk/client-sts': [
        'AssumeRoleCommand',
        'GetCallerIdentityCommand'
      ],
      '@aws-sdk/client-ecr': [
        'DescribeRepositoriesCommand',
        'BatchGetImageCommand',
        'ListImagesCommand',
        'PutImageCommand'
      ],
    }

    const sdkImportStatements = [];

    for (const [client, importsFromClient] of Object.entries(sdkImports)) {
      const detected: string[] = [];
      for (const importName of importsFromClient) {
        if (test.includes(importName)) {
          detected.push(importName);
        }
      }
      if (detected.length > 0) {
        sdkImportStatements.push(`import { ${detected.join(', ')} } from '${client}';`);
      }
    }

    for (const i of sdkImportStatements) {
      imports.push(i);
    }

    if (test.includes('yaml.')) {
      imports.push(`import * as yaml from 'yaml';`);
    }

    imports.push(`import { ${Array.from(libImports).join(', ')} } from '../../lib';`);

    const setJestTimeout = 'jest.setTimeout(2 * 60 * 60_000); // Includes the time to acquire locks, worst-case single-threaded runtime';
    const consts = [
      `const S3_ISOLATED_TAG = 'aws-cdk:isolated';`,
      `const ECR_ISOLATED_TAG = 'aws-cdk.isolated';`
    ]

    fs.writeFileSync(targetFile, `${imports.join('\n')}\n\n${consts.join('\n')}\n\n${setJestTimeout}\n\n${splitter}${test}`);
    // console.log(`-------------- ${name} ----------`)
    // console.log(`${splitter}${test}`);

  }
}

void main();