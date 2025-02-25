/**
 * Tests for the standalone cdk-assets executable, as used by CDK Pipelines
 */
import { promises as fs } from 'fs';
import * as path from 'path';
import { integTest, withDefaultFixture } from '../../lib';

jest.setTimeout(2 * 60 * 60_000); // Includes the time to acquire locks, worst-case single-threaded runtime

const MAJOR_VERSIONS = ['2', '3'];

MAJOR_VERSIONS.forEach(MV => {
  integTest(
    `cdk-assets@${MV}`,
    withDefaultFixture(async (fixture) => {
      await fixture.shell(['npm', 'init', '-y']);
      await fixture.shell(['npm', 'install', `cdk-assets@${MV}`]);

      const account = await fixture.aws.account();
      const region = fixture.aws.region;
      const bucketName = `cdk-hnb659fds-assets-${account}-${region}`;
      const repositoryName = `cdk-hnb659fds-container-assets-${account}-${region}`;

      // Write a Dockerfile for the image build
      const imageDir = 'imagedir';
      await fs.mkdir(path.join(fixture.integTestDir, imageDir), { recursive: true });
      await fs.writeFile(path.join(fixture.integTestDir, imageDir, 'Dockerfile'), 'FROM scratch');

      // Write an asset file to upload
      const assetFile = 'testfile.txt';
      await fs.writeFile(path.join(fixture.integTestDir, assetFile), 'some asset file');

      // Write an asset JSON file to publish to the bootstrapped environment
      const assetsJson = {
        version: "38.0.1",
        files: {
          testfile: {
            source: {
              path: assetFile,
              packaging: 'file',
            },
            destinations: {
              current: {
                region,
                assumeRoleArn: `arn:\${AWS::Partition}:iam::${account}:role/cdk-hnb659fds-file-publishing-role-${account}-${region}`,
                bucketName,
                objectKey: `test-file-${Date.now()}.json`,
              }
            }
          }
        },
        dockerImages: {
          testimage: {
            source: {
              directory: imageDir,
            },
            destinations: {
              current: {
                region,
                assumeRoleArn: `arn:\${AWS::Partition}:iam::${account}:role/cdk-hnb659fds-image-publishing-role-${account}-${region}`,
                repositoryName,
                imageTag: `test-image`, // Not fresh on every run because we'll run out of tags too easily
              },
            },
          },
        }
      };

      await fs.writeFile(path.join(fixture.integTestDir, 'assets.json'), JSON.stringify(assetsJson, undefined, 2));
      await fixture.shell(['npx', 'cdk-assets', '--path', 'assets.json', '--verbose', 'publish'], {
        modEnv: {
          ...fixture.cdkShellEnv(),
        },
      });
    }),
  );
});