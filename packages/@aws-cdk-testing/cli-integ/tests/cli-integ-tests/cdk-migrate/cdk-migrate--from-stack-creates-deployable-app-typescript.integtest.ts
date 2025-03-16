import { fromStackCreatesDeployableApp } from "./testcase";
import { integTest, withExtendedTimeoutFixture } from "../../../lib";

const language = 'typescript';

integTest(
  `cdk migrate --from-stack creates deployable typescript app`,
  withExtendedTimeoutFixture(async (fixture) => {
    await fromStackCreatesDeployableApp(fixture, language);
  }),
);
