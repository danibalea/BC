//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
contract FabricaContract{
    uint idDigits=16;
    struct Producto{
        string nombre;
        uint id;
    }

    Producto[] productos;

    mapping (uint256 =>address) public productoAPropietario;
    mapping (address=>uint256)public propietarioProductos;

    event NuevoProducto(uint ArrayProductoId, string nombre, uint id);

    function _crearProducto(string memory _nombre, uint _id)  private{
        productos.push(Producto(_nombre, _id));
        emit NuevoProducto(productos.length-1, _nombre,_id);
    }
    function _generarIdAleatorio(string memory _str) private view  returns (uint){
        uint idModulus=10^idDigits;
        uint rand=uint(keccak256(abi.encodePacked(_str)))%idModulus;
        return rand;
    }
    function crearProductoAleatorio(string memory _nombre) public{
        uint randId= _generarIdAleatorio(_nombre);
        _crearProducto(_nombre, randId);
    }
    function Propiedad(uint idProducto) public{
        productoAPropietario[idProducto]=msg.sender;
        propietarioProductos[msg.sender]=propietarioProductos[msg.sender]+1;
    }
    function getProductosPorPropietario(address  _propietario) external view returns (uint[] memory) {
        uint contador=0;
        uint[] memory  resultado=new uint[](propietarioProductos[_propietario]);
        for (uint x=0; x<productos.length;x++){
            uint id =productos[x].id;
            if(productoAPropietario[id] == _propietario){
                resultado[contador]=productos[x].id;
                contador++;
            }
        }
        return resultado;
    }

}
