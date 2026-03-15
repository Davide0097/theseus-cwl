import { spawn } from "child_process";
import crypto from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { CwlSource } from "@theseus-cwl/types";

/**
 * Returns the run directory path
 *
 * @param runId the unique id of the run
 *
 * @returns
 */
const gerRunDirectoryPath = (runId: crypto.UUID): string | undefined => {
  const currentDir = process.cwd();
  return path.join(currentDir, "runs", runId);
};

/**
 * Creates the directory where the worflow files will are stored
 *
 * @param runDirectoryPath the path
 *
 * @returns true if the directory was successfully created
 */
const createRunDirectory = async (
  runDirectoryPath: string,
): Promise<boolean> => {
  try {
    await fs.mkdir(runDirectoryPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

/**
 * Creates the directory where the worflow outputs will are stored
 *
 * @param outputDirectoryPath the path
 *
 * @returns true if the directory was successfully created
 */
const createOutputDirectory = async (
  outputDirectoryPath: string,
): Promise<boolean> => {
  try {
    await fs.mkdir(outputDirectoryPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

import YAML from "yaml";

export async function writeCwlSourceToTempDir(
  source: CwlSource,
  runDirectoryPath: string,
) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cwl-"));

  // write CWL files
  for (const file of source.documents) {
    const fileContent =
      typeof file.content === "string"
        ? file.content
        : YAML.stringify(file.content);
    const filePath = path.join(dir, file.name);
    await fs.writeFile(filePath, fileContent, "utf8");
  }

  for (const input of source.parameters) {
    const fileContent =
      typeof input.content === "string" && input.name.endsWith(".json")
        ? input.content
        : JSON.stringify(input.content, null, 2);

    const filePath = path.join(runDirectoryPath, input.name);
    await fs.writeFile(filePath, fileContent, "utf8");
  }

  return {
    temporaryDirectory: dir,
    entrypointPath: path.join(dir, source.entrypoint),
  };
}

/**
 * Returns the run output direcory path
 *
 * @param runId the unique id of the run
 *
 * @returns
 */
const gerOutputDirectoryPath = (runId: crypto.UUID): string | undefined => {
  const runDirectoryPath = gerRunDirectoryPath(runId);

  if (runDirectoryPath) {
    return path.join(runDirectoryPath, "outputs");
  } else return undefined;
};

/**
 *
 * @param path
 * @returns
 */
const windowsPathToWsl = (path: string) => {
  return path
    .replace(/\\/g, "/")
    .replace(/^([A-Za-z]):/, (_, d) => `/mnt/${d.toLowerCase()}`);
};

const shouldUseWsl = () => {
  return process.platform === "win32";
};

/**
 *
 * @param source
 *
 * @returns
 */
export const runCwlService = async (source: CwlSource) => {
  const runId = crypto.randomUUID();
  const runDirectoryPath = gerRunDirectoryPath(runId);

  if (!runDirectoryPath) {
    throw new Error("");
  }

  const directoryCreated = await createRunDirectory(runDirectoryPath);

  if (!directoryCreated) {
    throw new Error("");
  }

  await fs.writeFile(path.join(runDirectoryPath, "stdout.log"), "");
  await fs.writeFile(path.join(runDirectoryPath, "stderr.log"), "");

  const { temporaryDirectory, entrypointPath } = await writeCwlSourceToTempDir(
    source,
    runDirectoryPath,
  );

  if (!temporaryDirectory || !entrypointPath) {
    throw new Error("");
  }

  const outputDirectoryPath = gerOutputDirectoryPath(runId);

  if (!outputDirectoryPath) {
    throw new Error("");
  }

  const outputDirectoryCreated =
    await createOutputDirectory(outputDirectoryPath);

  if (!outputDirectoryCreated) {
    throw new Error("");
  }

  const wslEntrypointPath = windowsPathToWsl(entrypointPath);
  const wslOutputsPath = windowsPathToWsl(outputDirectoryPath);

  await fs.writeFile(
    path.join(runDirectoryPath, "status.json"),
    JSON.stringify({ status: "running", startedAt: Date.now() }, null, 2),
  );

  const jobPath = path.join(runDirectoryPath, "job.json");
  const wslJob = windowsPathToWsl(jobPath);

  const input = source.parameters[0];

  if (!input?.content) {
    throw new Error("Job input not found");
  }

  await fs.writeFile(jobPath, input.content as string, "utf8");

  let proc;

  if (shouldUseWsl()) {
    proc = spawn("wsl", [
      "-d",
      "Ubuntu",
      "cwltool",

      "--outdir",
      wslOutputsPath,
      "--no-container",
      wslEntrypointPath,
      wslJob,
    ]);
  } else {
    // Running inside container / Linux
    proc = spawn("cwltool", [
      "--outdir",
      outputDirectoryPath,
      "--no-container",
      entrypointPath,
      jobPath,
    ]);
  }

  let standardOutput = "";
  let standardError = "";

  proc.stdout.on("data", (chunk) => {
    standardOutput += chunk.toString();
  });

  proc.stderr.on("data", (chunk) => {
    standardError += chunk.toString();
  });

  proc.on("close", async (code) => {
    await fs.writeFile(
      path.join(runDirectoryPath, "stdout.log"),
      standardOutput,
    );

    await fs.writeFile(
      path.join(runDirectoryPath, "stderr.log"),
      standardError,
    );

    const status = code === 0 ? "completed" : "failed";

    let outputs = {};
    if (status === "completed") {
      const files = await fs.readdir(outputDirectoryPath);

      outputs = Object.fromEntries(
        files.map((file) => [file, path.join(outputDirectoryPath, file)]),
      );

      await fs.writeFile(
        path.join(runDirectoryPath, "outputs.json"),
        JSON.stringify(outputs, null, 2),
      );
    }

    await fs.writeFile(
      path.join(runDirectoryPath, "status.json"),
      JSON.stringify(
        {
          status,
          exitCode: code,
          finishedAt: Date.now(),
        },
        null,
        2,
      ),
    );

    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  });

  proc.on("error", async (err) => {
    await fs.writeFile(
      path.join(temporaryDirectory, "status.json"),
      JSON.stringify({ status: "failed", error: err.message }, null, 2),
    );
  });

  return runId;
};
