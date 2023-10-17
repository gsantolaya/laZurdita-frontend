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
import { BsSearch, BsPrinterFill } from "react-icons/bs"
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

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  //Funcion para convertir fecha a la zona horaria local
  function formatDate(dateString) {
    const utcDate = new Date(dateString);
    const year = utcDate.getUTCFullYear();
    const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = utcDate.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTableDate(inputDate) {
    const parts = inputDate.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    } else {
      return inputDate; // Devuelve la fecha original si no está en el formato esperado
    }
  }

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
    const saleDate = sale.date.toLowerCase();
    const saleStatus = sale.status === 'completed';

    // Comprueba si la fecha está dentro del rango seleccionado
    const isWithinDateRange = (!startDate || saleDate >= startDate) && (!endDate || saleDate <= endDate);

    return isWithinDateRange && saleStatus;
  });


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



  //CALCULANDO TOTALES:
  // Función para calcular la cantidad de ventas por tipo de pago
  function calculateCountByWayToPay(wayToPay) {
    const count = filteredSales.filter(sale => sale.wayToPay === wayToPay).length;
    return count === 0 ? 0 : count;
  }
  // Función para calcular la suma de los valores de sale.payment por tipo de pago
  function calculateSubtotalByWayToPay(wayToPay) {
    const subtotal = filteredSales
      .filter(sale => sale.wayToPay === wayToPay)
      .reduce((total, sale) => total + sale.payment, 0);
    return subtotal === 0 ? 0 : subtotal;
  }
  // Función para calcular el total de todos los valores sale.payment
  function calculateSubtotal() {
    return filteredSales.reduce((total, sale) => total + sale.payment, 0);
  }

  // Función para calcular la suma total de propinas
  function calculateTotalTips() {
    const totalTips = filteredSales.reduce((total, sale) => total + (sale.tip || 0), 0);
    return totalTips;
  }


  //FILTRAR POR FECHAS 
  useEffect(() => {
    // Obtén la fecha actual
    const currentDate = new Date();

    // Establece startDate como el día 15 del mes anterior
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15);
    const currentDay = currentDate.getDate();

    // Verifica si el día actual es igual o posterior al 15 del mes actual
    if (currentDay >= 15) {
      startDate.setMonth(currentDate.getMonth());
    }

    // Establece endDate como el día 14 del mes en curso o del mes siguiente
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 14);

    // Verifica si el día actual es igual o posterior al 14 del mes actual
    if (currentDay >= 14) {
      endDate.setMonth(currentDate.getMonth() + 1);
    }

    // Formatea las fechas en formato ISO (yyyy-MM-dd) para establecerlas en los campos de entrada
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
  }, []);

  //FUNCION PARA IMPRIMIR LA TABLA
  const handlePrintTable = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write('<html><head><title>Tabla de Ventas</title></head><body>')
    printWindow.document.write('<h1>Ventas</h1>')
    printWindow.document.write('<table border="1">')
    printWindow.document.write('<thead><tr>')
    printWindow.document.write('<th>Fecha</th>')
    printWindow.document.write('<th>Vendedor</th>')
    printWindow.document.write('<th>Cliente</th>')
    printWindow.document.write('<th>Cantidad</th>')
    printWindow.document.write('<th>Descripción</th>')
    printWindow.document.write('<th>Estado</th>')
    printWindow.document.write('<th>Precio Unitario</th>')
    printWindow.document.write('<th>Total</th>')
    printWindow.document.write('<th>Forma de pago</th>')
    printWindow.document.write('<th>Pago a cuenta</th>')
    printWindow.document.write('<th>Saldo</th>')
    printWindow.document.write('<th>Propina</th>')
    printWindow.document.write('</tr></thead><tbody>')

    // Agrega los datos de los productos a la tabla de la ventana de impresión
    filteredSales.slice().sort(compareSales).forEach((sale) => {
      const product = products.find((product) => product._id === sale.product);
      const client = clients.find((client) => client._id === sale.client);
      const user = users.find((user) => user._id === sale.user);

      printWindow.document.write('<tr>')
      printWindow.document.write(`<td>${formatTableDate(formatDate(sale.date))}</td>`)
      printWindow.document.write(`<td>${user ? `${user.lastName}, ${user.firstName}` : ''}</td>`)
      printWindow.document.write(`<td>${client ? `${client.lastName}, ${client.firstName}` : ''}</td>`)
      printWindow.document.write(`<td>${sale.amount}</td>`)
      printWindow.document.write(`<td>${product ? `${product.type}` : ''}</td>`)
      printWindow.document.write(`<td>${sale.productStatus}</td>`)
      printWindow.document.write(`<td>${sale.unitPrice}</td>`)
      printWindow.document.write(`<td>${sale.unitPrice * sale.amount}</td>`)
      printWindow.document.write(`<td>${sale.wayToPay}</td>`)
      printWindow.document.write(`<td>${sale.payment}</td>`)
      printWindow.document.write(`<td>${sale.amount * sale.unitPrice - sale.payment}</td>`)
      printWindow.document.write(`<td>${sale.tip || 0}</td>`)
      printWindow.document.write('</tr>')
    })

    printWindow.document.write('</tbody></table>')
    printWindow.document.write('</body></html>')

    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

//FUNCION PARA IMPRIMIR EL ARQUEO
const handlePrintArqueo = () => {
  const printWindow = window.open('', '', 'width=800,height=600')
  printWindow.document.write('<html><head><title>Tabla de Ventas</title></head><body>')
  printWindow.document.write('<h1>Ventas</h1>')
  printWindow.document.write('<table border="1">')
  printWindow.document.write('<thead><tr>')
  printWindow.document.write('<th>Fecha</th>')
  printWindow.document.write('<th>Vendedor</th>')
  printWindow.document.write('<th>Cliente</th>')
  printWindow.document.write('<th>Cantidad</th>')
  printWindow.document.write('<th>Descripción</th>')
  printWindow.document.write('<th>Estado</th>')
  printWindow.document.write('<th>Precio Unitario</th>')
  printWindow.document.write('<th>Total</th>')
  printWindow.document.write('<th>Forma de pago</th>')
  printWindow.document.write('<th>Pago a cuenta</th>')
  printWindow.document.write('<th>Saldo</th>')
  printWindow.document.write('<th>Propina</th>')
  printWindow.document.write('</tr></thead><tbody>')

  // Agrega los datos de los productos a la tabla de la ventana de impresión
  filteredSales.slice().sort(compareSales).forEach((sale) => {
    const product = products.find((product) => product._id === sale.product);
    const client = clients.find((client) => client._id === sale.client);
    const user = users.find((user) => user._id === sale.user);

    printWindow.document.write('<tr>')
    printWindow.document.write(`<td>${formatTableDate(formatDate(sale.date))}</td>`)
    printWindow.document.write(`<td>${user ? `${user.lastName}, ${user.firstName}` : ''}</td>`)
    printWindow.document.write(`<td>${client ? `${client.lastName}, ${client.firstName}` : ''}</td>`)
    printWindow.document.write(`<td>${sale.amount}</td>`)
    printWindow.document.write(`<td>${product ? `${product.type}` : ''}</td>`)
    printWindow.document.write(`<td>${sale.productStatus}</td>`)
    printWindow.document.write(`<td>${sale.unitPrice}</td>`)
    printWindow.document.write(`<td>${sale.unitPrice * sale.amount}</td>`)
    printWindow.document.write(`<td>${sale.wayToPay}</td>`)
    printWindow.document.write(`<td>${sale.payment}</td>`)
    printWindow.document.write(`<td>${sale.amount * sale.unitPrice - sale.payment}</td>`)
    printWindow.document.write(`<td>${sale.tip || 0}</td>`)
    printWindow.document.write('</tr>')
  })

  printWindow.document.write('</tbody></table>')
  printWindow.document.write('</body></html>')

  printWindow.document.close()
  printWindow.print()
  printWindow.close()
}
  return (
    <>
      <div className='text-center p-5'>
        <h1 className='mb-5 saleTitle'><b>Ventas Realizadas</b></h1>
        <div className='row d-md-flex'>
          <div className='col-2 my-2 my-md-0'>
            <InputGroup>
              <Form.Control
                type="date"
                placeholder="Fecha de inicio"
                value={startDate}
                onChange={(e) => {
                  console.log('startDate:', e.target.value);
                  setStartDate(formatDate(e.target.value));
                }}
              />
            </InputGroup>
          </div>
          <div className='col-2 my-2 my-md-0'>
            <InputGroup>
              <Form.Control
                type="date"
                placeholder="Fecha de finalización"
                value={endDate}
                onChange={(e) => {
                  console.log('endDate:', e.target.value);
                  setEndDate(formatDate(e.target.value));
                }} />
            </InputGroup>
          </div>
          <div className='col-3 my-2 my-md-0'>
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
          <div className='col-3 my-md-0'>
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
                <th className='homeText text-center align-middle saleTitle'>Propina</th>
                <th>
                  <Button className='m-1' variant="secondary" onClick={handlePrintTable}>
                    <span className="d-flex align-items-center justify-content-center">
                      <BsPrinterFill />
                    </span>
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.slice().sort(compareSales).map((sale) => {
                const product = products.find((product) => product._id === sale.product);
                const client = clients.find((client) => client._id === sale.client);
                const user = users.find((user) => user._id === sale.user);
                return (
                  <tr key={sale._id}>
                    <td className="text-center align-middle">{formatTableDate(formatDate(sale.date))}</td>
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
                    <td className="text-center align-middle">${sale.unitPrice}</td>
                    <td className="text-center align-middle">${sale.unitPrice * sale.amount}</td>
                    <td className="text-center align-middle">{sale.wayToPay}</td>
                    <td className="text-center align-middle">${sale.payment}</td>
                    <td className="text-center align-middle">
                      ${sale.payment ? sale.amount * sale.unitPrice - sale.payment : null}
                    </td>
                    <td className={`text-center align-middle ${sale.amount * sale.unitPrice - sale.payment > 0 ? 'red-text' : (sale.amount * sale.unitPrice - sale.payment === 0 ? 'green-text' : 'blue-text')}`}>
                      {sale.amount * sale.unitPrice - sale.payment > 0 ? 'Saldo pendiente' : (sale.amount * sale.unitPrice - sale.payment === 0 ? 'Saldado' : 'Saldo a favor')}
                    </td>
                    <td className="text-center align-middle">${sale.tip || 0}</td>
                    <td className="text-center align-middle">
                      <Button className='m-1 editButton' onClick={() => handleShowEditSaleModal(sale)} variant="">
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
        <AddSale show={showAddSaleModal} onHide={handleCloseAddSaleModal} fetchSales={fetchSales} />
        <DeleteSale show={showDeleteSaleModal} onHide={handleCloseDeleteSaleModal} fetchSales={fetchSales} selectedSale={selectedSale} />
        <EditSale show={showEditSaleModal} onHide={handleCloseEditSaleModal} fetchSales={fetchSales} selectedSale={selectedSale} />
        <div className='d-flex justify-content-between mt-5'>
          <h1 className='mx-5 productTitle'><b>Arqueo</b></h1>
          <Button className='m-1' variant="secondary" onClick={handlePrintArqueo}>Imprimir Arqueo  <BsPrinterFill /></Button>
        </div>
        <div className='table-container mt-4'>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className='homeText text-center align-middle saleTitle'></th>
                <th className='homeText text-center align-middle saleTitle'>Cantidad</th>
                <th className='homeText text-center align-middle saleTitle'>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Efectivo</td>
                <td>{calculateCountByWayToPay("efectivo")}</td>
                <td>${calculateSubtotalByWayToPay("efectivo")}</td>
              </tr>
              <tr>
                <td>Mercado Pago</td>
                <td>{calculateCountByWayToPay("mercadoPago")}</td>
                <td>${calculateSubtotalByWayToPay("mercadoPago")}</td>
              </tr>
              <tr>
                <td>Transferencias</td>
                <td>{calculateCountByWayToPay("transferencia")}</td>
                <td>${calculateSubtotalByWayToPay("transferencia")}</td>
              </tr>
              <tr>
                <td colSpan={2}><b>SUBTOTAL</b></td>
                <td><b>${calculateSubtotal()}</b></td>
              </tr>
              <tr>
                <td>Propinas</td>
                <td>{filteredSales.filter(sale => sale.tip !== null && sale.tip !== 0).length || 0}</td>
                <td>${calculateTotalTips()}</td>
              </tr>
              <tr>
                <td colSpan={2}><b>TOTAL</b></td>
                <td><b>${calculateSubtotal() + calculateTotalTips()}</b></td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </>
  )
}
