// eslint-disable-next-line import/no-extraneous-dependencies
import * as promptly from 'promptly';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const participantsCount = parseInt(process.env.PARTICIPANTS_COUNT!)
const delayedStart = process.env.DELAYED_START === 'yes' ? true : false;

async function askForName(who: number) {
  const name = await promptly.prompt(`(${who}) What is your name?`)
  console.log(`Hello ${name}`);
}

async function main() {

  console.log(`Looks like we have ${participantsCount} participants. Welcome!`);

  if (delayedStart) {
    console.log('I will ask for your names in 2 seconds...');
    await sleep(2000);
  }

  for (let i = 0; i < participantsCount; i++) {
    await askForName(i + 1);
  }

}

// async function readStdin() {
//   return new Promise((resolve) => {
//       let data = "";
//       process.stdin.setEncoding("utf8");
//       process.stdin.on("readable", () => {
//           let chunk;
//           while ((chunk = process.stdin.read()) !== null) {
//               data += chunk;
//           }
//       });
//       process.stdin.on("end", () => { resolve(data) });
//   });
// }

void main();