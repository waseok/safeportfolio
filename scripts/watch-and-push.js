/**
 * 일정 시간마다 로컬 변경 여부를 확인하고, 변경이 있으면
 * 자동으로 git add → commit → push 합니다.
 * push가 되면 Vercel이 GitHub를 감지해 자동 배포합니다.
 *
 * 사용: 터미널에서 npm run watch-push 실행해 두고,
 *       Cursor에서 파일 저장 후 다음 주기(기본 15초)에 자동 푸시·배포됩니다.
 */
const { execSync } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const POLL_SEC = 15; // 15초마다 변경 여부 확인

function runPush() {
  try {
    const status = execSync("git status --porcelain", {
      cwd: ROOT,
      encoding: "utf-8",
    });
    if (!status.trim()) return;

    execSync("git add .", { cwd: ROOT, stdio: "inherit" });
    execSync('git commit -m "chore: auto sync (로컬 변경 반영)"', {
      cwd: ROOT,
      stdio: "inherit",
    });
    execSync("git push origin main", { cwd: ROOT, stdio: "inherit" });
    console.log("[watch-push] 푸시 완료 → Vercel 자동 배포 예정");
  } catch (e) {
    if (e.status !== undefined && e.status !== 0) {
      if (e.stdout) process.stdout.write(e.stdout);
      if (e.stderr) process.stderr.write(e.stderr);
    }
  }
}

console.log(
  "[watch-push] 로컬 변경 감시 중. " +
    POLL_SEC +
    "초마다 확인 후 변경 시 자동 push → Vercel 배포"
);
console.log("[watch-push] 중지하려면 Ctrl+C\n");

setInterval(runPush, POLL_SEC * 1000);
