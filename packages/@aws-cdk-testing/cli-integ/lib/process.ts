import * as child from 'child_process';
import * as pty from 'node-pty';

/**
 * IProcess provides an interface to work with a subprocess.
 */
export interface IProcess {

  /**
   * Register a callback to be invoked when a chunk is written to stdout.
   */
  onStdout(callback: (chunk: Buffer) => void): void;

  /**
   * Register a callback to be invoked when a chunk is written to stderr.
   */
  onStderr(callback: (chunk: Buffer) => void): void;

  /**
   * Register a callback to be invoked when the process exists.
   */
  onExit(callback: (exitCode: number) => void): void;

  /**
   * Register a callback to be invoked if the process failed to start.
   */
  onError(callback: (error: Error) => void): void;

  /**
   * Write the process stdin stream.
   */
  writeStdin(data: string): void;

};

export interface ProcessSpawnOptions {
  /**
   * Start a TTY enabled process. Should be used when starting an interactive process.
   *
   * @default false
   */
  readonly tty?: boolean;

  /**
   * Allow any option to pass through to the underlying implementation.
   *
   * It's tricky to create a common interface because options can vary quite significantly
   * between a tty and a non tty process.
   */
  [key: string]: any;
}

export class Process {

  public static spawn(command: string, args: string[], options: ProcessSpawnOptions = {}): IProcess {

    const tty = options.tty ?? false;

    if (tty) {
      const process = pty.spawn(command, args, {
        name: 'xterm-color',
        ...options,
      })
      return new PtyProcess(process);
    }

    const process = child.spawn(command, args, {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });
    return new NonPtyProcess(process);

  }
}

class PtyProcess implements IProcess {

  public constructor(private readonly process: pty.IPty) {}

  public onError(_: (error: Error) => void): void {
    // not needed because the pty.spawn will simply fail in this case.
  }

  public onStdout(callback: (chunk: Buffer) => void): void {
    this.process.onData((e) => callback(Buffer.from(e)));
  }

  public onStderr(callback: (chunk: Buffer) => void): void {
    // in a pty all streams are the same
    return this.onStdout(callback);
  }

  public onExit(callback: (exitCode: number) => void): void {
    this.process.onExit((e) => { callback(e.exitCode) });
  }


  public writeStdin(data: string): void {
    // in a pty all streams are the same
    this.process.write(data)
  }

};

class NonPtyProcess implements IProcess {

  public constructor(private readonly process: child.ChildProcess) {}

  public onError(callback: (error: Error) => void): void {
    this.process.once('error', callback);
  }

  public onStdout(callback: (chunk: Buffer) => void): void {
    if (this.process.stdout == null) {
      throw new Error('No stdout defined for process');
    }
    this.process.stdout.on('data', callback);
  }

  public onStderr(callback: (chunk: Buffer) => void): void {
    if (this.process.stderr == null) {
      throw new Error('No stderr defined for process');
    }
    this.process.stderr.on('data', callback);
  }

  public onExit(callback: (exitCode: number) => void): void {
    this.process.on('close', callback);
  }

  public writeStdin(content: string): void {
    if (this.process.stdin == null) {
      throw new Error('No stdin defined for process');
    }
    this.process.stdin.write(content);
  }

};