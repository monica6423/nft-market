import { IPFS_BASE_URL } from './constants';

export const extractIpfsHashFromUrl = (url: string) => {
  if (!url) return;
  return url.includes('ipfs://') ? url.split('ipfs://')[1] : url.split(`${IPFS_BASE_URL}/`)[1];
};

export const shortenString = (input: string, length: number = 5) => input.substring(0, length);
