import React from 'react';
import { useState, useEffect, useContext } from 'react';
import FormData from 'form-data';
import axios from 'axios';
import { Context } from '../context/context';
// import { withRouter } from 'react-router';
// import { useParams, useLocation, useHistory, useRouteMatch } from 'react-router-dom';
import { mintNFT } from '../hooks';

type FileInput = File | string;

const baseUrl = 'https://api.pinata.cloud';
const uploadFileToIPFS = async (file: FileInput) => {
  if (file instanceof File) {
    // Pin file
    const data = new FormData();
    data.append('file', file);
    const url = `${baseUrl}/pinning/pinFileToIPFS`;
    try {
      const result = await axios.post(url, data, {
        withCredentials: true,
        maxContentLength: Infinity, // this is needed to prevent axios from erroring out with large files
        maxBodyLength: Infinity,
        headers: {
          'Content-type': `multipart/form-data; boundary= ${(data as any)._boundary}`,
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_KEY,
        },
      });

      return result.data.IpfsHash;
    } catch (error) {
      console.error(error);
    }
  } else {
    // Pin JSON
    const data = file;
    const url = `${baseUrl}/pinning/pinJSONToIPFS`;
    try {
      const result = await axios.post(url, data, {
        headers: {
          'Content-type': `application/json`,
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_KEY,
        },
      });

      return result.data.IpfsHash;
    } catch (error) {
      console.error(error);
    }
  }
};

const prepareNFT = async (file: File, formData: Record<string, string>) => {
  const imageIpfsHash = await uploadFileToIPFS(file);

  const {
    name,
    symbol = 'GO',
    description,
    // sellerFeeBasisPoints,
    external_url,
    // attributes,
    // collection,
    // creators
  } = formData;

  const formattedMetadata = {
    name: name.replace(/"/g, ''),
    symbol: symbol.replace(/"/g, ''),
    description: description.replace(/"/g, ''),
    // seller_fee_basis_points: +sellerFeeBasisPoints,
    image: `ipfs://${imageIpfsHash}`,
    external_url: external_url.replace(/"/g, ''),
    // attributes: JSON.parse(attributes),
    // collection: JSON.parse(collection),
    // properties: {
    //   files: [
    //     {
    //       uri: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
    //       type: 'image/png'
    //     },
    //     {
    //       uri: `ipfs://${imageIpfsHash}?ext=png`,
    //       type: 'image/png'
    //     }
    //   ],
    //   category: 'image',
    //   creators
    // }
  };

  const json = {
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: { name: 'metadata.json' },
    pinataContent: formattedMetadata,
  };
  const jsonIpfsHash = await uploadFileToIPFS(JSON.stringify(json));

  return jsonIpfsHash;
};

const Create = () => {
  //   const history = useHistory();
  const {
    state: {
      wallet: { signer },
    },
  } = useContext(Context);
  const [file, setFile] = useState<{ url: string | null; data: File | null }>({
    url: null,
    data: null,
  });
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    description: '',
    external_url: '',
  });
  const [loading, setLoading] = useState(false);

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files![0];
    setFile({
      url: URL.createObjectURL(file),
      data: file,
    });
    setLoading(false);
  };

  const createNFT = async (e: any) => {
    e.preventDefault();

    const { name, description } = formData;
    if (!name || !description || !file.data) return;

    try {
      const added = await prepareNFT(file.data, formData);
      const url = `ipfs://${added}`;
      const tx = await mintNFT(url, signer);
    } catch (e) {
      console.error(e);
    }
  };

  const isValid = signer && file.data && formData.name && formData.description && formData.external_url ? true : false;

  return (
    <div className="container d-flex justify-content-center min-vh-100">
      <form className="d-flex flex-column">
        {loading && (
          <div className="">
            {/* <Spinner size={'large'} /> */}
            <p>Loading...</p>
          </div>
        )}
        {file.url && !loading && <img className="d-flex mx-auto" width="200" src={file.url} alt="Uploaded NFT file" />}
        <input
          type="file"
          name="file"
          placeholder="File"
          className="form-control my-2"
          onChange={(e) => handleFile(e)}
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="form-control my-2"
          onChange={(e) => handleForm(e)}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          className="form-control my-2"
          onChange={(e) => handleForm(e)}
        />
        <input
          type="text"
          name="external_url"
          placeholder="External URL"
          className="form-control my-2"
          onChange={(e) => handleForm(e)}
        />
        <button
          disabled={!isValid || loading}
          type="submit"
          className="btn btn-outline-secondary"
          onClick={(e) => createNFT(e)}
        >
          Create NFT
        </button>
      </form>
    </div>
  );
};

export default Create;
