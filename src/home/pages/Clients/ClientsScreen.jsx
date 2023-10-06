//IMPORTACIONES
import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrashAlt } from "react-icons/fa"
import Table from 'react-bootstrap/Table'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useNavigate } from "react-router-dom"
import InputGroup from "react-bootstrap/InputGroup"
import { BsSearch } from "react-icons/bs"
import { AddClient } from './AddClient'
import { DeleteClient } from './DeleteClient'
import { EditClient } from './EditClient'
import "./ClientsScreen.css"

//COMPONENTE
export const ClientsScreen = () => {

  //DECLARACION DE CONSTANTES
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [orderOption, setOrderOption] = useState('name')

  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const handleCloseAddClientModal = () => setShowAddClientModal(false)

  const [showDeleteClientModal, setShowDeleteClientModal] = useState(false)

  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)

  const [searchOption, setSearchOption] = useState('name')
  const store = TokenStorage()
  const navigate = useNavigate()


  useEffect(() => {
    if (store.tokenValid) {
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
    } else {
      navigate("/login")
    }
  }, [navigate, store.token, store.tokenValid])


  //MANEJO PARA ELIMINAR CLIENTE
  const handleShowDeleteClientModal = (client) => {
    setSelectedClient(client)
    setShowDeleteClientModal(true)
  }
  const handleCloseDeleteClientModal = () => {
    setSelectedClient(null)
    setShowDeleteClientModal(false)
  }



  const handleShowEditClientModal = (client) => {
    setSelectedClient(client)
    setShowEditClientModal(true)
  }

  const handleCloseEditClientModal = () => {
    setShowEditClientModal(false)
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



  //FUNCION PARA FILTRAR CLIENTES
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    const patientId = client._id.toLowerCase()
    const paymentStatus = client.isPaymentUpToDate ? 'al día' : 'pendiente'
    switch (searchOption) {
      case 'name':
        return fullName.includes(searchTerm.toLowerCase())
      case 'id':
        return patientId.includes(searchTerm.toLowerCase())
      case 'payment':
        return paymentStatus.includes(searchTerm.toLowerCase())
      default:
        return fullName.includes(searchTerm.toLowerCase())
    }
  })

  //FUNCION PARA ORDENAR CLIENTES
  function compareClients(a, b) {
    const nameA = `${a.lastName} ${a.firstName}`
    const nameB = `${b.lastName} ${b.firstName}`

    if (orderOption === 'Apellido ↓') {
      return nameB.localeCompare(nameA)
    } else if (orderOption === 'Apellido ↑') {
      return nameA.localeCompare(nameB)
    } else if (orderOption === 'Nombre ↓') {
      return a.firstName.localeCompare(b.firstName)
    } else if (orderOption === 'Nombre ↑') {
      return b.firstName.localeCompare(a.firstName)
    } else {
      return nameA.localeCompare(nameB)
    }
  }
  const fetchClients = async () => {
    try {
      const response = await axios.get('/clients', {
        headers: {
          "access-token": store.token
        }
      })
      setClients(response.data)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <>
      <div className='text-center p-5'>
        <h1 className='mb-5 title clientTitle'><b>Listado de Clientes</b></h1>
        <div className='row d-md-flex'>
        <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
            <InputGroup>
              <InputGroup.Text id="btnGroupAddon">
                <BsSearch />
              </InputGroup.Text>
              <Form.Control
                maxLength={30}
                type="text"
                placeholder="Buscar paciente"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </InputGroup>
          </div>
          <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
            <Form.Group className='d-flex' controlId="searchOptionForm">
              <Form.Label className='w-50' column sm={2}><b className='homeText clientTitle'>Buscar por:</b></Form.Label>
              <Form.Select className='w-50' as="select" value={searchOption} onChange={handleSearchOptionChange}>
                <option value="name">Apellido/ nombre</option>
                <option value="id">ID</option>
                <option value="payment">Pagos</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className='col-12 col-xl-3 my-2 my-md-0'>
            <Form.Group className='d-flex' controlId="orderOptionForm">
              <Form.Label className='w-50' column sm={2}><b className='homeText clientTitle'>Ordenar por:</b></Form.Label>
              <Form.Select className='w-50' as="select" value={orderOption} onChange={handleOrderOptionChange}>
                <option value="Apellido ↑">Apellido ↑</option>
                <option value="Apellido ↓">Apellido ↓</option>
                <option value="Nombre ↑">Nombre ↑</option>
                <option value="Nombre ↓">Nombre ↓</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className='col-12 col-xl-2 my-2 my-md-0 ms-auto'>
            <Nav.Link className="buttonAddClient" onClick={() => setShowAddClientModal(true)}>Agregar Cliente</Nav.Link>
          </div>
        </div>

        <div className='table-container mt-4' >
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className='homeText text-center align-middle align-middle clientTitle'>ID</th>
                <th className='homeText text-center align-middle align-middle clientTitle'>Nombre</th>
                <th className='homeText text-center align-middle align-middle clientTitle'>Teléfono</th>
                <th className='homeText text-center align-middle align-middle clientTitle'>Dirección</th>
                <th className='homeText text-center align-middle align-middle clientTitle'>Categoría</th>
                <th className='homeText text-center align-middle align-middle clientTitle'>Estado de pago</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.slice().sort(compareClients).map((client) => (
                <tr key={client._id}>
                  <td className="text-center align-middle">{client._id}</td>
                  <td className="text-center align-middle">{client.lastName}, {client.firstName}</td>
                  <td className="text-center align-middle">{client.phone}</td>
                  <td className="text-center align-middle">{client.address}</td>
                  <td className="text-center align-middle">{client.category}</td>
                  <td className="text-center align-middle" style={{ color: client.isPaymentUpToDate ? 'green' : 'red' }}>
                    {client.isPaymentUpToDate ? 'Al día' : 'Pendiente'}
                  </td>
                  <td className="text-center align-middle">
                    <Button className='m-1 editButton' onClick={() => handleShowEditClientModal(client)} variant="secondary">
                      <span className="d-flex align-items-center justify-content-center">
                        <FaEdit />
                      </span>
                    </Button>
                    <Button className='m-1' onClick={() => handleShowDeleteClientModal(client)} variant="danger">
                      <span className="d-flex align-items-center justify-content-center">
                        <FaTrashAlt />
                      </span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      <AddClient show={showAddClientModal} onHide={handleCloseAddClientModal} fetchClients={fetchClients} />
      <DeleteClient show={showDeleteClientModal} onHide={handleCloseDeleteClientModal} fetchClients={fetchClients} selectedClient={selectedClient}/>
      <EditClient show={showEditClientModal} onHide={handleCloseEditClientModal} fetchClients={fetchClients} selectedClient={selectedClient}/>
    </>
  )
}
