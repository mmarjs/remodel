import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../common/header'
import Footer from '../common/footer'
import { ImageContext } from '../../context/imageContext'

function Layout() {
  const [imageData]  = useContext(ImageContext)
  return (
    <>
      {imageData?.originalImage ? <></> : <Header />}
      <Outlet />
      {imageData?.originalImage ? <></> : <Footer />}
     
    </>
  );
}

export default Layout