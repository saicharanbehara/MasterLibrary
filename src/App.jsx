import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Location from './components/Location/Location'
import Category from './components/Category/Category'
import AcquisitionType from './components/AcquisitionType/AcquisitionType'

const App = () => {
  return (
    <div>
      {/* <Navbar/> */}
      <Location/>
      <Category/>
      <AcquisitionType/>
    </div>
  )
}

export default App