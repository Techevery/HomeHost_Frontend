import React from "react";
import Button from "../../UI/Button";
import { Link } from "react-router-dom";

const GetReceiptModal = (props: any) => {
  const { handleCancel, handleBookingRecepit } = props;

  return (
    <div>
      <div className="px-10 my-10">
        <div className="flex justify-between">
          <div className="cursor-pointer" onClick={handleBookingRecepit}>
            <img
              src="/images/Frame 67.svg"
              alt=""
              className="w-[35px] h-[35px] "
            />
          </div>
          <h3 className="text-[#000000] text-[20px] pb-2">Get Receipt</h3>
          <div></div>
        </div>

        <div className="flex flex-col mt-10 gap-4">
          <label className="cursor-pointer flex justify-between items-center border border-gray-300 rounded-[15px] p-4 peer-checked:border-primary">
            <input
              type="radio"
              name="options"
              value="option1"
              className="peer hidden"
            />
            <span className="mr-2">Download PDF</span>
            <div className="w-4 h-4 border border-gray-300 rounded-full peer-checked:bg-primary peer-checked:border-primary"></div>
          </label>

          <label className="cursor-pointer flex justify-between items-center border border-gray-300 rounded-[15px] p-4 peer-checked:border-primary">
            <input
              type="radio"
              name="options"
              value="option2"
              className="peer hidden"
            />
            <span className="mr-2">Send Email</span>
            <div className="w-4 h-4 border border-gray-300 rounded-full peer-checked:bg-primary peer-checked:border-primary"></div>
          </label>
        </div>

        <Link to="/download-receipt" className="flex mt-7 justify-center">
          <Button
            text={"Get Receipt"}
            // disabled={loading}
            //   action={handleGetReceiptModal}
            type="submit"
          />
        </Link>
      </div>
    </div>
  );
};

export default GetReceiptModal;
