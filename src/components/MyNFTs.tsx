import React from 'react';
import { useState, useEffect, useContext, useCallback } from 'react';
import { Context } from '../context/context';
import NFTCard from './NFTCard';
// import Spinner from './Spinner';
import { nftAddress, marketplaceAddress } from '../config';
import { ItemWithMetadata } from '../types';
import { getAllNFTs } from '../hooks';

const MyNFTs = () => {
  const {
    state: {
      wallet: { provider, signer },
      defaultProvider,
      connectedSignerAddress,
    },
  } = useContext(Context);
  const [items, setItems] = useState<ItemWithMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAllNFTs = useCallback(async (connectedSignerAddress: string) => {
    setLoading(true);

    const items = await getAllNFTs(provider || defaultProvider);

    const filteredItems = items.filter(
      (item) => item.owner === connectedSignerAddress || (item.seller === connectedSignerAddress && !item.sold)
    );

    setItems(filteredItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (connectedSignerAddress) loadAllNFTs(connectedSignerAddress);
  }, [connectedSignerAddress]);

  if (loading)
    return (
      <div className="container min-vh-100 d-flex justify-content-center">
        {/* <Spinner size={'large'} /> */}
        <p>Loading...</p>
      </div>
    );

  if (!connectedSignerAddress)
    return (
      <div className="container d-flex min-vh-100 justify-content-center">
        {/* <Spinner size={'large'} /> */}
        <p>Please connect wallet</p>
      </div>
    );

  if (!items.length)
    return (
      <div className="container min-vh-100 d-flex justify-content-center">
        <h1 className="">No items</h1>
      </div>
    );

  return (
    <div className="container min-vh-100">
      <div className="row d-flex align-content-start flex-wrap gy-1">
        {items.map((item, i) => {
          return (
            <div key={i} className="col-xl-3 col-lg-4 col-md-6 justify-content-center">
              <NFTCard {...item} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyNFTs;
