import MaterialTable from "material-table";
import React, { useEffect, useRef, useState } from "react";
import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";

const BanAgentTable = () => {
    const data = [
        {
            personal_url: "http.//.homey host.ng/Janet.com",
            account: "John Doe",
          email: "johndoe@example.com",
          strikes: "2",
        },
        {
            personal_url: "http.//.homey host.ng/Janet.com",
            account: "Jack Rose",
          email: "Joserose123@gamil.com",
          profit: "Profit",
          strikes: "2",
        },
        {
            personal_url: "http.//.homey host.ng/Janet.com",
            account: "Evelyn Melody",
          email: "Evelynmelody@gmail.com",
          profit: "Profit",
          strikes: "2",
          id_card: "See Upload",
          passport: "See Upload",
          address: "See Upload",
        },
        {
            personal_url: "http.//.homey host.ng/Janet.com",
            account: "Ifeoma Nnadi",
          email: "ifynnadi@gmail.com",
          profit: "Profit",
          id_card: "See Upload",
          strikes: "2",
          account_type: "See Upload",
          passport: "See Upload",
          address: "See Upload",
        },
      ];

    const COLUMNS = [
        {
            title: "Personal URL",
            field: "personal_url",
            cellStyle: { paddingLeft: "2%" },
            render: (rowData: any) => 
              // <Link
              //   to={`/dashboard/payment-billing/sub/${rowData.id}`}
              //   state={rowData}
              // >
              //   {rowData.id}
              // </Link>
             <div className='w-full whitespace-nowrap'>{rowData.personal_url}</div>,
            
          },
        {
          title: "Customer Complains",
          field: "account",
          cellStyle: { paddingLeft: "2%" },
          render: (rowData: any) => (
            <div className="flex justify-center"
            >
                 <input
                    //   checked={true}
                      type="checkbox"
                    //   onChange={() =>
                    //     handleApproveChange(
                    //       rowData.id,
                    //       rowData.notificationID,
                    //       "front_id_status",
                    //       "front_id",
                    //       false
                    //     )
                    //   }
                      value=""
                      className="w-4 h-4 text-white checked:bg-primary bg-gray-100 border-gray-300 rounded focus:ring-primary  "
                    />
            </div>
          ),
        },
        {
          title: "Not Always Available",
          field: "email",
          cellStyle: { minWidth: "260px" },
          // cellStyle: { paddingLeft: "2%" },
          render: (rowData: any) => (
            <div className="flex whitespace-nowrap justify-center">
              <div
              >
                <input
                    //   checked={true}
                      type="checkbox"
                    //   onChange={() =>
                    //     handleApproveChange(
                    //       rowData.id,
                    //       rowData.notificationID,
                    //       "front_id_status",
                    //       "front_id",
                    //       false
                    //     )
                    //   }
                      value=""
                      className="w-4 h-4 text-white checked:bg-primary bg-gray-100 border-gray-300 rounded focus:ring-primary  "
                    />
              </div>
              {/* {rowData.shopperData !== null ? (
                <input
                  type="checkbox"
                  checked={true} // You can use a dynamic variable or state here if needed
                  className={`focus:outline-none mr-2 ${
                    true ? "bg-primary text-white" : ""
                  }`}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={false} // You can use a dynamic variable or state here if needed
                  className={`focus:outline-none mr-2 ${
                    true ? "bg-primary text-white" : ""
                  }`}
                />
              )} */}
            </div>
          ),
        },
        {
          title: "Strikes",
          field: "strike",
          // cellStyle: { minWidth: "140px" },
          render: (rowData: any) => (
            <div className="flex justify-center">
          
          <input
                    //   checked={true}
                      type="checkbox"
                    //   onChange={() =>
                    //     handleApproveChange(
                    //       rowData.id,
                    //       rowData.notificationID,
                    //       "front_id_status",
                    //       "front_id",
                    //       false
                    //     )
                    //   }
                      value=""
                      className="w-4 h-4 text-white checked:bg-primary bg-gray-100 border-gray-300 rounded focus:ring-primary  "
                    />
            </div>
          ),
        },
     
    
        {
          title: "Ban Agent",
          field: "ban_agent",
          cellStyle: { borderBottom: 0, paddingLeft: "2%" },
          render: (rowData: any) => (
            <div>
              {/* {rowData?.approved ? ( */}
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                    //   checked={true}
                    //   onChange={() =>
                    //     handleSwitchChange(
                    //       rowData.id,
                    //       rowData.userData?.notificationID,
                    //       false
                    //     )
                    //   }
                      className="hidden"
                    />
                    <div className="toggle__line w-12 h-6 bg-[#02B718] rounded-full shadow-inner"></div>
                    <div className="toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-6"></div>
                  </div>
                </label>
              {/* ) : (
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() =>
                        handleSwitchChange(rowData.id, rowData.userData?.notificationID, true)
                      }
                      className="hidden"
                    />
                    <div className="toggle__line w-12 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                    <div className="toggle__dot absolute w-6 h-6 bg-gray-100 rounded-full shadow inset-y-0 left-0"></div>
                  </div>
                </label>
              )} */}
            </div>
          ),
        },
      ];

      const defaultMaterialTheme = createTheme({
        palette: {
          mode: "light",
        },
      });
  return (
    <div className="overflow-hidden    ">
            <div className=" py-[10px]">
        <h4 className="text-[20px] text-[#958F8F] ">Agent Request</h4>
      </div>
    <ThemeProvider theme={defaultMaterialTheme}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />

      <div className="w-full border rounded-bl-none p-3 rounded-[15px]">
        <MaterialTable
          components={{
            Container: (props) => <Paper {...props} elevation={0} />,
          }}
          columns={COLUMNS}
          data={data}
          // onRowClick={(e, rowData) => { navigate(`/dashboard/customers/${rowData?.id}`) }}
          title="h"
          options={{
            // paging: !['dashboard', 'home'].every(ai => pathnames.includes(ai)) ? true : false,
            // pageSizeOptions: [10, 20, 30],
            search: false,
            showTitle: false,
            toolbar: false,
            //   paging:false,

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
              backgroundColor: "#F7F7F7",
              // backgroundColor: theme === "dark" ? "#1E1E1E" : "white",
              border: 0,

              // borderBottom: "1px solid #E8E9ED",
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
            // exportButton: true,
            paging: false,
            minBodyHeight: "400px",
          }}
        />
      </div>
    </ThemeProvider>


  </div>
  )
}

export default BanAgentTable