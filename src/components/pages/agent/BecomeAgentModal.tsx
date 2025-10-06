import React from 'react'
import { Link } from 'react-router-dom';
import useAgentStore from '../../../stores/agentstore';

interface BecomeAgentModalProps {
  handleCancel: (e: React.MouseEvent) => void;
}

const BecomeAgentModal: React.FC<BecomeAgentModalProps> = (props) => {
    const { handleCancel } = props;
    const { agentInfo, isLoading } = useAgentStore();

    if (isLoading) {
        return (
            <div className='py-10 px-6'>
                <div className='flex justify-center'>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
                <div className='flex justify-center mt-4'>
                    <p className="text-gray-600 text-center">
                        Processing your application...
                    </p>
                </div>
            </div>
        );
    }

  return (
    <div className='py-10 px-6'>
        <div className='flex justify-center'>
            <h3 className="text-[#000000] text-center text-[25px] max-w-[380px] font-[600] pb-2">
            Your request has been received
            </h3>
        </div>
        <div className='flex justify-center mt-4'>
            <p className="text-gray-600 text-center">
            Welcome, {agentInfo?.name}! Your agent account is being processed.
            </p>
        </div>
        <div className='flex justify-center gap-4 mt-8'>
            <button
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 rounded-[5px] px-6 py-2 hover:bg-gray-400 transition-colors duration-200"
            >
              Close
            </button>
            <Link 
              to={'/agent-profile'}
              className="bg-[#000000] text-white rounded-[5px] px-6 py-2 hover:bg-gray-800 transition-colors duration-200"
            >
              View Profile
            </Link>
        </div>
    </div>
  )
}

export default BecomeAgentModal