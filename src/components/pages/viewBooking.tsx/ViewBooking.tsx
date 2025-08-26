import React, { useState } from 'react'

import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";
import { Link, useLocation } from 'react-router-dom';
import { MdArrowDropDown, MdOutlineArrowDropUp } from 'react-icons/md';
import BookingReceiptModal from './BookingReceiptModal';
import GetReceiptModal from './GetReceiptModal';


const ViewBooking = () => {


    const url = useLocation();
    const { pathname } = url;
    const pathnames = pathname.split("/").filter((x) => x);
    const [display, setDisplay] = useState(false);
  const [itemData, setItemData] = useState<any>([]);

  const [values, setValues] = useState({
    bookInfo: false,
    getReceipt: false,
  });

  const handleCancel = (e: any) => {
    e.preventDefault();
    setDisplay(false);
    setValues({
      bookInfo: false,
    getReceipt: false,

    });
  };

  const handleModal = (e: any) => {
    e.preventDefault();
    // setItemData(itemData);
    setDisplay(true);
    setValues({
      ...values,
      bookInfo: true,
    getReceipt: false,

    });
  };

  const handleGetReceiptModal = (e: any) => {
    e.preventDefault();
    // setItemData(itemData);
    setDisplay(true);
    setValues({
      ...values,
      bookInfo: false,
    getReceipt: true,

    });
  };

  const showDefaultConnectors = () => {
    return (
      <>
      {values.bookInfo && <BookingReceiptModal handleGetReceiptModal={handleGetReceiptModal} handleCancel={handleCancel} />}
      {values.getReceipt && <GetReceiptModal handleBookingRecepit={handleModal} handleCancel={handleCancel} />}
      </>
    );
  };

    const data = [
        {
          apartment_name: "Mperial 2 Bedroom Apartment  ",
          date: "21 August, 2024",
          receipt_id: "0966474654738",
          amount: "NGN5,000",
          status: "Successful",
          action: "Details",

        },
        {
            apartment_name: "Homely Host 2 Bedroom Apartment  ",
            date: "24 August, 2024",
            receipt_id: "0966474654738",
            amount: "NGN20,000",
            status: "Successful",
            action: "Details",
          },
          {
            apartment_name: "Mperial 2 Bedroom Apartment  ",
            date: "21 August, 2024",
            receipt_id: "0966474654738",
            amount: "NGN5,000",
            status: "Rejected",
            action: "Details",

          },
      
      ];

    const COLUMNS = [
        {
          title: "Apartment Name",
          field: "apartment_name",
          cellStyle: { paddingLeft: "2%" },
          render: (rowData: any) => 
            // <Link
            //   to={`/dashboard/payment-billing/sub/${rowData.id}`}
            //   state={rowData}
            // >
            //   {rowData.id}
            // </Link>
           <div className='flex justify-center'>{rowData.apartment_name}</div>,
          
        },
        {
            title: "Request Date/Time",
            field: "date",
            cellStyle: {},
            render: (rowData: any) => 
              <div>{rowData.date}</div>,
  
          },
        {
          title: "Receipt ID",
          field: "receipt_id",
          cellStyle: { paddingLeft: "2%" },
          render: (rowData: any) => 
            <div>{rowData.receipt_id}</div>,

          
        },
        {
          title: "Amount",
          field: "amount",
          cellStyle: {},
          render: (rowData: any) => 
            <div>{rowData.amount}</div>,

        },
        {
            title: "Status",
            field: "status",
            cellStyle: {},
            render: (rowData: any) => 
              <div className='text-[#1ED75A]'> {rowData.status === "Successful" ? <div className='text-[#1ED75A]'> Successful</div> : <div className='text-[#FF0909]'>Rejected</div>} </div>,
  
          },
        // {
        //   title: "Description",
        //   field: "description",
        //   cellStyle: { paddingLeft: "2%" },
        //   render: (rowData: any) => (
        //     <Link
        //       to={`/dashboard/payment-billing/sub/${rowData.ref_no}`}
        //       state={rowData}
        //     >
        //       {rowData.description}
        //     </Link>
        //   ),
        // },
    

        {
          title: "Action",
          field: "action",
          cellStyle: { borderBottom: "none" },
          disableClick: true,
          render: (rowData: any) => {
            return (
              <CustomAction
                rowData={rowData}
                // payment={payment}
                handleDetailModal={handleModal}
                handleCancel={handleCancel}
                handleGetReceiptModal={handleGetReceiptModal}
                // handleRejectModal={handleRejectModal}
                // handleActions={props.handleActions}
              />
            );
          },
        },
      ];
    
      const defaultMaterialTheme = createTheme({
        palette: {
          // mode: "light",
        },
      });
  return (
    <div className="flex w-full items-center px-[50px] pt-[40px] justify-center ">
         <div className='w-full'>
         <div className="flex gap-4  pb-5 items-center">
        <Link
          to="/manage-booking"
          // className="text-primary text-lg  font-bold  hover:underline"
        >
          <img
            src="/images/Frame 67.svg"
            alt=""
            className="w-[35px] h-[35px] "
          />
        </Link>

        <h4 className="text-[#002221] text-[20px]">View Booking</h4>
      </div>
    <ThemeProvider theme={defaultMaterialTheme}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />

      <div className="w-full overflow-scroll ">
        <MaterialTable
          components={{
            Container: (props) => <Paper {...props} elevation={0} />,
          }}
          columns={COLUMNS}
          data={data}
          // onRowClick={(e, rowData) => { navigate(`/dashboard/customers/${rowData?.id}`) }}
          title="View Booking"
          options={{
            paging: !["dashboard", "home"].every((ai) =>
              pathnames.includes(ai)
            )
              ? true
              : false,
            // pageSizeOptions: [10, 20, 30],
            search: true,
            rowStyle: {
              color: "#474E70",
              backgroundColor: "transparent",
              fontWeight: 400,
              fontSize: "16px",
              padding: "5px",
            },
            headerStyle: {
              color: "#000",
              fontWeight: 600,
              fontSize: "16px",
              backgroundColor: "transparent",
              // backgroundColor: theme === "dark" ? "#1E1E1E" : "white",
              border: 0,
              borderBottom: "1px solid #E8E9ED",
              paddingLeft: "2%",
            },
            searchFieldStyle: {
              border: "0px",
              borderRadius: "0px",
              borderBottom: "1px solid #E8E9ED",
              width: "192px",
              height: "36px",
              backgroundColor: "transparent",
            },
            searchFieldVariant: "standard",
            actionsColumnIndex: -1,
            actionsCellStyle: {
              border: "0",
              paddingLeft: "2%",
            },
            exportButton: true,
            // paging: false,
            minBodyHeight: "400px",
          }}
        />

<div
        className={`${
          display && "w-full h-full bg-[#747380D1] opacity-[82%] z-[150]"
        } fixed top-0 left-0`}
        onClick={(e) => handleCancel(e)}
      ></div>

      {display && (
        <div className="w-full md:w-[500px] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] shadow-[0_4px_10px_rgba(0,0,0,0.1)] bg-white  z-[200] rounded-[10px] overflow-hidden h-fit ">
          {showDefaultConnectors()}
        </div>
      )}
      </div>
    </ThemeProvider>

    </div>
  </div>
  )
}

export default ViewBooking

const CustomAction = (props: any) => {
    // const dispatch: AppDispatch = useDispatch();
  
    const {
      handleDetailModal,
      handleCancel,
      handleGetReceiptModal,
      handleApprovedModal,
      handleRejectModal,
      rowData,
      onRowClick,
      payment
    } = props;
    // console.log(payment);
    // const userPreference = useSelector(
    //     (state: { dashboard: DashboardSlice }) => state.dashboard.currentTheme
    // );
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button
          type="button"
          onClick={(e) => handleDetailModal(e)}
          className="flex items-center border p-2 rounded-md"
        >
         <h5 className=""> {rowData.action}</h5>
          {/* {!open ? (
            <MdArrowDropDown className="w-7 h-7" />
          ) : (
            <MdOutlineArrowDropUp className="w-7 h-7" />
          )} */}
          {/* <img src={userPreference === 'dark' ? actionsIconDark : actionsIcon} alt='actions icon' /> */}
        </button>
        <div
          className={`${
            open
              ? " max-h-fit py-2.5 px-2.5 top-[45px]"
              : " max-h-0 overflow-hidden top-0 "
          } transition-[top] duration-200 ease-in-out absolute  w-[136px] rounded-[10px] shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex flex-col gap-2.5 bg-white  z-10`}
        >
          <button
            type="button"
            className=" flex items-center gap-2 text-[#30385E]  leading-4 font-light pt-2.5 px-2.5 hover:bg-[#F9F9FA] rounded-[10px]"
            onClick={(e) => {
              const temp_data = {
                amount: rowData.amount,
                created_at: rowData.created_at,
                message: rowData.message,
                transaction_reference: rowData.transaction_reference,
                notification_id: rowData.notification_id,
                userID: rowData.userID,
                id: rowData.id,
                status: rowData.status,
                accountName: rowData.withdrawalAccount.accountName,
                accountNumber: rowData.withdrawalAccount.accountNumber,
                bankName: rowData.withdrawalAccount.bankName,
              };
            //   dispatch(setPayoutRequest(temp_data));
              handleDetailModal(e);
            }}
          >
            {/* <img src={userPreference === "dark" ? editIconDark : editIcon} /> */}
            <p className="text-left">Details</p>
          </button>
  
          {rowData?.status === "pending" ? (
            <button
              type="button"
              className=" flex items-center gap-2 text-[#30385E] leading-4 font-light py-2.5 px-2.5 hover:bg-[#F9F9FA] rounded-[10px]"
              onClick={(e) => {
                const temp_data = {
                  amount: rowData.amount,
                  created_at: rowData.created_at,
                  message: rowData.message,
                  transaction_reference: rowData.transaction_reference,
                  notification_id: rowData.notification_id,
                  userID: rowData.userID,
                  id: rowData.id,
                  status: rowData.status,
                  accountName: rowData.withdrawalAccount.accountName,
                  accountNumber: rowData.withdrawalAccount.accountNumber,
                  bankName: rowData.withdrawalAccount.bankName,
                };
                // dispatch(setEachPayout(temp_data));
                // dispatch(setSelectcashFlow(props.rowData))
                handleApprovedModal(e);
              }}
            >
              {/* <img src={userPreference === "dark" ? editIconDark : editIcon} /> */}
              <p className="text-left">Approved</p>
            </button>
          ) : (
            ""
          )}
          {rowData?.status === "pending" ? (
            <button
              type="button"
              className=" flex items-center gap-2 text-[#30385E] leading-4 font-light pb-2.5 px-2.5 hover:bg-[#F9F9FA] rounded-[10px]"
              onClick={(e) => {
                const temp_data = {
                  amount: rowData.amount,
                  created_at: rowData.created_at,
                  message: rowData.message,
                  transaction_reference: rowData.transaction_reference,
                  notification_id: rowData.notification_id,
                  userID: rowData.userID,
                  id: rowData.id,
                  status: rowData.status,
                  accountName: rowData.withdrawalAccount.accountName,
                  accountNumber: rowData.withdrawalAccount.accountNumber,
                  bankName: rowData.withdrawalAccount.bankName,
                };
                // dispatch(setEachPayout(temp_data));
                handleRejectModal(e);
              }}
            >
              {/* <img src={userPreference === "dark" ? editIconDark : editIcon} /> */}
              <p className="text-left">Reject</p>
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  };