//IMPORTACIONES
import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useNavigate } from "react-router-dom"

export const ComandasScreen = () => {

    const [products, setProducts] = useState([])
    const store = TokenStorage()
    const navigate = useNavigate()

    useEffect(() => {
        if (store.tokenValid) {
            axios.get('/products', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setProducts(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
        } else {
            navigate("/login")
        }
    }, [navigate, store.token, store.tokenValid])


    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedProducts = [...products];
        updatedProducts[index][name] = value;
        setProducts(updatedProducts);
    };


    return (
        <>
            <h1 className='m-5 productTitle'><b>Comandas</b></h1>
            <div className='col-8 '>
                <div className='d-col'>
                    <h6>Nombre:</h6>
                    <h6>Dirección:</h6>
                    <h6>Fecha:</h6>
                </div>
                <div className='mx-5'>

                    <Table bordered hover>
                        <thead>
                            <tr>
                                <th className='w-25'>Descripción</th>
                                <th className='w-auto p-1'>Unidad</th>
                                <th className='w-auto p-1'>$ / docena</th>
                                <th className='w-auto p-1'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product._id} >
                                    <td className="text-center align-middle">{product.type}</td>
                                    <td>
                                        <input
                                            type="text"
                                            name={`unit_${index}`}
                                            value={product.unit}
                                            onChange={(e) => handleInputChange(e, index)}
                                            className="form-control border-0" // Aquí agregamos la clase para quitar el borde
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name={`price_${index}`}
                                            value={product.price}
                                            onChange={(e) => handleInputChange(e, index)}
                                            className="form-control border-0" // Aquí agregamos la clase para quitar el borde
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name={`total_${index}`}
                                            value={product.total}
                                            onChange={(e) => handleInputChange(e, index)}
                                            className="form-control border-0" // Aquí agregamos la clase para quitar el borde
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </>
    )
}
