import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import ImageAnnotation from './components/image'
function App() {



  return (
    <div>
      Hello
      <div>
        <ImageAnnotation height={600} width={600}></ImageAnnotation>
      </div>
    </div>
  )
}

export default App
