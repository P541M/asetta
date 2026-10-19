import { describe, expect, it, vi } from "vitest";
import { mapWithConcurrency, onceUntilSuccess } from "./async";

/** A promise the test settles by hand. */
function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Lets every pending promise callback run. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Tasks that wait for the test to settle them, recording which ones started. */
function controlledTasks(count: number) {
  const gates = Array.from({ length: count }, () => deferred<string>());
  const started: number[] = [];
  const task = (item: number, index: number) => {
    started.push(index);
    return gates[item].promise;
  };
  return { gates, started, task, items: Array.from({ length: count }, (_, i) => i) };
}

describe("mapWithConcurrency", () => {
  it("A19: never runs more than the limit at once, and starts the next as one finishes", async () => {
    const { gates, started, task, items } = controlledTasks(7);
    const result = mapWithConcurrency(items, 3, task);
    await flush();
    expect(started).toEqual([0, 1, 2]);

    gates[1].resolve("b");
    await flush();
    expect(started).toEqual([0, 1, 2, 3]);

    gates[0].resolve("a");
    gates[2].resolve("c");
    await flush();
    expect(started).toEqual([0, 1, 2, 3, 4, 5]);

    for (const [i, gate] of gates.entries()) gate.resolve(String.fromCharCode(97 + i));
    await expect(result).resolves.toEqual(["a", "b", "c", "d", "e", "f", "g"]);
    expect(started).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("A19: resolves with the results in the items' order, whatever order the tasks finish in", async () => {
    const { gates, task, items } = controlledTasks(4);
    const result = mapWithConcurrency(items, 4, task);
    gates[3].resolve("d");
    gates[1].resolve("b");
    gates[2].resolve("c");
    gates[0].resolve("a");
    await expect(result).resolves.toEqual(["a", "b", "c", "d"]);
  });

  it("runs each item once, with its index", async () => {
    const task = vi.fn(async (item: string, index: number) => `${item}${index}`);
    await expect(mapWithConcurrency(["x", "y", "z"], 2, task)).resolves.toEqual(["x0", "y1", "z2"]);
    expect(task).toHaveBeenCalledTimes(3);
  });

  it("runs every item at once when the limit is above the count", async () => {
    const { started, task, items, gates } = controlledTasks(3);
    const result = mapWithConcurrency(items, 10, task);
    await flush();
    expect(started).toEqual([0, 1, 2]);
    for (const gate of gates) gate.resolve("done");
    await expect(result).resolves.toHaveLength(3);
  });

  it("resolves an empty list to an empty list without calling the task", async () => {
    const task = vi.fn(async () => "never");
    await expect(mapWithConcurrency([], 3, task)).resolves.toEqual([]);
    expect(task).not.toHaveBeenCalled();
  });

  it("on a failure starts nothing new, waits for the running tasks, then rejects with it", async () => {
    const { gates, started, task, items } = controlledTasks(6);
    let settled = false;
    const result = mapWithConcurrency(items, 2, task).finally(() => {
      settled = true;
    });
    result.catch(() => {}); // asserted below

    gates[1].reject(new Error("first"));
    await flush();
    expect(started).toEqual([0, 1]);
    expect(settled).toBe(false); // item 0 is still running

    gates[0].reject(new Error("second"));
    await expect(result).rejects.toThrow("first");
    expect(started).toEqual([0, 1]);
  });

  it.each([[0], [-1], [1.5], [Number.NaN]])("refuses a limit of %s", async (limit) => {
    await expect(mapWithConcurrency([1], limit, async (n) => n)).rejects.toThrow(RangeError);
  });
});

describe("onceUntilSuccess", () => {
  it("A19: runs once after a success, and later calls get the same result", async () => {
    const fn = vi.fn(async () => "verified");
    const verify = onceUntilSuccess(fn);
    await expect(verify()).resolves.toBe("verified");
    await expect(verify()).resolves.toBe("verified");
    await expect(verify()).resolves.toBe("verified");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("A19: calls made while the first attempt runs share it", async () => {
    const gate = deferred<string>();
    const fn = vi.fn(() => gate.promise);
    const verify = onceUntilSuccess(fn);
    const first = verify();
    const second = verify();
    gate.resolve("verified");
    await expect(Promise.all([first, second])).resolves.toEqual(["verified", "verified"]);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("A19: doesn't keep a failure: the next call tries again", async () => {
    const fn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue("verified");
    const verify = onceUntilSuccess(fn);
    await expect(verify()).rejects.toThrow("timeout");
    await expect(verify()).resolves.toBe("verified");
    await expect(verify()).resolves.toBe("verified");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("gives every caller of a failed attempt its error, then tries again", async () => {
    const gate = deferred<string>();
    const fn = vi
      .fn<() => Promise<string>>()
      .mockReturnValueOnce(gate.promise)
      .mockResolvedValue("verified");
    const verify = onceUntilSuccess(fn);
    const first = verify();
    const second = verify();
    gate.reject(new Error("bad login"));
    await expect(first).rejects.toThrow("bad login");
    await expect(second).rejects.toThrow("bad login");
    await expect(verify()).resolves.toBe("verified");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
