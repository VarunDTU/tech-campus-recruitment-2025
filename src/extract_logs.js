import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, "logs_2024.log");

async function processLogs(date) {
  const outputDir = path.join(__dirname, "output");
  await fs.promises.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `output_${date}.txt`);
  const numThreads = 4;

  const fileSize = fs.statSync(logFilePath).size;
  const chunkSize = Math.ceil(fileSize / numThreads);

  console.log(
    `Splitting file of size ${fileSize} bytes into ${numThreads} chunks...`
  );

  let workers = [];
  let tempFiles = [];

  for (let i = 0; i < numThreads; i++) {
    const start = i * chunkSize;
    const end = i === numThreads - 1 ? fileSize : start + chunkSize;

    const tempFile = path.join(outputDir, `temp_${date}_${i}.txt`);
    tempFiles.push(tempFile);

    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      workerData: { logFilePath, date, start, end, tempFile },
    });

    workers.push(worker);
  }

  await Promise.all(
    workers.map(
      (worker) =>
        new Promise((resolve, reject) => {
          worker.on("message", (msg) => console.log(msg));
          worker.on("exit", resolve);
          worker.on("error", reject);
        })
    )
  );

  //Merging diffrent worker files
  const writeStream = fs.createWriteStream(outputPath);
  for (const tempFile of tempFiles) {
    const readStream = fs.createReadStream(tempFile);
    await new Promise((resolve) => {
      readStream.pipe(writeStream, { end: false });
      readStream.on("end", resolve);
    });
    fs.unlinkSync(tempFile);
  }

  writeStream.end();
  console.log(`Logs for ${date} saved to: ${outputPath}`);
}

const date = process.argv[2];
if (!date) {
  console.error("use node extract_logs.js YYYY-MM-DD");
  process.exit(1);
}

processLogs(date);
