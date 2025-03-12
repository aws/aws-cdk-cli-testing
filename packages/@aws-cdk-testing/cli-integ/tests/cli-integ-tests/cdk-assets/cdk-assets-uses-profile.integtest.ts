
import { promises as fs } from 'fs';
import * as path from 'path';
import { integTest, withDefaultFixture } from '../../../lib';

jest.setTimeout(2 * 60 * 60_000); // Includes the time to acquire locks, worst-case single-threaded runtime

integTest(`cdk-assets uses profile when specified`, withDefaultFixture(async (fixture) => {

    await fixture.shell(['npm', 'init', '-y']);
    await fixture.shell(['npm', 'install', `cdk-assets@latest`]);

    const account = await fixture.aws.account();
    const region = fixture.aws.region;
    const bucketName = `cdk-hnb659fds-assets-${account}-${region}`;

    // Write an asset file and a data file for the Docker image
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
      }
    };

    // create a profile with out current credentials.
    //
    // >>>>  if you're wondering why can't we do the reverse (i.e writea a bogus profile and assert a failure),
    //       its because when cdk-assets discovers the current account, it DOES consider the profile.
    //       writing a bogus profile would fail this operation and we won't be able to reach the code
    //       we're trying to test.
    const credentialsFile = path.join(fixture.integTestDir, 'aws.credentials');
    const profile = 'cdk-assets';

    // this kind sucks but its what it is given we need to write a working profile
    await fs.writeFile(credentialsFile, `[${profile}]
aws_access_key_id=${process.env.AWS_ACCESS_KEY_ID}
aws_secret_access_key=${process.env.AWS_SECRET_ACCESS_KEY}
aws_session_token=${process.env.AWS_SESSION_TOKEN}`);

    await fs.writeFile(path.join(fixture.integTestDir, 'assets.json'), JSON.stringify(assetsJson, undefined, 2));
    await fixture.shell(['npx', 'cdk-assets', '--path', 'assets.json', 'publish', '--profile', profile], {
      modEnv: {
        ...fixture.cdkShellEnv(),
        AWS_SHARED_CREDENTIALS_FILE: credentialsFile,

        // remove the default creds so that if the command doesn't use
        // the profile, it will fail with "Could not load credentials from any providers"
        AWS_ACCESS_KEY_ID: '',
        AWS_SECRET_ACCESS_KEY: '',
        AWS_SESSION_TOKEN: ''

      },
    });

  }),
);