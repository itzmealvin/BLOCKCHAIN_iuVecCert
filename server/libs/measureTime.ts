export default async function measureExecutionTime<T>(
    func: () => Promise<T> | T,
): Promise<{ result: T; timeTaken: number }> {
    const startTime = Date.now();
    const result = await func();
    const endTime = Date.now();
    return {
        result,
        timeTaken: endTime - startTime,
    };
}