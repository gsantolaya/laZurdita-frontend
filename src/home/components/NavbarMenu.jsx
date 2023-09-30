import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './NavbarMenu.css';
import { tokenIsValid } from '../../utils/TokenIsValid';
import { FaUserAlt } from "react-icons/fa";
// import NavDropdown from 'react-bootstrap/NavDropdown';
import { useNavigate } from 'react-router-dom';
// import logoNavbar from '../components/img/Picsart_23-08-25_21-47-45-119.png';


export function NavbarMenu() {
//   const currentPath = window.location.pathname;
  const decodedToken = tokenIsValid();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (decodedToken) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

//   const isActive = (path) => {
//     return currentPath === path ? 'navActive' : '';
//   };

  return (
    <Navbar className="navContainer p-1" variant="dark" expand="lg">
      <Container className='mx-4 ms-auto px-4'>
        <Navbar.Brand className='bigScreen d-flex' onClick={handleNavClick}>
          {/* <img src={logoNavbar} className="appLogoNavbar" alt="logo" /> */}
          <h4 className='ms-2 my-2'><i>La Zurdita</i></h4>
          </Navbar.Brand>
      </Container>
      <Container className='mx-4 ms-auto px-4'>
        <Navbar.Brand className='smallScreen' onClick={handleNavClick}><h1>La Zurdita</h1></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto containerNavLink">
            <Nav.Link id="inicioNavLink" className="navLinks" onClick={handleNavClick}>Inicio</Nav.Link>
            {/* <NavDropdown className="navDropdownLinksTitle smallScreen" id="nav-dropdown-dark-example" title="Inicio" menuVariant="dark">
              <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/administrativeStaff')}`} href="/home/administrativeStaff">Personal Administrativo</NavDropdown.Item>
              <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/students')}`} href="/home/students">Alumnos</NavDropdown.Item>
              <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/analytics')}`} href="/home/analytics">Analíticos</NavDropdown.Item>
              <NavDropdown.Item className={`navDropdownLinks ${isActive('/home/payments')}`} href="/home/payments">Pagos</NavDropdown.Item>
            </NavDropdown> */}
            {decodedToken ? (
              <>
                <Nav.Link className="userNameLink text-center" href="/home/users"><FaUserAlt /> {decodedToken.firstName} {decodedToken.lastName}</Nav.Link>
                <Nav.Link className="logOut ms-auto" href="/home">Cerrar Sesión</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link className="navLinks" href="/login">Login</Nav.Link>
                <Nav.Link className="navLinks" href="/register">Registro</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}