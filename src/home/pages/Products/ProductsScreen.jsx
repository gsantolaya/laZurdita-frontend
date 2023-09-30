//IMPORTACIONES
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Toast from 'react-bootstrap/Toast';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import { TokenStorage } from "../../utils/TokenStorage";
import { useNavigate } from "react-router-dom";
import InputGroup from "react-bootstrap/InputGroup";
import { BsSearch } from "react-icons/bs";
import { useForm } from "react-hook-form";
import "./ProductsScreen.css";

//COMPONENTE
export const ProductsScreen = () => {

  //DECLARACION DE CONSTANTES
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [orderOption, setOrderOption] = useState('name');
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirmationToast, setShowConfirmationToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showEditProductConfirmationToast, setShowEditProductConfirmationToast] = useState(false);
  const [showEditProductErrorToast, setShowEditProductErrorToast] = useState(false);
  const [showConfirmationAddProductToast, setShowConfirmationAddProductToast] = useState(false);
  const [showErrorAddProductToast, setShowErrorAddProductToast] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const store = TokenStorage();
  const navigate = useNavigate();
  const { handleSubmit, register, reset, formState: { errors } } = useForm();
  const [selectedProductData, setSelectedProductData] = useState({
    type: '',
    description: '',
    value: 0,
    stock: 0,
  });

  useEffect(() => {
    if (store.tokenValid) {
      axios.get('/products', {
        headers: {
          "access-token": store.token
        }
      })
        .then((response) => {
          setProducts(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      navigate("/login");
    }
  }, [navigate, store.token, store.tokenValid]);


  //MANEJO PARA ELIMINAR PRODUCTO
  const handleShowDeletProductModal = (product) => {
    setSelectedProduct(product)
    setShowDeleteProductModal(true)
  };
  const handleCloseDeleteProductModal = () => {
    setSelectedProduct(null)
    setShowDeleteProductModal(false)
  };

  //MANEJO PARA AGREGAR PRODUCTO
  const handleShowAddProductModal = () => {
    setShowAddProductModal(true)
  }
  const handleCloseAddProductModal = () => {
    setShowAddProductModal(false)
    reset()
  }
  const handleEditProductConfirmationToastClose = () => {
    setShowEditProductConfirmationToast(false);
  }
  const handleEditProductErrorToastClose = () => {
    setShowEditProductErrorToast(false);
  }

  const handleConfirmationToastClose = () => {
    setShowConfirmationToast(false);
  }
  const handleErrorToastClose = () => {
    setShowErrorToast(false);
  };

  const handleConfirmationAddProductToastClose = () => {
    setShowConfirmationAddProductToast(false);
  };

  const handleErrorAddProductToastClose = () => {
    setShowErrorAddProductToast(false);
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleShowEditProductModal = (product) => {
    setSelectedProduct(product)
    setSelectedProductData({
      type: product.type,
      description: product.description,
      value: product.value,
      stock: product.stock,
    });
    setShowEditProductModal(true);
  }

  const handleCloseEditProductModal = () => {
    setShowEditProductModal(false)
  }
  const handleOrderOptionChange = (event) => {
    setOrderOption(event.target.value);
  };

  //FUNCION PARA FILTRAR PRODUCTOS
  const filteredProducts = products.filter((product) => {
    const productType = product.type.toLowerCase()
    return productType.includes(searchTerm.toLowerCase())
  })

  //FUNCION PARA ORDENAR LOS PRODUCTOS POR VARIEDAD O STOCK
  function compareProducts(a, b) {
    if (orderOption === 'Variedad ↓') {
      return a.type.localeCompare(b.type);
    } else if (orderOption === 'Variedad ↑') {
      return b.type.localeCompare(a.type);
    } else if (orderOption === 'Stock ↓') {
      return b.stock - a.stock;
    } else if (orderOption === 'Stock ↑') {
      return a.stock - b.stock;
    }
    return 0;
  }

  //FUNCION PARA AGREGAR UN PRODUCTO
  const handleAddProductFormSubmit = async (data) => {
    try {
      const response = await axios.post('/products', { ...data }, {
        headers: {
          "access-token": store.token
        }
      });
      if (response.status === 201) {
        handleCloseAddProductModal();
        setShowConfirmationAddProductToast(true)

        const updatedResponse = await axios.get('/products', {
          headers: {
            "access-token": store.token
          }
        });
        setProducts(updatedResponse.data)
      }
    } catch (error) {
      handleCloseAddProductModal()
      setShowErrorAddProductToast(true)
      console.error(error)
    }
  }

  //FUNCION PARA ELIMINAR UN PRODUCTO
  const deleteProduct = async (id) => {
    console.log(id)
    try {
      const response = await axios.delete(`/products/${id}`, {
        headers: {
          "access-token": store.token
        }
      });
      if (response.status === 200) {
        handleCloseDeleteProductModal()
        setShowConfirmationToast(true)
        const { data } = await axios.get('/products', {
          headers: {
            "access-token": store.token
          }
        });
        setProducts(data)
      }
    } catch (error) {
      handleCloseDeleteProductModal()
      setShowErrorToast(true)
      console.error(error)
    }
  };

  // FUNCION PARA MODIFICAR UN PRODUCTO
  const handleEditProductFormSubmit = async (formData) => {
    try {
      const updatedProduct = {
        type: formData.type,
        description: formData.description,
        value: formData.value,
        stock: formData.stock,
      };
      await axios.put(`/products/${selectedProduct._id}`, updatedProduct)
      setShowEditProductModal(false)
      const updatedResponse = await axios.get('/products', {
        headers: {
          "access-token": store.token
        }
      });
      setProducts(updatedResponse.data)
      setShowEditProductConfirmationToast(true)
    } catch (error) {
      console.error("Error al actualizar el producto:", error)
      setShowEditProductErrorToast(true)
    }
  }

  return (
    <>
      <div className='text-center p-5'>
        <h1 className='mb-5 title'><b>Listado de Productos</b></h1>
        <div className='row d-md-flex'>
          <div className='col-12 col-md-4 col-xl-3 my-2 my-md-0'>
            <InputGroup>
              <InputGroup.Text id="btnGroupAddon">
                <BsSearch />
              </InputGroup.Text>
              <Form.Control
                maxLength={30}
                type="text"
                placeholder="Buscar producto"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </InputGroup>
          </div>
          <div className='col-12 col-xl-3 my-2 my-md-0'>
            <Form.Group className='d-flex' controlId="orderOptionForm">
              <Form.Label className='w-50' column sm={2}><b className='homeText'>Ordenar por:</b></Form.Label>
              <Form.Select className='w-50' as="select" value={orderOption} onChange={handleOrderOptionChange}>
                <option value="Variedad ↓">Variedad ↓</option>
                <option value="Variedad ↑">Variedad ↑</option>
                <option value="Stock ↓">Stock ↓</option>
                <option value="Stock ↑">Stock ↑</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className='col-12 col-xl-2 my-2 my-md-0 ms-auto'>
            <Nav.Link className="buttonAddProduct" onClick={handleShowAddProductModal}>Agregar Producto</Nav.Link>
          </div>
        </div>

        <div className='table-container mt-4' >
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className='homeText text-center'>ID</th>
                <th className='homeText text-center'>Variedad</th>
                <th className='homeText text-center'>Descripción</th>
                <th className='homeText text-center'>Precio</th>
                <th className='homeText text-center'>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.slice().sort(compareProducts).map((product) => (
                <tr key={product._id}>
                  <td className="text-center">{product._id}</td>
                  <td className="text-center">{product.type}</td>
                  <td className="text-center">{product.description}</td>
                  <td className="text-center">{product.value}</td>
                  <td className="text-center">{product.stock}</td>
                  <td className="text-center">
                    <Button className='m-1' onClick={() => handleShowEditProductModal(product)} variant="secondary">
                      <span className="d-flex align-items-center justify-content-center">
                        <FaEdit />
                      </span>
                    </Button>
                    <Button className='m-1' onClick={() => handleShowDeletProductModal(product)} variant="danger">
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

      {/* MODAL PARA ELIMINAR UN PRODUCTO */}
      <Modal show={showDeleteProductModal} onHide={handleCloseDeleteProductModal}>
        <Modal.Header className='modalHeader' closeButton>
          <Modal.Title className='modalTitle'><strong>Confirmar Eliminación</strong></Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody py-4'>
          ¿Estás seguro de que deseas eliminar este producto?
        </Modal.Body>
        <Modal.Footer className='modalBody'>
          <Button variant="secondary" onClick={handleCloseDeleteProductModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => deleteProduct(selectedProduct?._id)}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL PARA AGREGAR UN PRODUCTO */}
      <Modal show={showAddProductModal} onHide={handleCloseAddProductModal}>
        <Modal.Header closeButton className='modalHeader'>
          <Modal.Title className="modalTitle">
            <strong>Agregar Nuevo Producto</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody'>
          <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleAddProductFormSubmit)}>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicType">
              <Form.Label>Variedad</Form.Label>
              <Form.Control type="text" maxLength={30} name="type" placeholder="Ingrese la variedad"
                {...register("type", { required: true })}
              />
              {errors?.type && (<span className="authSpan">Este campo es requerido</span>)}
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control type="text" maxLength={30} name="description" placeholder="Ingrese la descripción"
                {...register("description", { required: false })}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicValue">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" maxLength={20} name="value" placeholder="Ingrese el precio"
                {...register("value", { required: true })}
              />
              {errors?.value && (<span className="authSpan">Este campo es requerido</span>)}
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" maxLength={20} name="stock" placeholder="Ingrese el stock"
                {...register("stock", { required: true })}
              />
              {errors?.stock && (<span className="authSpan">Este campo es requerido</span>)}
            </Form.Group>
            <Modal.Footer className="mt-3 col-12">
              <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" type="submit">
                Agregar Producto
              </Button>
              <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" onClick={handleCloseAddProductModal}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL PARA MODIFICAR UN PRODUCTO */}
      <Modal show={showEditProductModal} onHide={handleCloseEditProductModal}>
        <Modal.Header className='modalHeader' closeButton>
          <Modal.Title className="modalTitle">
            <strong>Modificar información</strong>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='modalBody'>
          <Form className='d-flex flex-wrap justify-content-center' onSubmit={handleSubmit(handleEditProductFormSubmit)}>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicType">
              <Form.Label>Variedad</Form.Label>
              <Form.Control
                type="text"
                maxLength={30}
                name="type"
                placeholder="Ingrese la variedad"
                {...register("type", { required: true })}
                defaultValue={selectedProductData.type}
              />
              {errors?.type && (<span className="authSpan">Este campo es requerido</span>)}
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                maxLength={30}
                name="description"
                placeholder="Ingrese la descripción"
                {...register("description", { required: false })}
                defaultValue={selectedProductData.description}
              />
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicValue">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                maxLength={20}
                name="value"
                placeholder="Ingrese el precio"
                {...register("value", { required: true })}
                defaultValue={selectedProductData.value}
              />
              {errors?.value && (<span className="authSpan">Este campo es requerido</span>)}
            </Form.Group>
            <Form.Group className="formFields m-2 col-10 col-md-5" controlId="formBasicStock">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                maxLength={20}
                name="stock"
                placeholder="Ingrese el stock"
                {...register("stock", { required: true })}
                defaultValue={selectedProductData.stock}
              />
              {errors?.stock && (<span className="authSpan">Este campo es requerido</span>)}
            </Form.Group>
            <Modal.Footer className="mt-3 col-12">
              <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" type="submit">
                Guardar Cambios
              </Button>
              <Button className='buttonsFormAddProduct m-2 w-100' variant="secondary" onClick={handleCloseEditProductModal}>
                Cancelar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* SECCION DE TOASTS */}
      {/* TOAST ELIMINAR PRODUCTO */}
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

      {/* TOASTS MODIFICAR PRODUCTO */}
      <Toast show={showEditProductConfirmationToast} onClose={handleEditProductConfirmationToastClose} className="toastConfirmation" delay={5000} autohide>
        <Toast.Header className="toastConfirmationHeader">
          <strong className="me-auto">Actualización Exitosa</strong>
        </Toast.Header>
        <Toast.Body>Los cambios en el producto se han guardado correctamente.</Toast.Body>
      </Toast>
      <Toast show={showEditProductErrorToast} onClose={handleEditProductErrorToastClose} className="toastError" delay={5000} autohide>
        <Toast.Header className="toastErrorHeader">
          <strong className="me-auto">Error</strong>
        </Toast.Header>
        <Toast.Body>Hubo un error al guardar los cambios en el producto. Por favor, inténtalo nuevamente.</Toast.Body>
      </Toast>

      {/* TOASTS AGREGAR PRODUCTO */}
      <Toast show={showConfirmationAddProductToast} onClose={handleConfirmationAddProductToastClose} className="toastConfirmation" delay={5000} autohide>
        <Toast.Header className="toastConfirmationHeader">
          <strong className="me-auto">Registro Exitoso</strong>
        </Toast.Header>
        <Toast.Body>El nuevo producto ha sido agregado correctamente.</Toast.Body>
      </Toast>
      <Toast show={showErrorAddProductToast} onClose={handleErrorAddProductToastClose} className="toastError" delay={5000} autohide>
        <Toast.Header className="toastErrorHeader">
          <strong className="me-auto">Error</strong>
        </Toast.Header>
        <Toast.Body>Hubo un error al agregar el nuevo producto. Por favor, inténtalo nuevamente.</Toast.Body>
      </Toast>
    </>
  );
};
