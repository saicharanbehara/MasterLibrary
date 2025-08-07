import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Location from './components/Location/Location'
import Category from './components/Category/Category'
import AcquisitionType from './components/AcquisitionType/AcquisitionType'
import Vendor from './components/Vendor/Vendor'
import Publisher from './components/Publisher/Publisher'
import Author from './components/Author/Author'

const App = () => {
  return (
    <div>
      <Navbar/>
      <Location/>
      <Category/> 
      <AcquisitionType/>
      <Vendor/> 
      <Publisher/>
      <Author/>
    </div>
  )
}

export default App