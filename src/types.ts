export interface Item {
  tokenId: string;
  owner: string;
  itemId?: string;
  nftContract?: string;
  seller?: string;
  price?: string;
  sold?: boolean;
  canceled?: boolean;
}

export interface ItemMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  symbol: string;
}

export type ItemWithMetadata = Item & ItemMetadata;
