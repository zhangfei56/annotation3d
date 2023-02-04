import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import ImageAnnotation from './components/image'
import Annotation3D from './components/Annotation3D'

function App() {


  return (
    <div>
      Hello
      <div>
        <Annotation3D height={600} width={600}></Annotation3D>
      </div>
    </div>
  )
}

export default App
