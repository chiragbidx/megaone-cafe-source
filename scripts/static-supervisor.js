import { execSync } from "child_process";
import fs from "fs";
import "./static-server.js";
import { startGitPoll } from "./git-poll.js";

const BRANCH = process.env.PREVIEW_BRANCH || "main";
const REPO_URL = process.env.REPO_URL;

process.chdir("/app"); // 🔑 FORCE cwd

if (!REPO_URL) {
  console.error("[supervisor] REPO_URL env var is required");
  process.exit(1);
}

console.log("[supervisor] ensuring git repo");

const run = (cmd) => execSync(cmd, { stdio: "inherit", cwd: "/app" });

// Set or update origin URL so the poller always targets the requested repo
if (!fs.existsSync(".git")) {
  run("git init");
  run(`git remote add origin ${REPO_URL}`);
} else {
  try {
    const currentRemote = execSync("git remote get-url origin", { cwd: "/app" })
      .toString()
      .trim();
    if (currentRemote !== REPO_URL) {
      run(`git remote set-url origin ${REPO_URL}`);
    }
  } catch {
    run(`git remote add origin ${REPO_URL}`);
  }
}

run("git fetch origin --depth=1");
run(`git reset --hard origin/${BRANCH}`);
run("git clean -fd");

console.log("[supervisor] static preview running");

// 🔑 start polling ONLY after git is ready
startGitPoll();
