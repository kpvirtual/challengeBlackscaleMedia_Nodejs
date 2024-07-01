const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let verification_code = "";
rl.question("Please pass your email verification code ? ", function (code) {
  verification_code = code;
  rl.close();
});

rl.on("close", function () {
  console.log(`Email verification code :  ${verification_code}`);
  process.exit(0);
});
