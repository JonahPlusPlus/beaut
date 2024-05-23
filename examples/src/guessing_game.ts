import { chain } from "beaut";
import * as F from "beaut/future";
import * as O from "beaut/option";
import * as readline from "readline";

/** Read a line from stdin. */
const getLine: F.Future<string> = (resolve) => {
  const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  r1.question("> ", (answer) => {
    r1.close();
    resolve(answer);
  });
};

/** Asks a question and gets an answer. */
async function ask(question: string) {
  console.log(question);
  return await F.Task(getLine);
}

/** Parses a `string` to `Option<number>`. */
function parse(s: string): O.Option<number> {
  const n = parseInt(s, 10);
  return isNaN(n) ? O.None() : O.Some(n);
}

async function main() {
  const name = await ask("What's your name?");
  console.log(`Hello, ${name} welcome to the game!`);

  // game loop
  let shouldContinue = true;
  while (shouldContinue) {
    const secret = Math.floor(Math.random() * 5) + 1;
    const guess = parse(
      await ask(`Dear ${name}, please guess a number from 1 to 5`),
    );
    console.log(
      chain(guess)(
        O.map((n) =>
          n === secret
            ? `You guessed right, ${name}!`
            : `You guessed wrong, ${name}! The number was: ${secret}`,
        ),
      )(O.unwrapOr("You did not enter an integer!")).end(),
    );
    shouldContinue =
      (await ask(`Do you want to continue, ${name} (y/n)`)) !== "n";
  }
}

main();
