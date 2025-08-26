import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import Button from "../../UI/Button";

const EditAddress = (props: any) => {
    const { handleCancel } = props;
    
  // Initial form data
  const initialData = {
    email:
      localStorage.getItem("remember") === "true"
        ? localStorage.getItem("username")
        : "",

    password: "",
    remember: localStorage.getItem("remember") === "true" ? true : false,
  };

  const validation = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .min(6, "Password must be minimum of 6 characters")
      .required("Required"),
  });

  const onSubmit = () => {};

  return (
    <div>
    <Formik
   initialValues={initialData}
   validationSchema={validation}
   onSubmit={onSubmit}
 >
   {({ errors, values, setFieldValue }) => (
     <Form className="w-full overflow-y-scroll max-h-[550px] px-10  mt-10 lg:mt-5 mb-6 flex flex-col justify-between">
       <h3 className="text-[#000000] font-[600] text-[20px] md:text-[26px] pb-2">
    Street Address
       </h3>
       <h3 className="text-[#000000] text-[14] pb-10 md:text-[18px] ">
    Input your name in the fill box
       </h3>
       <div className="mb-5">
      
         <div className="flex w-full gap-4 mb-3">
       
           <div className=" w-full relative">
             <Field
               className=" block w-full h-12 border  pl-3 rounded-[10px] focus:outline-none border-[#8A8787] "
               name="address"
               type="text"
               id="address"
               placeholder=""
             />

             <label htmlFor="address" className="text-[#3F3F3F] pt-2 text-sm">
Street Address
             </label>
             <p className="text-red-700 text-xs mt-1 ">
               <ErrorMessage name="address" />
             </p>
           </div>
         </div>

     

         <div className=" mb-3">
          
      
           {/* <div className=" relative">
          
               <Field
                 className=" block w-full h-10 border  pl-3 rounded-[15px] focus:outline-none border-[#8A8787] "
                 name="check_out_date"
                 type="date"
                 id="check_out_date"
                 placeholder="Check out Date"
               />
               <p className="text-red-700 text-xs mt-1 ">
                 <ErrorMessage name="check_out_date" />
               </p>
             </div> */}
         </div>
       </div>
       <Button
         text={"Save"}
         // disabled={loading}
         //   action={onSubmit}
         type="submit"
       />
       {/* <p onClick={onSubmit} className="flex items-center justify-center gap-x-1 text-sm">
             Don't have an account yet?{"  "}
            
           </p> */}
       {/* <p className="flex items-center justify-center gap-x-1 text-sm">
             Don't have an account yet?{"  "}
             <Link
               to="/signup"
               className="text-primary text-lg  font-bold  hover:underline"
             >
               Sign up
             </Link>
           </p> */}
     </Form>
   )}
 </Formik>
</div>
  )
}

export default EditAddress