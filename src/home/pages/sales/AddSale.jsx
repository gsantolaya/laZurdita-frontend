import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { FaTrashAlt } from 'react-icons/fa';
import { Modal, Toast, Form, Button, } from 'react-bootstrap';
import { TokenStorage } from '../../../utils/TokenStorage';
import { tokenIsValid } from '../../../utils/TokenIsValid';
import './SalesScreen.css';


export const AddSale = ({ show, onHide, fetchSales }) => {

  const { handleSubmit, register, reset, formState: { errors }, setValue, watch } = useForm();
  const [showConfirmationAddSaleToast, setShowConfirmationAddSaleToast] = useState(false)
  const [showErrorAddSaleToast, setShowErrorAddSaleToast] = useState(false)
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const store = TokenStorage()
  const [additionalProductFields, setAdditionalProductFields] = useState([])
  const decodedToken = tokenIsValid()
  const userId = `${decodedToken.id}`
  const [currentDate, setCurrentDate] = useState('');
  const [subtotals, setSubtotals] = useState([]);
  const [total, setTotal] = useState(0);

  //MANEJO LA FECHA
  const getCurrentDateInArgentina = () => {
    const now = new Date();
    // Ajusta la fecha al huso horario de Argentina (GMT-3)
    now.setHours(now.getHours() - 3);
    // Formatea la fecha como "YYYY-MM-DD" para el input date
    const formattedDate = now.toISOString().split('T')[0];
    setCurrentDate(formattedDate);
  };


  // Effect to get current date
  useEffect(() => {
    getCurrentDateInArgentina();
  }, []);

  // Effect to calculate total
  useEffect(() => {
    const calculatedTotal = subtotals.reduce((accumulator, currentSubtotal) => {
      return accumulator + currentSubtotal;
    }, 0);
    setTotal(calculatedTotal);
  }, [subtotals]);

  // Effect to fetch clients and products
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
    }
  }, [store.tokenValid, store.token])

  const handleConfirmationAddSaleToastClose = () => {
    setShowConfirmationAddSaleToast(false)
  }
  const handleErrorAddSaleToastClose = () => {
    setShowErrorAddSaleToast(false)
  }
  const handleAddProductField = () => {
    setAdditionalProductFields([...additionalProductFields, { type: "unidad" }])
  }
  const handleRemoveProductField = (index) => {
    const updatedFields = [...additionalProductFields]
    updatedFields.splice(index, 1)
    setAdditionalProductFields(updatedFields)
  }

  //GUARDAR VENTA EN LA BASE DE DATOS
  const handleAddSaleFormSubmit = async (data) => {
    console.log(data)
    if (additionalProductFields.length === 0) {
      alert("Debes agregar al menos un producto.")
      return
    }
    try {
      // Initialize an array to store the promises for individual sales
      const salesPromises = []
      additionalProductFields.forEach((productField, index) => {
        const saleToCreate = {
          date: data.date,
          user: userId,
          client: data.client,
          type: data.type,
          product: data[`product${index}`],
          amount: data[`amount${index}`],
          amountDescription: data[`amountDescription${index}`],
          productStatus: data[`productStatus${index}`],
          unitPrice: data[`unitPrice${index}`],
        }
        console.log("Sale to create:", saleToCreate)
        // Push each promise to the array
        salesPromises.push(
          axios.post('/sales/', saleToCreate, {
            headers: {
              "access-token": store.token
            }
          })
        )
      })

      // Wait for all promises to resolve
      const responses = await Promise.all(salesPromises)

      // Check the responses for errors
      const isError = responses.some(response => response.status !== 201)

      if (isError) {
        // Handle errors as needed
        setShowErrorAddSaleToast(true)
      } else {
        setShowConfirmationAddSaleToast(true)
        reset()
        onHide()
        fetchSales()
      }
    } catch (error) {
      console.error(error)
      setShowErrorAddSaleToast(true)
    }
  }


  //MODIFICAR TIPO DE VENTA AL SELECCIONAR UN CLIENTE
  const handleClientChange = (event) => {
    const selectedClientId = event.target.value;
    const selectedClient = clients.find((client) => client._id === selectedClientId);

    if (selectedClient) {
      const statusSelect = document.getElementById("formBasicStatus");
      if (statusSelect) {
        statusSelect.value = selectedClient.category;
      }
      // Actualizamos el valor del campo "Tipo de venta" de forma síncrona
      setValue("type", selectedClient.category === 'mayorista' ? 'mayorista' : 'minorista');
    } else {
      // Manejar el caso donde selectedClient es undefined, por ejemplo, limpiar valores o mostrar un mensaje de error.
    }
  }

  const typeValue = watch("type");

  //MOSTRAR O NO DESCRIPCION DE CANTIDAD:

  //AGREGAR AUTOMATICAMENTE EL PRECIO

  return (
    <>
      {/* MODAL */}
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton className='modalHeader'>
          <Modal.Title className="modalTitle">
            <strong>Agregar Nueva Venta</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody'>
          <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddSaleFormSubmit)}>
            <div className='col-12 row my-2'>
              <h6>Fecha/ Cliente:</h6>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicDate">
                <Form.Label>Fecha:</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={currentDate} // Asigna la fecha actual de Argentina
                  onChange={(e) => setCurrentDate(e.target.value)} // Actualiza la fecha si el usuario la cambia
                  {...register("date", { required: true })}
                  max={currentDate} // Establece el valor máximo al valor actual
                />
              </Form.Group>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicClient" >
                <Form.Label>Cliente:</Form.Label>
                <Form.Select as="select" name="client" {...register("client", { required: true })} onChange={handleClientChange}>
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {`${client.firstName} ${client.lastName}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="formFields my-2 px-2 col-10 col-md-4" controlId="formBasicType">
                <Form.Label>Tipo de venta:</Form.Label>
                <Form.Select as="select" name="type"  {...register("type", { required: true })}>
                  <option value="">Seleccione una opción</option>
                  <option value="mayorista">Mayorista</option>
                  <option value="minorista">Minorista</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className='col-12 row my-2'>
              <h6>Productos:</h6>
              {additionalProductFields.map((_, index) => (
                <div key={index} className='col-12 row my-2 align-items-center justify-content-between'>
                  <Form.Group className="formFields my-2 px-2 col-3" controlId={`formBasicDescription${index}`}>
                    <Form.Label>Variedad:</Form.Label>
                    <Form.Select
                      as="select"
                      name={`product${index}`}
                      {...register(`product${index}`, { required: true })}
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {`${product.type}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-1" controlId="formBasicAmount">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      maxLength={5}
                      name={`amount${index}`}
                      placeholder="000"
                      {...register(`amount${index}`, {
                        required: true,
                        validate: (value) => parseFloat(value) >= 0,
                      })}
                      onChange={(e) => {
                        // Calcula el subtotal y actualiza el estado subtotals
                        const amount = parseFloat(e.target.value);
                        const unitPrice = parseFloat(watch(`unitPrice${index}`));
                        const subtotal = isNaN(amount) || isNaN(unitPrice) ? 0 : amount * unitPrice;

                        const updatedSubtotals = [...subtotals];
                        updatedSubtotals[index] = subtotal;
                        setSubtotals(updatedSubtotals);
                      }}
                    />
                    {errors[`amount${index}`]?.type === 'required' && (
                      <span className="authSpan">Este campo es requerido</span>
                    )}
                    {errors[`amount${index}`]?.type === 'validate' && (
                      <span className="authSpan">Debe ser un número positivo</span>
                    )}
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-3" controlId="formBasicAmountDescription">
                    <Form.Label>Descripción Cantidad:</Form.Label>
                    <Form.Select
                      as="select"
                      name={`amountDescription${index}`}
                      {...register(`amountDescription${index}`, {
                        required: true,
                        disabled: typeValue === 'mayorista', // Deshabilita si el tipo de venta es 'mayorista'
                      })}
                    >
                      <option value="docena">Docena</option>
                      <option value="unidad" disabled={typeValue === 'mayorista'}>Unidad</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-2" controlId="formBasicStatus">
                    <Form.Label>Descripción Adicional:</Form.Label>
                    <Form.Select as="select" name={`productStatus${index}`} {...register(`productStatus${index}`, { required: true })}>
                      <option value="">Seleccione una opción</option>
                      <option value="horneadas">Horneadas</option>
                      <option value="congeladas">Congeladas</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="formFields my-2 px-2 col-2" controlId="formBasicPayment">
                    <Form.Label>Precio unitario</Form.Label>
                    <Form.Control type="number" name={`unitPrice${index}`} placeholder="Precio por unidad"
                      {...register(`unitPrice${index}`, { required: true })}
                      onChange={(e) => {
                        // Calcula el subtotal y actualiza el estado subtotals
                        const unitPrice = parseFloat(e.target.value);
                        const amount = parseFloat(watch(`amount${index}`));
                        const subtotal = isNaN(amount) || isNaN(unitPrice) ? 0 : amount * unitPrice;

                        const updatedSubtotals = [...subtotals];
                        updatedSubtotals[index] = subtotal;
                        setSubtotals(updatedSubtotals);
                      }}
                    />
                    {errors?.unitPrice && (<span className="authSpan">Este campo es requerido</span>)}
                  </Form.Group>
                  <Button className='buttonsFormAddSale my-2 col-1' variant="danger" type="button" onClick={() => handleRemoveProductField(index)} style={{ width: '40px', height: '40px' }}>
                    <FaTrashAlt />
                  </Button>
                  <h6>Subtotal: ${subtotals[index]}</h6>
                </div>
              ))}

              <Button className='buttonsFormAddSale w-25' variant="secondary" type="button" onClick={handleAddProductField}>
                Agregar
              </Button>
            </div>
            <h4>Total: ${total}</h4>
            <Modal.Footer className="mt-3 col-12">
              <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" type="submit">
                Agregar Venta
              </Button>
              <Button className='buttonsFormAddSale m-2 w-100' variant="secondary" onClick={onHide}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* TOASTS*/}
      <Toast show={showConfirmationAddSaleToast} onClose={handleConfirmationAddSaleToastClose} className="toastConfirmation" delay={5000} autohide>
        <Toast.Header className="toastConfirmationHeader">
          <strong className="me-auto">Registro Exitoso</strong>
        </Toast.Header>
        <Toast.Body>Nueva venta registrada.</Toast.Body>
      </Toast>
      <Toast show={showErrorAddSaleToast} onClose={handleErrorAddSaleToastClose} className="toastError" delay={5000} autohide>
        <Toast.Header className="toastErrorHeader">
          <strong className="me-auto">Error</strong>
        </Toast.Header>
        <Toast.Body>Hubo un error al registrar la venta. Por favor, inténtalo nuevamente.</Toast.Body>
      </Toast>
    </>
  )
}
