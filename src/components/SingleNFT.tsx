import React from 'react';
import { useState, useEffect, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import Web3Modal from 'web3modal';
import { Context } from '../context/context';
import NFTCard from './NFTCard';
import { useParams } from 'react-router-dom';
// import Spinner from './Spinner'
import { nftAddress, marketplaceAddress } from '../config';
import { ItemWithMetadata } from '../types';
import { getNFTByTokenId } from '../hooks';

const SingleNFT = () => {
  const { id } = useParams();
  const {
    state: {
      wallet: { provider, signer },
      defaultProvider,
    },
  } = useContext(Context);
  const [items, setItems] = useState<ItemWithMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadItems = useCallback(async (tokenId: string) => {
    setLoading(true);

    const items = await getNFTByTokenId(tokenId, provider || defaultProvider, signer);

    // const unsoldItems = items.filter((item) => !item.sold);
    // console.log(unsoldItems);

    setItems(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems(id!);
  }, []);

  if (loading)
    return (
      <div className="container d-flex justify-content-center">
        {/* <Spinner size={'large'} /> */}
        <p>Loading...</p>
      </div>
    );

  if (!items)
    return (
      <div className="container d-flex justify-content-center">
        <h1 className="">No owned items</h1>
      </div>
    );

  return (
    <div key={items.tokenId} className="container">
      <div className="row d-flex justify-content-center flex-wrap gy-1">
        <div className="col-xl-3 col-lg-4 col-md-6 justify-content-center">
          <NFTCard {...items} />
        </div>
      </div>
    </div>
  );
};

export default SingleNFT;
