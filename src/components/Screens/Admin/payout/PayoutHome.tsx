import React, { useState } from 'react'
import AdminSidebar from '../../../Sidebar/AdminSidebar'
import Payout from './PayoutPages/Payout';
import PayoutRequest from './PayoutPages/PayoutRequest';

const PayoutHome = () => {

    const initialPayoutState = {
    payoutElement: true,
    payoutRequestElement: false,
  };

  const [payoutValues, setPayoutValues] = useState({
    ...initialPayoutState,
  });

  const handlePayoutState = (e: any) => {
    e.preventDefault();
    setPayoutValues({
      payoutElement: true,
      payoutRequestElement: false
    });
  };

  const handlePayoutRequestState = (e: any) => {
    e.preventDefault();
    setPayoutValues({
      payoutElement: false,
      payoutRequestElement: true
    });
  };

  const showProfileConnector = () => {
    return (
      <>
        {/* show payout */}
        {payoutValues.payoutElement && (
          <>
            <div className="">
              <Payout />
            </div>
          </>
        )}

        {/* show payout request */}
        {payoutValues.payoutRequestElement && (
          <>
            <div className="">
              <PayoutRequest />
            </div>
          </>
        )}

   
      </>
    );
  };

  return (
    <div className=''>
    <div>
        {/* <PageTitle title="User Management Overview" /> */}

        <ol className="list-none flex gap-5 md:gap-9 mb-5 border-b-[1px] border-[#D4CECE]">
          <li
            className={`${
              payoutValues.payoutElement
                ? "border-[#4977E7] border-b-[3px]"
                : "border-b-[0]"
            } px-2.5 sm:px-5 lg:px-10 py-2 inline-block text-[20px] font-semibold hover:border-[#3659af] cursor-pointer`}
            onClick={(e: any) => handlePayoutState(e)}
          >
           Payout
          </li>

          <li
            className={`${
              payoutValues.payoutRequestElement
                ? "border-[#4977E7] border-b-[3px]"
                : "border-b-[0]"
            } px-2.5 sm:px-5 lg:px-10 py-2 inline-block text-[20px] font-semibold hover:border-[#3659af] cursor-pointer`}
            onClick={(e: any) => handlePayoutRequestState(e)}
          >
            Payout Request
          </li>

          {/* <li
            className={`${
              payoutValues.accessControlElement
                ? "border-primary border-b-[2px]"
                : "border-b-[0]"
            } px-2.5 sm:px-5 lg:px-10 py-2 inline-block  hover:border-primary cursor-pointer`}
            onClick={(e: any) => handleAccessControlState(e)}
          >
            Access Control Settings
          </li> */}

      
        </ol>

        <div>{showProfileConnector()}</div>
      </div>
    </div>
  )
}

export default PayoutHome