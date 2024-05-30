import { resolve } from "path";
import { workerData } from "worker_threads";

require(resolve(__dirname, workerData.path));
