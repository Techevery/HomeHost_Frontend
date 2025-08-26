import React from 'react'
import { Link } from 'react-router-dom';

const BecomeAgentModal = (props: any) => {
    const { handleCancel } = props;

  return (
    <div className='py-10'>
        <div className='flex justify-center'>
            
   <h3 className="text-[#000000] text-center text-[25px] max-w-[380px] font-[600] pb-2">
            Your request has been received
            </h3>
            </div>
            <div className='flex justify-center'>
            <Link to={'/'}
              // onClick={(e) => handleModal(e)}
              className="bg-[#000000] flex justify-center mt-10  text-white rounded-[5px] md:rounded-[10px] px-4 md:px-16 md:py-3 py-2"
            >
           Home
            </Link>
            </div>
    </div>
  )
}

export default BecomeAgentModal