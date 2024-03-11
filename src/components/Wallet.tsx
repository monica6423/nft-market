import React, { useContext } from 'react';
import { Context } from '../context/context';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { shortenString } from '../utils';
import { supportedNetworks, networkIdToNameMap } from '../config';
import styles from './styles.module.css';

const Wallet = () => {
  const {
    state: { wallet, connectedSignerAddress, connectedNetwork },
    dispatch,
  } = useContext(Context);
  const [signerData, setSignerData] = useState<{ address: string | null; balance: string | null }>({
    address: null,
    balance: null,
  });
  const { address, balance } = signerData;

  const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    dispatch({
      type: 'CONNECT_WALLET',
      payload: { provider, signer },
    });
    dispatch({
      type: 'SET_CONNECTED_WALLET',
      payload: { address, network },
    });
  };

  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT_WALLET' });
  };

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: any) => {
      // onAccountsChanged(accounts[0])
      if (accounts.length && wallet.provider) window.location.reload();
    });
  }

  useEffect(() => {
    if (wallet.signer) {
      getSignerData(wallet.signer);
    }
    if (wallet.provider) getBlockData();

    if (!wallet.provider) setSignerData({ address: null, balance: null });
  }, [wallet]);

  const getSignerData = async (signer: ethers.Signer) => {
    const address = await signer.getAddress();
    const balanceBn = await signer.getBalance();
    const balance = parseFloat(ethers.utils.formatUnits(balanceBn.toString(), 'ether')).toFixed(5);
    return setSignerData({ address, balance });
  };

  const getBlockData = async () => {
    const blockData = await wallet.provider.getBlock();
  };

  return (
    <div className="d-flex">
      {address && (
        <div className="d-flex align-items-center">
          {connectedNetwork && supportedNetworks.includes(connectedNetwork.chainId) && (
            <p className="p-1">
              {connectedNetwork.name !== 'unknown'
                ?  networkIdToNameMap[connectedNetwork.chainId]
                : connectedNetwork.name}
            </p>
          )}
          {connectedNetwork && !supportedNetworks.includes(connectedNetwork.chainId) && (
            <p className="p-1">
              Unsupported network. Connect to:{' '}
              {supportedNetworks.map((chainId) => networkIdToNameMap[chainId]).join(', ')}
            </p>
          )}
          <p className="p-1">{shortenString(address, 7)}</p>
          {/* {balance && <p className="p-1">{shortenString(balance, 10)}</p>} */}
        </div>
      )}
      {!address ? (
        <button className={`btn ${styles.mainButton}`} onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <button className="btn btn-sm btn-outline-secondary" onClick={disconnectWallet}>
          Disconnect
        </button>
      )}
    </div>
  );
};

export default Wallet;
