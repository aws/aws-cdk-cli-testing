import { promises as fs } from 'fs';
import * as path from 'path';
import { withToolContext } from './with-tool-context';
import { integTest, ShellHelper, TemporaryDirectoryContext } from '../../lib';

const TIMEOUT = 1800_000;

integTest('amplify integration', withToolContext(async (context) => {
  const shell = ShellHelper.fromContext(context);

  ////////////////////////////////////////////////////////////////////////
  //  Make sure that create-amplify installs the right versions of the CLI and framework
  //

  // Install `create-amplify` without running it, then hack the json file with the
  // package versions in it before we execute.
  await shell.shell(['npm', 'init', '-y']);
  await shell.shell(['npm', 'install', '--save-dev', 'create-amplify@latest']);
  // This will create 'package.json' implicating a certain version of the CDK
  await updateCdkDependency(context, context.packages.requestedCliVersion(), context.packages.requestedFrameworkVersion());

  ////////////////////////////////////////////////////////////////////////
  //  Run the `npm create` workflow
  //

  // I tested to confirm that this will use the locally installed `create-amplify`
  await shell.shell(['npm', 'create', '-y', 'amplify']);
  await shell.shell(['npx', 'ampx', 'configure', 'telemetry', 'disable']);

  await shell.shell(['npx', 'ampx', 'sandbox', '--once'], {
    modEnv: {
      AWS_REGION: context.aws.region,
    },
  });
  try {

    // Future code goes here, putting the try/finally here already so it doesn't
    // get forgotten.

  } finally {
    await shell.shell(['npx', 'ampx', 'sandbox', 'delete', '--yes'], {
      modEnv: {
        AWS_REGION: context.aws.region,
      },
    });
  }
}), TIMEOUT);

async function updateCdkDependency(context: TemporaryDirectoryContext, cliVersion: string, libVersion: string) {
  const filename = path.join(context.integTestDir, 'node_modules', 'create-amplify', 'lib', 'default_packages.json');
  const pj: unknown = JSON.parse(await fs.readFile(filename, { encoding: 'utf-8' }));

  // Be extra paranoid about the types here, since we don't fully control them
  assertIsObject(pj);
  assertIsStringArray(pj.defaultDevPackages);

  replacePackageVersionIn('aws-cdk', cliVersion, pj.defaultDevPackages);
  replacePackageVersionIn('aws-cdk-lib', libVersion, pj.defaultDevPackages);

  await fs.writeFile(filename, JSON.stringify(pj, undefined, 2), { encoding: 'utf-8' });
}

/**
 * Mutably update the given string array, replacing the version of packages with the given name
 *
 * We assume the list of packages is a string array of the form
 *
 * ```
 * ["package@version", "package@version", ...]
 * ```
 *
 * It's a failure if we don't find an entry to update.
 */
function replacePackageVersionIn(packName: string, version: string, xs: string[]) {
  let didUpdate = false;
  for (let i = 0; i < xs.length; i++) {
    if (xs[i].startsWith(`${packName}@`)) {
      xs[i] = `${packName}@${version}`;
      didUpdate = true;
    }
  }

  if (!didUpdate) {
    throw new Error(`Did not find a package version to update for ${packName} in ${JSON.stringify(xs)}`);
  }
}

function assertIsObject(xs: unknown): asserts xs is Record<string, unknown> {
  if (typeof xs !== 'object' || xs === null) {
    throw new Error(`Expected object, got ${JSON.stringify(xs)}`);
  }
}

function assertIsStringArray(xs: unknown): asserts xs is string[] {
  if (!Array.isArray(xs) || xs.length === 0 || typeof xs[0] !== 'string') {
    throw new Error(`Expected list of strings, got ${JSON.stringify(xs)}`);
  }
}
