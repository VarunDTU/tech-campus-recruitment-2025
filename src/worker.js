import fs from "fs";
import readline from "readline";
import { parentPort, workerData } from "worker_threads";

const { logFilePath, date, start, end, tempFile } = workerData;

async function processChunk() {
  const readStream = fs.createReadStream(logFilePath, {
    start,
    end,
    encoding: "utf-8",
  });
  const writeStream = fs.createWriteStream(tempFile);
  const rl = readline.createInterface({ input: readStream });

  for await (const line of rl) {
    if (line.startsWith(date)) {
      writeStream.write(`${line}\n`);
    }
  }

  writeStream.end();
  parentPort.postMessage(`Worker processed logs and saved to ${tempFile}`);
}

processChunk();
