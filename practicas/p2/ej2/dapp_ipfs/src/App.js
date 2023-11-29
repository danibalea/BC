import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import './App.css';
import './styles.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [file, setFile] = useState(null);
  const [nombreCandidato, setNombreCandidato] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [ganador, setGanador] = useState(null);


  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          console.log('Conexión a Metamask exitosa.');

          setWeb3(web3Instance);

          const abi = [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "_nombre",
                  "type": "string"
                }
              ],
              "name": "agregarCandidato",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "candidatos",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "nombre",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "votos",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "haVotado",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_candidatoId",
                  "type": "uint256"
                }
              ],
              "name": "obtenerCandidato",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "obtenerGanadorVotacion",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "obtenerTotalCandidatos",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_candidatoId",
                  "type": "uint256"
                }
              ],
              "name": "votar",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]

          const contratoAddress = '0xF2A76A6216537bC4275505427449901B1f6E3b3d'; 

          const contrato = new web3Instance.eth.Contract(abi, contratoAddress);
          console.log('dsfahsdhjedh')
          console.log('Contrato:', contrato)
          setContract(contrato);
        } catch (error) {
          console.error('Error al conectar con Metamask:', error);
        }
      } else {
        console.error('Metamask no detectado en este navegador.');
      }
    };

    initWeb3();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleNombreChange = (event) => {
    setNombreCandidato(event.target.value);
  };

  const obtenerGanador = async () => {
    try {
      const ganador = await contract.methods.obtenerGanadorVotacion().call();
      setGanador(ganador);
    } catch (error) {
      console.error('Error al obtener el ganador:', error);
    }
  };


  const subirAIPFS = async () => {
    try {
      if (!nombreCandidato || !file) {
        console.error('Por favor, ingresa el nombre y selecciona una foto.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const resFile = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'pinata_api_key': `${process.env.REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${process.env.REACT_APP_PINATA_API_SECRET}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const imgHash = resFile.data.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imgHash}`;

      console.log('Archivo subido a IPFS:', imageUrl);

      // Llamada a la función del contrato para agregar el candidato
      const accounts = await web3.eth.getAccounts();
      await contract.methods.agregarCandidato(nombreCandidato, imageUrl).send({ from: accounts[0] });

      setUploadStatus('Candidato agregado exitosamente.');

      // Agregar la URL de la imagen a la lista de imágenes subidas
      setUploadedImages([...uploadedImages, { imageUrl, votos: 0, nombre: nombreCandidato }]);
    } catch (error) {
      console.error('Error al subir el archivo a IPFS o agregar el candidato:', error);
      setUploadStatus('Error al subir el archivo a IPFS o agregar el candidato. Por favor, inténtalo de nuevo.');
    }
  };

  const votar = async (index) => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.votar(index).send({ from: accounts[0] });

      // Actualizar el estado de votos localmente
      const updatedImages = [...uploadedImages];
      updatedImages[index].votos += 1;
      setUploadedImages(updatedImages);
    } catch (error) {
      console.error('Error al votar:', error);
    }
  };

  return (
    <div>
      <h1>Subir Foto de Candidato a IPFS, Agregar a Contrato y Votar</h1>
      <div>
        <label>Nombre del Candidato:</label>
        <input type="text" value={nombreCandidato} onChange={handleNombreChange} />
      </div>
      <div>
        <label>Seleccionar Foto:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <button onClick={subirAIPFS}>Subir a IPFS, Agregar a Contrato y Votar</button>
      {uploadStatus && <p>{uploadStatus}</p>}

      {/* Mostrar imágenes subidas y botones de votar */}
      {uploadedImages.length > 0 && (
        <div>
          <h2>Imágenes Subidas</h2>
          {uploadedImages.map((image, index) => (
            <div key={index}>
              <img src={image.imageUrl} alt={`Imagen ${index + 1}`} style={{ maxWidth: '300px', margin: '10px' }} />
              <p>Nombre del Candidato: {image.nombreCandidato}</p>
              <button onClick={() => votar(index)}>Votar ({image.votos} votos)</button>
            </div>
          ))}
          <button onClick={obtenerGanador}>Obtener Ganador</button>
          {ganador && (
            <div>
              <h3>Ganador de la Votación</h3>
              <p>ID: {ganador[0].toString()}</p>
              <p>Nombre: {ganador[1]}</p>
              <p>Votos: {ganador[2].toString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
