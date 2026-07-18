export function createPollingSubscription(
  onChange: () => void,
  intervalMilliseconds = 15000
): () => void {
  let active = true;
  let running = false;

  const execute = async (): Promise<void> => {
    if (!active || running) return;

    running = true;

    try {
      await Promise.resolve(onChange());
    } catch (error) {
      console.error(
        "Error actualizando datos periódicos:",
        error
      );
    } finally {
      running = false;
    }
  };

  const intervalId = setInterval(
    () => {
      void execute();
    },
    intervalMilliseconds
  );

  return () => {
    active = false;
    clearInterval(intervalId);
  };
}