import React from 'react';
import { useState, useEffect, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import Web3Modal from 'web3modal';
import { Context } from '../context/context';
import NFTCard from './NFTCard';
// import Spinner from './Spinner'

import { nftAddress, marketplaceAddress } from '../config';
import { IPFS_BASE_URL } from '../constants';
import { ItemWithMetadata, ItemMetadata } from '../types';
import { getAllMarketItems } from '../hooks';

const UnsoldNFTs = () => {
  const {
    state: {
      wallet: { provider, signer },
      defaultProvider,
    },
  } = useContext(Context);
  const [items, setItems] = useState<ItemWithMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadItems = useCallback(async () => {
    setLoading(true);

    const items = await getAllMarketItems(provider || defaultProvider, signer);

    const unsoldItems = items.filter((item) => !item.sold && !item.canceled);
    console.log(unsoldItems);

    setItems(unsoldItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, []);

  if (loading)
    return (
      <div className="container d-flex justify-content-center">
        {/* <Spinner size={'large'} /> */}
        <p>Loading...</p>
      </div>
    );

  if (!loading && !items.length)
    return (
      <div className="container d-flex justify-content-center">
        <h1 className="">No listed items</h1>
      </div>
    );

  return (
    <div className="container">
      <div className="row d-flex align-content-start flex-wrap gy-1">
        {items.map((item, i) => {
          return (
            <div key={i} className="col-xl-3 col-lg-4 col-md-6 justify-content-center">
              <NFTCard {...item} />{' '}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnsoldNFTs;
