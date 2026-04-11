/**
 * Worker Pool for parallel markdown processing
 */
import { Worker } from "worker_threads";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

interface Task {
  id: number;
  content: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class WorkerPool {
  private workers: Worker[] = [];
  private queue: Task[] = [];
  private activeTasks = new Map<number, Task>();
  private taskId = 0;
  private maxWorkers: number;
  private workerScript: string;

  constructor(workerScript: string, maxWorkers = navigator.hardwareConcurrency || 4) {
    this.workerScript = workerScript;
    this.maxWorkers = maxWorkers;
  }

  /**
   * Initialize workers
   */
  async init(): Promise<void> {
    // For Bun, we use native worker support
    // Create workers lazily on first task
  }

  /**
   * Execute a task in the worker pool
   */
  async execute(content: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.taskId;
      const task: Task = { id, content, resolve, reject };
      this.queue.push(task);
      this.processQueue();
    });
  }

  /**
   * Process queued tasks
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    // For now, process without actual workers (Bun's native parallelism)
    // In production, this would use Bun's Worker API
    const task = this.queue.shift();
    if (!task) return;

    try {
      // Import and run directly for now
      const { renderMarkdownWorker } = await import("./markdown.worker.js");
      const result = await renderMarkdownWorker(task.content);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    }

    // Process next task
    this.processQueue();
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.queue = [];
    this.activeTasks.clear();
  }
}

// Singleton instance
let pool: WorkerPool | null = null;

export function getWorkerPool(): WorkerPool {
  if (!pool) {
    pool = new WorkerPool("");
  }
  return pool;
}

export function terminateWorkerPool(): void {
  if (pool) {
    pool.terminate();
    pool = null;
  }
}
