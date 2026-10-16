// CANARY: wall-clock, randomness, network, env and logging inside the domain.
export const impure = async (): Promise<number> => {
  const started = Date.now();
  const at = new Date();
  const jitter = Math.random();
  const res = await fetch('https://example.com');
  console.log(process.env['HOME'], at, res.status);
  return started + jitter;
};
