import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { ItemWithMetadata } from '../types';
import { shortenString } from '../utils';
import { Context } from '../context/context';
import { buyItem, withdrawItem, sellItem } from '../hooks';
import CardImage from './CardImage';

const NFTCard = ({
  itemId,
  tokenId,
  seller,
  owner,
  price,
  sold,
  name,
  description,
  image,
  external_url,
}: ItemWithMetadata) => {
  const {
    state: {
      wallet: { signer },
      connectedSignerAddress,
    },
  } = useContext(Context);
  const [sellPrice, setSellPrice] = useState<string | null>(null);

  return (
    <div className="card" style={{ height: '100%' }}>
      <CardImage image={image} />
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <h6 className="card-title">{name}</h6>
          <h6 className="card-title">#{tokenId}</h6>
        </div>

        <p className="card-text">{description}</p>
        <Link to={`/item/${tokenId}`} className="card-link">
          Details
        </Link>
        <a target="_blank" rel="noreferrer" href={external_url} className="card-link">
          See details
        </a>
        <p className="text-muted">
          Owner: {owner === ethers.constants.AddressZero && seller ? shortenString(seller) : shortenString(owner)}
        </p>
        {price && <h5 className="text-center my-2">{price} MATIC</h5>}
      </div>
      {signer && connectedSignerAddress !== seller && price && itemId && (
        <button className="btn btn-outline-secondary" onClick={() => buyItem(itemId, price, signer)}>
          Buy
        </button>
      )}
      {signer && connectedSignerAddress === seller && seller && !sold && itemId && (
        <button className="btn btn-outline-secondary" onClick={() => withdrawItem(itemId, signer)}>
          Withdraw
        </button>
      )}
      {signer && connectedSignerAddress === owner && !price && !seller && (
        <div className="card-footer">
          <div className="input-group">
            <span className="input-group-text" id="basic-addon1">
              MATIC
            </span>
            <input
              type="number"
              min={0}
              className="form-control"
              placeholder="Price"
              onChange={(e) => setSellPrice(e.target.value.length ? e.target.value : null)}
            />
            <button
              className="btn btn-outline-secondary"
              id="button-addon1"
              onClick={() => sellItem(tokenId, sellPrice!, signer)}
            >
              Sell
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTCard;
