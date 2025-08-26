import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../../UI/Button";

const AddApartment = () => {

    const navigate = useNavigate();

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
  
    const onSubmit = () => {   
      navigate("/add-property");
    };

    const ImageUpload = ({ image, setImage }:any) => (
        <div className='  flex justify-center text-center'>
        <label className="flex w-[200px] bg-[#E5E5E5] flex-col border items-center justify-center rounded-[5px] cursor-pointer">
          <div className="flex flex-col items-center justify-center">
            {image ? (
              <img
                src={image}
                alt="Preview"
                style={{ minHeight: '200px', maxHeight: '200px' }}
              />
            ) : (
              <img
                src="/images/img1.png"
                alt="upload image"
                style={{ minHeight: '200px', maxHeight: '200px' }}
              />
            )}
          </div>
          <input
            id="dropzone-file"
            type="file"
            accept="image/x-png,image/gif,image/jpeg"
            className="hidden  mb-2 text-sm text-[#6C757D] font-medium"
    
            onChange={(e:any) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImage(reader.result);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
        </div>
      );
    
      const [image, setImage] = useState('');
    
  return (
    <div>
        <div className='bg-white overflow-y-scroll scrollbar-hide rounded-[15px] p-4'
        style={{ maxHeight: "450px" }} // Adjust maxHeight as needed
        >
        <Formik
              initialValues={initialData}
              validationSchema={validation}
              onSubmit={onSubmit}
            >
              {({ errors, values, setFieldValue }) => (
                <Form className="w-full   lg:mt-5 mb-6 flex flex-col justify-between">
                  <div className="mb-2">
                  <label htmlFor="name" className="text-[#3F3F3F] text-sm">
Name
             </label>
                    <div className="mt-1 relative">
                      <Field
                        className=" block bg-white w-full h-[40px]   pl-3 rounded-[9px] focus:outline-none border border-[#8A8787] "
                        name="name"
                        type="text"
                        id="name"
                        placeholder=""
                      />
                      <p className="text-red-700 text-xs mt-1 ">
                        <ErrorMessage name="email" />
                      </p>
                    </div>
                  </div>

                  <div className="mb-2">
                  <label htmlFor="address" className="text-[#3F3F3F] text-sm">
Address
             </label>
                    <div className="mt-1 relative">
                      <Field
                        className=" block bg-white w-full h-[40px]   pl-3 rounded-[9px] focus:outline-none border border-[#8A8787] "
                        name="address"
                        type="text"
                        id="address"
                        placeholder=""
                      />
                      <p className="text-red-700 text-xs mt-1 ">
                        <ErrorMessage name="email" />
                      </p>
                    </div>
                  </div>

                  <div className='grid mb-2 items-center grid-cols-2 gap-2 md:gap-4'>
                  <div className=" w-full">
                  <label htmlFor="type" className="text-[#3F3F3F] text-sm">
Type
             </label>
             <Field
                                                className=" block bg-white w-full h-[40px]   pl-3 rounded-[9px] focus:outline-none border border-[#8A8787] "

                                                name="type"
                            as="select"
                            // type="tel"
                            onChange={(event: any) => {
                              setFieldValue("type", event.target.value);
                            }}
                            placeholder=""
                          >
                            <option label="Select"></option>
                            <option value="duplex">Duplex</option>
                            <option value="bungalow">Bungalow</option>
                          
                          </Field>
                  </div>
                  <div className=" w-full">
                  <label htmlFor="bedroom" className="text-[#3F3F3F] text-sm">
Bedroom
             </label>
                    <div className="mt-1 relative">
                      <Field
                        className=" block bg-white w-full h-[40px]   pl-3 rounded-[9px] focus:outline-none border border-[#8A8787] "
                        name="bedroom"
                        type="text"
                        id="bedroom"
                        placeholder=""
                      />
                      <p className="text-red-700 text-xs mt-1 ">
                        <ErrorMessage name="bedroom" />
                      </p>
                    </div>
                  </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2 md:gap-4'>
                  <div className="mb-2 w-full">
                  <label htmlFor="servicing" className="text-[#3F3F3F] text-sm">
Servicing
             </label>
                    <div className="mt-1 relative">
                      <Field
                        className=" block bg-white w-full h-[40px]   pl-3 rounded-[9px] focus:outline-none border border-[#8A8787] "
                        name="servicing"
                        type="text"
                        id="servicing"
                        placeholder=""
                      />
                      <p className="text-red-700 text-xs mt-1 ">
                        <ErrorMessage name="servicing" />
                      </p>
                    </div>
                  </div>
                  <div className="mb-2 w-full">
                  <label htmlFor="price" className="text-[#3F3F3F] text-sm">
                  Price
             </label>
                    <div className="mt-1 relative">
                      <Field
                        className=" block bg-white w-full h-[40px]   pl-3 rounded-[9px] focus:outline-none border border-[#8A8787] "
                        name="price"
                        type="text"
                        id="price"
                        placeholder=""
                      />
                      <p className="text-red-700 text-xs mt-1 ">
                        <ErrorMessage name="price" />
                      </p>
                    </div>
                  </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2 md:gap-4'>
                  <div className="mb-2 w-full">
                  <label htmlFor="ref" className="text-[#3F3F3F] text-sm">
Propertr ref
             </label>
                    <div className="mt-1 relative">
                      <Field
                        className=" block bg-white w-full h-[40px]   pl-3 rounded-[9px] focus:outline-none border border-[#8A8787] "
                        name="ref"
                        type="text"
                        id="ref"
                        placeholder=""
                      />
                      <p className="text-red-700 text-xs mt-1 ">
                        <ErrorMessage name="ref" />
                      </p>
                    </div>
                  </div>
             
                  </div>

                  <div>

  <div className="mb-4">
  <ImageUpload image={image} setImage={setImage} />
</div>
                  </div>
                  <Button
                    text={"Done"}
                    // disabled={loading}
                      action={onSubmit}
                    type="submit"
                  />
                </Form>
              )}
            </Formik>
        </div>
    </div>
  )
}

export default AddApartment