import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import ora, { type Ora } from "ora";

export const oraSpinner: Ora = ora();

/**
 * Handle user decision if needed
 */
export const waitForUserDecision = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: stdin,
      output: stdout,
    });

    const askQuestion = () => {
      rl.question("Do you want to continue? (y/n): ", (answer) => {
        if (answer.toLowerCase() === "y") {
          rl.close();
          resolve(true);
        } else if (answer.toLowerCase() === "n") {
          rl.close();
          resolve(false);
        } else {
          askQuestion();
        }
      });
    };
    askQuestion();
  });
};
