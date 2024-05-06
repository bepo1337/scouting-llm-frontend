import { useState } from 'react'
import NavBar from './components/NavBar'
import Chat from './components/Chat'

function App() {

  return (
    <div className='flex flex-col gap-y-4 p-4 w-full'>
      <NavBar/>
      <div className='min-w-[80%] p-4 self-center md:min-w-[40%]'>
      <Chat ></Chat>
      </div>
    </div>
  )
}

export default App
