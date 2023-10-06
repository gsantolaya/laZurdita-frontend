import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import "./Footer.css";
import {
  BsEnvelope,
  BsPinMap,
  BsFacebook,
  BsInstagram,
  BsWhatsapp,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import logoNavbar from '../components/img/Imagen_de_WhatsApp_2023-10-02_a_las_15.55.47_72f6c6c6-removebg-preview.png';

export function Footer() {
  return (
    <div className="d-flex footerContainer px-4 px-md-5">
      <div id='contactContainer' className="col-12 col-md-6 col-lg-4 my-2 ">
        <h4 className='text-center text-md-start'><b>Contáctanos:</b></h4>
        <ListGroup.Item className='iconFooter d-md-flex'><BsEnvelope /><p className='textContactFooter mx-2 my-0'><b>Teléfono:</b> 3815932845</p></ListGroup.Item>
        <ListGroup.Item className='iconFooter d-md-flex'><BsPinMap /><p className='textContactFooter mx-2 my-0'><b>Dirección:</b> aaaaa 000</p></ListGroup.Item>
        <ListGroup.Item className='d-md-flex'><p className='textContactFooter my-0'>San Miguel de Tucumán, Argentina</p></ListGroup.Item>
      </div>
      <div id='logoContainer' className="col-12 col-md-6 col-lg-4 d-flex row align-items-center justify-content-center">
      <img src={logoNavbar} className="appLogoFooter m-1" alt="logo" />
      <span><i>Todos los derechos reservados &copy; 2023 La Zurdita</i></span>
      </div>
      <div id='socialMediaContainer' className="col-12 col-md-6 col-lg-4 d-flex align-items-center justify-content-end ">
        <Link to={"/error404"} className='socialMedia m-2 '><BsFacebook size={40} /></Link>
        <Link to={"/error404"} className='socialMedia m-2'><BsInstagram size={40} /></Link>
        <Link to={"/error404"} className='socialMedia m-2'><BsWhatsapp size={40} /></Link>
      </div>
    </div >
  )
}