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
import "./ExpensesScreen.css"
import { AddExpense } from './AddExpense'
import { DeleteExpense } from './DeleteExpense'
import { EditExpense } from './EditExpense'

//COMPONENTE
export const ExpensesScreen = () => {

  //DECLARACION DE CONSTANTES
  const [expenses, setExpenses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [orderOption, setOrderOption] = useState('name')
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const handleCloseAddExpenseModal = () => setShowAddExpenseModal(false)
  const [showDeleteExpenseModal, setShowDeleteExpenseModal] = useState(false)
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const store = TokenStorage()
  const navigate = useNavigate()


  useEffect(() => {
    if (store.tokenValid) {
      axios.get('/expenses', {
        headers: {
          "access-token": store.token
        }
      })
        .then((response) => {
          setExpenses(response.data)
        })
        .catch((error) => {
          console.error(error)
        })
    } else {
      navigate("/login")
    }
  }, [navigate, store.token, store.tokenValid])


  //MANEJO PARA ELIMINAR GASTO
  const handleShowDeletExpenseModal = (expense) => {
    setSelectedExpense(expense)
    setShowDeleteExpenseModal(true)
  }
  const handleCloseDeleteExpenseModal = () => {
    setSelectedExpense(null)
    setShowDeleteExpenseModal(false)
  }

  const handleShowEditExpenseModal = (expense) => {
    setSelectedExpense(expense)
    setShowEditExpenseModal(true)
  }

  const handleCloseEditExpenseModal = () => {
    setShowEditExpenseModal(false)
  }

  const handleOrderOptionChange = (event) => {
    setOrderOption(event.target.value)
  }
  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value)
  }

  //FUNCION PARA FILTRAR GASTOS
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = expense.date.toLowerCase()
    return expenseDate.includes(searchTerm.toLowerCase())
  })

  //FUNCION PARA ORDENAR LOS GASTOS POR..
  function compareExpenses(a, b) {
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

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/expenses', {
        headers: {
          "access-token": store.token
        }
      })
      setExpenses(response.data)
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
        <h1 className='mb-5 expenseTitle'><b>Listado de Gastos</b></h1>
        <div className='row d-md-flex'>
          <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
            <InputGroup>
              <InputGroup.Text id="btnGroupAddon">
                <BsSearch />
              </InputGroup.Text>
              <Form.Control
                maxLength={30}
                type="text"
                placeholder="Buscar gasto"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </InputGroup>
          </div>
          <div className='col-12 col-xl-3 my-2 my-md-0'>
            <Form.Group className='d-flex' controlId="orderOptionForm">
              <Form.Label className='w-50' column sm={2}><b className='homeText expenseTitle'>Ordenar por:</b></Form.Label>
              <Form.Select className='w-50' as="select" value={orderOption} onChange={handleOrderOptionChange}>
                <option value="Variedad ↓">Variedad ↓</option>
                <option value="Variedad ↑">Variedad ↑</option>
                <option value="Stock ↓">Stock ↓</option>
                <option value="Stock ↑">Stock ↑</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className='col-12 col-xl-2 my-2 my-md-0 ms-auto'>
            <Nav.Link className="buttonAddExpense" onClick={() => setShowAddExpenseModal(true)}>Agregar Gasto</Nav.Link>
          </div>
        </div>

        <div className='table-container mt-4' >
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className='homeText text-center align-middle expenseTitle'>ID</th>
                <th className='homeText text-center align-middle expenseTitle'>Fecha</th>
                <th className='homeText text-center align-middle expenseTitle'>Número de comprobante</th>
                <th className='homeText text-center align-middle expenseTitle'>Proveedor</th>
                <th className='homeText text-center align-middle expenseTitle'>Cantidad</th>
                <th className='homeText text-center align-middle expenseTitle'>Descripción</th>
                <th className='homeText text-center align-middle expenseTitle'>Descripción adicional</th>
                <th className='homeText text-center align-middle expenseTitle'>Precio unitario</th>
                <th className='homeText text-center align-middle expenseTitle'>Subtotal</th>
                <th className='homeText text-center align-middle expenseTitle'>Forma de pago</th>
                <th className='homeText text-center align-middle expenseTitle'>Pago a cuenta</th>
                <th className='homeText text-center align-middle expenseTitle'>Saldo</th>
                <th className='homeText text-center align-middle expenseTitle'>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.slice().sort(compareExpenses).map((expense) => {
                return (
                  <tr key={expense._id}>
                    <td className="text-center align-middle">{expense._id}</td>
                    <td className="text-center align-middle">{formatDate(expense.date)}</td>
                    <td className="text-center align-middle">{expense.voucherNumber}</td>
                    <td className="text-center align-middle">{expense.provider}</td>
                    <td className="text-center align-middle">{expense.amount}</td>
                    <td className="text-center align-middle">{expense.description}</td>
                    <td className="text-center align-middle">{expense.additionalDescription}</td>
                    <td className="text-center align-middle">{expense.unitPrice}</td>
                    <td className="text-center align-middle">{expense.unitPrice * expense.amount}</td>
                    <td className="text-center align-middle">{expense.wayToPay}</td>
                    <td className="text-center align-middle">{expense.payment}</td>
                    <td className="text-center align-middle">{expense.amount * expense.unitPrice - expense.payment}</td>
                    <td className={`text-center align-middle ${expense.amount * expense.unitPrice - expense.payment > 0 ? 'red-text' : (expense.amount * expense.unitPrice - expense.payment === 0 ? 'green-text' : 'blue-text')}`}>
                      {expense.amount * expense.unitPrice - expense.payment > 0 ? 'Saldo pendiente' : (expense.amount * expense.unitPrice - expense.payment === 0 ? 'Saldado' : 'Saldo a favor')}
                    </td>
                    <td className="text-center align-middle">
                      <Button className='m-1 editButton' onClick={() => handleShowEditExpenseModal(expense)} variant="secondary">
                        <span className="d-flex align-items-center justify-content-center">
                          <FaEdit />
                        </span>
                      </Button>
                      <Button className='m-1' onClick={() => handleShowDeletExpenseModal(expense)} variant="danger">
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
      <AddExpense show={showAddExpenseModal} onHide={handleCloseAddExpenseModal} fetchExpenses={fetchExpenses} />
      <DeleteExpense show={showDeleteExpenseModal} onHide={handleCloseDeleteExpenseModal} fetchExpenses={fetchExpenses} selectedExpense={selectedExpense} />
      <EditExpense show={showEditExpenseModal} onHide={handleCloseEditExpenseModal} fetchExpenses={fetchExpenses} selectedExpense={selectedExpense} />
    </>
  )
}
