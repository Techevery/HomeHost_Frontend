import React, { useState } from 'react'
import AdminSidebar from '../../../Sidebar/AdminSidebar'
import Agent from './AgentPages/Agent';
import VerifyAgent from './verifyAgentPages/VerifyAgent';
import BanAgent from './BanAgentPages/BanAgent';

const AgentHome = () => {
  
  const initialPayoutState = {
    agentElement: true,
    verifyAgentElement: false,
    banAgentElement: false,
  };

  const [agentValues, setAgentValues] = useState({
    ...initialPayoutState,
  });

  const handleAgentState = (e: any) => {
    e.preventDefault();
    setAgentValues({
      agentElement: true,
      verifyAgentElement: false,
      banAgentElement: false,
    });
  };

  const handleVerifyAgentState = (e: any) => {
    e.preventDefault();
    setAgentValues({
      agentElement: false,
      verifyAgentElement: true,
      banAgentElement: false,
    });
  };

  const handleBanAgentState = (e: any) => {
    e.preventDefault();
    setAgentValues({
      agentElement: false,
      verifyAgentElement: false,
      banAgentElement: true,
    });
  };

  const showProfileConnector = () => {
    return (
      <>
        {/* show agent */}
        {agentValues.agentElement && (
          <>
            <div className="">
              <Agent />
            </div>
          </>
        )}

        {/* show verify agent */}
        {agentValues.verifyAgentElement && (
          <>
            <div className="">
              <VerifyAgent />
            </div>
          </>
        )}

{agentValues.banAgentElement && (
          <>
            <div className="">
              <BanAgent />
            </div>
          </>
        )}

   
      </>
    );
  };


  return (
    <div className=''>

<ol className="list-none flex gap-5 md:gap-9 mb-5 border-b-[1px] border-[#D4CECE]">
          <li
            className={`${
              agentValues.agentElement
                ? "border-[#4977E7] border-b-[3px]"
                : "border-b-[0]"
            } px-2.5 sm:px-5 lg:px-10 py-2 inline-block text-[20px] font-semibold hover:border-[#3659af] cursor-pointer`}
            onClick={(e: any) => handleAgentState(e)}
          >
         Agent
          </li>

          <li
            className={`${
              agentValues.verifyAgentElement
                ? "border-[#4977E7] border-b-[3px]"
                : "border-b-[0]"
            } px-2.5 sm:px-5 lg:px-10 py-2 inline-block text-[20px] font-semibold hover:border-[#3659af] cursor-pointer`}
            onClick={(e: any) => handleVerifyAgentState(e)}
          >
           Verify Agent
          </li>

          <li
            className={`${
              agentValues.banAgentElement
                ? "border-[#4977E7] border-b-[3px]"
                : "border-b-[0]"
            } px-2.5 sm:px-5 lg:px-10 py-2 inline-block text-[20px] font-semibold hover:border-[#3659af] cursor-pointer`}
            onClick={(e: any) => handleBanAgentState(e)}
          >
           Ban Agent
          </li>


      
        </ol>

        <div>{showProfileConnector()}</div>
    </div>
  )
}

export default AgentHome