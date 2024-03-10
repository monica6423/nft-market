import React, { createContext, useReducer } from 'react';
import { ethers } from 'ethers';

export interface State {
  wallet: { signer: any; provider: any };
  connectedSignerAddress: string | null;
  connectedNetwork: { chainId: number; name: string } | null;
  defaultProvider: any;
}

const initialState: State = {
  wallet: {
    signer: null,
    provider: null,
  },
  connectedSignerAddress: null,
  connectedNetwork: null,
  defaultProvider: new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER_URL),
  // nfts: null,
};

const Context = createContext<{ state: State; dispatch: React.Dispatch<any> }>({
  state: initialState,
  dispatch: () => null,
});

const reducer = (state: State, action: { type: string; payload: any }) => {
  switch (action.type) {
    case 'CONNECT_WALLET':
      return {
        ...state,
        wallet: action.payload,
      };
    case 'DISCONNECT_WALLET':
      return {
        ...state,
        wallet: { signer: null, provider: null },
        connectedSignerAddress: null,
      };
    case 'SET_CONNECTED_WALLET':
      return {
        ...state,
        connectedSignerAddress: action.payload.address,
        connectedNetwork: action.payload.network,
      };
    default:
      throw new Error(`Unknown action type ${action.type}`);
  }
};

const ContextProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>;
};

export { Context, ContextProvider };
