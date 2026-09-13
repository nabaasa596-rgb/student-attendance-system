const bcrypt = require("bcrypt");

async function main() {
  const password = "admin123";

  const hash = await bcrypt.hash(password, 10);

  console.log("\nPassword:", password);
  console.log("Hash:", hash);
}

main();