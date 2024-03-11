import React from 'react';
import { useState, useEffect, useContext, useCallback } from 'react';
import { Context } from '../context/context';
import NFTCard from './NFTCard';
// import Spinner from './Spinner';
import { ItemWithMetadata } from '../types';
import { getAllNFTs } from '../hooks';

const SingleNFT = () => {
  const {
    state: {
      wallet: { provider, signer },
      defaultProvider,
    },
  } = useContext(Context);
  const [items, setItems] = useState<ItemWithMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAllNFTs = useCallback(async () => {
    setLoading(true);

    const items = await getAllNFTs(provider || defaultProvider);

    setItems(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllNFTs();
  }, []);

  if (loading)
    return (
      <div className="container min-vh-100 d-flex justify-content-center">
        {/* <Spinner size={'large'} /> */}
        <p>Loading...</p>
      </div>
    );

  if (!loading && !items.length)
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

export default SingleNFT;
