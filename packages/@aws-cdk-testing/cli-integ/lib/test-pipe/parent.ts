import * as path from 'path';
// import { sleep } from '../aws';
import { Process } from '../process';

interface MainOptions {
  readonly tty: boolean;
  readonly writeUserInputOn: 'child-stdout-match' | 'child-spawn';
  readonly childDelay: boolean;
  readonly names: string[];
}

async function main(options: MainOptions) {

  const userInput = options.names;

  const env: any = {
    ...process.env,
    PARTICIPANTS_COUNT: userInput.length,
    DELAYED_START: options.childDelay ? 'yes' : 'no'
  }

  console.log(`------ ${JSON.stringify(options)} ------`)

  const child = options.tty
    ? Process.spawnTTY('ts-node', [path.join(__dirname, 'child.ts')], { env })
    : Process.spawn('ts-node', [path.join(__dirname, 'child.ts')], { stdio: ['pipe', 'pipe', 'pipe'], env })

  if (options.writeUserInputOn === 'child-spawn') {
    child.writeStdin(`${userInput.join('\n')}\n`)
    child.endStdin();
  }

  return new Promise<string>((resolve, reject) => {

    child.onStdout((data) => {
      process.stdout.write(data.toString())
      if (options.writeUserInputOn === 'child-stdout-match' && data.toString().includes('What is your name?')) {
        const currentInput = userInput.shift();
        child.writeStdin(`${currentInput}\n`);
        if (userInput.length === 0) {
          child.endStdin();
        }
      }
    })

    child.onExit((code) => {
      console.log(`Child exited with code ${code}`)
      if (code !== 0) {
        reject(new Error(`Error`))
      } else {
        resolve("OK")
      }
    })

  })

}

async function run() {

  // writeUserInputOn: 'child-spawn'
  // await main({ writeUserInputOn: 'child-spawn', tty: true,  childDelay: true,  names: ['Eli'] });
  // await main({ writeUserInputOn: 'child-spawn', tty: false, childDelay: true,  names: ['Eli'] });
  // await main({ writeUserInputOn: 'child-spawn', tty: true,  childDelay: false, names: ['Eli'] });
  // await main({ writeUserInputOn: 'child-spawn', tty: false, childDelay: false, names: ['Eli'] });
  await main({ writeUserInputOn: 'child-spawn', tty: true,  childDelay: true,  names: ['Eli', 'Rico'] });
  // await main({ writeUserInputOn: 'child-spawn', tty: false, childDelay: true,  names: ['Eli', 'Rico'] });
  // await main({ writeUserInputOn: 'child-spawn', tty: true,  childDelay: false, names: ['Eli', 'Rico'] });
  // await main({ writeUserInputOn: 'child-spawn', tty: false, childDelay: false, names: ['Eli', 'Rico'] });

  // writeUserInputOn: 'child-stdout-match'
  // await main({ writeUserInputOn: 'child-stdout-match', tty: true,  childDelay: true,  names: ['Eli'] });
  // await main({ writeUserInputOn: 'child-stdout-match', tty: false, childDelay: true,  names: ['Eli'] });
  // await main({ writeUserInputOn: 'child-stdout-match', tty: true,  childDelay: false, names: ['Eli'] });
  // await main({ writeUserInputOn: 'child-stdout-match', tty: false, childDelay: false, names: ['Eli'] });
  // await main({ writeUserInputOn: 'child-stdout-match', tty: true,  childDelay: true,  names: ['Eli', 'Rico'] });
  // await main({ writeUserInputOn: 'child-stdout-match', tty: false, childDelay: true,  names: ['Eli', 'Rico'] });
  // await main({ writeUserInputOn: 'child-stdout-match', tty: true,  childDelay: false, names: ['Eli', 'Rico'] });
  // await main({ writeUserInputOn: 'child-stdout-match', tty: false, childDelay: false, names: ['Eli', 'Rico'] });

}

void run();

