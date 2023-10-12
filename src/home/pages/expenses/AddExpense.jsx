//IMPORTACIONES
import React, { useState, useEffect } from 'react';
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Form from 'react-bootstrap/Form'
import { TokenStorage } from "../../../utils/TokenStorage"
import { useForm } from "react-hook-form"
import "./ExpensesScreen.css"

export const AddExpense = ({ show, onHide, fetchExpenses }) => {

  const { handleSubmit, register, reset, formState: { errors } } = useForm();
  const [showConfirmationAddExpenseToast, setShowConfirmationAddExpenseToast] = useState(false);
  const [showErrorAddExpenseToast, setShowErrorAddExpenseToast] = useState(false);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const store = TokenStorage();

  const handleConfirmationAddExpenseToastClose = () => {
    setShowConfirmationAddExpenseToast(false)
  }
  const handleErrorAddExpenseToastClose = () => {
    setShowErrorAddExpenseToast(false)
  }

  const handleClientChange = (event) => {
    const selectedClientId = event.target.value;
    const selectedClient = clients.find(client => client._id === selectedClientId);

    // Determine the client category and set the "status" select value accordingly
    if (selectedClient) {
      const category = selectedClient.category;
      const statusSelect = document.getElementById("formBasicStatus");

      if (statusSelect) {
        // Update the "status" select value based on the client category
        statusSelect.value = category;
      }
    }
  };

  const handleProductChange = (event) => {
    const selectedProductId = event.target.value;
    const selectedProduct = products.find(product => product._id === selectedProductId);

    const typeSelect = document.getElementById("formBasicStatus");
    const unitPriceField = document.getElementById("formBasicPayment");

    if (selectedProduct && typeSelect && unitPriceField) {
      const selectedType = typeSelect.value;
      const price = selectedType === "mayorista" ? selectedProduct.wholeexpensePrice : selectedProduct.retailPrice;
      unitPriceField.value = price;
    }
  };

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
        });
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
        });
    }
  }, [store.tokenValid, store.token])

  //FUNCION PARA AGREGAR UN PRODUCTO
  const handleAddExpenseFormSubmit = async (data) => {
    console.log(data)
    try {
      const response = await axios.post('/expenses', { ...data }, {
        headers: {
          "access-token": store.token
        }
      })
      if (response.status === 201) {
        onHide()
        fetchExpenses()
        reset()
        setShowConfirmationAddExpenseToast(true)
      }
    } catch (error) {
      onHide()
      setShowErrorAddExpenseToast(true)
      console.error(error)
    }
  }

  return (
    <>
      {/* MODAL */}
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton className='modalHeader'>
          <Modal.Title className="modalTitle">
            <strong>Agregar Nuevo Gasto</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody'>
          <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddExpenseFormSubmit)}>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDate">
              <Form.Label>Fecha:</Form.Label>
              <Form.Control type="date" name="date"
                {...register("date", { required: true })} max={new Date().toISOString().split('T')[0]} />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicVoucherNumber">
              <Form.Label>Número de comprobante</Form.Label>
              <Form.Control type="number" name="voucherNumber" placeholder="Ingrese el número"
                {...register("voucherNumber", { required: true })}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicProvider">
              <Form.Label>Proveedor</Form.Label>
              <Form.Control type="text" name="provider" placeholder="Ingrese el proveedor"
                {...register("provider", { required: true })}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicAmount">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control type="number" name="amount" placeholder="Ingrese la cantidad"
                {...register("amount", { required: true })}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control type="text" name="description" placeholder="Ingrese la descripción"
                {...register("description", { required: true })}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicAdditionalDescription">
              <Form.Label>Descripción Adicional</Form.Label>
              <Form.Control type="text" name="additionalDescription" placeholder="Ingrese la descripción adicional"
                {...register("additionalDescription", { required: true })}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicUnitPrice">
              <Form.Label>Precio Unitario</Form.Label>
              <Form.Control type="number" name="unitPrice" placeholder="Ingrese el precio"
                {...register("unitPrice", { required: true })}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicWayToPay">
              <Form.Label>Forma de pago:</Form.Label>
              <Form.Select as="select" name="wayToPay" {...register("wayToPay", { required: true })}>
                <option value="">Seleccione una opción</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">MercadoPago</option>
                <option value="transferencia">Transferencia</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicPayment">
              <Form.Label>Pago</Form.Label>
              <Form.Control type="number" maxLength={10} name="payment" placeholder="Ingrese la cantidad"
                {...register("payment", { required: true })}
              />
              {errors?.payment && (<span className="authSpan">Este campo es requerido</span>)}
            </Form.Group>
            <Modal.Footer className="mt-3 col-12">
              <Button className='buttonsFormAddExpense m-2 w-100' variant="secondary" type="submit">
                Agregar Gasto
              </Button>
              <Button className='buttonsFormAddExpense m-2 w-100' variant="secondary" onClick={onHide}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* TOASTS*/}
      <ToastContainer className="p-3" style={{ position: 'fixed', zIndex: 1, bottom: '20px', right: '20px', }} >
        <Toast show={showConfirmationAddExpenseToast} onClose={handleConfirmationAddExpenseToastClose} className="toastConfirmation" delay={5000} autohide>
          <Toast.Header className="toastConfirmationHeader">
            <strong className="me-auto">Registro Exitoso</strong>
          </Toast.Header>
          <Toast.Body>Nuevo gasto registrado.</Toast.Body>
        </Toast>
        <Toast show={showErrorAddExpenseToast} onClose={handleErrorAddExpenseToastClose} className="toastError" delay={5000} autohide>
          <Toast.Header className="toastErrorHeader">
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>Hubo un error al registrar el gasto. Por favor, inténtalo nuevamente.</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}
