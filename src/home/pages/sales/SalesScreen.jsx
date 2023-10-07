//IMPORTACIONES
import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrashAlt } from "react-icons/fa"
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useNavigate } from "react-router-dom"
import InputGroup from "react-bootstrap/InputGroup"
import { BsSearch } from "react-icons/bs"
import "./SalesScreen.css"
import { AddSale } from './AddSale'
import { DeleteSale } from './DeleteSale'
import { EditSale } from './EditSale'

//COMPONENTE
export const SalesScreen = () => {

  //DECLARACION DE CONSTANTES
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [orderOption, setOrderOption] = useState('name')

  const [showAddSaleModal, setShowAddSaleModal] = useState(false)
  const handleCloseAddSaleModal = () => setShowAddSaleModal(false)

  const [showDeleteSaleModal, setShowDeleteSaleModal] = useState(false)

  const [showEditSaleModal, setShowEditSaleModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)

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


  //MANEJO PARA ELIMINAR PRODUCTO
  const handleShowDeletSaleModal = (sale) => {
    setSelectedSale(sale)
    setShowDeleteSaleModal(true)
  }
  const handleCloseDeleteSaleModal = () => {
    setSelectedSale(null)
    setShowDeleteSaleModal(false)
  }

  const handleShowEditSaleModal = (sale) => {
    setSelectedSale(sale)
    setShowEditSaleModal(true)
  }

  const handleCloseEditSaleModal = () => {
    setShowEditSaleModal(false)
  }

  const handleOrderOptionChange = (event) => {
    setOrderOption(event.target.value)
  }
  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value)
  }

  //FUNCION PARA FILTRAR LAS VENTAS
  const filteredSales = sales.filter((sale) => {
    const saleDate = sale.date.toLowerCase()
    return saleDate.includes(searchTerm.toLowerCase()) && sale.status === 'completed'
  })

  //FUNCION PARA ORDENAR LAS VENTAS
  function compareSales(a, b) {
    if (orderOption === 'Variedad ↓') {
      return a.type.localeCompare(b.type)
    } else if (orderOption === 'Variedad ↑') {
      return b.type.localeCompare(a.type)
    } else if (orderOption === 'Stock ↓') {
      return b.stock - a.stock
    } else if (orderOption === 'Stock ↑') {
      return a.stock - b.stock
    }
    return 0
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
        <h1 className='mb-5 saleTitle'><b>Ventas Realizadas</b></h1>
        <div className='row d-md-flex'>
          <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
            <InputGroup>
              <InputGroup.Text id="btnGroupAddon">
                <BsSearch />
              </InputGroup.Text>
              <Form.Control
                maxLength={30}
                type="text"
                placeholder="Buscar venta"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </InputGroup>
          </div>
          <div className='col-12 col-xl-3 my-2 my-md-0'>
            <Form.Group className='d-flex' controlId="orderOptionForm">
              <Form.Label className='w-50' column sm={2}><b className='homeText saleTitle'>Ordenar por:</b></Form.Label>
              <Form.Select className='w-50' as="select" value={orderOption} onChange={handleOrderOptionChange}>
                <option value="Variedad ↓">Variedad ↓</option>
                <option value="Variedad ↑">Variedad ↑</option>
                <option value="Stock ↓">Stock ↓</option>
                <option value="Stock ↑">Stock ↑</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        <div className='table-container mt-4' >
          <Table striped bordered hover>
            <thead>
              <tr>
                {/* <th className='homeText text-center align-middle saleTitle'>ID</th> */}
                <th className='homeText text-center align-middle saleTitle'>Fecha</th>
                <th className='homeText text-center align-middle saleTitle'>Vendedor</th>
                <th className='homeText text-center align-middle saleTitle'>Cliente</th>
                <th className='homeText text-center align-middle saleTitle'>Cantidad</th>
                <th className='homeText text-center align-middle saleTitle'>Descripción</th>
                <th className='homeText text-center align-middle saleTitle'>Estado</th>
                <th className='homeText text-center align-middle saleTitle'>Precio Unitario</th>
                <th className='homeText text-center align-middle saleTitle'>Total</th>
                <th className='homeText text-center align-middle saleTitle'>Forma de pago</th>
                <th className='homeText text-center align-middle saleTitle'>Pago a cuenta</th>
                <th className='homeText text-center align-middle saleTitle'>Saldo</th>
                <th className='homeText text-center align-middle saleTitle'>Estado</th>
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
                    {/* <td className="text-center align-middle">{sale._id}</td> */}
                    <td className="text-center align-middle">{formatDate(sale.date)}</td>
                    <td className="text-center align-middle">
                      {user ? `${user.lastName}, ${user.firstName}` : ''}
                    </td>
                    <td className="text-center align-middle">
                      {client ? `${client.lastName}, ${client.firstName}` : ''}
                    </td>
                    <td className="text-center align-middle">{sale.amount}</td>
                    <td className="text-center align-middle">
                      {product ? `${product.type}` : ''}
                    </td>
                    <td className="text-center align-middle">{sale.productStatus}</td>
                    <td className="text-center align-middle">{sale.unitPrice}</td>
                    <td className="text-center align-middle">{sale.unitPrice * sale.amount}</td>
                    <td className="text-center align-middle">{sale.wayToPay}</td>
                    <td className="text-center align-middle">{sale.payment}</td>
                    <td className="text-center align-middle">
                      {sale.payment ? sale.amount * sale.unitPrice - sale.payment : null}
                    </td>
                    <td className={`text-center align-middle ${sale.amount * sale.unitPrice - sale.payment > 0 ? 'red-text' : (sale.amount * sale.unitPrice - sale.payment === 0 ? 'green-text' : 'blue-text')}`}>
                      {sale.amount * sale.unitPrice - sale.payment > 0 ? 'Saldo pendiente' : (sale.amount * sale.unitPrice - sale.payment === 0 ? 'Saldado' : 'Saldo a favor')}
                    </td>
                    <td className="text-center align-middle">
                      <Button className='m-1 editButton' onClick={() => handleShowEditSaleModal(sale)} variant="secondary">
                        <span className="d-flex align-items-center justify-content-center">
                          <FaEdit />
                        </span>
                      </Button>
                      <Button className='m-1' onClick={() => handleShowDeletSaleModal(sale)} variant="danger">
                        <span className="d-flex align-items-center justify-content-center">
                          <FaTrashAlt />
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
      <AddSale show={showAddSaleModal} onHide={handleCloseAddSaleModal} fetchSales={fetchSales} />
      <DeleteSale show={showDeleteSaleModal} onHide={handleCloseDeleteSaleModal} fetchSales={fetchSales} selectedSale={selectedSale} />
      <EditSale show={showEditSaleModal} onHide={handleCloseEditSaleModal} fetchSales={fetchSales} selectedSale={selectedSale} />
    </>
  )
}
