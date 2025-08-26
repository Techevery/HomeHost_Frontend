import React from "react";
import { Link, NavLink } from "react-router-dom";
import { BsPersonVcard } from "react-icons/bs";
import { MdPayment, MdSecurity } from "react-icons/md";
import { GoCreditCard } from "react-icons/go";
 
const Profile = () => {
  return (
    <div>
      <div className="max-w-screen-xl px-3 lg:px-10  mx-auto lg:gap-8 xl:gap-12 ">
        <div className=" pt-[40px]">
          <div className="flex  gap-4 items-center">
            <Link
              to="/view-properties"
              // className="text-primary text-lg  font-bold  hover:underline"
            >
              <img
                src="/images/Frame 67.svg"
                alt=""
                className="w-[35px] h-[35px] "
              />
            </Link>

            <h4 className="text-[#002221] text-[20px]">Profile Details</h4>
          </div>
          <h4 className="text-[#000000] pt-[40px] text-[25px] md:text-[30px]">
            Ali Ademola, aliademola@homelyhost.com
          </h4>
          <div className="md:grid md:grid-cols-12 items-center">
            <div className="col-span-8">
              <div className="  md:grid md:grid-cols-2 mt-10 md:gap-10 gap-6">
                <NavLink to="/edit-modal">
                  <div className="p-4 shadow-xl border rounded-[10px]">
                    <div className="flex items-center gap-2">
                      <BsPersonVcard className="w-10 h-10" />
                      <h5 className="text-[#000000] font-[500] text-[20px]">
                        Personal Info
                      </h5>
                    </div>
                    <h5 className="text-[#000000] text-[15px] max-w-[300px]">
                      Provide Personal details and how we can reach you
                    </h5>
                  </div>
                </NavLink>

                <NavLink to="/security">
                <div className="p-4 shadow-xl border rounded-[10px]">
                  <div className="flex items-center gap-2">
                    <MdSecurity className="w-10 h-10" />
                    <h5 className="text-[#000000] font-[500] text-[20px]">
                      Login & Security
                    </h5>
                  </div>
                  <h5 className="text-[#000000] text-[15px] max-w-[300px]">
                    Update your password and Secure your Account{" "}
                  </h5>
                </div>
</NavLink>
<NavLink to="/earnings">

                <div className="p-4 shadow-xl border rounded-[10px]">
                  <div className="flex items-center gap-2">
                    <GoCreditCard className="w-10 h-10" />
                    <h5 className="text-[#000000] font-[500] text-[20px]">
                      Earnings
                    </h5>
                  </div>
                  <h5 className="text-[#000000] text-[15px] max-w-[300px]">
                    Provide Personal details and how we can reach you
                  </h5>
                </div>
</NavLink>

                <div className="p-4 shadow-xl border rounded-[10px]">
                  <div className="flex items-center gap-2">
                    <MdPayment className="w-10 h-10" />
                    <h5 className="text-[#000000] font-[500] text-[20px]">
                      Payout Method
                    </h5>
                  </div>
                  <h5 className="text-[#000000] text-[15px] max-w-[300px]">
                    Provide Personal Bank details
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
