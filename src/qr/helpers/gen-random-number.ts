export function getRandomNumber(digest: number = 3): number {
  if (digest < 1) {
    return 999;
  }

  const min = Math.pow(10, digest - 1);
  const max = Math.pow(10, digest) - 1;

  return Math.floor(Math.random() * (max - min + 1) + min);
}
