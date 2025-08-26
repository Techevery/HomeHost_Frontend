import React from "react";

import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import MaterialTable, { MTableToolbar } from "material-table";
import { Link, useLocation } from "react-router-dom";

const AdminBooking = () => {
  const url = useLocation();
  const { pathname } = url;
  const pathnames = pathname.split("/").filter((x) => x);
  const data = [
    {
      customer: "Mary John",
      apartment_booked: "Spacious 2Bedroom Lekki, Lagos",
      date: "21 Sept, 2024, 10am",
      phone_number: "0966474654738",
      check_in: "23 Sept, 2024, 11am",
      check_out: "21 Sept, 2024, 12am",
      apartment_agent: "Akin Sunday ",
      status: "Successful",
    },
    {
      customer: "Janet Ade",
      apartment_booked: "Spacious 2Bedroom Lekki, Lagos",
      date: "21 Sept, 2024, 10am",
      phone_number: "0966474654738",
      check_in: "23 Sept, 2024, 11am",
      check_out: "21 Sept, 2024, 12am",
      apartment_agent: "Tolu ",
      status: "Successful",
    },
    {
      customer: "Tolu Peace",
      apartment_booked: "Spacious 2Bedroom Lekki, Lagos",
      date: "21 Sept, 2024, 10am",
      phone_number: "0966474654738",
      check_in: "23 Sept, 2024, 11am",
      check_out: "21 Sept, 2024, 12am",
      apartment_agent: "Blessing",
      status: "Successful",
    },
  ];

  const COLUMNS = [
    {
      title: "Customer",
      field: "customer",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        // <Link
        //   to={`/dashboard/payment-billing/sub/${rowData.id}`}
        //   state={rowData}
        // >
        //   {rowData.id}
        // </Link>
        <div className="flex justify-center">{rowData.customer}</div>
      ),
    },
    {
      title: "Apartment Booked",
      field: "apartment_booked",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        // <Link
        //   to={`/dashboard/payment-billing/sub/${rowData.id}`}
        //   state={rowData}
        // >
        //   {rowData.id}
        // </Link>
        <div className="flex justify-center">{rowData.apartment_booked}</div>
      ),
    },
    {
      title: "Booking Date",
      field: "date",
      cellStyle: {},
      render: (rowData: any) => <div>{rowData.date}</div>,
    },
    {
      title: "Phone Number",
      field: "phone_number",
      cellStyle: {},
      render: (rowData: any) => <div>{rowData.date}</div>,
    },
    {
      title: "Check in",
      field: "check_in",
      cellStyle: {},
      render: (rowData: any) => <div>{rowData.date}</div>,
    },
    {
      title: "Check out",
      field: "check_out",
      cellStyle: {},
      render: (rowData: any) => <div>{rowData.date}</div>,
    },
    {
      title: "Apartment Agent",
      field: "apartment_agent",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => <div>{rowData.apartment_agent}</div>,
    },
    {
      title: "Status",
      field: "status",
      cellStyle: {},
      render: (rowData: any) => (
        <div className="text-[#1ED75A]">
          {" "}
          {rowData.status === "Successful" ? (
            <div className="text-[#1ED75A]"> Successful</div>
          ) : (
            <div className="text-[#FF0909]">Rejected</div>
          )}{" "}
        </div>
      ),
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
  ];

  const defaultMaterialTheme = createTheme({
    palette: {
      // mode: "light",
    },
  });
  return (
    <div className="bg-[#E5E5E5] h-screen">
      <h4 className="text-[20px] font-bold">Booking Details</h4>
      <div className="bg-white mt-5 rounded-[20px] p-5">
        <div className="flex gap-12">
          <div className="bg-[#4EC368] rounded-[12px] text-white px-8 py-3">
            Successful
          </div>
          <div className="bg-[#D84A4A] rounded-[12px] text-white px-14 py-3">
            Failed
          </div>
        </div>
      </div>

      <div className="flex w-full items-center  pt-[40px] justify-center ">
         <div className='w-full'>
         {/* <div className="flex gap-4  pb-5 items-center">
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
      </div> */}
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
          title=""
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

{/* <div
        className={`${
          display && "w-full h-full bg-[#747380D1] opacity-[82%] z-[150]"
        } fixed top-0 left-0`}
        onClick={(e) => handleCancel(e)}
      ></div>

      {display && (
        <div className="w-full md:w-[500px] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] shadow-[0_4px_10px_rgba(0,0,0,0.1)] bg-white  z-[200] rounded-[10px] overflow-hidden h-fit ">
          {showDefaultConnectors()}
        </div>
      )} */}
      </div>
    </ThemeProvider>

    </div>
  </div>
    </div>
  );
};

export default AdminBooking;
