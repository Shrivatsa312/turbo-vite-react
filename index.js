#!/usr/bin/env node

const prompts = require("prompts");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("AAAAAA");
  const args = process.argv.slice(2);
  let workspaceName, appName;

  if (args.length >= 2) {
    [workspaceName, appName] = args;
  } else {
    const response = await prompts([
      {
        type: "text",
        name: "workspaceName",
        message: "What is your project named?",
        initial: "my-turborepo",
      },
      {
        type: "text",
        name: "appName",
        message: "What do you want to name your app?",
        initial: "web",
      },
    ]);

    workspaceName = response.workspaceName;
    appName = response.appName;
  }

  console.log(`Creating Turborepo: ${workspaceName}`);
  execSync(`npx create-turbo@latest ${workspaceName} --package-manager pnpm`, {
    stdio: "inherit",
  });

  console.log("Navigating to workspace directory and cleaning up apps folder");
  process.chdir(workspaceName);
  fs.rmSync(path.join("apps"), { recursive: true, force: true });
  fs.mkdirSync(path.join("apps"));

  console.log(`Creating Vite app: ${appName}`);
  process.chdir("apps");

  console.log(
    `APPNAME running execSync pnpm create vite@latest ${appName} --template react-ts`
  );

  execSync(`npx create-vite@latest ${appName} --template react-ts`, {
    stdio: "inherit",
  });

  // Create the folder structure within the Vite app's src directory
  console.log("Creating folder structure in src directory");

  const srcDir = path.join(appName, "src");
  const foldersToCreate = [
    "apis",
    "components",
    "constants",
    "helpers",
    "hocs",
    "hooks",
    "pages",
    "redux",
    "routes",
    "types",
  ];

  foldersToCreate.forEach((folder) => {
    fs.mkdirSync(path.join(srcDir, folder), { recursive: true });
  });

  console.log("Returning to root directory");
  process.chdir("../");

  console.log("Updating pnpm-workspace.yaml");
  fs.writeFileSync("pnpm-workspace.yaml", 'packages:\n  - "apps/*"\n');

  console.log("Installing dependencies for the entire workspace");
  execSync("pnpm install", { stdio: "inherit" });

  console.log("Setup complete!");
  console.log(`
To get started, run:

  cd ${workspaceName}
  pnpm dev
`);
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
