import React, { useState } from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import { TokenStorage } from "../../../utils/TokenStorage"
import "./ProductsScreen.css"


export const DeleteProduct = ({ show, onHide, fetchProducts, selectedProduct }) => {


    const [showConfirmationToast, setShowConfirmationToast] = useState(false)
    const [showErrorToast, setShowErrorToast] = useState(false)
    const store = TokenStorage()



    const handleConfirmationToastClose = () => {
        setShowConfirmationToast(false)
    }
    const handleErrorToastClose = () => {
        setShowErrorToast(false)
    }



    //FUNCION PARA ELIMINAR UN PRODUCTO
    const deleteProduct = async (id) => {
        try {
            const response = await axios.delete(`/products/${id}`, {
                headers: {
                    "access-token": store.token
                }
            })
            if (response.status === 200) {
                onHide()
                setShowConfirmationToast(true)
                fetchProducts()
            }
        } catch (error) {
            onHide()
            setShowErrorToast(true)
            console.error(error)
        }
    }

    return (
        <>
            {/* MODAL */}
            <Modal show={show} onHide={onHide}>
                <Modal.Header className='modalHeader' closeButton>
                    <Modal.Title className='modalTitle'><strong>Confirmar Eliminación</strong></Modal.Title>
                </Modal.Header>
                <Modal.Body className='modalBody py-4'>
                    ¿Estás seguro de que deseas eliminar este producto?
                </Modal.Body>
                <Modal.Footer className='modalBody'>
                    <Button variant="secondary" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => deleteProduct(selectedProduct?._id)}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* TOAST */}
            <Toast show={showConfirmationToast} onClose={handleConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
                <Toast.Header className="toastConfirmationHeader">
                    <strong className="me-auto">Eliminación Exitosa</strong>
                </Toast.Header>
                <Toast.Body>El producto ha sido eliminado correctamente.</Toast.Body>
            </Toast>
            <Toast show={showErrorToast} onClose={handleErrorToastClose} className="toastError" delay={5000} autohide>
                <Toast.Header className="toastErrorHeader">
                    <strong className="me-auto">Error</strong>
                </Toast.Header>
                <Toast.Body>Hubo un error al eliminar el producto. Por favor, inténtalo nuevamente.</Toast.Body>
            </Toast>

        </>
    )
}
