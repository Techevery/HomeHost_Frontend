import React from "react";
import { HiChevronRight } from "react-icons/hi2";
import { Link, NavLink } from "react-router-dom";

const EarningsReport = () => {
  return (
    <div>
      <div className="max-w-screen-xl px-3 lg:px-10  mx-auto lg:gap-8 xl:gap-12">
        <div className="md:px-[50px]  pt-[40px]">
          <div className="flex  gap-4 items-center">
            <Link
              to="/earnings"
              // className="text-primary text-lg  font-bold  hover:underline"
            >
              <img
                src="/images/Frame 67.svg"
                alt=""
                className="w-[35px] h-[35px] "
              />
            </Link>

            <h4 className="text-[#002221] font-[600] text-[20px]">Earnings</h4>
          </div>
          <div className="pt-[10px] gap-6 flex flex-col">
            <h4 className="text-[#000000] pt-8 text-[18px]">
              View the year of your Earnings reports
            </h4>

            <div className="grid md:grid-cols-3 grid-cols-2 gap-7">
              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">January</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">February</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">March</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">April</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">June</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">July</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">August</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">September</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">October</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">November</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>

              <NavLink to="/earnings-report">
                <div className="border border-[#8A8787] rounded-[10px] py-2 px-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[#000000] text-[20px]">December</h5>
                      <h5 className="text-[#000000] text-[13px]">
                        NGN 200,000
                      </h5>
                    </div>

                    <div className="rounded-full h-6 w-6 flex justify-center items-center bg-[#D9D9D9]">
                      <HiChevronRight />
                    </div>
                  </div>
                </div>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsReport;
