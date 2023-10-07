//IMPORTACIONES
import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useNavigate } from "react-router-dom"
import InputGroup from "react-bootstrap/InputGroup"
import { BsSearch } from "react-icons/bs"
import "./OrdersScreen.css"
import { AddOrder } from './AddOrder'
import { DeleteSale } from '../sales/DeleteSale'
import { FinishOrder } from './FinichOrder'
// import { EditSale } from './EditSale'
export const OrdersScreen = () => {

    //DECLARACION DE CONSTANTES
    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [clients, setClients] = useState([])
    const [users, setUsers] = useState([])

    const [searchTerm, setSearchTerm] = useState('')
    const [orderOption, setOrderOption] = useState('date ↑');
    const [searchOption, setSearchOption] = useState('client')

    const [showAddOrderModal, setShowAddOrderModal] = useState(false)
    const handleCloseAddOrderModal = () => setShowAddOrderModal(false)

    const [showDeleteSaleModal, setShowDeleteSaleModal] = useState(false)
    const [selectedSale, setSelectedSale] = useState(null)

    const [showFinishOrderModal, setShowFinishOrderModal] = useState(false)


    const store = TokenStorage()
    const navigate = useNavigate()



    useEffect(() => {
        if (store.tokenValid) {
            axios.get('/sales', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setSales(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
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
            axios.get('/clients', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setClients(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
            axios.get('/users', {
                headers: {
                    "access-token": store.token
                }
            })
                .then((response) => {
                    setUsers(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
        } else {
            navigate("/login")
        }
    }, [navigate, store.token, store.tokenValid])


    const pendingSales = sales.filter((sale) => sale.status === 'pending');

    //MANEJO PARA ELIMINAR PRODUCTO
    const handleShowDeletSaleModal = (sale) => {
        setSelectedSale(sale)
        setShowDeleteSaleModal(true)
    }
    const handleCloseDeleteSaleModal = () => {
        setSelectedSale(null)
        setShowDeleteSaleModal(false)
    }
    const handleShowFinishOrderModal = (sale) => {
        setSelectedSale(sale)
        setShowFinishOrderModal(true)
    }
    const handleCloseFinishOrderModal = () => {
        setShowFinishOrderModal(false)
    }

    //MANEJO PARA BUSQUEDA Y FILTRO
    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value)
    }
    const handleSearchOptionChange = (event) => {
        setSearchOption(event.target.value)
    }
    const handleOrderOptionChange = (event) => {
        setOrderOption(event.target.value)
    }

    const fetchSales = async () => {
        try {
            const response = await axios.get('/sales', {
                headers: {
                    "access-token": store.token
                }
            })
            setSales(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    //FUNCION PARA FILTRAR LOS PEDIDOS
    const filteredSales = pendingSales.filter((sale) => {
        const client = clients.find((client) => client._id === sale.client);
        const user = users.find((user) => user._id === sale.user);
        const date = sale.date;
        const product = products.find((product) => product._id === sale.product);

        switch (searchOption) {
            case 'client':
                return client && client.firstName.toLowerCase().includes(searchTerm.toLowerCase());
            case 'user':
                return user && `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
            case 'date':
                return date.includes(searchTerm.toLowerCase());
            case 'product':
                return product && product.type.toLowerCase().includes(searchTerm.toLowerCase());
            default:
                return client && client.firstName.toLowerCase().includes(searchTerm.toLowerCase());
        }
    });

    //FUNCION PARA ORDENAR LOS PEDIDOS
    function compareSales(a, b) {
        if (orderOption === 'date ↓') {
            return new Date(a.date) - new Date(b.date);
        } else if (orderOption === 'date ↑') {
            return new Date(b.date) - new Date(a.date);
        }
        // else if (orderOption === 'Cliente ↓') {
        //     return b.stock - a.stock
        // } else if (orderOption === 'Cliente ↑') {
        //     return a.stock - b.stock
        // } else if (orderOption === 'Vendedor ↓') {
        //     return b.stock - a.stock
        // } else if (orderOption === 'Vendedor ↑') {
        //     return a.stock - b.stock
        // }
        return 0
    }

    //Funcion para convertir fecha a la zona horaria local
    function formatDate(dateString) {
        const utcDate = new Date(dateString);
        const day = utcDate.getUTCDate();
        const month = utcDate.getUTCMonth() + 1;
        const year = utcDate.getUTCFullYear();
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }

    return (
        <>
            <div className='text-center p-5'>
                <h1 className='mb-5 title clientTitle'><b>Pedidos</b></h1>
                <div className='row d-md-flex'>
                    <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
                        <InputGroup>
                            <InputGroup.Text id="btnGroupAddon">
                                <BsSearch />
                            </InputGroup.Text>
                            <Form.Control
                                maxLength={30}
                                type="text"
                                placeholder="Buscar pedido"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                            />
                        </InputGroup>
                    </div>
                    <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
                        <Form.Group className='d-flex' controlId="searchOptionForm">
                            <Form.Label className='w-50' column sm={2}><b className='homeText clientTitle'>Buscar por:</b></Form.Label>
                            <Form.Select className='w-50' as="select" value={searchOption} onChange={handleSearchOptionChange}>
                                <option value="client">Cliente</option>
                                <option value="user">Vendedor</option>
                                <option value="date">Fecha</option>
                                <option value="product">Variedad</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                    <div className='col-12 col-xl-3 my-2 my-md-0'>
                        <Form.Group className='d-flex' controlId="orderOptionForm">
                            <Form.Label className='w-50' column sm={2}><b className='homeText saleTitle'>Ordenar por:</b></Form.Label>
                            <Form.Select className='w-50' as="select" value={orderOption} onChange={handleOrderOptionChange}>
                                <option value="date ↓">Fecha ↓</option>
                                <option value="date ↑">Fecha ↑</option>
                                {/* <option value="Stock ↓">Stock ↓</option>
                                <option value="Stock ↑">Stock ↑</option> */}
                            </Form.Select>
                        </Form.Group>
                    </div>
                    <div className='col-12 col-xl-2 my-2 my-md-0 ms-auto'>
                        <Nav.Link className="buttonAddClient" onClick={() => setShowAddOrderModal(true)}>Nuevo Pedido</Nav.Link>
                    </div>
                </div>
                <div className='table-container mt-4' >

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className='homeText text-center align-middle saleTitle'>Fecha</th>
                                <th className='homeText text-center align-middle saleTitle'>Vendedor</th>
                                <th className='homeText text-center align-middle saleTitle'>Detalles del cliente</th>
                                <th className='homeText text-center align-middle saleTitle'>Detalles del pedido</th>
                                <th className='homeText text-center align-middle saleTitle'>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.slice().sort(compareSales).map((sale) => {
                                const product = products.find((product) => product._id === sale.product);
                                const client = clients.find((client) => client._id === sale.client);
                                const user = users.find((user) => user._id === sale.user);

                                return (
                                    <tr key={sale._id}>
                                        <td className="text-center align-middle">{formatDate(sale.date)}</td>
                                        <td className="text-center align-middle">
                                            {user ? `${user.lastName}, ${user.firstName}` : ''}
                                        </td>
                                        <td className="text-center align-middle">
                                            <div><b>Nombre:</b> {client ? `${client.lastName}, ${client.firstName}` : ''}</div>
                                            <div><b>Dirección:</b> {client ? `${client.address}` : ''}</div>
                                            <div><b>Teléfono:</b> {client ? `${client.phone}` : ''}</div>
                                        </td>
                                        <td className="text-center align-middle">
                                            <div><b>Variedad:</b> {product ? `${product.type}` : ''}</div>
                                            <div><b>Cantidad:</b> {sale.amount} - {sale.amountDescription}</div>
                                            <div><b>Estado:</b> {sale.productStatus}</div>
                                        </td>
                                        <td className="text-center align-middle">${sale.unitPrice * sale.amount}</td>
                                        <td className="text-center align-middle">
                                            <Button className='m-1 editButton' variant="secondary" onClick={() => handleShowFinishOrderModal(sale)}>
                                                <span className="d-flex align-items-center justify-content-center">
                                                    Finalizar pedido
                                                </span>

                                            </Button>
                                            <Button className='m-1' variant="danger" onClick={() => handleShowDeletSaleModal(sale)} >
                                                <span className="d-flex align-items-center justify-content-center">
                                                    Cancelar
                                                </span>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            </div>
            <AddOrder show={showAddOrderModal} onHide={handleCloseAddOrderModal} fetchSales={fetchSales} />
            <DeleteSale show={showDeleteSaleModal} onHide={handleCloseDeleteSaleModal} fetchSales={fetchSales} selectedSale={selectedSale} />
            <FinishOrder show={showFinishOrderModal} onHide={handleCloseFinishOrderModal} fetchSales={fetchSales} selectedSale={selectedSale} />
        </>
    )
}
