import React from 'react'
import Button from '../../UI/Button';

const BookingReceiptModal = (props:any) => {
    const { handleCancel,handleGetReceiptModal } = props;

  return (
    <div>
<div className='px-10 my-10'>
<h3 className='text-[#000000] text-[20px] pb-2'>Receipt</h3>
<div  className="border-b-[2px] border-b-[#002221] mb-4">
            <img src="/images/logo3.svg" alt="location" className="pb-4" />
          </div>

          <h4 className='text-[#016726] text-[18px] font-semibold ' >Successful paid NGN50,000</h4>

<div className='flex justify-between pt-4'>
<h4 className='text-[#000000] text-[18px] font-semibold ' >Mperial 2 Bedroom Apartment  </h4>
<h4 className='text-[#3F3F3F] text-[18px] ' >2 Nights</h4>

</div>

<div className='flex justify-between pt-4'>
<h4 className='text-[#000000] text-[18px] font-semibold ' >Start Date </h4>
<h4 className='text-[#3F3F3F] text-[18px] font-semibold' >End date</h4>

</div>

<div className='flex justify-between'>
<h4 className='text-[#8A8787] text-[18px] ' >23/08/2024</h4>
<h4 className='text-[#8A8787] text-[18px]' >24/08/2024</h4>

</div>



<div className='flex justify-between pt-4'>
<h4 className='text-[#000000] text-[18px] font-semibold ' >Date of Transaction </h4>
<h4 className='text-[#3F3F3F] text-[18px] font-semibold' >Time</h4>

</div>

<div className='flex justify-between'>
<h4 className='text-[#8A8787] text-[18px] ' >23/08/2024</h4>
<h4 className='text-[#8A8787] text-[18px]' >9:00pm</h4>

</div>

<div className='flex mt-7 justify-center'>
<Button
                    text={"Get Receipt"}
                    // disabled={loading}
                      action={handleGetReceiptModal}
                    type="submit"
                  />
</div>
</div>
    </div>
  )
}

export default BookingReceiptModal