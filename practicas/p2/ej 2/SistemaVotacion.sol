//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract SistemaVotacion {
    //Estructura para representar un candidato
    struct Candidato {
        uint id;
        string nombre;
        uint votos;
    }

    //Almacena la lista de candidatos
    Candidato[] public candidatos;

    //Mapeo de direcciones Ethereum a candidatos votados
    mapping(address => bool) public haVotado;

   
    function agregarCandidato(string memory _nombre) public {
        candidatos.push(Candidato(candidatos.length, _nombre, 0));
    }

    
    function votar(uint _candidatoId) public {
       
        //require(haVotado[msg.sender]!=true);

        
        require(_candidatoId >= 0 && _candidatoId < candidatos.length);

        
        candidatos[_candidatoId].votos++;
        haVotado[msg.sender] = true;
    }

   
    function obtenerTotalCandidatos() public view returns (uint) {
        return candidatos.length;
    }

   
    function obtenerGanadorVotacion() public view returns (uint, string memory, uint) {
        Candidato memory ganador;
        uint maximoVotos = 0;
        for (uint x = 0; x < candidatos.length; x++) {
            if ( candidatos[x].votos > maximoVotos) {
                ganador = candidatos[x];
                maximoVotos = candidatos[x].votos;
            }
        }
        return (ganador.id, ganador.nombre, ganador.votos);
    }

    
    function obtenerCandidato(uint _candidatoId) public view returns (uint, string memory, uint) {
        require(_candidatoId >= 0 && _candidatoId < candidatos.length);
        Candidato memory candidato = candidatos[_candidatoId];
        return (candidato.id, candidato.nombre, candidato.votos);
    }
}